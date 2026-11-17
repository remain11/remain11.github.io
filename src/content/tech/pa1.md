---
title: "PA1：NEMU 与表达式求值"
description: "从状态机视角理解程序运行，实现单步执行、内存扫描与表达式求值。"
date: 2026-01-27
tags: [PA, NEMU, C]
---
## 实验进度

- 尝试使用了`ccache`，`export PATH="/usr/lib/ccache:$PATH" && ccache --set-config=max_size=5G`

- 使用clangd+bear配置函数、变量跳转

  ```shell
  sudo apt-get install clangd bear
  code nemu
  make clean
  bear -- make
  # 使用vscode 打开 nemu/ 在 nemu/.vscode/setting.json
  
  {   
      "clangd.detectExtensionConflicts": true,
      "clangd.path": "/usr/bin/clangd",
      "clangd.arguments": [
          "--background-index",
          "--compile-commands-dir=${workspaceFolder}",
          // 同时开启的任务数量
          "-j=12",
          // 全局补全（会自动补充头文件）
          "--all-scopes-completion",
          // 更详细的补全内容
          "--completion-style=detailed",
          // Include what you use
          "--header-insertion=iwyu",
          // pch优化的位置 disk memory
          "--pch-storage=memory",
          "--cross-file-rename",
          "--enable-config",
          // clang-format style to apply by default when no .clang-format file is found
          "--fallback-style=WebKit",
          "--pretty",
          "--clang-tidy",
          "--query-driver=clang++",
      ]
  }
  ```

- 使用lldb调试

  - `sudo apt-get install lldb`

  - vscode下载codelldb插件

  - ```json
    // launch.json
    
    {
        "version": "0.2.0",
        "configurations": [
            {
                "name": "C/C++: gcc build and debug active file",
                "preLaunchTask": "build",
                "type": "lldb",
                "request": "launch",
                "program": "${workspaceFolder}/build/riscv32-nemu-interpreter",
                "args": [],
                "cwd": "${workspaceFolder}",
            },
            {
                "name": "C/C++: gcc build and debug current file",
                "type": "lldb",
                "request": "launch",
                "program": "${fileDirname}/${fileBasenameNoExtension}",
                "args": [],
                "cwd": "${workspaceFolder}",
                "preLaunchTask": "C/C++: gcc build active file",
            }
        ]
    }
    
    // tasks.json
    
    {
        "version": "2.0.0",
        "tasks": [
            {
                "label": "build",
                "type": "shell",
                "command": "make"
            },
            {
                "label": "C/C++: gcc build active file",
                "type": "shell",
                "command": "gcc -g -o \"${fileDirname}/${fileBasenameNoExtension}\" \"${file}\"",
            }
        ]
    }
    ```
    
  - 完成了PA1的所有内容



# 必答题

## 程序是个状态机

[Ctrl+左键跳转到PA1.1 Q2.](#section1)



## 理解基础设施

- 花费时间为：$500\times90\% \times 30 \times 20 = 270000$，共75个小时。
- 如果获取信息时间变为10s，那将节省37.5个小时
- 如果10分钟解决一个bug，那么在450个bug的情况下，花费时间仍然是75小时



## RTFM（riscv32）

**指令格式**：指令共6种，并且均为32位长。

- rs：source register，源寄存器
- rd：destination register，目的寄存器
- opcode：操作码，用于标识是什么类型的指令
- funct：函数，不同函数码对应不同函数
- imm：立即数

![image-20260102054837565](/notes/pa1/image-20260102054837565.png)

**LUI**：<u>L</u>oad <u>U</u>pper <u>I</u>mmediate，通常用于构建32位常量，它将 20 位常量加载到寄存器的高 20 位，同时将低12位归零。

**mstatus**：是八个控制状态寄存器之一，是用于机器模式处理异常的必要部分。

- UIE：User Interrupt Enable)，用户模式中断使能位，**总开关**

- SIE：Supervisor Interrupt Enable，监督模式中断使能位
- MIE：Machine Interrupt Enable，机器模式中断使能位
- UPIE：User Previous Interrupt Enable，用户模式之前的中断使能位
- SPIE：Supervisor Previous Interrupt Enable
- MPIE：Machine Previous Interrupt Enable
- SPP：Supervisor Previous Privilege，监督模式之前的特权级别位，用于保存进入异常前的特权级别
- MPP：Machine Previous Privilege
- FS：Floating-Point Status，浮点状态位，用于指示浮点寄存器的状态
- XS：Extension Status，扩展状态位
- MPRV：Modify Privilege，修改特权位，用于指示内存访问的特权级别
- SUM：Supervisor User Memory Access，监督模式用户内存访问位，允许监督模式访问用户模式的内存
- MXR：Make eXecutable Readable，可执行位，使可执行页也可读
- TVM：Trap Virtual Memory，虚拟内存陷阱位，用于指示是否在监督模式下陷入虚拟内存管理指令
- TW：Timeout Wait，等待超时位，用于指示在监督模式下是否允许 wfi 指令
- TSR：Trap SRET，陷入 SRET 位，用于指示在监督模式下是否允许 sret 指令
- SD：Supervisor Dirty，监督模式脏位。当设置为 1 时，表示浮点寄存器或扩展寄存器的状态已被修改



![image-20260102063838406](/notes/pa1/image-20260102063838406.png)

## shell命令

```shell
find $NEMU_HOME -regex '.*\.[c|h]' | xargs cat | wc -l # 统计行数
find $NEMU_HOME -regex '.*\.[c|h]' | xargs grep -v '^$' | wc -l # 统计非空行
```

- .c和.h文件共267411行
- 去掉空行为231092行
- make count指令在下，目前多了601行

```makefile
## native.mk
count: 
	@if [ -z "$(branch)" ]; then \
		echo "Usage: make count branch=<branch_name>"; \
		exit 1; \
	fi
	@now_branch=$$(git branch --show-current); \
	now_cnt=$$(find "$(NEMU_HOME)" -name "*.c" -o -name "*.h" | xargs cat | wc -l); \
	git checkout "$(branch)"; \
	search_cnt=$$(find "$(NEMU_HOME)" -name "*.c" -o -name "*.h" | xargs cat | wc -l); \
	git checkout "$$now_branch"; \
	echo "Current branch: $$now_branch, lines of code: $$now_cnt"; \
	echo "Search branch: $(branch), lines of code: $$search_cnt"; \
	echo "Difference: $$((now_cnt - search_cnt)) lines"
```



## RTFM（编译选项）

- -Wall开起了“绝大多数情况下都是错误”的警告集合（变量未初始化就使用、函数没有返回值、除0等等），这些警告是最基础也是最重要的一批。开启它能够在编译期就能够发现问题
- -Werror意味着把warning直接当做error，没有解决waring就没办法成功编译。



# PA1.1

## Q1.尝试理解计算机如何计算

