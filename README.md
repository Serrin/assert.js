# assert.js

Latest version: 1.1.10

Date: 2026-05-13T19:27:38.793Z

A modern, zero-dependency assertion library for Node.js, Deno and browser (ESM) environments.

Implements and extends the [CommonJS Unit Testing 1.0 spec](https://wiki.commonjs.org/wiki/Unit_Testing/1.0).

---

## Summary

Category   | Assertions
-----------|------------------------------------------------------------------
Constants  | `assert.VERSION;`
Config     | `assert.config.alwaysStrict;` (Default value is `false`.)
Errors     | `assert.AssertionError();`
Basic      | `assert();`,<BR>`assert.ok();`, `assert.notOk();`,<BR>`assert.fail();`
Equality   | `assert.equal();`, `assert.notEqual();`,<BR>`assert.strictEqual();`, `assert.notStrictEqual();`,<BR>`assert.deepEqual();`, `assert.notDeepEqual();`,<BR>`assert.deepStrictEqual();`, `assert.notDeepStrictEqual();`,<BR>`assert.oneOf();`, `assert.notOneOf();`
Exception  | `assert.throws();`,<BR>`await assert.rejects();`,<BR>`await assert.doesNotReject();`
String     | `assert.match();`, `assert.doesNotMatch();`,<BR>`assert.stringContains();`, `assert.stringNotContains();`,<BR>`assert.stringStartsWith();`, `assert.stringNotStartsWith();`,<BR>`assert.stringEndsWith();`, `assert.stringNotEndsWith();`
Comparison | `assert.lt();`, `assert.lte();`,<BR>`assert.gt();`, `assert.gte();`,<BR>`assert.inRange();`, `assert.notInRange();`
Object     | `assert.includes();`, `assert.doesNotInclude();`,<BR>`assert.isEmpty();`, `assert.isNotEmpty();`
Type       | `assert.is();`, `assert.isNot();`,<BR>`assert.typeOf();`, `assert.notTypeOf();`,<BR>`assert.instanceOf();`, `assert.notInstanceOf();`,<BR>`assert.isPrimitive();`, `assert.isNotPrimitive();`,<BR>`assert.isNullish();`, `assert.ifError();`, `assert.isNonNullable();`,<BR>`assert.isNull();`, `assert.isNotNull();`,<BR>`assert.isUndefined();`, `assert.isDefined();`,<BR> `assert.isString();`, `assert.isNotString();`,<BR>`assert.isNumber();`, `assert.isNotNumber();`,<BR>`assert.isInt();`, `assert.isNotInt();`,<BR>`assert.isFloat();`, `assert.isNotFloat();`,<BR>`assert.isBigInt();`, `assert.isNotBigInt();`,<BR> `assert.isBoolean();`, `assert.isNotBoolean();`,<BR>`assert.isTrue();`, `assert.isNotTrue();`,<BR>`assert.isFalse();`, `assert.isNotFalse();`,<BR>`assert.isSymbol();`, `assert.isNotSymbol();`,<BR>`assert.isFunction();`, `assert.isNotFunction();`,<BR>`<BR>assert.isObject();`, `assert.isNotObject();`,<BR>`assert.isNaN();`, `assert.isNotNaN();`
Testrunner | `assert.testSync();`,<BR>`await assert.testAsync();`,<BR>`assert.testCheck();`

---

## Tested on these enviroments

- Windows Firefox
- Windows Chrome
- Windows Edge
- Windows Samsung Browser
- iOS Safari
- iOS Firefox
- iOS Chrome
- iOS Edge
- Android Firefox
- Android Chrome
- Android Edge
- Android Samsung Browser
- Node.js (latest current, not LTS)
- Deno (latest current, not LTS)

---

## Import

### Import the assert function

````javascript
import assert from "./assert.js";
globalThis.assert = assert;
````

### Import the assert function as default

````javascript
import { default as assert } from "./assert.js";
globalThis.assert = assert;
````

### Import the assert function as defaultExport

````javascript
import defaultExport from "./assert.js";
globalThis.assert = defaultExport;
````

### Dynamic import

````javascript
const assert = await import("./assert.js");
globalThis.assert = assert;
````

---

## Constants

### `assert.VERSION;`

Added in v1.0.0

Returns the library version string.

````javascript
console.log(assert.VERSION); // "assert.js v1.1.10"
````

---

## Config

### `assert.config.alwaysStrict;`

Added in v1.1.3

Default value is `false`.

If value is `true`, then the `assert.equal();` will be replaced with the `assert.strictEqual();` and the `assert.notEqual();` will be replaced with the `assert.notStrictEqual();`.

---

## Errors

### `assert.AssertionError([message], [options: { [message], [cause], [actual], [expected], [operator] } ]);`

Added in v1.0.0

Custom error class used internally by all failed assertions.

````javascript
try {
  assert(false, "example");
} catch (e) {
  if (e instanceof assert.AssertionError) {
    console.log("Caught assertion:", e.message);
  }
}
````

---

## Basic Assertions

### `assert(condition: unknown [, message: string | Error]): void;`

Added in v1.0.0

Ensures that `condition` is truthy. Throws an `AssertionError` if falsy.

````javascript
assert(1 === 1); // passes
// assert(0, "0 is falsy"); // throws an error
````

### `assert.ok(condition: unknown [, message: string | Error]): void;`

Added in v1.0.0

Alias for `assert(condition: unknown [, message: string | Error]): void;`.

````javascript
assert.ok(1 === 1); // passes
// assert.ok(0, "0 is falsy"); // throws an error
````

### `assert.notOk(condition: unknown [, message: string | Error]): void;`

Added in v1.0.0

Ensures a value is falsy.

````javascript
assert.notOk(0); // passes
assert.notOk(""); // passes
// assert.notOk(true); // throws an error
````

### `assert.fail([message: string | Error]);`

### `assert.fail([actual: unknown, expected: unknown, message: string, operator]);`

Added in v1.0.0

Forces a failure.

````javascript
// assert.fail("This should fail"); // throws an error
// assert.fail(1, 2, "This should fail", "===") // throws an error
````

---

## Equality Assertions

### `assert.equal(actual: unknown, expected: unknown [, message: string | Error]): void;`

Added in v1.0.0

Loose equality (`==`).

````javascript
assert.equal(1, "1"); // passes
assert.equal(true, 1); // passes
// assert.equal(1, 2); // throws an error
````

### `assert.notEqual(actual: unknown, expected: unknown [, message: string | Error]): void;`

Added in v1.0.0

Inverse of `assert.equal(actual: unknown, expected: unknown [, message: string | Error]): void;`.

````javascript
assert.notEqual(1, 2); // passes
// assert.notEqual(1, "1"); // throws an error
````

### `assert.strictEqual(actual: unknown, expected: unknown [, message: string | Error]): void;`

Added in v1.0.0

Strict equality (uses `Object.is();`).

````javascript
assert.strictEqual(1, 1); // passes
assert.strictEqual(NaN, NaN); // passes
// assert.strictEqual(1, "1"); // throws an error
````

### `assert.notStrictEqual(actual: unknown, expected: unknown [, message: string | Error]): void;`

Added in v1.0.0

Inverse of `assert.strictEqual(actual: unknown, expected: unknown [, message: string | Error]): void;`.

````javascript
assert.notStrictEqual(1, "1"); // passes
// assert.notStrictEqual(NaN, NaN); // throws an error
````

### `assert.deepEqual(actual: unknown, expected: unknown [, message: string | Error]): void;`

__Alias:__ `assert.deepStrictEqualEqual(actual: unknown, expected: unknown [, message: string | Error]): void;`

Added in v1.0.0

Deep equality check. Always strict (uses `Object.is();`).

````javascript
assert.deepEqual({ a: 1 }, { a: 1 }); // passes
assert.deepEqual([1, 2], [1, 2]); // passes
// assert.deepEqual({ a: 1 }, { a: 2 }); // throws an error
````

### `assert.notDeepEqual(actual: unknown, expected: unknown [, message: string | Error]): void;`

__Alias:__ `assert.notDeepStrictEqualEqual(actual: unknown, expected: unknown [, message: string | Error]): void;`

Added in v1.0.0

Inverse of `assert.deepEqual(actual: unknown, expected: unknown [, message: string | Error]): void;`.  Always strict (uses `Object.is();`).

````javascript
assert.notDeepEqual({ a: 1 }, { a: 2 }); // passes
// assert.notDeepEqual({ a: 1 }, { a: 1 }); // throws an error
````

### `assert.oneOf(value: unknown, collection: unknown [, message: string | Error]): void;`

Added in v1.1.5

Ensures a value is in a flat collection (`Array`, iterables, etc.).

````javascript
assert.oneOf(1, [1, 2, 3]); // passes
//assert.OneOf(4, [1, 2, 3]); // throws an error
````

### `assert.notOneOf(value: unknown, collection [, message: string | Error]): void;`

Added in v1.1.5

Ensures a value is not in a flat collection (`Array`, iterables, etc.).

````javascript
//assert.notOneOf(1, [1, 2, 3]); // throws an error
assert.notOneOf(4, [1, 2, 3]); // passes
````

---

## Exception Assertions

### `assert.throws(fn, [ErrorType|string|RegExp] [, message: string | Error]): void;`

Added in v1.0.0

Ensures that a function __throws__.

````javascript
assert.throws(() => { throw new TypeError("oops"); }, TypeError); // passes
assert.throws(() => { throw new Error("boom"); }, /boom/); // passes
// assert.throws(() => 42); // did not throw
````

### `await assert.rejects(asyncFnOrPromise, [ErrorType|string|RegExp] [, message: string | Error]): void;`

Added in v1.0.0

Ensures that an async function or promise __rejects__.

````javascript
await assert.rejects(async () => { throw new Error("fail"); }, /fail/);  // passes
// await assert.rejects(async () => 42); // resolved, didn’t reject
````

### `await assert.doesNotReject(asyncFnOrPromise, [ErrorType|string|RegExp] [, message: string | Error]): void;`

Added in v1.0.0

Ensures an async function or promise __resolves__ (does _not_ reject).

````javascript
await assert.doesNotReject(async () => 42); // passes
// await assert.doesNotReject(async () => { throw new Error("oops"); }); // throws an error
````

---

## String Assertions

### `assert.match(string, regexp [, message: string | Error]): void;`

Added in v1.0.0

Ensures a string matches a regular expression.

````javascript
assert.match("hello world", /world/); // passes
// assert.match("hello", /bye/); // throws an error
````

### `assert.doesNotMatch(string, regexp [, message: string | Error]): void;`

Added in v1.0.0

Ensures a string does not match a regular expression.

````javascript
assert.doesNotMatch("hello", /bye/); // passes
// assert.doesNotMatch("hello world", /world/); // throws an error
````

### `assert.stringContains(actual: string, substring: string [, message: string | Error]): void;`

Added in v1.0.0

Ensures a string contains a substring.

````javascript
assert.stringContains("hello world", "world"); // passes
// assert.stringContains("hello", "lorem"); // throws an error
````

### `assert.stringNotContains(actual: string, substring: string [, message: string | Error]): void;`

Added in v1.0.0

Ensures a string _does not_ contain a substring.

````javascript
assert.stringNotContains("hello world", "lorem"); // passes
// assert.stringNotContains("hello world", "hello"); // throws an error
````

### `assert.stringStartsWith(actual: string, substring: string [, message: string | Error]): void;`

Added in v1.1.7

Ensures a string starts with a substring.

````javascript
assert.stringStartsWith("hello world", "hello"); // passes
// assert.stringStartsWith("hello world", "world"); // throws an error
````

### `assert.stringNotStartsWith(actual: string, substring: string [, message: string | Error]): void;`

Added in v1.1.7

Ensures a string _does not_ start with a substring.

````javascript
assert.stringNotStartsWith("hello world", "world"); // passes
// assert.stringNotStartsWith("hello world", "hello"); // throws an error
````

### `assert.stringEndsWith(actual: string, substring: string [, message: string | Error]): void;`

Added in v1.1.7

Ensures a string ends with a substring.

````javascript
assert.stringEndsWith("hello world", "world"); // passes
// assert.stringEndsWith("hello world", "hello"); // throws an error
````

### `assert.stringNotEndsWith(actual: string, substring: string [, message: string | Error]): void;`

Added in v1.1.7

Ensures a string _does not_ end with a substring.

````javascript
assert.stringNotEndsWith("hello world", "hello"); // passes
// assert.stringNotEndsWith("hello world", "world"); // throws an error
````

---

## Comparison Assertions

### `assert.lt(value1, value2 [, message: string | Error]): void;`

Added in v1.0.0

Ensures `a < b` and value types have to be same type.

````javascript
assert.lt(3, 5); // passes
// assert.lt(5, 3); // throws an error
````

### `assert.lte(value1, value2 [, message: string | Error]): void;`

Added in v1.0.0

Ensures `a <= b` and value types have to be same type.

````javascript
assert.lte(3, 3); // passes
assert.lte(2, 4); // passes
// assert.lte(5, 3); // throws an error
````

### `assert.gt(value1, value2 [, message: string | Error]): void;`

Added in v1.0.0

Ensures `a > b` and value types have to be same type.

````javascript
assert.gt(5, 3); // passes
// assert.gt(3, 5); // throws an error
````

### `assert.gte(value1, value2 [, message: string | Error]): void;`

Added in v1.0.0

Ensures `a >= b` and value types have to be same type.

````javascript
assert.gte(3, 3); // passes
assert.gte(5, 3); // passes
// assert.gte(2, 3); // throws an error
````

### `assert.inRange(value: unknown, min, max [, message: string | Error]): void;`

Added in v1.0.3

Ensures `min <= value <= max` and the value types have to be same type.

````javascript
assert.inRange(1, -5, 3); // passes
// assert.inRange(0, 1, 3); // throws an error
// assert.inRange(4, 1, 3); // throws an error
// assert.inRange(2, 1n, 3); // throws an error
````

### `assert.notInRange(value: unknown, min, max [, message: string | Error]): void;`

Added in v1.0.3

Inverse of `assert.inRange(value: unknown, min, max [, message: string | Error]): void;`.

````javascript
assert.notInRange(0, 1, 3); // passes
assert.notInRange(4, 1, 3); // passes
assert.notInRange(2, 1n, 3); // passes
// assert.notInRange(1, -5, 3); // throws an error
````

---

## Object Assertions

### `assert.includes(container: unknown, options: {keyOrValue: unknown, [value: unknown] } [, message: string | Error]): void;`

Added in v1.0.1

Ensures a container includes a key and value.

__Compatible with these types and objects:__

- Plain objects (own properties)
- string (includes other string)
- String object (includes other string)
- Array
- TypedArrays (Int8Array, etc.)
- Map
- WeakMap
- Set
- WeakSet
- Iterable objects
- Iterator objects

````javascript
assert.includes([1, 2, 3], {keyOrValue: 3 }); // passes
assert.includes({"x": 42}), {keyOrValue: "x"}); // passes
assert.includes({"x": 42}, {keyOrValue: "x", value: 42}); // passes
assert.includes(new Map([["x", 42]]), {keyOrValue: "x"}); // passes
assert.includes(new Map([["x", 42]]), {keyOrValue: "x", value: 42}); // passes
// assert.includes([1, 2, 3], 4); // throws an error
// assert.includes({"x": 42}, {keyOrValue: "y"}); // throws an error
// assert.includes({"x": 42}, {keyOrValue: "x", value: 43}); // throws an error
// assert.includes(new Map([["x", 42]]), {keyOrValue: "y"}); // throws an error
// assert.includes(new Map([["x", 42]]), {keyOrValue: "x", value: 43}); // throws an error
````

