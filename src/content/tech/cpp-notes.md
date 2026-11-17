---
title: "C++ 学习笔记"
description: "从内存模型、引用、函数到类与对象、继承、多态的 C++ 系统学习笔记。"
date: 2026-02-01
tags: [C++, 面向对象, 笔记]
---
## 01 cpp内存模型



### 内存分区

 C++在程序执行时，将内存大方向划分为4个区域。

1. 代码区：存放函数体的二进制代码，由操作系统进行管理的。
2. 全局区：存放全局变量和静态变量以及常量。
3. 栈区：由编译器自动分配释放，存放函数的参数值、局部变量等。
4. 堆区：由程序员分配和释放，若程序员不释放，程序结束时由操作系统回收。



### new与delete

在堆区开辟内存，返回类型的指针。

```cpp
int* func()  //返回的是一个地址 int*；形参的数据也会放在栈区
{
    //在堆区创建整型数据
    //new返回是该数据类型的指针
    int* p = new int(10);
    return p;
}

void test02()
{
    //创建10整型数据的数组，在堆区
    int* arr = new int[10];//10代表数组有10个元素

    for (int i = 0; i < 10; i++)
   	{
        arr[i] = i + 100; //给10个元素赋值 100~109
    }

    for (int i = 0; i < 10; i++)
    {
        cout << arr[i] << endl; 
    }
    //释放堆区数据
    //释放数组的时候，要加[]才可以
    //多维数组要循环释放
    delete[] arr;
}

```



## 02 引用

- 给变量起别名，`int&b = a;`
- 引用必须初始化，引用在初始化后，不可以改变，本质在C++内部实现是一个指针常量`Type* const type_t = ...`
- 做函数参数时简化指针操作
- 引用是可以作为函数的返回值存在的，此时可以作为左值，不要返回局部变量引用。
- 常量引用用于修饰函数形参，防止误操作，`void p(const int & a)`,或者可用常量赋值，编译器内部会做优化，`const int&a = 10;`



## 03 函数



### 函数默认参数

- 语法：返回值类型 函数名 (参数 = 默认值) {}
- 左边都没有默认参数，右边都有
- 声明和实现只能有一个有默认参数

```cpp
//函数默认参数

//如果我们自己传入数据，就用自己的数据，如果没有，那么永默认值
//语法：返回值类型 函数名（形参 = 默认值）
int func01(int a,int b,int c) {
    return a + b + c;
}
//注意事项
//1、如果某个位置以及有了默认参数，那么从这个位置往后，从左到右都必须有默认值
int func02(int a, int b = 40, int c = 50) {
    return a + b + c;
}

//2、如果函数声明有默认参数，函数实现就不能有默认参数
//例如，函数定义为 int func03(int a = 20, int b = 20){return a + b;}，而函数声明为int func03(int a = 10, int b = 10);那么编译器不知道按照哪个默认参数来运行                                 
//声明和实现只能有一个有默认参数
int func03(int a = 10, int b = 10);

//这个是函数的实现
int func03(int a , int b) {  
    return a + b;
}
```



### 函数占位参数

 语法：返回值类型 函数名 （数据类型） {}

```cpp
void func01(int a,int) {
    cout << "this is func01" << endl;  //函数内部无法调用第二个参数，无法像a+b这样调用第二个参数   
}

//占位参数，还可以有默认参数
void func02(int a, int = 10) {
    cout << "this is func02" << endl;  
}
```



### 函数重载

- 提高复用性

- 满足条件为：

  - 同一个作用域下。

  - 函数名称相同。

  - 函数参数类型不同 或者 个数不同 或者 顺序不同。

- 函数的返回值不可以作为函数重载的条件。

```cpp
//函数重载的注意事项

//1、引用作为重载的条件
// int &a = 10; 不合法，所以fun(10);无法调用
void fun(int& a) {
    cout << "func(int &a)调用" << endl;
}
// const int &a = 10; 合法
//语法是可以的，const引用和普通引用属于类型不同，fun(10)可以调用
void fun(const int& a) {
    cout << "func(const int &a)调用" << endl;
}

//2、函数重载碰到默认参数
void func2(int a,int b = 20) {
    cout << "func2(int a,int b = 20) 的调用" << endl;
}

void func2(int a) {
    cout << "func2(int a) 的调用" << endl;
}

int main()
{
    int a = 10;  
    //变量可读可写，所以调用变量时，是调用可读可写的引用函数，const int a = 10的fun(a);调用func(const int &a)调用                           
    fun(a);
    fun(10);
               //既可以调用void func2(int a,int b = 20)，也可以调用void func2(int a)
    
    //func2(10); //当函数重载碰到默认参数，出现二义性，报错，尽量避免这种情况

    func2(10,20);  //不会出现二义性

    system("pause");

    return 0;

}
```



## 04 类和对象

对象的三大特性为：封装、继承、多态，对象上有其属性和行为。

### 封装

1. 将属性和行为作为一个整体，表现生活中的事物。
2. 将属性和行为加以权限控制。
3. struct默认权限为公共，而class默认为私有
4. 可以通过class将所有成员属性设置为私有，可以自己控制读写权限（在public中实现函数）
5. 可以通过写权限，检测数据的有效性。

```cpp
//访问权限
//三种
//公共权限 public     类内可以访问成员 类外可以访问成员
//保护权限 protected  类内可以访问成员 类外不可以访问成员 子类可以访问父类中的保护内容
//私有权限 private    类内可以访问权限 类外不可以访问成员 子类不可以访问父类中的私有内容

class Person
{
//公共权限
public:   
    string m_Name;  //姓名

protected:
    string m_Car;  //汽车

private:
    int m_Password; //银行卡密码

public:
    void func() {
        m_Name = "李四";
        m_Car = "奔驰";  //保护权限内容，在类外访问不到
        m_Password = 123;
    }
};

int main() {
    //实例化具体对象
    Person p1;
    p1.m_Name = "李四";
    p1.m_Car = "奔驰";  //保护权限内容，在类外访问不到
    p1.m_Password = 123; //私有权限内容，在类外访问不到

    p1.func();  //公共权限内容，在类可以访问
    return 0;

}
```



### 对象的初始化



#### 构造函数与析构函数

- 构造函数：主要作用在于创建对象时为对象的成员属性赋值，构造函数由编译器自动调用，无须手动调用。
  - 语法：`className () {}`
  - 没有返回值也不写void，函数名称与类名相同
  - 构造函数可以有参数，因此可以重载
  - 调用对象时候会自动调用构造，无须手动调用，而且只会调用一次

- 析构函数：主要作用在于对象销毁前系统自动调用，执行一些清理工作。
  - 语法：`~className () {}`
  - 没有返回值也不写void，函数名称与类名相同
  - 构造函数没有参数，因此**不可以重载**
  - 对象销毁前会自动调用析构，无须手动调用，而且只会调用一次
- 我们不提供构造和析构，编译器会提供编译器提供的构造函数和析构函数是空实现。

```cpp
class Person
{
public:  //无论是构造函数还是析构函数都是在public作用域下
    Person()
    {
        cout << "Person 构造函数的调用" << endl;
    }

    /*
    如果你不写，编译器会自动创建一个，但是里面是空语句
    Person()
    {
        
    }
    */

    ~Person()
    {
        cout << "Person 析构函数的调用" << endl;
    }
};

//构造和析构都是必须有的实现，如果我们自己不提供，编译器会提供一个空实现
void test01()
{
    Person p;  //创建对象的时候，自动调用构造函数
}

int main(){
    //方式一：
    test01();   // 析构释放时机在test01运行完前，test01函数运行完后，里面的对象就被释放了
    /*
    方式二：     //创建对象的时候，自动调用构造函数
    Person p;   //只有构造函数，没有析构函数，只有main函数结束完前，对象要释放掉了，才会调用析构函数
    */
    return 0;
}
```



#### 构造函数的分类

- 两种分类方式：
  1. 按参数分为：有参构造和无参构造。
  2. 按类型分为：普通构造和拷贝构造。
- 三种调用方式：
  1. 括号法
  2. 显示法
  3. 隐式转换法

```cpp
class Person {
public: 
    //构造函数  编译器默认的构造函数是无参的
    Person() {
        cout << "Person 无参构造函数的调用" << endl;
    }


    Person(int a) {
        age = a;
        cout << "Person 有参构造函数的调用" << endl;
    }

    //拷贝构造函数
    //用引用的方式传进来，不能改变原来的对象的属性，所以用const 
    Person( const Person &p) {
        // 将传入的人人身上的所有属性，拷贝到我身上
        cout << "Person 拷贝构造函数的调用" << endl;
        age = p.age;
    }

    ~Person()
    {
        cout << "Person 析构函数的调用" << endl;
    }

    int age;
};

void test01(){
    //1、括号法
    Person p1;       //默认构造函数调用
    Person p2(10);   //有参构造函数
    Person p3(p2);   //拷贝构造函数
    //注意事项1
    //调用默认构造函数的时候，不要加()。编译器会认为是一个函数的声明，
    //Person p1();
    
    //2、显示法
    Person p1;  //创建一个对象，这个对象调用的是无参构造
    Person p2 = Person(10); //有参构造  将匿名对象起了一个名称p2
    Person p3 = Person(p2); //创建一个对象，这个对象调用的是拷贝构造

    Person(10); //匿名对象 特点：当前行执行结束后，系统会立即回收匿名对象
    cout << "aaaa" << endl;  //通过打印时机可以得到：test还没结束，就运行析构函数了
    
    //注意事项2
    //不要利用拷贝构造函数 初始化匿名对象  编译器认为 Person(p3) 等价于 Person p3，认为重定义了     
    // Person(p3);
    
    //3、隐式转换法
    Person p4 = 10; //相当于 写了 Person p4 = Person(10);  调用有参构造
    Person p5 = p4; //调用拷贝构造

}
```



#### 拷贝构造函数调用时机

- 使用一个已经创建完毕的对象来初始化一个新对象。
- 值传递的方式给函数参数传值。
- 以值方式返回局部对象。

```cpp
//1、使用一个已经创建完毕的对象来初始化一个新对象
void test01() {
    Person p1(20);
    Person p2(p1);
    cout << "p2的年龄为：" << p2.m_Age << endl;
}

//2、值传递的方式给函数参数传值
void doWork(Person p) {

}

void test02() {
    Person p;
    doWork(p);   //实参传给形参的时候，会调用拷贝构造函数，这个是值传递，是一个临时的副本
                 //拷贝出去的p和原来的p 不是一个p
}

//3、值方式返回局部对象
Person doWork2()  {
    Person p1;   //局部对象
    cout << (int*)&p1 << endl;
    return p1;  //以值的方式返回一个拷贝的对象给外部，拷贝出一个对象p1'与原对象p1不一样,调用拷贝构造函数
    //程序运行结束，释放原p1，调用析构函数
}

void test03()
{
    Person p = doWork2(); //这里没有调用拷贝构造函数，直接用p接收拷贝对象p1’
    cout << (int*)&p << endl;
    //程序运行结束，释放拷贝的对象p1',调用析构函数
}

```

#### 构造函数调用规则

- 默认情况下，C++编译器至少给一个类添加3个函数。
  1. 默认构造函数(无参，函数体为空)
  2. 默认析构函数(无参，函数体为空)
  3. 默认拷贝构造函数，对属性进行值拷贝

- 构造函数调用规则如下：
  1. 如果用户定义有参构造函数，C++不再提供默认无参构造，但是会提供默认拷贝构造。
  2. 如果用户定义拷贝函数，C++不会再提供其他构造函数。

![image-20260206112639066](/notes/cpp-notes/image-20260206112639066.png)



#### 浅拷贝与深拷贝

- 浅拷贝：简单的赋值拷贝操作。
- 深拷贝：在堆区重新申请空间，进行拷贝操作。

```cpp
class Person {
public:
    Person() {
        cout << "Person的默认构造函数调用" << endl;
    }
    Person(int age,int height) {
        m_Age = age;
        m_Height = new int(height);   //把数据创建在堆区，用指针接收new创建的地址
        cout << "Person的有参构造函数调用" << endl;
    }
    //自己实现拷贝函数 解决浅拷贝带来的问题
    Person(const Person& p) {
        cout << "Person 拷贝构造函数调用" << endl;
        m_Age = p.m_Age;
        //m_Height = p.m_Height; 编译器默认实现就是这行代码，默认执行的是浅拷贝
        //浅拷贝带来的问题就是堆区的内存重复释放
        // 深拷贝操作，在堆区自己创建一份内存
        m_Height = new int(*p.m_Height);
    }
    
    ~Person() {
        //析构代码，将堆区开辟数据做释放操作
        cout << "Person的析构函数调用" << endl;
        if (m_Height != NULL) {
            delete m_Height;    //释放堆区数据

        }
    }
    int m_Age;
    int * m_Height;
};
```



#### 初始化列表

语法：`构造函数(): 属性1(值1),属性2(值2),...,() {}`

```cpp
class Person{
public:
    //传统初始化操作
    Person(int a, int b, int c) {
        m_A = a;
        m_B = b;
        m_C = c;
    }
    
     //可以灵活的初始化
    Person(int a, int b, int c) :m_A(a), m_B(b), m_C(c) {

    }
    
    int m_A;
    int m_B;
    int m_C;
};
```



