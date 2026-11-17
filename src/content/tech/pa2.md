---
title: "PA2：指令与运行时环境"
description: "实现更多指令、字符串处理、sprintf、iringbuf 与 mtrace 等运行时基础设施。"
date: 2026-01-26
tags: [PA, NEMU, 运行时]
---
## 实验进度

- 完成了所有内容，包括声卡，和大部分选做编程题

## 必答题

### 程序是个状态机

[Ctrl+左键跳转到PA2.1 Q1](#section1)

### RTFSC

[Ctrl+左键跳转到PA2.1 Q2](#section2)

### 程序如何运行

[Ctrl+左键跳转到PA2.3 Q12](#section3)

### 编译与链接

<h3>有关static inline</h3>

<h4> 1. 实验现象深度解析</h4>

<h5> A. 只去掉 <code>inline</code>（保留 <code>static</code>）</h5>

- **结果：** 编译通过。
- **原理：** 此时它变成了普通的静态函数。每个 `.c` 文件依然拥有自己私有的、完整的 `inst_fetch` 二进制代码。虽然不再建议编译器内联，但这仅仅是多了几次函数压栈跳转的开销，语法和链接上完全合法。

<h5> B. 只去掉 <code>static</code>（保留 <code>inline</code>）</h5>

- **结果：** 你的实验是“通过”，但在复杂的编译优化选项下可能报错。
- **原理：** * 现代 C 语言（C99 及以后）对 `inline` 的处理比较特殊。如果只有 `inline` 而没有 `static`，编译器会认为这可能是一个**外部内联定义**。
  - 如果编译器决定在所有地方都内联，那么 `.o` 文件中可能根本不产生 `inst_fetch` 的符号，链接器也就看不到冲突。
  - **不足：** 这种情况虽然可能通过编译，但如果某个地方无法内联（比如你取了函数指针），链接器就会报错说找不到该函数，或者报重定义。

<h5> C. 两者都去掉（既无 <code>static</code> 也无 <code>inline</code>）</h5>

- **结果：** 报错 `multiple definition of 'inst_fetch'`。
- **原理：** 当你去掉所有修饰符，它变成了一个普通的 **全局函数（External Linkage）**。
  - `inst.o` 里声明：“我这儿有一个全局函数叫 `inst_fetch`。
  - `hostcall.o` 里也声明：“我这儿也有一个全局函数叫 `inst_fetch`。
  - **链接阶段（LD）：** 链接器尝试把这两个 `.o` 拼成一个可执行文件时，发现有两个同名全局函数

------

<h4> 2. 如何证明想法？</h4>

可以通过 `nm` 命令来观察二进制目标文件中的 **符号表（Symbol Table）**，这是最硬核的证明方式。

<h5> 实验证明步骤：</h5>

1. **准备环境：** 保持“两者都去掉”的状态，直到编译报错。

2. **查看符号：** 运行以下命令查看生成的 `.o` 文件：

   ```bash
   # 查看 inst.o 中的 inst_fetch 符号
   nm build/obj-riscv32-nemu-interpreter/src/isa/riscv32/inst.o | grep inst_fetch
   
   # 查看 hostcall.o 中的 inst_fetch 符号
   nm build/obj-riscv32-nemu-interpreter/src/engine/interpreter/hostcall.o | grep inst_fetch
   ```

<h5> 会看到的证据：</h5>

- **情况 C（都去掉）：** 你会看到符号类型是 **`T`**（Global Text section），这意味着它是全局可见的，导致了冲突。 `00001400 T inst_fetch`
- **情况 A（保留 `static`）：** 你会看到符号类型是 **`t`**（Local Text section，小写表示局部）。 `00000a00 t inst_fetch` 这证明了两个 `.o` 里各自存了一份局部函数，所以链接器不报错。
- **情况 B（只有 `inline`）：** 你可能会发现根本找不到 `inst_fetch` 符号，因为编译器直接把代码“打碎”嵌入到调用处了，没留下独立的函数躯壳。

<h3>dummy数量</h3>

<h4>在<code>common.h</code>中定义<code>volatile static int dummy;</code></h4>

共33个，使用命令查看最终文件的符号表。

```shell
nm build/riscv32-nemu-interpreter | grep -w "dummy" | wc -l
```

<h4>然后在<code>debug.h</code>中定义<code>volatile static int dummy;</code></h4>

仍然是共33个

- `common.h`和`debug.h`互相包含，但是利用头文件保护符`#ifndef __COMMON_H__ #define __COMMON_H__ ... #endif`可以防止重复定义
- 他们都是未同名初始化的局部静态变量，被视为对同一个变量的多次引用，因此会被合并。

<h4>将<code>dummy;</code>初始化为 0 </h4>

编译报错。

**知识点：强符号 vs 弱符号（Tentative Definition）**

在 C 语言中，不初始化的全局/静态变量表现为 **“临时定义”（Tentative Definition）**。

- **未初始化：** `static int dummy;` 编译器看到它时会想：“哦，这可能是一个定义，也可能只是一个占位符。” 如果在同一个编译单元里后面又出现了一个同样的 `static int dummy;`，编译器会自动把它们**合并**成同一个实体。
- **已初始化：** `static int dummy = 0;` 一旦给了初始值，它就变成了 **“强符号”（Strong Symbol）**。编译器认为这是一个明确的、不可更改的定义指令。

因次这两个强符号会导致重定义，导致编译报错



### 了解Makefile

<h3> 一、 Makefile 的组织与递归工作方式</h3>

NEMU 实验采用了一种典型的“框架与应用分离”的 Makefile 结构。

<h4> 1. 第一级：应用层（hello 目录）</h4>

当你执行 `make` 时，它首先读取 `hello/Makefile`。

- 这个文件非常精简，它定义了应用名称 `NAME = hello` 和源代码路径。
- **关键动作：** 它通过 `include $(AM_HOME)/Makefile` 将控制权移交给 Abstract Machine 的通用构建框架。

<h4> 2. 第二级：架构抽象层（$(AM_HOME)/Makefile）</h4>

这是构建系统的“大脑”。它负责根据你传入的 `ARCH` 参数（如 `riscv32-nemu`）执行以下逻辑：

- **确定编译器：** 根据 `ARCH` 确定交叉编译器（如 `riscv64-linux-gnu-gcc`）。
- **收集依赖：**
  - **AM 库：** 包含 `am/src/$ISA/nemu` 下的底层硬件抽象代码。
  - **klib 库：** 包含 `printf`, `memcpy` 等标准库函数的精简实现。
- **编译规则：** 定义了如何将 `.c` 生成 `.o`，以及最后的链接参数。

<h4> 3. 第三级：具体架构层（$(AM_HOME)/am/Makefile）</h4>

它会根据 `ARCH` 包含特定架构的 Makefile 片段（如 `riscv32-nemu.mk`）。

- 这里定义了 **LDFLAGS**（链接标志）和特定的 **Linker Script**（链接脚本，通常是 `linker.ld`），确保程序能被放置在正确的内存地址（如 `0x80000000`）。

------

<h3> 二、 编译与链接的物理过程</h3>

当 Makefile 组织好变量后，会调用编译器套件（GCC）进行如下转换：

<h4> 1. 编译阶段（Compilation）</h4>

编译器对每个 `.c` 文件进行处理：

- **头文件包含：** 通过 `-I` 参数指定搜索路径（如 `am/include`），将 `am.h` 和 `klib.h` 引入。
- **生成目标文件：** 将 `hello.c`、`am` 库代码、`klib` 库代码分别编译为独立的二进制目标文件 `.o`。
  - 例如：`hello.o`, `trm.o`, `ioe.o`, `printf.o` 等。

<h4> 2. 归档阶段（Archiving）</h4>

为了方便管理，Makefile 通常会将 `am` 和 `klib` 的所有 `.o` 文件打包成静态库文件（`.a`），例如 `am-riscv32-nemu.a`。

<h4> 3. 链接阶段（Linking）—— 最关键的一步</h4>

这是生成 `.elf` 的最后冲刺。链接器（ld）将以下内容合体：

1. **程序的入口：** 架构相关的启动汇编代码（通常是 `start.S`），它负责初始化栈指针并调用 `_trm_init`。
2. **用户的应用程序：** `hello.o`。
3. **库文件：** `am.a` 和 `klib.a`。

**链接脚本（Linker Script）的作用：** 链接器读取 `linker.ld`，它像一张“地图”，指示链接器：

- 将代码段（`.text`）放在内存的哪个位置。
- 将只读数据（`.rodata`）和全局变量（`.data`, `.bss`）依次排列。
- 定义程序的 **Entry Point**（入口点）。

------

<h3> 三、总结：文件演变路径</h3>


1. **源代码：** `hello.c` + `am.h` + `klib.h`
2. **中间产物：** `hello.o` + `am.a` + `klib.a`
3. **最终产物：** `hello-$ISA-nemu.elf`

最后，构建系统还会调用 `objcopy` 将 `.elf` 转换为纯二进制的 `.bin` 文件，因为 NEMU 的镜像加载器通常直接将二进制数据搬运到模拟内存中。



## PA2.1

### Q1: 理解YEMU如何执行程序<a id="section1"></a>

**状态机**

由于只有`(R[0], R[1], M[7])`有变化，因此这里画出有关他们的状态机。

`(0, 0, 0) -> (33, 0, 0) -> (33, 33, 0) -> (16, 33, 0) -> (49, 33, 0) -> (49, 33, 49) -> (98, 33, 49)`

**YEMU如何执行一条指令**

先从pc种取出一条指令，然后通过操作码译码分开指令的类型，然后进行操作数译码，最后完成指令执行。

### Q2: RTFSC理解指令执行的过程<a id="section2"></a>

- 调用`exec_once(&s, cpu.pc)`会执行一条指令，它会先暂存`cpu.pc`至`s->pc s->snpc`，然后执行`isa_exec_once(s)`后更新`cpu.pc = s->dnpc`
- `isa_exce_once`会先调用`inst_fetch = inst_fetch(&s->snpc, 4)`从内存中取出一条指令，并把`s->snpc += 4`，然后执行`decode_exec(s)`译码并执行
- `decode_exec(s)`会先更新`s->dnpc=s->snpc`，然后调用`INSTPAT(pattern, name, type, execute body);`来匹配`(s)->isa.inst`，若匹配成功则调用`decode_operand(s, &rd, &src1, &src2, &imm, concat(TYPE_, type));`译码得到`rd src1 src2 imm`，最后执行`excute body`来执行指令并把寄存器0归零。

### Q3: 准备交叉编译环境

``sudo apt-get install g++-riscv64-linux-gnu binutils-riscv64-linux-gnu``

### Q4: 运行第一个客户程序

注意伪代码转换，然后只需要实现`dummy.txt`出现的指令

```diff
--- a/nemu/src/isa/riscv32/inst.c
+++ b/nemu/src/isa/riscv32/inst.c
@@ -23,7 +23,7 @@
 #define Mw vaddr_write
 
 enum {
-  TYPE_I, TYPE_U, TYPE_S,
+  TYPE_I, TYPE_U, TYPE_S, TYPE_J, TYPE_B,
   TYPE_N, // none
 };
 
@@ -32,6 +32,8 @@ enum {
 #define immI() do { *imm = SEXT(BITS(i, 31, 20), 12); } while(0)
 #define immU() do { *imm = SEXT(BITS(i, 31, 12), 20) << 12; } while(0)
 #define immS() do { *imm = (SEXT(BITS(i, 31, 25), 7) << 5) | BITS(i, 11, 7); } while(0)
+#define immJ() do { *imm = (SEXT(BITS(i, 31, 31), 1) << 20) | (BITS(i, 19, 12) << 12) | (BITS(i, 20, 20) << 11) | (BITS(i, 30, 21) << 1); } while(0)
+#define immB() do { *imm = (SEXT(BITS(i, 31, 31), 1) << 12) | (BITS(i, 7, 7) << 11) | (BITS(i, 30, 25) << 5) | (BITS(i, 11, 8) << 1); } while(0)
 
 static void decode_operand(Decode *s, int *rd, word_t *src1, word_t *src2, word_t *imm, int type) {
   uint32_t i = s->isa.inst;
@@ -42,6 +44,8 @@ static void decode_operand(Decode *s, int *rd, word_t *src1, word_t *src2, word_
     case TYPE_I: src1R();          immI(); break;
     case TYPE_U:                   immU(); break;
     case TYPE_S: src1R(); src2R(); immS(); break;
+    case TYPE_J:                   immJ(); break;
+    case TYPE_B: src1R(); src2R(); immB(); break;
     case TYPE_N: break;
     default: panic("unsupported type = %d", type);
   }
@@ -59,12 +63,42 @@ static int decode_exec(Decode *s) {
 }
 
   INSTPAT_START();
-  INSTPAT("??????? ????? ????? ??? ????? 00101 11", auipc  , U, R(rd) = s->pc + imm);
-  INSTPAT("??????? ????? ????? 100 ????? 00000 11", lbu    , I, R(rd) = Mr(src1 + imm, 1));
-  INSTPAT("??????? ????? ????? 000 ????? 01000 11", sb     , S, Mw(src1 + imm, 1, src2));
+  // TYPE_U
+  INSTPAT("???????????????????? ????? 0110111", lui    , U, R(rd) = imm);
+  INSTPAT("???????????????????? ????? 0010111", auipc  , U, R(rd) = s->pc + imm);
+  // TYPE_I
 
-  INSTPAT("0000000 00001 00000 000 00000 11100 11", ebreak , N, NEMUTRAP(s->pc, R(10))); // R(10) is $a0
-  INSTPAT("??????? ????? ????? ??? ????? ????? ??", inv    , N, INV(s->pc));
+  // 1.Load 
+  INSTPAT("???????????? ????? 000 ????? 0000011", lb     , I, R(rd) = SEXT(Mr(imm + src1, 1),  8));
+  INSTPAT("???????????? ????? 001 ????? 0000011", lh     , I, R(rd) = SEXT(Mr(imm + src1, 2), 16));
+  INSTPAT("???????????? ????? 010 ????? 0000011", lw     , I, R(rd) = SEXT(Mr(imm + src1, 4), 32));
+  
+  INSTPAT("???????????? ????? 100 ????? 0000011", lbu    , I, R(rd) = Mr(imm + src1, 1));
+  INSTPAT("???????????? ????? 101 ????? 0000011", lhu    , I, R(rd) = Mr(imm + src1, 2));
+  // 2.Integer Computation
+  INSTPAT("???????????? ????? 000 ????? 0010011", addi   , I, R(rd) = src1 + imm);
+  INSTPAT("???????????? ????? 010 ????? 0010011", slti   , I, R(rd) = (int)src1 < (int)imm ? 1 : 0);
+  INSTPAT("???????????? ????? 011 ????? 0010011", sltiu  , I, R(rd) = src1 < imm ? 1 : 0);
+  INSTPAT("???????????? ????? 100 ????? 0010011", xori   , I, R(rd) = src1 ^ imm);
+  INSTPAT("???????????? ????? 110 ????? 0010011", ori    , I, R(rd) = src1 | imm);
+  INSTPAT("???????????? ????? 111 ????? 0010011", andi   , I, R(rd) = src1 & imm);
+
+
+  // 3. Jump
+  INSTPAT("???????????? ????? 000 ????? 1100111", jalr   , I, R(rd) = s -> dnpc, s -> dnpc = (src1 + imm) & ~1);
+  
+  // TYPE_S
+  // 1.Store
+  INSTPAT("??????? ????? ????? 000 ????? 0100011", sb     , S, Mw(src1 + imm, 1, src2));
+  INSTPAT("??????? ????? ????? 001 ????? 0100011", sh     , S, Mw(src1 + imm, 2, src2));
+  INSTPAT("??????? ????? ????? 010 ????? 0100011", sw     , S, Mw(src1 + imm, 4, src2));
+  
+  // TYPE_J
+  INSTPAT("? ?????????? ? ???????? ????? 1101111", jal    , J, R(rd) = s -> dnpc, s -> dnpc = (imm + s -> pc));
+  // TYPE_N
+  INSTPAT("0000000 00001 00000 000 00000 1110011", ebreak , N, NEMUTRAP(s -> pc, R(10))); // R(10) is $a0
+  INSTPAT("??????? ????? ????? ??? ????? ???????", inv    , N, INV(s -> pc));
+  
   INSTPAT_END();
 
   R(0) = 0; // reset $zero to 0
```

### Q5: 实现更多的指令

```c
static int decode_exec(Decode *s) {
  s->dnpc = s->snpc;

#define INSTPAT_INST(s) ((s)->isa.inst)
#define INSTPAT_MATCH(s, name, type, ... /* execute body */ ) { \
  int rd = 0; \
  word_t src1 = 0, src2 = 0, imm = 0; \
  decode_operand(s, &rd, &src1, &src2, &imm, concat(TYPE_, type)); \
  __VA_ARGS__ ; \
}

  INSTPAT_START();
  // TYPE_U
  INSTPAT("???????????????????? ????? 0110111", lui    , U, R(rd) = imm);
  INSTPAT("???????????????????? ????? 0010111", auipc  , U, R(rd) = s->pc + imm);
  // TYPE_I

  // 1.Load 
  INSTPAT("???????????? ????? 000 ????? 0000011", lb     , I, R(rd) = SEXT(Mr(imm + src1, 1),  8));
  INSTPAT("???????????? ????? 001 ????? 0000011", lh     , I, R(rd) = SEXT(Mr(imm + src1, 2), 16));
  INSTPAT("???????????? ????? 010 ????? 0000011", lw     , I, R(rd) = SEXT(Mr(imm + src1, 4), 32));
  
  INSTPAT("???????????? ????? 100 ????? 0000011", lbu    , I, R(rd) = Mr(imm + src1, 1));
  INSTPAT("???????????? ????? 101 ????? 0000011", lhu    , I, R(rd) = Mr(imm + src1, 2));
  // 2.Integer Computation
  INSTPAT("???????????? ????? 000 ????? 0010011", addi   , I, R(rd) = src1 + imm);
  INSTPAT("???????????? ????? 010 ????? 0010011", slti   , I, R(rd) = (int)src1 < (int)imm ? 1 : 0);
  INSTPAT("???????????? ????? 011 ????? 0010011", sltiu  , I, R(rd) = src1 < imm ? 1 : 0);
  INSTPAT("???????????? ????? 100 ????? 0010011", xori   , I, R(rd) = src1 ^ imm);
  INSTPAT("???????????? ????? 110 ????? 0010011", ori    , I, R(rd) = src1 | imm);
  INSTPAT("???????????? ????? 111 ????? 0010011", andi   , I, R(rd) = src1 & imm);

  INSTPAT("0000000 ????? ????? 001 ????? 0010011", slli  , I, R(rd) = src1 << BITS(imm, 4, 0));
  INSTPAT("0000000 ????? ????? 101 ????? 0010011", srli  , I, R(rd) = src1 >> BITS(imm, 4, 0));
  INSTPAT("0100000 ????? ????? 101 ????? 0010011", srai  , I, R(rd) = (int)src1 >> (int)BITS(imm, 4, 0));

  // 3. Jump
  // ? instruction-address-misaligned exception 
  INSTPAT("???????????? ????? 000 ????? 1100111", jalr   , I, R(rd) = s -> dnpc, s -> dnpc = (src1 + imm) & ~1);
  
  // TYPE_S
  // 1.Store
  INSTPAT("??????? ????? ????? 000 ????? 0100011", sb     , S, Mw(src1 + imm, 1, src2));
  INSTPAT("??????? ????? ????? 001 ????? 0100011", sh     , S, Mw(src1 + imm, 2, src2));
  INSTPAT("??????? ????? ????? 010 ????? 0100011", sw     , S, Mw(src1 + imm, 4, src2));
  
  // TYPE_J
  // ? instruction-address-misaligned exception 
  INSTPAT("? ?????????? ? ???????? ????? 1101111", jal    , J, R(rd) = s -> dnpc, s -> dnpc = (imm + s -> pc));
  
  // TYPE_R

  INSTPAT("0000000 ????? ????? 000 ????? 0110011", add    , R, R(rd) = src1 + src2);
  INSTPAT("0100000 ????? ????? 000 ????? 0110011", sub    , R, R(rd) = src1 - src2);
  INSTPAT("0000000 ????? ????? 001 ????? 0110011", sll    , R, R(rd) = src1 << BITS(src2, 4, 0));
  INSTPAT("0000000 ????? ????? 010 ????? 0110011", slt    , R, R(rd) = (int)src1 < (int)src2 ? 1 : 0);
  INSTPAT("0000000 ????? ????? 011 ????? 0110011", sltu   , R, R(rd) = src1 < src2 ? 1 : 0);
  INSTPAT("0000000 ????? ????? 100 ????? 0110011", xor    , R, R(rd) = src1 ^ src2);
  INSTPAT("0000000 ????? ????? 101 ????? 0110011", srl    , R, R(rd) = src1 >> BITS(src2, 4, 0));
  INSTPAT("0100000 ????? ????? 101 ????? 0110011", sra    , R, R(rd) = (int)src1 >> (int)BITS(src2, 4, 0));
  INSTPAT("0000000 ????? ????? 110 ????? 0110011", or     , R, R(rd) = src1 | src2);
  INSTPAT("0000000 ????? ????? 111 ????? 0110011", and    , R, R(rd) = src1 & src2);

  INSTPAT("0000001 ????? ????? 000 ????? 0110011", mul    , R, R(rd) = (int) src1 * (int) src2);
  INSTPAT("0000001 ????? ????? 001 ????? 0110011", mulh   , R, R(rd) = BITS((long long)(int) src1 * (long long)(int) src2, 63, 32));
  INSTPAT("0000001 ????? ????? 010 ????? 0110011", mulhsu , R, R(rd) = BITS((long long)(int) src1 * (long long) src2, 63, 32)); // ?
  INSTPAT("0000001 ????? ????? 011 ????? 0110011", mulhu  , R, R(rd) = BITS((unsigned long long) src1 * src2, 63, 32));
  INSTPAT("0000001 ????? ????? 100 ????? 0110011", div    , R, if (src2 == 0) {R(rd) = -1;} else if (src1 == 0x80000000 && src2 == -1) {R(rd) = src1;} else R(rd) = (int)src1 / (int)src2);
  INSTPAT("0000001 ????? ????? 101 ????? 0110011", divu   , R, if (src2 == 0) {R(rd) = -1;} else R(rd) = src1 / src2);
  INSTPAT("0000001 ????? ????? 110 ????? 0110011", rem    , R, if (src2 == 0) {R(rd) = src1;} else if (src1 == 0x80000000 && src2 == -1) {R(rd) = 0;} else R(rd) = (int)src1 % (int)src2);
  INSTPAT("0000001 ????? ????? 111 ????? 0110011", remu   , R, if (src2 == 0) {R(rd) = src1;} else R(rd) = src1 % src2);

  // TYPE_B 
  INSTPAT("??????? ????? ????? 000 ????? 1100011", beq    , B, s -> dnpc = src1 == src2 ? s -> pc + imm : s -> dnpc);  // ? instruction-address-misaligned exception 
  INSTPAT("??????? ????? ????? 001 ????? 1100011", bne    , B, s -> dnpc = src1 != src2 ? s -> pc + imm : s -> dnpc);
  INSTPAT("??????? ????? ????? 100 ????? 1100011", blt    , B, s -> dnpc = (int)src1 < (int)src2 ? s -> pc + imm : s -> dnpc);
  INSTPAT("??????? ????? ????? 101 ????? 1100011", bge    , B, s -> dnpc = (int)src1 >= (int)src2 ? s -> pc + imm : s -> dnpc);
  INSTPAT("??????? ????? ????? 110 ????? 1100011", bltu   , B, s -> dnpc = src1 < src2 ? s -> pc + imm : s -> dnpc);
  INSTPAT("??????? ????? ????? 111 ????? 1100011", bgeu   , B, s -> dnpc = src1 >= src2 ? s -> pc + imm : s -> dnpc);

  // TYPE_N
  INSTPAT("0000000 00001 00000 000 00000 1110011", ebreak , N, NEMUTRAP(s -> pc, R(10))); // R(10) is $a0
  INSTPAT("??????? ????? ????? ??? ????? ???????", inv    , N, INV(s -> pc));
  
  INSTPAT_END();

  R(0) = 0; // reset $zero to 0
  Assert(s -> dnpc % 4 == 0, "instruction-address-misaligned exception");
  return 0;
}
```



## PA2.2

### Q1: 阅读Makefile

- 代码首先会检查是否包含某些文件和变量，以及是否正确输入ARCH变量值，它要求通过另一个makefile来使用
- 然后定义一些编译目标和编译选项
- 随后引入具体具体的`ARCH.mk`，这是模块化的一部分
- 随后定义编译规则
- 最后是一些杂项

```makefile
NAME = 
SRCS = 
include $(AM_HOME)/Makefile
```

### Q2: 通过批处理模式运行NEMU

- 发现启用批处理模式，需要带上参数`-b`
- 查看makefile的执行顺序为`AM-KERNELS/tests/cpu-tests/Makefile -> AM-KERNELS/tests/cpu-tests/Makefile.xxx -> ABSTRACT-MACHINE/Makefile -> $(AM_HOME)/scripts/$(ARCH).mk -> $(AM_HOME)/scripts/isa/$ISA.mk -> $(AM_HOME)/scripts/isa/$PLATFORM.mk -> $(NEMU_HOME)/Makefile`
- 在`$(AM_HOME)/scripts/isa/$PLATFORM.mk`发现了参数`NEMUFLAGS`用于控制输入参数
- 因此在`$(AM_HOME)/tests/cpu-tests/Makefile`加入`MAKECMDGOALS += "NEMUFLAGS += -b"`或者运行时加入"NEMUFLAGS += -b"

### Q3: 实现字符串处理函数

阅读手册完成

```c
size_t strlen(const char *s) {
  int i = 0;
  while (s[i] != '\0') {
    i++;
  }
  return i;
}

char *strcpy(char *dst, const char *src) {
  int i;
  for (i = 0; src[i] != '\0'; i++) {
    dst[i] = src[i];
  }
  dst[i] = '\0';
  return dst;
}

char *strncpy(char *dst, const char *src, size_t n) {
  bool flag = false;
  for (int i = 0; i < n; i++) {
    if (src[i] == '\0') flag = true;
    dst[i] = flag ? '\0' : src[i];
  }
  return dst;
}

char *strcat(char *dst, const char *src) {
  int n = strlen(dst), i;
  for (i = 0; src[i] != 0; i++) {
    dst[i + n] = src[i];
  }
  dst[i + n] = '\0';
  return dst;
}

int strcmp(const char *s1, const char *s2) {
  for (int i = 0; ; i++) {
    if (s1[i] == s2[i]) {
      if (s1[i] == '\0') return 0;
    } else {
      return s1[i] - s2[i];
    }
  }
}

int strncmp(const char *s1, const char *s2, size_t n) {
  for (int i = 0; i < n; i++) {
    if (s1[i] == s2[i]) {
      if (s1[i] == '\0') return 0;
    } else {
      return s1[i] - s2[i];
    }
  }
  return 0;
}

void *memset(void *s, int c, size_t n) {
  c &= 255; 
  char*str = s;
  for (int i = 0; i < n; i++) {
    str[i] = c;
  }
  return s;
}

void *memmove(void *dst, const void *src, size_t n) {
  if (dst < src) {
    for (int i = 0; i < n; i++) {
      ((char*)dst)[i] = ((char*)src)[i];
    }
  } else {
    for (int i = n - 1; i >= 0; i--) {
      ((char*)dst)[i] = ((char*)src)[i];
    }
  }
  return dst;
}

void *memcpy(void *out, const void *in, size_t n) {
  for (int i = 0; i < n; i++) {
    ((char*)out)[i] = ((char*)in)[i];
  }
  return out;
}

int memcmp(const void *s1, const void *s2, size_t n) {
  char *a = (char*)s1, *b = (char*)s2;
  for (int i = 0; i < n; i++) {
    if (a[i] != b[i]) {
      return a[i] - b[i];
    }
  }
  return 0;
}
```



### Q4: 实现sprintf

- 下面实现`- 0`宽度、精度和输出类型为`d u c s lld llu`的`sprintf`
- 采用类似`expr.c`的正则匹配来实现

- 我们在一个新的文件`klib/test/temp.c`中测试我们的实现是否正确，直接使用标准库的函数对比即可

- 我们假设宽度和精度不会同时出现，并且它们不是负数

发现不太适合在AM中引入`regex.h`，[具体原因可以见这里，Ctrl+左键](#section1)，因此我们手动实现一下匹配。

```c
#include <am.h>
#include <klib.h>
#include <klib-macros.h>
#include <stdarg.h>
#include <stdbool.h>


#if !defined(__ISA_NATIVE__) || defined(__NATIVE_USE_KLIB__)

enum {
  TK_MOD, TK_ARG, TK_CHAR
};

static struct rule {
  const char *regex;
  int token_type;
} rules[] = {
  {"%%", TK_MOD},
  // left sign_position padding width precision specifier
  {"%(-)?( )?(0)?([0-9]+|\\*)?(\\.[0-9]?|\\.\\*)?([ducs]|lld|llu)", TK_ARG},
  {"[^%]+", TK_CHAR}
};

#define NR_REGEX 3

typedef struct token {
  int type;
  bool left;
  bool sign_position;
  char padding;
  int width;
  int precision;
  char specifier[4];
  char *str;
} Token;

static Token tokens[65536] __attribute__((used)) = {};
static int nr_token __attribute__((used))  = 0;

static void clear_tokens() {
  for (int i = 0; i < nr_token; i++) {
    if (tokens[i].str != NULL) free(tokens[i].str), tokens[i].str = NULL;
}
  nr_token = 0;
}

typedef struct Regmatch_t {
  int rm_so, rm_eo;
} regmatch_t;

const int INF = 0x3f3f3f3f;

// match from the first char
static int regexec(int id, const char*e, int n, regmatch_t pmatch[]) {
  memset(pmatch, -1, n * sizeof(regmatch_t));
  if (id == 0) {
    if (!strncmp(e, "%%", 2)) {
      pmatch[0] = (regmatch_t){0, 2};
      return 0;
    } else {
      return 1;
    }
  } else if (id == 1) {
    // %
    int pos = 0;
    if (e[pos] != '%') return 1;
    else {
      pos++;
    }
    // left (-)?
    if (e[pos] == '-') {
      pmatch[1] = (regmatch_t){pos, pos + 1};
      pos++;
    }
    // sign_position ( )? 
    if (e[pos] == ' ') {
      pmatch[2] = (regmatch_t){pos, pos + 1};
      pos++;
    }
    // padding (0)
    if (e[pos] == '0') {
      pmatch[3] = (regmatch_t){pos, pos + 1};
      pos++;
    }
    // width ([0-9]?|\\*)?
    if (e[pos] >= '0' && e[pos] <= '9') {
      pmatch[4].rm_so = pos;
      while (e[pos] >= '0' && e[pos] <= '9') pos++;
      pmatch[4].rm_eo = pos;
    } else if (e[pos] == '*') {
      pmatch[4] = (regmatch_t){pos, pos + 1};
      pos++;
    }
    // precision (\\.[0-9]?|\\.\\*)?
    if (e[pos] == '.' && e[pos + 1] == '*') {
      pmatch[5] = (regmatch_t){pos, pos + 2};
      pos += 2;
    } else if (e[pos] == '.') {
      pmatch[5].rm_so = pos;
      pos++;
      while (e[pos] >= '0' && e[pos] <= '9') pos++;
      pmatch[5].rm_eo = pos;
    } 
    // specifier ([ducs]|lld|llu)
    if (e[pos] == 'd' || e[pos] == 'u' || e[pos] == 'c' || e[pos] == 's') {
      pmatch[6] = (regmatch_t){pos, pos + 1};
      pos++;
      pmatch[0] = (regmatch_t){0, pos};
    } else if (!strncmp(e + pos, "lld", 3) || !strncmp(e + pos, "llu", 3)) {
      pmatch[6] = (regmatch_t){pos, pos + 3};
      pos += 3;
      pmatch[0] = (regmatch_t){0, pos};
    } else {
      return 1;
    }
    return 0;
  } else if (id == 2) {
    if (e[0] == '%') return 1;
    for (int i = 0; e[i] != '\0'; i++) {
      if (e[i] == '%') break;
      pmatch[0] = (regmatch_t){0, i + 1};
    }
    return 0;
  }
  return 1;
}

static bool make_token(const char *e) {
  int position = 0;
  int i;
  regmatch_t pmatch[7];
  clear_tokens();
  while (e[position] != '\0') {
    /* Try all rules one by one. */
    // operator must be after number and right parenthesis.
    for (i = 0; i < NR_REGEX; i++) {
      if (regexec(i, e + position, 7, pmatch) == 0 && pmatch[0].rm_so == 0) {
        int substr_len = pmatch[0].rm_eo;

        /* TODO: Now a new token is recognized with rules[i]. Add codes
         * to record the token in the array `tokens'. For certain types
         * of tokens, some extra actions should be performed.
         */
        int type = rules[i].token_type;
        tokens[nr_token].type = type;
        if (type == TK_MOD) {
          tokens[nr_token].str = (char*)malloc(2);
          tokens[nr_token].str[0] = '%', tokens[nr_token].str[1] = '\0';
        } else if (type == TK_CHAR) {
          tokens[nr_token].str = (char*)malloc(substr_len + 1);
          memcpy(tokens[nr_token].str, e + position, substr_len);
          tokens[nr_token].str[substr_len] = '\0';
        } else {
          // left sign_position padding width precision specifier
          tokens[nr_token].left = pmatch[1].rm_so != -1;

          tokens[nr_token].sign_position = pmatch[2].rm_so != -1;

          tokens[nr_token].padding = pmatch[3].rm_so == -1 ? ' ' : e[position + pmatch[3].rm_so];

          if (pmatch[4].rm_so != -1) {
            if (e[position + pmatch[4].rm_so] == '*') {
              tokens[nr_token].width = INF;
            } else {
              tokens[nr_token].width = atoi(e + position + pmatch[4].rm_so);
            }
          } else {
            tokens[nr_token].width = -INF;
          }

          if (pmatch[5].rm_so != -1) {
            if (e[pmatch[5].rm_so + position + 1] == '*') {
              tokens[nr_token].precision = INF;
            } else {
              tokens[nr_token].precision = atoi(e + position + pmatch[5].rm_so + 1);
            }
          } else {
            tokens[nr_token].precision = -INF;
          }

          if (pmatch[6].rm_so != -1) {
            int k, j;
            for (j = 0, k = pmatch[6].rm_so; k < pmatch[6].rm_eo; k++, j++) {
              tokens[nr_token].specifier[j] = e[k + position];  
            }
            tokens[nr_token].specifier[j] = '\0';
          } else {
            assert(0);
          }

        }
        position += substr_len;
        nr_token++;
        break;
      }
    }

    if (i == NR_REGEX) {
      
      return false;
    }
  }

  return true;
}