### `assert.doesNotInclude(container: unknown, options: {keyOrValue: unknown, [value: unknown] } [, message: string | Error]): void;`

Added in v1.0.1

Inverse of `assert.includes(container: unknown, options: {keyOrValue: unknown, [value: unknown] } [, message: string | Error]): void;`.

````javascript
assert.doesNotInclude([1, 2, 3], 4); // passes
assert.doesNotInclude({"x": 42}, {keyOrValue: "y"}); // passes
assert.doesNotInclude({"x": 42}, {keyOrValue: "x", value: 43}); // passes
assert.doesNotInclude(new Map([["x", 42]]), {keyOrValue: "y"}); // passes
assert.doesNotInclude(new Map([["x", 42]]), {keyOrValue: "x", value: 43}); // passes
// assert.includes([1, 2, 3], {keyOrValue: 3 }); // throws an error
// assert.doesNotInclude({"x": 42}, {keyOrValue: "x"}); // throws an error
// assert.doesNotInclude({"x": 42}, {keyOrValue: "x", value: 42}); // throws an error
// assert.doesNotInclude(new Map([["x", 42]]), {keyOrValue: "x"}); // throws an error
// assert.doesNotInclude(new Map([["x", 42]]), {keyOrValue: "x", value: 42}); // throws an error
````

