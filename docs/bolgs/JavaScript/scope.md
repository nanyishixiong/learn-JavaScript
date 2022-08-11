# 词法作用域和动态作用域

## 作用域

作用域是指程序源代码中定义变量的区域。

作用域规定了如何查找变量，也就是确定当前执行代码对变量的访问权限。

JavaScript 采用词法作用域(lexical scoping)，也就是静态作用域。

## 静态作用域与动态作用域

因为 JavaScript 采用的是词法作用域，函数的作用域在函数定义的时候就决定了。

而与词法作用域相对的是动态作用域，函数的作用域是在函数调用的时候才决定的。

让我们认真看个例子就能明白之间的区别：

```js
var value = 1;

function foo() {
    console.log(value);
}

function bar() {
    var value = 2;
    foo();
}

bar();

// 结果是 ???
```

假设JavaScript采用静态作用域，让我们分析下执行过程：

执行 foo 函数，先从 foo 函数内部查找是否有局部变量 value，如果没有，就根据书写的位置，查找上面一层的代码，也就是 value 等于 1，所以结果会打印 1。

假设JavaScript采用动态作用域，让我们分析下执行过程：

执行 foo 函数，依然是从 foo 函数内部查找是否有局部变量 value。如果没有，就从调用函数的作用域，也就是 bar 函数内部查找 value 变量，所以结果会打印 2。

前面我们已经说了，JavaScript采用的是静态作用域，所以这个例子的结果是 1。

## 动态作用域

也许你会好奇什么语言是动态作用域？

bash 就是动态作用域，不信的话，把下面的脚本存成例如 scope.bash，然后进入相应的目录，用命令行执行 `bash ./scope.bash`，看看打印的值是多少。

```js
value=1
function foo () {
    echo $value;
}
function bar () {
    local value=2;
    foo;
}
bar
```

