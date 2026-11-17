---
title: "数学模板"
description: "素数、组合数学、逆元、斯特林数等数论与组合模板。"
date: 2026-08-27
tags: [数学, 模板, C++]
---
## 素数

### 线性筛

同时可以用来预处理某些积性函数，如$\phi(x)\ \mu(x) $等

```cpp
bool st[N];
int prime[N],phi[N],cnt;

void init(int x){
    phi[1] = 1;
    for (int i = 2; i <= x; i ++) {
        if (!st[i]){
            prime[++cnt] = i;
            phi[i] = i - 1;
        }
        for (int j = 1; prime[j] * i <= x; j ++) {
            st[i * prime[j]] = true;
            if (i % prime[j] == 0){
                phi[i * prime[j]] = phi[i] * prime[j]; 
                break;
            }
            phi[i * prime[j]] = phi[i] *(prime[j] - 1);
        }
    }
}
```

### 分解质因数

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

vector<int> get_divisors(vector<pii> p) {
    vector<int> res;
    auto dfs = [&](auto&&self, int u, int now) -> void {
        if (u == p.size()) {
            res.push_back(now);
            return;
        }
        self(self, u + 1, now);
        for (int i = 1; i <= p[u].se; i++) {
            now *= p[u].fi;
            self(self, u + 1, now);
        }
    };
    dfs(dfs, 0, 1);
    return res;
}
```





### Pollard Rho

```cpp

typedef long long ll;
typedef __int128 lll;
typedef pair<ll,ll> pii;

vector<ll>divisors;
vector<PII>factors;

unordered_map<ll,ll>primes;

ll gcd(ll a,ll b){
    return b?gcd(b,a%b):a;
}

ll qmi(ll a,ll b,ll p){
    ll res=1;
    while(b){
        if(b&1)res=(lll)res*a%p;
        b/=2;
        a=(lll)a*a%p;
    }
    return res;
}
//Miller–Rabin 素性测试
bool isprime(ll p){
    if(p<3)return p==2;
    if(p%2==0)return false;
    ll A[]={2,3,5,7,11,13,17,19,23,29,31,37},d=p-1,r=0;
    while(d%2==0)d/=2,r++;
    for(auto a:A){
        ll v=qmi(a,d,p);
        if(v<=1||v==p-1)continue;
        for(int i=1;i<=r;i++){
            v=(lll)v*v%p;
            if(v==p-1&&i!=r){
                v=1;
                break;
            }
            if(v==1)return false;
        }
        if(v!=1)return false;
    }
    return true;
}

ll rho(ll x){
    if(x==4)return 2;
    if(isprime(x))return x;
    while(1){
        ll c=rand()%(x-1)+1;
        auto f=[=](ll a){return ((lll)a*a+c)%x;};
        ll t=0,r=0,p=1,q;
        do{
            for(int i=0;i<128;i++){
                t=f(t),r=f(f(r));
                if(t==r||(q=(lll)p*abs(t-r)%x)==0)break;
                p=q;
            }
            ll d=gcd(p,x);
            if(d>1)return d;
        }while(t!=r);
    }
}      

void dfs(ll u,ll p){
    if(u==factors.size()){
        divisors.push_back(p);
        return;
    }
    for(int i=0;i<=factors[u].se;i++){
        dfs(u+1,p);
        p*=factors[u].fi;
    }
}

auto g = [&](auto&&self, ll x){
    if(x<2)return;
    if(isprime(x)){
        primes[x]++;
        return;
    }
    ll d=rho(x);
    self(self, x/d),self(self, d);
};