### `assert.isEmpty(value: unknown [, message: string | Error]): void;`

Added in v1.0.1

Ensures value is empty.

- `null`, `undefined`, and `NaN` are empty.
- Arrays, TypedArrays, and strings are empty if length === 0.
- Maps and Sets are empty if size === 0.
- ArrayBuffer and DataView are empty if byteLength === 0.
- Iterable objects are empty if they have no elements.
- Plain objects are empty if they have no own properties.

````javascript
assert.isEmpty(new Map()); // passes
// assert.isEmpty([1, 2, 3]); // throws an error
````

### `assert.isNotEmpty(value: unknown [, message: string | Error]): void;`

Added in v1.0.1

Inverse of `assert.isEmpty(value: unknown [, message: string | Error]): void;`.

````javascript
assert.isNotEmpty([1, 2, 3]); // passes
// assert.isNotEmpty(new Map()); // throws an error
````

---

## Type Assertions

### `assert.is(value: unknown, expectedType: string | function | Array<string | function> [, message: string | Error]): void;`

Added in v1.0.0

Ensures a value matches a type or constructor. The expectedType can be a string, function or an array of strings and functions.

````javascript
assert.is(123, "number"); // passes
assert.is([], Array); // passes
assert.is(new Map(), [Map, Object]); // passes
// assert.is("hi", Number); // throws an error
````