#define PRINT_START() va_list args; va_start(args, fmt)
#define PRINT_END() clear_tokens(); va_end(args); return idx
#define gen(x) output[*idx] = x, (*idx)++
#define max(x, y) ((x) < (y) ? y : x)

static char output[65535];


static void gen_num(long long x, int *idx) {
  if (x < 0) {
    gen('-');
    gen_num(-x, idx);
    return;
  }
  if (x < 10) {
    gen(x + '0');
    return;
  } 
  gen_num(x / 10, idx);
  gen_num(x % 10, idx);
}

static void gen_unsigned_num(unsigned long long x, int *idx) {
  if (x < 10) {
    gen(x + '0');
    return;
  } 
  gen_unsigned_num(x / 10, idx);
  gen_unsigned_num(x % 10, idx);
}

static void generate_output(va_list args, int *idx) {
  for (int i = 0; i < nr_token; i++) {
    int type = tokens[i].type;
    bool left = tokens[i].left;
    bool sign_position = tokens[i].sign_position;
    char padding = tokens[i].padding;
    int width = tokens[i].width, precision = tokens[i].precision;
    char *specifier = tokens[i].specifier, *str = tokens[i].str;

    if (type == TK_CHAR || type == TK_MOD) {
      for (int j = 0; str[j] != '\0'; j++) {
        gen(str[j]);
      }
    } else {
      int start = *idx;

      if (width == INF) {
        width = va_arg(args, int);
        if (width < 0) {
          width = -width;
          left = true;
        }
      }
      if (precision == INF) {
        precision = va_arg(args, int);
      }
      if (!strcmp(specifier, "s")) {
        padding = ' ';
        const char *temp = va_arg(args, const char*);
        for (int j = 0; temp[j] != '\0'; j++) {
          if (precision > 0 && j >= precision) break;
          gen(temp[j]);
        }
      } else if (!strcmp(specifier, "d")) {
        int res = va_arg(args, int);
        
        if (res < 0) sign_position = true;
        else if (sign_position) gen(' ');

        gen_num(res, idx);
      } else if (!strcmp(specifier, "lld")) {
        long long res = va_arg(args, long long);
        if (res < 0) sign_position = true;
        else if (sign_position) gen(' ');
        gen_num(res, idx);
      } else if (!strcmp(specifier, "u")) {
        if (sign_position) gen(' ');
        gen_unsigned_num(va_arg(args, unsigned int), idx);
      } else if (!strcmp(specifier, "llu")) {
        if (sign_position) gen(' ');
        gen_unsigned_num(va_arg(args, unsigned long long), idx);
      } else if (!strcmp(specifier, "c")) {
        gen(va_arg(args, int));
        continue;
      } else {
        assert(0);
      }

      if (precision == 0) {
        *idx = start;
        continue;
      }

      int len = *idx - start;
      // we assume that [width] and [precision] don't show coincedently.

      if (precision != -INF && strcmp(specifier, "s") != 0) {
        if (left) left = false;
        padding = '0';
        width = max(width, (sign_position ? 1 : 0) + precision);
        precision = 0;
      }

      if (width != -INF) {
        
        for (int j = 0; j < width - len; j++) {
          gen(' '); 
        }
        
        if (!left) {
          int num_len = len, num_start = start;
          if (sign_position) {
            num_len--;
            num_start++;
            width--;
          }

          if (width > num_len) {
            memmove(output + num_start + width - num_len, output + num_start, num_len);
            memset(output + num_start, padding, width - num_len);
            if (padding == ' ' && output[start] == '-' && strcmp(specifier, "s") != 0) {
              output[start] = ' ';
              output[*idx - len] = '-';
            }
          }
        }
      }
    }
  }
  output[*idx] = '\0';
}


