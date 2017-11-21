## object-container

A simple javascript dependency injection container.


## Install

```sh
$ npm install object-container
```


## Usage

```js

const { ObjectContainer, ref } = require('object-container');

let X = class X { constructor(args1) { this.args1 = args1; } };
let Y = class Y { constructor(args1, x, val) { this.args1 = args1; this.x = x; this.val = val; } };

let objectContainer = new ObjectContainer();
objectContainer.register('x', X, 'testX');
objectContainer.register('y', Y, 'testY', ref('x'), ref('z'));
objectContainer.registerInstance('z', 10);

let x = objectContainer.get('x');
let y = objectContainer.get('y');

console.log(y.x === x);     // true
console.log(y.val == 10);   // true

```




### License

[MIT](LICENSE)