#### 类对象作为类成员

 B类中有对象A作为成员，A为对象成员，那么当创建B对象时，A与B的构造和析构是符合栈的先进后出顺序:

- 先构造A，然后是B
- 先析构B，然后是A



#### 静态成员

- 静态成员就是在成员变量和成员函数前加上关键字static，称为静态成员。

- 静态成员分为：
  1. 静态成员变量
     - 所有对象共享同一份数据
     - 在编译阶段分配内存
     - 类内声明，类外初始化
  2. 静态成员函数
     - 所有对象共享同一个函数
     - 静态成员函数只能访问静态成员变量
-  调用静态成员函数有两种方法：
  - 通过对象调用
  - 通过类名调用

```cpp
class Person{
public:
    //静态成员函数
    static void func(){
        m_A = 100; //静态成员函数可以访问静态成员变量，这个数据是共享的，只有一份，所以不需要区分哪个对象的。                                
        //m_B = 200; //静态成员函数不可以访问非静态成员变量，无法区分到底是哪个对象的m_B属性，非静态成员变量属于特定的对象上面
        cout << "static void func调用" << endl;
    }
    
    static int m_A; //静态成员变量
    int m_B; //非静态成员变量

    //静态成员函数也是有访问权限的
private:
    static void func2()
    {
        cout << "static void func2调用" << endl;
    }
};

int Person::m_A = 0;
```



### C++对象模型



#### 类的存储结构

在C++中，类内对的成员变量和成员函数分开存储，只有非静态成员变量才属于类的对象上。

```cpp
class Person01 {
public:
    
};

class Person02 {
public:
    int m_A; //非静态成员变量  属于类的对象上

    static int m_B;  //静态成员变量 不属于类对象上

    void fun(){} //非静态成员函数 不属于类对象上

    static void func2() {} //静态成员函数 不属于类的对象上
};

int Person02::m_B = 0;

void test01() {
    Person01 p;
    //空对象占用内存空间为：1
    //C++编译器会给每个空对象也分配一个字节空间，是为了区分空对象占内存的位置
    //每个空对象也应该有一个独一无二的内存空间
    cout << "size of p = " << sizeof(p) << endl;
}

void test02(){
    Person02 p2;
    // 通过打印内存空间大小，检测静态成员变量、非静态成员函数等在不在对象内存上....      
    // 都是4字节
    cout << "size of p2 = " << sizeof(p2) << endl;  
}
```



#### this指针

- C++通过提供特殊的对象指针，`this`指针指向被调用的成员函数所属的对象。

- `this`指针是隐含每一个非静态成员函数内的一种指针。

- `this`指针不需要定义，直接使用即可。

- `this`指针的用途：
  1. 当形参和成员变量同名时，可用`this`指针来区分。
  2. 在类的非静态成员函数中返回对象本身，可使用`return * this`。

```cpp
class Person {
public:
    Person(int age) {
        //this指针指向的是被调用的成员函数所属的对象
        this->age = age;  //当下面实例化对象p1在调用，this就指向p1
                          //用this指针的时候，可以该变量与形参命名相同，但是编译器会认为两个不同
                          //如果这里是 age = age；那么编译器会将这两个age和上面的形参age当做同一个age，因此age并没有赋值                    
    }
    
    //如果用值的方式返回，Person PersonAddAge(Person& p){}，它返回的是本体拷贝的对象p'，而不是本体p     //要返回本体的时候，要用引用的方式返回                                
    Person& PersonAddAge(Person& p) {
        this->age += p.age; //this->age为调用对象的age

        //this指向p2的指针，而*this指向的就是p2这个对象本体
        return *this;
    }
    int age; 
};

//1、解决名称冲突
void test01() {
    Person p1(18);
    cout << "p1的年龄为：" << p1.age << endl;
}

//2、返回对象本身用*this
void test02() {
    Person p1(10);

    Person p2(10);

    //链式编程思想
    p2.PersonAddAge(p1).PersonAddAge(p1).PersonAddAge(p1);

    cout << "p2的年龄为：" << p2.age << endl;
}

```



#### 空指针访问成员函数

- C++中空指针也是可以调用成员函数的，但是也要注意有没有用到this指针。

- 如果用到this指针，需要加以判断保证代码的健壮性。

```cpp
class Person {
public:
    void showClassName() {
        cout << "this is Person class" << endl;
    }
    
    void showPersonAge() {
        if (this == NULL) {
            return; //为空的时候直接退出
        }
        cout << "age= " << this->m_Age << endl; 
    }

    int m_Age;
};

void test01() {
    Person* p = NULL;

    p->showClassName();

    p->showPersonAge();
}
```



#### const修饰成员函数

- 常函数：
  1. 成员函数后加const后我们称这个函数为常函数。
  2. 常函数内不可以修改成员属性。
  3. 成员属性声明时加关键字mutable后，在常函数中依然可以修改。

- 常对象：
  1. 声明对象前加const称该对象为常对象。
  2. 常对象只能调用常函数。



```cpp
class Person {
public:
    //this指针的本质 是指针常量 指针的指向是不可以修改的，即Person * const this                                                      
    //在成员函数后面加const，修饰的是this指向，让指针指向的值也不可以修改，即void showPerson() const 使得 const Person * const this  
    //当加了一个const
    void showPerson() const {
        //m_A = 100; //相当于 this->m_A;，由于加了一个const，所以指针指向的值不可以更改                                                                  
        //this = NULL; //this指针不可以修改指针的指向的
        this->m_B = 100; //加了mutable就可以修改this指向的值了
    }

    void func() {
        m_A = 100;
    }

    int m_A;
    mutable int m_B; //特殊变量，即使在常函数中，也可以修改这个值，加上关键字mutable
};

//常对象
void test02() {
    const Person p; //在对象前加const，变为常对象
    //p.m_A = 100;  //常对象不可以修改普通变量
    p.m_B = 100; //m_B是特殊值，在常对象下也可以修改

    //常对象只能调用常函数
    p.showPerson();
    //p.func(); //常对象 不可以调用普通成员函数，因为普通成员函数可以修改属性
}
```



### 友元

- 在程序里，有些私有属性，也想让类外特殊的一些函数或者类进行访问，就需要用到友元的技术

- 友元的目的就是让一个函数或者类访问另一个类中私有成员
- 友元的关键字为 friend

#### 全局函数做友元



```cpp
class Buiding {
    //goodfriend全局函数是Buiding类好朋友，可以访问Buiding中私有成员
    friend void goodfriend(Buiding* buiding);
public:
    Buiding() {
        m_SittingRoom = "客厅";
        m_BedRoom     = "卧室";
    }

public:
    string m_SittingRoom; //客厅

private:
    string m_BedRoom;
};

//全局函数
void goodfriend(Buiding *buiding) {
    cout << "好基友全局函数 正在访问：" << buiding->m_SittingRoom << endl;
    cout << "好基友全局函数 正在访问：" << buiding->m_BedRoom     << endl;

}

void test01() {
    Buiding building;
    goodfriend(&building);
}

```



#### 友元类

```cpp
//类做友元
class Building; //声明

class GoodGay {
public:
    GoodGay();

    void visit(); //参观函数 访问Building中的属性

    Building* building;
};

class Building {
    //GoodGay类是本类的好朋友，可以访问本类的私有成员
    friend class GoodGay;

public:
    Building();

public:
    string m_SittingRoom; //客厅
private:
    string m_BedRoom; //卧室
};

//类外写成员函数，写类名的作用域

//Building构造函数
Building::Building() {
    m_SittingRoom = "客厅";
    m_BedRoom     = "卧室";
}

//GoodGay构造函数
GoodGay::GoodGay() {
    //创建建筑物对象
    building = new Building;    //这里会调用Building的构造函数
                                //new是创建什么样的数据类型，就返回什么样的数据类型的指针       
}

void GoodGay::visit() {
    cout << "好基友类正在访问：" << building->m_SittingRoom << endl;
    cout << "好基友类正在访问：" << building->m_BedRoom << endl;
}
```



#### 成员函数做友元

```cpp
class Building;
class GoodGay {
public:
    GoodGay();

    void visit();  //让visit函数可以访问Building中私有成员
    void visit2(); //让visit2函数不可以访问Buildinng中私有成员

    Building* building;
};

class Building {
    //告诉编译器，GoodGay类下的visit成员函数作为本类的好朋友，可以访问私有成员           
    friend void GoodGay::visit();

public:
    Building();

public:
    string m_SittingRoom; //客厅

private:
    string m_BedRoom; //卧室
};

// 类外实现构造函数
Building::Building() {
    m_SittingRoom = "客厅";
    m_BedRoom     = "卧室";
}

GoodGay::GoodGay() {
    building = new Building;
}

// 类外实现成员函数
void GoodGay::visit() {
    cout << "visit 函数正在访问" << building->m_SittingRoom << endl;
    cout << "visit 函数正在访问" << building->m_BedRoom << endl;

}

void GoodGay::visit2() {
    cout << "visit2 函数正在访问" << building->m_SittingRoom << endl;
    //cout << "visit 函数正在访问" << building->m_BedRoom << endl;

}
```





### 重载



#### 重载加号

```cpp
//加号运算符重载
class Person {
public:
    //1、成员函数重载+号
    Person operator+(Person& p)
    {
        Person temp;
        temp.m_A = this->m_A + p.m_A;
        temp.m_B = this->m_B + p.m_B;
        return temp;
    }
    int m_A;
    int m_B;
};

/*
//全局函数重载+号
Person operator+(Person &p1, Person &p2)
{
    Person temp;
    temp.m_A = p1.m_A + p2.m_A;
    temp.m_B = p1.m_B + p2.m_B;
    return temp;
}
*/

//函数重载的版本
Person operator+(Person& p1, int num) {
    Person temp;
    temp.m_A = p1.m_A + num;
    temp.m_B = p1.m_B + num;
    return temp;
}

```



#### 重载左移

```cpp
class Person {
    friend ostream& operator<<(ostream& out, Person& p);	
public:
    Person(int a, int b){
        m_A = a;
        m_B = b;
    }

    /*
    //利用成员函数重载 左移运算符  p.operator<<(cout) 简化版本 p << cout
    //成员函数不能利用重载<<运算符，因为无法实现cout在左侧
    //当不知道返回值是什么类型的时候，可以先写个void，以后再改
    void operator<<(Person& p)
    {
        
    }
    */
    
private:
    int m_A;
    int m_B;
};

//只能利用全局函数重载左移运算符
//如果返回类型为void，那么就无法无限追加，也没有办法在后面添加换行符
//本质 operator << (cout , p) , 简化 cout << p
//cout是别名，这里可以取out、kn...
//cout为ostream输出流数据类型     
ostream & operator<<(ostream &cout, Person &p) {
    cout << "m_A= " << p.m_A << " m_B=" << p.m_B;
    return cout;
}


```



#### 重载递增

前置返回引用，后置返回值

```cpp
class MyInteger {
    friend ostream& operator<<(ostream& cout, MyInteger myint);

public:
    MyInteger() {
        m_Num = 0;
    }
    
    //重载前置++运算符,返回引用是为了一直对一个数据进行递增操作,而返回值并不是一直对一个数据进行递增操作                    
    MyInteger& operator++() {
        m_Num++;

        return *this;  //把自身做一个返回
    }

    //重载后置++运算符 int代表占位参数，可以用于区分前置和后置递增
    //后置递增不能返回引用，因为temp是局部变量，如果返回temp，当程序运行完后变量就释放了，再调用temp就是非法操作了           
    MyInteger operator++(int) {
        MyInteger temp = *this;
        m_Num++;
        return temp;
    }
private:
    int m_Num;
};

```



#### 重载赋值

C++编译器至少给一个类添加4个函数：

1. 默认构造函数(无参，函数体为空)
2. 默认析构函数(无参，函数体为空)
3. 默认拷贝构造函数，对属性进行值拷贝
4. 赋值运算符operator=，对属性进行值拷贝
5. 如果类中有属性指向堆区，做赋值操作时也会出现浅拷贝问题。

```cpp
class Person {
public:
    Person(int age)
    {
        m_Age = new int(age);
    }
    
    ~Person(){
        if (m_Age != NULL)
        {
            delete m_Age;
            m_Age = NULL;
        }
    }

    //重载 赋值运算符
    //如果返回的是值，而不是引用，是创建一个拷贝函数，返回的是一个副本，而不是自身
    Person& operator=(Person& p) {
        //编译器默认是提供浅拷贝
        //m_Age = p.m_Age;

        //浅拷贝带来的问题是，当创建数据在堆区时，析构代码导致内存重复释放，报错
        //应该先判断是否有属性在堆区，如果有先释放干净，然后再深拷贝
        if (m_Age != NULL) {
            delete m_Age;
            m_Age = NULL;
        }
        //深拷贝
        m_Age = new int(*p.m_Age);
        //返回对象本身
        return *this;
    }

    int *m_Age;
};
```



#### 重载函数调用

- 函数调用运算符()也可以重载。

- 由于重载后使用的方式非常像函数的调用，因此称为仿函数。

- 仿函数没有固定写法，非常灵活。