primes.clear();
divisors.clear();
factors.clear();
g(g, x);
for (auto j : primes) {
    factors.push_back(j);
}
dfs(0, 1);
```



## gcd

朴素

```cpp
int gcd(int a, int b) {
    return b ? gcd(b, a % b) : a;
}
```

Binary GCD

```cpp
int gcd(int a, int b){
	int x = __builtin_ctz(a), y = __builtin_ctz(b);
	b >>= y;int z = min(x,y);
	while (a) {
		a >>= x;
        int t = b - a;
		b = min(a, b);
        a = abs(t);
        x = __builtin_ctz(t);
	}
	return b << z;
}
```

$O(V)-O(1)$gcd

```cpp
struct GCD{
    vector<array<int, 3>> f;
    vector<int> primes, st;
    vector<vector<int>> d;
    int n, m;
    int cnt;
    GCD() {}
    GCD(int _n) {
        init(_n);
    }
    void init(int _n) {
        n = _n;
        st.assign(n + 1, 0);
        primes.assign(n + 1, 0);
        f.assign(n + 1, {0, 0, 0});
        cnt = 0;
        f[1][0] = f[1][1] = f[1][2] = 1;

        for (int i = 2; i <= n; i++) {
            if (!st[i]) {
                primes[++cnt] = i;
                f[i][0] = f[i][1] = 1, f[i][2] = i;
            }
            for (int j = 1; i * primes[j] <= n; j++) {
                int p = primes[j], ip = i * p;
                st[ip] = true;
                f[ip][0] = f[i][0] * p;
                f[ip][1] = f[i][1];
                f[ip][2] = f[i][2];
                if (f[ip][0] > f[ip][1]) {
                    swap(f[ip][0], f[ip][1]);
                    if (f[ip][1] > f[ip][2]) {
                        swap(f[ip][1], f[ip][2]);
                    }
                } 
                if (i % p == 0) break; 
            }
        }

        m = sqrt(n);
        d.assign(m + 1, vector<int>(m + 1));
        for (int i = 0; i <= m; i++) {
            d[0][i] = d[i][0] = i;
        }
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= i; j++) {
                d[i][j] = d[j][i] = d[j][i % j];
            }
        }
    } 
    int get(int x, int y) {
        assert(x <= n && y <= n && x >= 0 && y >= 0);
        if (!x) return y;
        int res = 1;
        for (int i = 0; i < 3; i++) {
            auto&p = f[x][i];
            int t;
            if (p <= m) {
                t = d[p][y % p];
            } else {
                t = y % p ? 1 : p;
            }
            y /= t;
            res *= t;
        }
        return res;
    }
};
```



## 斯特林数

### 第二类斯特林数

定义为将n个元素划分为m个互不区分非空集合的个数，记为 
$$
S(n,m)或

\left\{{\begin{matrix}n\\m\end{matrix}}\right\}
$$

递推式为
$$
\left\{{\begin{matrix}n\\m\end{matrix}}\right\}=
\left\{{\begin{matrix}n-1\\m-1\end{matrix}}\right\}+
m\left\{{\begin{matrix}n-1\\m\end{matrix}}\right\}
$$
通项公式为
$$
\left\{{\begin{matrix}n\\m\end{matrix}}\right\}=
\sum_{i=0}^m{\frac{(-1)^{m-i}i^n}{i!(m-i)!}}
$$
推导用到了二项式反演

## 二项式反演

$f_n$表示恰好n个的方案数，$g_n$表示至多n个的方案数，则有
$$
g_n=\sum_{i=0}^nC_n^if_i\Leftrightarrow f_n=\sum_{i=0}^n(-1)^{n-i}C_n^ig_i \tag{1}
$$
$f_n$表示恰好k个的方案数，$g_n$表示至少k个的方案数，则有
$$
g_k=\sum_{i=k}^nC_i^kf_i\Leftrightarrow f_k=\sum_{i=k}^n(-1)^{i-k}C_i^kg_i \tag{2}
$$

## 位运算

$O(1)$操作

```c++
__builtin_popcount(unsigned int x) //返回二进制里1的个数
    __builtin_popcountll(unsigned long long x) //返回二进制里1的个数
__builtin_parity()  //返回1的奇偶性
__builtin_ctz()     //二进制里末尾0的个数
__builtin_clz()     //开头零的个数
log2(x)=31-__builtin_clz(x)
```

## 组合数学

### 常用恒等式

$$
C_a^b=C_a^{a-b}\\
C_a^b=\frac{a}{b}C_{a-1}^{b-1}\\
C_a^b=C_a^{b-1}+C_{a-1}^{b-1}\\ 
\sum_{i=0}^{m}C_a^iC_b^{m-i}=C_{a+b}^{m} \qquad
\sum_{x-y=k}C_a^xC_b^y\xlongequal{y=b-y}\sum_{x+y=k+b}C_a^xC_b^y=C_{a+b}^{k+b} \\
F(x)=\sum_{i=0}^{n}C_n^ix^i=(x+1)^n \ F'(1)=\sum_{i=0}^niC_n^i=n2^{n-1}\\
\sum_{i=k}^nC_i^k=C_{n+1}^{k+1} \\
C_n^rC_r^k=C_n^kC_{n-k}^{r-k} \\
F_{n+1}=\sum_{i=0}^nC_{n-i}^i\\
\sum_{k=0}^mC_{n+k}^{k}=\sum_{k=0}^{m}C_{n+k}^n=C_{n+m+1}^{m+1} (斜线求和)
$$

### 常见组合方案

1. 从$n$个数里可放回的选取$m$个数的方案数为$C_{n+m-1}^{m}$,可以利用插板法推导

2. 令$S_k=\sum_{i=1}^ni^k$，根据二项式定理$(n+1)^k-n^k=\sum_{i=0}^kC_{k+1}^in^i$，累加求和可得
   $$
   S_k=\frac{(n+1)^{k+1}-1-\sum_{i=0}^{k-1}C_{k+1}^iS_i}{k+1}
   $$
   

### 预处理组合数

```cpp
int fact[N],infact[N];

int qmi(int a, int b) {
    int res = 1;
    while (b) {
        if (b & 1) res = 1ll * res * a % mod;
        b /= 2;
        a = 1ll * a * a % mod;
    }
    return res;
}

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

## 拓展欧几里得

对于二元一次不定方程
$$
ax+by=c
$$
令$d=gcd(a,b)$,当$d|c$时有通解
$$
\begin{cases}
x=x_0*\frac{c}{d}+k*\frac{b}{d}\\ 
y=y_0*\frac{c}{d}-k*\frac{a}{d}
\end{cases}
$$

其中$x_0,y_0$为拓欧求出来的一组解