计算机通过一条条简单的指令，和寄存器、ALU等运算单元配合完成计算。





## Q2.从状态机视角理解程序运行<a id="section1"></a>

```asm
// PC: instruction    | // label: statement
0: mov  r1, 0         |  pc0: r1 = 0;
1: mov  r2, 0         |  pc1: r2 = 0;
2: addi r2, r2, 1     |  pc2: r2 = r2 + 1;
3: add  r1, r1, r2    |  pc3: r1 = r1 + r2;
4: blt  r2, 100, 2    |  pc4: if (r2 < 100) goto pc2;   // branch if less than
5: jmp 5              |  pc5: goto pc5;
```

状态机

`(0, x, x) -> (1, 0, x) -> (2, 0, 0) -> (3, 0, 1) -> (4, 1, 1) -> (2, 1, 1) -> (3, 1, 2) -> (4, 3, 2) -> (2, 3, 2) -> ...... -> (3, 4851, 99) -> (4, 4950, 99) -> (2, 4950, 99) -> (3, 4950, 100) -> (4, 5050, 100) -> (5, 5050, 100) -> (5, 5050, 100) -> ...`



## Q3.理解框架代码



## Q4.优美地退出

`make run`后会执行`$(call git_commit, "run NEMU") $(NEMU_EXEC)`即

```makefile
git add /home/remain11/ics2025/nemu/.. -A --ignore-errors
while (test -e .git/index.lock); do sleep 0.1; done
(echo ">  "compile NEMU"" && echo 2205010211 江建谕 && uname -a && uptime) | git commit -F - -q --author='tracer-ics2025 <tracer@njuics.org>' --no-verify --allow-empty
sync
git add /home/remain11/ics2025/nemu/.. -A --ignore-errors
while (test -e .git/index.lock); do sleep 0.1; done
(echo ">  "run NEMU"" && echo 2205010211 江建谕 && uname -a && uptime) | git commit -F - -q --author='tracer-ics2025 <tracer@njuics.org>' --no-verify --allow-empty
sync
/home/remain11/ics2025/nemu/build/riscv32-nemu-interpreter --log=/home/remain11/ics2025/nemu/build/nemu-log.txt  
```

第二个返回值为非0，因此报错

```shell
make: *** [/home/remain11/ics2025/nemu/scripts/native.mk:38: run] Error 1
```

`state.c`中

```plaintext
int is_exit_status_bad() {
  int good = (nemu_state.state == NEMU_END && nemu_state.halt_ret == 0) ||
    (nemu_state.state == NEMU_QUIT);
  return !good;
}
```

因此在`sdb.c`中加上

```c
static int cmd_q(char *args) {
    nemu_state.state = NEMU_QUIT;
    return -1;
}
```



## Q5. 实现单步执行, 打印寄存器, 扫描内存

**单步执行**

```c
// sdb.c
static int cmd_si(char *args) {
  int cnt = 1;
  if (args != NULL) sscanf(args, "%d", &cnt);
  cpu_exec(cnt);
  return 0;
}
```

**扫描寄存器**

查看`reg.h`中的函数可以写出

```c
// sdb.c
static int cmd_info(char *args) {
  char op[10];
  sscanf(args, "%s", op);
  if (op[0] == 'r') {
    isa_reg_display();
  }
  if (op[0] == 'w') {
    TODO();
  } 
  return 0;
}
// reg.c
void isa_reg_display() {
  for (int i = 0; i < 32; i++) {
    printf("%-18s0x%-18x%-18u\n", reg_name(i), gpr(i), gpr(i));
  }
}

word_t isa_reg_str2val(const char *s, bool *success) {
  for (int i = 0; i < 32; i++) {
    // regs or $regs
    if (strcmp(s, regs[i]) == 0 || strcmp(s + 1, regs[i]) == 0) {
      *success = true;
      return gpr(i);
    }
  }
  *success = false;
  return 0;
}
```

**扫描内存**

- 这里规定了表达式为十六进制数，因此我们只需要将字符串转换成数字。
- 阅读`paddr.c`中的函数，利用`paddr_read`实现

```c
// sdb.c
static int cmd_x(char *args) {
  int n;
  sscanf(args, "%d", &n);
  strtok(NULL, " ");
  args = args + strlen(args) + 1;
  bool success;
  paddr_t address = expr(args, &success);
  for (int i = 0; i < n; i++) {
    if (i % 4 == 0) printf("0x%016x: ", address);
    printf("0x%08x ", paddr_read(address + i, 4));
    if (i % 4 == 3 || i == n - 1) printf("\n");
  }
  return 0;
}
// expr.c
word_t expr(char *e, bool *success) {
  word_t res = 0;
  sscanf(e, "%x", &res);
  return res;
  if (!make_token(e)) {
    *success = false;
    return 0;
  }
  /* TODO: Insert codes to evaluate the expression. */
  TODO();

  return 0;
}

```



# PA1.2



## Q1.实现算术表达式的词法分析

为了处理超过`32`位的大整数，我们修改一下`Token`类，用`Union`存放动态指针。

```c
// expr.c

static struct rule {
  const char *regex;
  int token_type;
} rules[] = {

  /* TODO: Add more rules.
   * Pay attention to the precedence level of different rules.
   */

  {" +", TK_NOTYPE},    // spaces
  {"[0-9]+", TK_INT},   // integer
  {"\\+", '+'},         // plus
  {"-", '-'},           // subtract
  {"\\*", '*'},           // multiply
  {"/", '/'},           // divide
  {"\\(", '('},           // left parenthesis
  {"\\)", ')'},           // right parenthesis
  {"==", TK_EQ},        // equal
};


typedef struct token {
  int type;
  union {
    char static_str[32];
    char *dynamic_str;
  } str_data;
  bool is_dynamic;
} Token;

static bool make_token(char *e) {
  int position = 0;
  int i;
  regmatch_t pmatch;
  // delete str_data
  for (i = 0; i < nr_token; i++) {
    if (tokens[i].is_dynamic) {
      tokens[i].is_dynamic = false;
      free(tokens[i].str_data.dynamic_str);
    }
  }
  nr_token = 0;

  while (e[position] != '\0') {
    /* Try all rules one by one. */
    for (i = 0; i < NR_REGEX; i++) {
      if (regexec(&re[i], e + position, 1, &pmatch, 0) == 0 && pmatch.rm_so == 0) {
        char *substr_start = e + position;
        int substr_len = pmatch.rm_eo;

        Log("match rules[%d] = \"%s\" at position %d with len %d: %.*s",
            i, rules[i].regex, position, substr_len, substr_len, substr_start);

        position += substr_len;

        /* TODO: Now a new token is recognized with rules[i]. Add codes
         * to record the token in the array `tokens'. For certain types
         * of tokens, some extra actions should be performed.
         */

        switch (rules[i].token_type) {
          case TK_NOTYPE:
            break;
          case '+': case '*': case '/': case '-': case '(': case ')' : case TK_INT:
            tokens[nr_token].type = rules[i].token_type;
            if (rules[i].token_type == TK_INT) {
              if (substr_len >= 31) {
                tokens[nr_token].is_dynamic = true;
                tokens[nr_token].str_data.dynamic_str = (char*)malloc(2 * substr_len * sizeof(char));
                memcpy(tokens[nr_token].str_data.dynamic_str, substr_start, substr_len);
                tokens[nr_token].str_data.dynamic_str[substr_len] = '\0';
              } else {
                memcpy(tokens[nr_token].str_data.static_str, substr_start, substr_len);
                tokens[nr_token].str_data.static_str[substr_len] = '\0';
              }
            }
            nr_token++;
            break;
          case TK_EQ:
            TODO();
            break;
          default: TODO();
        }

        break;
      }
    }

    if (i == NR_REGEX) {
      printf("no match at position %d\n%s\n%*.s^\n", position, e, position, "");
      return false;
    }
  }

  return true;
}
```

## Q2.实现算术表达式的递归求值

```c
// expr.c
enum {
  BAD_EXPRESSION = 1, PARENTHESES_NOT_MATCH, DIVIDE_ZERO
};