### `assert.isNot(value: unknown, expectedType: string | function | Array<string | function> [, message: string | Error]): void;`

Added in v1.0.0

Inverse of `assert.is(value: unknown, expectedType [, message: string | Error]): void;`. The expectedType can be a string, function or an array of strings and functions.

````javascript
assert.isNot("hello", Number); // passes
assert.isNot([], Set); // passes
// assert.isNot([], Array); // throws an error
````

### `assert.typeOf(value: unknown, expectedType: string [, message: string | Error]): void;`

Added in v1.1.9

Ensures a value matches a type. The expectedType can be a string.

````javascript
assert.typeOf(42, "number"); // passes
assert.typeOf(42, "string"); // throws an error
assert.typeOf([], Array); // throws an error
assert.typeOf([], Map); // throws an error
````

### `assert.notTypeOf(value: unknown, expectedType: function [, message: string | Error]): void;`

Added in v1.1.9

Inverse of `assert.typeOf(value: unknown, expectedType: string [, message: string | Error]): void;`. The expectedType can be a string.

````javascript
assert.notTypeOf(42, "number"); // throws an error
assert.notTypeOf(42, "string"); // passes
assert.notTypeOf([], Array); // throws an error
assert.notTypeOf([], Map); // throws an error
````

### `assert.instanceOf(value: unknown, expectedConstructor: function [, message: string | Error]): void;`

