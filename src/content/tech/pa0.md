---
title: "PA0：实验环境与 hello world"
description: "在 WSL2 中配置实验环境，完成 SSH、tmux/vim 与 Makefile 的第一次实践。"
date: 2026-01-28
tags: [PA, Linux, 环境配置]
---
## 实验进度

- 我完成了pa0所有内容，在wsl2使用Ubuntu 24.04.1配置实验环境
- tmux和vim的配置使用自己习惯的方式

## ssh key

![image-20250918144953415](/notes/pa0/image-20250918144953415.png)

## hello world

### 程序文件

`main.c`

```c
#include<stdio.h>
#include "message.h"

int main(){
    // printf("hello world!\n");
    message();
    return 0;
}
```

`message.c`

```c
#include<stdio.h>

void message(){
    printf("hello world!\n");
}
```

`message.h`

```c
void message();
```



### make&makefile

```makefile
# make -f makefile # 指定makefile文件
# make -n # 只显示命令，不执行
# make -C dir # 进入dir目录执行make


# Makefile for hello world program

# 书写规则
# 目标文件: 依赖文件
# \t制作目标文件的命令


# 伪目标，就不会和文件冲突，这个放在什么位置都可以，与顺序无关
.PHONY: clean all

# 变量定义
CFLAGS = -g -Wall -O2
targets = hello world
sources = main.c message.c
# objects = $(sources:.c=.o)
objects = main.o message.o

# make的默认命令为第一个目标

# 命令前的-表示忽略错误继续执行
# 命令前的@表示不显示命令本身
all: hello world
	@echo "Build all targets."

# 这样修改文件时，每次都要重新编译所有文件，浪费时间
# hello: main.c message.c
# 	gcc main.c message.c -o hello 需要用tab缩进，空格会报错

# 这样写当修改了main.c或者message.c时，只会重新编译被修改的文件，节省时间

# hello: main.o message.o
# 	gcc main.c message.c -o hello

# world: main.o message.o
# 	gcc main.c message.c -o world

# $@ 代表目标文件
# $^ 代表所有依赖文件
# $< 代表第一个依赖文件
$(targets): $(objects)
	gcc $(CFLAGS) $(sources) -o $@

# main.o: main.c
# 	gcc $(CFLAGS) -c $< -o $@

# message.o: message.c
# 	gcc $(CFLAGS) -c $< -o $@

# 通配符
*.o: *.c
	gcc $(CFLAGS) -c $< -o $@

clean:
	rm -f *.o $(targets)


```

### cmake

使用`cmake`即可一键生成`makefile`文件

```cmake
cmake_minimum_required(VERSION 3.10)

project(hello_world)

set(SOURCES main.c message.c)

add_executable(hello ${SOURCES})
```



### gdb

**安装**

```bash
yum install gdb
sudo apt install gdb
gdb --version
```

**基本命令**

一段`test.c`代码

```c
#include<stdio.h>

void hello() {
    printf("hello echo~\n");
}

int main(){
    int arr[4] = {1, 2, 3, 4};
    for (int i = 0; i < 4; i++) {
        printf("%d\n", arr[i]);
    }
    hello();
    return 0;
}
```

编译调试

```shell
gcc test.c -g #带上调试信息
gdb a.out
```

简单gdb命令

```shell
run / r [参数] #运行程序
set args [参数] # 设置参数
quit / q # 退出
break / b [line]/[function]  # 打断点
info b # 查看打断点位置
list / l # 查看代码
next / n # 单步运行
print / p [变量名]# 打印变量
step / s # 单步进入函数
watch [变量]# 观察
```

**小技巧**

1. 一些指令

```shell
shell [命令] # 在gdb中调用终端命令
set logging on # 记录日志
```

2. 调试core文件

core文件不会默认生成

