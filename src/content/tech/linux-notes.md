---
title: "Linux 基础课笔记"
description: "Linux 基础课笔记：文件管理、tmux / vim、Shell 脚本、SSH 与常用命令。"
date: 2024-06-01
tags: [Linux, Shell, 工具]
---
## 一、常用文件管理命令

### 文件结构

- /为绝对目录
- 直接写为相对目录
- ~/为家目录
- .为当前目录 ..为父目录

### 常用命令

1. ctrl c: 取消命令，并且换行

2. ctrl u: 清空本行命令

3. tab键：可以补全命令和文件名，如果补全不了快速按两下tab键，可以显示备选选项

4. ls: 列出当前目录下所有文件，蓝色的是文件夹，白色的是普通文件，绿色的是可执行文件

5. pwd: 显示当前路径

6. cd XXX: 进入XXX目录下, cd .. 返回上层目录

7. cp XXX YYY: 将XXX文件复制成YYY，XXX和YYY可以是一个路径，比如../dir_c/a.txt，表示上层目录下的dir_c文件夹下的文件a.txt

   cp X Y -r 将整个文件夹复制，Y为目标路径，可以重命名

8. mkdir XXX: 创建目录XXX

9. rm XXX: 删除普通文件;  rm XXX -r: 删除文件夹

10.  mv XXX YYY: 将XXX文件移动到YYY，和cp命令一样，XXX和YYY可以是一个路径；重命名也是用这个命令

11.  touch XXX: 创建一个文件

12.  cat XXX: 展示文件XXX中的内容

13. 复制文本windows/Linux下：Ctrl + insert，Mac下：command + c

14. 粘贴文本windows/Linux下：Shift + insert，Mac下：command + v

## 二、tmux和vim

### tmux

1. tmux：新建一个session，其中包含一个window，window中包含一个pane，pane里打开了一个shell对话框
2. 先Ctrl + a再%：将当前pane左右成两个pane
3. 先Ctrl + a再"：上下分成两个。
4. Ctrl + d：关闭当前pane
5. 鼠标点击可以选pane
6. 先ctrl + a再按方向键：选择相邻的pane
7. 鼠标拖动pane之间的分割线，可以调整分割线的位置
8. ctrl + a+方向键，可以调整pane之间分割线的位置
9. 先ctrl + a再z：将当前pane全屏/取消全屏
10. 先ctrl + a再d：挂起当前session
11. tmux a：打开之前挂起的session
12. 先ctrl + a再s：选择其它session
13. 先Ctrl + a再c：在当前session中创建一个新的window
14. 先Ctrl + a再w：选择其他window，操作方法与(12)完全相同
15. 先Ctrl + a再PageUp：翻阅当前pane内的内容
16. 鼠标滚轮：翻阅当前pane内的内容
17. 在tmux中选中文本时，需按shift
18. tmux中复制/粘贴文本的通用方式：
    - 先Ctrl + a再[
    - 用鼠标选中文本，被选中的文本会被自动复制到tmux的剪贴板
    - 先Ctrl + a再]，会将剪贴板中的内容粘贴到光标处
19. 先Ctrl + a再&：询问关闭当前session

### vim

1. i：进入编辑模式
2. ESC：进入一般命令模式
3. h 或 左箭头键：光标向左移动一个字符
4. j 或 向下箭头：光标向下移动一个字符
5. k 或 向上箭头：光标向上移动一个字符
6. l 或 向右箭头：光标向右移动一个字符
7. n<Space>：n表示数字，按下数字后再按空格，光标会向右移动这一行的n个字符
8. 0 或 功能键[Home]：光标移动到本行开头
9. \$ 或 功能键[End]：光标移动到本行末尾
10. G：光标移动到最后一行
11. :n 或 nG：n为数字，光标移动到第n行
12. gg：光标移动到第一行，相当于1G
13. n<Enter>：n为数字，光标向下移动n行
14. /word：向光标之下寻找第一个值为word的字符串
15. ?word：向光标之上寻找第一个值为word的字符串
16. n：重复前一个查找操作
17. N：反向重复前一个查找操作
18. :n1,n2s/word1/word2/g：n1与n2为数字，在第n1行与n2行之间寻找word1这个字符串，并将该字符串替换为word2
19. :1,\$s/word1/word2/g：将全文的word1替换为word2
20. :1,\$s/word1/word2/gc：将全文的word1替换为word2，且在替换前要求用户确认。
21. v：选中文本
22. d：删除选中的文本
23. dd: 删除当前行
24. y：复制选中的文本
25. yy: 复制当前行
26. p: 将复制的数据在光标的下一行/下一个位置粘贴
27. u：撤销
28. Ctrl + r：取消撤销
29. 大于号 >：将选中的文本整体向右缩进一次
30. 小于号 <：将选中的文本整体向左缩进一次
31. :w 保存
32. :w! 强制保存
33. :q 退出
34. :q! 强制退出
35. :wq或:x 保存并退出
36. :set paste 设置成粘贴模式，取消代码自动缩进
37. :set nopaste 取消粘贴模式，开启代码自动缩进
38. :set nu 显示行号
39. :set nonu 隐藏行号
40. gg=G：将全文代码格式化
41. :noh 关闭查找关键词高亮
42. Ctrl + q：当vim卡死时，可以取消当前正在执行的命令
43. Ctrl+v 选中列，shift+i 再按#即可多行注释
44. Ctrl+v 选中列的#，再按d删除注释





## 三、shell

### 概论

```shell
#! /bin/bash
echo "Hello World!"
```

```shell
#可执行文件
chmod +x test.sh  # 使脚本具有可执行权限
./test.sh  # 当前路径下执行

# 解释器执行
bash test.sh
```

### 注释

```shell
# 这是一行注释
echo "Hello World" #这也是注释
:<<11
注释1
注释2
11
:<<EOF
注释1
注释2
EOF
! /bin/bash
# 这是一行注释
echo "Hello World" #这也是注释
:<<11
注释1
注释2
11
:<<EOF                                                                                                                                                                       
注释1
注释2
EOF
```

### 变量

```shell
name1=ls
name2='ls'
name3="ls ls"
                                                                                                                                                                             
echo $name1
echo ${name2}
echo ${name3}11

readonly name2
declare -r name2

# name2=11 会报错

unset name2

echo ${name3}?11

# 字符串

echo 'hello, ${name1} \"hh\"'  #原样输出
echo "hello, ${name1} \"hh\""
echo  hello, ${name1} \"hh\"----
echo ${#name1}    #字符串长度
echo ${name1:0:1} #从0开始提取一个 
```

```shell
# 自定义改环境变量
~$ name=yxc  # 定义变量
~$ export name  # 第一种方法
~$ declare -x name  # 第二种方法

# 环境变量改自定义
~$ export name=yxc  # 定义环境变量
~$ declare +x name  # 改为自定义变量
```

### 默认变量

```shell
echo "文件名" $0
echo "第一个参" $1
echo "第三个参数" $3

echo $# # 传入参数个数
echo $* # 传入的所有参数
echo $@ # 传入的所有参数,双引隔开
echo $$ # 运行id
echo $? # 上条命令的运行状态
echo $(ls) # 获取命令的标准输出
echo `pwd` # 同上

```

### 数组

```shell
array=(1 ls "ls" 111)

array[0]=2

echo ${array[1]}

echo ${array[@]} ${#array[*]} #输出整个数组
```

### expr

```shell
echo $(expr length "$name3")
echo `expr index "Hello LiSheng" hls`
echo $(expr substr "${name3}" 1 2) #这个把字符串当成下标为1开始

a=3 b=4

echo `expr $a + $b`-
echo `expr $a - $b`-
echo `expr $a \* $b` # *需要转义-
echo `expr $a / $b`-
echo `expr $a % $b`-
echo `expr \( $a + 1 \) \* \( $b + 1 \)`



echo `expr $a \> $b`-
echo `expr $a \< $b`-
echo `expr $a '>=' $b`-
echo `expr $a \<\= $b`-

echo `expr 0 \& 5`-
echo `expr $a '&' $b` #这里返回第一个数
echo `expr 0 '|' 5`   #返回第一个不为0的数
echo `expr $a \| $b`

echo $((a * b)) #内置运算，无需转义和使用$
```

### read

```shell
read -p "你叫啥名？" -t 5 name #提示信息,等待时间最多5s,读入

echo hello,$name                                              
```

### echo

```shell
echo -e "hello\nls\c" #开启转义 取消尾换行

echo "Hello ls!" > output.txt # 文件重定向

echo `date`
```

### printf

类似C++里

```shell
printf "I miss %s %d\n" ls 11
printf "%d + %d = %d" $a $b `expr $a + $b`
```

### test和[ ]

均用`exit code`返回结果，而不是`stdout`。0表示真

```shell
test 1 -lt 2 # 比较

echo $? # 返回上个命令返回值

test -e test.sh && echo 'exist' || echo 'Not exist' # 实现if else语句


测试参数 	代表意义
-e 	文件是否存在
-f 	是否为文件
-d 	是否为目录

-r 	文件是否可读
-w 	文件是否可写
-x 	文件是否可执行
-s 	是否为非空文件

-eq 	a是否等于b
-ne 	a是否不等于b
-gt 	a是否大于b
-lt 	a是否小于b
-ge 	a是否大于等于b
-le 	a是否小于等于b

test -z STRING 	判断STRING是否为空，如果为空，则返回true
test -n STRING 	判断STRING是否非空，如果非空，则返回true（-n可以省略）
test str1 == str2 	判断str1是否等于str2
test str1 != str2 	判断str1是否不等于str2

-a 	两条件是否同时成立
-o 	两条件是否至少一个成立
! 	取反。如 test ! -x file，当file不可执行时，返回true
```

### 判断语句

```shell
if [ "$a" -lt "$b" ] && [ "$a" -gt 2 ]
then
    echo ${a}在范围内
fi

if [ 3 -eq 3 ];then
    echo "ls 333"
fi

if expr 3 '==' 3 #expr 会输出exit code中的值
then
    echo "ls 444"
fi

if ! [ "$a" -lt "$b" ]
then
    echo ${a}不小于${b}
else
    echo ${a}小于${b}
fi

if [ $a -eq 1 ]
then                                                                                                                                                                         
    echo ${a}等于1
elif [ $a -eq 3 ]
then
    echo ${a}等于3
else
    echo 其他
fi

case $a in
    1)
        echo "!"
        ;; #理解为C++里的break
    2)
        echo "~~"
        ;;
    *)
        echo "Wa"
        ;;
esac
```

