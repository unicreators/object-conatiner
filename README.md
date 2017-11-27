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
objectContainer.registerType('x', X, 'testX');
objectContainer.registerType('y', Y, 'testY', ref('x'), ref('z'));
objectContainer.registerValue('z', 10);

let x = objectContainer.get('x');
let y = objectContainer.get('y');

console.log(y.x === x); 
console.log(y.val == 10); 

```


## Api

- (constructor) new (...definitions: Definition[]) => ObjectContainer

- (method) register(...definitions: Definition[]): ObjectContainer
- (method) registerType(name: string, type: class | function, ...args: any[]): ObjectContainer
- (method) registerValue(name: string, value: any): ObjectContainer
- (method) get(name: string, def?: any): any
- (method) remove(name: string): void
- (method) contains(name: string): boolean
- (method) clear(): void

- (property) length: number




## Custom Definition

```js

const { ObjectContainer, Reference, ref, Definition } = require('object-container');

let TypeFromPackageDefinition = class extends Definition {
    constructor(name, $package, ...args) {
        super(name);
        this.package = $package;
        this.args = args;
    }
    resolve(objectContainer) {
        let Type = require(this.package),
            processedArgs = this.args.map(function (argument) {
                return (argument instanceof Reference) ?
                    objectContainer.get(argument.name) : argument;
            }, this);

        return new Type(...processedArgs);
    }
};

let objectContainer = new ObjectContainer();
objectContainer.register(new TypeFromPackageDefinition('x', './x.js', 'testX'));

let x = objectContainer.get('x');

console.log(x.args1 === 'testX');

```




## Convert

```js

const { ObjectContainer, convert } = require('object-container');

let X = class X { constructor(args1) { this.args1 = args1; } };
let Y = class Y { constructor(args1, x, val) { this.args1 = args1; this.x = x; this.val = val; } };

let definitions = convert({
    '$x': { type: X, args: 'testX' },
    '$y': { type: Y, args: ['testY', '$x', '$z'] },
    'z': 10
}, '$');

console.log(definitions.length == 3);
console.log(definitions.every((d) => d instanceof Definition));

//
// let objectContainer = new ObjectContainer(...definitions);
// or
// objectContainer.register(...definitions);
//

```

### License

[MIT](LICENSE)