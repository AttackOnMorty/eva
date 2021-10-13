# EVA

EVA is an AST interpreter. The name EVA comes from eval (evaluation) because the core of the interpreter is evaluation.

## Run Tests

```
yarn install && yarn test
```

## Run CLI

```bash
# Run expression
./bin/eva -e '(print (+ 1 1))'
# Run file
./bin/eva -f ./bin/test.eva
```

## Licence

[MIT License](LICENSE)