```cpp
ll exgcd(ll a, ll b, ll&x, ll&y) {
    if (!b){
        x = 1, y = 0;
        return a;
    }
    ll d = exgcd(b, a % b, y, x);
    y -= a / b * x;
    return d;
}

ll a, b, c, x, y;
cin >> a >> b >> c;
int d = exgcd(a, b, x, y);
if (c % d) cout << "-1\n";
else {
    ll m = c / d;
    x *= m, y *= m;
    ll t1 = b / d, t2 = a / d; 
    ll x_min = ((x % t1 + t1) % t1) ?((x % t1 + t1) % t1) : t1, y_max = (c - a * x_min) / b;
    ll y_min = ((y % t2 + t2) % t2) ? (y % t2 + t2) % t2 : t2, x_max = (c - b * y_min) / a;
    if (y_max > 0) {
        int k1 = (y_max + t2 - 1) / t2;
        cout << k1 << " " << x_min << " " << y_min << " " << x_max << " " << y_max << "\n";
    } else {
        cout << x_min << " " << y_min << "\n";
    }

}
```

## 逆元

求$b/a\equiv bx(mod \ p)$，也就是求$ax\equiv 1(mod \ p)$，当$gcd(a,p)\not=1$，$x$不存在。

### 快速幂

当$gcd(a,p)=1,p$为质数，此时由费马小定理$a^{p-1}\equiv1(mod \ p)$有$x=a^{p-2}$

### exgcd

当$gcd(a,p)=1,p$不保证为质数，此时等价于求同余方程$ax+py=1$中$x$的值

```cpp
int exgcd(int a, int b, int&x, int&y){
    if (!b) {
        x = 1, y = 0;
        return a;
    }
    int d = exgcd(b, a % b, y, x);
    y -= a / b * x;
    return d;
}
exgcd(a, p, x, y)
```

### 线性递推

$p=ki+r$，其中$k$是除数，$r$是余数

$ki+r\equiv0(mod \ p)\Leftrightarrow kr^{-1}+i^{-1}\equiv0(mod \ p)$

故$inv[1]=1,inv[i]=(p-p/i)inv[p\%i]\%p$

不过以下方法比线性递推更快

```cpp
void init(){
    fact[0]=infact[0]=1;
    //这里逆元需要用线性推导，用快速幂不能处理1e7级别的逆元
    for(int i=1;i<=20000000;i++){
        fact[i]=1ll*fact[i-1]*i%mod;
    }
    infact[10000000]=qmi(fact[10000000],mod-2);
    for(int i=10000000;i>=2;i--){
        infact[i-1]=1ll*infact[i]*i%mod;
    }
}
```

## 拓展欧拉定理

