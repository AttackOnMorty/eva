const Environment = require('./Environment');

class Eva {
    constructor(global = new Environment()) {
        this.global = global;
    }

    eval(exp, env = this.global) {
        //-----------------------------------------------
        // Self-evaluating expressions:

        if (this.isNumber(exp)) {
            return exp;
        }

        if (this.isString(exp)) {
            return exp.slice(1, -1);
        }

        //-----------------------------------------------
        // Math operations:

        if (exp[0] === '+') {
            return this.eval(exp[1], env) + this.eval(exp[2], env);
        }

        if (exp[0] === '*') {
            return this.eval(exp[1], env) * this.eval(exp[2], env);
        }

        //-----------------------------------------------
        // Block: sequence of expressions

        if (exp[0] === 'begin') {
            const blockEnv = new Environment({}, env);
            return this._evalBlock(exp, blockEnv);
        }

        //-----------------------------------------------
        // Variable declaration: (var foo 10)

        if (exp[0] === 'var') {
            const [_, name, value] = exp;
            return env.define(name, this.eval(value, env));
        }

        //-----------------------------------------------
        // Variable update: (set foo 10)

        if (exp[0] === 'set') {
            const [_, name, value] = exp;
            return env.assign(name, this.eval(value, env));
        }

        //-----------------------------------------------
        // Variable access: foo

        if (this.isVariableName(exp)) {
            return env.lookup(exp);
        }

        throw `Unimplemented: ${exp}`;
    }

    isNumber(exp) {
        return typeof exp === 'number';
    }

    isString(exp) {
        return (
            typeof exp === 'string' && exp[0] === '"' && exp.slice(-1) === '"'
        );
    }

    isVariableName(exp) {
        return typeof exp === 'string' && /^[a-zA-Z][0-9a-zA-Z_$]*/.test(exp);
    }

    _evalBlock(block, blockEnv) {
        let result;
        const [_tag, ...expressions] = block;

        expressions.forEach((exp) => {
            result = this.eval(exp, blockEnv);
        });

        return result;
    }
}

module.exports = Eva;