int printf(const char *fmt, ...) {
  PRINT_START();
  make_token(fmt);
  int idx = 0;
  generate_output(args, &idx);
  for (int i = 0; i < idx; i++) {
    putch(output[i]);
  }
  PRINT_END();
}


int vsprintf(char *out, const char *fmt, va_list ap) {
  int idx = 0;
  make_token(fmt);
  generate_output(ap, &idx);
  strcpy(out, output);
  return idx;
}

int sprintf(char *out, const char *fmt, ...) {
  PRINT_START();
  int idx = vsprintf(out, fmt, args);
  PRINT_END();
}


int vsnprintf(char *out, size_t n, const char *fmt, va_list ap) {
  int idx = 0;
  make_token(fmt);
  generate_output(ap, &idx);
  n--;
  int i;
  for (i = 0; output[i] != '\n' && i < n; i++) {
    out[i] = output[i];
  }
  out[i] = '\0';
  return idx;
}

int snprintf(char *out, size_t n, const char *fmt, ...) {
  PRINT_START();
  int idx = vsnprintf(out, n, fmt, args);
  PRINT_END();
}

#endif

```

测试文件`temp.c`，测试时将自己实现的函数加上前缀`_`并引入标准库函数来检测。

```c
char a[100];
char b[100];
int cnt;


bool test(const char*fmt, ...) {
  va_list args1, args2;
  va_start(args1, fmt);
  va_copy(args2, args1);

  int ret1 = _vsprintf(a, fmt, args1);
  int ret2 = vsprintf(b,fmt, args2);
  va_end(args1);
  va_end(args2);
  cnt++;
  if (strcmp(a, b) != 0 || ret1 != ret2) {
    printf("Failed on test %d: %s\n", cnt, fmt);
    printf("Yours: %s len: %d ret: %d \nExpected: %s len: %d ret: %d\n", a, (int)strlen(a), ret1, b, (int)strlen(b), ret2);
    return false;
  }
  printf("Pass test on %d: %s\n", cnt, fmt);
  return true;
}