Added in v1.1.9

Ensures a value matches a constructor. The expectedType can be a function.

````javascript
assert.instanceOf(42, "number"); // throws an error
assert.instanceOf(42, "string"); // throws an error
assert.instanceOf([], Array); // passes
assert.instanceOf([], Map); // throws an error
````

### `assert.notInstanceOf(value: unknown, expectedConstructor: function [, message: string | Error]): void;`

Added in v1.1.9

Inverse of `assert.instanceOf(value: unknown, expectedConstructor: string [, message: string | Error]): void;`. The expectedType can be a function.

````javascript
assert.notInstanceOf(42, "number"); // throws an error
assert.notInstanceOf(42, "string"); // throws an error
assert.notInstanceOf([], Array); // throws an error
assert.notInstanceOf([], Map); // passes
````

### `assert.isPrimitive(value: unknown [, message: string | Error]): void;`

Added in v1.0.1

Ensures value is not `object` or `function`.

````javascript
assert.isPrimitive(42); // passes
// assert.isPrimitive([]]); // throws an error
````

### `assert.isNotPrimitive(value: unknown [, message: string | Error]): void;`

Added in v1.0.1

Ensures value is `object` or `function`.

````javascript
assert.isNotPrimitive([]); // passes
// assert.isNotPrimitive(42); // throws an error
````

