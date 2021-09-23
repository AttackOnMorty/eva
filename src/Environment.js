class Environment {
    constructor(records = {}) {
        this.records = records;
    }

    define(name, value) {
        this.records[name] = value;
        return value;
    }

    lookup(name) {
        if (!Object.prototype.hasOwnProperty.call(this.records, name)) {
            throw ReferenceError(`${name} is not defined.`);
        }
        return this.records[name];
    }
}

module.exports = Environment;