```cpp
class MyPrint {
public:

    //重载函数调用运算符
    void operator()(string test)
    {
        cout << test << endl;
    }

};

//正常函数
void MyPrint02(string test) {
    cout << test << endl;
}

void test01() {
    MyPrint myPrint;

    myPrint("hello world");

}

//仿函数非常灵活，没有固定的写法
//加法类
class MyAdd {
public:
    int operator()(int num1, int num2) {
        return num1 + num2;
    }
};

void test02() {
    MyAdd myadd;
    int ret = myadd(100,100);
    cout << "ret = " << ret << endl;

    //匿名函数对象
    cout << MyAdd()(100, 100) << endl;

    // MyAdd()为创建一个匿名对象，匿名对象的特点为当前行执行完立即释放
}
```



### 继承

基层可以减少重复代码

#### 基本语法

继承的语法：`class 子类：继承方式 父类`

```cpp
class BasePage {
public:
    void header() {
        cout << "首页、公开课、登陆、注册...(公共头部)" << endl;
    }
    void footer() {
        cout << "帮助中心、交流合作、站内地图...(公共底部)" << endl;
    }
    void left() {
        cout << "Java、Python、C++....(公共分类列表)" << endl;
    }
};

// 继承的好处：减少重复代码
// 语法：class 子类：继承方式 父类
// 子类 也称为 派生类
// 父类 也称为 基类

//Java页面
//继承了BasePage，把BasePage里面的内容全部拿到手了
class Java:public BasePage {
public:
    void content() {
        cout << "Java学科视频" << endl;
    }
};

//Python页面
class Python :public BasePage {
public:
    void content() {
        cout << "Python学科视频" << endl;
    }
};

```



#### 继承方式

- 公共继承
- 保护继承
- 私有继承

```cpp
//公共继承
class Son1:public Base1
{
public:
    void func()
    {
        m_A = 10; //父类中的公共权限成员 到子类中依然是公共权限
        m_B = 10; //父类中的保护权限成员 到子类中依然是保护权限
        //m_C = 10; //父类中的私有权限成员 子类访问不到

    }
};
//保护继承
class Son2:protected Base1
{
public:
    void func()
    {
        m_A = 10; //父类中的公共权限成员 到子类中变为保护权限
        m_B = 10; //父类中的保护权限成员 到子类中依然是保护权限
        //m_C = 10; //父类中的私有权限成员 子类访问不到

    }
};

//私有继承
class Son3:private Base1
{
public:
    void func()
    {
        m_A = 10; //父类中的公共权限成员 到子类中变为私有权限
        m_B = 10; //父类中的保护权限成员 到子类中变为私有权限
        //m_C = 10; //父类中的私有权限成员 子类访问不到

    }
};

```



#### 继承对象内存

```cpp
class Base
{
public:
    int m_A;
protected:
    int m_B;
private:
    int m_C;
};


//公共继承 16个字节 
// m_C被编译器隐藏了
class Son:public Base
{
    int m_D; 
};
```



#### 构造与析构函数

- 先调用父类构造函数，再调用子类构造函数，
- 析构顺序与构造顺序相反，先调用子类析构函数，再调用父类析构函数。



#### 同名成员处理

- 子类对象可以直接访问到子类中同名成员。
- 子类对象加作用域可以访问到父类同名成员。
- 当子类与父类拥有同名的成员函数，子类会隐藏父类中所有同名成员函数(有参、无参)，加作用域才可以访问到父类中同名函数。

```cpp
class Base {
public:
    Base() {
        m_A = 100;
    }
    int m_A;
    
    void func() {
        cout << "Base - func()调用" << endl;
    }

    void func(int a) {
        cout << "Base - func(int a)调用" << endl;
    }
};

class Son:public Base {
public:
    Son() {
        m_A = 200;
    }

    void func() {
        cout << "Son - func()调用" << endl;
    }

    int m_A;
};

//同名成员属性处理方式
void test01() {
    Son s;
    cout << "Son 下 m_A=" << s.m_A << endl;
    //如果通过子类对象访问到父类中同名成员，需要加作用域
    cout << "Base 下 m_A=" << s.Base::m_A << endl;  
}

//同名成员函数处理方式
void test02() {
    Son s;
    s.func(); //直接调用 调用时子类中的同名成员

    //调用父类中同名成员函数
    s.Base::func();

    //如果子类中出现和父类同名的成员函数，子类的同名成员会隐藏掉父类中所有同名成员函数
    //如果想访问到父类中被隐藏的同名成员函数，需要加作用域
    s.Base::func(100);
}
```



#### 同名静态成员处理

静态成员和非静态成员出现同名，处理方式一致

```cpp
class Base {
public:
    
    static int m_A;  //静态成员类内声明，类外初始化

    static void func() {
        cout << "Base - static func()" << endl;
    }

    static void func(int a) {
        cout << "Base - static func(int a)" << endl;
    }
};

int Base::m_A=100;

class Son:public Base {
public:

    static int m_A;

    static void func() {
        cout << "Son - static void func()" << endl;
    }
};

int Son::m_A = 200;

//同名静态成员属性
void test01() {
    //1、通过对象访问
    Son s;
    cout << "Son 下 m_A = " << s.m_A << endl;
    cout << "Base 下 m_A = " << s.Base::m_A << endl;

    //2、通过类名访问
    cout << "Son 下 m_A = "<< Son::m_A << endl;
    //第一个::代表通过类名方式访问  第二个::代表访问父类作用域
    cout << "Base 下 m_A= "<< Son::Base::m_A << endl;  
}

void test02() {
    //1、通过对象访问
    Son s;
    s.func();
    s.Base::func();

    //2、通过类名访问
    Son::func();
    Son::Base::func();

    //子类出现和父类同名静态成员函数，也会隐藏掉父类中所有同名成员函数
    //如何想访问父类中被隐藏同名成员，需要加作用域
    Son::Base::func(100);
}

```



#### 多继承语法

- C++运行一个类继承多个类。

- 语法：class 子类：继承方式 父类1，继承方式 父类2，.....

- 多继承可能会引发父类中有同名成员出现，需要加作用域区分。

- C++实际开发中不建议用多继承。

```cpp
class Base1 {
public:
    
    Base1() {
        m_A = 100;
    }
    
    int m_A;

};

class Base2 {
public:

    Base2() {
        m_A = 200;
    }
    int m_A;
};

//子类  需要继承Base1和Base2
//语法：class 子类：继承方式 父类1，继承方式 父类2，.....
class Son:public Base1,public Base2 {
public:

    Son() {
        m_C = 300;
        m_D = 400;
    }

    int m_C;
    int m_D;
};

void test01() {
    Son s;

    cout << "sizeof(Son):" << sizeof(s) << endl;
    //当父类中出现同名成员，需要加作用域区分
    cout << "Base1::m_A = " << s.Base1::m_A << endl;
    cout << "Base2::m_A = " << s.Base2::m_A << endl;

}
```

#### 菱形继承

- 菱形继承概念：
  1. 两个派生类继承同一个基类
  2. 又有某个类同时继承两个派生类
  3. 这种继承被称为菱形继承

- 羊继承了动物的数据，驼同样继承了动物的数据，当草泥马使用数据是，就会产生二义性。

- 草泥马继承自动物的数据继承了两份，其实我们应当清楚，这份数据我们只需要一份就可以。

- 菱形继承带来的主要问题是子类继承两份相同的数据，导致资源浪费以及毫无意义。

- 利用虚继承可以解决菱形继承问题。

```cpp
//动物类
class Animal {
public:
    int m_Age;
};

//羊类
class Sheep:public Animal{};

//驼类
class Tuo:public Animal{};

//羊驼类
class SheepTuo:public Sheep,public Tuo{};

void test01() {
    SheepTuo st;

    st.Sheep::m_Age = 18;
    st.Tuo::m_Age = 28;

    //当出现菱形继承，两个父类拥有相同数据，需要加以作用域区分
    cout << "st.Sheep::m_Age="<< st.Sheep::m_Age << endl;
    cout << "st.Tuo::m_Age=" << st.Tuo::m_Age << endl;

    //这份数据我们知道 只有一份就可以，菱形继承导致数据有两份，资源浪费
}
```

**使用虚继承**

- Sheep类和Tuo类继承的都是vbptr，vbptr(virtual base pointer)为虚基类继承指针。

- 菱形继承并不是继承两份数据，而是继承两份指针，这两个指针会分别指向虚基类表，虚基类表中会记录偏移量，加上这个偏移量，会指向这个唯一的数据。

```cpp
//动物类
class Animal {
public:
    int m_Age;
};

//利用虚继承 解决菱形继承的问题
//继承之前 加上关键字 virtual 变成 虚继承
//虚继承后，Animal类 称为 虚基类

//羊类
class Sheep:virtual public Animal{};

//驼类
class Tuo:virtual public Animal{};

//羊驼类
class SheepTuo:public Sheep,public Tuo{};

void test01() {
    SheepTuo st;

    st.Sheep::m_Age = 18;
    st.Tuo::m_Age = 28;

    //当出现菱形继承，两个父类拥有相同数据，需要加以作用域区分
    cout << "st.Sheep::m_Age="<< st.Sheep::m_Age << endl;
    cout << "st.Tuo::m_Age=" << st.Tuo::m_Age << endl;

    //虚继承，多产生一种输出方式(因为上面两个是同一份数据，所以可以不加作用域来区分了)
    cout << "st.m_Age=" << st.m_Age << endl;
}
```



### 多态

- 多态是C++面向对象三大特性之一。

- 多态分为两类：
  1. 静态多态：函数重载和运算符重载属于静态多态，复用函数名。
  2. 动态多态：派生类和虚函数实现运行时多态。

- 静态多态和动态多态区别：
  1. 静态多态的函数地址早绑定，编译阶段确定函数地址。
  2. 动态多态的函数地址晚绑定，运行阶段确定函数地址。

- 多态满足条件：
  1. 有继承关系
  2. 子类重写父类中的虚函数

- 多态使用条件：
  1. 父类指针或引用指向子类对象

- 重写：函数返回值类型、函数名、参数列表都完全一致称为重写。

#### 基本语法

早绑定

```cpp
//动物类
class Animal {
public:
    void speak() {
        cout << "动物在说话" << endl;
    }
};

//猫类
class Cat:public Animal {
public:
    void speak() {
        cout << "小猫在说话" << endl;
    }
};

//执行说话的函数
//地址早绑定 在编译阶段确定函数地址
//如果想执行让猫说话，那么这个函数就不能提前绑定，需要在运行阶段进行绑定，地址晚绑定
// Animal & animal = cat
void doSpeak(Animal &animal) {
    animal.speak();
}

void test01() {
    Cat cat;
    doSpeak(cat);
}
```

晚绑定

```cpp
//动物类
class Animal {
public:
    virtual void speak() {
        cout << "动物在说话" << endl;
    }
};

//猫类
class Cat:public Animal {
public:
    //重写 函数返回值类型、函数名、参数列表都完全相同才叫重写
    //子类virtual可写可不写，也可以写 virtual void speak()
    void speak() {
        cout << "小猫在说话" << endl;
    }
};

//狗类
class Dog:public Animal {
public:
    virtual void speak() {
        cout << "小狗在说话" << endl;
    }
};


//执行说话的函数
//地址早绑定 在编译阶段确定函数地址
//如果想执行让猫说话，那么这个函数就不能提前绑定，需要在运行阶段进行绑定，地址晚绑定

//动态多态满足条件
//1、有继承关系
//2、子类重写父类的虚函数

//动态多态使用
//父类的引用或指针指向子类对象
// Animal & animal = cat
void doSpeak(Animal &animal) {
    animal.speak();
}

void test01() {
    Cat cat;
    doSpeak(cat);

    Dog dog;
    doSpeak(dog);
}
```



#### 原理剖析

- 当没有发生重写时，子类中的虚函数表内部为父类的虚函数地址。

- 当子类重写父类的虚函数，子类中的虚函数表内部会替换成子类的虚函数地址。



#### 纯虚函数和抽象类

- 在多态中，通常父类中虚函数的实现时毫无意义的，主要都是调用子类重写的内容。因此，可以将虚函数改为纯虚函数。

- 纯虚函数语法：`virtual 返回值类型 函数名 (参数列表) = 0；`

- 当类中有了纯虚函数，这个类也称为抽象类。

- 抽象类特点：
  1. 无法实例化对象
  2. 子类必须重写抽象类中的纯虚函数，否则也属于抽象类。

```cpp
//纯虚函数和抽象类
class Base {
public:
    //纯虚函数
    //只要有一个纯虚函数，这个类称为抽象类
    //抽象类特点：
    //1、无法实例化对象
    //2、抽象类的子类 必须要重写父类中的纯虚函数，否则也属于抽象类
    virtual void func() = 0;
};

class Son : public Base {
public:
    virtual void func() {
        cout << "func函数调用" << endl;
     }
};
void test01() {
    //Base b;   //抽象类是无法实例化对象
    //new Base; //抽象类是无法实例化对象

    //Son s; //子类中必须重写父类中的纯虚函数，否则无法实例化对象

    Base* base = new Son;
    base->func();
}
```



#### 虚析构和纯虚析构

- 多态使用时，如果子类中有属性开辟到堆区，那么父类指针在释放时无法调用子类的析构代码。