### `assert.isNullish(value: unknown [, message: string | Error]): void;`

__Alias:__ `assert.ifError(actual: unknown, expected: unknown [, message: string | Error]): void;`

Added in v1.0.0

Ensures value is `null` or `undefined`.

````javascript
assert.isNullish(undefined); // passes
assert.isNullish(null); // passes
// assert.isNullish(0); // throws an error
````

### `assert.isNonNullable(value: unknown [, message: string | Error]): void;`

Added in v1.0.0

Old name before v1.1.0: `assert.isNotNullish();`.

Ensures value is _not_ `null` or `undefined`.

````javascript
assert.isNonNullable(42); // passes
assert.isNonNullable("ok"); // passes
// assert.isNonNullable(null); // throws an error
````

### `assert.isNull(value: unknown [, message: string | Error]): void;`

Added in v1.0.1

Ensures value is `null`.

````javascript
assert.isNull(null); // passes
// assert.isNull(0); // throws an error
````

### `assert.isNotNull(value: unknown [, message: string | Error]): void;`

Added in v1.0.1

Ensures value is _not_ `null`.

````javascript
assert.isNotNull("ok"); // passes
// assert.isNotNull(null); // throws an error
````

### `assert.isUndefined(value: unknown [, message: string | Error]): void;`

Added in v1.0.1

Ensures value is `undefined`.

````javascript
assert.isUndefined(undefined); // passes
// assert.isUndefined(0); // throws an error
````

### `assert.isDefined(value: unknown [, message: string | Error]): void;`

Added in v1.0.1

Old name before v1.1.0: `assert.isNotUndefined();`.

Ensures value is _not_ `undefined`.

````javascript
assert.isDefined("ok"); // passes
// assert.isDefined(undefined); // throws an error
````

### `assert.isString(value: unknown [, message: string | Error]): void;`

Added in v1.0.1

Ensures value is `string`.

````javascript
assert.isString("ok"); // passes
// assert.isString(null); // throws an error
````

### `assert.isNotString(value: unknown [, message: string | Error]): void;`

Added in v1.0.1

Ensures value is _not_ `string`.

````javascript
assert.isNotString(null); // passes
// assert.isNotString("ok"); // throws an error
````

