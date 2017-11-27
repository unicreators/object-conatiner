//////////////////////////////
///  yichen

const PROP_INSTANCES = Symbol('ObjectContainer#instances');
const PROP_DEFINITIONS = Symbol('ObjectContainer#definitions');
const METHOD_RESOLVE = Symbol('ObjectContainer#resolve');

class Reference { constructor(name) { this.name = name; } }
const reference = (name) => new Reference(name);

class Definition {
    constructor(name) {
        if (typeof name !== 'string'
            || name.trim().length == 0)
            throw new Error(`'name' must be a non-empty string.`);
        this.name = name.trim();
    }

    // abstract
    resolve(objectContainer) { throw new Error(`'resolve' not implemented error.`); }
}

class TypeDefinition extends Definition {
    constructor(name, type, ...args) {
        super(name);
        if (typeof type !== 'function')
            throw new Error(`'type' must be class or function.`);
        this.type = type;
        this.args = args;
    }

    resolve(objectContainer) {
        return new this.type(...this.args.map(function (argument) {
            return (argument instanceof Reference) ?
                objectContainer.get(argument.name) : argument;
        }, this));
    }
}

class ValueDefinition extends Definition {
    constructor(name, value) {
        super(name);
        if (value === null || value === undefined)
            throw new Error(`'value' must not be null.`);
        this.value = value;
    }

    resolve(objectContainer) { return this.value; }
}

class ObjectContainer {

    constructor(...definitions) {
        this.clear();
        this.register(...definitions);
    }

    register(...definitions) {
        for (let definition of definitions) {
            if ((definition instanceof Definition) == false)
                throw new Error(`'definition' must extend Definition.`);
            this[PROP_DEFINITIONS][definition.name] = definition;
        }
        return this;
    }

    get length() { return Object.keys(this[PROP_DEFINITIONS]).length; }
    clear() { this[PROP_INSTANCES] = {}; this[PROP_DEFINITIONS] = {}; }
    remove(name) { delete this[PROP_INSTANCES][name]; delete this[PROP_DEFINITIONS][name]; }
    get(name, def = undefined) { return this[METHOD_RESOLVE](name, def); }
    contains(name) { return this[PROP_DEFINITIONS][name] !== undefined; }

    registerValue(name, value) { return this.register(new ValueDefinition(name, value)); }
    registerType(name, type, ...args) { return this.register(new TypeDefinition(name, type, ...args)); }

    [METHOD_RESOLVE](name, def = undefined) {

        let instance = this[PROP_INSTANCES][name];
        if (instance && instance.resolved) return instance.value;

        let definition = this[PROP_DEFINITIONS][name];
        if (definition == undefined) return def;

        let value = definition.resolve(this);

        //if (!define.renew)
        this[PROP_INSTANCES][name] = { resolved: true, value };

        return value;

    }

};


module.exports =
    Object.assign(ObjectContainer, {
        ObjectContainer,
        Definition,
        Reference,
        ref: reference,
        ValueDefinition,
        TypeDefinition
    });