- 解决方式：将父类中的析构函数改为虚析构或者纯虚析构。

- 虚析构和纯虚析构共性：
  1. 可以解决父类指针释放子类对象
  2. 都需要有具体的函数实现

- 虚析构语法：virtual.类名(){}

- 纯虚析构语法：
  1. `virtual~类名 = 0;`
  2. `类名::~类名(){}`

- 虚析构或纯虚析构就是用来解决通过父类指针释放子类对象。

- 如果子类中没有堆区数据，可以不写为虚析构或纯虚析构。

- 拥有纯虚析构函数的类也属于抽象类。

```cpp
//纯虚函数和纯虚机构
class Animal {
public:
    Animal() {
        cout << "Animal构造函数调用" << endl;
    }

    //纯虚函数
    virtual void speak() = 0;

    /*
    //利用虚析构可以解决，父类指针释放子类对象时不干净的问题
    virtual ~Animal()
    {
        cout << "Animal析构函数调用" << endl;
    }
    */

    //纯虚析构 需要声明也需要实现
    //有了纯虚析构之后，这个类也属于抽象类，无法实例化对象
    virtual ~Animal() = 0;
    
};

Animal::~Animal() {
    cout << "Animal纯虚析构函数调用" << endl;
}


class Cat : public Animal {
public:
    Cat(string name) {
        cout << "Cat构造函数调用" << endl;
        m_Name = new string(name);
    }

    virtual void speak() {
        cout << *m_Name << "小猫在说话" << endl;
    }

    ~Cat() {
        if (m_Name != NULL) {
            cout << "Cat析构函数调用" << endl;
            delete m_Name;
            m_Name = NULL;
        }
    }

    string* m_Name;
};

void test01() {
    Animal* animal = new Cat("Tom");
    animal->speak();
    //父类指针在析构时候，不会调用子类中析构函数，导致子类如果有堆区属性，出现内存泄露
    delete animal;
}
```



## 05 模板

- C++的一种编程思想称为泛型编程，主要利用的技术就是模板。

- 模板就是建立通用的模具，大大提高复用性。

- 模板的特点：
  1. 模板不可以直接使用，它只是一个框架。
  2. 模板的通用并不是万能的。

- C++提供两种模板机制：函数模板和类模板。



### 函数模板

- 函数模板作用：建立一个通用函数，其函数返回值类型和形参类型可以不具体制定，用一个虚拟的类型来代表。

- 函数模板利用关键字 `template`。

- 函数模板声明或定义为 `template<typename T>`
  1. template -- 声明创建模板
  2. typename -- 表明其后面的符号是一种数据类型，可以用class代替
  3. T -- 通用的数据类型，名称可以替换，通常为大写字母

- 使用函数模板有两种方式，自动类型推导、显示指定类型。

- 模板的目的是为了提高复用性，将类型也参数化。

```cpp
//函数模板
template<typename T> //声明一个模板，告诉编译器后面代码中紧跟着的T不要报错，T是一个通用数据类型
void mySwap(T &a, T &b) {
    T temp = a;
    a = b;
    b = temp;
}

void test02() {
    int m = 10;
    int n = 20;
    //利用函数模板交换
    //两种方式使用函数模板
    //1、自动类型推导
    mySwap(m,n); //根据m、n的数据为int，自动设置为T为int
    cout << "m= " << m << endl;
    cout << "n= " << n << endl;

    //2、显示指定类型
    mySwap<int>(m,n);  //指定模板中数据类型T为int型
    cout << "m= " << m << endl;
    cout << "n= " << n << endl;
}
```



#### 可变参数模板



1. `typename... Args` —— 参数包 (Parameter Pack)

这里的 `...` 出现在 `typename` 后面，表示 `Args` 是一个**模板参数包**。

- **含义**：它代表 0 个、1 个或多个不同的模板类型。
- **比喻**：就像一个可以自动伸缩的袋子，不管你往里面扔几个不同类型的球（`int`, `string`, `double`），它都能一次性接住。

2. `Args &&...args` —— 变长参数引用

这里的 `...` 出现在变量名 `args` 前面，表示 `args` 是一个**函数参数包**。

- **`Args &&`**：结合我们之前聊过的，它是**万能引用**。
- **`...args`**：表示这些参数可以有多个。
- **合起来的作用**：它能以“最高效且最准确”的方式接收调用者传来的所有参数。无论用户传的是左值还是右值，它都能通过引用捕获。

------

3. 代码实战拆解：它是如何“转发”的？

看你代码里的这一行：

```cpp
LogFlushFactory::CreateLog<FlushType>(std::forward<Args>(args)...);
```

这里的 `...` 放在了 `std::forward` 的外面，这叫**包展开 (Pack Expansion)**。编译器会把它展开成类似这样的形式：

- 如果你调用 `BuildLoggerFlush<FileFlush>("test.log", std::ios::app)`：
- `Args` 被推导为 `[const char*, std::ios_base::openmode]`。
- 编译器会把代码展开为： `CreateLog<FileFlush>(std::forward<const char*>(arg1), std::forward<ios_base::openmode>(arg2))`。



| **符号**                      | **术语**              | **作用**                                           |
| ----------------------------- | --------------------- | -------------------------------------------------- |
| `typename... Args`            | 模板参数包            | 声明这里可以接受任意多种类型。                     |
| `Args &&... args`             | 函数参数包 + 万能引用 | 接收任意数量的实参，并保留它们的左/右值属性。      |
| `std::forward<Args>(args)...` | 包展开 + 完美转发     | 把袋子里的参数一个一个取出来，原样传给下一个函数。 |



### 类模板

1. 类模板与函数模板区别主要有两点：
   1. 类模板没有自动类型推导的使用方式。
   2. 类模板在模板参数列表中可以有默认参数。



#### 类模板中成员函数创建时机

类模板中成员函数和普通类中成员函数创建时机是有区别的。

1. 普通类中的成员函数一开始就可以创建。
2. 类模板中的成员函数在调用时才创建。



#### 类模板对象做函数参数

1. 类模板实例化出的对象，向函数传参的方式，一共有三种传入方式：
   1. 指定传入的类型 -- 直接显示对象的数据类型
   2. 参数模板化 -- 将对象中的参数变为模板进行传递
   3. 整个类模板化 -- 将这个对象类型 模板化进行传递

2. 使用比较广泛的是第一种：指定传入类型。

```cpp
//类模板对象做函数参数
template<class T1,class T2>
class Person {
public:
    Person(T1 name, T2 age) {
        this->m_Name = name;
        this->m_Age = age;
    }

    void showPerson() {
        cout << "姓名：" << this->m_Name << " 年龄：" << this->m_Age << endl;
    }

    T1 m_Name;
    T2 m_Age;
};


//1、指定传入类型
void printPerson1(Person<string, int>& p) {
    p.showPerson();
}

void test01() {
    Person<string, int> p("孙悟空", 100);
    printPerson1(p);
}

//2、参数模板化
template<class T1,class T2>
void printPerson2(Person<T1, T2>& p) {
    p.showPerson();
    cout << "T1的类型为：" << typeid(T1).name() << endl;  //string的名字很长
    cout << "T2的类型为：" << typeid(T2).name() << endl;
}

void test02() {
    Person<string, int> p("猪八戒", 90);
    printPerson2(p);
}

//3、整个类模板化
template<class T>
void printPerson3(T &p) {
    p.showPerson();
    cout << "T的类型为：" << typeid(T).name() << endl;  //打印出来为：class Person<class std::basic_string<char,struct std::char_traits<char>,class std::allocator<char> >,int>                         
//会把整个类打印出来，类的类型为Person，里面有两个类型：basic_string型、int型，类似打印 Person<string, int>                                   
}

void test03() {
    Person<string, int> p("唐僧", 30);
    printPerson3(p);
}
```



#### 类模板与继承

- 当子类继承的父类是一个类模板时，子类在声明的时候，要指定出父类中T的类型。

- 如果不指定父类中T的类型，编译器无法给子类分配内存。

- 如果想灵活指定出父类中T的类型，子类也需要变为类模板。



```cpp
// 类模板与继承
template<class T>
class Base {
    T m;
};

// class Son :public Base 
// 报错，必须要知道父类中T类型，才能继承给子类，因为编译器不知道给子类多少个内存空间，如果T是int型给1个字节，但是T是double型给4个字节
class Son:public Base<int> {

};

void test01() {
    Son s1;
}

//如果想灵活指定父类中T类型，子类也需要变类模板
//T2给了父类
template<class T1,class T2>
class Son2 :public Base<T2> {
public:
    Son2() {
        cout << "T1的类型为：" << typeid(T1).name() << endl;
        cout << "T2的类型为：" << typeid(T2).name() << endl;
    }
    T1 obj; //T1 给了子类
};

void test02() {
    Son2 <int, char>S2; //T1为int，即obj为int型，T2为char型，即m为char型
}
```



#### 类模板成员函数类外实现

```cpp
//类模板成员函数类内实现
template<class T1,class T2>
class Person {
public:
    Person(T1 name, T2 age); //构造函数声明

    void showPerson();  //函数声明

    T1 m_Name;
    T2 m_Age;
};

//构造函数类外实现
//Person<T1,T2>说明这是一个Person类模板的类外成员函数实现，Person::Person(T1 name, T2 age)表示类的函数的类外实现，Person(T1 name, T2 age)表示构造函数
template<class T1,class T2>
Person<T1, T2>::Person(T1 name, T2 age) {
    this->m_Name = name;
    this->m_Age = age;
}

//成员函数类外实现
// 有<T1, T2>表示是类模板的成员函数类外实现，Person表示是Person作用域的showPerson函数            
template<class T1,class T2>
void Person<T1, T2>::showPerson() {
    cout << "姓名：" << this->m_Name << " 年龄：" << this->m_Age <<endl;
}

void test01() {
    Person<string,int>s1("张三",18);
    s1.showPerson();
}
```



#### 类模板分文件编写

- 类模板中成员函数创建时机是在调用阶段，导致分文件编写时链接不到。

- 解决方式：
  - 解决方式1：实现在`.h`，声明在`.cpp`，main直接包含.cpp源文件。
  - 解决方式2：将声明和实现写到同一个文件中，并更改后缀名为`.hpp`，`.hpp`是约定的名称，并不是强制。

- 主流的解决方式是第二种，将类模板成员函数写到一起，并将后缀名改为.hpp。



#### 类模板与友元

- 全局函数类内实现--直接在类内声明友元即可

- 全员函数类外实现--需要提前让编译器知道全局函数的存在

- 建议全局函数做类内实现，用法简单，而且编译器可以直接识别。



**注意：**在 C++ 中，**友元函数永远不是成员函数**，即便你把它的函数体完整地写在类定义里面。

- **成员函数**：必须通过对象来调用（如 `obj.func()`），并且函数内部隐式拥有 `this` 指针。
- **友元函数**：本质上是一个“拿到了该类家门钥匙”的外人。它在类内定义，只是为了方便编译器在处理模板时，能够根据模板参数自动生成对应的全局函数。



```cpp
//通过全局函数 打印Person信息

//提前声明，提前让编译器知道Person模板类存在
template<class T1,class T2>
class Person;

//全局函数 类外实现
//让编译器知道Person类存在后，还需要提前让编译器知道printPerson2全局函数存在
//全局函数，所以不需要加作用域
template<class T1, class T2>
void printPerson2(Person<T1, T2> p) {
    cout << "类外实现--姓名：" << p.m_Name << " 年龄：" << p.m_Age << endl;
}

template<class T1,class T2>
class Person {
    //全局函数 类内实现
    friend void printPerson(Person<T1, T2> p) {
        cout << "类内实现--姓名：" << p.m_Name << " 年龄：" << p.m_Age<<endl;
    }

    //全局函数 类外实现
    //如果全局函数
    friend void printPerson2<>(Person<T1, T2> p); //加一个空模板参数列表，表示是函数模板声明，而不是普通函数的声明                  

    //只有前面让提前让编译器知道printPerson2存在，由于printPerson2里面有Person类，所以还需要提前让编译器知道Person类存在，才能申明全局函数类外实现：friend void printPerson2<>(Person<T1, T2> p);
public:
    Person(T1 name, T2 age) {
        this->m_Name = name;
        this->m_Age = age;
    }

private:
    T1 m_Name;
    T2 m_Age;
};

//1、全局函数在类内实现
void test01() {
    Person<string, int>p("Tom", 20);
    printPerson(p);
}

//2、全局函数在类外实现
void test02() {
    Person<string, int>p("Jerry", 20);
    printPerson2(p);
}
```



### 模板局限性

- 模板的通用性并不是万能的。

- 利用具体化的模板，可以解决自定义类型的通用化。

- 学习模板并不是为了写模板，而是在STL中能够运用系统提供的模板。





## 06 文件读写



### 文件操作简介

- 程序运行时产生的数据都属于临时数据，程序一旦运行结束都会被释放。

- 通过文件可以将数据持久化。

- C++中对文件操作需要包含头文件

- 文件类型分为两种：
  1. 文本文件：文件以文本的ASCII码形式存储在计算机中。
  2. 二进制文件：文件以文本的二进制形式存储在计算机中，用户一般不能直接读懂它们。

- 操作文件的三大类

  1. ofstream：写操作

  2. ifstream：读操作
  3. fstream：读写操作