这个文件也可以在 [Github 博客仓库](https://github.com/mqyqingfeng/Blog/blob/master/demos/scope/scope.bash)中找到。

## 思考题

最后，让我们看一个《JavaScript权威指南》中的例子：

```js
var scope = "global scope";
function checkscope(){
    var scope = "local scope";
    function f(){
        return scope;
    }
    return f();
}
checkscope();
var scope = "global scope";
function checkscope(){
    var scope = "local scope";
    function f(){
        return scope;
    }
    return f;
}
checkscope()();
```

猜猜两段代码各自的执行结果是多少？

这里直接告诉大家结果，两段代码都会打印：`local scope`。

原因也很简单，因为JavaScript采用的是词法作用域，函数的作用域基于函数创建的位置。

而引用《JavaScript权威指南》的回答就是：

JavaScript 函数的执行用到了作用域链，这个作用域链是在函数定义的时候创建的。嵌套的函数 f() 定义在这个作用域链里，其中的变量 scope 一定是局部变量，不管何时何地执行函数 f()，这种绑定在执行 f() 时依然有效。

但是在这里真正想让大家思考的是：

虽然两段代码执行的结果一样，但是两段代码究竟有哪些不同呢？

如果要回答这个问题，就要牵涉到很多的内容，词法作用域只是其中的一小部分，让我们期待下一篇文章————《JavaScript深入之执行上下文栈》。

# JavaScript深入之执行上下文栈

## 顺序执行？

如果要问到 JavaScript 代码执行顺序的话，想必写过 JavaScript 的开发者都会有个直观的印象，那就是顺序执行，毕竟：

```js
var foo = function () {
    console.log('foo1');
}
foo();  // foo1
var foo = function () {
    console.log('foo2');
}
foo(); // foo2
```

然而去看这段代码：

```js
function foo() {
    console.log('foo1');
}
foo();  // foo2
function foo() {
   console.log('foo2');
}
foo(); // foo2
```

打印的结果却是两个 `foo2`。

刷过面试题的都知道这是因为 JavaScript 引擎并非一行一行地分析和执行程序，而是一段一段地分析执行。当执行一段代码的时候，会进行一个“准备工作”，比如第一个例子中的变量提升，和第二个例子中的函数提升。

但是本文真正想让大家思考的是：这个“一段一段”中的“段”究竟是怎么划分的呢？

到底JavaScript引擎遇到一段怎样的代码时才会做“准备工作”呢？

## 可执行代码

这就要说到 JavaScript 的可执行代码(executable code)的类型有哪些了？

其实很简单，就三种，全局代码、函数代码、eval代码。

举个例子，当执行到一个函数的时候，就会进行准备工作，这里的“准备工作”，让我们用个更专业一点的说法，就叫做"执行上下文(execution context)"。

## 执行上下文栈

接下来问题来了，我们写的函数多了去了，如何管理创建的那么多执行上下文呢？

所以 JavaScript 引擎创建了执行上下文栈（Execution context stack，ECS）来管理执行上下文

为了模拟执行上下文栈的行为，让我们定义执行上下文栈是一个数组：

```js
ECStack = [];
```

试想当 JavaScript 开始要解释执行代码的时候，最先遇到的就是全局代码，所以初始化的时候首先就会向执行上下文栈压入一个全局执行上下文，我们用 globalContext 表示它，并且只有当整个应用程序结束的时候，ECStack 才会被清空，所以程序结束之前， ECStack 最底部永远有个 globalContext：

```JS
ECStack = [
    globalContext
];
```

现在 JavaScript 遇到下面的这段代码了：

```js
function fun3() {
    console.log('fun3')
}

function fun2() {
    fun3();
}

function fun1() {
    fun2();
}

fun1();
```

**当执行一个函数的时候，就会创建一个执行上下文，并且压入执行上下文栈，当函数执行完毕的时候，就会将函数的执行上下文从栈中弹出**。知道了这样的工作原理，让我们来看看如何处理上面这段代码：

```JS
// 伪代码

// fun1()
ECStack.push(<fun1> functionContext);

// fun1中竟然调用了fun2，还要创建fun2的执行上下文
ECStack.push(<fun2> functionContext);

// 擦，fun2还调用了fun3！
ECStack.push(<fun3> functionContext);

// fun3执行完毕
ECStack.pop();

// fun2执行完毕
ECStack.pop();

// fun1执行完毕
ECStack.pop();

// javascript接着执行下面的代码，但是ECStack底层永远有个globalContext
```

## 解答思考题

好啦，现在我们已经了解了执行上下文栈是如何处理执行上下文的，所以让我们看看上篇文章[《JavaScript深入之词法作用域和动态作用域》](https://github.com/mqyqingfeng/Blog/issues/3)最后的问题：

```JS
var scope = "global scope";
function checkscope(){
    var scope = "local scope";
    function f(){
        return scope;
    }
    return f();
}
checkscope();
var scope = "global scope";
function checkscope(){
    var scope = "local scope";
    function f(){
        return scope;
    }
    return f;
}
checkscope()();
```

两段代码执行的结果一样，但是两段代码究竟有哪些不同呢？

答案就是执行上下文栈的变化不一样。

让我们模拟第一段代码：

```JS
ECStack.push(<checkscope> functionContext);
ECStack.push(<f> functionContext);
ECStack.pop();
ECStack.pop();
```

让我们模拟第二段代码：

```JS
ECStack.push(<checkscope> functionContext);
ECStack.pop();
ECStack.push(<f> functionContext);
ECStack.pop();
```

# JavaScript深入之变量对象

## 前言

在上篇[《JavaScript深入之执行上下文栈》](https://github.com/mqyqingfeng/Blog/issues/4)中讲到，当 JavaScript 代码执行一段可执行代码(executable code)时，会创建对应的执行上下文(execution context)。

对于每个执行上下文，都有三个重要属性：

+ 变量对象(Variable object，VO)
+ 作用域链(Scope chain)
+ this

今天重点讲讲创建变量对象的过程。

## 变量对象

变量对象是与执行上下文相关的数据作用域，存储了在上下文中定义的变量和函数声明。

因为不同执行上下文下的变量对象稍有不同，所以我们来聊聊全局上下文下的变量对象和函数上下文下的变量对象。

## 全局上下文

我们先了解一个概念，叫全局对象。在 [W3School](http://www.w3school.com.cn/jsref/jsref_obj_global.asp) 中也有介绍：

> 全局对象是预定义的对象，作为 JavaScript 的全局函数和全局属性的占位符。通过使用全局对象，可以访问所有其他所有预定义的对象、函数和属性。

> 在顶层 JavaScript 代码中，可以用关键字 this 引用全局对象。因为全局对象是作用域链的头，这意味着所有非限定性的变量和函数名都会作为该对象的属性来查询。

> 例如，当JavaScript 代码引用 parseInt() 函数时，它引用的是全局对象的 parseInt 属性。全局对象是作用域链的头，还意味着在顶层 JavaScript 代码中声明的所有变量都将成为全局对象的属性。

如果看的不是很懂的话，容我再来介绍下全局对象:

1.可以通过 this 引用，在客户端 JavaScript 中，全局对象就是 Window 对象。

```js
console.log(this);
```

2.全局对象是由 Object 构造函数实例化的一个对象。

```js
console.log(this instanceof Object);
```

3.预定义了一堆，嗯，一大堆函数和属性。

```js
// 都能生效
console.log(Math.random());
console.log(this.Math.random());
```

4.作为全局变量的宿主。

```js
var a = 1;
console.log(this.a);
```

5.客户端 JavaScript 中，全局对象有 window 属性指向自身。

```js
var a = 1;
console.log(window.a);

this.window.b = 2;
console.log(this.b);
```

花了一个大篇幅介绍全局对象，其实就想说：

全局上下文中的变量对象就是全局对象呐！

## 函数上下文

在函数上下文中，我们用活动对象(activation object, AO)来表示变量对象。

活动对象和变量对象其实是一个东西，只是变量对象是规范上的或者说是引擎实现上的，不可在 JavaScript 环境中访问，只有到当进入一个执行上下文中，这个执行上下文的变量对象才会被激活，所以才叫 activation object 呐，而只有被激活的变量对象，也就是活动对象上的各种属性才能被访问。

活动对象是在进入函数上下文时刻被创建的，它通过函数的 arguments 属性初始化。arguments 属性值是 Arguments 对象。

## 执行过程

执行上下文的代码会分成两个阶段进行处理：分析和执行，我们也可以叫做：

1. 进入执行上下文
2. 代码执行

### 进入执行上下文

当进入执行上下文时，这时候还没有执行代码，

变量对象会包括：

1. 函数的所有形参 (如果是函数上下文)
   + 由名称和对应值组成的一个变量对象的属性被创建
   + 没有实参，属性值设为 undefined
2. 函数声明
   + 由名称和对应值（函数对象(function-object)）组成一个变量对象的属性被创建
   + 如果变量对象已经存在相同名称的属性，则完全替换这个属性
3. 变量声明
   + 由名称和对应值（undefined）组成一个变量对象的属性被创建；
   + 如果变量名称跟已经声明的形式参数或函数相同，则变量声明不会干扰已经存在的这类属性

举个例子：

```js
function foo(a) {
  var b = 2;
  function c() {}
  var d = function() {};

  b = 3;

}

foo(1);
```

在进入执行上下文后，这时候的 AO 是：

```js
AO = {
    arguments: {
        0: 1,
        length: 1
    },
    a: 1,
    b: undefined,
    c: reference to function c(){},
    d: undefined
}
```

### 代码执行

在代码执行阶段，会顺序执行代码，根据代码，修改变量对象的值

还是上面的例子，当代码执行完后，这时候的 AO 是：

```js
AO = {
    arguments: {
        0: 1,
        length: 1
    },
    a: 1,
    b: 3,
    c: reference to function c(){},
    d: reference to FunctionExpression "d"
}
```

到这里变量对象的创建过程就介绍完了，让我们简洁的总结我们上述所说：

1. 全局上下文的变量对象初始化是全局对象
2. 函数上下文的变量对象初始化只包括 Arguments 对象
3. 在进入执行上下文时会给变量对象添加形参、函数声明、变量声明等初始的属性值
4. 在代码执行阶段，会再次修改变量对象的属性值

## 思考题

最后让我们看几个例子：

1.第一题

```js
function foo() {
    console.log(a);
    a = 1;
}

foo(); // ???

function bar() {
    a = 1;
    console.log(a);
}
bar(); // ???
```

第一段会报错：`Uncaught ReferenceError: a is not defined`。

第二段会打印：`1`。

这是因为函数中的 "a" 并没有通过 var 关键字声明，所有不会被存放在 AO 中。

第一段执行 console 的时候， AO 的值是：

```js
AO = {
    arguments: {
        length: 0
    }
}
```

没有 a 的值，然后就会到全局去找，全局也没有，所以会报错。

当第二段执行 console 的时候，全局对象已经被赋予了 a 属性，这时候就可以从全局找到 a 的值，所以会打印 1。

2.第二题

```js
console.log(foo);
function foo(){
    console.log("foo");
}
var foo = 1;
```

会打印函数，而不是 undefined 。

这是因为在进入执行上下文时，首先会处理函数声明，其次会处理变量声明，如果变量名称跟已经声明的形式参数或函数相同，则变量声明不会干扰已经存在的这类属性。

3.第三题

```js
  console.log(a); // f a() {}
  var a = 1
  console.log(a);  // 1
  function a() { }
  console.log(a);  // 1
```

全局上下文

```js
AO = {
    a: reference to function c(){}
}
```



# JS常见语法错误

```js
console.log(a);
//ReferenceError 引用错误
// ReferenceError: a is not defined  未定义
```

```js
console.log(a);
let a = 1
//ReferenceError: Cannot access 'a' before initialization 初始化前无法访问 a
```

```js
const a = 1
a = 2
//TypeError 类型错误
//TypeError: Assignment to constant variable. 给常量赋值
```

```js
const a;
//SyntaxError
//SyntaxError: Missing initializer in const declaration 常量声明中缺少初始值设定项
```