```shell
[root@6cb5894fe213 bomb]#  ulimit -a
core file size          (blocks, -c) unlimited
data seg size           (kbytes, -d) unlimited
scheduling priority             (-e) 0
file size               (blocks, -f) unlimited
pending signals                 (-i) 127621
max locked memory       (kbytes, -l) 65536
max memory size         (kbytes, -m) unlimited
open files                      (-n) 1048576
pipe size            (512 bytes, -p) 8
POSIX message queues     (bytes, -q) 819200
real-time priority              (-r) 0
stack size              (kbytes, -s) 8192
cpu time               (seconds, -t) unlimited
max user processes              (-u) unlimited
virtual memory          (kbytes, -v) unlimited
file locks                      (-x) unlimited

ulimit -c unlimited
echo "./core-%e-%p-%s-%t" > /proc/sys/kernel/core_pattern # 在docker中需要有privileged权限

gdb a.out core-a.out # 调试core文件
```

3. 调试正在运行的程序

```shell
[root@2abff8f22b99 bomb]# gcc test_for.c -g
[root@2abff8f22b99 bomb]# ./a.out & # 后台运行
[1] 53
gdb -p 53
```

**拓展**

1. 其他指令

```shell
disassemble [函数/空/地址] # 反汇编 
set args 参数  
p *d@10 # 打印10个
p *$.next # $表示上一个变量
```

2. **gdb-dashboard**

[小神仙讲 *GDB*】 通俗易懂版教程 | 一小时入门*GDB* | Debug | c/c++程序员必备 | 佩雨小神仙](https://www.bilibili.com/video/BV1EK411g7Li/?spm_id_from=333.337.search-card.all.click)



## 什么是好的提问，如何通过STFW和RTFM独立解决问题？

​	在求学和工作的过程中，我们不可避免地会遇到各种各样的问题。对于这些问题，有的时候我们可以独立解决，而有的时候则需要求助于他人。然而，如何有效地提问以及如何通过自我探索来解决问题，是每个人都应该掌握的技能。最近，我阅读了《提问的智慧》和《别像弱智一样提问》这两篇文章，并结合自己在大学一年级时的提问经历和完成PA0的经验，我对“好的提问”以及“通过STFW（Search The Friendly Web）和RTFM（Read The Friendly Manual）独立解决问题”有了更深刻的理解。

​	我认为遇到问题时，我们需要经过自己的思考并尝试自行解决。这不仅是因为独立解决问题能够提升我们的能力，也是因为尊重他人的时间和精力。在面对困难时，我们应该先尝试搜索网络上的相关信息。《别像弱智一样提问》中提到，搜索引擎是我们获取知识的基本工具之一。当我们使用非百度的搜索引擎如Google或Bing时，往往可以找到更多相关的信息。因为这些搜索引擎通常拥有更加丰富和多样化的信息源，能够帮助我们更快地找到答案。

​	如果在网上搜索之后仍无法解决问题，那么提问就成为了下一步的选择。但提问并不是简单的把问题抛给别人，而是要有技巧地进行。《提问的智慧》强调，一个好的提问应当包含清晰的问题描述、重现步骤以及可能的原因分析。当我做PA0的时候，我遇到开发环境配置的问题时，我没有直接向老师或同学询问，而是详细记录下了我的操作流程和错误提示。这样做不仅帮助我自己梳理了思路，也为后来者提供了参考。同时，我还附上了截图以辅助说明问题，确保对方能够快速理解我的困境所在。

​	提问时的态度同样重要。礼貌地提出问题，并对给予帮助的人表示感谢，不仅是基本的社交礼仪，也体现了对他人劳动成果的尊重。在我的学习生涯中，曾有一次向学长请教编程难题的经历。当时，我不仅准确描述了自己的问题，还分享了自己尝试过的解决方案。这种做法赢得了学长的好感，他也乐意花费时间来指导我。最终，通过他的点拨和我自身的努力，我成功解决了困扰多日的难题。

​	“好的提问”不仅仅是关于技术层面的准确表达，它还涉及到如何与他人建立积极的关系。与时，“通过STFW和RTFM独立解决问题”的过程则是培养个人自主学习能力和解决问题技巧的关键环节。在这个过程中，我们学会了如何高效利用资源，同时也锻炼了自己的逻辑思维能力。因此无论是对于学生还是职场人士来说，掌握这两项技能都是至关重要的。它们不仅能让我们更好地应对挑战，还能促进个人成长与发展。在未来的学习和工作中，我会继续践行这些原则，力求做到既善于提问又能独立解决问题。
