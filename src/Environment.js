class Environment {
    constructor(records = {}, parent = null) {
        this.records = records;
        this.parent = parent;
    }

    define(name, value) {
        this.records[name] = value;
        return value;
    }

    assign(name, value) {
        this._resolve(name).records[name] = value;
        return value;
    }

    lookup(name) {
        return this._resolve(name).records[name];
    }

    _resolve(name) {
        if (Object.prototype.hasOwnProperty.call(this.records, name)) {
            return this;
        }

        if (this.parent === null) {
            throw ReferenceError(`${name} is not defined.`);
        }

        return this.parent;
    }
}

module.exports = Environment;