### 循环语句

```shell
for i in ls 11 l s `ls`
do
    echo $i
done

for i in $(seq 1 10) {z..a}
do                                                                                                                          
    echo $i
done

for ((i = 1; i <= 10; i++));do
    echo $i
done

:<<while
while read name-
do
    echo ${name}
done
while

until [ "${word}" == "ls" ] || [ "${word}" == "LS" ]
do
    read -p "Please input ls/LS to stop this program: " word
done

while read name
do
    for ((i=1;i<=10;i++))
    do
        case $i in
            8)
                break
                ;;
            *)
                echo $i
                ;;
        esac
    done
done

for ((i=1;i<=10;i++))
do
    if [ `expr $i % 2` -eq 0 ]
    then
        continue
    fi
    echo $i
done
```

### 函数

```shell
fun() {
    echo $name
    name=ls
    echo $name
    local i=0 # 使用本地变量以避免修改外部全局变量
    return 0                
}

output=$(fun) # 此处为在子shell中执行，不会修改外部全局变量
ret=$?

echo "$output $ret"

func() {
    if [ $1 -le 0 ]
echo -e "Hello ls\c" > output.txt
    then
        echo 0
        return 0
    fi
    sum=$(func `expr $1 - 1`)
    echo $(expr $sum + $1)
}

echo `func 1`  
```

可以使用`ctrl+c`或在`top`中用`kill -9 PID`关掉进程

### exit命令

```shell
if [ $# -ne 4 ]-
then
    echo "arguments vaild"
    #exit 0
else
    echo "arguments invaild"
    #exit 1
fi         
```

### 文件重定向

```shell
echo -e "Hello ls\c" > output.txt
echo  "ls" >> output.txt   

~$ chmod +x test.sh  # 添加可执行权限
~$ ./test.sh < input.txt > output.txt  # 从input.txt中读取内容，将输出写入output.txt中
~$ cat output.txt  # 查看output.txt中的内容
```

### 引入外部脚本

```shell
. filename
source filename
```



## 四、ssh

### ssh登入

```shell
ssh user@hostname #登入服务器

#在~/.ssh/config 配置服务器账号名称
#Host xxx
#	Hostname 
#	User 

ssh-keygen #创建密钥
ssh-copy-id myserver # 在服务器中输入该指令以实现免密登入

#将公钥加入被登入的服务器~/.ssh/authorized_keys

#在服务器执行命令，并将标准输出返回
ssh user@hostname command 

# " "包括起来的$i 会在本地转义 ' '不会
```

### ssh 安全配置

```shell
# 查看日志
sudo vim /var/log/auth.log

sudo grep "Failed password for root" /var/log/auth.log | awk '{print $11}' | sort | uniq -c | sort -nr | more

sudo grep "Failed password for ubuntu" /var/log/auth.log | awk '{print $11}' | sort | uniq -c | sort -nr | more

sudo grep "Failed password for invalid user" /var/log/auth.log | awk '{print $13}' | sort | uniq -c | sort -nr | more

# 防火墙设置
sudo ufw status verbose
sudo ufw logging on
sudo ufw logging medium #sudo ufw logging low|medium|high
sudo ufw allow ssh
sudo ufw allow 1118/tcp
sudo ufw enable

# 换端口 禁用ssh密码登入
sudo vim /etc/ssh/sshd_config
port 1118
PasswordAuthentication no
LogLevel INFO       #将LogLevel设置为INFO,记录登录和注销活动
MaxAuthTries 3      #限制单次登录会话的最大身份验证尝试次数
LoginGraceTime 20   #缩短单次的登录宽限期，即ssh登录必须完成身份验证的时间 单位是秒
PermitEmptyPasswords no #禁止空密码用户登录

sudo service ssh restart

# 查看防火墙
systemctl | grep ufw
ufw allow 1118
systemctl restart ufw

# 重启ssh
systemctl restart ssh

# 查看ssh占用端口

cat /etc/ssh/sshd_config | grep Port
netstat -lntp
# 然后记得去阿里云后台安全组设置端口号

# (可选) 更改一下公钥的权限：
chmod 600 authorized_keys
systemctl restart ssh

# 安装配置fail2ban
sudo apt-get update
sudo apt-get install fail2ban

vim /etc/fail2ban/jail.conf

[DEFAULT]
# 以空格分隔的列表，可以是 IP 地址、CIDR 前缀或者 DNS 主机名
# 用于指定哪些地址可以忽略 fail2ban 防御
ignoreip =  127.0.0.1/8 ::1

# 客户端主机被禁止的时长
bantime = 60m

# 查找失败次数的时长
findtime = 3m

# 客户端主机被禁止前允许失败的次数 
maxretry = 3

sudo service fail2ban restart 

sudo fail2ban-client ping

sudo vim /var/log/fail2ban.log

sudo fail2ban-client status

sudo fail2ban-client status sshd

sudo fail2ban-client set sshd unbanip 103.61.8.34

# 两步验证
```





### scp传文件

```shell
scp source destination

scp -r ~/tmp myserver:homework/

scp ~/.vimrc ~/.tmux.conf ~/.bashrc myserver: # 传vim tmux配置
```

## 五、git

### git 常用命令

#### 全局设置

```shell
git config --global user.name xxx：设置全局用户名，信息记录在~/.gitconfig文件中
git config --global user.email xxx@xxx.com：设置全局邮箱地址，信息记录在~/.gitconfig文件中
git init：将当前目录配置成git仓库，信息记录在隐藏的.git文件夹中
git init -b main
git config --global http.proxy '127.0.0.1:port': 更改代理
```

#### 常用命令

```shell
git add XX ：将XX文件添加到暂存区
git commit -m "给自己看的备注信息"：将暂存区的内容提交到当前分支
git status：查看仓库状态
git log：查看当前分支的所有版本
git push -u (第一次需要-u以后不需要) ：将当前分支推送到远程仓库
git clone git@git.acwing.com:xxx/XXX.git：将远程仓库XXX下载到当前目录下
git clone -b syodly-patch-1 --single-branch git@github.com:syodly/software-parcti.git
git branch：查看所有分支和当前所处分支
```

#### 查看命令

```shell
git diff XX：查看XX文件相对于暂存区修改了哪些内容
git diff hash filepath：查看和hash值版本的修改
git status：查看仓库状态
git log：查看当前分支的所有版本
git log --pretty=oneline：用一行来显示
git reflog：查看HEAD指针的移动历史（包括被回滚的版本）
git branch：查看所有分支和当前所处分支
git pull ：将远程仓库的当前分支与本地仓库的当前分支合并
```

#### 删除命令

```shell
git reset . 撤销上一次提交暂存区的操作
git rm --cached XX：将文件从仓库索引目录中删掉，不希望管理这个文件
git restore --staged xx：==将xx从暂存区里移除==
git checkout — XX或git restore XX：==将XX文件尚未加入暂存区的修改全部撤销==
git checkout -- . ：撤销本地全部没有git add过的修改
git reset --soft HEAD^ ：撤销上一次commit，并且不撤销更改
git push -f origin main # 随上一条指令，撤销远端仓库的push
git reset --hard HEAD^ ：撤销上一次commit，撤销更改
git push origin <branch_name> --force : 将撤销同步到远程仓库
```

#### 代码回滚

```shell
git reset --hard HEAD^ 或git reset --hard HEAD~ ：将代码库回滚到上一个版本
git reset --hard HEAD^^：往上回滚两次，以此类推
git reset --hard HEAD~100：往上回滚100个版本
git reset --hard 版本号：回滚到某一特定版本
```

#### 远程仓库

```shell
git remote add origin git@git.acwing.com:xxx/XXX.git：将本地仓库关联到远程仓库
git remote -v:查看远程库信息
git remote rm origin:删除关联的origin的远程库
git push -u (第一次需要-u以后不需要) ：将当前分支推送到远程仓库
git push origin branch_name：将本地的某个分支推送到远程仓库
git clone git@git.acwing.com:xxx/XXX.git：将远程仓库XXX下载到当前目录下
git push --set-upstream origin branch_name：设置本地的branch_name分支对应远程仓库的branch_name分支
git push -d origin branch_name：删除远程仓库的branch_name分支
git checkout -t origin/branch_name 将远程的branch_name分支拉取到本地
git pull ：将远程仓库的当前分支与本地仓库的当前分支合并
git pull origin branch_name：将远程仓库的branch_name分支与本地仓库的当前分支合并
git branch --set-upstream-to=origin/branch_name1 branch_name2：将远程的branch_name1分支与本地的branch_name2分支对应
```

#### 分支命令

```shell
git branch -m master main:重命名
git branch branch_name：创建新分支
git branch：查看所有分支和当前所处分支
git checkout -b branch_name：创建并切换到branch_name这个分支
git checkout branch_name：切换到branch_name这个分支
git merge branch_name：将分支branch_name合并到当前分支上
git branch -d branch_name：删除本地仓库的branch_name分支
git push --set-upstream origin branch_name：设置本地的branch_name分支对应远程仓库的branch_name分支
git push -d origin branch_name：删除远程仓库的branch_name分支
git checkout -t origin/branch_name 将远程的branch_name分支拉取到本地
git pull ：将远程仓库的当前分支与本地仓库的当前分支合并
git pull origin branch_name：将远程仓库的branch_name分支与本地仓库的当前分支合并
git branch --set-upstream-to=origin/branch_name1 branch_name2：将远程的branch_name1分支与本地的branch_name2分支对应
```

#### stash暂存

```shell
git stash：将工作区和暂存区中尚未提交的修改存入栈中
git stash apply：将栈顶存储的修改恢复到当前分支，但不删除栈顶元素
git stash drop：删除栈顶存储的修改
git stash pop：将栈顶存储的修改恢复到当前分支，同时删除栈顶元素
git stash list：查看栈中所有元素
```

#### rebase

```shell
git rebase -i --root # 修改提交信息
git push --force-with-lease
```

#### 上传大文件

```shell
git config --global http.postBuffer 1048576000:修改上传最大缓存大小
git init #创建本地仓库环境
git lfs install #安装大文件上传应用
git lfs track * #追踪要上传的大文件，*表示路径下的所有文件

git add .gitattributes #添加先上传的属性文件(要先上传属性文件，不然有可能失败)

git commit -m "pre" #添加属性文件上传的说明
git remote add origin https://github.com/Youpeng-Zhang/MOP.git #建立本地和Github仓库的链接
git push origin master #上传属性文件
git add * #添加要上传的大文件，*表示路径下的所有文件
git commit -m "Git LFS commit" #添加大文件上传的说明
git push origin master #上传大文件

git count-objects -vH # 查看非lfs文件总体积，不能>2GB

pip install git-filter-repo # 
git filter-repo --strip-blobs-bigger-than 100M --force # 深度清洁.git中超过100M的文件            

```

