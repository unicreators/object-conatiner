const assert = require('assert');

const { ObjectContainer, Reference, ref, ValueDefinition, TypeDefinition, Definition } = require('../');

describe('object-container.test.js', function () {

    it('constructor', function () {
        assert.doesNotThrow(function () { new ObjectContainer(); });
    });

    it('registerType', function () {

        let objectContainer = new ObjectContainer();

        assert.throws(() => objectContainer.registerType());
        assert.throws(() => objectContainer.registerType(''));
        assert.throws(() => objectContainer.registerType(' '));
        assert.throws(() => objectContainer.registerType('a'));
        assert.throws(() => objectContainer.registerType('a', null));
        assert.throws(() => objectContainer.registerType('a', 10));

        assert.doesNotThrow(() => objectContainer.registerType('x',
            class X { constructor(args1) { this.args1 = args1; } },
            'testX'));

    });

    it('registerValue', function () {

        let objectContainer = new ObjectContainer();

        assert.throws(() => objectContainer.registerValue());
        assert.throws(() => objectContainer.registerValue(''));
        assert.throws(() => objectContainer.registerValue(' '));
        assert.throws(() => objectContainer.registerValue('a'));
        assert.throws(() => objectContainer.registerValue('a', null));

        assert.doesNotThrow(() => objectContainer.registerValue('a', 10));

    });

    it('length', function () {

        let objectContainer = new ObjectContainer();
        objectContainer.registerValue('a', 10);
        objectContainer.registerType('x',
            class X { constructor(args1) { this.args1 = args1; } },
            'testX');

        assert(objectContainer.length == 2);

    });

    it('get', function () {

        let objectContainer = new ObjectContainer();
        objectContainer.registerValue('a', 10);
        objectContainer.registerType('x',
            class X { constructor(args1) { this.args1 = args1; } },
            'testX');

        let a = objectContainer.get('a');
        assert(a == 10);

        let x = objectContainer.get('x');
        assert(x.args1 === 'testX');

    });

    it('remove', function () {

        let objectContainer = new ObjectContainer();
        objectContainer.registerValue('a', 10);
        objectContainer.remove('a');

        let a = objectContainer.remove('a');

        assert(a == undefined);

    });

    it('contains', function () {

        let objectContainer = new ObjectContainer();
        objectContainer.registerValue('a', 10);

        assert(objectContainer.contains('a'));

    });

    it('clear', function () {

        let objectContainer = new ObjectContainer();
        objectContainer.registerValue('a', 10);

        objectContainer.clear()

        assert(objectContainer.length == 0);

    });

    let X = class X { constructor(args1) { this.args1 = args1; } };
    let Y = class Y { constructor(args1, x, val) { this.args1 = args1; this.x = x; this.val = val; } };


    it('ref', function () {

        let objectContainer = new ObjectContainer();
        objectContainer.registerType('x', X, 'testX');
        objectContainer.registerType('y', Y, 'testY', ref('x'), ref('z'));
        objectContainer.registerValue('z', 10);

        let x = objectContainer.get('x');
        let y = objectContainer.get('y');

        assert(y.x === x);
        assert(y.val == 10);

    });


    it('register', function () {

        let objectContainer = new ObjectContainer();
        objectContainer.register(new TypeDefinition('x', X, 'testX'),
            new TypeDefinition('y', Y, 'testY', ref('x'), ref('z')),
            new ValueDefinition('z', 10));


        let x = objectContainer.get('x');
        let y = objectContainer.get('y');

        assert(y.x === x);
        assert(y.val == 10);

    });


    it('custom definition', function () {

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

        assert(x && x.args1 === 'testX');

    });


});