bool check_parentheses(int p, int q, int *flag) {
  // test whether the parentheses are matched or not
  int cnt_left_parentheses = 0, cnt_right_parenthese = 0;
  for (int i = p; i <= q; i++) {
    if (tokens[i].type == '(') {
      cnt_left_parentheses++;
    } else if (tokens[i].type == ')') {
      cnt_right_parenthese++;
    }
    if (cnt_right_parenthese > cnt_left_parentheses) {
      // the parentheses are not matched
      *flag = PARENTHESES_NOT_MATCH;
      Log("PARENTHESES_NOT_MATCH: between token %d and %d.", p, q);
      return true;
    }
  }
  if (cnt_left_parentheses != cnt_right_parenthese) {
    // the parentheses are not matched
    *flag = PARENTHESES_NOT_MATCH;
    Log("PARENTHESES_NOT_MATCH: between token %d and %d.", p, q);
    return true;
  }
  if (tokens[p].type != '(' || tokens[q].type != ')') return false;
  // the parentheses are matched
  // [p + 1, q - 1]
  cnt_left_parentheses = cnt_right_parenthese = 0;
  for (int i = p + 1; i <= q - 1; i++) {
    if (tokens[i].type == '(') {
      cnt_left_parentheses++;
    } else if (tokens[i].type == ')') {
      cnt_right_parenthese++;
    }
    if (cnt_right_parenthese > cnt_left_parentheses) {
      // the parentheses are not matched
      return false;
    }
  }
  return true;
}


// ⚠️: flag should be initialized to equal 0
word_t eval(int p, int q, int *flag) {
  
  // Failed to eval
  if (*flag > 0) return 0;

  if (p > q) {
    /* Bad expression */
    *flag = BAD_EXPRESSION;
    Log("BAD_EXPRESSION.");
    return 0;
  }
  else if (p == q) {
    /* Single token.
     * For now this token should be a number.
     * Return the value of the number.
    */
    word_t res;
    if (tokens[p].is_dynamic) {
      if (tokens[p].type == TK_HEX_INT) {
        sscanf(tokens[p].str_data.dynamic_str, "%x", &res);
      } else {
        sscanf(tokens[p].str_data.dynamic_str, "%u", &res);
      }
    } else {
      if (tokens[p].type == TK_HEX_INT) {
        sscanf(tokens[p].str_data.static_str, "%x", &res);
      } else {
        sscanf(tokens[p].str_data.static_str, "%u", &res);
      }
    }
    return res;
  }
  else if (check_parentheses(p, q, flag) == true) {
    /* The expression is surrounded by a matched pair of parentheses.
     * If that is the case, just throw away the parentheses.
    */
    return eval(p + 1, q - 1, flag);
  } else {
    // find the position of master operation in the token expression
    int pos = -1;
    int cnt_parenthese = 0;
    for (int i = p; i <= q; i++) {
      // calculate cnt_parenthese
      int type = tokens[i].type;
      if (type == '(') {
        cnt_parenthese++;
      } else if (type == ')') {
        cnt_parenthese--;
      }

      // in parenthese, so continue
      if (cnt_parenthese > 0) continue;

      // '+' '-' '*' '/' operation
      if (type == '+' || type == '-') {
          pos = i;
      } else if (type == '*' || type == '/') {  
        if (pos == -1 || tokens[pos].type == '*' || tokens[pos].type == '/') {
          pos = i;
        }
      }
    }
    if (pos == -1) {
      /* Bad expression */
      *flag = BAD_EXPRESSION;
      Log("BAD_EXPRESSION.");
      return 0;
    }
    word_t val1 = eval(p, pos - 1, flag);
    word_t val2 = eval(pos + 1, q, flag);
    switch (tokens[pos].type) {
      case '+': return val1 + val2;
      case '-': return val1 - val2;
      case '*': return val1 * val2;
      case '/': 
        if (val2 == 0) {
          Log("DIVIDE_ZERO: Try to use tokens [%d ~ %d] divide tokens [%d ~ %d], while encounter zero(0).", 
            pos + 1, q, p, pos - 1);
          *flag = DIVIDE_ZERO;
          return 0;
        }
        return val1 / val2;
      default: assert(0);
    }
  }
}

word_t expr(char *e, bool *success) {
  *success = true;
  if (!make_token(e)) {
    *success = false;
    return 0;
  }
  /* TODO: Insert codes to evaluate the expression. */
  int flag = 0;
  word_t res = eval(0, nr_token - 1, &flag);
  if (flag > 0) {
    *success = false;
    return 0;
  }
  return res;
}

