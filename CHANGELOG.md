
# assert.js version history

## assert.js v1.1.8

1. Documentation, pdf and code fixes and many optimalisations.
2. Faster type checking without breaking changes.

## assert.js v1.1.7

1. Documentation, pdf and code fixes.
2. Add these functions:

- `stringStartsWith();`
- `stringNotStartsWith();`
- `stringEndsWith();`
- `stringNotEndsWith();`

## assert.js v1.1.6

1. Documentation, pdf and code fixes.
2. New `assert-cheatsheet.odt` and `assert-cheatsheet.pdf`.
3. Fix the `AssertionError();`.
3. Modify the `fail();` function with the new optional arguments: `assert.fail([value1, value2, message, operator]);`.

## assert.js v1.1.5

1. Documentation, pdf and code fixes.
2. Add these functions:

- `isNotTrue();`
- `isNotFalse();`
- `oneOf();`
- `notOneOf();`

## assert.js v1.1.4

1. Documentation, pdf and code fixes.
2. Basic type assertion functions (`isNumber();`, `isNotNumber();`, etc.) use the `assert.is();` and `assert.isNot();` instead of be a standalone function.
3. Add these functions:

- `isInt();`
- `isNotInt();`
- `isFloat();`
- `isNotFloat();`

## assert.js v1.1.3

1. Documentation, pdf and code fixes.
2. Add Windows Samsung Browser to the testing enviroments.
3. Many TS6 small changes in the code files.
4. Add the `assert.config.alwaysStrict;`

## assert.js v1.1.2

1. Documentation, pdf and code fixes.
2. Fix the arguments list of the __Testrunner__ functions in the __assert-cheatsheet.odt__ and __assert-cheatsheet.pdf__

## assert.js v1.1.1

Only small fixes.

## assert.js v1.1.0

1. Documentation, pdf and code fixes.
2. Rename these functions:

Old name|New name
--------|---------
`isNotNullish();`|`isNonNullable();`
`isNotUndefined();`|`isDefined();`

## assert.js v1.0.3

1. Documentation, pdf and code fixes.
2. Add inner links in the __readme.html__.
3. Add 2 new properties of the TestResult object (`block`, `name`) in the testrunner functions.
4. Add these functions:

- `inRange();`
- `notInRange();`

## assert.js v1.0.2

1. Documentation, pdf and code fixes.
2. Add these functions:

- `assert.isNaN();`
- `assert.isNotNaN();`

## assert.js v1.0.1

1. Documentation, pdf and code fixes.
2. Add a new file: __CHANGELOG.md__
3. Fix the string functions to handle the String objects.
4. Add these functions:

- `assert.includes();`
- `assert.doesNotInclude();`
- `assert.isEmpty()`
- `assert.isNotEmpty();`
- `assert.isPrimitive()`
- `assert.isNotPrimitive();`
- `assert.isNull();`
- `assert.isNotNull();`
- `assert.isUndefined();`
- `assert.isNotUndefined();`
- `assert.isString();`
- `assert.isNotString();`
- `assert.isNumber();`
- `assert.isNotNumber();`
- `assert.isBigInt();`
- `assert.isNotBigInt();`
- `assert.isBoolean();`
- `assert.isNotBoolean();`
- `assert.isSymbol();`
- `assert.isNotSymbol();`
- `assert.isFunction();`
- `assert.isNotFunction();`
- `assert.isObject();`
- `assert.isNotObject();`

## assert.js v1.0.0

First stable version.