- 文件打开方式可以配合使用，利用 | 操作符。



| 打开方式    | 解释                       |
| ----------- | -------------------------- |
| ios::in     | 写文件                     |
| ios::out    | 读文件                     |
| ios::ate    | 初始位置：文件尾           |
| ios::app    | 追加写                     |
| ios::trunc  | 如果文件存在，先删除再创建 |
| ios::binary | 二进制方式                 |



### 文本文件--写文件

- 包含头文件 `#include<fstream>` 

- 创建流对象 `ofstream ofs;`

- 打开文件 `ofs.open("文件路径",打开方式);`

- 关闭文件 `ofs<<"写入数据";`

- 关闭文件 `ofs.close();`



### 文本文件--读操作

- 包含头文件 `#include<fstream>`

- 创建流对象 `ifstream ifs;`

- 打开文件并判断文件是否成功打开 `ifs.open("文件路径",打开方式);`

- 四种方式读取

- 关闭文件 `ifs.close();`

```cpp
#include <iostream>
using namespace std;
#include<fstream>
#include<string>

//文本文件 读文件

void test01(){
    //1、包含头文件 fstream
    //2、创建流文件
    ifstream ifs;    //创建流对象
    //3、打开文件，并且判断是否打开成功
    ifs.open("test.txt", ios::in);
    if (!ifs.is_open()) {
        cout << "文件打开失败" << endl;
        return;
    }
    //4、读数据

    /*
    //第一种
    char buf[1024] = { 0 };  //字符数组初始化全为0
    while (ifs >> buf)     //存到buf里，当读不到数据的时候，返回False，退出循环
    {
        cout << buf << endl;
    }
    */
    
    /*
    //第二种
    char buf[1024] = { 0 };
    while (ifs.getline(buf, sizeof(buf)))  //第一个参数为数据放到哪里(地址)，第二个参数为最多要读多少个字节数
    {
        cout << buf << endl;
    }
    */

    /*
    //第三种
    string buf;
    while (getline(ifs,buf))
    {
        cout << buf << endl;
    }
    */
    
    //第四种
    char c;
    while ((c = ifs.get()) != EOF)  //每一次读取一个字符,字符放入c
    {                               //EOF表示读取到文件尾
        cout << c;
    }
    
    //5、关闭文件
    ifs.close();
}
```



### 二进制文件--写文件

- 以二进制的方式对文件进行读、写操作，打开方式要指定为 `ios::binary`

- 二进制方式写文件主要利用流对象调用成员函数`write`，函数原型：`ostream write(const char * buffer,int len)`

- 参数解释：字符指针`buffer`指向内存中一段内存空间，`len`是读写的字节数。



```cpp
class Person {
public:
    char m_Name[64];  //姓名  
    int m_Age;        //年龄
    //写字符串的时候最好不要用C++的string，有可能出现问题，最好用C的数组写字符串，因为它底层是用C写的
};

void test01() {
    //1、包含头文件
    //2、创建流文件
    ofstream ofs;
    //3、打开文件
    ofs.open("person.txt", ios::out | ios::binary);  //二进制的方式写文件
    //ofstream  ofs.open("person.txt",ios::out | ios::binary)  也可以两步合成一步
    //4、写文件
    Person p = { "张三",18 };
    ofs.write((const char*)&p, sizeof(Person));  //对p取地址，然后强转为常量指针
    //5、关闭文件
    ofs.close();
}

```



## 07 多线程



### std::thread

#### 创建线程

`std::thread` 是最基础的执行单元。你可以传递函数指针、Lambda 表达式或成员函数。

- **关键函数**：`join()`（等待线程结束）、`detach()`（让线程后台运行）。

```cpp
#include <iostream>
#include <thread>

void task(int id) {
    std::cout << "Thread " << id << " is running." << std::endl;
    std::this_thread::sleep_for(std::chrono::microseconds(50));
}

int main() {
    // 创建线程，传入参数
    std::thread t1(task, 1);
    
    // 使用 lambda 表达式创建
    std::thread t2([] { std::cout << "Thread 2 is running." << std::endl; });

    t1.join(); // 主线程阻塞，直到 t1 执行完
    t2.join();
    return 0;
}
```



#### 互斥量 与 原子变量

用于解决数据竞争（Race Condition）。

- **`mutex`**：通过锁机制保证同一时间只有一个线程访问资源。
- **`atomic`**：利用 CPU 指令保证单个变量操作的原子性，性能通常优于互斥锁。



```cpp
#include <iostream>
#include <vector>
#include <thread>
#include <mutex>
#include <atomic>

std::mutex mtx;
int counter = 0;
std::atomic<int> atomic_counter(0);

void increment() {
    for (int i = 0; i < 1000; ++i) {
        // 1. 互斥量写法
        std::lock_guard<std::mutex> lock(mtx); // 自动上锁和解锁
        // std::lock_guard<std::mutex> lock2(mtx);  // 比lock_guard更灵活，可以主动释放
        counter++;
        // lock2.unlock();
        
        // 2. 原子变量写法（无需加锁，性能更高）
        atomic_counter++;
    }
}

int main() {
    std::thread t1(increment);
    std::thread t2(increment);
    t1.join(); t2.join();
    std::cout << "Counter: " << counter << ", Atomic: " << atomic_counter << std::endl;
    return 0;
}
```



#### 条件变量 与 信号量

用于线程间的同步通信（比如生产者-消费者模型）。

- **`condition_variable`**：配合 `unique_lock` 使用，让线程等待某个条件达成。
- **`semaphore` (C++20)**：控制同时访问特定资源的线程数量。



**wait函数**

**情况 A：如果你调用的是 `cv.wait(lock)`（不带后面那个 Lambda）** 它会**立即**释放锁并进入睡眠。它完全不管 `ready` 是什么。即便 `ready` 已经是 `true` 了，它也会睡死过去，直到有人调用 `notify`，此时它才重新获取尝试锁。这就是为什么这种写法容易导致“永久睡眠”的原因。

**情况 B：如果你调用的是 `cv.wait(lock, predicate)`（带 Lambda 的版本）** 它会先运行 Lambda。

- 如果 Lambda 返回 `true`，`wait` **直接返回**，线程继续执行，**根本不会睡眠**。
- 如果 Lambda 返回 `false`，它才会释放锁并进入睡眠。

```cpp
#include <iostream>
#include <thread>
#include <condition_variable>
#include <semaphore> // C++20

std::condition_variable cv;
std::mutex mtx;
bool ready = false;

// C++20 信号量：初始值为0
std::binary_semaphore sem(0);

void worker() {
    std::unique_lock<std::mutex> lock(mtx);
    cv.wait(lock, []{ return ready; }); // 等待 ready 变为 true
    std::cout << "Worker thread processing..." << std::endl;
    
    sem.release(); // 释放信号量，计数器+1
}

int main() {
    std::thread t(worker);
    {
        std::lock_guard<std::mutex> lock(mtx);
        ready = true;
    }
    cv.notify_one(); // 唤醒等待的线程
    
    sem.acquire(); // 等待信号量，计数器-1
    std::cout << "All done!" << std::endl;
    t.join();
    return 0;
}
```



#### `std::promise` 与 `std::future`

用于在线程间传递值。`promise` 是设置值的端，`future` 是获取值的端。

- **场景**：线程 A 计算出一个结果，线程 B 阻塞直到拿到这个结果。

```cpp
#include <iostream>
#include <thread>
#include <future>

void calculate(std::promise<int>&& p) {
    std::this_thread::sleep_for(std::chrono::seconds(1));
    p.set_value(42); // 设置结果
}

int main() {
    std::promise<int> p;
    std::future<int> f = p.get_future(); // 绑定 promise 和 future

    std::thread t(calculate, std::move(p));
    
    std::cout << "Waiting for result..." << std::endl;
    std::cout << "Result: " << f.get() << std::endl; // 阻塞直到结果可用
    
    t.join();
    return 0;
}
```



#### `std::packaged_task` 与 `std::async`

更高级的异步封装。

- **`std::packaged_task`**：包装一个可调用对象，使其能异步返回结果（通常配合 `thread`），**它将任务定义和任务执行相解耦**。
- **`std::async`**：直接启动一个异步任务，它可能立刻开一个新线程，也可能在调用 `get()` 时同步执行（取决于策略）。

```cpp
#include <iostream>
#include <future>

int add(int a, int b) { return a + b; }

int main() {
    // 1. packaged_task: 手动控制线程执行
    // a. 把函数包装起来
    std::packaged_task<int(int, int)> task(add);
    // b. 从包装盒里拿出一把“钥匙” (future)
    std::future<int> f1 = task.get_future();
    // c. 注意：此时 add 函数还没有运行！
    // 我们可以手动把它丢进一个线程里去跑
    std::thread t(std::move(task), 10, 20); // 在线程中运行

    // 2. async: 自动决定如何运行（常用策略：launch::async）
    // std::launch::async 策略强制开启一个新线程
    std::future<int> f2 = std::async(std::launch::async, add, 100, 200);

    std::cout << "Task Result: " << f1.get() << std::endl;
    std::cout << "Async Result: " << f2.get() << std::endl;

    t.join();
    return 0;
}
```





### pthread

- Pthread，即 POSIX threads，作为 POSIX 的线程标准，为开发者提供了一套强大且规范的线程编程接口。
- 它在多种操作系统中广泛适用，包括 Unix、Linux、macOS 等类 Unix 系统，甚至在 Windows 系统中也有移植版本。在 Linux 系统编程中，它是多线程开发的底层基石。
- 虽然 C++11 引入了 `std::thread`，但 `std::thread` 在 Linux 上的实现底层依然是调用 `pthread`



### 常见API

```c
#include <pthread.h>
 
// 参数：线程ID, 属性(通常NULL), 回调函数, 传递给回调的参数
int pthread_create(pthread_t* thread, const pthread_attr_t* attr, void*(*start_routine)(void*), void* arg);
void pthread_exit(void *__retval);
int pthread_join(pthread_t thread, void **value_ptr);
int pthread_detach(pthread_t thread);

// mutex 互斥锁
// rwlock 读写锁
// spin 自旋锁
int pthread_mutex_init(pthread_mutex_t* mutex, const pthread_mutexattr_t* attr);
int pthread_mutex_destroy(pthread_mutex_t* mutex);
int pthread_mutex_lock(pthread_mutex_t* mutex);
int pthread_mutex_unlock(pthread_mutex_t* mutex);
pthread_mutex_t cond = PTHREAD_MUTEX_INITIALIZER;
 
int pthread_cond_init(pthread_cond_t *cond, const pthread_condattr_t* attr);
int pthread_cond_destroy(pthread_cond_t* cond);
// 唤醒至少一个等待该条件的线程。
int pthread_cond_signal(pthread_cond_t* cond);
// 唤醒所有等待该条件的线程。
int pthread_cond_broadcast(pthread_cond_t* cond);
// 原子性地释放锁并进入睡眠，唤醒时自动重新获取锁。
int pthread_cond_wait(pthread_cond_t* cond, pthread_mutex_t* mutex);
pthread_cond_t cond = PTHREAD_COND_INITIALIZER;
 
// 获取线程id
int pthread_t pthread_self(void);
```


### std::atomic

- **作用**：把"读-改-写"压缩成 CPU 的一条指令（x86 的 `lock` 前缀、ARM 的 LL/SC），中间不会被打断，从而替代互斥锁解决数据竞争，代价远小于锁的等待/唤醒。
- **头文件** `<atomic>`；模板参数 `T` 必须是**可平凡复制**的类型（整型、指针、小的自定义结构体）。



#### 基本用法

```cpp
#include <atomic>

std::atomic<int> a(0);          // 直接初始化（推荐）
std::atomic<bool> flag{false};
std::atomic<int*> ptr(nullptr);

int x = a.load();               // 原子读
a.store(42);                    // 原子写
int y = a;                      // 等价于 load（重载了 operator T）
a = 7;                          // 等价于 store（重载了 operator=）
```

两个容易踩的点：

- `atomic` **禁掉了拷贝构造和拷贝赋值**（拷另一个 atomic 需要两条指令，本身就不是原子的）。所以 `std::atomic<int> b = a;` 编译不过，也不能塞进 `vector` 或当返回值。
- `a = a + 1;` 标准**不保证**原子性：它是一次 `load` 加一次 `store`，中间随时可能切走。必须写成 `a++`、`a += 1` 或 `a.fetch_add(1)`（个别编译器会把 `a = a + 1` 合并成一条指令，但别依赖这个）。



#### 常用成员函数

| 函数 | 作用 | 返回值 |
| --- | --- | --- |
| `load()` / `store(v)` | 原子读 / 原子写 | `T` / `void` |
| `operator=` / `operator T()` | 上面两个的简写 | — |
| `exchange(v)` | 把旧值换成 `v`，一步完成 | **旧值** |
| `compare_exchange_weak/strong(expected, desired)` | CAS：相等才写入 | `bool` |
| `fetch_add / sub / and / or / xor(v)` | 原子运算后写回 | **旧值** |
| `is_lock_free()` | 当前实现是否无锁 | `bool` |
| `wait()` / `notify_one()` / `notify_all()` | C++20，睡眠式等待/唤醒 | — |

