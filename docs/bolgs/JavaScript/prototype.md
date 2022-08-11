# 原型到原型链

## 构造函数创建对象

我们先使用构造函数创建一个对象：

```js
function Person() {

}
var person = new Person();
person.name = 'Kevin';
console.log(person.name) // Kevin
```

在这个例子中，**Person 就是一个构造函数，我们使用 new 创建了一个实例对象 person**。

很简单吧，接下来进入正题：

## prototype

每个函数都有一个 prototype 属性，就是我们经常在各种例子中看到的那个 prototype ，比如：

```js
function Person() {

}
// 虽然写在注释里，但是你要注意：
// prototype是函数才会有的属性
Person.prototype.name = 'Kevin';
var person1 = new Person();
var person2 = new Person();
console.log(person1.name) // Kevin
console.log(person2.name) // Kevin
```

那这个函数的 prototype 属性到底指向的是什么呢？是这个函数的原型吗？

其实，函数的 prototype 属性指向了一个对象，这个对象正是调用该构造函数而创建的**实例**的原型，也就是这个例子中的 person1 和 person2 的原型。

那什么是原型呢？你可以这样理解：每一个JavaScript对象(null除外)在创建的时候就会与之关联另一个对象，这个对象就是我们所说的原型，每一个对象都会从原型"继承"属性。

让我们用一张图表示构造函数和实例原型之间的关系：

![原型1](/JavaScript/prototype/原型1.png)

在这张图中我们用 Object.prototype 表示实例原型。

那么我们该怎么表示实例与实例原型，也就是 person 和 Person.prototype 之间的关系呢，这时候我们就要讲到第二个属性：

## __proto__

这是每一个JavaScript对象(除了 null )都具有的一个属性，叫__proto__，这个属性会指向该对象的原型。

为了证明这一点,我们可以在火狐或者谷歌中输入：

```js
function Person() {

}
var person = new Person();
console.log(person.__proto__ === Person.prototype); // true
```

于是我们更新下关系图：

![原型2](/JavaScript/prototype/原型2.png)

既然实例对象和构造函数都可以指向原型，那么原型是否有属性指向构造函数或者实例呢？

## constructor

指向实例倒是没有，因为一个构造函数可以生成多个实例，但是**原型指向构造函数**倒是有的，这就要讲到第三个属性：`constructor`，**每个原型都有一个 `constructor `属性指向关联的构造函数**。

**实例对象`person `就是通过实例原型上的`constructor`指向构造函数**

为了验证这一点，我们可以尝试：

```js
function Person() {

}
console.log(Person === Person.prototype.constructor); // true
```

所以再更新下关系图：

![原型3](/JavaScript/prototype/原型3.png)

综上我们已经得出：

```js
function Person() {

}

var person = new Person();

console.log(person.__proto__ == Person.prototype) // true
console.log(Person.prototype.constructor == Person) // true
// 顺便学习一个ES5的方法,可以获得对象的原型
console.log(Object.getPrototypeOf(person) === Person.prototype) // true
```

了解了构造函数、实例原型、和实例之间的关系，接下来我们讲讲实例和原型的关系：

## 实例与原型

当读取实例的属性时，如果找不到，就会查找与对象关联的原型中的属性，如果还查不到，就去找原型的原型，一直找到最顶层为止。

举个例子：

```js
function Person() {

}

Person.prototype.name = 'Kevin';

var person = new Person();

person.name = 'Daisy';
console.log(person.name) // Daisy

delete person.name;
console.log(person.name) // Kevin
```

在这个例子中，我们给实例对象 person 添加了 name 属性，当我们打印 person.name 的时候，结果自然为 Daisy。

但是当我们删除了 person 的 name 属性时，读取 person.name，从 person 对象中找不到 name 属性就会从 person 的原型也就是 person.__proto__ ，也就是 Person.prototype中查找，幸运的是我们找到了 name 属性，结果为 Kevin。.



但是万一还没有找到呢？原型的原型又是什么呢？

## 原型的原型

在前面，我们已经讲了原型也是一个对象，既然是对象，我们就可以用最原始的方式创建它，那就是：

```js
var obj = new Object();
obj.name = 'Kevin'
console.log(obj.name) // Kevin
```

其实原型对象就是通过 Object 构造函数生成的，结合之前所讲，实例的 __proto__ 指向构造函数的 prototype ，所以我们再更新下关系图：

