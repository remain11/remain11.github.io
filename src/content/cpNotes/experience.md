---
title: "保研机试准备经验分享"
description: "从做题方法、IDE 配置到 C++ 语法与常用算法，一份完整的保研机试准备经验。"
date: 2025-07-26
tags: [保研, 机试, 经验]
---
> 本文首发于[低rank鼠鼠交流群](https://github.com/low-rank-mice)，欢迎鼠鼠们抱团取暖。
>
> 编写日期2025/5/3 , 更新于2025/7/26
>
> 机试准备经验分享v2
>
> 本文主要是介绍C++语法，STL用法，常用算法和模板

## 声明

- 本文以C++（**C++17**），介绍相关知识点，其他语言可参考对应的语法。
- 本文要求读者具有**C语言基础知识**
- 本文以某6字平台的算法基础课为例介绍知识点，并**不构成课程购买推荐**，请根据自身情况选择课程。
- 本文结合copilot生成，可能存在错误或不准确的地方，非常感谢反馈给作者。
- **光靠看学习效率很低，一定要落实到做题上。**
- **本文所有题单已整合进http://vjudge.net/article/8781，使用该平台做题更方便**

## 如何做题



### IDE



- [dev下载链接](https://sourceforge.net/projects/orwelldevcpp/)，使用`DevCpp 5.11`默认最高支持`C++11`，开箱即用，需在编译选项中加入`-std=c++11`
- 使用`vscode`，但是需要配置环境，比较麻烦，这里不做详细介绍，优点是可以用很多拓展插件
- **不推荐使用在线ide**，不方便调试（牛客的用着还行）



### 常用oj平台

常用的oj平台有洛谷、牛客网、Codeforces、AtCoder、LeetCode和Acwing等。



在[vjudge](https://vjudge.net/)你可以找到很多oj平台的题目，并且可以在同一个平台上进行提交，使用这个平台可能需要**挂上代理**。

![image-20250502182051548](/notes/experience/image-20250502182051548.png)

可以直接在上面交题，省去每个平台注册账号的麻烦。使用时直接搜索题目昵称即可。

![image-20250502182535756](/notes/experience/image-20250502182535756.png)

### 题解

cf的题目可以直接以场次昵称在知乎上搜索其他人写的题解，也可以直接在榜单上查看`jiangly`的代码

![image-20250502234105297](/notes/experience/image-20250502234105297.png)

![image-20250502234137480](/notes/experience/image-20250502234137480.png)



![image-20250502235207752](/notes/experience/image-20250502235207752.png)



### 翻译

- 可以使用油猴脚本`cfbetter`、`atcbetter`来翻译
- 也可以在洛谷上找对应的题目翻译看
- 可以下载翻译软件，如网易有道，使用`Ctrl+D`截图翻译题目



## C++语法特性与STL

### 语法

1.  关闭同步：`ios::sync_with_stdio(false); cin.tie(nullptr); cout.tie(nullptr);`，关闭同步可以提高输入输出效率，避免了C++和C的输入输出流之间的同步。请注意关闭后不要混用`cin和scanf，cout和printf。`
2. cin和cout：`cin >> x; cout << x;`，cin和cout是C++的输入输出流，cin用于输入，cout用于输出。**cin会忽略空格和换行符，直到遇到第一个非空格字符为止。**

3.  保留小数：`cout << fixed << setprecision(2) << x;`，可以设置输出的精度，避免了浮点数输出时的科学计数法。
4.  引用：`int &a = b;`，引用是一个别名，引用必须初始化，引用不能改变指向。 (C++11引入) 
5.  结构化绑定：`auto [a, b] = make_pair(1, 2);`，结构化绑定可以将一个元组或结构体的元素解构到多个变量中。(**C++17引入**)
6.  范围for循环：`for (auto &x : arr) {}`，范围for循环可以遍历容器中的元素，`auto &x`表示引用，避免了拷贝。(C++11引入)
7.  万能头与命名空间：`#include <bits/stdc++.h>`，可以引入所有的头文件，避免了一个个引入的麻烦。命名空间`std`是C++标准库的命名空间，使用时需要加上`std::`前缀，或者使用`using namespace std;`来省略前缀。
8.  lambda表达式：`[&](int x) {}`，lambda表达式可以定义匿名函数，`[&]`表示捕获外部变量的引用，`(int x)`表示参数列表。(C++11引入)
9.  auto关键字：`auto x = 1;`，auto关键字可以自动推导变量类型，避免了手动指定类型的麻烦。(C++11引入)
10. 重载运算符：`bool operator<(const Point &a, const Point &b) {}`，重载运算符可以自定义对象的比较方式，方便使用STL容器。(C++11引入)


```cpp
#include <bits/stdc++.h>

using namespace std;

struct Point {
    int x, y;
    // 重载小于号运算符，关于为什么要写 2 个 const 和 一个 &，先不用深究，记着 
    bool operator<(const Point &other) const {
        if (x != other.x) return x < other.x; // 按x坐标排序
        return y < other.y; // 按y坐标排序
    }
};

int main() {
    ios::sync_with_stdio(false); // 关闭同步，提高输入输出效率
    cin.tie(nullptr); // 解除cin和cout的绑定
    cout.tie(nullptr); // 解除cout和cin的绑定

    int n;
    cin >> n; // 输入一个整数n
    cout << n << endl; // 输出n

    cout << fixed << setprecision(2); // 设置输出精度
    cout << 1.23456789 << endl; // 1.23

    // 结构化绑定
    auto [a, b] = make_pair(1, 2);
    cout << a << " " << b << endl; // 1 2

    // 容器遍历
    vector<int> arr = {1, 2, 3, 4, 5};
    for (auto &x : arr) {
        cout << x << " "; // 1 2 3 4 5
    }
    cout << endl;

    vector<Point> points = {{1, 2}, {3, 4}, {2, 3}};

    // 按照自定义的比较方式排序
    // 排序要满足严格弱序关系，只能小于号和大于号，不能用等于号
    sort(points.begin(), points.end());

    // 使用匿名函数
    sort(points.begin(), points.end(), [](const Point &a, const Point &b) {
        return a.y < b.y; // 按y坐标排序
    });

    // lambda表达式，&表示捕获外部变量的引用
    auto f = [&]() { 
        cout << points[0].x << " " << points[0].y << endl; // 1 2
    };

    f(); 
    // 调用lambda表达式，无引号无法使用外部变量，默认为=号
    auto g = [](int x) { 
        cout << x << endl; // 1
    };
    g(1); // 1

    // lambda的递归写法

    auto h = [&](auto&&self, int x) -> int {
        if (x == 0) return 1; // 递归终止条件
        return self(self, x - 1) + x; // 递归调用
    };

    cout << h(h, 5) << endl; // 15


    // 处理无限制制的输入
    // 直到输入结束，ctrl + d（Linux）或 ctrl + z（Windows）
    while (cin >> n) {
        cout << n << endl; // 输入一个整数n，输出n
    }
    return 0;
}
```

### STL

**这部分非常重要，一定要好好学习STL，它可以代替大部分数据结构和算法的实现，可以少写很多代码。**

#### 常用函数

- `sort(a.begin(), a.end())`：对容器a进行排序，默认升序。(`sort(a, a + n)`表示对数组a[0]到a[n-1]进行排序)
- `reverse(a.begin(), a.end())`：对数组a进行反转。
- `lower_bound(a.begin(), a.end(), x)`：返回第一个大于等于x的元素的位置。
- `unique(a.begin(), a.end())`：去重，返回去重后的数组的末尾位置。对vector去重时，`a.erase(unique(a.begin(), a.end()), a.end())`可以删除重复元素。
- `prev`和`next`：返回迭代器的前一个和后一个元素。

#### string

下标从0开始的字符串，可以直接使用下标访问字符，`s[i]`表示第i个字符。也可以在字符串后面加上`+`号拼接字符串，`s1 + s2`表示将s1和s2拼接成一个新的字符串。可以使用`==`、`!=`、`<`、`>`等运算符进行字符串的比较。


- substr：`s.substr(l, len)`，返回从l开始的len长度的子串。
- find：`s.find("abc")`，返回子串"abc"在字符串s中的位置，如果没有找到返回-1。
- size：`s.size()`，返回字符串的长度。


```cpp
#include <bits/stdc++.h>

using namespace std;

int main() {
    string s = "hello world";
    cout << s[0] << endl; // h
    cout << s.substr(0, 5) << endl; // hello
    cout << s.find("world") << endl; // 6
    cout << s.find("abc") << endl; // -1
    cout << s + "!" << endl; // hello world!

    // 字符串比较

    string s1 = "abc";
    string s2 = "abcd";
    cout << (s1 < s2) << endl; // 1
    cout << (s1 > s2) << endl; // 0
    cout << (s1 == s2) << endl; // 0
    cout << (s1 != s2) << endl; // 1
    
    // 输出带空格的字符串

    string s3;
    // getline 会读取整行，包括空格，但是不包括换行符
    // 读取到换行符为止，换行符会被丢弃，所以如果上一行有换行符，请先用getline读取一次
    getline(cin, s3); // 输入一行字符串，包含空格

    cout << s3 << endl; // 输出字符串 
    return 0;
}
```

推荐题目

[文字处理软件 ](https://www.luogu.com.cn/problem/P5734)

[斯诺登的密码 ](https://www.luogu.com.cn/problem/P1603)

[ NOIP 2011 普及组 统计单词数](https://www.luogu.com.cn/problem/P1308)

#### vector/array

vector是动态数组，array是静态数组。vector的大小可以动态改变，array的大小在编译时确定。下标都是从0开始的。默认比较方式是小于号。

vector常用来动态开数组。array常用来开定长数组，有时候可以用来代替pair，或者一些简单的结构体。

vector函数

- `push_back(x)`：在末尾添加元素x。
- `pop_back()`：删除末尾元素。
- `insert(pos, x)`：在pos位置插入元素x。
- `erase(it)`：删除迭代器指向的元素。
- `clear()`：清空容器。
- `size()`：返回容器的大小。
- `begin()`：返回容器的首地址。
- `end()`：返回容器的末尾地址。

array常用函数不多，这里不介绍了。

```cpp
#include <bits/stdc++.h>

using namespace std;

int main() {
    vector<int> a = {1, 2, 3, 4, 5}; // 初始化一个vector
    a.push_back(6); // 在末尾添加元素6
    a.pop_back(); // 删除末尾元素
    a.insert(a.begin() + 2, 7); // 在第2个位置插入元素7 a[2] = 7
    a.erase(a.begin() + 2); // 删除第2个位置的元素
    cout << a.size() << endl; // 输出容器的大小
    cout << a[0] << endl; // 输出第一个元素
    cout << a.front() << endl; // 输出第一个元素
    cout << a.back() << endl; // 输出最后一个元素

    array<int, 5> b = {1, 2, 3, 4, 5}; // 初始化一个array

    for (int i = 0; i < b.size(); i++) { // 遍历array
        cout << b[i] << " "; // 输出元素
    }

    cout << b.size() << endl; // 输出数组的大小

    int n = 5, m = 10;
    // cin >> n >> m; // 输入两个整数n和m

    vector<vector<int>> c(n, vector<int>(m)); // 初始化一个n*m的二维数组

    for (auto &x : c) { // 遍历二维数组
        for (auto &y : x) { // 遍历一维数组
            cin >> y; // 输入元素
        }
    }

    return 0;
}
```

推荐题目

- [C - Minimum Glutton](https://atcoder.jp/contests/abc364/tasks/abc364_c)（橙） 学下匿名函数
- [C - Move It](https://atcoder.jp/contests/abc360/tasks/abc360_c)（橙）
- [2036D](https://codeforces.com/contest/2036/problem/D)（*1300 模拟） 



#### map/unordered_map(/multimap/unordered_multimap)

简介

- map是有序的，unordered_map是无序的。map的元素是唯一的，unordered_map的元素也是唯一的，但是没有顺序。
- map的查找和插入时间复杂度是O(logn)，unordered_map的查找和插入时间复杂度均摊是O(1)。

常用函数

- `insert({x, y})`：插入键值对x和y。
- `erase(x) erase(it)`：删除键x（如果不存在则不删除）。 删除迭代器it指向的元素。
- `find(x)`：查找键x，返回迭代器。
- `count(x)`：查找键x，返回1或0。
- `lower_bound(x)`：返回第一个大于等于x的元素的位置。
- `begin()`：返回容器的首迭代器
- `end()`：返回容器的末尾迭代器。
- `clear()`：清空容器。
- `size()`：返回容器的大小。



```cpp
#include <bits/stdc++.h>

using namespace std;

int main() {
    map<int, int> m; // 初始化一个map
    m.insert({1, 2}); // 插入键值对1和2
    m[3] = 4; // 插入键值对3和4
    m.erase(1); // 删除键1
    cout << m.size() << endl; // 输出map的大小
    cout << m[3] << endl; // 输出键3的值

    if (m.count(3)) { // 如果键3存在
        cout << m[3] << endl; // 输出键3的值
    } else {
        cout << "3 does not exist" << endl; // 输出3 does not exist
    }

    unordered_map<int, int> um; // 初始化一个unordered_map
    um.insert({1, 2}); // 插入键值对1和2
    um[3] = 4; // 插入键值对3和4
    um.erase(1); // 删除键1
    cout << um.size() << endl; // 输出unordered_map的大小
    cout << um[3] << endl; // 输出键3的值

    // 遍历map 并删除为3的元素
    for (auto it = m.begin(); it != m.end();) { // 遍历map
        if (it->first == 3) { // 如果键为3
            it = m.erase(it); // 删除键3，返回下一个迭代器
        } else {
            ++it; // 否则继续遍历
        }
    }

    for (auto [x, y] : m) { // 遍历map
        cout << x << " " << y << endl; // 输出键值对
    }

    return 0;
}
```

推荐题目

- [【深基17.例6】学籍管理](https://www.luogu.com.cn/problem/P5266)
- [A-B 数对](https://www.luogu.com.cn/problem/P1102)
- [1766B](https://codeforces.com/contest/1766/problem/B)（*1000）
- [2019B](https://codeforces.com/contest/2019/problem/B)(*1200）
- [2033D](https://codeforces.com/contest/2033/problem/D) （*1300）
- [Best Price](https://codeforces.com/contest/2051/problem/E) （*1600）
- [D - Go Stone Puzzle](https://atcoder.jp/contests/abc361/tasks/abc361_d)（黄）
- [D - Avoid K Palindrome](https://atcoder.jp/contests/abc359/tasks/abc359_d)（绿）
- [1971G](https://codeforces.com/contest/1971/problem/G) (*1700 )很色的map，什么都可以塞

拓展题目（**初学先跳过**）

- [2013D](https://codeforces.com/contest/2013/problem/D)（*1900）可以当小根堆用

#### set/unordered_set(/multiset/unordered_multiset)

简介

- set算是键值对相等的map，所以只用一个key。
- set是有序集合，unordered_set是无序集合。set的元素是唯一的，unordered_set的元素也是唯一的，但是没有顺序。
- set的查找和插入时间复杂度是O(logn)，unordered_set的查找和插入时间复杂度均摊是O(1)。
- 带muti的可以插入重复元素。

常用函数

- `insert(x)`：插入元素x。
- `erase(x) erase(it)`：删除元素x或迭代器。 如果是值，会删除所有值为x的元素。
- `find(x)`：查找元素x，返回迭代器。
- `count(x)`：查找元素x的个数。不带muti的返回1或0。
- `lower_bound(x)`：返回第一个大于等于x的元素的位置，没找到返回`end()`。 (unordered没有这个函数)
- `begin()`：返回容器的首迭代器
- `end()`：返回容器的末尾迭代器。
- `clear()`：清空容器。
- `size()`：返回容器的大小。


```cpp
#include <bits/stdc++.h>

using namespace std;

int main() {
    set<int> s; // 初始化一个set
    s.insert(1); // 插入元素1
    s.insert(2); // 插入元素2
    s.erase(1); // 删除元素1
    cout << s.size() << endl; // 输出set的大小
    cout << *s.begin() << endl; // 输出第一个元素

    if (s.count(2)) { // 如果元素2存在
        cout << "2 exists" << endl; // 输出2 exists
    } else {
        cout << "2 does not exist" << endl; // 输出2 does not exist
    }

    for (auto it = s.begin(); it != s.end();) { // 遍历set
        if (*it == 2) { // 如果元素为2
            it = s.erase(it); // 删除元素2，返回下一个迭代器
        } else {
            ++it; // 否则继续遍历
        }
    }

    for (auto x : s) { // 遍历set
        cout << x << " "; // 输出元素
    }

    cout << endl; // 换行

    // 找到第一个大于等于2的元素，并把他删除

    auto it = s.lower_bound(2); // 找到第一个大于等于2的元素
    if (it != s.end()) { // 如果找到了
        cout << *it << endl; // 输出元素
        s.erase(it); // 删除元素
    } else {
        cout << "not found" << endl; // 输出not found
    }

    // 找到第一个小于等于2的元素，并把他删除

    auto it2 = s.lower_bound(3); // 找到第一个大于等于3的元素
    if (it2 != s.begin()) { // 如果找到了
        --it2; // 找到第一个小于等于3的元素
        cout << *it2 << endl; // 输出元素
        s.erase(it2); // 删除元素
    } else {
        cout << "not found" << endl; // 输出not found
    }

    unordered_set<int> us; // 初始化一个unordered_set
    us.insert(1); // 插入元素1
    us.insert(2); // 插入元素2
    us.erase(1); // 删除元素1
    cout << us.size() << endl; // 输出unordered_set的大小
    cout << *us.begin() << endl; // 输出第一个元素

    return 0;
}
```

推荐题目

- [【深基17.例5】木材仓库](https://www.luogu.com.cn/problem/P5250)
- [P4305不重复数字](https://www.luogu.com.cn/problem/P4305)
- [1795B](https://codeforces.com/contest/1795/problem/B) （*900）
- [1749C](https://codeforces.com/contest/1749/problem/C)（*1400）[集合相似度](https://pintia.cn/problem-sets/994805046380707840/exam/problems/type/7?page=1&problemSetProblemId=994805070149828608)（傻逼题卡常，需要手写哈希表）

拓展题目（**初学先跳过**）

- [1992F](https://codeforces.com/contest/1992/problem/F)（*1900 数学）

- [2009G1](https://codeforces.com/contest/2009/problem/G1) （*1900）

  

**PS: 在cf上，会故意卡unordered_map和unordered_set的时间复杂度，会构造特殊样例造成hash冲突，导致时间复杂度变成O(n)，所以在cf上尽量使用map和set。其他时候不用担心。**

#### priority_queue

简介

优先队列，默认是大根堆，时间复杂度是O(logn)，插入和删除的时间复杂度都是O(logn)。

常用函数

- `push(x)`：插入元素x。
- `pop()`：删除堆顶元素。 需要确保堆不为空，否则会报错。
- `top()`：返回堆顶元素。 需要确保堆不为空，否则会报错。
- `size()`：返回堆的大小。

```cpp
#include <bits/stdc++.h>

using namespace std;

int main() {
    priority_queue<int> pq; // 初始化一个大根堆
    pq.push(1); // 插入元素1
    pq.push(2); // 插入元素2
    pq.push(3); // 插入元素3
    cout << pq.size() << endl; // 输出优先队列的大小
    cout << pq.top() << endl; // 输出堆顶元素

    pq.pop(); // 删除堆顶元素
    cout << pq.top() << endl; // 输出堆顶元素

    while (pq.size()) { // 遍历优先队列
        cout << pq.top() << " "; // 输出堆顶元素
        pq.pop(); // 删除堆顶元素
    }

    priority_queue<int, vector<int>, greater<int>> min_pq; // 初始化一个小根堆

    return 0;
}
```

推荐题目

[P1090 NOIP2004 提高组 合并果子](https://www.luogu.com.cn/problem/P1090)

[2003C](https://codeforces.com/contest/2003/problem/C)(*1200)

[1814C](https://codeforces.com/contest/1814/problem/C) (*1500)

拓展题目（**初学先跳过**）

[1969D](https://codeforces.com/contest/1969/problem/D)（*1900 反悔贪心）

[1989D](https://codeforces.com/contest/1989/problem/D)（*1900）

[2001D](https://codeforces.com/contest/2001/problem/D)（*1900）

#### queue/deque/stack


简介

queue是队列，先进先出，时间复杂度是O(1)，插入和删除的时间复杂度都是O(1)。deque是双端队列，可以在两端插入和删除，时间复杂度是O(1)。stack是栈，后进先出，时间复杂度是O(1)，插入和删除的时间复杂度都是O(1)。

queue常用函数

- `push(x)`：插入元素x。
- `pop()`：删除队头元素。 需要确保队列不为空
- `front()`：返回队头元素。 需要确保队列不为空
- `size()`：返回队列的大小。

stack常用函数

- `push(x)`：插入元素x。
- `pop()`：删除栈顶元素。 需要确保栈不为空
- `top()`：返回栈顶元素。 需要确保栈不为空
- `size()`：返回栈的大小。

deque常用函数

- `push_front(x)`：在队头插入元素x。
- `push_back(x)`：在队尾插入元素x。
- `pop_front()`：删除队头元素。 需要确保队列不为空
- `pop_back()`：删除队尾元素。 需要确保队列不为空
- `front()`：返回队头元素。 
- `back()`：返回队尾元素。
- `size()`：返回队列的大小。


```cpp
#include <bits/stdc++.h>

using namespace std;

int main() {
    queue<int> q; // 初始化一个队列
    q.push(1); // 插入元素1
    q.push(2); // 插入元素2
    cout << q.size() << endl; // 输出队列的大小
    cout << q.front() << endl; // 输出队头元素

    q.pop(); // 删除队头元素
    cout << q.front() << endl; // 输出队头元素

    stack<int> s; // 初始化一个栈
    s.push(1); // 插入元素1
    s.push(2); // 插入元素2
    cout << s.size() << endl; // 输出栈的大小
    cout << s.top() << endl; // 输出栈顶元素

    s.pop(); // 删除栈顶元素
    cout << s.top() << endl; // 输出栈顶元素

    deque<int> d; // 初始化一个双端队列
    d.push_front(1); // 在队头插入元素1
    d.push_back(2); // 在队尾插入元素2
    cout << d.size() << endl; // 输出双端队列的大小
    cout << d.front() << endl; // 输出队头元素
    cout << d.back() << endl; // 输出队尾元素

    d.pop_front(); // 删除队头元素
    cout << d.front() << endl; // 输出队头元素

    return 0;
}
```

使用数组模拟栈和队列

```cpp

#include <bits/stdc++.h>

using namespace std;

#define MAXN 100000 // 定义最大容量

int stack[MAXN]; // 定义栈
int top = -1; // 栈顶指针

int queue[MAXN]; // 定义队列
int hh, tt = -1; // hh表示队头，tt表示队尾

int main() {
    // 模拟栈
    stack[++top] = 1; // 入栈1
    stack[++top] = 2; // 入栈2
    cout << stack[top--] << endl; // 出栈，输出2

    while (top >= 0) { // 遍历栈
        cout << stack[top--] << " "; // 输出栈中的元素
        
    }

    // 模拟队列
    hh = 0, tt = 0; // 初始化队头和队尾
    queue[tt++] = 1; // 入队1
    queue[tt++] = 2; // 入队2
    cout << queue[hh++] << endl; // 出队，输出1

    while (hh <= tt) { // 遍历队列
        cout << queue[hh++] << " "; // 输出队列中的元素
    }

    return 0;
}
```





## 算法

- **采用某6字网站的[算法基础课](https://www.acwing.com/activity/content/11/)和[2023年蓝桥杯集训](https://www.acwing.com/activity/content/2869/)作为介绍，并不构成购买推荐**

- 按照整体难度依次列举

- **可以大部分题目可以在洛谷或者vjudge上提交，直接搜索题目即可**

- 会STL其实已经能解决大部分问题了，算法的东西有空看看即可



### 时间空间复杂度

- 时间复杂度：表示算法的时间复杂度，通常用O(n)表示，n表示数据规模。常见的时间复杂度有$O(1)$、$O(logn)$、$O(n)$、$O(nlogn)$、$O(n^2)$、$O(2^n)$等。  
- 空间复杂度：表示算法的空间复杂度，通常用O(n)表示，n表示数据规模。常见的空间复杂度有$O(1)$、$O(n)$、$O(n^2)$等。
- 一般来说题目给时间限制1-2s，空间限制64-512MB
- C++ 1s大约可以处理$10^8$次操作，2e7的int数组占用约77MB
- **不要试图在栈上（局部函数中）开大数组，会报错！**使用STL的vector等动态数组，或者在全局变量中开大数组。



**根据数据范围反推可能的算法**


$n≤30$，指数级别，使用暴搜dfs+剪枝

$n≤100$ $O(n^3)$，floyd，dp 等等

$n≤1000$ $O(n^2)$ dp，二分，朴素版Dijkstra、朴素版Prim （不超过1e4一般也能过）

$n≤1e4$ $O(n\sqrt{n})$，分块、莫队 (不超过2e5一般也能过)

$n≤1e5$ $O(nlogn)$ 各种sort，线段树、树状数组、set/map、heap、拓扑排序、堆dijkstra+heap、堆优化prim、Kruskal、二分 (1e6一般也能过)

$n≤1e6$ $O(n)$ 单调队列、hash、双指针、BFS、并查集、线性筛

$n≤1e9$ $O(\sqrt{n})$  判断质数

$n≤1e18$ $O(logn)$ 最大公约数，快速幂



### 基础算法

![image-20250503005146365](/notes/experience/image-20250503005146365.png)

- [ 选数](https://www.luogu.com.cn/problem/P1036)（暴力枚举）

- [回文质数 Prime Palindromes](https://www.luogu.com.cn/problem/P1217)（暴力枚举）

习题

![image-20250503005736986](/notes/experience/image-20250503005736986.png)

- [2032C](https://codeforces.com/contest/2032/problem/C)（*1400 二分）顺便学下lower_bound

- [2036E](https://codeforces.com/contest/2036/problem/E)（*1600 二分）顺便学下lower_bound

### 数据结构

![image-20250503011653901](/notes/experience/image-20250503011653901.png)

![image-20250503014918898](/notes/experience/image-20250503014918898.png)

习题

![image-20250503011908508](/notes/experience/image-20250503011908508.png)

### 搜索

![image-20250503012827606](/notes/experience/image-20250503012827606.png)

习题

![image-20250503013053285](/notes/experience/image-20250503013053285.png)

- [ 马的遍历 ](https://www.luogu.com.cn/problem/P1443)

- [ 2002 普及组 选数 ](https://www.luogu.com.cn/problem/P1036)

### 贪心

![image-20250503012658314](/notes/experience/image-20250503012658314.png)

### 数学

![image-20250503014308312](/notes/experience/image-20250503014308312.png)

**习题**



![image-20250503014510744](/notes/experience/image-20250503014510744.png)

### 图论

这里请学习使用`vector`建图，这更容易写。邻接表建图难写，易错。



![image-20250503012813867](/notes/experience/image-20250503012813867.png)

**习题**

![image-20250503013318344](/notes/experience/image-20250503013318344.png)

![image-20250503013539267](/notes/experience/image-20250503013539267.png)

### 动态规划

![image-20250503015114372](/notes/experience/image-20250503015114372.png)

**习题**

![image-20250503014808988](/notes/experience/image-20250503014808988.png)



## 机试真题

可以尝试一下，善用搜索引擎搜梦校的真题。[机试打卡](https://www.acwing.com/activity/content/3343/)

![image-20250502235349548](/notes/experience/image-20250502235349548.png)

![image-20250502235424498](/notes/experience/image-20250502235424498.png)



## 常用模板

### 数据结构

#### 双链表

```cpp
#include<iostream>
#include<string>

using namespace std;

const int N=1e5+10;
int e[N],l[N],r[N];
int n,idx;

void init(){
    r[0]=1,l[1]=0;
    idx=2;
}
//插入到k左边
void add(int k,int x){
    e[idx]=x;
    r[idx]=k;
    r[l[k]]=idx;
    l[idx]=l[k];
    l[k]=idx++;
}

void remove(int k){
    l[r[k]]=l[k];
    r[l[k]]=r[k];
}

int main(){
    ios::sync_with_stdio(false);
    cin.tie(0);
    cout.tie(0);
    cin>>n;
    init();
    while(n--){
        char op[5];
        cin>>op;
        int k,x;
        if(op[0]=='L'){
            // 最左侧插入一个数
            cin>>x;
            add(r[0],x);
        }else if(op[0]=='R'){
            // 最右侧插入一个数
            cin>>x;
            add(1,x);
        }else if(op[0]=='D'){
			// 删除第k个插入的数
            cin>>k;
            remove(k+1);
        }else if(op[1]=='L'){
            // 在第k个插入的数左侧插入一个数
            cin>>k>>x;
            add(k+1,x);
        }else{
            // 在第k个插入的数右侧插入一个数
            cin>>k>>x;
            add(r[k+1],x);
        }
    }
    for(int i=r[0];i!=1;i=r[i]){
        cout<<e[i]<<" ";
    }
    cout<<endl;
    return 0;
}
```

并查集

```cpp
int q[N]; // 需初始化

int f(int x){
    if(q[x]!=x){
        q[x]=f(q[x]);
    }
    return q[x];
}
```



#### st表

```cpp
void init(){
    for(int j = 0; j <= 18; j++){
        for(int i = 0; i + (1 << j) - 1 <= n; i++){
            if(!j) f[i][j] = w[i];
            else f[i][j] = max(f[i][j - 1], f[i + (1 << (j - 1))][j - 1]);
        }
    }
}
int query(int l, int r){
    int len = r - l + 1;
    int k = __lg(len);
    return max(f[l][k], f[r - (1 << k) + 1][k]);
}
```



#### Trie

```cpp
const int N=1e5+10,M=3.2e6+10;
int son[M][2],idx,a[N],cnt[M],s[N];
int n,m;

void insert(int x,int v){
    int t=0;
    for(int i=30;i>=0;i--){
        int u=x>>i&1;
        if(!son[t][u]){
            son[t][u]=++idx;
        }
        cnt[son[t][u]]+=v; //带删除的trie
        t=son[t][u];
    }
}

int query(int x){
    int t=0,res=0;
    for(int i=30;i>=0;i--){
        int u=x>>i&1;
        if(cnt[son[t][!u]]){
            res+=1<<i;
            t=son[t][!u];
        }else{
            t=son[t][u];
        }
    }
    return res;
}
```





#### 树状数组

```cpp
#define lowbit(x) ((x)&(-x))

template<typename T> struct BIT{
    vector<T> tr;
    int n;
    BIT() {}
    BIT(int n) {
        assert(n > 0);
        init(n);
    }
    void init(int _n) {
        n = _n;
        tr.assign(n + 1, T{});
    }
    T sum(int x) {
        assert(x <= n);
        T res{};
        for (; x; x -= lowbit(x)) {
            res += tr[x];
        }
        return res;
    }
    void update(int x, T c) {
        assert(x > 0);
        for (; x <= n; x += lowbit(x)) {
            tr[x] += c;
        }
    }
    // 二分 <= s 一定有解
    // 如果 >= s 转换为  <= s - 1  答案+1 但是不一定有解
    int query(T x, int pos = 0) {
        T now = 0;
        //       i = log(n)
        for (int i = 31 - __builtin_clz(n); i >= 0; i --) {
            // 防止越界 pos + 1 ~ pos + 1 << i
            if (pos + (1 << i) <= n && now + tr[pos + (1 << i)] <= x) {
                pos += 1 << i;
                now += tr[pos];
            }
        }
        return pos;
    }
};
```



#### 线段树

**单点修改 区间查询**

```cpp
struct Tr{
    int l, r;
    ll sum;
}tr[4*N];

void pushup(Tr&rt, Tr&l, Tr&r){
    rt.sum = l.sum + r.sum;
}

void pushup(int u){
    pushup(tr[u], tr[u << 1], tr[u << 1 | 1]);
}

void build(int u, int l, int r){
    if(l == r){
        tr[u]={l, r, a[l]};
        return;
    }
    tr[u] = {l, r};
    int mid = l + r >> 1;
    build(u << 1, l, mid);
    build(u << 1 | 1, mid + 1, r);
    pushup(u);
}

void update(int u, int x, int d){
    if (x <= tr[u].l && tr[u].r <= x) {
        tr[u].sum += d;
        return;
    }
    int mid = tr[u].l + tr[u].r >> 1;
    if (x <= mid) update(u << 1, x, d);
    if (x > mid) update(u << 1 | 1, x, d);
    pushup(u);
}

Tr query(int u, int l, int r){
    if (l <= tr[u].l && tr[u].r <= r) return tr[u];
    int mid = tr[u].l + tr[u].r >> 1;
    if(r <= mid) return query(u << 1, l, r);
    else if(l > mid) return query(u << 1 | 1, l, r);
    else {
        Tr res, left = query(u << 1, l, r), right = query(u << 1 | 1, l, r);
        pushup(res, left, right);
        return res;
    }
}
```

**区间修改 区间查询**

```cpp
struct Tr{
    int l, r;
    ll sum;
    int d;
}tr[4*N];

void pushup(Tr&rt, Tr&l, Tr&r){
    rt.sum = l.sum + r.sum;
}
void pushup(int u){
    pushup(tr[u], tr[u << 1], tr[u << 1 | 1]);
}
void pushdown(int u){
    auto&rt = tr[u], &left = tr[u << 1], &right = tr[u << 1 | 1];
    if(rt.d){
        left.d += rt.d, left.sum += (ll)(left.r - left.l + 1) * rt.d;
        right.d += rt.d, right.sum += (ll)(right.r - right.l + 1) * rt.d;
        rt.d = 0;
    }
}
void build(int u, int l, int r){
    if(l == r){
        tr[u]={l, r, a[l], 0};
        return;
    }
    tr[u] = {l, r};
    int mid = l + r >> 1;
    build(u << 1, l, mid);
    build(u << 1 | 1, mid + 1, r);
    pushup(u);
}
void update(int u, int l, int r, int d){
    if (l <= tr[u].l && tr[u].r <= r) {
        tr[u].d += d;
        tr[u].sum += (ll)(tr[u].r - tr[u].l + 1) * d;
        return;
    }
    pushdown(u);
    int mid = tr[u].l + tr[u].r >> 1;
    if (l <= mid) update(u << 1, l, r, d);
    if (r > mid) update(u << 1 | 1, l, r, d);
    pushup(u);
}
Tr query(int u, int l, int r){
    if (l <= tr[u].l && tr[u].r <= r) return tr[u];
    pushdown(u);
    int mid = tr[u].l + tr[u].r >> 1;
    ll sum = 0;
    if(r <= mid) return query(u << 1, l, r);
    else if(l > mid) return query(u << 1 | 1, l, r);
    else {
        Tr res, left = query(u << 1, l, r), right = query(u << 1 | 1, l, r);
        pushup(res, left, right);
        return res;
    }
}
```



### 图论

#### 建图

**vector建图(最常用)**

```cpp
typedef pair<int,int> pii;
const int N = 1e5+10;
 
// 无边权
vector<int> e[N];
e[a].push_back(b);

// 有边权
vector<pii> e[N];
e[a].push_back({b, c});
```



**邻接表**

```cpp
const int N=1e5+10;
int h[N],e[N],ne[N],idx;
int n,m;

void add(int a,int b){
    e[idx]=b,ne[idx]=h[a],h[a]=idx++;
}

int main(){
    scanf("%d%d",&n,&m);
    memset(h,-1,sizeof h);
    while(m--){
        int a,b;
        scanf("%d%d",&a,&b);
        add(a,b);
    }
}
```



**邻接矩阵**

```cpp
const int N=510,INF=0x3f3f3f3f;
int g[N][N];
int n,m;

int main(){
    scanf("%d%d",&n,&m);
    memset(g,0x3f,sizeof g);
    while(m--){
        int a,b,c;
        scanf("%d%d%d",&a,&b,&c);
        g[a][b]=g[b][a]=min(g[a][b],c);
    }
    return 0;
}
```



#### 拓扑排序

```cpp
const int N=1e5+10;
int h[N],e[N],ne[N],idx;
int n,m;
int q[N],d[N],hh,tt=-1;

void add(int a,int b){
    e[idx]=b,ne[idx]=h[a],h[a]=idx++;
}

bool toposort(){
    for(int i=1;i<=n;i++){
        if(!d[i]){
            q[++tt]=i;
        }
    }
    while(hh<=tt){
        int t=q[hh++];
        for(int i=h[t];~i;i=ne[i]){
            int j=e[i];
            d[j]--;
            if(!d[j]){
                q[++tt]=j;
            }
        }
    }
    if(tt==n-1){
        return true;
    }else{
        return false;
    }
}

int main(){
    scanf("%d%d",&n,&m);
    memset(h,-1,sizeof h);
    while(m--){
        int a,b;
        scanf("%d%d",&a,&b);
        add(a,b);
        d[b]++;
    }
    if(toposort()){
        for(int i=0;i<=n-1;i++){
            printf("%d ",q[i]);
        }
    }else{
        puts("-1");
    }
    return 0;
}
```

 

#### 最短路

**dijkstra朴素板**

```cpp
vector<pii> e[N]; 
int dist[N];
bool st[N];
int n,m;

void dijkstra() {
    memset(dist, 0x3f, sizeof dist);
    dist[1] = 0;
    for (int i = 1; i <= n; i ++) {
        int t = -1;
        for(int j = 1; j <= n; j ++) {
            if(!st[j] && (t == -1 || dist[t] > dist[j])) t = j;
        }
        st[t] = true;
        for (auto&[j, k] : e[t]) {
            dist[j] = min(dist[j], dist[t] + k);
        }
    }
}
```

**dijkstra堆优化**

```cpp
vector<pii> e[N]; 
int dist[N];
bool st[N];
int n,m;

void dijkstra() {
    memset(dist, 0x3f, sizeof dist);
    dist[1] = 0;
    priority_queue<pii, vector<pii>, greater<pii>> heap;
    heap.push({0,1});
    while (heap.size()) {
        auto t = heap.top().se;
        heap.pop();
        if(st[t])continue;
        st[t] = true;
        for (auto&[j, k] : e[t]) {
            if(dist[t] + k < dist[j]){
                dist[j] = dist[t] + k;
                heap.push({dist[j],j});
            }
        }
    }
}
```

**floyd**

```cpp
for(int k=1;k<=n;k++){
    for(int i=1;i<=n;i++){
        for(int j=1;j<=n;j++){
            d[i][j]=min(d[i][j],d[i][k]+d[k][j]);
        }
    }
}
```



#### 最小生成树

**kruskal**

```cpp
struct Edge{
    int a,b,w;
    bool operator<(const struct Edge&x){
        return w<x.w;
    }
}edge[M];

int f(int x){
    if(q[x] != x){
        q[x]=f(q[x]);
    }
    return q[x];
}

void kruskal(){
    sort(edge + 1, edge + 1 + m);
    for(int i=1;i<=n;i++) q[i]=i;
    for(int i=1;i<=m;i++){
        int a=edge[i].a,b=edge[i].b,w=edge[i].w;
        a=f(a),b=f(b);
        if(a!=b){
            res+=w;
            q[a]=b;
            cnt++;
           //  cnt < n-1 时无解
        }
    }
}
```

**prim朴素版**

也可以换堆优化版

```cpp
const int N=510,INF=0x3f3f3f3f;
int g[N][N];
int dist[N];
int n,m;
bool st[N];
int res;

bool prim(){
    memset(dist,0x3f,sizeof dist);
    dist[1]=0;
    for(int i=1;i<=n;i++){
        int t=-1;
        for(int j=1;j<=n;j++){
            if(!st[j]&&(t==-1||dist[j]<dist[t]))t=j;
        }
        st[t]=true;
        if(i!=1)res+=dist[t];
        if(i!=1&&dist[t]==INF)return false;
        for(int j=1;j<=n;j++){
            dist[j]=min(dist[j],g[t][j]);
        }
    }
    return true;
} 

int main(){
    scanf("%d%d",&n,&m);
    memset(g,0x3f,sizeof g);
    while(m--){
        int a,b,c;
        scanf("%d%d%d",&a,&b,&c);
        g[a][b]=g[b][a]=min(g[a][b],c);
    }
    if(prim()){
        printf("%d",res);
    }else{
        puts("impossible");
    }
    return 0;
}
```



#### 二分图判定

```cpp
int color[N];
vector<int> e[N];

bool dfs(int u,int c){
    color[u]=c;
    for(auto v : e[u]){
        if(!color[v]){
            if(!dfs(v,3-c))return false;
        }else if(color[u]==color[v])return false;
    }
    return true;
}
// flag$为真时为二分图，反之则不是
bool flag=true;
for(int i=1;i<=n;i++){
    if(!color[i]){
        if(!dfs(i,1)){
            flag=false;
            break;
        }
    }
}
```

#### 匈牙利算法

```cpp
const int N=510,M=1e5+10;
int h[N],e[M],ne[M],idx;
int n1,n2,m,res;
int match[N];
bool st[N];

bool find(int t){
    for(int i=h[t];~i;i=ne[i]){
        int j=e[i];
        if(!st[j]){
            st[j]=true;
            if(!match[j]||find(match[j])){
                match[j]=t;
                return true;
            }
        }
    }
    return false;
}

void add(int a,int b){
    e[idx]=b,ne[idx]=h[a],h[a]=idx++;
}

int main(){
    ios::sync_with_stdio(0);
    cin.tie(0);
    cout.tie(0);
    cin>>n1>>n2>>m;
    memset(h,-1,sizeof h);
    while(m--){
        int a,b;
        cin>>a>>b;
        add(a,b);
    }
    for(int i=1;i<=n1;i++){
        memset(st,0,sizeof st);
        if(find(i)){
            res++;
        }
    }
    cout<<res<<endl;
    return 0;
}
```

#### 最近公共祖先

```cpp
int dep[N];
int fa[N][16];

void bfs(int root){
    memset(dep, 0x3f, sizeof dep);
    dep[0] = 0;
    dep[root] = 1;
    queue<int> q;
    q.push(root);
    while (q.size()) {
        auto u = q.front();
        q.pop();
        for (auto i : e[u]) {
            if (dep[i] > dep[u]+1) {
                dep[i] = dep[u] + 1;
                q.push(i);
                fa[i][0] = u;
                for (int j = 1; j <= 15; j ++) {
                    fa[i][j] = fa[fa[i][j - 1]][j - 1];
                }
            }
        }
    }
}

int get_lca(int a, int b){
    if (dep[b] > dep[a]) return get_lca(b, a);
    for (int k = 15; k >= 0; k --) { 
        if (dep[fa[a][k]] >= dep[b]) {
            a = fa[a][k];
        }
    }
    if (a == b) return a;
    for (int k = 15; k >= 0; k --) {
        if(fa[a][k] != fa[b][k]){
            a = fa[a][k], b = fa[b][k];
        }
    }
    return fa[a][0];
}
```

### 数学

#### 质数判定

```cpp
bool isprime(int x){
    for(int i = 2; i <= x / i; i++){
        if(x % i == 0){
            return false;
        }
    }
    return true;
}
```



#### 线性筛

同时可以用来预处理某些积性函数，如$\phi(x)\ \mu(x) $等

```cpp
bool st[N];
int prime[N],phi[N],cnt;

void init(int x){
    phi[1] = 1;
    for (int i = 2; i <= x; i ++) {
        if (!st[i]){
            prime[++cnt] = i;
            phi[i] = i - 1; // 欧拉函数
        }
        for (int j = 1; prime[j] * i <= x; j ++) {
            st[i * prime[j]] = true;
            if (i % prime[j] == 0){
                phi[i * prime[j]] = phi[i] * prime[j]; // // 欧拉函数
                break;
            }
            phi[i * prime[j]] = phi[i] *(prime[j] - 1);
        }
    }
}
```

#### 分解质因数

如果 $N=p_1^{c_1}∗p_2^{c_2}∗…∗p_k^{c_k}$
约数个数：$(c_1+1)∗(c_2+1)∗…∗(c_k+1)$
约数之和： $(p_1^0+p_1^1+…+p_1^{c_1})∗…∗(p_k^0+p_k^1+…+p_k^{c_k})$

等比数列求和`ll t = 1; while (c-- ) t = (t * p + 1) % mod; `

```cpp
vector<pii> divide(int x){
    vector<pii> res;
    for(int i = 2; i <= x / i; i++){
        if(x % i == 0){
            int cnt = 0;
            while (x % i == 0){
                x /= i;
                cnt++;
            }
            res.push_back({i, cnt});
        }
    }
    if(x > 1) res.push_back({x, 1});
    return res;
}
```

#### 最大公约数

```cpp
int gcd(int a, int b) {
    return b ? gcd(b, a % b) : a;
}

int lcm(int a, int b) {
    return a / gcd(a, b) * b;
}
```



#### 逆元

当$gcd(a,p)=1,p$为质数，此时由费马小定理$a^{p-1}\equiv1(mod \ p)$有$x=a^{p-2}$， 用快速幂即可求出，即`qmi(a, p - 2)`

#### 组合数

```cpp
const int N = 1e5+10, mod = 1e9+7;
int fact[N],infact[N];
// 快速幂
int qmi(int a, int b) {
    int res = 1;
    while (b) {
        if (b & 1) res = 1ll * res * a % mod;
        b /= 2;
        a = 1ll * a * a % mod;
    }
    return res;
}
// 预处理阶乘 
void init(int x) {
    fact[0] = 1;
    for (int i = 1; i <= x; i ++) {
        fact[i] = 1ll * fact[i - 1] * i % mod;
    }
    infact[x] = qmi(fact[x], mod - 2);
    for (int i = x; i >= 1; i --) {
        infact[i - 1] = 1ll * infact[i] * i % mod;
    }
}

int C(int a, int b) {
    if(a < b || a < 0 || b < 0) return 0;
    return 1ll * fact[a] * infact[b] % mod * infact[a - b] % mod;
}
```



### 字符串



#### 哈希



```cpp
typedef long long ULL;
const int N=100010,P=131;

int n,m;
char str[N];
ULL p[N],h[N];

ULL get(int l,int r){
    return h[r]-h[l-1]*p[r-l+1];
}

int main(){
    scanf("%d%d%s",&n,&m,str+1);
    p[0]=1;
    for(int i=1;i<=n;i++){
        h[i]=P*h[i-1]+str[i];
        p[i]=P*p[i-1];
    }
    while(m--){
        int l1,r1,l2,r2;
        scanf("%d%d%d%d",&l1,&r1,&l2,&r2);
        if(get(l1,r1)==get(l2,r2)){
            printf("Yes\n");
        }else{
            printf("No\n");
        }
    }
    return 0;
}
```

#### kmp

```cpp
int n;
char p[N], s[N];

cin>>n>>p+1>>s+1;
for(int i=2,j=0;i<=n;i++){
    while(j&&p[i]!=p[j+1])j=ne[j];
    if(p[i]==p[j+1])j++;
    ne[i]=j;
}
for(int i=1,j=0;i<=m;i++){
    while(j&&s[i]!=p[j+1])j=ne[j];
    if(s[i]==p[j+1])j++;
    if(j==n)cout<<i-n<<" ";
}
```