注意 `++a` 和 `a.fetch_add(1)` 只差返回值：前者返回**新值**，后者返回**旧值**。

**CAS（compare-and-swap）是原子操作的万能胶**：任何"读-改-写"都能用它拼出来，也是一切无锁数据结构的地基。

```cpp
// 语义上等价于下面这段，但整段是不可打断的一条指令
bool compare_exchange_strong(T& expected, T desired) {
    if (this->load() == expected) { this->store(desired); return true; }
    else { expected = this->load();  return false; }   // 失败会把 expected 刷新成当前值
}
```

- 失败时**会把 `expected` 更新为最新值**，所以标准写法是循环重试。
- `weak` 版本在 LL/SC 架构（ARM 等）上可能**无原因失败**（spurious failure），因此必须放在循环里用；`strong` 不会假失败但可能更慢。**结论：写循环一律用 `weak`。**

```cpp
// 把 a 从 0 改成 1，只允许成功一次
int expected = 0;
while (!a.compare_exchange_weak(expected, expected + 1)) {
    // expected 已被刷新为最新值，直接进入下一轮
}
```



#### 整型 / 指针特化

`std::atomic<整型>` 与 `std::atomic<T*>` 额外提供 `fetch_add` / `fetch_sub`：

```cpp
std::atomic<int*> p(arr);
int* old = p.fetch_add(2);      // 指针前进 2 个元素，返回旧指针

std::atomic<size_t> total{0};
total.fetch_add(len);           // 多线程累加，无需加锁
```

自定义结构体也能用 `std::atomic<T>` 包起来（只要可平凡复制），大对象在不支持无锁的平台上会退化成"内部加锁"，可以先用 `is_lock_free()` 确认一下。



#### std::atomic_flag

- 最简单的原子类型，只有两个操作，**唯一被标准保证 `lock-free`** 的类型。
- `test_and_set()`：置位并返回旧值；`clear()`：清位。

```cpp
std::atomic_flag lock;          // C++20 起默认就是清位状态（旧标准写 ATOMIC_FLAG_INIT）

void spin_lock() {
    while (lock.test_and_set(std::memory_order_acquire)) { /* 自旋等待 */ }
    // ---- 临界区 ----
    lock.clear(std::memory_order_release);
}
```



#### 内存序 memory_order

`load` / `store` / `exchange` / `compare_exchange_*` 都可以多传一个内存序参数，**默认是 `std::memory_order_seq_cst`**。六个可选值：

| 内存序 | 约束 | 典型用途 |
| --- | --- | --- |
| `relaxed` | 只保证原子，不约束任何顺序 | 计数器、统计量 |
| `consume` | 弱化版 `acquire`（基于数据依赖），各编译器基本按 `acquire` 实现，不推荐 | — |
| `acquire` | **读**：本操作之后的读写不许被重排到它前面 | 读端"接收"数据 |
| `release` | **写**：本操作之前的读写不许被重排到它后面 | 写端"发布"数据 |
| `acq_rel` | `acquire` + `release`，用于既读又写的 RMW | `exchange`、`fetch_sub` |
| `seq_cst` | 顺序一致，所有原子操作构成一个全局统一的顺序，最强也最慢 | 不确定就用它 |

**一句话记法：`release` 是"我说完了"，`acquire` 是"我听到了"。** 只有当 `load(acquire)` **确实读到了**那个 `store(release)` 写入的值时，双方才建立 happens-before 关系：写线程在 release 之前做的所有修改，读线程在 acquire 之后一定能看见。

```cpp
std::atomic<bool> ready{false};
int data = 0;

// 线程 A：先把数据准备好，再"发布"
data = 42;
ready.store(true, std::memory_order_release);

// 线程 B：确认收到，再读数据
while (!ready.load(std::memory_order_acquire)) {}
assert(data == 42);      // 一定成立
```

- 两边都换成 `relaxed`，编译器和 CPU 就可能把 `data = 42` 和 `ready.store` 换序，`assert` 会随机失败。
- 另一种等价的写法是显式加栅栏：`std::atomic_thread_fence(std::memory_order_release)`，语义相同，只是把顺序约束写在单独一行。
- 实用策略：**默认 `seq_cst`；`relaxed` 只留给纯计数器；`release/acquire` 只在清楚自己在同步什么时用。** 内存序用错的 bug 几乎无法复现，不要为了"看起来快"随手改。



#### C++20：wait / notify

自旋等待会白烧一个核，C++20 给 atomic 补了类似条件变量的接口：`wait(old)` 在"值仍等于 `old`"时睡眠，`notify_one/all` 负责唤醒。

```cpp
std::atomic<int> cnt{0};

// 消费者：值还停在 0 就睡，不占 CPU
cnt.wait(0);
// 生产者
cnt.store(2);
cnt.notify_one();
```


## 杂项



### 智能指针

封装原始指针，自动管理内存

#### std::unique_ptr

- 定义

  - 任何时刻，只有一个指针管理内存

  - 指针超出作用域时，内存自动释放

  - 该类型指针不可copy，只能move

- 创建方式

  - 通过裸指针
  - 通过new
  - 通过`std::make_unique`创建

- 可以通过`get()`获取地址

- 实现了`->`和`*`，可以直接调用成员函数和解引用

```cpp
//初始化方式1
std::unique_ptr<int> sp1(new int(123));

//初始化方式2
std::unique_ptr<int> sp2;
sp2.reset(new int(123));

//初始化方式3
std::unique_ptr<int> sp3 = std::make_unique<int>(123);

```





#### std::share_ptr

- 创建了一个计数器与类对象指向的内存相关联
- copy计数器加一，销毁减一
- 调用`use_count()`查询



```cpp
class A {
public:
    A() {
        std::cout << "A constructor" << std::endl;
    }

    ~A() {
        std::cout << "A destructor" << std::endl;
    }
};

int main() {
    {
        //初始化方式1
        std::shared_ptr<A> sp1(new A());
		// 1
        std::cout << "use count: " << sp1.use_count() << std::endl;

        //初始化方式2
        std::shared_ptr<A> sp2(sp1);
        // 2
        std::cout << "use count: " << sp1.use_count() << std::endl;

        sp2.reset();
        // 1
        std::cout << "use count: " << sp1.use_count() << std::endl;

        {
            std::shared_ptr<A> sp3 = sp1;
            // 2
            std::cout << "use count: " << sp1.use_count() << std::endl;
        }
		// 1
        std::cout << "use count: " << sp1.use_count() << std::endl;
    }

    return 0;
}
```





#### std::weak_ptr

- weak_ptr是对对象的一种弱引用，它不会增加对象的use_count，weak_ptr和shared_ptr可以相互转化

- weak_ptr指针通常不单独使用，只能和 shared_ptr 类型指针搭配使用
- 没有重载operator->和operator \*操作符，典型的用法是调用其lock函数来获得shared_ptr示例，进而访问原始对象



```cpp
class B;
class A{
public:
    weak_ptr<B> pb_weak;
    ~A() {
        cout << "A delete\n";
    }
};
class B {
public:
    shared_ptr<A> pa_;
    ~B() {
        cout << "B delete\n";
    }
    void print() {
        cout << "This is B" << endl;
    }
};

void fun() {
    shared_ptr<B> pb(new B());
    cout << "pb.use_count " << pb.use_count() << endl;//1
    shared_ptr<A> pa(new A());
    cout << "pa.use_count " << pa.use_count() << endl;//1

    pb->pa_ = pa;
    cout << "pb.use_count " << pb.use_count() << endl;//1
    cout << "pa.use_count " << pa.use_count() << endl;//2

    pa->pb_weak = pb;
    cout << "pb.use_count " << pb.use_count() << endl;//1：弱引用不会增加所指资源的引用计数use_count()的值
    cout << "pa.use_count " << pa.use_count() << endl;//2

    shared_ptr<B> p = pa->pb_weak.lock();
    p->print();//不能通过weak_ptr直接访问对象的方法，须先转化为shared_ptr
    cout << "pb.use_count " << pb.use_count() << endl;//2
    cout << "pa.use_count " << pa.use_count() << endl;//2
}//函数结束时,调用A和B的析构函数
```









### RAII