int main() {
  assert(test(""));
  assert(test("str = %s, len = %d %%.\n", "Hello world", (int)strlen("Hello world")));
  assert(test("%d", -111));
  assert(test("%-d", -111));
  assert(test("%0d", -111));
  assert(test("%-0d", -111));
  assert(test("%-8d", -111));
  assert(test("%-08d", -111));
  assert(test("%-.8d", -111));
  assert(test("%-0.8d", -111));
  assert(test("%8d", -111));
  assert(test("% 8d", -111));
  assert(test("%08d", -111));
  assert(test("%.8d", -111));
  assert(test("%0.8d", -111));
  assert(test("str: %.*s  %.15s", 5, "abcdefghi", "abcdefghi"));
  assert(test("n: %.9d  %.4d", 123456, 123456));
  assert(test("m=%10d, m=%-10d", 192, 192));
  assert(test("m=% d, n=% d", 192, -943));
  assert(test("m=%- d, n=%- d", 192, -943));
  assert(test("输出字符: %c %c ", 'a', 65));
  assert(test("输出十进制数: %d %lld", -1977, -650012434235541300ll));
  assert(test("输出十进制数: %u %llu", 1977, 650012434235541300ull));
  assert(test("用空格填充: %10d ", 1977));
  assert(test("用0填充: %010d ", 1977));
  assert(test("指定宽度: %*d ", 5, 10));
  assert(test("输出字符串：%s ", "C language is great"));
  assert(test("输出字符串：%.10s ", "C language is great"));
  assert(test("输出字符串：%10s ", "C language is great"));
  assert(test("%s", "Hello world!\n"));
  assert(test("%d + %d = %d\n", 1, 1, 2));
  assert(test("%d + %d = %d\n", 2, 10, 12));

  // 1. 宽度与精度的边界 (Edge Cases for Width/Precision)
  assert(test("宽度小于实际长度: %2d", 12345));     // 应输出 "12345"
  assert(test("宽度刚好等于长度: %5d", 12345));     // 应输出 "12345"
  assert(test("精度为0且值为0: %.0d", 0));          // 标准 printf 中应输出空字符串 (容易漏掉的细节)
  assert(test("精度不带有显示值: %.d", 0));          // 精度不带有显示值
  assert(test("宽度很大: %50s", "short"));         // 测试缓冲区对长空白的处理

  // 2. 标志位与符号 (Flags and Signs)
  assert(test("正数的空格标志: % d", 42));          // 应输出 " 42"
  assert(test("负数的空格标志: % d", -42));         // 应输出 "-42" (空格被负号覆盖)
  assert(test("空格与宽度结合: % 5d", 42));         // 应输出 "   42"
  assert(test("左对齐与宽度: %-10s!", "left"));    // 应输出 "left      !"

  // 3. 指针宽度与精度通配符 (*)
  assert(test("动态宽度: %*d", 10, 1));             // 相当于 %10d
  assert(test("动态宽度负值: %*d", -10, 1));        // 某些实现中负宽度等同于 '-' 标志
  assert(test("动态精度: %.*d", 5, 123));           // 相当于 %.5d，输出 "00123"
  // assert(test("动态宽度与精度: %*.*d", 10, 5, 1));  // (目前不支持同时出现)

  // 4. 字符串切片 (String Precision)
  assert(test("字符串精度截断: %.3s", "abcdefg"));  // 应输出 "abc"
  assert(test("字符串精度过长: %.10s", "abc"));     // 应输出 "abc"
  assert(test("空字符串精度: %.5s", ""));           // 应输出空

  // 5. 64位整数 (Long Long Support)
  assert(test("最大无符号长整型: %llu", 0xFFFFFFFFFFFFFFFFull));
  assert(test("长整型负数: %lld", -123456789012345ll));
  assert(test("混合长整型: %lld %d %llu", -1ll, 2, 3ull));

  // 6. 综合复杂场景
  assert(test("连续百分号: %%%%%%"));               // 应输出 "%%%"
  assert(test("混合测试: %-8d %05d %.3s %10llu", 1, 2, "hello", 123456789012345ull));
  assert(test("各种0: %0d %05d %01d", 0, 0, 0));
  return 0;
}
```

### Q5: 实现iringbuf

按照`itrace`类似实现即可。

```c
static char ring_buffer[20][128];
static int ring_hh;

static void exec_once(Decode *s, vaddr_t pc) {
  // ...
#endif
  
  // iringbuf
  char *p2 = ring_buffer[ring_hh];
  p2 += snprintf(p2, sizeof(ring_buffer[ring_hh]), FMT_WORD ":", s->pc);
  int ilen2 = s->snpc - s->pc;
  uint8_t *inst2 = (uint8_t *)&s->isa.inst;
  for (int i = ilen2 - 1; i >= 0; i --) {
    p2 += snprintf(p2, 4, " %02x", inst2[i]);
  }

  int ilen_max2 = MUXDEF(CONFIG_ISA_x86, 8, 4);
  int space_len2 = ilen_max2 - ilen2;
  if (space_len2 < 0) space_len2 = 0;
  space_len2 = space_len2 * 3 + 1;
  memset(p2, ' ', space_len2);
  p2 += space_len2;

  void disassemble(char *str, int size, uint64_t pc, uint8_t *code, int nbyte);
  disassemble(p2, ring_buffer[ring_hh] + sizeof(ring_buffer[ring_hh]) - p2,
      MUXDEF(CONFIG_ISA_x86, s->snpc, s->pc), (uint8_t *)&s->isa.inst, ilen2);

  if (++ring_hh == 20) ring_hh = 0;

}

static void print_iringbuf() {
  printf("iringbuf:\n");
  for (int i = 0; i < 20; i++) {
    if (ring_buffer[i][0] != '0') continue;
    printf((ring_hh == (i + 1) % 20 ? "  --> " : "      "));
    printf("%s\n", ring_buffer[i]);
  }
}

void assert_fail_msg() {
  isa_reg_display();
  statistic();
  print_iringbuf();
}
```



### Q6: 实现mtrace

还是比较好实现的。

`Kconfig`

```shell
config MTRACE_START
  depends on TRACE
  hex "Memory that is greater than or equal to is enabled (unit: byte)"
  default 0x00000000

config MTRACE_END
  depends on TRACE
  hex "Memory that is less than or equal to is enabled (unit: byte)"
  default 0xffffffff

config MTRACE
  depends on TRACE && TARGET_NATIVE_ELF && ENGINE_INTERPRETER
  bool "Enable memory tracer"
  default y
```

`paddr.c`

```c
word_t paddr_read(paddr_t addr, int len) {
#ifdef CONFIG_MTRACE
  if (CONFIG_MTRACE_START <= addr && addr <= CONFIG_MTRACE_END) {
    printf("R: "FMT_PADDR " %d\n", addr, len);
  }
#endif
  if (likely(in_pmem(addr))) return pmem_read(addr, len);
  IFDEF(CONFIG_DEVICE, return mmio_read(addr, len));
  out_of_bound(addr);
  return 0;
}

void paddr_write(paddr_t addr, int len, word_t data) {
#ifdef CONFIG_MTRACE
  if (CONFIG_MTRACE_START <= addr && addr <= CONFIG_MTRACE_END) {
    printf("W: "FMT_PADDR " %d " FMT_WORD"\n", addr, len, data);
  }
#endif
  if (likely(in_pmem(addr))) { pmem_write(addr, len, data); return; }
  IFDEF(CONFIG_DEVICE, mmio_write(addr, len, data); return);
  out_of_bound(addr);
}
```



### Q7: 实现ftrace

```c
// monitor.c

static char *elf_file = NULL;

static void *elf_content = NULL;

static Elf32_Ehdr *elf_header_ptr = NULL;
static Elf32_Phdr *program_header_ptr = NULL;
static Elf32_Shdr *section_header_ptr = NULL;

static Elf32_Sym *symtab_ptr = NULL;
static int symtab_len;

static char *strtab_ptr = NULL;
static char *shstrtab_ptr = NULL;

static long load_elf() {
  if (elf_file == NULL) {
    Log("No elf is given. ftrace is closed.");
    return 0;
  }
  
  FILE *fp = fopen(elf_file, "rb");
  Assert(fp, "Can not open '%s'", elf_file);

  fseek(fp, 0, SEEK_END);
  long size = ftell(fp);

  Log("The elf is %s, size = %ld", elf_file, size);

  fseek(fp, 0, SEEK_SET);
  elf_content = malloc(size);
  int ret = fread(elf_content, size, 1, fp);
  assert(ret == 1);

  // check whether the file is elf or not
  elf_header_ptr = elf_content;
  Assert(strncmp((char*)(elf_header_ptr->e_ident), "\x7f""ELF",4) == 0, "%s is not ELF FILE.", elf_file);
  
  program_header_ptr = elf_content + elf_header_ptr -> e_phoff;
  section_header_ptr = elf_content + elf_header_ptr -> e_shoff;
  
  shstrtab_ptr = elf_content + section_header_ptr[elf_header_ptr -> e_shstrndx].sh_offset;
  
  for (int i = 0; i < elf_header_ptr -> e_shnum; i++) {
    char* now = section_header_ptr[i].sh_name + shstrtab_ptr;
    void* target = elf_content + section_header_ptr[i].sh_offset;
    if (strcmp(now, ".symtab") == 0) {
      symtab_len = section_header_ptr[i].sh_size / section_header_ptr[i].sh_entsize;
      symtab_ptr = target;
    } else if (strcmp(now, ".strtab") == 0) {
      strtab_ptr = target;
    }
  }
  
  fclose(fp);

  return size;
}

char* get_func_name(vaddr_t pc) {
  if (symtab_len == 0) return NULL;
  for (int i = 0; i < symtab_len; i++) {
    if (ELF32_ST_TYPE(symtab_ptr[i].st_info) == STT_FUNC && pc >= symtab_ptr[i].st_value
      && pc < symtab_ptr[i].st_value + symtab_ptr[i].st_size) {
        return symtab_ptr[i].st_name + strtab_ptr;
    }
  }
  return "???";
}

// inst.c
static int func_call_cnt;

static void print_ftrace(Decode *s) {
  char *now_func_name = get_func_name(s -> pc);
  char *next_func_name = get_func_name(s -> dnpc);
  if (now_func_name == NULL || next_func_name == NULL) return;
  uint32_t inst = s->isa.inst;
  int rs1 = BITS(inst, 19, 15), rd = BITS(inst, 11, 7);
  // jalr
  if (BITS(inst, 6, 0) == 0b1100111) {
    if (!(rd == 1 || rd == 5) && (rs1 == 1 || rs1 == 5)) {
      // ret
      func_call_cnt--;
      printf("0x%x:%*sret  [%s]\n", s -> pc, 1 + 2 * func_call_cnt, " ", now_func_name);
    } else if ((rd == 1 || rd == 5) && !(rs1 == 1 || rs1 == 5)) {
      // call
      printf("0x%x:%*scall [%s@0x%x]\n", s -> pc, 1 + 2 * func_call_cnt, " ", next_func_name, s -> dnpc);
      func_call_cnt++;
    } else if ((rd == 1 || rd == 5) && (rs1 == 1 || rs1 == 5)) {
      if (rd == rs1) {
        // 32bit call ( pre: lui rd imm20)
        printf("0x%x:%*scall [%s@0x%x]\n", s -> pc, 1 + 2 * func_call_cnt, " ", next_func_name, s -> dnpc);
        func_call_cnt++;
      } else {
        // Coroutine Switching
        printf("Coroutine Switching: [%s@0x%x] -> [%s@0x%x]\n", now_func_name, s -> pc, next_func_name, s -> dnpc);
      }
    }
  } else {
  // jal
    if (rd == 1 || rd == 5) {
      // call
      printf("0x%x:%*scall [%s@0x%x]\n", s -> pc, 1 + 2 * func_call_cnt, " ", next_func_name, s -> dnpc);
      func_call_cnt++;
    }
  }
}
```



### Q8: 编写更多的测试

```c
#include "klibtest.h"

#define N 32
uint8_t data[N];
uint8_t src[N], dst[N];
const long long int_data[] = {0, INT_MAX / 17, INT_MAX, INT_MIN, INT_MIN + 1,
  UINT_MAX / 17, INT_MAX / 17, UINT_MAX};
const char *str_data[] = {"0", "126322567", "2147483647", "-2147483648",
   "-2147483647", "252645135", "126322567", "4294967295"};
char output[N];

void reset(uint8_t x) {
  int i;
  for (i = 0; i < N; i ++) {
    data[i] = src[i] =  i + 1;
    dst[i] = x;
  }
}

// 检查[l,r)区间中的值是否依次为val, val + 1, val + 2...
void check_seq(uint8_t a[], int l, int r, int val) {
  int i;
  for (i = l; i < r; i ++) {
    assert(a[i] == val + i - l);
  }
}

// 检查[l,r)区间中的值是否均为val
void check_eq(uint8_t a[], int l, int r, int val) {
  int i;
  for (i = l; i < r; i ++) {
    assert(a[i] == val);
  }
}

void test_memset() {
  int l, r;
  for (l = 0; l < N; l ++) {
    for (r = l + 1; r <= N; r ++) {
      reset(0);
      uint8_t val = (l + r) / 2;
      memset(data + l, val, r - l);
      check_seq(data, 0, l, 1);
      check_eq(data, l, r, val);
      check_seq(data, r, N, r + 1);
    }
  }
}

