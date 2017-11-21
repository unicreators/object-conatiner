//////////////////////////////
///  yichen

const PROP_INSTANCES = Symbol('ObjectContainer#instances');
const PROP_DEFINES = Symbol('ObjectContainer#defines');
const METHOD_RESOLVE = Symbol('ObjectContainer#resolve');

class Reference { constructor(name) { this.name = name; } }
const reference = (name) => new Reference(name);

class ObjectContainer {

    constructor() {
        this[PROP_INSTANCES] = {};
        this[PROP_DEFINES] = {};
    }

    registerInstance(name, value) {
        if (typeof name !== 'string'
            || name.trim().length == 0)
            throw new Error(`'name' must be a non-empty string.`);
        if (value === null || value === undefined)
            throw new Error(`'value' must not be null.`);
        this[PROP_INSTANCES][name] = { resolved: true, value };
        return this;
    }

    register(name, type, ...args) {
        if (typeof name !== 'string'
            || name.trim().length == 0)
            throw new Error(`'name' must be a non-empty string.`);
        if (typeof type !== 'function')
            throw new TypeError(`'type' must be class or function.`);
        this[PROP_DEFINES][name] = { type, args };
        return this;
    }

    get(name, def = undefined) { return this[METHOD_RESOLVE](name, def); }

    [METHOD_RESOLVE](name, def = undefined) {

        let instance = this[PROP_INSTANCES][name];
        if (instance && instance.resolved) return instance.value;

        let define = this[PROP_DEFINES][name];
        if (define == undefined) return def;

        let args = (define.args || []).map(function (argument) {
            return (argument instanceof Reference) ?
                this[METHOD_RESOLVE](argument.name) : argument;
        }, this);

        let value = new define.type(...args);


        //if (!define.renew)
        this[PROP_INSTANCES][name] = { resolved: true, value };

        return value;

    }

};

module.exports = ObjectContainer;
module.exports.ObjectContainer = ObjectContainer;
module.exports.ref = reference;