### `assert.isNumber(value: unknown [, message: string | Error]): void;`

Added in v1.0.1

Ensures value is `number`.

````javascript
assert.isNumber(42); // passes
// assert.isNumber(null); // throws an error
````

### `assert.isNotNumber(value: unknown [, message: string | Error]): void;`

Added in v1.0.1

Ensures value is _not_ `number`.

````javascript
assert.isNotNumber(null); // passes
// assert.isNotNumber(42); // throws an error
````

### `assert.isBigInt(value: unknown [, message: string | Error]): void;`

Added in v1.0.1

Ensures value is `bigint`.

````javascript
assert.isBigInt(42n); // passes
// assert.isBigInt(null); // throws an error
````

### `assert.isNotBigInt(value: unknown [, message: string | Error]): void;`

Added in v1.0.1

Ensures value is _not_ `bigint`.

````javascript
assert.isNotBigInt(null); // passes
// assert.isNotBigInt(42n); // throws an error
````

### `assert.isBoolean(value: unknown [, message: string | Error]): void;`

Added in v1.0.1

Ensures value is `boolean`.

````javascript
assert.isBoolean(true); // passes
assert.isBoolean(false); // passes
// assert.isBoolean(1); // throws an error
````

### `assert.isNotBoolean(value: unknown [, message: string | Error]): void;`

Added in v1.0.1

Ensures value is _not_ `boolean`.

````javascript
// assert.isNotBoolean(true); // throws an error
// assert.isNotBoolean(false); // throws an error
assert.isNotBoolean(1); // passes
````

### `assert.isTrue(value: unknown [, message: string | Error]): void;`

Added in v1.0.0

Ensures value is exactly `true`.

````javascript
assert.isTrue(true); // passes
// assert.isTrue(false); // throws an error
// assert.isTrue(1); // throws an error
````

### `assert.isNotTrue(value: unknown [, message: string | Error]): void;`

Added in v1.1.5

Ensures value is exactly not `true`.

````javascript
//assert.isNotTrue(true); // throws an error
assert.isNotTrue(false); // passes
assert.isNotTrue(1); // passes
````

### `assert.isFalse(value: unknown [, message: string | Error]): void;`

Added in v1.0.0

Ensures value is exactly `false`.

````javascript
//assert.isFalse(true); // throws an error
assert.isFalse(false); // passes
//assert.isFalse(1); // throws an error
````

### `assert.isNotFalse(value: unknown [, message: string | Error]): void;`

Added in v1.1.5

Ensures value is exactly not `false`.

````javascript
assert.isNotFalse(true); // passes
//assert.isNotFalse(false); // throws an error
assert.isNotFalse(1); // passes
````

### `assert.isSymbol(value: unknown [, message: string | Error]): void;`

Added in v1.0.1

Ensures value is `symbol`.

````javascript
assert.isSymbol(Symbol("foo")); // passes
// assert.isSymbol(null); // throws an error
````

### `assert.isNotSymbol(value: unknown [, message: string | Error]): void;`

Added in v1.0.1

Ensures value is _not_ `symbol`.

````javascript
assert.isNotSymbol(null); // passes
// assert.isNotSymbol(Symbol("foo")); // throws an error
````

### `assert.isFunction(value: unknown [, message: string | Error]): void;`

Added in v1.0.1

Ensures value is `function`.

````javascript
assert.isFunction(assert); // passes
// assert.isFunction(null); // throws an error
````

### `assert.isNotFunction(value: unknown [, message: string | Error]): void;`

Added in v1.0.1

Ensures value is _not_ `function`.

````javascript
assert.isNotFunction(null); // passes
// assert.isNotFunction(assert); // throws an error
````

### `assert.isObject(value: unknown [, message: string | Error]): void;`

Added in v1.0.1

Ensures value is `object` and value is _not_ `null`.

````javascript
assert.isObject({a: 1}); // passes
// assert.isObject(null); // throws an error
````

### `assert.isNotObject(value: unknown [, message: string | Error]): void;`