#### 上传大文件

```shell
git config --global http.postBuffer 1048576000:修改上传最大缓存大小
git init #创建本地仓库环境
git lfs install #安装大文件上传应用
git lfs track * #追踪要上传的大文件，*表示路径下的所有文件

git add .gitattributes #添加先上传的属性文件(要先上传属性文件，不然有可能失败)

git commit -m "pre" #添加属性文件上传的说明
git remote add origin https://github.com/Youpeng-Zhang/MOP.git #建立本地和Github仓库的链接
git push origin master #上传属性文件
git add * #添加要上传的大文件，*表示路径下的所有文件
git commit -m "Git LFS commit" #添加大文件上传的说明
git push origin master #上传大文件

git count-objects -vH # 查看非lfs文件总体积，不能>2GB

pip install git-filter-repo # 
git filter-repo --strip-blobs-bigger-than 100M --force # 深度清洁.git中超过100M的文件            

```



### github

连接`github`配置

```shell
#The authenticity of host ‘github.com (20.205.243.166)‘ can‘t be established. 

#更新.ssh/known_host
github.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl
github.com ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBEmKSENjQEezOmxkZMy7opKgwFB9nkt5YRrYMjNuG5N87uRgg6CLrbo5wAdT/y6v0mKV0U2w0WZ2YB/++Tpockg=
github.com ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQCj7ndNxQowgcQnjshcLrqPEiiphnt+VTTvDP6mHBL9j1aNUkY4Ue1gvwnGLVlOhGeYrnZaMgRK6+PKCUXaDbC7qtbW8gIkhL7aGCsOr/C56SJMy/BCZfxd1nWzAOxSDPgVsmerOBYfNqltV9/hWCqBywINIR+5dIg6JTJ72pcEpEjcYgXkE2YEFXV1JHnsKgbLWNlhScqb2UmyRkQyytRLtL+38TGxkxCflmO+5Z8CSSNY7GidjMIZ7Q4zMjA2n1nGrlTDkzwDCsw+wqFPGQA179cnfGWOWRVruj16z6XyvxvjJwbz0wQZ75XK5tKSb7FNyeIEs4TT4jk+S4dhPeAUC5y+bDYirYgM4GC7uEnztnZyaVWQ7B381AK4Qdrwt51ZqExKbQpTUNn+EjqoTwvqNj4kqx5QUCI0ThS/YkOxJCXmPUWZbhjpCg56i+2aB6CmK2JGhn57K5mj0MNdBXA4/WnwH6XoPWJzK5Nyu2zB3nAZp+S5hpQs+p1vN1/wsjk=

```



## 六、thrift





## 七、管道、环境变量与常用命令

### 管道

`stout | stdin`将前面的标准输出作为下一个指令的输入

```shell
find . -name '*.py' | xargs cat | wc -l
```

### 环境变量

```shell
env  # 显示当前用户的变量
set  # 显示当前shell的变量，包括当前用户的变量;
export  # 显示当前导出成用户变量的shell变量

vim ~/.bashrc # 将环境变量值修改应用到所有环境
source ~/.bashrc #将修改应用到当前bash
```

- `HOME`：用户的家目录。
- `PATH`：可执行文件（命令）的存储路径。路径与路径之间用:分隔。当某个可执行文件同时出现在多个路径中时，会选择从左到右数第一个路径中的执行。下列所有存储路径的环境变量，均采用从左到右的优先顺序。
- `LD_LIBRARY_PATH`：用于指定动态链接库(.so文件)的路径，其内容是以冒号分隔的路径列表。
- `C_INCLUDE_PATH`：C语言的头文件路径，内容是以冒号分隔的路径列表。
- `CPLUS_INCLUDE_PATH`：CPP的头文件路径，内容是以冒号分隔的路径列表。
- `PYTHONPATH`：Python导入包的路径，内容是以冒号分隔的路径列表。
- `JAVA_HOME`：jdk的安装目录。
- `CLASSPATH`：存放Java导入类的路径，内容是以冒号分隔的路径列表。

### 常用变量

#### 系统状况

1. `top`:查看进程信息，任务管理器
   - 按`M`内存排序
   - 按`P`内存排序
   - `q`退出
2. `df -h`:硬盘使用情况
3. `free -h`:查看内存使用情况
4. `du -sh`:查看当前目录占用的硬盘空间
5. `ps aux`:查看所有进程
6. `kill -9 pid`：杀`pid`进程
   - `kill -s SIGTERM pid`：传递具体信号
7. `netstat -nt`:查看所有网络连接
8. `w`:列出当前登入用户
9. `ping xxx`:检查是否能连网

#### 文件权限

分别为`rwx`三个权限

1. `chmod +x xxx`：给xxx添加可执行权限
2. `chmod -x xxx`：去掉xxx的可执行权限
3. `chmod 777 xxx`：将xxx的权限改成777
4. `chmod 777 xxx -R`：递归修改整个文件夹的权限



#### 用户管理

```shell
useradd -m -U -s /bin/bash appuser # 添加用户 带home/appuser 属于同名用户组 指定了 bash
useradd -m -U -d /app appuser2 # 修改家目录
useradd -r -s /usr/sbin/nologin nginx # 添加低权限系统用户 且不能也没有-m 不能登入
userdel	# 删除用户
chown user:group dir/file # 改变文件夹或文件拥有者跟组
id	#查看用户信息（UID、GID、组）
groups	# 查看用户所属组
usermod -aG sudo acs  # 给用户acs分配sudo权限
```







#### 文件检索

1. `find /path/to/directory/ -name '*.py'`:搜路径下所有`.py`文件
2. `grep xxx`:显示并高亮含有`xxx`的读入行
3. `wc`:统计行数`-l`，统计单词数`-w`，统计字节数`-c`
4. `tree`：展示目录文件结构，展示隐藏文件`-a`
5. `ag xxx`:搜索当前目录下的文件，检索`xxx`字符串
6. `cut`:分割一行内容
   - `echo $PATH | cut -d ':' -f 3,5`：输出PATH用:分割后第3、5列数据
   - `echo $PATH | cut -d ':' -f 3-5`：输出PATH用:分割后第3-5列数据
   - `echo $PATH | cut -c 3,5`：输出PATH的第3、5个字符
   - `echo $PATH | cut -c 3-5`：输出PATH的第3-5个字符
7. `sort`:每行按字典序排序
8. `xargs`:将`stdin`中数据用空格或回车分割成命令行参数
   - `find . -name '*.py' | xargs cat | wc -l`：统计当前目录下所有python文件的总行数

#### 查看文件内容

1. `more`:浏览文件
   - 回车：下一行
   - 空格：下一页
   - `b`：上一页
   - `q`：退出