全称**资源获取即初始化**，RAII要求，资源的有效期与持有资源的[对象的生命期](https://zh.wikipedia.org/w/index.php?title=对象的生命期&action=edit&redlink=1)严格绑定，即由对象的[构造函数](https://zh.wikipedia.org/wiki/构造函数)完成[资源的分配](https://zh.wikipedia.org/w/index.php?title=资源的分配&action=edit&redlink=1)（获取），同时由[析构函数](https://zh.wikipedia.org/wiki/析构函数)完成资源的释放。在这种要求下，只要对象能正确地析构，就不会出现[资源泄漏](https://zh.wikipedia.org/wiki/资源泄漏)问题。

#### 如何把RAII类作为函数的参数

- 值传递：各位caller，我不要ownership了，请拿走

- 非const 引用传递：你拿不拿走都行，提前跟我商量好（不推荐）

- const 引用传递：可以拿走用一下，ownership还是我的

- 右值引用：同第二条，无法确定caller是否拿走了ownership



#### std::move

- `std::move` 并不移动任何东西。它的唯一作用是：**强制将一个左值转换为右值引用类型**。

- 某个指针指向了一块内存，这个指针获得了这块内存的**所有权**
- 有时候需要转移所有权给另一个变量，这个时候就需要用`std::move`，转移后原指针为空，防止重复释放
- `std::unique_ptr` 可以理解为，独占了内存的所有权，我们不能让另外的指针也**同时获得其所有权**，所以只能通过`move`，来转移所有权



### 左值与右值

#### 1. 核心定义 📌

- **左值 (lvalue):** 指向一个具体的内存地址（有变量名）。你可以取它的地址 `&`。它通常在表达式结束后依然存在。
  - *例子：* 变量名 `int a = 10;` 中的 `a`。
- **右值 (rvalue):** 通常是临时的、没有名字的数据。你无法获取它的地址。它通常在表达式结束后就消失了。
  - *例子：* 字面量 `10`，或者函数返回的临时对象 `x + y`。

#### 2. 左值引用 vs 右值引用 🔗

- **左值引用 (`T&`):** 传统的引用，绑定到左值。
- **右值引用 (`T&&`):** C++11 引入的新特性，专门绑定到即将销毁的临时对象（右值）。这是实现**移动语义 (Move Semantics)** 的基础，能显著减少不必要的拷贝。

#### 3.移动语义 (Move Semantics)

1. 移动语义的本质：资源所有权的转移

2. `std::move`:**强制将一个左值转换为右值引用类型**。

3. 移动赋值:自赋值检查、释放旧资源、接管新资源、重置源对象

   ```cpp
   std::vector<int> v1 = {1, 2, 3, 4, 5};
   std::vector<int> v2;
   v2 = std::move(v1); // 触发移动赋值运算符
   ```



#### 4.万能引用与完美转发

```cpp
template<typename T>
void wrapper(T&& arg) { // 这里的 T&& 是“万能引用”
    // 我们想把 arg 原封不动地传递给下一个函数
    actual_function(std::forward<T>(arg)); 
}
```

这里有两个关键概念：

- **万能引用 (`T&&`)**：在模板参数推导中，`T&&` 既能接收左值，也能接收右值。

  - 必须发生模板类型推导（Template Type Deduction）且形式为 `T&&`

  - | **形式**                                                     | **是否有类型推导**     | **引用性质** |
    | ------------------------------------------------------------ | ---------------------- | ------------ |
    | `void f(Widget&& w)`                                         | 否（具体类型）         | 右值引用     |
    | `void f(T&& t)`                                              | **是**（模板推导）     | **万能引用** |
    | `void f(std::vector<T>&& v)`                                 | 是（但修饰的不是 T）   | 右值引用     |
    | `auto&& x = ...`                                             | **是**（auto 推导）    | **万能引用** |
    | `Widget<T>::f(T&& t)`                                        | 否（类实例化时已确定） | 右值引用     |
    | template<typename T> <br>class Widget { <br>public:    <br>void func(T&& param); <br>}; | 否（已经在开始确定了） | 右值引用     |
    | template<typename T> <br>void debug_print(const T&& param);  | **是**（模板推导）     | **右值引用** |

- **完美转发 (`std::forward`)**：它能保留参数的“值属性”。如果传进来的是左值，转发后还是左值；如果是右值，转发后还是右值。



| **概念**     | **核心关键词** | **理解要点**                                     |
| ------------ | -------------- | ------------------------------------------------ |
| **基础区分** | 身份 vs 临时   | 有名、可取地址的是左值；无名、即将销毁的是右值。 |
| **移动语义** | 资源窃取 🕵️     | 通过 `std::move` 避免昂贵的内存拷贝。            |
| **右值引用** | `T&&`          | 专门用来绑定右值的“钩子”，但变量名本身是左值。   |
| **完美转发** | `std::forward` | 在模板中通过“引用折叠”保持参数的原始属性。       |



### std::filesystem库

#### 介绍

C++17 标准带来了 std::filesystem库, 提供了强大的工具来处理文件路径, 目录以及其他与文件系统相关的操作. 


- 跨平台支持: 为 Windows, linux 和 MACOS 提供统一的 API.
- 便据性: 提供相关文件操作的直观函数.
- 性能: 接口实现根据平台做了优化处理.



#### 常用功能

```cpp
// 1. 检查文件和目录是否存在

    #include <filesystem>
    #include <IOStream>
     
    namespace fs = std::filesystem;
     
    int main() {
         fs::path filePath = "example.txt";
         if (fs::exists(filePath)) {
         std::cout << "文件存在!\n";
         } else {
         std::cout << "文件不存在.\n";
         }
         return 0;
    }

// 为了保持代码简洁, 后续代码中将不再包含头文件和main函数体, 读者可以从文末的源码链接获取完整源代码.

// 2. 创建和删除目录

    fs::path dirPath = "new_directory";
    fs::create_directory(dirPath); // 创建单个目录
    fs::remove(dirPath); // 删除目录

// 3. 遍历目录

    fs::path dirPath = "."; // 当前目录
    for (const auto& entry : fs::recursive_directory_iterator(dirPath)) {
         std::cout << entry.path() << std::endl;
    }

// 此示例会递归列出当前目录及其所有子目录中的文件和文件夹.

// 4. 查询文件属性

    fs::path filePath = "example.txt";
    if (fs::exists(filePath)) {
         std::cout << "文件大小: " << fs::file_size(filePath) << " 字节\n";
         std::cout << "是否为正解文件: " << fs::is_regular_file(filePath) << "\n";
         std::cout << "文件最后修改时间: "
                 << fs::last_write_time(filePath).time_since_epoch().count()
                 << "\n";
    }

// 5. 复制和重命名文件

    fs::copy("source.txt", "destination.txt", fs::copy_options::overwrite_existing); // 复制文件
    fs::rename("old_name.txt", "new_name.txt"); // 重命名文件

// 6. 处理符号链接

    fs::path symlinkPath = "symbolic_link";
    fs::path targetPath = "target_file";
    fs::create_symlink(targetPath, symlinkPath); // 创建符号链接
    if (fs::is_symlink(symlinkPath)) {
         std::cout << symlinkPath << " 是符号链接, 指向 "
                 << fs::read_symlink(symlinkPath) << std::endl;
    }

// 路径相关操作

// 7.1 路径组合

    // 1. 路径组合
    fs::path base = "/home/user/documents";
    fs::path file = "report.pdf";
    fs::path fullPath = base / file; // 使用 / 操作符组合路径
    std::cout << "组合路径: " << fullPath << std::endl;

//输出

    //组合路径: "/home/user/documents/report.pdf"

// 7.2 获取路径组件

    fs::path filepath = "/home/user/documents/report.pdf";
    std::cout << "文件名: " << filepath.filename() << std::endl;
    std::cout << "主文件名: " << filepath.stem() << std::endl;
    std::cout << "扩展名: " << filepath.extension() << std::endl;
    std::cout << "父路径: " << filepath.parent_path() << std::endl;

//输出
/*
    文件名: "report.pdf"
    主文件名: "report"
    扩展名: ".pdf"
    父路径: "/home/user/documents"
*/
// 7.3 相对路径计算

    fs::path p1 = "/home/user/documents";
    fs::path p2 = "/home/user/pictures";
    fs::path rel = fs::relative(p2, p1); // 计算从 p1 到 p2 的相对路径
    std::cout << "相对路径: " << rel << std::endl; // ../pictures

//输出

//    相对路径: "../pictures"

// 7.4 路径分解与迭代

    fs::path complex = "/home/user/documents/work/report.pdf";
    std::cout << "路径分解:" << std::endl;
    for (const auto& part : complex) {
         std::cout << " " << part << std::endl;
    }

//输出
/*
    路径分解:
      "/"
      "home"
      "user"
      "documents"
      "work"
      "report.pdf"
*/
//7.5 词法规范化路径

    fs::path messy = "home/user/../user/./documents/report.pdf";
    std::cout << "规范化路径: " << messy.lexically_normal() << std::endl;

// 输出

//    规范化路径: "home/user/documents/report.pdf"

// 7.6 路径比较

    // 使用 std::filesystem::equivalent 检查两个路径是否指向同一文件
    fs::path linkPath =
         "link_to_report.pdf"; // 假设这是一个指向 report.pdf 的符号链接
    fs::path actualPath = "documents/report.pdf";
    try {
         if (fs::equivalent(linkPath, actualPath)) {
         std::cout << "路径 " << linkPath << " 和 " << actualPath
                     << " 指向同一文件." << std::endl;
         } else {
         std::cout << "路径 " << linkPath << " 和 " << actualPath
                     << " 不指向同一文件." << std::endl;
         }
    } catch (const fs::filesystem_error& e) {
         std::cerr << "文件系统错误: " << e.what() << std::endl;
    }

//7.7 路径拼接

    fs::path prefix = "backup_";
    fs::path filename = "report.pdf";
    fs::path newpath = prefix.string() + filename.string();
    std::cout << "拼接路径: " << newPath << std::endl;

输出

    拼接路径: "backup_report.pdf"

//7.8 检查路径特性

    fs::path checkPath = "/home/user/documents/report.pdf";
    std::cout << "是否为绝对路径: " << checkPath.is_absolute() << std::endl;
    std::cout << "是否有扩展名: " << checkPath.has_extension() << std::endl;
    std::cout << "是否有文件名: " << checkPath.has_filename() << std::endl;
    std::cout << "是否有父路径: " << checkPath.has_parent_path() << std::endl;

//输出
/*
    是否为绝对路径: 1
    是否有扩展名: 1
    是否有文件名: 1
    是否有父路径: 1
*/
//路径替换操作

    fs::path modPath = "/home/user/documents/report.pdf";
    modPath.replace_filename("newreport.doc");
    std::cout << "替换文件名后: " << modPath << std::endl;
    modPath.replace_extension(".txt");
    std::cout << "替换扩展名后: " << modPath << std::endl;

//输出
/*
    替换文件名后: "/home/user/documents/newreport.doc"
    替换扩展名后: "/home/user/documents/newreport.txt"
*/
```







## 库



### libevent

#### 概述

libevent 是一个高级的事件驱动库，它对底层的 I/O 多路复用机制（如 select、poll、epoll）进行了封装，提供了统一的接口。使用 libevent 编写 TCP 服务器时，开发者无需关心底层具体使用的是哪种 I/O 多路复用机制，代码更加简洁、易读和易维护。例如，在 libevent 中创建和管理事件只需要调用 event_new、event_add 等函数，而不需要手动处理文件描述符集合的设置和轮询等操作。
https://blog.csdn.net/weixin_75197906/article/details/147618279

https://www.cnblogs.com/LiBlog--/p/18327543

#### 处理流程

Reactor模式是一种高效的**事件驱动**设计模式，广泛应用于高性能服务器和网络应用中。它通过将事件的检测和分发与实际的事件处理逻辑分离，提供了一种高效的多任务并发处理方法。

而事件驱动机制不同，程序不是主动的调用某个API完成处理，恰恰相反，Reactor逆置了事件处理流程，应用程序需要提供相应的接口并注册到Reactor上，如果相应的事件发生，Reactor将主动调用应用程序注册的接口，这些接口又称为**“回调函数”**

1. 应用程序准备并初始化event，设置事件类型和回调函数
2. 向libevent添加事件event。对于定时事件，libevent使用一个小根堆管理，key为超时时间；对于Signal和I/O事件，libevent将其放入到等待链表（wait list）中，这是一个双向链表
3. 程序调用**event_base_dispatch()**系列函数进入无限循环，等待事件

```c
// 当监视事件满足条件的时候，会触发回调函数
void fifo_read(evuntil_socket_t fd, short events, void *arg) {
    char buf[32] = {0};
    int ret = read(fd, buf, sizeof (buf));
    if (ret == -1) {
        perror("read");
        exit(1);
    }
    printf("从管道读取 %s\n", buf);
}

int main() {
    int ret = mkfifo("fifo.tmp", 700);
    if (ret == -1) {
        perror("mkfifo");
        exit(1);
    }
 	int fd = open("fifo.tmp", O_RDONLY);
    if (fd == -1) {
        perror("open");
        exit(1);
    }
    // 创建事件
    struct event ev;
    // 初始化事件集合
    event_init();
    // 初始化事件 时间 关联文件描述符 事件类型 回调函数 回调函数参数
    event_set(&ev, fd, EV_READ, fifo_read, NULL);
  	// 把事件添加到集合中
    event_add(&ev, NULL);
    // 开始监听
    event_dispatch();
    return 0;
}
```



#### 实例

```c
// client.c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <time.h>
#include <errno.h>
#include <string.h>
#include <getopt.h>
#include <fcntl.h>
#include <signal.h>
#include <event2/event.h>
#include <event2/bufferevent.h>
#include <event2/util.h>
#include <arpa/inet.h>
 
#define IP      "127.0.0.1"
#define PORT    8888
 
void event_cb(struct bufferevent *bev, short events, void *arg) {
    if( events & BEV_EVENT_EOF ) {
        printf("Connection closed\n");
    } else if( events & BEV_EVENT_ERROR ) {
        printf("Connection error:%s\n", strerror(errno));
    }
}
 
 
void send_data(evutil_socket_t fd, short events, void *arg) {
    struct bufferevent		*bev = (struct bufferevent *)arg;
	char                    buf[32] = "Hello, world!";
    printf("%s\n", buf);
    bufferevent_write(bev, buf, strlen(buf));
}
 
 
int main (int argc, char **argv) {
	struct sockaddr_in  addr;
    int                 len = sizeof(addr);
 
	struct event_base   *base = NULL;
    struct bufferevent  *bev = NULL;
	struct timeval      tv;
    struct event        *ev = NULL;
 
	base = event_base_new();
    if( !base ) {
        printf("event_base_new() failure\n");
        return -1;
    }
 
	memset(&addr, 0, sizeof(addr));
    addr.sin_family = AF_INET;
    addr.sin_port = htons(PORT);
    inet_aton(IP, &addr.sin_addr);
 
	bev = bufferevent_socket_new(base, -1, BEV_OPT_CLOSE_ON_FREE);
    if( !bev ) {
        printf("Could not create bufferevent\n");
        event_base_free(base);
        return -2;
    }
 
    bufferevent_setcb(bev, NULL, NULL, event_callback, NULL);  
    bufferevent_enable(bev, EV_READ | EV_WRITE);
 
    bufferevent_socket_connect(bev, (struct sockaddr *)&addr, len);
 
	tv.tv_sec = 3;
    tv.tv_usec = 0;
    ev = event_new(base, -1, EV_PERSIST, send_data, bev);
    event_add(ev, &tv);
 
	event_base_dispatch(base);
 
    event_free(ev);
	bufferevent_free(bev);
	event_base_free(base);
 
	return 0;
} 
```



#### http

https://blog.csdn.net/m0_54069809/article/details/147594467

##### 核心概念

- `struct event_base`: 事件循环（Event Loop）的基石，所有事件（I/O、定时器、信号等）都在一个 event_base 上注册和分发。
- `struct evhttp`: 代表一个 HTTP 服务器实例。它监听指定的地址和端口，接收并处理传入的 HTTP 请求。
- `struct evhttp_connection`: 代表一个 HTTP 连接。
  - 对于服务器端，它通常代表一个已接受的客户端连接；
  - 对于客户端，它代表一个到目标服务器的连接。
- `struct evhttp_request`: 代表一个 HTTP 请求。
  - 在服务器端，它封装了接收到的客户端请求信息（方法、URI、头部、请求体等）；
  - 在客户端，它封装了要发送到服务器的请求信息以及接收到的响应信息。
- 回调函数 (`Callback)`: libevent 的核心是事件驱动，HTTP 模块也不例外。你需要定义回调函数来处理特定的事件，例如：收到新请求、收到响应数据、连接关闭等。



##### http服务器

###### 初始化与绑定

```c
struct event_base *event_base_new(void):
/*
    功能：创建一个新的 event_base 实例，作为事件循环的基础。
    返回：成功时返回 event_base 指针，失败时返回 NULL。
*/
struct evhttp *evhttp_new(struct event_base *base):
/*
    功能：创建一个新的 evhttp 服务器实例，并将其关联到一个 event_base。
    参数 base: 指向 event_base 的指针。
    返回：成功时返回 evhttp 指针，失败时返回 NULL。
*/
int evhttp_bind_socket(struct evhttp *http, const char *address, ev_uint16_t port):
/*
	(旧版接口，新版推荐 evhttp_bind_socket_with_handle)
    功能：让 evhttp 服务器监听指定的 IP 地址和端口。
    参数 http: evhttp 服务器实例。
    参数 address: 要监听的 IP 地址（如 “0.0.0.0” 表示监听所有接口）。
    参数 port: 要监听的端口号。
    返回：成功时返回 0，失败时返回 -1。
*/

struct evhttp_bound_socket *evhttp_bind_socket_with_handle(struct evhttp *http, const char *address, ev_uint16_t port):
/*
    功能：同 evhttp_bind_socket，但返回一个句柄，可以用于后续操作（如获取实际监听的端口）。这是推荐使用的新接口。
    返回：成功时返回 evhttp_bound_socket 句柄，失败时返回 NULL
*/
```

###### 设置请求处理回调

两种回调方式

```c
void evhttp_set_gencb(struct evhttp *http, void (*cb)(struct evhttp_request *, void *), void *arg):
/*
    功能：设置一个“通用回调函数”（Generic Callback）。如果没有任何其他更具体的回调函数匹配请求的 URI，则会调用此通用回调。
    参数 http: evhttp 服务器实例。
    参数 cb: 回调函数指针。该函数接收 evhttp_request 和一个用户提供的参数 arg。
    参数 arg: 传递给回调函数的额外用户数据。
*/
int evhttp_set_cb(struct evhttp *http, const char *path, void (*cb)(struct evhttp_request *, void *), void *arg):
/*
    功能：为特定的 URI 路径设置回调函数。当请求的 URI 前缀匹配 path 时，将调用此回调。
    参数 http: evhttp 服务器实例。
    参数 path: 要匹配的 URI 路径（如 “/hello”, “/api/users”）。
    参数 cb: 处理该路径请求的回调函数。
    参数 arg: 传递给回调函数的额外用户数据。
    返回：成功时返回 0，失败时返回 -1。

注意：evhttp_set_cb 的匹配优先级高于 evhttp_set_gencb。
*/
```

###### 在回调函数中处理请求

回调函数 `void (*cb)(struct evhttp_request *req, void *arg)` 是处理逻辑的核心。`struct evhttp_request *req` 参数包含了所有请求相关的信息。常用函数有：

```c
const char *evhttp_request_get_uri(const struct evhttp_request *req):
/*
    功能：获取请求的完整 URI (包括查询参数)。
    返回：指向 URI 字符串的指针（只读）。
*/
enum evhttp_cmd_type evhttp_request_get_command(const struct evhttp_request *req):
/*
    功能：获取请求的 HTTP 方法（GET, POST, PUT, DELETE 等）。
    返回：枚举类型 evhttp_cmd_type 的值 (如 EVHTTP_REQ_GET, EVHTTP_REQ_POST)。
*/
struct evkeyvalq *evhttp_request_get_input_headers(struct evhttp_request *req):
/*
    功能：获取请求的 HTTP 头部信息。这是一个键值对队列。
    返回：指向 evkeyvalq 结构体的指针。
*/
const char *evhttp_find_header(const struct evkeyvalq *headers, const char *key):
/*
    功能：在给定的头部信息中查找指定键（Header Name）的值。注意键是大小写不敏感的。
    参数 headers: 通常是 evhttp_request_get_input_headers() 的返回值。
    参数 key: 要查找的头部名称 (如 “Content-Type”, “User-Agent”)。
    返回：找到则返回头部值的字符串指针（只读），否则返回 NULL。
*/
struct evbuffer *evhttp_request_get_input_buffer(struct evhttp_request *req):
/*
    功能：获取请求体（Request Body）的数据。数据存储在 evbuffer 中。
    返回：指向 evbuffer 的指针。你可以使用 evbuffer 相关的函数（如 evbuffer_get_length, evbuffer_pullup, evbuffer_remove) 来读取数据。
*/
void evhttp_parse_query(const char *uri, struct evkeyvalq *headers): (旧版，新版推荐 evhttp_parse_query_str)
/*
    功能：解析 URI 中的查询字符串 (query string, ? 之后的部分)，并将解析出的键值对添加到 headers 中。
    参数 uri: 通常是 evhttp_request_get_uri() 的返回值。
    参数 headers: 用于存储解析结果的 evkeyvalq 结构体（通常需要先 evhttp_request_get_uri_parts 或手动初始化）。
*/
int evhttp_parse_query_str(const char *query_string, struct evkeyvalq *params):
/*
    功能：解析查询字符串，并将键值对存入 params。
    参数 query_string: 查询字符串本身（不包含 ?）。
    参数 params: 存储解析结果的 evkeyvalq。
    返回：成功时返回 0。
*/
const char *evhttp_request_get_host(struct evhttp_request *req):
/*
    功能：获取请求的 Host 头部信息。
    返回：Host 字符串指针，或 NULL。
*/
```



###### 发送响应

```c
struct evkeyvalq *evhttp_request_get_output_headers(struct evhttp_request *req):
/*
    功能：获取用于添加响应头部的 evkeyvalq 结构。
    返回：指向 evkeyvalq 的指针。
*/
int evhttp_add_header(struct evkeyvalq *headers, const char *key, const char *value):
/*
    功能：向头部队列中添加一个键值对。
    参数 headers: 通常是 evhttp_request_get_output_headers() 的返回值。
    参数 key: 响应头部名称 (如 “Content-Type”, “Server”)。
    参数 value: 响应头部的值。
    返回：成功时返回 0，失败时返回 -1。
*/
void evhttp_send_reply(struct evhttp_request *req, int code, const char *reason, struct evbuffer *databuf):
/*
    功能：发送一个完整的 HTTP 响应。这是最常用的发送响应函数。
    参数 req: 当前处理的请求对象。
    参数 code: HTTP 状态码 (如 200, 404, 500)。
    参数 reason: 状态码对应的原因短语 (如 “OK”, “Not Found”)。如果为 NULL，libevent 会尝试根据 code 自动填充。
    参数 databuf: 包含响应体的 evbuffer。如果响应没有 body，可以传入 NULL。libevent 会负责发送 Content-Length 头部（除非你显式设置了 Transfer-Encoding: chunked）。发送后，databuf 中的数据会被消耗掉。
*/
void evhttp_send_error(struct evhttp_request *req, int error, const char *reason):
/*
    功能：发送一个简单的错误响应。通常会生成一个包含错误信息的 HTML 页面作为响应体。
    参数 req: 当前处理的请求对象。
    参数 error: HTTP 错误状态码 (如 400, 404, 500)。
    参数 reason: 原因短语。如果为 NULL 或空字符串，会使用默认的原因短语。
*/

// Chunked 响应 (适用于大响应或流式响应):

void evhttp_send_reply_start(struct evhttp_request *req, int code, const char *reason):
// 发送响应头和状态行，表明后续将使用 Chunked 编码。会自动添加 Transfer-Encoding: chunked 头部。

void evhttp_send_reply_chunk(struct evhttp_request *req, struct evbuffer *databuf): 
// 发送一个数据块 (chunk)。databuf 中的数据会被发送。

void evhttp_send_reply_end(struct evhttp_request *req): 
//发送最后一个大小为 0 的 chunk，标志着响应结束。

```



##### 启动与停止

```c
int event_base_dispatch(struct event_base *base):
/*
    功能：启动 event_base 的事件循环。此函数会阻塞，直到循环被显式停止或没有活动事件。
    返回：成功时返回 0，失败时返回 -1，如果因为没有活动事件而退出则返回 1。
*/
int event_base_loopbreak(struct event_base *base):
/*
    功能：使正在运行的 event_base_dispatch 或 event_base_loop 在处理完当前事件后立即退出。
    返回：成功时返回 0，失败时返回 -1。
*/
int event_base_loopexit(struct event_base *base, const struct timeval *tv):
/*
    功能：使事件循环在指定时间 tv 后或处理完当前事件后（如果 tv 为 NULL）退出。
    返回：成功时返回 0，失败时返回 -1。
*/

```



##### 清理资源

```c
void evhttp_free(struct evhttp *http):
/*
    功能：释放 evhttp 服务器实例及其占用的资源（包括绑定的套接字句柄）。
*/
void event_base_free(struct event_base *base):
/*
    功能：释放 event_base 及其相关资源。
*/
```



##### 实例

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <signal.h>

#include <event2/event.h>
#include <event2/http.h>
#include <event2/buffer.h>
#include <event2/keyvalq_struct.h>

// 通用请求处理回调函数
void generic_handler(struct evhttp_request *req, void *arg) {
    const char *uri = evhttp_request_get_uri(req);
    enum evhttp_cmd_type method = evhttp_request_get_command(req);
    struct evkeyvalq *headers = evhttp_request_get_input_headers(req);
    struct evbuffer *req_body = evhttp_request_get_input_buffer(req);
    size_t body_len = evbuffer_get_length(req_body);

    printf("Received a request:\n");
    printf("  URI: %s\n", uri);
    printf("  Method: %s\n", method == EVHTTP_REQ_GET ? "GET" :
                              method == EVHTTP_REQ_POST ? "POST" : "Other");

    printf("  Headers:\n");
    struct evkeyval *header;
    for (header = headers->tqh_first; header; header = header->next.tqe_next) {
        printf("    %s: %s\n", header->key, header->value);
    }

    if (body_len > 0) {
        printf("  Body (len %zu):\n", body_len);
        // 为了演示，只打印前 1024 字节
        char body_data[1025];
        size_t copy_len = body_len > 1024 ? 1024 : body_len;
        memcpy(body_data, evbuffer_pullup(req_body, copy_len), copy_len);
        body_data[copy_len] = '\0';
        printf("    %s\n", body_data);
    } else {
        printf("  Body: (empty)\n");
    }
    printf("--------------------\n");

    // 创建响应内容
    struct evbuffer *buf = evbuffer_new();
    if (!buf) {
        fprintf(stderr, "Failed to create response buffer\n");
        evhttp_send_error(req, HTTP_INTERNAL, "Internal Server Error");
        return;
    }

    evbuffer_add_printf(buf, "<html><body><h1>Hello from libevent!</h1>");
    evbuffer_add_printf(buf, "<p>You requested: %s</p>", uri);
    if (method == EVHTTP_REQ_POST && body_len > 0) {
         evbuffer_add_printf(buf, "<p>Received POST data (first %zu bytes):</p><pre>", body_len);
         evbuffer_add_reference(buf, evbuffer_pullup(req_body, -1), body_len, NULL, NULL); // More efficient for larger bodies
         evbuffer_add_printf(buf, "</pre>");
    }
     evbuffer_add_printf(buf, "</body></html>");

    // 添加响应头部
    evhttp_add_header(evhttp_request_get_output_headers(req), "Content-Type", "text/html; charset=UTF-8");
    evhttp_add_header(evhttp_request_get_output_headers(req), "Server", "Libevent Test Server");

    // 发送响应
    evhttp_send_reply(req, HTTP_OK, "OK", buf);

    // 释放响应 buffer
    evbuffer_free(buf);
}

// 特定路径的回调
void specific_handler(struct evhttp_request *req, void *arg) {
     struct evbuffer *buf = evbuffer_new();
     evbuffer_add_printf(buf, "<html><body><h2>This is the specific /hello path!</h2></body></html>");
     evhttp_add_header(evhttp_request_get_output_headers(req), "Content-Type", "text/html");
     evhttp_send_reply(req, HTTP_OK, "OK", buf);
     evbuffer_free(buf);
     printf("Handled /hello request.\n");
}


// SIGINT 信号处理函数，用于优雅退出
void signal_handler(evutil_socket_t fd, short event, void *arg) {
    struct event_base *base = (struct event_base *)arg;
    printf("Caught signal, exiting cleanly...\n");
    event_base_loopbreak(base); // 停止事件循环
}

int main(int argc, char **argv) {
    struct event_base *base;
    struct evhttp *http;
    struct evhttp_bound_socket *handle;
    struct event *sigint_event;

    ev_uint16_t port = 8088;
    const char *address = "0.0.0.0";

    // 初始化 libevent
    base = event_base_new();
    if (!base) {
        fprintf(stderr, "Could not initialize libevent!\n");
        return 1;
    }

    // 创建 HTTP 服务器
    http = evhttp_new(base);
    if (!http) {
        fprintf(stderr, "Could not create evhttp instance!\n");
        event_base_free(base);
        return 1;
    }

    // 设置回调函数
    // 设置特定路径的回调
    evhttp_set_cb(http, "/hello", specific_handler, NULL);
    // 设置通用回调（处理所有其他请求）
    evhttp_set_gencb(http, generic_handler, NULL);


    // 绑定端口
    handle = evhttp_bind_socket_with_handle(http, address, port);
    if (!handle) {
        fprintf(stderr, "Could not bind to %s:%d!\n", address, port);
        evhttp_free(http);
        event_base_free(base);
        return 1;
    }

     // 获取实际绑定的端口（如果传入的 port 为 0）
    struct sockaddr_storage ss;
    evutil_socket_t fd = evhttp_bound_socket_get_fd(handle);
    ev_socklen_t len = sizeof(ss);
    if (getsockname(fd, (struct sockaddr *)&ss, &len) == 0) {
        if (ss.ss_family == AF_INET) {
            port = ntohs(((struct sockaddr_in*)&ss)->sin_port);
        } else if (ss.ss_family == AF_INET6) {
            port = ntohs(((struct sockaddr_in6*)&ss)->sin6_port);
        }
    }

    printf("HTTP server listening on %s:%d\n", address, port);

    // 设置 SIGINT 信号处理器以实现优雅退出
    sigint_event = evsignal_new(base, SIGINT, signal_handler, base);
    if (!sigint_event || event_add(sigint_event, NULL) < 0) {
         fprintf(stderr, "Could not create/add SIGINT event!\n");
    }


    // 启动事件循环
    event_base_dispatch(base);

    // 清理
    printf("Cleaning up...\n");
    if (sigint_event) event_free(sigint_event);
    evhttp_free(http); // evhttp_free 会关闭 handle
    event_base_free(base);

    printf("Server stopped.\n");
    return 0;
}

```



##### http客户端
