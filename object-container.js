//////////////////////////////
///  yichen

const PROP_INSTANCES = Symbol('ObjectContainer#instances');
const PROP_DEFINITIONS = Symbol('ObjectContainer#definitions');
const METHOD_RESOLVE = Symbol('ObjectContainer#resolve');
const METHOD_MERGEARGS = Symbol('ObjectContainer#mergeArgs');

class Reference {
    constructor(name, renew = false, ...overrideArgs) {
        this.name = name;
        this.renew = renew;
        this.overrideArgs = overrideArgs;        
    }
}
const reference = (name, renew = false, ...overrideArgs) => new Reference(name, renew, ...overrideArgs);

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

    resolve(objectContainer, runtimeArgs = undefined) {
        return new this.type(...(runtimeArgs || this.args).map(function (argument) {
            return (argument instanceof Reference) ?
                objectContainer.get(argument.name, argument.renew,
                    ...(argument.renew ? argument.overrideArgs : []))
                : argument;
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
    get(name, renew = false, ...overrideArgs) { return this[METHOD_RESOLVE](name, renew, overrideArgs); }
    contains(name) { return this[PROP_DEFINITIONS][name] !== undefined; }

    registerValue(name, value) { return this.register(new ValueDefinition(name, value)); }
    registerType(name, type, ...args) { return this.register(new TypeDefinition(name, type, ...args)); }

    [METHOD_RESOLVE](name, renew = false, overrideArgs = undefined) {

        if (!renew) {
            let instance = this[PROP_INSTANCES][name];
            if (instance && instance.resolved) return instance.value;
        }

        let definition = this[PROP_DEFINITIONS][name];
        if (definition == undefined) return undefined;

        let value = definition.resolve(this, renew ? this[METHOD_MERGEARGS](definition.args, overrideArgs) : undefined);

        if (!renew)
            this[PROP_INSTANCES][name] = { resolved: true, value };

        return value;

    }

    [METHOD_MERGEARGS](originalArgs, overrideArgs) {
        if (Array.isArray(originalArgs) && Array.isArray(overrideArgs)) {
            let len = Math.max(originalArgs.length, overrideArgs.length);
            let args = new Array(len);
            for (let i = 0; i < len; i++)
                // undefined to ignore
                args[i] = overrideArgs[i] === undefined ? originalArgs[i] : overrideArgs[i];
            return args;
        }

        if (Array.isArray(overrideArgs))
            return overrideArgs;

        return originalArgs;
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