2. `less`：与``more`类似，功能更全
   - 回车：下一行
   - `y`：上一行
   - `Page Down`：下一页
   - `Page Up`：上一页
   - `q`：退出
3. `head -3 xxx`：展示xxx的前3行内容
4. `tail -3 xxx`：展示xxx的末尾3行内容

#### 用户相关

1. `history`:展示用户历史操作。内容存放在`~/.bash_history`中

#### 工具

1. `md5sum`：计算`md5`哈希值
2. `time command`：统计`command`命令的执行时间
3. `ipython3`：交互式python3环境。可以当做计算器，或者批量管理文件。
4. `watch -n 0.1 command`：每0.1秒执行一次`command`命令
5. `tar`：压缩文件
   - `tar -zcvf xxx.tar.gz /path/to/file/*`：压缩
   - `tar -zxvf xxx.tar.gz`：解压缩
6. `diff xxx yyy`：查找文件`xxx`与`yyy`的不同点

#### 安装软件

1. `sudo command`：以`root`身份执行`command`命令
2. `apt-get install xxx`：安装软件
3. `pip install xxx --user --upgrade`：安装python包

## 八、租云服务器以及配环境

### 云服务器

```shell
ssh root@xxx.xxx.xxx.xxx #公网ip

adduser acs  # 创建用户acs 或useradd
usermod -aG sudo acs  # 给用户acs分配sudo权限

#安全组设置，管理端口

#配置ssh免密登入

scp .bashrc .vimrc .tmux.conf server_name:  # server_name需要换成自己配置的别名

sudo apt-get update
sudo apt-get install tmux
```

### docker

#### 安装

```shell
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun
sudo chmod a+r /etc/apt/keyrings/docker.asc


echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
```

#### 配置

[WSL 让 Windows 拥有完美 Docker 体验 - 略懂的大龙猫的文章 - 知乎](https://zhuanlan.zhihu.com/p/692862465)

[Docker凉了，国内镜像站全军覆没！ - 大衛說的文章 - 知乎](https://zhuanlan.zhihu.com/p/710507502)

安装过后，分配sudo权限，并且重新进入服务器

```shell
sudo usermod -aG docker $USER
newgrp docker

scp /var/lib/acwing/docker/images/docker_lesson_1_0.tar server_name:  # 将镜像上传到自己租的云端服务器
ssh server_name  # 登录自己的云端服务器

docker load -i docker_lesson_1_0.tar  # 将镜像加载到本地
docker run -p 20000:22 --name my_docker_server -itd docker_lesson:1.0  # 创建并运行docker_lesson:1.0镜像

docker attach my_docker_server  # 进入创建的docker容器
passwd  # 设置root密码

apt-get update
apt-get install sudo
apt-get install openssh-server
apt-get install vim

sudo usermod -aG sudo acs #

#配置免密登入
#配置vim tmux bash

docker login <repository> # 登入私有仓库
```

#### 镜像

```shell
docker pull ubuntu:20.04：#拉取一个镜像
docker images：#列出本地所有镜像
docker image rm ubuntu:20.04 或 docker rmi ubuntu:20.04：#删除镜像ubuntu:20.04
docker [container] commit CONTAINER IMAGE_NAME:TAG：#创建某个container的镜像
docker save -o ubuntu_20_04.tar ubuntu:20.04：#将镜像ubuntu:20.04导出到本地文件
docker load -i ubuntu_20_04.tar：#将镜像ubuntu:20.04从本地文件ubuntu_20_04.tar中加载出来
```

#### 容器

```shell
docker [container] create -it ubuntu:20.04：#利用镜像ubuntu:20.04创建一个容器。
docker ps -a：#查看本地的所有容器
docker [container] start CONTAINER：#启动容器
docker [container] stop CONTAINER：#停止容器
docker [container] restart CONTAINER：#重启容器
docker [contaienr] run -itd ubuntu:20.04：#创建并启动一个容器
docker container run -it -v /yourFilePath:/csapp --name=csapp --privileged centos /bin/bash : #建立目录挂载实现文件同步
docker [container] attach CONTAINER：#进入容器
  #先按Ctrl-p，再按Ctrl-q可以挂起容器
  #Ctrl-d 退出并关闭容器
docker [container] exec CONTAINER COMMAND：#在容器中执行命令
docker exec -it <id> /bin/sh # 新建bash进程并进入
docker [container] rm CONTAINER：#删除容器
docker container prune：#删除所有已停止的容器
docker export -o xxx.tar CONTAINER：#将#容器CONTAINER导出到本地文件xxx.tar中
docker import xxx.tar image_name:tag：#将本地文件xxx.tar导入成镜像，并将镜像命名为image_name:tag
docker export/import与docker save/load的区别：
    #export/import会丢弃历史记录和元数据信息，仅保存容器当时的快照状态
    #save/load会保存完整记录，体积更大
docker top CONTAINER：#查看某个容器内的所有进程
docker stats：#查看所有容器的统计信息，包括CPU、内存、存储、网络等信息
docker cp xxx CONTAINER:xxx 或 docker cp CONTAINER:xxx xxx：#在本地和容器间复制文件
docker rename CONTAINER1 CONTAINER2：#重命名容器
docker update CONTAINER --memory 500MB：#修改容器限制

docker build -t docker_name dockerfile_dir/ # 利用dockerfile构建名为docker_name的容器
```



#### dockerfile

```dockerfile
FROM
RUN
WORKDIR
COPY
ADD
EXPOSE
CMD
ENV
ARG

# 练习 1：基础镜像和命令使用
# 
# 要求：
# 1. 使用 ubuntu:22.04 作为基础镜像
# 2. 安装 nginx 和 curl 包
# 3. 创建一个简单的 HTML 文件，内容为 "Hello Docker!"
# 4. 将 HTML 文件复制到 nginx 的默认网站目录
# 5. 暴露 80 端口
# 6. 启动 nginx 服务
#
# 提示：
# - 使用 apt-get update 和 apt-get install 安装软件包
# - nginx 的默认网站目录是 /var/www/html/
# - 使用 CMD 或 ENTRYPOINT 启动 nginx
#
# 完成这个 Dockerfile 后，构建镜像并运行容器，访问 http://localhost:8080 应该能看到 "Hello Docker!" 页面

FROM ubuntu:22.04

# 在这里编写你的 Dockerfile 指令

RUN apt-get update &&\
    apt-get install -y --no-install-recommends curl nginx &&\ 
    echo "Hello Docker" > /var/www/html/index.html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


# 测试命令：
# docker build -t exercise1 .
# docker run -d -p 8080:80 exercise1 
# determined_black

# 练习 2：Python 应用构建
#
# 要求：
# 1. 创建一个简单的 Python Flask 应用的 Dockerfile
# 2. 实现以下功能：
#    - 使用 python:3.11-slim 作为基础镜像
#    - 安装应用依赖
#    - 创建非 root 用户运行应用
#    - 配置工作目录
#    - 设置环境变量
#    - 暴露应用端口
#
# 提示：
# - 使用 requirements.txt 管理依赖
# - 使用 WORKDIR 设置工作目录
# - 使用 USER 指令切换用户
# - 使用 ENV 设置环境变量
#
# 测试命令：
# docker build -t exercise2 .
# docker run -d -p 5000:5000 exercise2
# curl http://127.0.0.1:5000 | grep -q "Hello Docker"

# 在这里编写你的 Dockerfile 指令

FROM python:3.11-slim

COPY requirements.txt .
RUN apt-get -y update &&\
    rm -rf /var/lib/apt/lists/* &&\
    pip install --no-cache-dir -r requirements.txt &&\
    useradd -m -U acs
WORKDIR /home/acs
COPY --chown=acs:acs app.py .
USER acs
EXPOSE 5000
# 指令运行应用
# 指定运行应用 生产/开发环境 缓冲输出
ENV FLASH_APP=app.py \
    FLASH_ENV=production \
    PYTHONUNBUFFERED=1  

CMD ["python", "app.py"]

# 练习 3：Rust 多阶段构建
# 
# 要求：
# 1. 使用多阶段构建来优化 Rust 应用的 Docker 镜像
# 2. 第一阶段：
#    - 使用 rust:1.75-slim 作为基础镜像
#    - 设置工作目录
#    - 复制 Cargo.toml 和 Cargo.lock（如果存在）
#    - 复制源代码
#    - 安装 MUSL 目标环境, 支持交叉编译 rustup target add x86_64-unknown-linux-musl
#    - 使用 cargo build --target x86_64-unknown-linux-musl --release 构建应用
# 3. 第二阶段：
#    - 使用 alpine:latest 作为基础镜像
#    - 从第一阶段复制编译好的二进制文件
#    - 设置工作目录
#    - 运行应用
#
# 提示：
# 1. 使用 COPY --from=builder 从构建阶段复制文件
# 2. 注意文件权限和所有权
# 3. 确保最终镜像尽可能小, 小于 20 M
#
# 测试命令：
# docker build -t rust-exercise3 .
# docker run rust-exercise3

# 在这里编写你的 Dockerfile

FROM rust:1.75-slim as builder
WORKDIR /app
COPY Cargo.toml .
COPY src ./src
RUN apt-get update && \
    rustup target add x86_64-unknown-linux-musl && \
    cargo build --target x86_64-unknown-linux-musl --release

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/target/x86_64-unknown-linux-musl/release/rust-docker-example .
CMD ["./rust-docker-example"]
```

#### 存储

Docker 提供了三种主要的数据管理方式：

1. **默认存储**：容器内的数据随容器删除而丢失
2. **Volumes（卷）**：由 Docker 管理的持久化存储空间，完全独立于容器的生命周期
3. **Bind Mounts（绑定挂载）**：将主机上的目录或文件直接挂载到容器中

让我们通过一个 Nginx Web 服务器的例子来理解这三种方式的区别。我们将在每种方式下执行相同的操作：创建一个 HTML 文件，然后测试数据的持久性。

```shell
docker volume create volume_name # 创建卷
docker volume rm volume_name # 删除卷
docker volume inspect volume_name # 查看卷
docker volume ls
docker container run -it -v volume_name:/csapp --name=csapp centos /bin/bash
```

1. **默认存储**
   - 数据随容器删除而丢失
   - 适合存储临时数据
   - 容器间数据隔离
   - 无需额外配置
2. **Volume**
   - 数据持久化，独立于容器生命周期
   - Docker 统一管理，方便备份和迁移
   - 可以在多个容器间共享
   - 数据存储在 Docker 管理区域，安全性好
3. **Bind Mount**
   - 数据持久化，存储在主机指定位置
   - 可以直接在主机上修改文件
   - 开发环境中方便调试和修改
   - 依赖主机文件系统结构

#### 网络

```shell
docker network ls # 列出所有网络
docker network inspect <network-name> # 检查网络详情
docker network create [options] <network-name> # 创建自定义网络
docker network connect <network-name> <container-name> # 将容器连接到网络
docker network disconnect <network-name> <container-name> # 断开容器与网络的连接
docker network rm <network-name> # 删除网络
docker network prune # 删除所有未使用的网络
```



1. **Bridge 网络（桥接网络）**

   - 类似于虚拟交换机，连接上的容器可以通过它通信

   - 默认bridge的功能简单，容器间只能通过ip地址互相访问
   - 通过自定义bridge网络，实现容器间的隔离与通信



使用自定义 Bridge 网络演示 Web 应用与 Redis 通信

```shell
# 构建web-app镜像
docker build -t web-app web-app

# 创建自定义 bridge 网络
docker network create my-bridge-network

# 启动 Redis 容器
docker run -d \
    --name redis-server \
    --network my-bridge-network \
    redis:alpine

# 启动 Web 应用容器
docker run -d \
    --name web-app \
    --network my-bridge-network \
    -p 5000:5000 \
    web-app
    
# 访问应用
curl http://localhost:5000

# 多次访问，观察计数器增加
curl http://localhost:5000
curl http://localhost:5000

# 查看 Redis 中的数据
docker exec -it redis-server redis-cli get hits

# 删除用到 my-bridge-network 网络的容器
docker rm -f web-app redis-server
docker rm -f custom-container1
docker rm -f custom-container2
# 删除自定义网络
docker network rm my-bridge-network
# 删除镜像
docker rmi web-app redis:alpine
```



2. **Host网络**

Host 网络移除了容器和 Docker 主机之间的网络隔离，直接使用主机的网络

 - 最佳网络性能

 - 直接使用主机的网络栈

 - 没有网络隔离

 - 端口直接绑定到主机上**（多个容器的相同端口会冲突）**

  

3. **None网络**

None 网络完全禁用了容器的网络功能，容器在这个网络中没有任何外部网络接口

- 完全隔离的网络环境
- 容器没有网络接口
- **适用于不需要网络的批处理任务**

4. **Overlay网络**

Overlay 网络是 Docker 用于实现跨主机容器通信的网络驱动，主要用于 Docker Swarm 集群环境。

它通过在不同主机的物理网络之上创建虚拟网络，使用 VXLAN 技术在主机间建立隧道，从而实现容器间的透明通信。 

在 Overlay 网络中，每个容器都会获得一个虚拟 IP，容器之间可以直接通过这个 IP 进行通信， 而不需要关心容器具体运行在哪个主机上。

这种网络类型特别适合于微服务架构、分布式应用以及需要跨主机通信的容器化应用， 例如分布式数据库集群、消息队列集群等。

Overlay 网络支持网络加密，能确保跨主机通信的安全性， 同时还提供了负载均衡和服务发现等特性，是构建大规模容器集群的重要基础设施。



#### compose

Docker Compose 是一个用于定义和运行多容器 Docker 应用程序的工具。使用 Compose，你可以通过一个 YAML 文件来配置应用程序的所有服务，然后使用一个命令来创建和启动所有服务。

**概念**

- **服务 (Services)**: 容器的定义，包括使用哪个镜像、端口映射、环境变量等
- **网络 (Networks)**: 定义容器之间如何通信
- **卷 (Volumes)**: 定义数据的持久化存储
- **依赖关系 (Dependencies)**: 定义服务之间的启动顺序
- **环境变量 (Environment Variables)**: 管理不同环境的配置

**常用指令**

```shell
docker compose up # 创建和启动所有服务
docker compose up -d # 后台启动
docker compose down # 停止和删除所有服务
docker compose down -v # 停止和删除所有服务和数据卷
docker compose ps # 查看服务状态
docker compose logs # 查看服务日志
docker compose build # 重新构建服务
docker compose restart service # 重启单个服务
docker compose exec # 进入容器
```

**yaml文件结构与实例**

```yaml
# version
# services
# networks
# volumes

version: '3.8'

services:
  # Nginx 反向代理
  nginx:
    build: ./nginx
    # 添加端口映射, 将容器的 80 端口映射为宿主机的 8080
    ports:
      - "8080:80"
    # 依赖关系, 先启动后端和前端, 再启动nginx
    depends_on:
      - frontend
      - backend

  # 前端服务
  frontend:
    build: ./frontend
    # 暴露端口, 仅容器网络可见
    expose:
      - "3000"
    environment:
      - REACT_APP_API_URL=/api
    depends_on:
      - backend
    volumes:
      - ./frontend:/app # 绑定挂载宿主机目录到 /app
      - /app/node_modules # 匿名卷（保护 /app/node_modules）

  # 后端服务
  backend:
    build: ./backend
    expose:
      - "3001"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/todos
    depends_on:
      - mongodb
    volumes:
      - ./backend:/app
      - /app/node_modules

  # MongoDB 数据库
  mongodb:
    image: mongo:6
    expose:
      - "27017"
    volumes:
      - mongodb_data:/data/db

# 定义持久化存储卷
volumes:
  mongodb_data: 
```

#### 监控

```shell
# 实时查看容器资源使用状态
docker stats
# 查看容器详细信息
docker inspect <container_id>
# 查看容器内进程
docker top <container_id>
# 查看容器端口映射
docker port <container_id>
# 查看容器日志
docker logs <container_id>
# 实时查看最新日志
docker logs -f <container_id>
# 查看最近 100 行日志
docker logs --tail 100 <container_id>
# 显示时间戳
docker logs -t <container_id>

# 创建 Portainer 数据卷
docker volume create portainer_data

# 运行 Portainer 容器
docker run -d -p 9000:9000 \
    --name portainer \
    --restart=always \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v portainer_data:/data \
    portainer/portainer-ce:2.29.2
```



## 九、网络编程



### socket



#### 字节序

套接字通信过程中操作的数据都是大端存储的，包括：接收/发送的数据、IP地址、端口。

```c
#include <arpa/inet.h>
// u:unsigned
// 16: 16位, 32:32位
// h: host, 主机字节序
// n: net, 网络字节序
// s: short
// l: int

// 这套api主要用于 网络通信过程中 IP 和 端口 的 转换
// 将一个短整形从主机字节序 -> 网络字节序
uint16_t htons(uint16_t hostshort);	
// 将一个整形从主机字节序 -> 网络字节序
uint32_t htonl(uint32_t hostlong);	

// 将一个短整形从网络字节序 -> 主机字节序
uint16_t ntohs(uint16_t netshort)
// 将一个整形从网络字节序 -> 主机字节序
uint32_t ntohl(uint32_t netlong);
```



#### IP转换

虽然IP地址本质是一个整形数，但是在使用的过程中都是通过一个字符串来描述

```c
// 主机字节序的IP地址转换为网络字节序
// 主机字节序的IP地址是字符串, 网络字节序IP地址是整形
int inet_pton(int af, const char *src, void *dst); 
```

- af: 地址族(IP地址的家族包括ipv4和ipv6)协议
  - AF_INET: ipv4格式的ip地址
  - AF_INET6: ipv6格式的ip地址
- src: 传入参数, 对应要转换的点分十进制的ip地址: 192.168.1.100
- dst: 传出参数, 函数调用完成, 转换得到的大端整形IP被写入到这块内存中

```c
#include <arpa/inet.h>
// 将大端的整形数, 转换为小端的点分十进制的IP地址        
const char *inet_ntop(int af, const void *src, char *dst, socklen_t size);

// size: 修饰dst参数的, 标记dst指向的内存中最多可以存储多少个字节
```



#### sockaddr 数据结构

![image-20260217172829311](/notes/linux-notes/image-20260217172829311.png)



```c
// 在写数据的时候不好用
struct sockaddr {
	sa_family_t sa_family;       // 地址族协议, ipv4
	char        sa_data[14];     // 端口(2字节) + IP地址(4字节) + 填充(8字节)
}

typedef unsigned short  uint16_t;
typedef unsigned int    uint32_t;
typedef uint16_t in_port_t;
typedef uint32_t in_addr_t;
typedef unsigned short int sa_family_t;
#define __SOCKADDR_COMMON_SIZE (sizeof (unsigned short int))

struct in_addr {
    in_addr_t s_addr;
};  

// sizeof(struct sockaddr) == sizeof(struct sockaddr_in)
struct sockaddr_in {
    sa_family_t sin_family;		/* 地址族协议: AF_INET */
    in_port_t sin_port;         /* 端口, 2字节 -> 大端  */
    struct in_addr sin_addr;    /* IP地址, 4字节 -> 大端  */
    /* 填充 8字节 */
    unsigned char sin_zero[sizeof (struct sockaddr) - sizeof(sin_family) -
               sizeof (in_port_t) - sizeof (struct in_addr)];
};  

