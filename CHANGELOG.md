
# assert.js version history

## assert.js v1.2.1

1. Documentation, pdf and code fixes and many optimalisations.
2. TypeScript 7.0 compatibility

## assert.js v1.2.0

1. Documentation, pdf and code fixes and many optimalisations.
2. __FIX__ Type checking in `match();`.
3. __FIX__ Change the order of arguments in these functions: `testSync();` and `testAsync();`
4. __ADD__ New class: `assert.TestSuite();`
5. __ADD__ Add a new TS type: `type Message = string | Error;`.
6. __ADD__ Enhance the helper function `_isSameType()` with a new argument.
7. __ADD__ Developer (helper) functions in properties of function `assert();`, but only during development.
8. __ADD__ Add aliases:

Original function | Alias
------------------|---------------------------
`testSync();`     | `test();`
`testSync();`     | `it();`

## assert.js v1.1.10

1. __FIX__ Add JSDOC `@private` at the helper functions.
2. __FIX__ Change the argument `message` from `message: unknown` to `message?: string | Error` in the exported functions.
3. __FIX__ Remove `cause` from the properties of the `AssertionErrorOptions`.
4. __ADD__ Add aliases:

Original function | Alias
------------------|---------------------------
`isNullish();`    | `ifError();`
`deepEqual();`    | `deepStrictEqual();`
`notDeepEqual();` | `notDeepStrictEqual();`

## assert.js v1.1.9

1. Documentation, pdf and code fixes.
2. Add these functions:

- `typeOf();`
- `notTypeOf();`
- `instanceOf();`
- `notInstanceOf();`

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
4. Modify the `fail();` function with the new optional arguments: `assert.fail([value1, value2, message, operator]);`.

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