![原型4](/JavaScript/prototype/原型4.png)

## 原型链

那 Object.prototype 的原型呢？

null，我们可以打印：

```js
console.log(Object.prototype.__proto__ === null) // true
```

然而 null 究竟代表了什么呢？

引用阮一峰老师的 [《undefined与null的区别》](http://www.ruanyifeng.com/blog/2014/03/undefined-vs-null.html) 就是：

> null 表示“没有对象”，即该处不应该有值。

所以 Object.prototype.__proto__ 的值为 null 跟 Object.prototype 没有原型，其实表达了一个意思。

所以查找属性的时候查到 Object.prototype 就可以停止查找了。

最后一张关系图也可以更新为：

![原型5](/JavaScript/prototype/原型5.png)

顺便还要说一下，图中由相互关联的原型组成的链状结构就是原型链，也就是蓝色的这条线。

## 补充

最后，补充三点大家可能不会注意的地方：

### constructor

首先是 constructor 属性，我们看个例子：

```js
function Person() {

}
var person = new Person();
console.log(person.constructor === Person); // true
```

当获取 person.constructor 时，其实 person 中并没有 constructor 属性,当不能读取到constructor 属性时，会从 person 的原型也就是 Person.prototype 中读取，正好原型中有该属性，所以：

```js
person.constructor === Person.prototype.constructor
```

### \_\_proto\_\_

其次是 __proto__ ，绝大部分浏览器都支持这个非标准的方法访问原型，然而它并不存在于 Person.prototype 中，实际上，它是来自于 Object.prototype ，与其说是一个属性，不如说是一个 getter/setter，当使用 obj.__proto__ 时，可以理解成返回了 Object.getPrototypeOf(obj)。

`__proto__` 是一个非 `es` 标准的属性，它对应的是 `es` 标准中的 `[[prototype]]`，因为 `[[prototype]]` 是一个内部属性，无法直接访问，所以 `es6` 中提供了 `Object.getPrototypeOf/Object.setPrototypeOf` 来读取、操作 `[[prototype]]`，所以文章说 `__proto__` 实际是 `getter/setter`，即

```js
obj.__proto__
 ===>
get __proto__ = function() { return Object.getPrototypeOf(this) }
set __proto__ = function(newPrototype) { return Object.setPrototypeOf(this, newPrototype) }
```

### 真的是继承吗？

最后是关于继承，前面我们讲到“每一个对象都会从原型‘继承’属性”，实际上，继承是一个十分具有迷惑性的说法，引用《你不知道的JavaScript》中的话，就是：

继承意味着复制操作，然而 JavaScript 默认并不会复制对象的属性，相反，JavaScript 只是在两个对象之间创建一个关联，这样，一个对象就可以通过委托访问另一个对象的属性和函数，所以与其叫继承，委托的说法反而更准确些。



### 跟原型相关的几个方法

#### 1、Object.isPrototypeOf()

方法用于测试一个对象是否存在于另一个对象的原型链上。

```js
function Foo() {}
var foo = new Foo()
console.log(Foo.prototype.isPrototypeOf(foo) // true  Foo.prototype这个对象肯定在foo的原型上啊
```

#### 2、Object.getPrototypeOf()

方法返回指定对象的原型（内部`[[Prototype]]`属性的值）。

```js
function Person(){}
var person1 = new Person()
console.log(Object.getPrototypeOf(person1) == Person.prototype); // true
```

#### 3、Object.setPrototypeOf()

方法设置一个指定的对象的原型 ( 即，内部 [[Prototype]] 属性）到另一个对象或  `null`。

<font color =red>Warning：“在所有浏览器和 JavaScript 引擎中，修改继承关系的影响都是微妙且深远的。这种影响并 不仅是执行 Object.setPrototypeOf()语句那么简单，而是会涉及所有访问了那些修 改过[[Prototype]]的对象的代码。”</font>

#### 4、Object.create()

方法用于创建一个新对象，使用现有的对象来作为新创建对象的原型（prototype）。

```js
let biped = {
 numLegs: 2
};
let person = Object.create(biped);
console.log(Object.getPrototypeOf(person) === biped); // true
```

#### 5、Object.hasOwnProperty()

方法会返回一个布尔值，指示对象自身属性中是否具有指定的属性（也就是，是否有指定的键）,会在属性存在于调用它的对象实例上时返回 true

```js
function Person(){}
Person.prototype.name = '北三'
var person1 = new Person()
person1.name = '南一'
console.log(person1.hasOwnProperty("name"))  //true
delete person1.name
console.log(person1.hasOwnProperty("name"))  //false
```

利用`hasOwnProperty()`和 `in` 操作符，实现一个**判断属性是否在原型上**的函数

只要通过对象可以访问，in 操作符就返回 true

```js
function hasPrototypeProperty(object, name){
 return !object.hasOwnProperty(name) && (name in object);
}
```

#### 6、Object.keys()

这个方法接收一个对象作为参数，返回包含该对象**所有可枚举属性名称**的字符串数组

#### 7、Object.getOwnPropertyNames()

方法返回一个由指定对象的所有自身属性的属性名（**包括不可枚举属性但不包括 Symbol 值作为名称的属性**）组成的数组。

## 原型链的问题

### 问题1：原型中包含的引用值会在所有实例间**共享**

原型链虽然是实现继承的强大工具，但它也有问题。主要问题出现在原型中包含引用值的时候。前面在谈到原型的问题时也提到过，原型中包含的引用值会在所有实例间**共享**，这也是为什么属性通常会 在构造函数中定义而不会定义在原型上的原因。

```js
function Father() {
  this.colors = ["red", "blue", "green"];
}
function Son() { }
// 继承 SuperType
Son.prototype = new Father();
let instance1 = new Son();
instance1.colors.push("black");
console.log(instance1.colors); // "red,blue,green,black"
let instance2 = new Son();
console.log(instance2.colors); // "red,blue,green,black"
```

`Son`构造函数将`Father`构造函数的实例作为其原型对象，此时`colors`属性自然也就变成`Son`原型上的属性，相当于创建了`Son.prototype.colors`属性，Son所有实例都会共享这个属性，这一点通过 `instance1.colors` 上的修改也能反映到 `instance2.colors` 上就可以看出来

### 问题2：子类型在实例化时不能给父类型的构造函数传参。

# 继承

使用 Object.getPrototypeOf()可以 方便地取得一个对象的原型，而这在通过原型实现继承时显得尤为重要

为了解决原型包含引用值导致的继承问题，即上面的问题1，原型对象上共享的引用值属性会被实例修改导致影响所有实例，如果我们希望继承过来的属性互不干扰，**盗用构造函数**，就是一开始社区解决此问题的方案。

## 盗用构造函数

盗用构造函数：基本思路很简单：在子类构造函数中调用父类构造函数。因为毕竟**函数就是在特定上下文中执行代码的简单对象**，所以可以使用 `apply()`和` call()`方法**以新创建的对象为上下文**执行构造函数。(这里不懂的话去看看`apply`的模拟实现)

```js
function Father() {
  this.colors = ["red", "blue", "green"];
}
function Son() {
  console.log(this); //this指向new出来的新对象，对象是Son的实例
  Father.call(this)  // 把属性挂到实例上
}

let instance1 = new Son();
instance1.colors.push("black");
console.log(instance1.colors); // ["red,blue,green,black"]
let instance2 = new Son();
console.log(instance2.colors); // ["red,blue,green"]
```

通过`call()`（或者`apply()`）方法，`Father`构造函数在`new`新创建的Son的实例对象的上下文中执行了。相当于在`Son`对象上运行了`Father`函数的所有初始化代码。结果就是每个实例都会有自己的`colors`属性

#### 1、传递参数

相比于使用原型链，盗用构造函数的一个优点是可以在子类构造函数中向父类构造函数传参。

```js
function Father(name) {
  this.name = name
}
function Son() {
  Father.call(this, 'Nanyi')
  this.age = 12
}

let instance = new Son()
console.log(instance.name); // Nanyi
```

为确保 `Father`构造函数不会覆盖 `Son`定义的属性，可以在调用父类构造函数之后再给子类实例添加额外的属性。

#### 2、盗用构造函数的问题

盗用构造函数的主要缺点，也是使用**构造函数模式自定义类型的问题**：**必须在构造函数中定义方法**，因此函数不能重用。此外，**子类也不能访问父类原型上定义的方法**，因此所有类型只能使用构造函数模式。由于存在这些问题，盗用构造函数基本上也不能单独使用。

## 组合继承

组合继承又叫伪经典继承，综合了原型链和盗用构造函数

**基本思路：使用原型链继承原型上的属性和方法，通过盗用构造函数继承实例属性。**

```js
function Father(name) {
  this.name = name;
  this.color = ["red", "blue", "green"];
}

Father.prototype.sayName = function () {
  console.log(this.name);
}

function Son(name, age) {
  Father.call(this, name)
  this.age = age
}

Son.prototype = new Father()
Son.prototype.sayAge = function () {
  console.log(this.age);
}
let instance1 = new Son('Nanyi', 29)
instance1.color.push('black')

console.log(instance1.color);
instance1.sayAge()
instance1.sayName()


let instance2 = new Son('Naner', 22)
console.log(instance2.color);
instance2.sayAge()
instance2.sayName()

console.log(instance1 instanceof Father);
```

**组合继承弥补了原型链和盗用构造函数的不足，保留了`instanceof`操作符和` isPrototypeOf()`方法识别合成对象的能力**

## 原型式继承

### object.create()模拟实现

```js
function object(o) {
 function F() {}
 F.prototype = o;
 return new F();
}

let person = {
  name: 'Nanyi',
  friend: ["aaa", 'bbb', 'ccc'],
}

let newPerson = object(person)
```

原型式继承非常适合不需要单独创建构造函数，但仍然需要在对象间共享信息的场合。但要记住， 属性中包含的引用值始终会在相关对象间共享，跟使用原型模式是一样的

## 寄生式继承

**寄生式继承背后的思路类似于寄生构造函数和工厂模式：创建一个实现继承的函数，以某种 方式增强对象，然后返回这个对象**

```js
function createAnother(original) {
  let clone = object(original)
  clone.sayHi = function () {
    console.log("Hi");
  }
  return clone;
}
```

寄生式继承同样适合主要关注对象，而不在乎类型和构造函数的场景。**object()函数不是寄生式 继承所必需的，任何返回新对象的函数都可以在这里使用。**

**注意** : **通过寄生式继承给对象添加函数会导致函数难以重用，与构造函数模式类似**

## 寄生式组合继承

组合继承其实也存在效率的问题，父类构造函数始终会被调用两次，一次在创建子类的原型时调用，了一次在子类的构造函数中调用。`Son`类会有两组`name`，`color`属性，一组在实例上，另一组在`Son`的原型上

寄生式组合继承**通过盗用构造函数继承属性**，**使用寄生式继承来继承父类原型**，然后将返回的新对象赋值给子类原型。

```js
function Father(name) {
  this.name = name;
  this.color = ["red", "blue", "green"];
}

Father.prototype.sayName = function () {
  console.log(this.name);
}

function Son(name, age) {
  Father.call(this, name)
  this.age = age
}

// Son.prototype = new Father() //组合继承用的

/**
 *
 * @param {prototype} o 父类的原型
 * @returns 返回一个父类原型的实例,这个对象就可通过原型链访问到父类原型上的属性和方法,相当于返回一个副本
 */
function object(o) {
  function F() { }
  F.prototype = o;
  return new F();
}

/**
 * 把父类原型的副本当成子类原型,并把原型的constructor属性指回子类,因为重写原型
 * @param {*} Father 父类
 * @param {*} Son 子类
 */
function inheritPrototype(Father, Son) {
  let prototype = object(Father.prototype)
  prototype.constructor = Son;
  Son.prototype = prototype
}

inheritPrototype(Father, Son)

Son.prototype.sayAge = function () {
  console.log(this.age);
}

let instance1 = new Son('Nanyi', 29)
instance1.color.push('black')

console.log(instance1.color); //[ 'red', 'blue', 'green', 'black' ]
instance1.sayAge() // 29
instance1.sayName() //Nanyi


let instance2 = new Son('Naner', 22)
console.log(instance2.color); // [ 'red', 'blue', 'green' ]
instance2.sayAge() //22
instance2.sayName() //Naner

console.log(instance1 instanceof Father); //true
```

原型链仍然保持不变，因此 instanceof 操作符和 isPrototypeOf()方法正常有效。寄生式组合继承可以算是引用类型继承的最佳模式。

![image-20220801144734395](/JavaScript/prototype/寄生组合继承.png)

::: slot footer
MIT Licensed | Copyright © 2018-present [Evan You](https://github.com/yyx990803)
:::

