```



#### 套接字函数

使用套接字通信函数需要包含头文件`<arpa/inet.h>`，包含了这个头文件`<sys/socket.h>`就不用在包含了。



```c
// 创建一个套接字
int socket(int domain, int type, int protocol);

/* domain: 使用的地址族协议
    AF_INET: 使用IPv4格式的ip地址
    AF_INET6: 使用IPv6格式的ip地址
type:
    SOCK_STREAM: 使用流式的传输协议
    SOCK_DGRAM: 使用报式(报文)的传输协议
protocol: 一般写0即可, 使用默认的协议
    SOCK_STREAM: 流式传输默认使用的是tcp
    SOCK_DGRAM: 报式传输默认使用的udp 
返回值:
    成功: 可用于套接字通信的文件描述符
    失败: -1   */

// 将文件描述符和本地的IP与端口进行绑定   
int bind(int sockfd, const struct sockaddr *addr, socklen_t addrlen);

/*     
参数:
    sockfd: 监听的文件描述符, 通过socket()调用得到的返回值
    addr: 传入参数, 要绑定的IP和端口信息需要初始化到这个结构体中，IP和端口要转换为网络字节序
    addrlen: 参数addr指向的内存大小, sizeof(struct sockaddr)
返回值：成功返回0，失败返回-1
*/

// 给监听的套接字设置监听
int listen(int sockfd, int backlog);

/*
参数:
    sockfd: 文件描述符, 可以通过调用socket()得到，在监听之前必须要绑定 bind()
    backlog: 同时能处理的最大连接要求，最大值为128
返回值：函数调用成功返回0，调用失败返回 -1

*/

// 等待并接受客户端的连接请求, 建立新的连接, 会得到一个新的文件描述符(通信的)		
int accept(int sockfd, struct sockaddr *addr, socklen_t *addrlen);

/*
参数:
    sockfd: 监听的文件描述符
    addr: 传出参数, 里边存储了建立连接的客户端的地址信息
    addrlen: 传入传出参数，用于存储addr指向的内存大小
返回值：函数调用成功，得到一个文件描述符, 用于和建立连接的这个客户端通信，调用失败返回 -1

这个函数是一个阻塞函数，当没有新的客户端连接请求的时候，该函数阻塞；
当检测到有新的客户端连接请求时，阻塞解除，新连接就建立了，
得到的返回值也是一个文件描述符，基于这个文件描述符就可以和客户端通信了。
*/

// 接收数据
ssize_t read(int sockfd, void *buf, size_t size);
ssize_t recv(int sockfd, void *buf, size_t size, int flags);

/*

参数:
    sockfd: 用于通信的文件描述符, accept() 函数的返回值
    buf: 指向一块有效内存, 用于存储接收是数据
    size: 参数buf指向的内存的容量
    flags: 特殊的属性, 一般不使用, 指定为 0

返回值:
    大于0：实际接收的字节数
    等于0：对方断开了连接
    -1：接收数据失败了

如果连接没有断开，接收端接收不到数据，接收数据的函数会阻塞等待数据到达，
数据到达后函数解除阻塞，开始接收数据，当发送端断开连接，接收端无法接收到任何数据，
但是这时候就不会阻塞了，函数直接返回0。

*/

// 发送数据的函数
ssize_t write(int fd, const void *buf, size_t len);
ssize_t send(int fd, const void *buf, size_t len, int flags);

/*
参数:
    fd: 通信的文件描述符, accept() 函数的返回值
    buf: 传入参数, 要发送的字符串
    len: 要发送的字符串的长度
    flags: 特殊的属性, 一般不使用, 指定为 0

返回值：
    大于0：实际发送的字节数，和参数len是相等的
    -1：发送数据失败了
    
*/

// 成功连接服务器之后, 客户端会自动随机绑定一个端口
// 服务器端调用accept()的函数, 第二个参数存储的就是客户端的IP和端口信息
int connect(int sockfd, const struct sockaddr *addr, socklen_t addrlen);

/*
参数:
    sockfd: 通信的文件描述符, 通过调用socket()函数就得到了
    addr: 存储了要连接的服务器端的地址信息: iP 和 端口，这个IP和端口也需要转换为大端然后再赋值
    addrlen: addr指针指向的内存的大小 sizeof(struct sockaddr)
返回值：连接成功返回0，连接失败返回-1
*/

    
    
```



#### 基于tcp通信的单线程的客户端/服务端

```c
// server.c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <arpa/inet.h>

