class Transformer {
    /**
     * Translates `def`-expression (function declaration)
     * into a variable declaration with a lambda
     * expression.
     */
    transformDefToVarLambda(defExp) {
        const [_tag, name, params, body] = defExp;
        return ['var', name, ['lambda', params, body]];
    }

    /**
     * Transforms `switch` to nested `if`-expressions.
     */
    transformSwitchToIf(switchExp) {}

    /**
     * Transforms `for` to `while`
     */
    transformForToWhile(forExp) {}

    /**
     * Transforms `++ foo` to (set foo (+ foo 1))
     */
    transformIncToSet(incExp) {}

    /**
     * Transforms `-- foo` to (set foo (- foo 1))
     */
    transformDecToSet(incExp) {}

    /**
     * Transforms `+= foo val` to (set foo (+ foo val))
     */
    transformIncValToSet(incExp) {}

    /**
     * Transforms `+= foo val` to (set foo (+ foo val))
     */
    transformDecValToSet(incExp) {}
}

module.exports = Transformer;
