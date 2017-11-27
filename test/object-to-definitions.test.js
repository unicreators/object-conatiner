const assert = require('assert');

const { convert, Definition } = require('../');

describe('object-to-definitions.test.js', function () {

    let X = class X { constructor(args1) { this.args1 = args1; } };
    let Y = class Y { constructor(args1, x, val) { this.args1 = args1; this.x = x; this.val = val; } };


    it('convert', function () {

        let definitions = convert({
            '$x': { type: X, args: 'testX' },
            '$y': { type: Y, args: ['testY', '$x', '$z'] },
            'z': 10
        });

        assert(definitions);
        assert(definitions.length == 3);

        assert(definitions.every((d) => d instanceof Definition));

    });

    it('convert (custom escapePrefix)', function () {

        let definitions = convert({
            '@x': { type: X, args: 'testX' },
            '@y': { type: Y, args: ['testY', '@x', '@z'] },
            'z': 10
        }, '@');

        assert(definitions);
        assert(definitions.length == 3);

        assert(definitions.every((d) => d instanceof Definition));

    });

});