int main(){
    // 1. 创建监听的套接字
    int lfd = socket(AF_INET, SOCK_STREAM, 0);
    if(lfd == -1) {
        perror("socket");
        exit(0);
    }

    // 2. 将socket()返回值和本地的IP端口绑定到一起
    struct sockaddr_in addr;
    addr.sin_family = AF_INET;
    addr.sin_port = htons(10000);   // 大端端口
    // INADDR_ANY代表本机的所有IP, 假设有三个网卡就有三个IP地址
    // 这个宏可以代表任意一个IP地址
    // 这个宏一般用于本地的绑定操作
    addr.sin_addr.s_addr = INADDR_ANY;  // 这个宏的值为0 == 0.0.0.0
//    inet_pton(AF_INET, "192.168.237.131", &addr.sin_addr.s_addr);
    int ret = bind(lfd, (struct sockaddr*)&addr, sizeof(addr));
    if(ret == -1) {
        perror("bind");
        exit(0);
    }

    // 3. 设置监听
    ret = listen(lfd, 128);
    if(ret == -1) {
        perror("listen");
        exit(0);
    }

    // 4. 阻塞等待并接受客户端连接
    struct sockaddr_in cliaddr;
    int clilen = sizeof(cliaddr);
    int cfd = accept(lfd, (struct sockaddr*)&cliaddr, &clilen);
    if(cfd == -1) {
        perror("accept");
        exit(0);
    }
    // 打印客户端的地址信息
    char ip[24] = {0};
    printf("客户端的IP地址: %s, 端口: %d\n",
           inet_ntop(AF_INET, &cliaddr.sin_addr.s_addr, ip, sizeof(ip)),
           ntohs(cliaddr.sin_port));

    // 5. 和客户端通信
    while (1) {
        // 接收数据
        char buf[1024];
        memset(buf, 0, sizeof(buf));
        int len = read(cfd, buf, sizeof(buf));
        if (len > 0) {
            printf("客户端say: %s\n", buf);
            write(cfd, buf, len);
        } else if (len  == 0) {
            printf("客户端断开了连接...\n");
            break;
        } else {
            perror("read");
            break;
        }
    }

    close(cfd);
    close(lfd);

    return 0;
}


// client.c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <arpa/inet.h>

int main() {
    // 1. 创建通信的套接字
    int fd = socket(AF_INET, SOCK_STREAM, 0);
    if(fd == -1) {
        perror("socket");
        exit(0);
    }

    // 2. 连接服务器
    struct sockaddr_in addr;
    addr.sin_family = AF_INET;
    addr.sin_port = htons(10000);   // 大端端口
    inet_pton(AF_INET, "192.168.237.131", &addr.sin_addr.s_addr);

    int ret = connect(fd, (struct sockaddr*)&addr, sizeof(addr));
    if(ret == -1) {
        perror("connect");
        exit(0);
    }

    // 3. 和服务器端通信
    int number = 0;
    while (1) {
        // 发送数据
        char buf[1024];
        sprintf(buf, "你好, 服务器...%d\n", number++);
        write(fd, buf, strlen(buf)+1);
        
        // 接收数据
        memset(buf, 0, sizeof(buf));
        int len = read(fd, buf, sizeof(buf));
        if(len > 0) {
            printf("服务器say: %s\n", buf);
        } else if(len  == 0) {
            printf("服务器断开了连接...\n");
            break;
        } else {
            perror("read");
            break;
        }
        sleep(1);   // 每隔1s发送一条数据
    }

    close(fd);

    return 0;
}
```

### io多路复用

- IO多路转接也称为IO多路复用，它是一种网络通信的手段（机制），通过这种方式可以同时监测多个文件描述符并且这个过程是阻塞的
- 一旦检测到有文件描述符就绪（ 可以读数据或者可以写数据）程序的阻塞就会被解除，之后就可以基于这些（一个或多个）就绪的文件描述符进行通信了。
- 通过这种方式在单线程/进程的场景下也可以在服务器端实现并发。
- 常见的IO多路转接方式有：select、poll、epoll。




#### select



##### 函数

- select函数是跨平台的，Linux、Mac、Windows都是支持的。
- 通过调用这个函数可以委托内核帮助我们检测若干个文件描述符的状态，最多支持1024个
- 会传入三个线性表集合进行线性检查，检查后从同样的位置传出，原集合会被修改
  - 读缓冲区：检测里边有没有数据，如果有数据该缓冲区对应的文件描述符就绪
  - 写缓冲区：检测写缓冲区是否可以写(有没有容量)，如果有容量可以写，缓冲区对应的文件描述符就绪
  - 读写异常：检测读写缓冲区是否有异常，如果有该缓冲区对应的文件描述符就绪


```c
#include <sys/select.h>
struct timeval {
    time_t      tv_sec;         /* seconds */
    suseconds_t tv_usec;        /* microseconds */
};

// fd_set 是一个 int [32] 

int select(int nfds, fd_set *readfds, fd_set *writefds,
           fd_set *exceptfds, struct timeval * timeout);

/*

函数参数：

    nfds：委托内核检测的这三个集合中最大的文件描述符 + 1
        内核需要线性遍历这些集合中的文件描述符，这个值是循环结束的条件
        在Window中这个参数是无效的，指定为-1即可
    readfds：文件描述符的集合, 内核只检测这个集合中文件描述符对应的读缓冲区
        传入传出参数，读集合一般情况下都是需要检测的，这样才知道通过哪个文件描述符接收数据
    writefds：文件描述符的集合, 内核只检测这个集合中文件描述符对应的写缓冲区
        传入传出参数，如果不需要使用这个参数可以指定为NULL
    exceptfds：文件描述符的集合, 内核检测集合中文件描述符是否有异常状态
        传入传出参数，如果不需要使用这个参数可以指定为NULL
    timeout：超时时长，用来强制解除select()函数的阻塞的
        NULL：函数检测不到就绪的文件描述符会一直阻塞。
        等待固定时长（秒）：函数检测不到就绪的文件描述符，在指定时长之后强制解除阻塞，函数返回0
        不等待：函数不会阻塞，直接将该参数对应的结构体初始化为0即可。

函数返回值：

    大于0：成功，返回集合中已就绪的文件描述符的总个数
    等于-1：函数调用失败
    等于0：超时，没有检测到就绪的文件描述符

*/

// 将文件描述符fd从set集合中删除 == 将fd对应的标志位设置为0        
void FD_CLR(int fd, fd_set *set);
// 判断文件描述符fd是否在set集合中 == 读一下fd对应的标志位到底是0还是1
int  FD_ISSET(int fd, fd_set *set);
// 将文件描述符fd添加到set集合中 == 将fd对应的标志位设置为1
void FD_SET(int fd, fd_set *set);
// 将set集合中, 所有文件文件描述符对应的标志位设置为0, 集合中没有添加任何文件描述符
void FD_ZERO(fd_set *set);

```



##### 处理流程

![image-20260220085854214](/notes/linux-notes/image-20260220085854214.png)

```c
// server.c

#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <arpa/inet.h>

int main() {
    // 1. 创建监听的fd
    int lfd = socket(AF_INET, SOCK_STREAM, 0);

    // 2. 绑定
    struct sockaddr_in addr;
    addr.sin_family = AF_INET;
    addr.sin_port = htons(9999);
    addr.sin_addr.s_addr = INADDR_ANY;
    bind(lfd, (struct sockaddr*)&addr, sizeof(addr));

    // 3. 设置监听
    listen(lfd, 128);

    // 将监听的fd的状态检测委托给内核检测
    int maxfd = lfd;
    // 初始化检测的读集合
    fd_set rdset;
    fd_set rdtemp;
    // 清零
    FD_ZERO(&rdset);
    // 将监听的lfd设置到检测的读集合中
    FD_SET(lfd, &rdset);
    // 通过select委托内核检测读集合中的文件描述符状态, 检测read缓冲区有没有数据
    // 如果有数据, select解除阻塞返回
    // 应该让内核持续检测
    while(1) {
        // 默认阻塞
        // rdset 中是委托内核检测的所有的文件描述符
        rdtemp = rdset;
        int num = select(maxfd+1, &rdtemp, NULL, NULL, NULL);
        // rdset中的数据被内核改写了, 只保留了发生变化的文件描述的标志位上的1, 没变化的改为0
        // 只要rdset中的fd对应的标志位为1 -> 缓冲区有数据了
        // 判断
        // 有没有新连接
        if(FD_ISSET(lfd, &rdtemp)) {
            // 接受连接请求, 这个调用不阻塞
            struct sockaddr_in cliaddr;
            int cliLen = sizeof(cliaddr);
            int cfd = accept(lfd, (struct sockaddr*)&cliaddr, &cliLen);

            // 得到了有效的文件描述符
            // 通信的文件描述符添加到读集合
            // 在下一轮select检测的时候, 就能得到缓冲区的状态
            FD_SET(cfd, &rdset);
            // 重置最大的文件描述符
            maxfd = cfd > maxfd ? cfd : maxfd;
        }

        // 没有新连接, 通信
        for(int i=0; i<maxfd+1; ++i) {
			// 判断从监听的文件描述符之后到maxfd这个范围内的文件描述符是否读缓冲区有数据
            if(i != lfd && FD_ISSET(i, &rdtemp)) {
                // 接收数据
                char buf[10] = {0};
                // 一次只能接收10个字节, 客户端一次发送100个字节
                // 一次是接收不完的, 文件描述符对应的读缓冲区中还有数据
                // 下一轮select检测的时候, 内核还会标记这个文件描述符缓冲区有数据 -> 再读一次
                // 	循环会一直持续, 知道缓冲区数据被读完位置
                int len = read(i, buf, sizeof(buf));
                if(len == 0) {
                    printf("客户端关闭了连接...\n");
                    // 将检测的文件描述符从读集合中删除
                    FD_CLR(i, &rdset);
                    close(i);
                } else if(len > 0) {
                    // 收到了数据
                    // 发送数据
                    write(i, buf, strlen(buf)+1);
                } else {
                    // 异常
                    perror("read");
                }
            }
        }
    }

    return 0;
}

// client.c

#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <arpa/inet.h>

int main() {
    // 1. 创建用于通信的套接字
    int fd = socket(AF_INET, SOCK_STREAM, 0);
    if(fd == -1) {
        perror("socket");
        exit(0);
    }

    // 2. 连接服务器
    struct sockaddr_in addr;
    addr.sin_family = AF_INET;     // ipv4
    addr.sin_port = htons(9999);   // 服务器监听的端口, 字节序应该是网络字节序
    inet_pton(AF_INET, "127.0.0.1", &addr.sin_addr.s_addr);
    int ret = connect(fd, (struct sockaddr*)&addr, sizeof(addr));
    if(ret == -1) {
        perror("connect");
        exit(0);
    }

    // 通信
    while(1) {
        // 读数据
        char recvBuf[1024];
        // 写数据
        // sprintf(recvBuf, "data: %d\n", i++);
        fgets(recvBuf, sizeof(recvBuf), stdin);
        write(fd, recvBuf, strlen(recvBuf)+1);
        // 如果客户端没有发送数据, 默认阻塞
        read(fd, recvBuf, sizeof(recvBuf));
        printf("recv buf: %s\n", recvBuf);
        sleep(1);
    }

    // 释放资源
    close(fd); 

    return 0;
}
```






#### poll

- 大多数 Unix-like 系统支持，Windows 不支持原生 poll
- 连接数量没有限制，没有最大文件描述符数量的限制



```c
#include <poll.h>
// 每个委托poll检测的fd都对应这样一个结构体
struct pollfd {
    int   fd;         /* 委托内核检测的文件描述符 */
    short events;     /* 委托内核检测文件描述符的什么事件 */
    short revents;    /* 文件描述符实际发生的事件 -> 传出 */
};