void test_memcpy() {
    int l, r;
    for (l = 0; l < N; l ++) {
        for (r = l + 1; r <= N; r ++) {
            uint8_t val = (l + r) / 2;
            reset(val);
            memcpy(dst + l, src + l, r - l);
            check_eq(dst, 0, l, val);
            check_seq(dst, l, r, l + 1);
            check_eq(dst, r, N, val);
        }
    }
}

void test_sprintf() {
  for (int i = 0; i < 8; i++) {
    sprintf(output, "%lld", int_data[i]);
    if (strcmp(str_data[i], output) != 0) {
      printf("Failed on test %d.\n", i);
      printf("Yours: %s \n Expected: %s", output[i], str_data[i]);
      assert(0);
    }
  }
}

int main() {
    test_memset();
    test_memcpy();
    test_sprintf();
    return 0;
}
```



### Q9: 实现DiffTest

阅读找到`tools/spike-diff/repo/disasm/regnames.cc`，发现`xpr_name`就是寄存器的顺序，与nemu中的一样，因此不需要修改。

我们只需要

```c
bool isa_difftest_checkregs(CPU_state *ref_r, vaddr_t pc) {
  if (cpu.pc != ref_r->pc) return false;
  for (int i = 0; i < 32; i++) {
    if (cpu.gpr[i] != ref_r->gpr[i]) {
      return false;
    }
  }
  return true;
}
```



## PA2.3

### Q1: 运行Hello World

```shell
cd am-kernels/kernels/hello/
make ARCH=$riscv32-nemu run
```

![image-20260120155137444](/notes/pa2/image-20260120155137444.png)

### Q2: 理解mainargs

**riscv32-nemu**

- 执行run时，会到`nemu.mk`先执行`insert-arg`操作
- insert-arg会调用`tools/insert-arg.py`将`$(IMAGE).bin`文件中的占位字符串`$(MAINARGS_PLACEHOLDER)`替换为`$(mainargs)`
- `am/src/platform/nemu/trm.c`和`nemu/src/riscv/trm.c`中定义了全局静态`mainargs`字符串数组，并用占位符初始化了，但是它被输入的`$(mainargs)`参数替换掉了，`_trm_init()`函数中调用了`main(mainargs)`函数，把`mainargs`传递过去了
- `main`函数输出时遇见占位符`%`会将`mainargs`的内容输出

**native**

- 执行run时，会到`native.mk`直接执行中的elf文件，make参数会把`mainargs`这个环境变量传递给子进程
- `trm.c`中的`trm_init()`执行了虚函数`_am_platform_dummy()`，这让链接器把`platform.o`也链接上了
- `platform.c`中声明了构造函数（Constuctors）`init_platform()`，函数末尾调用`getenv(mainargs)`获取环境变量，并调用函数`main(args)`
- `mainargs=111 ./hello-native`也可以传递环境变量

### Q3: 实现printf

已在PA2.2的Q3顺带实现

```c
int printf(const char *fmt, ...) {
  PRINT_START();
  make_token(fmt);
  int idx = 0;
  generate_output(args, &idx);
  for (int i = 0; i < idx; i++) {
    putch(output[i]);
  }
  PRINT_END();
}
```

### Q4: 运行alu-tests

```shell
cd am-kernels/tests/alu-tests/
make ARCH=riscv32-nemu run "NEMUFLAGS += -b"
```

### Q5: 实现IOE

**这里注意一定要先读高32位才会触发更新，否则低32位读到的是旧值**

```c
// abstract-machine/am/src/platform/nemu/ioe/timer.c
void __am_timer_uptime(AM_TIMER_UPTIME_T *uptime) {
  uptime->us =  (1ull * inl(RTC_ADDR + 0x4) << 32) | inl(RTC_ADDR);
}
```

阅读`main.c`可知这样测试
```shell
cd am-kernel/tests/am-tests
make run mainargs=t ARCH=riscv32-nemu "NEMUFLAGS += -b"
```

### Q6: 看看NEMU跑多快

```shell
Dhrystone Benchmark, Version C, Version 2.2
Trying 500000 runs through Dhrystone.
Finished in 5405 ms
==================================================
Dhrystone PASS         162 Marks
                   vs. 100000 Marks (i7-7700K @ 4.20GHz)
                   
Running CoreMark for 1000 iterations
2K performance run parameters for coremark.
CoreMark Size    : 666
Total time (ms)  : 7675
Iterations       : 1000
Compiler version : GCC13.3.0
seedcrc          : 0x[0]crclist       : 0x[0]crcmatrix     : 0x[0]crcstate      : 0x[0]crcfinal      : 0xFinised in 7675 ms.
==================================================
CoreMark PASS       380 Marks
                vs. 100000 Marks (i7-7700K @ 4.20GHz)
                
Empty mainargs. Use "ref" by default
======= Running MicroBench [input *ref*] =======
[qsort] Quick sort: * Passed.
  min time: 415.794 ms [1059]
[queen] Queen placement: * Passed.
  min time: 827.464 ms [491]
[bf] Brainf**k interpreter: * Passed.
  min time: 5536.057 ms [303]
[fib] Fibonacci number: * Passed.
  min time: 9015.338 ms [223]
[sieve] Eratosthenes sieve: * Passed.
  min time: 12391.453 ms [281]
[15pz] A* 15-puzzle search: * Passed.
  min time: 1047.898 ms [511]
[dinic] Dinic's maxflow algorithm: * Passed.
  min time: 1251.550 ms [653]
[lzip] Lzip compression: * Passed.
  min time: 1442.243 ms [471]
[ssort] Suffix sort: * Passed.
  min time: 565.347 ms [707]
[md5] MD5 digest: * Passed.
  min time: 8812.206 ms [172]
==================================================
MicroBench PASS        487 Marks
                   vs. 100000 Marks (i9-9900K @ 3.60GHz)
Scored time: 41305.350 ms
Total  time: 47194.862 ms
```



### Q7: 实现dtrace

类似mtrace实现即可

```c
word_t paddr_read(paddr_t addr, int len) {
#ifdef CONFIG_MTRACE
  if (CONFIG_MTRACE_START <= addr && addr <= CONFIG_MTRACE_END) {
    printf("R: "FMT_PADDR " %d\n", addr, len);
  }
#endif
  if (likely(in_pmem(addr))) return pmem_read(addr, len);
  IFDEF(CONFIG_DEVICE, return mmio_read(addr, len));
  out_of_bound(addr);
  return 0;
}

void paddr_write(paddr_t addr, int len, word_t data) {
#ifdef CONFIG_MTRACE
  if (CONFIG_MTRACE_START <= addr && addr <= CONFIG_MTRACE_END) {
    printf("W: "FMT_PADDR " %d " FMT_WORD"\n", addr, len, data);
  }
#endif
  if (likely(in_pmem(addr))) { pmem_write(addr, len, data); return; }
  IFDEF(CONFIG_DEVICE, mmio_write(addr, len, data); return);
  out_of_bound(addr);
}

```



### Q8: 实现IOE2

```c
// nemu/ioe/input.c
void __am_input_keybrd(AM_INPUT_KEYBRD_T *kbd) {
  unsigned int kbd_state = inl(KBD_ADDR);
  kbd->keydown = kbd_state & KEYDOWN_MASK;
  kbd->keycode = kbd_state & (~KEYDOWN_MASK);
}
```



### Q9: 实现IOE3

```c
//vga.c
void vga_update_screen() {
  // TODO: call `update_screen()` when the sync register is non-zero,
  // then zero out the sync register
  if (vgactl_port_base[1] == 1) {
    update_screen();
    vgactl_port_base[1] = 0;
  }
}

//gpu.c
void __am_gpu_init() {
  int i;
  int w = io_read(AM_GPU_CONFIG).width;  
  int h = io_read(AM_GPU_CONFIG).height;  
  uint32_t *fb = (uint32_t *)(uintptr_t)FB_ADDR;
  for (i = 0; i < w * h; i ++) fb[i] = i;
  outl(SYNC_ADDR, 1);
}

void __am_gpu_config(AM_GPU_CONFIG_T *cfg) {
  unsigned int gpu_config = inl(VGACTL_ADDR);
  *cfg = (AM_GPU_CONFIG_T) {
    .present = true, .has_accel = false,
    .width = gpu_config >> 16, .height = gpu_config & 0xffff,
    .vmemsz = 0
  };
}
```



### Q10: 实现IOE4

```c
// gpu.c
void __am_gpu_fbdraw(AM_GPU_FBDRAW_T *ctl) {
  if (ctl->sync) {
    outl(SYNC_ADDR, 1);
  }
  int h = ctl -> h, w = ctl -> w;
  unsigned int *p = ctl -> pixels;
  int gpu_width = io_read(AM_GPU_CONFIG).width;
  int gpu_height = io_read(AM_GPU_CONFIG).height;
  for (int i = 0; i < h; i++) {
    for (int j = 0; j < w; j++) {
      int a = ctl -> y + i, b = ctl -> x + j;
      if (a < gpu_height && b < gpu_width) {
        outl(FB_ADDR + 4 * ((a * gpu_width) + b), p[i * w + j]);
      }
    }
  }
}
```



### Q11: 实现声卡

采用循环队列维护缓冲区，这里需要增加一个寄存器`reg_sbuf_pos`，`amdev.h`中也需要增加`sbuf_pos`。

写法是参考的`native`中的`audio.c`

```c
// nemu/src/device/audio.c

enum {
  reg_freq,
  reg_channels,
  reg_samples,
  reg_sbuf_size,
  reg_init,
  reg_count,
  reg_sbuf_pos,
  nr_reg
};

static uint8_t *sbuf = NULL;
static uint32_t *audio_base = NULL;

static void audio_play(void *userdata, uint8_t *stream, int len) {
  SDL_LockAudio();
  SDL_memset(stream, 0, len);
  uint32_t count = audio_base[reg_count], sbuf_pos = audio_base[reg_sbuf_pos], sbuf_size = audio_base[reg_sbuf_size];
  if (count < len) len = count;

  int first_part = (sbuf_pos + len > sbuf_size) ? (sbuf_size - sbuf_pos) : len;
  memcpy(stream, sbuf + sbuf_pos, first_part);

  if (len > first_part) {
      memcpy(stream + first_part, sbuf, len - first_part);
  }
  sbuf_pos += len;
  if (sbuf_pos >= sbuf_size) sbuf_pos -= sbuf_size;
  count -= len;
  audio_base[reg_count] = count;
  audio_base[reg_sbuf_pos] = sbuf_pos;
  SDL_UnlockAudio();
}

static void audio_io_handler(uint32_t offset, int len, bool is_write) {
  if (offset == 0x08) {
    SDL_AudioSpec s = {};
    s.format = AUDIO_S16SYS;
    s.userdata = NULL;  
    s.freq = audio_base[reg_freq];
    s.channels = audio_base[reg_channels];
    s.samples = audio_base[reg_samples];
    s.callback = audio_play;
    SDL_InitSubSystem(SDL_INIT_AUDIO);
    SDL_OpenAudio(&s, NULL);
    SDL_PauseAudio(0);
  }
}

