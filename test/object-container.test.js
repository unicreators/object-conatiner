const assert = require('assert');

const { ObjectContainer, ref } = require('../');

describe('object-container.test.js', function () {

    it('constructor', function () {
        assert.doesNotThrow(function () { new ObjectContainer(); });
    });

    it('register', function () {

        let objectContainer = new ObjectContainer();

        assert.throws(() => objectContainer.register());
        assert.throws(() => objectContainer.register(''));
        assert.throws(() => objectContainer.register(' '));
        assert.throws(() => objectContainer.register('a'));
        assert.throws(() => objectContainer.register('a', null));
        assert.throws(() => objectContainer.register('a', 10));

        assert.doesNotThrow(() => objectContainer.register('x',
            class X { constructor(args1) { this.args1 = args1; } },
            'testX'));

    });

    it('register (instance)', function () {

        let objectContainer = new ObjectContainer();

        assert.throws(() => objectContainer.registerInstance());
        assert.throws(() => objectContainer.registerInstance(''));
        assert.throws(() => objectContainer.registerInstance(' '));
        assert.throws(() => objectContainer.registerInstance('a'));
        assert.throws(() => objectContainer.registerInstance('a', null));

        assert.doesNotThrow(() => objectContainer.registerInstance('a', 10));

    });

    it('get', function () {

        let objectContainer = new ObjectContainer();
        objectContainer.registerInstance('a', 10);
        objectContainer.register('x',
            class X { constructor(args1) { this.args1 = args1; } },
            'testX');

        let a = objectContainer.get('a');
        assert(a == 10);

        let x = objectContainer.get('x');
        assert(x.args1 === 'testX');

    });

    it('ref', function () {

        let X = class X { constructor(args1) { this.args1 = args1; } };
        let Y = class Y { constructor(args1, x, val) { this.args1 = args1; this.x = x; this.val = val; } };

        let objectContainer = new ObjectContainer();
        objectContainer.register('x', X, 'testX');
        objectContainer.register('y', Y, 'testY', ref('x'), ref('z'));
        objectContainer.registerInstance('z', 10);

        let x = objectContainer.get('x');
        let y = objectContainer.get('y');

        assert(y.x === x);
        assert(y.val == 10);

    });

});