struct pollfd myfd[100];
int poll(struct pollfd *fds, nfds_t nfds, int timeout);
/*
函数参数：

    fds: 这是一个struct pollfd类型的数组, 里边存储了待检测的文件描述符的信息，这个数组中有三个成员：
        fd：委托内核检测的文件描述符
        events：委托内核检测的fd事件（输入、输出、错误），每一个事件有多个取值
        revents：这是一个传出参数，数据由内核写入，存储内核检测之后的结果

    nfds: 这是第一个参数数组中最后一个有效元素的下标 + 1（也可以指定参数1数组的元素总个数）

    timeout: 指定poll函数的阻塞时长
        -1：一直阻塞，直到检测的集合中有就绪的文件描述符（有事件产生）解除阻塞
        0：不阻塞，不管检测集合中有没有已就绪的文件描述符，函数马上返回
        大于0：阻塞指定的毫秒（ms）数之后，解除阻塞

函数返回值：

    失败： 返回-1
    成功：返回一个大于0的整数，表示检测的集合中已就绪的文件描述符的总个数
*/
```

![image-20260220100243325](/notes/linux-notes/image-20260220100243325.png)



```c
// server.c

#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <arpa/inet.h>
#include <sys/select.h>
#include <poll.h>

int main() {
    // 1.创建套接字
    int lfd = socket(AF_INET, SOCK_STREAM, 0);
    if(lfd == -1) {
        perror("socket");
        exit(0);
    }
    // 2. 绑定 ip, port
    struct sockaddr_in addr;
    addr.sin_port = htons(9999);
    addr.sin_family = AF_INET;
    addr.sin_addr.s_addr = INADDR_ANY;
    int ret = bind(lfd, (struct sockaddr*)&addr, sizeof(addr));
    if(ret == -1) {
        perror("bind");
        exit(0);
    }
    // 3. 监听
    ret = listen(lfd, 100);
    if(ret == -1) {
        perror("listen");
        exit(0);
    }
    
    // 4. 等待连接 -> 循环
    // 检测 -> 读缓冲区, 委托内核去处理
    // 数据初始化, 创建自定义的文件描述符集
    struct pollfd fds[1024];
    // 初始化
    for(int i = 0; i < 1024; ++i) {
        fds[i].fd = -1;
        fds[i].events = POLLIN;
    }
    fds[0].fd = lfd;

    int maxfd = 0;
    while(1) {
        // 委托内核检测
        ret = poll(fds, maxfd + 1, -1);
        if(ret == -1) {
            perror("select");
            exit(0);
        }

        // 检测的度缓冲区有变化
        // 有新连接
        if(fds[0].revents & POLLIN) {
            // 接收连接请求
            struct sockaddr_in sockcli;
            int len = sizeof(sockcli);
            // 这个accept是不会阻塞的
            int connfd = accept(lfd, (struct sockaddr*)&sockcli, &len);
            // 委托内核检测connfd的读缓冲区
            int i;
            for(i=0; i<1024; ++i) {
                if(fds[i].fd == -1) {
                    fds[i].fd = connfd;
                    break;
                }
            }
            maxfd = i > maxfd ? i : maxfd;
        }
        // 通信, 有客户端发送数据过来
        for(int i = 1; i <= maxfd; ++i) {
            // 如果在集合中, 说明读缓冲区有数据
            if(fds[i].revents & POLLIN) {
                char buf[128];
                int ret = read(fds[i].fd, buf, sizeof(buf));
                if(ret == -1) {
                    perror("read");
                    exit(0);
                } else if(ret == 0) {
                    printf("对方已经关闭了连接...\n");
                    close(fds[i].fd);
                    fds[i].fd = -1;
                } else {
                    printf("客户端say: %s\n", buf);
                    write(fds[i].fd, buf, strlen(buf)+1);
                }
            }
        }
    }
    close(lfd);
    return 0;
}

// client.c

#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <arpa/inet.h>

int main() {
    // 1. 创建用于通信的套接字
    int fd = socket(AF_INET, SOCK_STREAM, 0);
    if(fd == -1) {
        perror("socket");
        exit(0);
    }

    // 2. 连接服务器
    struct sockaddr_in addr;
    addr.sin_family = AF_INET;  // ipv4
    addr.sin_port = htons(9999);   // 服务器监听的端口, 字节序应该是网络字节序
    inet_pton(AF_INET, "127.0.0.1", &addr.sin_addr.s_addr);
    int ret = connect(fd, (struct sockaddr*)&addr, sizeof(addr));
    if(ret == -1) {
        perror("connect");
        exit(0);
    }

    // 通信
    while(1) {
        // 读数据
        char recvBuf[1024];
        // 写数据
        // sprintf(recvBuf, "data: %d\n", i++);
        fgets(recvBuf, sizeof(recvBuf), stdin);
        write(fd, recvBuf, strlen(recvBuf) + 1);
        // 如果客户端没有发送数据, 默认阻塞
        read(fd, recvBuf, sizeof(recvBuf));
        printf("recv buf: %s\n", recvBuf);
        sleep(1);
    }
    // 释放资源
    close(fd); 
    return 0;
}
```





#### epoll

- 对于待检测集合select和poll是基于线性方式处理的，epoll是基于红黑树来管理待检测集合的。
- select和poll每次都会线性扫描整个待检测集合，集合越大速度越慢，epoll使用的是回调机制，效率高，处理效率也不会随着检测集合的变大而下降
- select和poll每次调用都要将 FD 集合从用户态拷贝到内核态，epoll只拷贝就绪事件
- 需要对select和poll返回的集合进行判断才能知道哪些文件描述符是就绪的，通过epoll可以直接得到已就绪的文件描述符集合
- epoll相关函数都是线程安全的



##### 操作函数



```c
#include <sys/epoll.h>

// 联合体, 多个变量共用同一块内存        
typedef union epoll_data {
 	void        *ptr;
	int          fd;	// 通常情况下使用这个成员, 和epoll_ctl的第三个参数相同即可
	uint32_t     u32;
	uint64_t     u64;
} epoll_data_t;

struct epoll_event {
	uint32_t     events;      /* Epoll events */
	epoll_data_t data;        /* User data variable */
};



作者: 苏丙榅
链接: https://subingwen.cn/linux/epoll/#2-%E6%93%8D%E4%BD%9C%E5%87%BD%E6%95%B0
来源: 爱编程的大丙
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。

// 创建epoll实例，通过一棵红黑树管理待检测集合
int epoll_create(int size);
/*
函数参数
	size：只需要指定一个大于0的数值就可以了。
函数返回值：
    失败：返回-1
    成功：返回一个有效的文件描述符，通过这个文件描述符就可以访问创建的epoll实例了
*/

// 管理红黑树上的文件描述符(添加、修改、删除)
int epoll_ctl(int epfd, int op, int fd, struct epoll_event *event);
/*

函数参数：

    epfd：epoll_create() 函数的返回值，通过这个参数找到epoll实例
    op：这是一个枚举值，控制通过该函数执行什么操作
        EPOLL_CTL_ADD：往epoll模型中添加新的节点
        EPOLL_CTL_MOD：修改epoll模型中已经存在的节点
        EPOLL_CTL_DEL：删除epoll模型中的指定的节点
    fd：文件描述符，即要添加/修改/删除的文件描述符
    event：epoll事件，用来修饰第三个参数对应的文件描述符的，指定检测这个文件描述符的什么事件
        events：委托epoll检测的事件
            EPOLLIN：读事件, 接收数据, 检测读缓冲区，如果有数据该文件描述符就绪
            EPOLLOUT：写事件, 发送数据, 检测写缓冲区，如果可写该文件描述符就绪
            EPOLLERR：异常事件
        data：用户数据变量，这是一个联合体类型，通常情况下使用里边的fd成员，用于存储待检测的文件描述符的值，在调用epoll_wait()函数的时候这个值会被传出。

函数返回值：

    失败：返回-1
    成功：返回0

*/


// 检测epoll树中是否有就绪的文件描述符
int epoll_wait(int epfd, struct epoll_event * events, int maxevents, int timeout);

/*
函数参数：

    epfd：epoll_create() 函数的返回值, 通过这个参数找到epoll实例
    events：传出参数, 这是一个结构体数组的地址, 里边存储了已就绪的文件描述符的信息
    maxevents：修饰第二个参数, 结构体数组的容量（元素个数）
    timeout：如果检测的epoll实例中没有已就绪的文件描述符，该函数阻塞的时长, 单位ms 毫秒
        0：函数不阻塞，不管epoll实例中有没有就绪的文件描述符，函数被调用后都直接返回
        大于0：如果epoll实例中没有已就绪的文件描述符，函数阻塞对应的毫秒数再返回
        -1：函数一直阻塞，直到epoll实例中有已就绪的文件描述符之后才解除阻塞

函数返回值：

    成功：
        等于0：函数是阻塞被强制解除了, 没有检测到满足条件的文件描述符
        大于0：检测到的已就绪的文件描述符的总个数
    失败：返回-1

*/

```



```c
#include <stdio.h>
#include <ctype.h>
#include <unistd.h>
#include <stdlib.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <string.h>
#include <arpa/inet.h>
#include <sys/socket.h>
#include <sys/epoll.h>