void init_audio() {
  uint32_t space_size = sizeof(uint32_t) * nr_reg;
  audio_base = (uint32_t *)new_space(space_size);
  audio_base[reg_sbuf_size] = CONFIG_SB_SIZE;
  audio_base[reg_init] = 1;
  audio_base[reg_count] = 0;
  audio_base[reg_sbuf_pos] = 0;

// abstract-machine/am/src/platform/nemu/ioe/audio.c

#define AUDIO_SBUF_POS_ADDR  (AUDIO_ADDR + 0x18)

void __am_audio_init() {
}

void __am_audio_config(AM_AUDIO_CONFIG_T *cfg) {
  cfg -> present = inl(AUDIO_INIT_ADDR);
  cfg -> bufsize = inl(AUDIO_SBUF_SIZE_ADDR);
}



static void audio_write(uint8_t *buf, int len) {
  AM_AUDIO_STATUS_T status = io_read(AM_AUDIO_STATUS);
  int count = status.count, sbuf_pos = status.sbuf_pos, sbuf_size = io_read(AM_AUDIO_CONFIG).bufsize;
  while (sbuf_size - count < len) {
    status = io_read(AM_AUDIO_STATUS);
    count = status.count, sbuf_pos = status.sbuf_pos;
  }
  for (int i = 0, j = (sbuf_pos + count) % sbuf_size; i < len; i++, j = (j + 1) % sbuf_size) {
    outb(AUDIO_SBUF_ADDR + j, buf[i]);
  }
  count += len;
  outl(AUDIO_COUNT_ADDR, count);
}

void __am_audio_ctrl(AM_AUDIO_CTRL_T *ctrl) {
  outl(AUDIO_FREQ_ADDR, ctrl -> freq);
  outl(AUDIO_CHANNELS_ADDR, ctrl -> channels);
  outl(AUDIO_SAMPLES_ADDR, ctrl -> samples);
}

void __am_audio_status(AM_AUDIO_STATUS_T *stat) {
  stat -> count = inl(AUDIO_COUNT_ADDR);
  stat -> sbuf_pos = inl(AUDIO_SBUF_POS_ADDR);
}

void __am_audio_play(AM_AUDIO_PLAY_T *ctl) {
  int len = ctl -> buf.end - ctl -> buf.start;
  audio_write(ctl -> buf.start, len);
}
```



### Q12:游戏是如何运行的<a id="section3"></a>

<h3>1. 宏观视角：计算机是个抽象层</h3>

在这个视角下，计算机被简化为一系列**约定（Contracts）**和**接口（Interfaces）**。

- **应用层（游戏）**：它不关心什么是寄存器，它只看到 `chars[]` 结构体和 `AM` 提供的 `io_read/write` 接口。
- **AM 层（抽象机）**：它是这个视角下的核心。它对上承诺：“只要你调用 `AM_INPUT_KEYBRD`，我就能给你按键信息。”它对下隐藏了具体的 ISA 细节。
- **状态切换逻辑**：
  - **按下 A**：应用层通过 AM 接口“询问”环境是否有输入。
  - **判定命中**：逻辑层修改 `c->v`。
  - **重绘效果**：应用层调用 `AM_GPU_FBDRAW` 接口，它认为自己是在向一块“无限大的画布”绘图。

------

<h3> 2. 微观视角：计算机是个状态机</h3>

在这个视角下，没有“游戏”，也没有“图形”，只有**状态的迁移**。

$$S = \{PC, GPRs, Memory, Device\_State\}$$

每一次时钟周期的推进，都是一次 $S \to S'$ 的变换。

- **指令驱动（ISA）**：
  1. 当 CPU 执行 `lw a0, 0(a1)`（读取键盘地址）时，状态机中的 $PC$ 改变，触发了一次对 $Memory$ 特定区域的访问。
  2. NEMU 的执行引擎拦截到这个访问，发现它不在物理内存，而是在 I/O 区。
- **硬件状态迁移**：
  - **键盘状态机**：原本 `key_queue` 里有一个元素。当执行完那条访存指令后，`key_queue` 的状态变为“减少一个元素”，而 CPU 的寄存器 $a0$ 的状态变为了“'A' 的扫描码”。
  - **显存状态机**：当执行 `sw` 指令写显存地址时，宿主机内存中 $vmem$ 数组的某个字节从 `0x0` 变成了 `0x00cc33`（绿色）。
- **命中效果的本质**：所谓的“命中并变绿”，在微观视角下，仅仅是 $GPRs$（速度变量对应的寄存器）变成了负数，随后引发了一系列 $Memory$ 写入操作，改变了显存像素点的颜色数据。
------

<h3>3. 两个视角的碰撞:AM到底是什么？</h3>

- **从宏观视角看**：AM 像是一个库，是一个辅助工具。

- **从微观视角看**：AM **不存在**。当 `.bin` 加载进 NEMU 后，所谓的 AM 已经消失了，剩下的只有成千上万条无差别的指令。`io_read` 也不再是一个“动作”，而仅仅是引起状态机 $Memory$ 部分发生剧烈变化的特定 $PC$ 序列。



### Q13: 在NEMU上运行NEMU,打字游戏经历了什么？

这是一个极其精彩的“三层套娃”协同问题。要理解这个过程，我们必须建立一个**“职责链”**的概念：每一层都以为自己是在操作硬件，但实际上每一层都在被上一层“欺骗”。

为了方便描述，我们定义以下术语：

1. **Host**：你真实的物理电脑（Linux）。
2. **Outer-NEMU**：运行在 Linux 上的第一层模拟器。
3. **Inner-NEMU**：运行在 Outer-NEMU 上的第二层模拟器（即编译到 AM 的那个）。
4. **Typing-Game**：运行在 Inner-NEMU 上的目标程序。

------

<h3>1. 读取按键的“长征路”：从物理键盘到游戏逻辑</h3>

当你在物理键盘上按下 'A' 时，信号经历了如下的接力：

1. **Host $\to$ Outer-NEMU**：

   Host 的 SDL 库捕获按键，Outer-NEMU 通过 `device_update` 将其存入自己的键盘队列。

2. **Outer-NEMU $\to$ Inner-NEMU (AM 层)**：

   Inner-NEMU（作为一个运行在 Outer 上的程序）调用 `io_read(AM_INPUT_KEYBRD)`。

   - 这个调用在 Inner-NEMU 的 AM 代码里变成了 `inl(KBD_ADDR)`。
   - Outer-NEMU 截获这个访存指令，触发自己的 `mmio_read`，把 'A' 交给 Inner-NEMU。

3. **Inner-NEMU $\to$ Typing-Game**：

   Typing-Game 调用自己的 `io_read(AM_INPUT_KEYBRD)`。

   - 注意！这是 Typing-Game 发出的指令。Inner-NEMU 执行这条指令时，会模拟指令译码，发现这是一个访问 `0xa0000060` 的操作。
   - Inner-NEMU 调用**它自己代码里的** `mmio_read` 和 `i8042_data_io_handler`。
   - **关键点**：Inner-NEMU 模拟的键盘设备从它自己的 `key_queue` 里弹出 'A'，交给 Typing-Game。

------

<h3> 2. 刷新屏幕的“套娃搬运”：从像素数据到物理窗口</h3>

这个过程展示了显存数据是如何在三层内存空间中穿梭的：

1. **Typing-Game 绘图**：

   游戏调用 `io_write(AM_GPU_FBDRAW, ...)`。

   - **结果**：Inner-NEMU 截获指令，将像素数据写进了 **Inner-NEMU 维护的 `fb` 数组**（显存）里。

2. **Inner-NEMU 同步**：

   游戏调用 `io_write(..., sync=true)`。

   - **Inner 的反应**：Inner-NEMU 的 `vga_update_screen` 被触发。
   - **逻辑**：它认为自己要更新屏幕，于是它调用了**自己 AM 层**的 `io_write(AM_GPU_FBDRAW, 0, 0, vmem, screen_width(), screen_height(), true);`。

3. **Inner-AM $\to$ Outer-NEMU**：

   Inner-NEMU 发出的这个 `io_write` 最终变成了一系列针对 Outer-NEMU 显存地址（如 `0xa1000000`）的 `sw` 指令。

   - **Outer 的反应**：Outer-NEMU 截获指令，将数据从 Inner-NEMU 的内存搬运到了 **Outer-NEMU 维护的 `vmem` 数组**里。

4. **Outer-NEMU $\to$ Host**：

   当 Outer-NEMU 的 `device_update` 发现需要同步时，它调用宿主机的 **SDL_UpdateTexture**。

   - **结果**：你物理屏幕上的窗口闪烁了一下，出现了打字游戏的画面。

------

<h3> 3. 深度剖析：为什么能跑通？</h3>

这里有两个最容易混淆的“魔法”：

- **硬件模拟的本质是 C 函数调用**：

  Typing-Game 访问地址触发的是 Inner-NEMU 里的 `mmio_read()`（这是一个 C 函数）。

  Inner-NEMU 访问地址触发的是 Outer-NEMU 里的 `mmio_read()`（这也是一个 C 函数）。

  **每一层都在用 C 代码模拟下一层看到的“物理线路”。**

- **设备更新的“被动性”**：

  内层打字游戏之所以能动，是因为内层 NEMU 在不断执行指令；

  内层 NEMU 之所以能执行指令，是因为外层 NEMU 在不断执行它的指令。

  这种时钟的驱动力是从最外层（Host CPU）一级级透传进去的。

------

<h3> 总结：计算机是个抽象层（套娃版）</h3>

- **对 Typing-Game 而言**：它觉得自己在操作一台 RISC-V 计算机。
- **对 Inner-NEMU 而言**：它觉得自己在操作一台由 AM 提供的虚拟计算机。
- **对 Outer-NEMU 而言**：它觉得自己在运行一个复杂的、不断读写 I/O 的 RISC-V 任务（它根本不知道这个任务其实是另一个模拟器）。

**这种结构完美体现了“计算机系统就是一层又一层的抽象”。只要接口定义（ISA/AM）是严谨的，模拟就可以无限嵌套下去。**



## 读源码/手册

### 宏定义（macro.h ...）

- `#define str_temp(x) #x #define str(x) str_temp(x)`字符串化`#`和连接`##`会阻止宏展开，因此要写两次包起来
- `#define STRLEN(CONST_STR) (sizeof(CONST_STR) - 1)`会在编译时直接算出常量字符串的长度，**提高速度**
- `MUXDEF(macro, X, Y)`多路选择宏定义主要利用宏替换和逗号运算符来实现选择
- `({ reg##_T __io_param; ioe_read(reg, &__io_param); __io_param; })`；利用`({ ... })`这个语句表达式，实现作用域隔离，并把最后一条语句的值返回
- `__IGNORE(...) __KEEP(...) __VA_ARGS`分别表示忽略和保留所有参数
- `SEXT(x, len)`是Sign Extension，取出来时会根据正负在高位补01
- `##__VA_ARGS__`前面的`##`是当为空参数时删掉前面的逗号
- `#define src1R() do { *src1 = R(rs1); } while (0)`这里的`do { } while(0)`是为了在任何语法结构(尤其是`if-else`)中安全使用

### 译码

- `const void * __instpat_end = &&__instpat_end_;`中的`&&__instpat_end_;`为GCC的标签地址拓展功能，使用`goto *__instpat_end;`跳转到`__instpat_end_:`，它可以防止标签（Label）命名冲突
- `pattern_decode`使用强制内联、利用宏定义实现循环展开来优化程序



### 寄存器

x0 / zero 硬连线为 0
x1 / ra 返回地址
x2 / sp 栈指针（Stack pointer）
x3 / gp 全局指针（Global pointer）
x4 / tp 线程指针（Thread pointer）
x5 / t0 临时寄存器
x6 / t1 临时寄存器
x7 / t2 临时寄存器
x8 / s0 / fp 保存寄存器，帧指针（Frame pointer）
x9 / s1 保存寄存器
x10 / a0 函数参数，返回值
x11 / a1 函数参数，返回值
x12 / a2 函数参数
x13 / a3 函数参数
x14 / a4 函数参数
x15 / a5 函数参数
x16 / a6 函数参数
x17 / a7 函数参数
x18 / s2 保存寄存器
x19 / s3 保存寄存器
x20 / s4 保存寄存器
x21 / s5 保存寄存器
x22 / s6 保存寄存器
x23 / s7 保存寄存器
x24 / s8 保存寄存器
x25 / s9 保存寄存器
x26 / s10 保存寄存器
x27 / s11 保存寄存器
x28 / t3 临时寄存器
x29 / t4 临时寄存器
x30 / t5 临时寄存器
x31 / t6 临时寄存器

### GCC扩展内联汇编

格式为`asm [volatile] ("指令" : 输出操作数 : 输入操作数 : 破坏描述符);`

当你手动使用了某个寄存器，或者汇编代码修改了内存，必须通过“破坏描述符”告知编译器，防止它在后续代码中继续使用过时的缓存。

| **约束符** | **含义**           | **备注**                           |
| ---------- | ------------------ | ---------------------------------- |
| **`r`**    | 通用寄存器         | 编译器自动分配一个 `x` 寄存器      |
| **`i`**    | 立即数 (Immediate) | 必须是常数，不能是变量             |
| **`m`**    | 内存操作数         | 直接操作内存地址，不经过寄存器中转 |
| **`=`**    | 只写输出           | 通常用于输出部分                   |
| **`+`**    | 可读可写           | 该变量既是输入又是输出             |

volatile修饰变量时，会使编译器读取该变量时强制从内存中，而不是从寄存器中。这里的作用为：

- 强制编译器必须在生成的可执行文件中保留这段汇编。
- 防止指令重排序



### ELF的结构

**1: ELF文件类型**

ELF文件主要有三种类型，可以通过ELF Header中的`e_type`成员进行区分。

- **可重定位文件（Relocatable File）**：`ETL_REL`。一般为`.o`文件。可以被链接成可执行文件或共享目标文件。静态链接库属于可重定位文件。
- **可执行文件（Executable File）**：`ET_EXEC`。可以直接执行的程序。
- **共享目标文件（Shared Object File）**：`ET_DYN`。一般为`.so`文件。有两种情况可以使用。
  - 链接器将其与其他可重定位文件、共享目标文件链接成新的目标文件；
  - 动态链接器将其与其他共享目标文件、结合一个可执行文件，创建进程映像。

![image-20260116022655781](/notes/pa2/image-20260116022655781.png)



**2: 核心结构概览**

ELF 文件主要由四个部分组成，它们在文件中的布局通常如下：

1. **ELF Header (ELF 头)**：文件的“身份证”和“地图索引”，固定在文件最开头（Offset 0）。
2. **Program Header Table (程序头表)**：决定**运行时**如何加载（Loader 视图）。
3. **Section Header Table (节头表)**：决定**编译链接时**如何组织（Linker 视图）。
4. **Data (具体数据)**：实际的代码（.text）、数据（.data）、符号表（.symtab）等。

![image-20260116022622214](/notes/pa2/image-20260116022622214.png)







------

**3: 关键“类”的设计 (解析器视角)**

如果你要设计一个 ELF 解析器，你需要定义以下几个核心类（或结构体）来映射文件中的二进制数据。

A. `ElfHeader` 类（总管）

这是解析的入口。它告诉你在哪里找到另外两张表（程序头表和节头表）。

- **关键成员变量：**
  - `magic`：魔数 (7F 45 4C 46)，用于校验这是否是个 ELF 文件。
  - `class`：是 32 位还是 64 位程序。
  - `endian`：是大端序还是小端序（解析后续多字节整数时至关重要）。
  - `entry_point`：程序入口的虚拟地址（`_start` 的地址）。
  - **`ph_offset` (Program Header Offset)**：程序头表在文件中的字节偏移量。
  - **`sh_offset` (Section Header Offset)**：节头表在文件中的字节偏移量。
  - `ph_num` & `sh_num`：程序头和节头的数量。
  - `shstrndx`：**节名字符串表**在节头表中的索引（这很关键，否则你读不出 ".text", ".data" 这些名字）。

 B. `SectionHeader` 类（图书管理员）

这是你在 `readelf -S` 中看到的信息。它描述了文件中的每一个“节”（Section）。

- **关键成员变量：**
  - `name_index`：**注意！**这里存的不是字符串 ".text"，而是一个整数。它指向 `.shstrtab` 中的偏移量。
  - `type`：节的类型。
    - `PROGBITS`：程序内容（代码或数据）。
    - `SYMTAB` / `DYNSYM`：符号表。
    - `STRTAB`：字符串表。
    - `NOBITS`：BSS 段（不占文件空间，只占内存）。
  - `flags`：属性（可写 W、可执行 X、可分配内存 A）。
  - `addr`：如果该节需要加载到内存，这里是它的**虚拟地址**（VAddr）。
  - `offset`：该节在**文件中的位置**（File Offset）。
  - `size`：节的大小。

C. `ProgramHeader` 类（搬运工）

这是 OS 加载器（Loader）关心的。它描述了“段”（Segment）。一个 Segment 通常包含多个 Section（比如一个“可读写”的 Segment 可能包含 .data 和 .bss 两个 Section）。

- **关键成员变量：**
  - `type`：段类型。最重要的是 **`LOAD`**（需要加载到内存的段）。
  - `offset`：段在文件中的起始位置。
  - `vaddr`：段映射到内存的**虚拟地址**。
  - `file_size`：在文件里占多少字节。
  - `mem_size`：在内存里占多少字节。
    - **核心逻辑**：如果 `mem_size > file_size`，说明多出来的部分是 BSS（未初始化数据），加载器需要自动填充 0。
  - `flags`：权限（R/W/X）。

D. `SymbolEntry` 类（符号项）

这是解析 `.symtab` 时用到的结构，每一行代表一个变量或函数。

- **关键成员变量：**
  - `name_index`：同样，这里存的是指向 `.strtab`（字符串表）的索引整数。
  - `value`：符号的地址（对于可重定位文件是 offset，对于可执行文件是绝对虚拟地址）。
  - `size`：符号的大小（比如一个 `int` 变量是 4）。
  - `info`：包含两部分信息——
    - **Type**：是函数 (FUNC)、数据对象 (OBJECT) 还是文件 (FILE)。
    - **Binding**：是全局 (GLOBAL) 还是局部 (LOCAL)。
  - `shndx`：该符号定义在第几个 Section 中。

------

**4: ELF 结构的逻辑联系**

为了理解它们是怎么串联起来的，我们看一个简单的逻辑链条：

1. **文件开头**：读取 **ELF Header**，发现文件偏移 `X` 处是 **Section Header Table**。
2. **寻找节名**：跳到 `X` 处读取表项。但表项里的 `sh_name` 只是个数字（偏移量）。
3. **解析名字**：根据 ELF Header 提供的 `e_shstrndx`，找到存放节名字的字符串表（`.shstrtab`），查出这个数字对应的是 ".text"。
4. **定位代码**：在对应的 Section Header 里找到 `sh_offset`，这才是真正的机器指令代码在文件里的具体位置。

![image-20260116023420430](/notes/pa2/image-20260116023420430.png)

------

**5: 常见的 Section 及其含义**

为了方便记忆，你可以参考下表：

| **Section 名称** | **含义**           | **属性**  | **备注**                         |
| ---------------- | ------------------ | --------- | -------------------------------- |
| **.text**        | 已编译的可执行代码 | 只读/执行 | 程序的核心逻辑                   |
| **.rodata**      | 只读数据           | 只读      | 存放 `const` 变量、字符串字面量  |
| **.data**        | 已初始化的全局变量 | 读写      | 占据文件空间                     |
| **.bss**         | 未初始化的全局变量 | 读写      | **不占文件空间**，只在运行时分配 |
| **.symtab**      | 符号表             | 辅助信息  | 链接和调试时使用                 |
| **.strtab**      | 字符串表           | 辅助信息  | 存符号名，与符号表配合使用       |



### 如何判定riscv32调用call 和 ret?

**1: 判断 Call (函数调用)**

只要指令具备 **"Push"** 动作，即代表软件意图进行一次函数调用。

- **使用 JAL 指令时：**
  - 看目标寄存器 $rd$：如果 $rd \in \{x1, x5\}$ ，则判定为 **Call**。
  - *注：此时硬件会将返回地址压入 RAS 栈。*
- **使用 JALR 指令时（对应 Table 3）：**
  - **情况 A：** $rd \in \{x1, x5\}$ 且 $rs1 \notin \{x1, x5\}$。
  - **情况 B：** $rd \in \{x1, x5\}$ 且 $rs1 \in \{x1, x5\}$ 且 $rd = rs1$。
  - **语义：** 只要你想把当前的 PC+4 保存到 x1 或 x5，就是 Call。

**2: 判断 Ret (函数返回)**

只要指令具备 **"Pop"** 动作，即代表软件意图从当前函数返回。

- **必须是 JALR 指令：**
  - **核心特征：** $rd \notin \{x1, x5\}$ 且 $rs1 \in \{x1, x5\}$。
  - **常见形式：** 最典型的就是 `jalr x0, 0(x1)`，即汇编伪指令 `ret`。
  - **语义：** 你正在跳转回之前保存在 x1/x5 里的地址，并且**不打算**保存当前的返回地址（$rd$ 不是 x1/x5）。

**3: 特殊情况：协程切换 (Coroutine Switch)**

- **特征：** $rd \in \{x1, x5\}$ 且 $rs1 \in \{x1, x5\}$，但 **$rd \neq rs1$**。
- **动作：** **Pop, then Push**。
- **判定：** 这既是一次返回（Pop），也是一次新的调用（Push）。

在传统的函数调用中，关系是**不平等**的：主函数（Caller）调用子函数（Callee），子函数运行完就彻底消失，回到主函数。

而**协程**是**平等**的。想象两个函数 A 和 B，它们可以像打乒乓球一样来回切换：

1. A 运行到一半，想换 B 运行，于是 A 记录下自己当前的地址，跳到 B 上次停下的地方。
2. B 运行一会儿，又想换 A 运行，于是 B 记录下自己当前的地址，跳回 A 上次停下的地方。

| **指令类型** | **rd (目标)** | **rs1 (源)** | **rd=rs1?** | **最终判定**              |
| ------------ | ------------- | ------------ | ----------- | ------------------------- |
| **JAL**      | x1 或 x5      | -            | -           | **Call**                  |
| **JALR**     | 非 x1/x5      | **x1 或 x5** | -           | **Ret**                   |
| **JALR**     | **x1 或 x5**  | 非 x1/x5     | -           | **Call**                  |
| **JALR**     | x1 或 x5      | x1 或 x5     | **是**      | **Call （32位远端调用）** |
| **JALR**     | x1 或 x5      | x1 或 x5     | **否**      | **协程切换**              |



### benchmark读取时钟信息的时候, 整个计算机系统究竟发生了什么?

- benchmark调用`io_read(AM_TIMER_UPTIME)`函数，它然后会调用`ioe_read(reg, &__io_param);`，紧接着调用`__am_timer_uptime`函数获取开启`nemu`了多久时间
- `__am_timer_uptime`函数中用`inl(addr)`函数实现，它会`return *(volatile uint32_t *)addr;`，该行代码会被编译为`lw`指令
- `lw`指令会调用`paddr_read(addr, len)`读取内存，它发现该地址不在物理内存`pmem`中，于是会调用`mmio_read(addr, len)`，在设备地址中寻找
- `mmio_read`会先调用`fetch_mmio_map(addr)`找到地址属于哪一个映射块，然后会调用回调函数`rtc_io_handler(offset, len, is_write)`更新时钟的时间（仅offset=4，即当先读高32位时），这个时候`__am_timer_uptime`返回的时间才是最新的





### nemu如何实现定时的？

`nemu/src/device/alarm.c`中

- 用`sigaction(SIGVTALRM, &s, NULL);`更改`SIGVTARM`信号（虚拟定时器期满）的默认行为，让它遍历每一个注册的`add_alarm_handle`的函数，用于更新计时寄存器，屏幕等等
- 用`setitimer(ITIMER_VIRTUAL, &it, NULL);`启动硬件级闹钟，让内核每隔一段CPU时间，发送一次`SIGVTARM`信号
- 使用`ITIMER_VIRTUAL`而不是`ITIMER_REAL`是为了，防止调试时大量信号堆积，普通闹钟计时是显示时间，而虚拟闹钟在断点停下时，进程不再占用CPU，计时也会停止

**整个计时流程为：**

1. **内核计时**：Linux 内核盯着你的进程看，当它运行够了 `1/TIMER_HZ` 秒。
2. **发送信号**：内核朝 NEMU 进程丢一个 `SIGVTALRM`。
3. **强制跳转**：NEMU 无论正在执行什么指令，都会被 Linux 强制中断，跳转到 `alarm_sig_handler`。
4. **执行回调**：`alarm_sig_handler` 挨个调用 `handler[i]()`（比如更新设备状态）。
5. **恢复执行**：处理完后，NEMU 回到刚才被中断的地方继续运行。



### 如何保证使用klib的情况下SDL 依然能找到 glibc 的 malloc？

1. 使用**dlsym**(RTLD)

   ` memcpy_libc = dlsym(RTLD_NEXT, "memcpy");`告诉动态链接器：“不要从头开始找，从当前动态库**之后**的库里去找这个符号”。这样 AM 的底层代码就能跳过 `klib` 定义的 `memcpy`，直接抓到 `glibc`的`memcpy` 指针

2. **makefile 参数**

```makefile
# /ics2025/abstract-machine/Makefile 第 148 行左右
@$(CXX) -o $@ -Wl,--whole-archive $(LINKAGE) -Wl,-no-whole-archive $(LDFLAGS_CXX)
CFLAGS += ... -fvisibility=hidden

# native.mk
LDFLAGS_CXX = $(addprefix -Wl$(comma), $(LDFLAGS)) -pie -ldl $(shell sdl2-config --libs)
```

- 静态链接的“强制包含”：`--whole-archive`:把后面紧跟的库（即你的 `klib`）中**所有的符号**强行塞进最终的可执行文件中，不管这些符号有没有被直接用到。这样，`klib` 里的 `malloc`、`memcpy` 等符号就会在可执行文件的**符号表**中占据优先位置。
- 动态链接的“延迟寻找”：`-ldl` 与 `sdl2-config --libs`:先包含的是你的 `LINKAGE`（klib 等）。最后包含的是 `$(LDFLAGS_CXX)`，其中包含了 `-lSDL2`。当 SDL 库（通常是动态链接库 `.so`）被加载时，它内部对 `malloc` 的调用是**未解析**的。按照 Linux 动态链接的规则，它会优先寻找**主程序**（Executable）提供的符号。
- 关键技巧：符号可见性与 `-fvisibility=hidden`：**AM 和 klib 的函数**在编译时被标记为 `hidden`（隐藏）。这意味着虽然它们被强行链接进了 ELF 文件，但它们**不导出**给动态链接库使用。当 SDL 库寻找 `malloc` 时，它“看不见”主程序里那个被隐藏的`klib_malloc`。SDL 只能继续向后寻找，最终在 `libc.so.6`（glibc）中找到标准的 `malloc`。

3. **总结**

| **访问者**      | **目标符号**  | **最终找到的实现** | **保证机制**                                    |
| --------------- | ------------- | ------------------ | ----------------------------------------------- |
| **AM 用户程序** | `malloc`      | **klib 实现**      | 静态链接时本地符号优先                          |
| **SDL 库 (so)** | `malloc`      | **glibc 实现**     | `klib` 符号被 `hidden` 隐藏，被迫搜索 `libc.so` |
| **platform.c**  | `memcpy_libc` | **glibc 实现**     | 手动通过 `dlsym(RTLD_NEXT)` 越过本地符号寻找    |



### bin文件生成过程是怎么样的？

```makefile
# nemu.mk
insert-arg: image
	@python $(AM_HOME)/tools/insert-arg.py $(IMAGE).bin $(MAINARGS_MAX_LEN) $(MAINARGS_PLACEHOLDER) "$(mainargs)"

image: image-dep
	@$(OBJDUMP) -d $(IMAGE).elf > $(IMAGE).txt
	@echo + OBJCOPY "->" $(IMAGE_REL).bin
	@$(OBJCOPY) -S --set-section-flags .bss=alloc,contents -O binary $(IMAGE).elf $(IMAGE).bin

run: insert-arg
	$(MAKE) -C $(NEMU_HOME) ISA=$(ISA) run ARGS="$(NEMUFLAGS)" IMG=$(IMAGE).bin
```

具体指令

```shell
riscv64-linux-gnu-objcopy -S --set-section-flags .bss=alloc,contents -O binary /home/remain11/ics2025/am-kernels/tests/cpu-tests/build/add-riscv32-nemu.elf /home/remain11/ics2025/am-kernels/tests/cpu-tests/build/add-riscv32-nemu.bin
python /home/remain11/ics2025/abstract-machine/tools/insert-arg.py /home/remain11/ics2025/am-kernels/tests/cpu-tests/build/add-riscv32-nemu.bin 64 the_insert-arg_rule_in_Makefile_will_insert_mainargs_here ""
make -C /home/remain11/ics2025/nemu ISA=riscv32 run ARGS="-l /home/remain11/ics2025/am-kernels/tests/cpu-tests/build/nemu-log.txt" IMG=/home/remain11/ics2025/am-kernels/tests/cpu-tests/build/add-riscv32-nemu.bin
```

**`OBJCOPY` 命令的“点金术”**

这条命令的目的是将 ELF 格式的可执行文件转换成可以在 NEMU 上直接加载的 **纯二进制镜像 (Raw Binary)**。

```bash
@$(OBJCOPY) -S --set-section-flags .bss=alloc,contents -O binary $(IMAGE).elf $(IMAGE).bin
```

- **`-S` (Strip)**：移除所有符号信息和调试信息。这会让镜像变小，因为 NEMU 加载时不需要知道函数名，只需要指令。
- **`-O binary`**：这是最关键的。它剥离了 ELF 的头部信息（那些告诉操作系统如何加载的数据），只留下**连续的机器码和数据**。这样 NEMU 就可以像读磁盘镜像一样，直接把文件 `memcpy` 到 `pmem` 里。
- **`--set-section-flags .bss=alloc,contents` (核心黑魔法)**：
  - **正常情况**：在标准 C 语言中，`.bss` 段（存放未初始化的全局变量）是不占用磁盘空间的，它只在程序运行时由操作系统分配并清零。
  - **这里为什么要改**：因为我们要生成的是 **纯二进制流**。如果 `.bss` 不占空间，那么镜像文件中 `.data` 段之后就直接结束了。但我们的 `insert-arg.py` 脚本需要在镜像中寻找一个占位符。
  - **作用**：这个参数强迫 `objcopy` 把 `.bss` 段也看作是有内容的（contents），并把它**实实在在地写进 `.bin` 文件里**（填充为 0）。
  - **结果**：生成的 `.bin` 文件大小会正好覆盖从代码开始到 `.bss` 结束的所有空间。

**`insert-arg`：如何“黑”进二进制文件**

这段 Makefile 配合 Python 脚本，实现了一个非常巧妙的功能：**在不重新编译代码的情况下，修改程序的启动参数。**

1. **C 代码层**：你在代码里定义了一个非常长的、内容独特的字符串占位符： `char args[64] = "the_insert-arg_rule_in_Makefile_will_insert_mainargs_here";`
2. **编译层**：这个字符串被编译进了二进制镜像中（通常在 `.data` 或被强制包含的 `.bss` 里）。
3. **Python 脚本层 (`insert-arg.py`)**：
   - 它打开生成的 `hello.bin`。
   - 在文件中搜索这个特定的占位符字符串。
   - **原地替换**：将你在命令行输入的 `mainargs="xxx"` 覆盖掉这个占位符。
4. **运行层**：当 NEMU 启动并把 `.bin` 加载到物理内存时，你的 `main` 函数看到的那个 `args` 数组里已经躺着你刚才输入的参数了。

**总结：为什么要这么大费周章？为什么不直接在编译时把参数传进去？**

- **效率**：如果只是换个参数（比如换个 benchmark 的输入），重新链接整个项目是很慢的。通过“二进制补丁”，只需几毫秒就能完成参数注入。
- **模拟器兼容性**：在裸机（Bare-metal）上，没有 Linux 的环境变量表。这种方法模拟了“引导程序（Bootloader）将启动参数放在内存固定位置”的行为。



### 在nemu中运行nemu到底发生了什么？

<h3>1. 触发阶段：命令行传参</h3>

你在 Shell 中输入命令：


```bash
make ARCH=riscv32-nemu mainargs=/path/to/typing-game.bin
```

<h3>2. 配置阶段：Makefile 捕获与注入 (`filelist.mk`)</h3>

构建系统读取 `nemu/src/filelist.mk`：

```makefile
ifdef mainargs
# 关键点 A: 将路径转换为汇编器的宏定义
ASFLAGS += -DBIN_PATH=\"$(mainargs)\"
endif

# 关键点 B: 只有在编译 Target 为 AM 时，才加入 am-bin.S
SRCS-$(CONFIG_TARGET_AM) += src/am-bin.S

# 关键点 C: 强制每次都重新编译 am-bin.S
.PHONY: src/am-bin.S
```


1. 检测到 `mainargs` 存在。
2. `ASFLAGS` 增加了 `-DBIN_PATH="/path/to/typing-game.bin"`。这相当于在汇编代码最顶端写了一句 `#define BIN_PATH "/path/to/typing-game.bin"`。
3. `am-bin.S` 被加入源文件列表 `SRCS`，等待编译。
4. `.PHONY` 保证了即使 `am-bin.S` 文件没改动，每次 `make` 也会强制重新编译它。**这非常重要**，否则你换了 `mainargs`（换了游戏），Make 可能会以为文件没变就不重新打包了。

<h3> 3. 编译阶段：汇编器吞噬文件 (am-bin.S) </h3>

编译器（调用汇编器 `as`）开始处理 `src/am-bin.S`。此时它带着 `ASFLAGS`。

```
.section .rodata
.globl bin_start, bin_end
bin_start:
#ifdef BIN_PATH
.incbin BIN_PATH  /* 预处理后变成: .incbin "/path/to/typing-game.bin" */
#endif
bin_end:
```

- **动作**：汇编器执行 `.incbin` 指令，它像贪吃蛇一样，把 `typing-game.bin` 的**每一个字节**读进来，直接铺设在 `bin_start` 标签之后。
- **产物**：`am-bin.o`。这是一个目标文件，它的 `.rodata` 段里实实在在地包含了打字游戏的全部二进制数据。

<h3> 4. 链接阶段：合体 </h3>

链接器（`ld`）将 `am-bin.o` 与 NEMU 的其他核心组件（`cpu-exec.o`, `decode.o` 等）链接。

- **结果**：生成的 `riscv32-nemu-interpreter-riscv32-nemu.elf`（以及随后的 `.bin`）是一个包含了打字游戏数据的“大”可执行文件。

<h3> 5. 运行时阶段：自我加载 (monitor.c) </h3>

这是 Inner NEMU 启动后的行为（在 AM 环境下运行）。

- **位置**：Inner NEMU 的 `init_monitor` 函数。
- **逻辑**：它不再去读文件（因为它做不到），而是直接读取自己的“肚子里”的数据。

```c
#else // CONFIG_TARGET_AM
static long load_img() {
  extern char bin_start, bin_end;
  size_t size = &bin_end - &bin_start;
  Log("img size = %ld", size);
  memcpy(guest_to_host(RESET_VECTOR), &bin_start, size);
  return size;
}

void am_init_monitor() {
  init_rand();
  init_mem();
  init_isa();
  load_img();
  IFDEF(CONFIG_DEVICE, init_device());
  welcome();
}
#endif
```



## 一些神秘发现（感到惊讶）



### 为什么riscv的指令类型要把立即数切割成几段，甚至是乱序的？

- 核心目标：固定位置的寄存器索引，使rs1、rs2、rd永远固定一个位置
- 立即数的“对齐”与硬件扇出：符号位都在第31位
- B 和 J 类型为什么要“乱序”：为了减少不同指令格式之间的硬件差异，只需要改变信号线走线就可以转换



### riscv的除法指令如何设计的，为什么？

在 RISC-V 架构设计中，除法指令（属于 **M 扩展**，即乘除法扩展）对于除以零和溢出的处理非常独特：**它不会触发硬件陷阱（Trap/Exception），而是返回特定的“默认值”。**

1. **行为定义：发生了什么？**

| **情况**   | **指令**         | **目标寄存器（rd）的结果**  | **备注**                  |
| ---------- | ---------------- | --------------------------- | ------------------------- |
| **除以零** | `div` (有符号)   | **-1** (即位全为 1)         | 0xFFFF...                 |
| **除以零** | `divu` (无符号)  | **最大无符号数** (位全为 1) | 0xFFFF...                 |
| **除以零** | `rem` / `remu`   | **被除数 (Dividend)**       | 原样返回                  |
| **溢出**   | `div` (仅有符号) | **最小负数 (L-min)**        | 如 32位下的 `-2147483648` |
| **溢出**   | `rem`            | **0**                       |                           |

2. **什么是除法溢出？**

在整数除法中，绝大多数情况下结果都会比原数小，不会溢出。**只有一种特殊情况**会导致有符号除法溢出：当“最小负数”除以 “-1” 时，此时超出了表达范围。

3. **为什么要这样设计？**
   - 简化硬件流水线（避免异常路径）
   - 降低软件开销（未定义行为）
   - 简化电路实现（返回全1）



### 为什么使用va_arg(..., long long)读取int值会有问题？

因为 **`va_arg` 本质上是一个粗暴的“内存指针移动和转换”宏**，它完全依赖你提供的类型来解释内存，而不会进行逻辑上的类型转换。

这是一个非常经典且深刻的观察！你捕捉到了 C 语言中**内存布局**与**类型系统**之间最“底层”的碰撞。

你发现的现象（`-1` 变成 `4294967295`）正是因为 **`va_arg` 本质上是一个粗暴的“内存指针移动和转换”宏**，它完全依赖你提供的类型来解释内存，而不会进行逻辑上的类型转换。

**现象背后的根本原因：缺乏符号扩展**

当你调用函数如 `func(-1)` 时，由于 C 语言的**默认参数提升（Default Argument Promotions）**规则，`int` 类型的 `-1` 在栈上通常被存储为 **32 位的补码**：`0xFFFFFFFF`。

当你执行 `va_arg(args, long long)` 时，发生了以下三件事：

1. **内存跨度错位**：`va_arg` 认为参数是 `long long`，所以它会从当前位置直接读取 **64 位**（8字节）的数据。
2. **符号扩展缺失**：`va_arg` 只是简单地把内存里的位（bits）拷贝出来。它并不知道你原本存入的是一个 32 位的负数，因此它不会帮你把 32 位的符号位（1）填充到 64 位的更高位上。
3. **垃圾数据干扰**：它不仅读了原本 `int` 的 4 字节，还会顺便读走紧随其后的 4 字节“邻居”数据。

**为什么正数看起来“没问题”？**

如果你传入的是正数（比如 `1`），其 32 位表示是 `0x00000001`。

- 如果栈上紧邻的下 4 字节恰好全是 `0`（这在调试环境或特定栈布局中很常见），`va_arg` 读到的 64 位就是 `0x0000000000000001`。
- 结果刚好是 `1`。这让你产生了“正数没问题”的错觉，但实际上这纯属**运气好**，依然存在读取越界的风险。

**黄金法则：类型必须严格匹配**

在可变参数中，**传入类型**和**读取类型**必须完全对应。

| **如果传入的是...** | **必须用 va_arg 读取为...**                          |
| ------------------- | ---------------------------------------------------- |
| `int`               | `int`                                                |
| `long long`         | `long long`                                          |
| `double`            | `double` (注意：`float` 会被自动提升为 `double`)     |
| `char` / `short`    | `int` (注意：它们会被自动提升为 `int`，因为内存对齐) |



### 为什么在AM不适合调用正则库？<a id="section1"></a>

**1: 什么是 AM (Abstract Machine)？**

**AM (Abstract Machine)** 是一个“抽象计算机”项目。它的存在是为了解决一个核心问题：**如何让同一个程序（如你写的 `stdio.c` 或一个简单的游戏）在不同的硬件架构（x86, RISC-V, MIPS）和不同的环境（NEMU模拟器, 真机裸机）下都能跑起来？**

在 PA 实验中，AM 扮演了**运行时环境（Runtime Environment）**的角色。可以把它理解为一个“极简版操作系统接口”：

- **TRM (Turing Machine)**：最基础的部分，提供内存、指令执行和 `putch`（打印字符）/ `halt`（停机）。
- **IOE (I/O Extension)**：管理设备，比如键盘、显示器。
- **klib (Kernel Library)**：这是正在编写的地方。由于裸机没有 Linux 提供的 `libc`，AM 让你自己实现一套简化版的 `printf`, `memcpy` 等函数，供上层程序使用。

------

**2: 为什么裸机环境不宜引入 `regex.h`？**

你在编译时遇到的 `undefined reference` 错误，是因为 `regex.h` 本质上是 **POSIX 标准** 的一部分，而裸机环境几乎不具备支持它的条件。

**原因一：依赖重型的 OS 支撑**

`regex.h` 提供的 `regcomp` 和 `regexec` 不是独立的数学逻辑，它们底层通常依赖：

- **动态内存分配 (`malloc`/`free`)**：正则引擎需要构建复杂的 NFA/DFA 状态机，这必须在运行时申请大量内存。在 AM 的 `klib` 中，你可能还没实现好 `malloc`，或者内存管理极其有限。
- **文件系统与库链接**：标准的 `regex` 实现通常在 `libc.so` 或 `glibc` 中。在裸机交叉编译时，链接器找不到这些已经编译好的二进制实现。

**原因二：代码膨胀 (Code Bloat)**

一个完整的 POSIX 正则引擎实现非常庞大（通常几千行甚至上万行代码）。

- **裸机资源有限**：裸机程序的二进制文件（.bin）通常直接加载到物理内存。引入一个正则库会让你的 `hello-world` 变成一个庞然大物，甚至超过模拟器的内存限制。
- **违背设计初衷**：PA 实验的目的是让你理解底层原理。用正则去解析 `printf` 的格式字符串，就像是用“波音 747 引擎来驱动自行车”。

**原因三：不可预测的性能**

正则匹配的执行时间是不确定的（某些正则甚至会导致回溯攻击带来的死循环）。在底层嵌入式或内核开发中，我们追求的是**确定性**和**高效率**。



### 为什么设置_pmem_start=0x80000000？而不是其他数字

1. PC被初始化成`0x80000000`，因此需要从这里开始，bin文件拷贝在`pmem`数组中，这刚好是第一条指令的地址
2. 访问全局变量或静态本地变量时，会用到绝对地址，这个地址需要需要对应上`pmem`数组



## 参考

[Gemini:makefile语法疑问解答](https://gemini.google.com/share/3cc7bd083365)

[Gemini:riscv疑问](https://gemini.google.com/share/a843935800da)

[Gemini:va_args疑问](https://gemini.google.com/share/854663a30742)

[Gemini:正则匹配疑问](https://gemini.google.com/share/f67481140648)

[ELF文件结构](https://chuquan.me/2018/05/21/elf-introduce/)