// sdb.c
static int cmd_p(char *args) {
  bool success;
  uint32_t res = expr(args, &success);
  if (success == true) {
    printf("%u\n", res);
  } else {
    printf("expression[%s] is invaild.\n", args);
  }
  return 0;
}
```



## Q3.实现带有负数的算术表达式的求值 (选做)

| 前      | 后        |
| ------- | --------- |
| + - * / | 数字      |
| (       | ( 数字    |
| )       | ) + - * / |
| 数字    | + - * / ) |

显然，在`+ - * /`后只能先接数字。在`(`后可能是数字，也可能是`(`。而在数字后我们只能接`+ - * / )`。因此我们只需要改变一下正则匹配顺序即可。

```diff
@@ -45,7 +45,7 @@ 
static struct rule {
 
   {" +", TK_NOTYPE, ANSI_FG_WHITE},    // spaces
   {"0x[0-9abcdef]+|0X[0-9ABCDEF]+", TK_HEX_INT, ANSI_FG_MAGENTA}, // hexadecimal integer
-  {"[0-9]+", TK_DEC_INT, ANSI_FG_MAGENTA},   // decimal integer
+  {"-?[0-9]+", TK_DEC_INT, ANSI_FG_MAGENTA},   // decimal integer
   {"\\+", '+', ANSI_FG_RED},         // plus
   {"-", '-', ANSI_FG_YELLOW},           // subtract
   {"\\*", '*', ANSI_FG_CYAN},           // multiply
@@ -90,18 +90,18 @@ 
static int nr_token __attribute__((used))  = 0;
 
 static bool make_token(char *e) {
   int position = 0;
-  int i;
+  int i, j;
   regmatch_t pmatch;
+  bool last_is_num = false;
+  bool last_is_right_parenthesis = false;

   nr_token = 0;
-
   while (e[position] != '\0') {
     /* Try all rules one by one. */
-    for (i = 0; i < NR_REGEX; i++) {
+    for (i = (last_is_num || last_is_right_parenthesis ? 3: 0), j = 0 ; j < NR_REGEX; i = (i + 1) % NR_REGEX, j++) {
       if (regexec(&re[i], e + position, 1, &pmatch, 0) == 0 && pmatch.rm_so == 0) {
         char *substr_start = e + position;
         int substr_len = pmatch.rm_eo;
         Log("match rules[%d] = %s\"%s\"%s at position %d with len %d: %.*s", 
             i, rules[i].color, rules[i].regex, ANSI_FG_BLUE, position, substr_len, substr_len, substr_start);
 
@@ -118,13 +124,18 @@ 
static bool make_token(char *e) {
           case '+': case '*': case '/': case '-': case '(': case ')' : case TK_DEC_INT: case TK_HEX_INT:
             tokens[nr_token].type = rules[i].token_type;
             if (rules[i].token_type == TK_DEC_INT || rules[i].token_type == TK_HEX_INT) {
-              if (substr_len >= 32) {
+              last_is_num = true;
               if (substr_len >= 31) {
                 tokens[nr_token].is_dynamic = true;
                 tokens[nr_token].str_data.dynamic_str = (char*)malloc(2 * substr_len * sizeof(char));
                 memcpy(tokens[nr_token].str_data.dynamic_str, substr_start, substr_len);
                 tokens[nr_token].str_data.dynamic_str[substr_len] = '\0';
               } else {
                 memcpy(tokens[nr_token].str_data.static_str, substr_start, substr_len);
                 tokens[nr_token].str_data.static_str[substr_len] = '\0';
               }
+            } else {
+              last_is_num = false;
             }
+             if (rules[i].token_type == ')') {
+              last_is_right_parenthesis = true;
+            } else {
+              last_is_right_parenthesis = false;
+            }
             nr_token++;
             break;

```

##  Q4.实现表达式生成器

踩了亿些坑，主要是编译器除0，和前面`eval`函数没有实现好的原因。

```c
// gen-expr.c
int idx;
unsigned int up = -1;

void gen(char c) {
  buf[idx++] = c;
}

void gen_num(unsigned int x) {
  if (x < 10) {
    gen(x + '0');
    // 表示 unsigned int 常量
    return;
  } 
  gen_num(x / 10);
  gen_num(x % 10);
}

void gen_rand_op() {
  int op = rand() % 4;
  if (op == 0) gen('+');
  if (op == 1) gen('-');
  if (op == 2) gen('*');
  if (op == 3) gen('/'); 
}

uint32_t choose(uint32_t n){
  return rand() % n;
}

static void gen_rand_expr() {
  int op = rand() % 3;
  if (idx >= 30000) op = 0;
  switch (op) {
    case 0: gen_num(choose(up)), gen('u');; break;
    case 1: gen('('); gen_rand_expr(); gen(')'); break;
    default: gen_rand_expr(); gen_rand_op(); gen_rand_expr(); break;
  }
}

int main(int argc, char *argv[]) {
  srand(time(0));
  int loop = 1;
  if (argc > 1) {
    sscanf(argv[1], "%d%u", &loop, &up);
  }
  int i;
  for (i = 0; i < loop; i ++) {
    idx = 0;
    gen_rand_expr();
    gen('\0');

    sprintf(code_buf, code_format, buf);

    FILE *fp = fopen("/tmp/.code.c", "w");
    assert(fp != NULL);
    fputs(code_buf, fp);
    fclose(fp);

    int ret = system("gcc -Wall -Wextra -Werror=div-by-zero -Wno-overflow /tmp/.code.c -o /tmp/.expr");
    if (ret != 0) continue;

    fp = popen("/tmp/.expr", "r");
    assert(fp != NULL);

    int result;
    ret = fscanf(fp, "%d", &result);
    pclose(fp);

    if (ret == 1) printf("%u %s\n", result, buf);
  }
  return 0;
}
```

然后其他地方做的修改

```diff
@@ -20,6 +20,25 @@ 
void init_monitor(int, char *[]);
 void am_init_monitor();
 void engine_start();
 int is_exit_status_bad();
+word_t expr(char *e, bool *success);
+
+void test_expr() {
+  char *e = (char*)malloc(65536 * sizeof(char));
+  bool success;
+  FILE*fp = fopen("/home/remain11/ics2025/nemu/tools/gen-expr/build/input2", "r");
+  word_t res;
+  int cnt = 0;
+  while(~fscanf(fp, "%u %s", &res, e)) {
+    cnt++;
+    word_t ret = expr(e, &success);
+    if (ret != res || success == false) {
+      panic("Failed on expr test %d. expression[%s]'s answer is %u, but yours is %u. State is %d", cnt, e, res, ret, success);
+    }
+    Log("Pass expr test %d.", cnt);
+  }
+  fclose(fp);
+  free(e);
+}
 
@@ -30,6 +49,6 @@ 
int main(int argc, char *argv[]) {
 #endif
   /* Start engine. */
   engine_start();
-
+  // test_expr();
   return is_exit_status_bad();
 }
 

--- a/nemu/src/monitor/sdb/expr.c
+++ b/nemu/src/monitor/sdb/expr.c
@@ -30,7 +30,7 @@ 
enum {
   TK_NOTYPE = 256, TK_EQ, 
 
   /* TODO: Add more token types */
-  TK_DEC_INT, TK_HEX_INT
+  TK_DEC_INT, TK_HEX_INT, TK_CONSTANT_SUFFIX
 };
 
 static struct rule {
@@ -53,6 +53,7 @@ 
static struct rule {
   {"\\(", '(', ANSI_FG_WHITE},           // left parenthesis
   {"\\)", ')', ANSI_FG_WHITE},           // right parenthesis
   {"==", TK_EQ, ANSI_FG_WHITE},        // equal
+ {"u|U|ll|LL|ull|ULL|ul|UL|l|L", TK_CONSTANT_SUFFIX, ANSI_FG_WHITE}
 };
 
 #define NR_REGEX ARRLEN(rules)
@@ -120,7 +121,7 @@ 
static bool make_token(char *e) {
         switch (rules[i].token_type) {
-          case TK_NOTYPE:
+          case TK_NOTYPE: case TK_CONSTANT_SUFFIX:
             break;
           case '+': case '*': case '/': case '-': case '(': case ')' : case TK_DEC_INT: case TK_HEX_INT:
             tokens[nr_token].type = rules[i].token_type;
```



# PA1.3



## Q1.扩展表达式求值的功能

**运算顺序**

| 优先级 | 运算符 | 名称     |
| ------ | ------ | -------- |
| 1      | ()     | 圆括号   |
| 2      | \*     | 取值     |
| 2      | -      | 负       |
| 2      | !      | 逻辑非   |
| 2      | \~     | 按位取反 |
| 3      | /      | 除       |
| 3      | \*     | 乘       |
| 3      | %      | 取模     |
| 4      | +      | 加       |
| 4      | -      | 减       |
| 5      | <<     | 左移     |
| 5      | >>     | 右移     |
| 6      | >=     | 大于     |
| 6      | <=     | 小于等于 |
| 7      | ==     | 等于     |
| 7      | !=     | 不等于   |
| 6      | >      | 大于等于 |
| 6      | <      | 小于     |
| 11     | &&     | 逻辑与   |
| 8      | &      | 按位与   |
| 9      | ^      | 按位异或 |
| 12     | \|\|   | 逻辑或   |
| 10     | \|     | 按位或   |


- 按照手册类似的写法，重构了整个逻辑。
- 加入位运算后，为了防止未定义行为，位移数只能是0~31，因此我们加入`-Werror=shift-count-overflow -Werror=shift-count-negative`
- 如果`^ bool`，即按位取反一个bool值，它将会永远为真，不是未定义行为
- 按照手册要求，所有运算类型的结果都是`unsigned int`，可是关系运算符和逻辑运算符的结果都为`int`，这可能会导致测试失败。

```c
enum {
  TK_NOTYPE = 256, TK_EQ, 

  /* TODO: Add more token types */
  TK_DEC_INT, TK_HEX_INT, TK_CONST_SUF, 
  TK_DER, TK_NEG, TK_LSHI, TK_RSHI, TK_GE, TK_LE,
  TK_AND, TK_OR, TK_REG, TK_NOTEQ
};

static struct rule {
  const char *regex;
  int token_type;
  const char *color;
  int priority;
} rules[] = {

  /* TODO: Add more rules.
   * Pay attention to the precedence level of different rules.
   */
  // Other : WHITE
  {"u|U|ll|LL|ull|ULL|ul|UL|l|L", TK_CONST_SUF, ANSI_FG_WHITE}, // constant suffix
  {" +", TK_NOTYPE, ANSI_FG_WHITE},    // spaces
  
  {"\\(", '(', ANSI_FG_WHITE, 1},           // left parenthesis
  {"\\)", ')', ANSI_FG_WHITE, 1},           // right parenthesis
  // Digit : MAGENTA
  {"\\$\\$?\\w+", TK_REG, ANSI_FG_MAGENTA}, //registers
  {"0x[0-9abcdef]+|0X[0-9ABCDEF]+", TK_HEX_INT, ANSI_FG_MAGENTA}, // hexadecimal integer
  {"[0-9]+", TK_DEC_INT, ANSI_FG_MAGENTA},   // decimal integer
  
  // Other single operator : RED
  // Arithmetic operator : YELLOW
  // Logic, Relational operator : CYAN
  // Bitwise operator : GREEN
  
  //special
  {"!=", TK_NOTEQ, ANSI_FG_CYAN, 7}, // not equal
  // single operator
  {"\\*", TK_DER, ANSI_FG_RED, 2}, // derefence
  {"-", TK_NEG, ANSI_FG_RED, 2}, // negative
  {"!", '!', ANSI_FG_CYAN, 2}, // not
  {"~", '~', ANSI_FG_GREEN, 2}, // bitwise not
  
  // double operator
  {"\\*", '*', ANSI_FG_YELLOW, 3},           // multiply
  {"/", '/', ANSI_FG_YELLOW, 3},           // divide
  {"%", '%', ANSI_FG_YELLOW, 3},           // mod
  {"\\+", '+', ANSI_FG_YELLOW, 4},         // plus
  {"-", '-', ANSI_FG_YELLOW, 4},           // subtract

  {"<<", TK_LSHI, ANSI_FG_GREEN, 5}, // left shift
  {">>", TK_RSHI, ANSI_FG_GREEN, 5}, // right shift
  {"\\^", '^', ANSI_FG_GREEN, 9}, // bitwise xor
  
  {">=", TK_GE, ANSI_FG_CYAN, 6}, // greater thar or equal to
  {"<=", TK_LE, ANSI_FG_CYAN, 6}, 
  {"==", TK_EQ, ANSI_FG_CYAN, 7},        // equal
  {">", '>', ANSI_FG_CYAN, 6},
  {"<", '<', ANSI_FG_CYAN, 6},
  {"&&", TK_AND, ANSI_FG_CYAN, 11}, // and
  {"\\|\\|", TK_OR, ANSI_FG_CYAN, 12}, // or
  
  {"&", '&', ANSI_FG_GREEN, 8}, // bitwise and
  {"\\|", '|', ANSI_FG_GREEN, 10} // bitwise or
};


static bool make_token(char *e, bool debug_flag) {
  int position = 0;
  int i, j;
  regmatch_t pmatch;
  bool last_is_num = false;
  bool last_is_right_parenthesis = false;
  // delete str_data
  for (i = 0; i < nr_token; i++) {
    if (tokens[i].is_dynamic) {
      tokens[i].is_dynamic = false;
      free(tokens[i].str_data.dynamic_str);
    }
  }
  nr_token = 0;
  while (e[position] != '\0') {
    /* Try all rules one by one. */
    // operator must be after number and right parenthesis.
    for (i = (last_is_num || last_is_right_parenthesis ? 12 : 7), j = 0 ; j < NR_REGEX; i = (i + 1) % NR_REGEX, j++) {
      if (regexec(&re[i], e + position, 1, &pmatch, 0) == 0 && pmatch.rm_so == 0) {
        char *substr_start = e + position;
        int substr_len = pmatch.rm_eo;
        // colorful regex
        if (debug_flag) {
          Log("match rules[%d] = %s\"%s\"%s at position %d with len %d: %.*s", 
            i, rules[i].color, rules[i].regex, ANSI_FG_BLUE, position, substr_len, substr_len, substr_start);
        }

        position += substr_len;

        /* TODO: Now a new token is recognized with rules[i]. Add codes
         * to record the token in the array `tokens'. For certain types
         * of tokens, some extra actions should be performed.
         */
        int type = rules[i].token_type;
        if (type == TK_NOTYPE || type == TK_CONST_SUF) break;
        
        tokens[nr_token].type = type;
        tokens[nr_token].priority = rules[i].priority;
        
        if (type == TK_DEC_INT || type == TK_HEX_INT || type == TK_REG) {
          last_is_num = true;
          last_is_right_parenthesis = false;
          if (substr_len >= 31) {
            tokens[nr_token].is_dynamic = true;
            tokens[nr_token].str_data.dynamic_str = (char*)malloc(2 * substr_len * sizeof(char));
            memcpy(tokens[nr_token].str_data.dynamic_str, substr_start, substr_len);
            tokens[nr_token].str_data.dynamic_str[substr_len] = '\0';
          } else {
            memcpy(tokens[nr_token].str_data.static_str, substr_start, substr_len);
            tokens[nr_token].str_data.static_str[substr_len] = '\0';
          }
        } else {
          memcpy(tokens[nr_token].str_data.static_str, substr_start, substr_len);
          tokens[nr_token].str_data.static_str[substr_len] = '\0';
          last_is_num = false;
          last_is_right_parenthesis = type == ')'; 
        }

        nr_token++;
        break;
      }
    }

    if (j == NR_REGEX) {
      printf("no match at position %d\n%s\n%*.s^\n", position, e, position, "");
      return false;
    }
  }

  return true;
}



enum {
  NORMAL, BAD_EXPRESSION, PARENTHESES_NOT_MATCH, DIVIDE_ZERO, NOT_FOUND_REG, SHFIT_OVERFLOW
};

bool check_parentheses(int p, int q, int *flag) {
  // test whether the parentheses are matched or not
  int cnt_left_parentheses = 0, cnt_right_parenthese = 0;
  for (int i = p; i <= q; i++) {
    if (tokens[i].type == '(') {
      cnt_left_parentheses++;
    } else if (tokens[i].type == ')') {
      cnt_right_parenthese++;
    }
    if (cnt_right_parenthese > cnt_left_parentheses) {
      // the parentheses are not matched
      if (flag) *flag = PARENTHESES_NOT_MATCH;
      Log("PARENTHESES_NOT_MATCH: between token %d and %d.", p, q);
      return true;
    }
  }
  if (cnt_left_parentheses != cnt_right_parenthese) {
    // the parentheses are not matched
    if (flag) *flag = PARENTHESES_NOT_MATCH;
    Log("PARENTHESES_NOT_MATCH: between token %d and %d.", p, q);
    return true;
  }
  if (tokens[p].type != '(' || tokens[q].type != ')') return false;
  // the parentheses are matched
  // [p + 1, q - 1]
  cnt_left_parentheses = cnt_right_parenthese = 0;
  for (int i = p + 1; i <= q - 1; i++) {
    if (tokens[i].type == '(') {
      cnt_left_parentheses++;
    } else if (tokens[i].type == ')') {
      cnt_right_parenthese++;
    }
    if (cnt_right_parenthese > cnt_left_parentheses) {
      // the parentheses are not matched
      return false;
    }
  }
  return true;
}

void print_expr(int p, int q, word_t val) {
  printf("p = %d, q = %d\n", p, q);
  for (int i = p; i <= q; i++) {
    printf("%s ", tokens[i].str_data.static_str);
  }
  printf("= %u\n", val);
}

bool check_is_single_op(int type) {
  return type == TK_DER || type == TK_NEG || type == '!' || type == '~';
}

bool check_is_double_op(int type) {
  bool flag = type == rules[7].token_type;
  for (int i = 12; i < NR_REGEX; i++) {
    if (type == rules[i].token_type) {
      flag = true;
      break;
    }
  }
  return flag;
}

// ⚠️: flag should be initialized to equal 0
word_t eval(int p, int q, int *flag, bool debug_flag) {
  if (debug_flag) {
    print_expr(p, q, eval(p, q, NULL, 0));
  }
  // Failed to eval
  if (flag && *flag != NORMAL) return 0;

  if (p > q) {
    /* Bad expression */
    if (flag) *flag = BAD_EXPRESSION;
    Log("BAD_EXPRESSION.");
    return 0;
  }
  else if (p == q) {
    /* Single token.
     * For now this token should be a number.
     * Return the value of the number.
    */
    word_t res;
    if (tokens[p].type == TK_REG) {
      bool success;
      res = isa_reg_str2val(tokens[p].str_data.static_str, &success);
      if (!success) {
        Log("NOT_FOUND_REG[%s].", tokens[p].str_data.static_str);
        if (flag) *flag = NOT_FOUND_REG;
      }
    } else {
      if (tokens[p].is_dynamic) {
        if (tokens[p].type == TK_HEX_INT) {
          sscanf(tokens[p].str_data.dynamic_str, "%x", &res);
        } else {
          sscanf(tokens[p].str_data.dynamic_str, "%u", &res);
        }
      } else {
        if (tokens[p].type == TK_HEX_INT) {
          sscanf(tokens[p].str_data.static_str, "%x", &res);
        } else {
          sscanf(tokens[p].str_data.static_str, "%u", &res);
        }
      }
    }
    return res;
  } else if (check_parentheses(p, q, flag) == true) {
    /* The expression is surrounded by a matched pair of parentheses.
     * If that is the case, just throw away the parentheses.
    */
    return eval(p + 1, q - 1, flag, debug_flag);
  } else {
    // find the position of master operation in the token expression
    int now_priority = 1, pos = -1, cnt_parenthese = 0;
    for (int i = p; i <= q; i++) {
      // calculate cnt_parenthese
      int type = tokens[i].type, priority = tokens[i].priority;
      if (type == '(') {
        cnt_parenthese++;
      } else if (type == ')') {
        cnt_parenthese--;
      }

      // in parenthese or single op, so continue
      if (cnt_parenthese > 0 || check_is_single_op(type)) continue;
      
      // '+' '-' '*' '/' operation
      if (check_is_double_op(type) && priority >= now_priority) {
        pos = i;
        now_priority = priority;
      }
    }
    // only single op
    if (pos == -1) {
      pos = p;
      int type = tokens[pos].type;
      if (check_is_single_op(type)) {
        word_t val = eval(pos + 1, q, flag, debug_flag);
        if (type == TK_DER) {
          return paddr_read(val, 4);
        } else if (type == TK_NEG) {
          return -val;
        } else if (type == '!') {
          return !val;
        } else {
          return ~val;
        }
      } else {
        /* Bad expression */
        if (flag) *flag = BAD_EXPRESSION;
        Log("BAD_EXPRESSION: tokens[%d ~ %d].", p, q);
        return 0;
      }
    } else {
      int type = tokens[pos].type;
      bool is_short_circuit = false;
      word_t val1 = eval(p, pos - 1, flag, debug_flag);
      if (flag && *flag != NORMAL) return 0;
      // short-circuit
      if ((type == TK_OR && val1) || (type == TK_AND && !val1)) {
        is_short_circuit = true;
      }
      word_t val2 = eval(pos + 1, q, flag, debug_flag);
      if (is_short_circuit && flag && (*flag == DIVIDE_ZERO || *flag == NOT_FOUND_REG || *flag == SHFIT_OVERFLOW)) {
        if (flag) *flag = NORMAL;
      }
      
      switch (type) {
        case '+': return val1 + val2;
        case '-': return val1 - val2;
        case '*': return val1 * val2;
        case '/': case '%':
          if (val2 == 0) {
            Log("DIVIDE_ZERO: Try to use tokens [%d ~ %d] divide tokens [%d ~ %d], while encounter zero(0).", 
              pos + 1, q, p, pos - 1);
            if (flag) *flag = DIVIDE_ZERO;
            return 0;
          }
          if (type == '/') return val1 / val2;
          else return val1 % val2;
        case TK_LSHI: 
          if (val2 >= 32) {
            if (flag) {
              *flag = SHFIT_OVERFLOW;
            }
            Log("SHFIT_OVERFLOW: Undefined behavior << %u, betwenn tokens [%d ~ %d] and tokens [%d ~ %d].", val2, p, pos - 1, pos + 1, q);
          }
          return val1 << val2;
        case TK_RSHI: 
          if (val2 >= 32) {
            if (flag) {
              *flag = SHFIT_OVERFLOW;
            }
            Log("SHFIT_OVERFLOW: Undefined behavior >> %u, betwenn tokens [%d ~ %d] and tokens [%d ~ %d].", val2, p, pos - 1, pos + 1, q);
          }
          return val1 >> val2;
        case '^': return val1 ^ val2;
        case TK_GE: return val1 >= val2;
        case TK_LE: return val1 <= val2;
        case TK_EQ: return val1 == val2;
        case TK_NOTEQ: return val1 != val2;
        case '>': return val1 > val2;
        case '<': return val1 < val2;
        case TK_AND: return val1 && val2;
        case TK_OR: return val1 || val2;
        case '&': return val1 & val2;
        case '|': return val1 | val2;
        default: assert(0);
      }
    }
  }
}

word_t expr(char *e, bool *success, bool debug_flag) {
  if (success != NULL) *success = true;
  if (!make_token(e, debug_flag)) {
    if (success != NULL) *success = false;
    return 0;
  }
  /* TODO: Insert codes to evaluate the expression. */
  int flag = 0;
  word_t res = eval(0, nr_token - 1, &flag, debug_flag);
  if (flag > 0) {
    if (success != NULL) *success = false;
    return 0;
  }
  return res;
}
```



## Q2.实现监视点池的管理

- 我们在监视点节点中添加字符串指针和一个整数用于存储表达式和值。
- 我们尽量把监视点节点的更新和变化都放在调用的函数里

```c
typedef struct watchpoint {
  int NO;
  struct watchpoint *next;
  /* TODO: Add more members if necessary */
  char*expression;
  word_t val;
} WP;

/* TODO: Implement the functionality of watchpoint */
int new_up(const char* new_expression, word_t val) {
  if (free_ == NULL) {
    return -1;
  }
  WP *res = free_;
  // update free_
  free_ = free_ -> next;
  // update head
  res -> next = head;
  head = res;
  // free val and expression
  res -> val = val;
  // alloc memory to store new expression
  // back = '\0'
  int len = strlen(new_expression) + 1; 
  if (res -> expression != NULL) {
    free(res -> expression);
  }
  res -> expression = (char*) malloc(len);
  memcpy(res -> expression, new_expression, len);
  return res -> NO;
}

bool free_wp(int wp_id) {
  WP *wp = NULL;
  for (WP *i = head; i != NULL; i = i -> next) {
    if (i -> NO == wp_id) {
      wp = i;
      break;
    }
  }
  if (wp == NULL) {
    return false;
  }
  if (wp == head) {
    head = wp -> next;
    wp -> next = free_;
    free_ = wp;
    return true;
  }

  for (WP *i = head; i -> next != NULL; i = i -> next) {
    if (i -> next == wp) {
      i -> next = wp -> next;
      wp -> next = free_;
      free_ = wp;
      return true;
    }
  }
  // Impossible to fetch here.
  assert(0);
  return true;
}
```



## Q3.实现监视点

```c
// watchpoint.c
void watchpoint_display() {
  printf("%-18s%-18s%-18s%-18s\n", "NO", "val_16", "val_10", "expression");
  for (WP *i = head; i != NULL; i = i -> next) {
    printf("%-18d0x%-16x%-18u%-18s\n", i -> NO, i -> val, i -> val, i -> expression);
  }
}

void watchpoint_update() {
  for (WP *i = head; i != NULL; i = i -> next) {
    word_t new_val = expr(i -> expression, NULL, 0);
    if (new_val != i -> val) {
      Log("wp[%d]: expression[(%s) = %u] change to %u", i -> NO, i -> expression, i -> val, new_val);
      i -> val = new_val;
      nemu_state.state = NEMU_STOP;
    }
  }
}
// sdb.c
static int cmd_w(char *args) {
  bool success;
  uint32_t res = expr(args, &success, 0);
  if (success == false) {
    printf("expression[%s] is invaild.\n", args);
  } else {
    int id = new_up(args, res);
    if (id == -1) {
      printf("No more free node to store new watchpoint.\n");
    } else {
      printf("New watchpoint[%d](%s) are added to pool.\n", id, args);
    }
  }
  return 0;
}

static int cmd_d(char *args) {
  int id;
  sscanf(args, "%d", &id);
  if (free_wp(id)) {
    printf("watchpoint[%d] are deleted from pool.\n", id);
  } else {
    printf("Not Found wp[%d] to free\n", id);
  }
  return 0;
}

// cpu-exec.c
static void trace_and_difftest(Decode *_this, vaddr_t dnpc) {
#ifdef CONFIG_ITRACE_COND
  if (ITRACE_COND) { log_write("%s\n", _this->logbuf); }
#endif
  if (g_print_step) { IFDEF(CONFIG_ITRACE, puts(_this->logbuf)); }
  IFDEF(CONFIG_DIFFTEST, difftest_step(_this->pc, dnpc));
  
#ifdef CONFIG_WATCHPOINT
  watchpoint_update();
#endif
}
```

注意寄存器处也需要加入`$pc`的查询

```diff
--- a/nemu/src/isa/riscv32/reg.c
+++ b/nemu/src/isa/riscv32/reg.c
@@ -28,12 +28,17 @@ 
 void isa_reg_display() {
+  printf("%-18s0x%-18x%-18u\n", "pc", cpu.pc, cpu.pc);
   for (int i = 0; i < 32; i++) {
     printf("%-18s0x%-18x%-18u\n", reg_name(i), gpr(i), gpr(i));
   }
 }
 
 word_t isa_reg_str2val(const char *s, bool *success) {
+  if (strcmp(s, "pc") == 0 || strcmp(s + 1, "pc") == 0) {
+    *success = true;
+    return cpu.pc;
+  }
   for (int i = 0; i < 32; i++) {
     // regs or $regs
     if (strcmp(s, regs[i]) == 0 || strcmp(s + 1, regs[i]) == 0) {
```



## Q4.尝试通过目录定位关注的问题

selector（选择子）是从实模式到保护模式引入的概念，代码段寄存器的含义变为selector，存放了index、权限控制等信息。寻址时在描述符表中找到对应index的描述符，这样拿到基地址后再加上偏移值就能够得到物理地址。



# 一些神秘发现（感到惊讶）



## scanf读入十六进制和十进制常量的差别

- 可以用`%x`读入`0x`开头的十六进制数字，而无法用`%lld`读入以`ll`结尾的`long long`类型的十进制常量（会在`ll`处阶段）
- 并且常量以可以需要的类型来声明，可以不一定要加后缀。比如`998244353`是`int`类型，`9982443533`和`9982443533ll`都是`long long`类型

```c
ll x=0, y=0;
scanf("%llx%llx", &x, &y);
printf("%lld %lld\n", x, y);
x = 0, y = 0;
scanf("%lld%lld", &x, &y);
printf("%lld %lld\n", x, y);

// input
0XA000000000A0 0x200000000000
17592186044416ll 35184372088832ll
// output
175921860444320 35184372088832
17592186044416 0 
```



## 除以零的编译器行为

- 两个表达式在编译时都会发出警告（warning: division by zero）
- 本来想的情况应该是都会`core dumped`，但是只有第一个会，而第二个会输出`111`

```c
#include <stdio.h>

int main() {
    printf("%u", 2u / (((49u-(8u))/82u)));
    printf("%u\n", (45u)+(((76u))*41u/47u-(35u)/97u/(74u/((16u))*(((78u)-97u))+((((58u-53u)/61u/27u-87u-92u*22u/41u-((61u-16u))+39u*(66u))*(18u)))+(38u-((((42u)/55u)+(((((87u/(((((75u)))))*(60u/16u)+((28u))-69u*85u*(64u))/((((81u))))/(5u))))+(((85u)*54u-(((((10u+(60u))))-17u-78u))-19u)/(((49u-(8u))/82u)))))))/44u)));
    return 0;
}
```

这里发生了两个关键的事情：**整除截断为0** 和 **编译器的激进优化**。

 **A. 关键的“0”**

请注意这一部分： `... - (35u)/97u / (后面那一大堆包含除以0的复杂式子) ...`

- 计算分子：`(35u) / 97u`。
- 在整数除法中，35 除以 97 等于 **0**。

整个算式在编译器眼里的逻辑结构变成了： `结果 = 45u + (一部分算式) - 0 / (包含除以0的坏算式)`

**B. 编译器的“常量折叠” (Constant Folding)**

由于整个长算式里没有任何变量（全是数字字面量），现代编译器（g++）会尝试在**编译阶段**就把结果算出来，直接把结果写进程序里，而不是让程序运行时去算。

当编译器计算到 `0 / (坏算式)` 这一步时，它遵循了以下逻辑：

1. 编译器看到被除数是 `0`。
2. 在数学上，`0` 除以任何非零数都等于 `0`。
3. 虽然除数可能包含除以0（也是 UB），但 C++ 标准允许编译器假设**未定义行为不会发生**。
4. 因此，编译器进行了一个激进的优化：它判定 `0 / X` 的结果就是 `0`，而不需要去计算 `X` 到底是多少，甚至不需要检查 `X` 是否合法。它直接把后面那一大串包含除以0的代码**优化掉了（Dead Code Elimination）**。

## 编译器优化的边界条件

- 本来想的情况应该是都会`core dumped`，但是只有第一个会，而第二个会输出

```c
printf("%u\n", 1u + (2u / 5u) / 0u);
printf("%u\n", 1u + (2u / 5u) / ((10u) / (20u - 20u) + 5u));
```

因为对于编译器来说，`0 / 0` 和 `0 / (可能崩溃的表达式)` 是完全不同的两回事。前者是显式错误（`0 / 0`）直接的未定义行为，后者是隐式计算`0 / (复杂表达式)`可能会触发短路优化

因此为了避免这种情况，我们可以加入以下编译参数

```shell
g++ -Wall -Wextra -Werror=div-by-zero -Wno-overflow test.cpp -o test
```

- -Werror=div-by-zero 将使得发现除0，直接报error

- -Wall 开启一些重要的基础的警告，如使用未初始化变量、函数没有返回值、可能丢失数据的类型转换、除以0等等

- -Wextra 开启额外的更严格的警告，如函数参数未使用、有符号数和无符号数的比较等等

- -Wno-overflow 将忽略溢出警告



## 移位运算警告

位运算中可能触发三种警告。

- -Wshift-count-overflow:右值超出31,且为正数
- -Wshift-count-negative:右值为负数
- -Wshift-negative-value:使用左移的时候，左值为负数

```shell
test.cpp:9:28: error: right shift count >= width of type [-Werror=shift-count-overflow]
    9 |     printf("%u\n", ((68u)) >> 32);
      |                    ~~~~~~~~^~~~~
test.cpp:10:28: warning: left shift count is negative [-Wshift-count-negative]
   10 |     printf("%u\n", ((68u)) << -32);
      |                    ~~~~~~~~^~~~~~
test.cpp:11:23: warning: left shift of negative value [-Wshift-negative-value]
   11 |     printf("%u\n", -1 << 1);
      |                    ~~~^~~~
```



## 逻辑运算符与比较运算符的类型强制转换

使用逻辑运算符`&& || !`和比较运算符`> < >= <= == !=`时只会得到`int`类型的0或1。

因此可能会造成一些问题，如下面两个算式看上去等价，实际输出结果上不一样

```c
printf("%u\n", !  - (( ! (158u))) > ( ~ ((107u || (642u) + 1946u)))); // 输出1
printf("%u\n", !  - (0) > ( ~ 1u)); // 输出0
```



# 参考

[在 vscode 中配置 clangd 来进行南大 PA 实验](https://zhuanlan.zhihu.com/p/684571947)

[配置lldb](https://www.cnblogs.com/DreamW1ngs/p/18430400)

[GDB to LLDB command map](https://lldb.llvm.org/use/map.html#breakpoint-commands)

[Visual studio Code的clangd插件一篇通，上乘的C/C++开发环境配置](https://blog.csdn.net/callinglove/article/details/132539448)

[Gemini:C++ 除以零的编译器行为](https://gemini.google.com/share/ea28ae0bc104)