// server
int main(int argc, const char* argv[]) {
    // 创建监听的套接字
    int lfd = socket(AF_INET, SOCK_STREAM, 0);
    if(lfd == -1) {
        perror("socket error");
        exit(1);
    }

    // 绑定
    struct sockaddr_in serv_addr;
    memset(&serv_addr, 0, sizeof(serv_addr));
    serv_addr.sin_family = AF_INET;
    serv_addr.sin_port = htons(9999);
    serv_addr.sin_addr.s_addr = htonl(INADDR_ANY);  // 本地多有的 IP
    
    // 设置端口复用
    int opt = 1;
    setsockopt(lfd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

    // 绑定端口
    int ret = bind(lfd, (struct sockaddr*)&serv_addr, sizeof(serv_addr));
    if(ret == -1) {
        perror("bind error");
        exit(1);
    }

    // 监听
    ret = listen(lfd, 64);
    if(ret == -1) {
        perror("listen error");
        exit(1);
    }

    // 现在只有监听的文件描述符
    // 所有的文件描述符对应读写缓冲区状态都是委托内核进行检测的epoll
    // 创建一个epoll模型
    int epfd = epoll_create(100);
    if(epfd == -1) {
        perror("epoll_create");
        exit(0);
    }

    // 往epoll实例中添加需要检测的节点, 现在只有监听的文件描述符
    struct epoll_event ev;
    ev.events = EPOLLIN;    // 检测lfd读读缓冲区是否有数据
    ev.data.fd = lfd;
    ret = epoll_ctl(epfd, EPOLL_CTL_ADD, lfd, &ev);
    if(ret == -1) {
        perror("epoll_ctl");
        exit(0);
    }

    struct epoll_event evs[1024];
    int size = sizeof(evs) / sizeof(struct epoll_event);
    // 持续检测
    while(1) {
        // 调用一次, 检测一次
        int num = epoll_wait(epfd, evs, size, -1);
        for(int i=0; i < num; ++i) {
            // 取出当前的文件描述符
            int curfd = evs[i].data.fd;
            // 判断这个文件描述符是不是用于监听的
            if(curfd == lfd) {
                // 建立新的连接
                int cfd = accept(curfd, NULL, NULL);
                // 新得到的文件描述符添加到epoll模型中, 下一轮循环的时候就可以被检测了
                ev.events = EPOLLIN;    // 读缓冲区是否有数据
                ev.data.fd = cfd;
                ret = epoll_ctl(epfd, EPOLL_CTL_ADD, cfd, &ev);
                if(ret == -1) {
                    perror("epoll_ctl-accept");
                    exit(0);
                }
            } else {
                // 处理通信的文件描述符
                // 接收数据
                char buf[1024];
                memset(buf, 0, sizeof(buf));
                int len = recv(curfd, buf, sizeof(buf), 0);
                if(len == 0) {
                    printf("客户端已经断开了连接\n");
                    // 将这个文件描述符从epoll模型中删除
                    epoll_ctl(epfd, EPOLL_CTL_DEL, curfd, NULL);
                    close(curfd);
                } else if(len > 0) {
                    printf("客户端say: %s\n", buf);
                    send(curfd, buf, len, 0);
                } else {
                    perror("recv");
                    exit(0);
                } 
            }
        }
    }

    return 0;
}

```



##### 工作模式



###### 水平模式

介绍：

- 水平模式可以简称为LT模式，LT（level triggered）是缺省的工作方式，并且同时支持block和no-block socket。

- 在这种做法中，内核通知使用者哪些文件描述符已经就绪，之后就可以对这些已就绪的文件描述符进行IO操作了。

- 如果我们不作任何操作，内核还是会继续通知使用者。

水平模式的特点：

- 读事件：如果文件描述符对应的读缓冲区还有数据，读事件就会被触发，epoll_wait()解除阻塞
  - 当读事件被触发，epoll_wait()解除阻塞，之后就可以接收数据了
  - 如果接收数据的buf很小，不能全部将缓冲区数据读出，那么读事件会继续被触发，直到数据被全部读出，如果接收数据的内存相对较大，读数据的效率也会相对较高（减少了读数据的次数）
  - 因为读数据是被动的，必须要通过读事件才能知道有数据到达了，因此对于读事件的检测是必须的
- 写事件：如果文件描述符对应的写缓冲区可写，写事件就会被触发，epoll_wait()解除阻塞
  - 当写事件被触发，epoll_wait()解除阻塞，之后就可以将数据写入到写缓冲区了
  - 写事件的触发发生在写数据之前而不是之后，被写入到写缓冲区中的数据是由内核自动发送出去的
  - 如果写缓冲区没有被写满，写事件会一直被触发
  - 因为写数据是主动的，并且写缓冲区一般情况下都是可写的（缓冲区不满），因此对于写事件的检测不是必须的



###### 边沿模式

介绍：

- 边沿模式可以简称为ET模式，ET（edge-triggered）是高速工作方式，只支持no-block socket
- 在这种模式下，当文件描述符从未就绪变为就绪时，内核会通过epoll通知使用者。然后它会假设使用者知道文件描述符已经就绪，并且不会再为那个文件描述符发送更多的就绪通知（only once）
- 如果我们对这个文件描述符做IO操作，从而导致它再次变成未就绪，当这个未就绪的文件描述符再次变成就绪状态，内核会再次进行通知，并且还是只通知一次。
- ET模式在很大程度上减少了epoll事件被重复触发的次数，因此效率要比LT模式高。

边沿模式的特点:

读事件：当读缓冲区有新的数据进入，读事件被触发一次，没有新数据不会触发该事件

- 如果有新数据进入到读缓冲区，读事件被触发，`epoll_wait()`解除阻塞
- 读事件被触发，可以通过调用`read()/recv()`函数将缓冲区数据读出
    - 如果数据没有被全部读走，并且没有新数据进入，读事件不会再次触发，只通知一次
    - 如果数据被全部读走或者只读走一部分，此时有新数据进入，读事件被触发，并且只通知一次
    

写事件：当写缓冲区状态可写，写事件只会触发一次

- 如果写缓冲区被检测到可写，写事件被触发，`epoll_wait()`解除阻塞
- 写事件被触发，就可以通过调用`write()/send()`函数，将数据写入到写缓冲区中
    - 写缓冲区从不满到被写满，期间写事件只会被触发一次
    - 写缓冲区从满到不满，状态变为可写，写事件只会被触发一次
    

实例

- 循环接收数据，并设置套接字非阻塞
- 利用`error`信息判断数据是否接收完毕



```c
#include <stdio.h>
#include <ctype.h>
#include <unistd.h>
#include <stdlib.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <string.h>
#include <arpa/inet.h>
#include <sys/socket.h>
#include <sys/epoll.h>
#include <fcntl.h>
#include <errno.h>

// server
int main(int argc, const char* argv[]) {
    // 创建监听的套接字
    int lfd = socket(AF_INET, SOCK_STREAM, 0);
    if(lfd == -1) {
        perror("socket error");
        exit(1);
    }

    // 绑定
    struct sockaddr_in serv_addr;
    memset(&serv_addr, 0, sizeof(serv_addr));
    serv_addr.sin_family = AF_INET;
    serv_addr.sin_port = htons(9999);
    serv_addr.sin_addr.s_addr = htonl(INADDR_ANY);  // 本地多有的ＩＰ
    // 127.0.0.1
    // inet_pton(AF_INET, "127.0.0.1", &serv_addr.sin_addr.s_addr);
    
    // 设置端口复用
    int opt = 1;
    setsockopt(lfd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

    // 绑定端口
    int ret = bind(lfd, (struct sockaddr*)&serv_addr, sizeof(serv_addr));
    if(ret == -1) {
        perror("bind error");
        exit(1);
    }

    // 监听
    ret = listen(lfd, 64);
    if(ret == -1) {
        perror("listen error");
        exit(1);
    }

    // 现在只有监听的文件描述符
    // 所有的文件描述符对应读写缓冲区状态都是委托内核进行检测的epoll
    // 创建一个epoll模型
    int epfd = epoll_create(100);
    if(epfd == -1) {
        perror("epoll_create");
        exit(0);
    }

    // 往epoll实例中添加需要检测的节点, 现在只有监听的文件描述符
    struct epoll_event ev;
    ev.events = EPOLLIN;    // 检测lfd读读缓冲区是否有数据
    ev.data.fd = lfd;
    ret = epoll_ctl(epfd, EPOLL_CTL_ADD, lfd, &ev);
    if(ret == -1) {
        perror("epoll_ctl");
        exit(0);
    }


    struct epoll_event evs[1024];
    int size = sizeof(evs) / sizeof(struct epoll_event);
    // 持续检测
    while(1) {
        // 调用一次, 检测一次
        int num = epoll_wait(epfd, evs, size, -1);
        printf("==== num: %d\n", num);

        for(int i=0; i<num; ++i) {
            // 取出当前的文件描述符
            int curfd = evs[i].data.fd;
            // 判断这个文件描述符是不是用于监听的
            if(curfd == lfd) {
                // 建立新的连接
                int cfd = accept(curfd, NULL, NULL);
                // 将文件描述符设置为非阻塞
                // 得到文件描述符的属性
                int flag = fcntl(cfd, F_GETFL);
                flag |= O_NONBLOCK;
                fcntl(cfd, F_SETFL, flag);
                // 新得到的文件描述符添加到epoll模型中, 下一轮循环的时候就可以被检测了
                // 通信的文件描述符检测读缓冲区数据的时候设置为边沿模式
                ev.events = EPOLLIN | EPOLLET;    // 读缓冲区是否有数据
                ev.data.fd = cfd;
                ret = epoll_ctl(epfd, EPOLL_CTL_ADD, cfd, &ev);
                if(ret == -1) {
                    perror("epoll_ctl-accept");
                    exit(0);
                }
            } else {
                // 处理通信的文件描述符
                // 接收数据
                char buf[5];
                memset(buf, 0, sizeof(buf));
                // 循环读数据
                while(1) {
                    int len = recv(curfd, buf, sizeof(buf), 0);
                    if(len == 0) {
                        // 非阻塞模式下和阻塞模式是一样的 => 判断对方是否断开连接
                        printf("客户端断开了连接...\n");
                        // 将这个文件描述符从epoll模型中删除
                        epoll_ctl(epfd, EPOLL_CTL_DEL, curfd, NULL);
                        close(curfd);
                        break;
                    } else if(len > 0) {
                        // 通信
                        // 接收的数据打印到终端
                        write(STDOUT_FILENO, buf, len);
                        // 发送数据
                        send(curfd, buf, len, 0);
                    } else {
                        // len == -1
                        if(errno == EAGAIN) {
                            printf("数据读完了...\n");
                            break;
                        } else {
                            perror("recv");
                            exit(0);
                        }
                    }
                }
            }
        }
    }

    return 0;
}


```




## 其他

- 修改字符编码为`UTF-8`

- 修改`\etc\resolv.conf`下的DNS服务器，更新镜像源

- 出现swp文件存在报错时，可以选择删掉文件或者关掉原文件进程