指数取模
$$
a^b\equiv\left\{\begin{matrix}a^b,b\lt\varphi(m)\\a^{b\bmod\varphi(m)+\varphi(m)},b\ge\varphi(m)\end{matrix}\right.\pmod m
$$

## 矩阵乘法

### vector写法

vector在这里常数较大，被卡过

```cpp
vector<vector<int>> mul(vector<vector<int>> a, vector<vector<int>> b){
    int n = a.size();
    int m = b.size();
    int l = b[0].size();
    vector<vector<int>> temp(n,vector<int>(l));
    for (int i = 0; i < n; i ++){
        for (int k = 0; k < m; k ++) {
            for (int j = 0; j < l; j ++) {
                temp[i][j] = (temp[i][j] + 1ll * a[i][k] * b[k][j]) % mod;
            }
        }
    }
    return temp;
}

vector<vector<int>> qmi(vector<vector<int>> a, int b){
    vector<vector<int>> res(a.size());
    for (int i = 0; i < a.size(); i ++) {
        for (int j = 0; j < a.size(); j ++) {
            res[i].push_back(i == j);
        }
    }
    while (b) {
        if(b & 1)res = mul(res, a);
        b /= 2;
        a = mul(a, a);
    }
    return res;
}
```
### 数组写法

矩阵乘法的拓展定义，数组写法，常数小

```cpp
void mul(int res[2][2], int a[2][2], int b[2][2]){
    ll temp[2][2];
    memset(temp,0x3f,sizeof temp);
    for (int i = 0; i < 2; i ++){
        for (int k = 0; k < 2; k ++) {
            for (int j = 0; j < 2; j ++) {
                temp[i][j] = min(temp[i][j] , a[i][k] + b[k][j]);
            }
        }
    }
    memcpy(res, temp, sizeof temp);
}
void qmi(int res[2][2],int a[2][2], int b){
    int temp[2][2];
    memset(temp,0,sizeof temp);
    while (b) {
        if(b & 1)mul(temp, res, a);
        b /= 2;
        mul(a, a, a);
    }
    memcpy(res, temp, sizeof temp);
}
```

### 类写法

```cpp
struct Matrix{
    int mat[2][2];
    Matrix(){
        for (int i = 0; i < 2; i++) {
            for (int j = 0; j < 2; j++) {
                mat[i][j] = 0;
            }
        }
    }
    Matrix operator*(Matrix b){
        Matrix c;
        for (int i = 0; i < 2; i++) {
            for (int k = 0; k < 2; k++) {
                for (int j = 0; j < 2; j++) {
                    c.mat[i][j] = (c.mat[i][j]+ 1ll * mat[i][k] * b.mat[k][j]) % mod;
                }
            }
        }
        return c;
    }
    Matrix operator^(ll b) const{
        Matrix res, temp=*this;
        for (int i = 0; i < 2; i++) {
            res.mat[i][i] = 1;
        }
        while (b) {
            if (b & 1) res = res * temp;
            temp = temp * temp;
            b /= 2;
        }
        return res;
    }
};
```



## 概率论

### 负超几何分布

$n$个白球，m个黑球，求抽出$r$个白球的期望抽取次数
$$
P(X=k)=\frac{C_n^{r-1}C_m^{k-r}}{C_{n+m}^{k-1}}\frac{n-r+1}{n+m-k+1} \\
E(X)=r+\frac{rn}{m+1}
$$

## 整除分块

### 向下取整

对于形如$f(\lfloor n/i \rfloor)$函数的快速求和，由于$n/i$只有$O(\sqrt n)$种取值，可以快速求和

```cpp
for (ll l = 1; l <= n; l ++) {
    int d = n / l, r = n / d;
    res += 1ll * d * (r - l + 1);
    l = r;
}
```

### 向上取整

```cpp
for (ll l = 1; l <= n; l ++) {
    int d = (n + l - 1) / l, r = (d > 1) ? (n - 1) / (d - 1) : n; 
    res += 1ll * d * (r - l + 1);
    l = r;
}
```

### 快速乘

```cpp
ll mul(ll a, ll b, ll p) {
    a %= p, b %= p;
    ll d = (long double)a * b / p;
    //虽然溢出但是会抵消
    d = a * b - d * p;
    //防止精度问题
    if (d >= p) d -= p;
    if (d < 0) d += p;
    return d;
}
```

### 快速取模

```cpp
typedef unsigned long long ull;
typedef __uint128_t L;

struct FMod {
    ull b, m;
    FMod(ull b) : b(b), m(ull((L(1) << 64) / b)) {}
    ull reduce(ull a) {
        ull q = (ull)((L(m) * a) >> 64);
        ull r = a - q * b; // can be proven that 0 <= r < 2*b
        return r >= b ? r - b : r;
    }
};
```





## 中国剩余定理

对于方程组$x\equiv b_i(mod \ a_i)$，当$a_i$都互质时，此时一定有解

记$t_i=\prod_{j=1}^n\frac{a_j}{a_i}$,$t_i^{-1}$为$t_i$在$a_i$模意义下的逆元，故有
$$
res=\sum_{i=1}^nb_it_it_i^{-1}
$$

```cpp
ll inv(ll a, ll p){
    ll x, y;
    exgcd(a, p, x, y);
    return (x % p + p) % p;
}

ll CRT(vector<ll> a, vector<ll> b) {
    ll A = 1;
    //这里需要保证在ll范围内
    for (int i = 0; i < n; i ++) {
        A *= a[i];
    }
    ll res = 0;
    for (int i = 0; i < n; i ++) {
        ll t = A / a[i];
        //这里有可能报ll
        res = (res + (__int128)b[i] * t * inv(t, a[i])) % A;
    }
    return res;
}
```

### 拓展中国剩余定理

当不保证$a_i$都互质时，我们可以依次合并同余方程组，同时判断解的情况
$$
x=a_1k+b_1\\
x=a_2k+b_2
$$

```cpp
//需保证a1 a2 为正数
bool merge(ll&a1, ll&b1, ll a2 = 1, ll b2 = 0) {
    ll k1, k2;
    ll d = exgcd(a1, a2, k1, k2);
    // k1 = k1 * (b2 - b1) / d + k * a2 / d
    if((b2 - b1) % d)return false;
    // x = (a1 * a2 / d) * k + (a1 * k1 * (b2 - b1) / d + b1)
    ll t = (b2 - b1) / d;
    ll p = a2 / d;
    k1 = ((__int128)k1 * t % p + p) % p; 
    b1 = (__int128)a1 * k1 + b1;
    a1 *= p;
    return true;
}
```



```python
def exgcd(a, b):
    """扩展欧几里得算法，返回 (gcd, x, y) 使得 ax + by = gcd(a, b)"""
    if b == 0:
        return a, 1, 0
    gcd, x1, y1 = exgcd(b, a % b)
    x = y1
    y = x1 - (a // b) * y1
    return gcd, x, y

def merge(a1, b1, a2 = 1, b2 = 0):
    """
    合并两个线性同余方程
    x ≡ b1 (mod a1)
    x ≡ b2 (mod a2)
    
    返回 (是否成功, 新的a1, 新的b1)
    """
    # 计算扩展欧几里得
    d, k1, k2 = exgcd(a1, a2)
    
    # 检查是否有解
    if (b2 - b1) % d != 0:
        return False, a1, b1
    
    # 计算参数
    t = (b2 - b1) // d
    p = a2 // d
    
    # 计算 k1，确保其为正数
    k1 = (k1 * t) % p
    if k1 < 0:
        k1 += p
    
    # 计算新的 b1 和 a1
    new_b1 = a1 * k1 + b1
    new_a1 = a1 * p
    
    return True, new_a1, new_b1
```





## 高斯消元

```cpp
const double eps = 1e-6;

double a[N][N];
int n;

int gauss() {
    int r, c;
    for (r = 0, c = 0; c < n; c ++) {
        int t = r;
        //找到绝对值最大的数字
        for (int i = r; i < n; i ++) {
            if (fabs(a[i][c]) > fabs(a[t][c])) t = i;
        }
        //该列都为0
        if (fabs(a[t][c]) < eps) continue;
        //把该行交换到当前行
        for (int i = c; i <= n; i ++) {
            swap(a[t][i], a[r][i]);
        }
        //把首系数变为1
        for (int i = n; i >= c; i --) {
            a[r][i] /= a[r][c];
        }
        //把下面系数变为0
        for (int i = r + 1; i < n; i ++) {
            if(fabs(a[i][c]) > eps) {
                for (int j = n; j >= c; j --) {
                    a[i][j] -= a[i][c] * a[r][j];
                }
            }
        }
        r ++;
    }
    if (r < n) {
        for (int i = r; i < n; i ++) {
            //无解
            if (fabs(a[i][n]) > eps) return 2;
        }
        //多解
        return 1;
    }
    for (int i = n - 1; i >= 0; i --) {
        for (int j = i + 1; j < n; j ++) {
            a[i][n] -= a[j][n] * a[i][j];
        }
    }
    return 0;
}
```

## Lucas

```cpp
int C(int a,int b){
    int res=1;
    for(int i=b,j=a;i>=1;i--,j--){
        res=(ll)res*j%p;
        res=(ll)res*qmi(i,p-2)%p;
    }
    return res;
}
int lucus(ll a,ll b){
    if(a>=p||b>=p){
        return (ll)lucus(a/p,b/p)*C(a%p,b%p)%p;
    }else{
        return C(a,b);
    }
}
```

## 线性基

```cpp
template <typename T>
struct LB{ //linear basis
    vector<T> d, p;
    int zero;
    // 插入x
    LB() {}
    LB(int k) {
        init(k);
    }
    // 有多少位，k = __lg(V) + 1
    void init(int k) {
        d.assign(k, T());
        zero = 0;
    }
    ll& operator [](int x){
		return d[x];
	}
    // 插入线性基
    bool insert(T x, int cnt = 1){
        zero += cnt - 1;
        for (int i = d.size() - 1; i >= 0; i--) {
            if (x >> i & 1) {
                if (!d[i]) {
                    d[i] = x;
                    return true;
                } else {
                    x ^= d[i];
                }
            }
        }
        zero ++;
        return false;
    }
    // 合并线性基
    void merge(LB d2){
        for (int i = d.size() - 1; i >= 0; i--) {
            if (d2[i]) {
                insert(d2[i]);
            }
        }
    }
    // 询问是否存在
    bool query(T x) {
        for (int i = d.size() - 1; i >= 0; i--) {
            if (x >> i & 1) {
                if (!d[i]) return false;
                else x ^= d[i];
            }
        }
        return !x;
    }
    T getmax(T x = T()){
        for(int i = d.size() - 1; i >= 0; i--) {
            if (!(x >> i & 1)) {
                x ^= d[i];
            }
        }
        return x;
    }
    T getmin(){
        if (zero) return 0;
        for(int i = 0; i < d.size(); i++) {
            if (d[i]) {
                return d[i];
            }
        }
        return -1;
    }
    void rebuild() {
        p.clear();
        for (int i = d.size() - 1; i >= 0; i--) {
            for (int j = i - 1; j >= 0; j--) {
                if (d[i] >> j & 1) d[i] ^= d[j];
            }
        }
        for (int i = 0; i < d.size(); i++) {
            if (d[i]) p.push_back(d[i]);
        }
    }
    // 去重后第k小
    T ask(T k, bool flag = true) {
        k -= (bool)zero;
        if (!k) return 0;
        if (flag) rebuild();
        if (k >= T(1) << p.size()) return -1;
        T x = 0;
        for (int i = 0; i < p.size(); i++) {
            if (k >> i & 1) x ^= p[i];
        }
        return x;
    }
};
```




## 其他

### 斐波那契循环节

```cpp
ll primeloop(ll x) {
    if(x == 2) return 3;
    if(x == 5) return 20;
    if(qmi(5, (x - 1) >> 1, x) == 1) return x - 1;
    return 2 * x + 2;
}

ll loop = 1;
for (auto [prime, cnt] : p) {
    ll t = qmi(prime, cnt - 1, 1e18) * primeloop(prime);
    loop = loop / gcd(loop, t) * t; 
}
```

### 质数距离

$dist_p=\Theta(log^2p)$，对于$1e18$级别的，$dist<=1442$

## FFT/NTT

### FFT

```cpp
typedef double LD;
typedef long long ll;
const int FFT_MAXN = 1<<21, N = 1000010;// n + m < FFT_MAXN < N
const LD pi = acos(-1.);

struct cp{
	LD a, b;
	cp operator+(const cp&y) const{
        return (cp){a + y.a, b + y.b};
    }
	cp operator-(const cp&y) const{
        return (cp){a - y.a, b - y.b};
    }
	cp operator*(const cp&y) const{
        return (cp){a * y.a - b * y.b, a * y.b + b * y.a};
    }
	cp operator!() const{
        return (cp){a, -b};
    }
}nw[FFT_MAXN+1];

int bitrev[FFT_MAXN];

void dft(cp *a, int n, int flag = 1){
	int d = 0;
	while ((1 << d) * n != FFT_MAXN) d++;
	for (int i = 0; i < n; i ++) {
        if (i < (bitrev[i] >> d)) swap(a[i], a[bitrev[i] >> d]);
    }
	for (int l = 2; l <= n; l <<= 1){
		int del = FFT_MAXN / l * flag;
		for (int i = 0; i < n; i += l){
			cp *le = a + i, *ri = a + i + (l >> 1), *w = flag == 1 ? nw : nw + FFT_MAXN;
			for (int k = 0; k < l >> 1; k ++) {
				cp ne = *ri * *w;
				*ri = *le - ne, *le = *le + ne;
				le++, ri++, w += del;
			}
		}
	}
	if (flag != 1){
        for (int i = 0; i < n; i ++){
            a[i].a /= n, a[i].b /= n;
        }
    }
}

void fft_init() {
	int L = 0;
	while((1 << L) != FFT_MAXN) L++;
	bitrev[0] = 0;
	for (int i = 1; i < FFT_MAXN; i ++){
        bitrev[i] = bitrev[i>>1]>>1|((i&1)<<(L-1));
    }
	nw[0] = nw[FFT_MAXN] = (cp){1, 0};
	for (int i = 0; i < FFT_MAXN + 1; i ++){
        nw[i] = (cp){cos(2*pi/FFT_MAXN*i), sin(2*pi/FFT_MAXN*i)};
    }
}
//卷积
void convo(LD *a, int n, LD *b, int m, LD *c){
	static cp f[FFT_MAXN>>1], g[FFT_MAXN>>1], t[FFT_MAXN>>1];
	int N = 2;
	while(N <= n + m) N <<= 1;
	for (int i = 0; i < N; i ++){
		if (i & 1){
			f[i>>1].b = (i <= n) ? a[i] : 0.0;
			g[i>>1].b = (i <= m) ? b[i] : 0.0;
		} else {
			f[i>>1].a = (i <= n) ? a[i] : 0.0;
			g[i>>1].a = (i <= m) ? b[i] : 0.0;
		}
	}
	dft(f, N >> 1);
	dft(g, N >> 1);
	int del = FFT_MAXN / (N >> 1);
	cp qua = (cp){0, 0.25}, one = (cp){1, 0}, four = (cp){4, 0}, *w = nw;
	for (int i = 0; i < N >> 1; i ++){
		int j = i ? (N>>1)-i : 0;
		t[i] = (four * !(f[j]*g[j]) - (!f[j] - f[i]) * (!g[j] - g[i]) * (one+ *w)) * qua;
		w += del;
	}
	dft(t, N >> 1, -1);
	for (int i = 0; i < n + m + 1; i ++){
	    c[i] = (i&1) ? t[i>>1].a : t[i>>1].b;
    }
}

```

### NTT

```cpp
const int md = 998244353;

inline void add(int& x, int y) {
    x += y;
    if (x >= md) {
        x -= md;
    }
}

inline void sub(int& x, int y) {
    x -= y;
    if (x < 0) {
        x += md;
    }
}

inline int mul(int x, int y) {
    return (long long)x * y % md;
}

inline int power(int x, long long y) {
    int res = 1;
    for (; y; y >>= 1, x = mul(x, x)) {
        if (y & 1) {
            res = mul(res, x);
        }
    }
    return res;
}

inline int inv(int a) {
    a %= md;
    if (a < 0) {
        a += md;
    }
    int b = md, u = 0, v = 1;
    while (a) {
        int t = b / a;
        b -= t * a;
        swap(a, b);
        u -= t * v;
        swap(u, v);
    }
    if (u < 0) {
        u += md;
    }
    return u;
}

namespace ntt {
    
int base = 1, root = -1, max_base = -1;
vector<int> rev = {0, 1}, roots = {0, 1};

void init() {
    int temp = md - 1;
    max_base = 0;
    while (temp % 2 == 0) {
        temp >>= 1;
        ++max_base;
    }
    root = 2;
    while (true) {
        if (power(root, 1 << max_base) == 1 && power(root, 1 << (max_base - 1)) != 1) {
            break;
        }
        ++root;
    }
}

void ensure_base(int nbase) {
    if (max_base == -1) {
        init();
    }
    if (nbase <= base) {
        return;
    }
    assert(nbase <= max_base);
    rev.resize(1 << nbase);
    for (int i = 0; i < 1 << nbase; ++i) {
        rev[i] = (rev[i >> 1] >> 1) | ((i & 1) << (nbase - 1));
    }
    roots.resize(1 << nbase);
    while (base < nbase) {
        int z = power(root, 1 << (max_base - 1 - base));
        for (int i = 1 << (base - 1); i < 1 << base; ++i) {
            roots[i << 1] = roots[i];
            roots[i << 1 | 1] = mul(roots[i], z);
        }
        ++base;
    }
}

void dft(vector<int>& a) {
    int n = a.size(), zeros = __builtin_ctz(n);
    ensure_base(zeros);
    int shift = base - zeros;
    for (int i = 0; i < n; ++i) {
        if (i < rev[i] >> shift) {
            swap(a[i], a[rev[i] >> shift]);
        }
    }
    for (int i = 1; i < n; i <<= 1) {
        for (int j = 0; j < n; j += i << 1) {
            for (int k = 0; k < i; ++k) {
                int x = a[j + k], y = mul(a[j + k + i], roots[i + k]);
                a[j + k] = (x + y) % md;
                a[j + k + i] = (x + md - y) % md;
            }
        }
    }
}
//多项式乘法
vector<int> multiply(vector<int> a, vector<int> b) {
    int need = a.size() + b.size() - 1, nbase = 0;
    while (1 << nbase < need) {
        ++nbase;
    }
    ensure_base(nbase);
    int sz = 1 << nbase;
    a.resize(sz);
    b.resize(sz);
    bool equal = a == b;
    dft(a);
    if (equal) {
        b = a;
    } else {
        dft(b);
    }
    int inv_sz = inv(sz);
    for (int i = 0; i < sz; ++i) {
        a[i] = mul(mul(a[i], b[i]), inv_sz);
    }
    reverse(a.begin() + 1, a.end());
    dft(a);
    a.resize(need);
    return a;
}
//多项式求逆
vector<int> inverse(vector<int> a) {
    int n = a.size(), m = (n + 1) >> 1;
    if (n == 1) {
        return vector<int>(1, inv(a[0]));
    } else {
        vector<int> b = inverse(vector<int>(a.begin(), a.begin() + m));
        int need = n << 1, nbase = 0;
        while (1 << nbase < need) {
            ++nbase;
        }
        ensure_base(nbase);
        int sz = 1 << nbase;
        a.resize(sz);
        b.resize(sz);
        dft(a);
        dft(b);
        int inv_sz = inv(sz);
        for (int i = 0; i < sz; ++i) {
            a[i] = mul(mul(md + 2 - mul(a[i], b[i]), b[i]), inv_sz);
        }
        reverse(a.begin() + 1, a.end());
        dft(a);
        a.resize(n);
        return a;
    }
}
    
}  // namespace ntt

using ntt::inverse;
using ntt::multiply;

vector<int>& operator+=(vector<int>& a, const vector<int>& b) {
    if (a.size() < b.size()) {
        a.resize(b.size());
    }
    for (int i = 0; i < b.size(); ++i) {
        add(a[i], b[i]);
    }
    return a;
}

vector<int> operator+(const vector<int>& a, const vector<int>& b) {
    vector<int> c = a;
    return c += b;
}

vector<int>& operator-=(vector<int>& a, const vector<int>& b) {
    if (a.size() < b.size()) {
        a.resize(b.size());
    }
    for (int i = 0; i < b.size(); ++i) {
        sub(a[i], b[i]);
    }
    return a;
}

vector<int> operator-(const vector<int>& a, const vector<int>& b) {
    vector<int> c = a;
    return c -= b;
}

vector<int>& operator*=(vector<int>& a, const vector<int>& b) {
    if (min(a.size(), b.size()) < 128) {
        vector<int> c = a;
        a.assign(a.size() + b.size() - 1, 0);
        for (int i = 0; i < c.size(); ++i) {
            for (int j = 0; j < b.size(); ++j) {
                add(a[i + j], mul(c[i], b[j]));
            }
        }
    } else {
        a = multiply(a, b);
    }
    return a;
}

vector<int> operator*(const vector<int>& a, const vector<int>& b) {
    vector<int> c = a;
    return c *= b;
}

vector<int>& operator/=(vector<int>& a, const vector<int>& b) {
    int n = a.size(), m = b.size();
    if (n < m) {
        a.clear();
    } else {
        vector<int> c = b;
        reverse(a.begin(), a.end());
        reverse(c.begin(), c.end());
        c.resize(n - m + 1);
        a *= inverse(c);
        a.erase(a.begin() + n - m + 1, a.end());
        reverse(a.begin(), a.end());
    }
    return a;
}

vector<int> operator/(const vector<int>& a, const vector<int>& b) {
    vector<int> c = a;
    return c /= b;
}

vector<int>& operator%=(vector<int>& a, const vector<int>& b) {
    int n = a.size(), m = b.size();
    if (n >= m) {
        vector<int> c = (a / b) * b;
        a.resize(m - 1);
        for (int i = 0; i < m - 1; ++i) {
            sub(a[i], c[i]);
        }
    }
    return a;
}

vector<int> operator%(const vector<int>& a, const vector<int>& b) {
    vector<int> c = a;
    return c %= b;
}
//多项式求导
vector<int> derivative(const vector<int>& a) {
    int n = a.size();
    vector<int> b(n - 1);
    for (int i = 1; i < n; ++i) {
        b[i - 1] = mul(a[i], i);
    }
    return b;
}
//多项式积分
vector<int> primitive(const vector<int>& a) {
    int n = a.size();
    vector<int> b(n + 1), invs(n + 1);
    for (int i = 1; i <= n; ++i) {
        invs[i] = i == 1 ? 1 : mul(md - md / i, invs[md % i]);
        b[i] = mul(a[i - 1], invs[i]);
    }
    return b;
}
//多项式求对数
vector<int> logarithm(const vector<int>& a) {
    vector<int> b = primitive(derivative(a) * inverse(a));
    b.resize(a.size());
    return b;
}
//多项式求指数
vector<int> exponent(const vector<int>& a) {
    vector<int> b(1, 1);
    while (b.size() < a.size()) {
        vector<int> c(a.begin(), a.begin() + min(a.size(), b.size() << 1));
        add(c[0], 1);
        vector<int> old_b = b;
        b.resize(b.size() << 1);
        c -= logarithm(b);
        c *= old_b;
        for (int i = b.size() >> 1; i < b.size(); ++i) {
            b[i] = c[i];
        }
    }
    b.resize(a.size());
    return b;
}
//多项式快速幂
vector<int> power(vector<int> a, int m) {
    int n = a.size(), p = -1;
    vector<int> b(n);
    for (int i = 0; i < n; ++i) {
        if (a[i]) {
            p = i;
            break;
        }
    }
    if (p == -1) {
        b[0] = !m;
        return b;
    }
    if ((long long)m * p >= n) {
        return b;
    }
    int mu = power(a[p], m), di = inv(a[p]);
    vector<int> c(n - m * p);
    for (int i = 0; i < n - m * p; ++i) {
        c[i] = mul(a[i + p], di);
    }
    c = logarithm(c);
    for (int i = 0; i < n - m * p; ++i) {
        c[i] = mul(c[i], m);
    }
    c = exponent(c);
    for (int i = 0; i < n - m * p; ++i) {
        b[i + m * p] = mul(c[i], mu);
    }
    return b;
}
//多项式开根
vector<int> sqrt(const vector<int>& a) {
    vector<int> b(1, 1);
    while (b.size() < a.size()) {
        vector<int> c(a.begin(), a.begin() + min(a.size(), b.size() << 1));
        vector<int> old_b = b;
        b.resize(b.size() << 1);
        c *= inverse(b);
        for (int i = b.size() >> 1; i < b.size(); ++i) {
            b[i] = mul(c[i], (md + 1) >> 1);
        }
    }
    b.resize(a.size());
    return b;
}

vector<int> multiply_all(int l, int r, vector<vector<int>>& all) {
    if (l > r) {
        return vector<int>();
    } else if (l == r) {
        return all[l];
    } else {
        int y = (l + r) >> 1;
        return multiply_all(l, y, all) * multiply_all(y + 1, r, all);
    }
}
// 多项式
vector<int> evaluate(const vector<int>& f, const vector<int>& x) {
    int n = x.size();
    if (!n) {
        return vector<int>();
    }
    vector<vector<int>> up(n * 2);
    for (int i = 0; i < n; ++i) {
        up[i + n] = vector<int>{(md - x[i]) % md, 1};
    }
    for (int i = n - 1; i; --i) {
        up[i] = up[i << 1] * up[i << 1 | 1];
    }
    vector<vector<int>> down(n * 2);
    down[1] = f % up[1];
    for (int i = 2; i < n * 2; ++i) {
        down[i] = down[i >> 1] % up[i];
    }
    vector<int> y(n);
    for (int i = 0; i < n; ++i) {
        y[i] = down[i + n][0];
    }
    return y;
}
// 多项式差值
vector<int> interpolate(const vector<int>& x, const vector<int>& y) {
    int n = x.size();
    vector<vector<int>> up(n * 2);
    for (int i = 0; i < n; ++i) {
        up[i + n] = vector<int>{(md - x[i]) % md, 1};
    }
    for (int i = n - 1; i; --i) {
        up[i] = up[i << 1] * up[i << 1 | 1];
    }
    vector<int> a = evaluate(derivative(up[1]), x);
    for (int i = 0; i < n; ++i) {
        a[i] = mul(y[i], inv(a[i]));
    }
    vector<vector<int>> down(n * 2);
    for (int i = 0; i < n; ++i) {
        down[i + n] = vector<int>(1, a[i]);
    }
    for (int i = n - 1; i; --i) {
        down[i] = down[i << 1] * up[i << 1 | 1] + down[i << 1 | 1] * up[i << 1];
    }
    return down[1];
}
// [x^k]P(x)/Q(x)
int bostan_mori(vector<int> p, vector<int> q, ll k) {
    while (k > 0) {
        int d = q.size();
        vector<int> _q = q;
        // _q(x) = q(-x), 偶次项不变，奇次项变号
        for (int i = 1; i < d; i += 2) {
            _q[i] = (md - _q[i]) % md; 
        }
        // u(x) = p(x) * q(-x)
        auto u = p * _q;
        // v(x) = q(x) * q(-x) = q(x^2)
        // 注意：q(x)q(-x) 只有偶次项非零
        auto v_raw = q * _q;
        vector<int> v;
        for (int i = 0; i < v_raw.size(); i += 2) {
            v.push_back(v_raw[i]);
        }
        q = v;
        // 更新 p(x)
        // 如果 k 是偶数，取 u(x) 的偶次项系数作为新的 p
        // 如果 k 是奇数，取 u(x) 的奇次项系数作为新的 p
        p.clear();
        for (int i = k % 2; i < u.size(); i += 2) {
            p.push_back(u[i]);
        }
        k /= 2;
    }
    return mul(p[0], inv(q[0]));
}
```

### 常见卷积

$$
乘卷积:C=A*B,c_j=\sum_{i=0}^{j}a_ib_{j-i}\\
和卷积:C=A+B,直接开桶转化成乘卷积即可\\
差卷积:C=A-B,给每一项加上N映射到正数转换为和卷积\\
$$