Added in v1.0.1

Ensures value is _not_ `object` or value is `null`.

````javascript
assert.isNotObject(null); // passes
// assert.isNotObject({a: 1}); // throws an error
````

### `assert.isNaN(value: unknown [, message: string | Error]): void;`

Added in v1.0.2

Ensures value is `number` and `NaN`.

````javascript
assert.isNaN(0 / 0); // passes
// assert.isNaN(42); // throws an error
// assert.isNaN("foo"); // throws an error
````

### `assert.isNotNaN(value: unknown [, message: string | Error]): void;`

Added in v1.0.2

Inverse of `assert.isNaN(value: unknown [, message: string | Error]): void;`.

````javascript
assert.isNotObject(42); // passes
assert.isNotObject("foo"); // passes
// assert.isNotObject(0 /0); // throws an error
````

### `assert.isInt(value: unknown [, message: string | Error]): void;`

Added in v1.1.4

Ensures value is `number` and `integer`.

````javascript
assert.isInt(42); // passes
// assert.isInt(42.5); // throws an error
// assert.isInt("foo"); // throws an error
````

### `assert.isNotInt(value: unknown [, message: string | Error]): void;`

Added in v1.1.4

Inverse of `assert.isInt(value: unknown [, message: string | Error]): void;`.

````javascript
// assert.isNotInt(42); // throws an error
assert.isNotInt(42.5); // passes
assert.isNotInt("foo"); // passes
````

### `assert.isFloat(value: unknown [, message: string | Error]): void;`

Added in v1.1.4

Ensures value is `number` and `float`.

````javascript
// assert.isFloat(42); // throws an error
assert.isFloat(42.5); // passes
// assert.isFloat("foo"); // throws an error
````

### `assert.isNotFloat(value: unknown [, message: string | Error]): void;`

Added in v1.1.4

Inverse of `assert.isFloat(value: unknown [, message: string | Error]): void;`.

````javascript
assert.isNotFloat(42); // passes
// assert.isNotFloat(42.5); // passes
assert.isNotFloat("foo"); // passes
````

---

## Testrunner

### `assert.testSync(block, name = "assert.testSync"): {ok: true, value: T, block: Function, name: string} | {ok: false, error: Error, block: Function, name: string}`

Added in v1.0.0

Synchronously runs a block of code and returns either its result or the caught error.

````javascript
if (assert.testCheck(assert.testSync(() => 42))) {
  console.log("passed");
} else {
  console.error("failed");
}
````

### `await assert.testASync(block, name = "assert.testAsync"): {ok: true, value: T, block: Function, name: string} | {ok: false, error: Error, block: Function, name: string}`

Added in v1.0.0

Asynchronously runs a block of code and returns either its result or the caught error.

````javascript
(async () => {
  const result = await assert.testAsync(async function () { return 42; });
  if (assert.testCheck(result)) {
    console.log("passed");
  } else {
    console.error("failed");
  }
})();
````

### `assert.testCheck(result: {ok: true, value: T, block: Function, name: string} | {ok: false, error: Error, block: Function, name: string}): result.ok is true`

Added in v1.0.0

Ensures if the result is successful.

````javascript
if (assert.testCheck(assert.testSync(() => 42))) {
  console.log("passed");
} else {
  console.error("failed");
}
````

---

## Example Test File

````javascript
import assert from "./assert.js"

function add(a, b) {
  return a + b;
}

assert.strictEqual(add(2, 3), 5); // passes
assert.notEqual(add(1, 1), 3); // passes
assert.is(add, Function); // passes
assert.doesNotReject(async () => add(1, 2)); // passes
````

---

## License

[https://opensource.org/licenses/MIT](https://opensource.org/licenses/MIT)

MIT License

SPDX short identifier: MIT

Copyright (c) 2025 Ferenc Czigler

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

© Copyright 2025 Ferenc Czigler [https://github.com/Serrin](https://github.com/Serrin)
