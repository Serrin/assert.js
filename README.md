# assert.js

Latest version: 1.1.0

Date: 2025-10-29T19:32:23.980Z

A modern, zero-dependency assertion library for Node.js, Deno and browser (ESM) environments.

Implements and extends the [CommonJS Unit Testing 1.0 spec](https://wiki.commonjs.org/wiki/Unit_Testing/1.0).

---

## Summary

Category | Assertions
---------|-------------
Constants | `assert.VERSION;`
Errors | `assert.AssertionError();`
Basic | `assert();`, `assert.ok();`, `assert.notOk();`, `assert.fail();`
Equality | `assert.equal();`, `assert.notEqual();`, `assert.strictEqual();`, `assert.notStrictEqual();`, `assert.deepEqual();`, `assert.notDeepEqual();`
Exception | `assert.throws();`, `await assert.rejects();`, `await assert.doesNotReject();`
Boolean | `assert.isTrue();`, `assert.isFalse();`
String | `assert.match();`, `assert.doesNotMatch();`, `assert.stringContains();`, `assert.stringNotContains();`
Comparison | `assert.lt();`, `assert.lte();`, `assert.gt();`, `assert.gte();`, `assert.inRange();`, `assert.notInRange();`
Objects | `assert.includes();`, `assert.doesNotInclude();`, `assert.isEmpty();`, `assert.isNotEmpty();`
Type | `assert.is();`, `assert.isNot();`, `assert.isPrimitive();`, `assert.isNotPrimitive();`, `assert.isNullish();`, `assert.isNonNullable();`, `assert.isNull();`, `assert.isNotNull();`, `assert.isUndefined();`, `assert.isDefined();`, `assert.isString();`, `assert.isNotString();`, `assert.isNumber();`, `assert.isNotNumber();`, `assert.isBigInt();`, `assert.isNotBigInt();`, `assert.isBoolean();`, `assert.isNotBoolean();`, `assert.isSymbol();`, `assert.isNotSymbol();`, `assert.isFunction();`, `assert.isNotFunction();`, `assert.isObject();`, `assert.isNotObject();`, `assert.isNaN();`, `assert.isNotNaN();`
Testrunner | `assert.testSync();`, `await assert.testAsync();`, `assert.testCheck();`

---

## Tested on these enviroments

- Windows Firefox
- Windows Chrome
- Windows Edge
- iOS Safari
- iOS Firefox
- iOS Chrome
- iOS Edge
- Android Firefox
- Android Chrome
- Android Samsung Internet
- Android Edge
- Node.js (latest current, not LTS)
- Deno (latest current, not LTS)

---

## Import

### Import the assert function

````js
import assert from "./assert.js";
globalThis.assert = assert;
````

### Import the assert function as defaultExport

````js
import defaultExport from "./assert.js";
globalThis.assert = defaultExport;
````

### Dynamic import

````js
const assert = await import("./assert.js");
globalThis.assert = assert;
````

---

## Constants

### `assert.VERSION;`

Added in v1.0.0

Returns the library version string.

````js
console.log(assert.VERSION); // "assert.js v1.1.0"
````

---

## Errors

### `assert.AssertionError([message], [options]);`

Added in v1.0.0

Custom error class used internally by all failed assertions.

````js
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

### `assert(condition, [message: string | Error]);`

Added in v1.0.0

Ensures that `condition` is truthy. Throws an `AssertionError` if falsy.

````js
assert(true); // passes
// assert(false, "should be true"); // throws an error fails
````

### `assert.ok(condition, [message: string | Error]);`

Added in v1.0.0

Alias for `assert(condition, [message: string | Error]);`.

````js
assert.ok(1 === 1); // passes
// assert.ok(0, "0 is falsy"); // throws an error
````

### `assert.notOk(condition, [message: string | Error]);`

Added in v1.0.0

Ensures a value is falsy.

````js
assert.notOk(0); // passes
assert.notOk(""); // passes
// assert.notOk(true); // throws an error
````

### `assert.fail([message: string | Error]);`

Added in v1.0.0

Forces a failure.

````js
// assert.fail("This should fail"); // throws an error
````

---

## Equality Assertions

### `assert.equal(actual, expected, [message: string | Error]);`

Added in v1.0.0

Loose equality (`==`).

````js
assert.equal(1, "1"); // passes
assert.equal(true, 1); // passes
// assert.equal(1, 2); // throws an error
````

### `assert.notEqual(actual, expected, [message: string | Error]);`

Added in v1.0.0

Inverse of `equal(actual, expected, [message: string | Error]);`.

````js
assert.notEqual(1, 2); // passes
// assert.notEqual(1, "1"); // throws an error
````

### `assert.strictEqual(actual, expected, [message: string | Error]);`

Added in v1.0.0

Strict equality (`Object.is();`).

````js
assert.strictEqual(1, 1); // passes
assert.strictEqual(NaN, NaN); // passes
// assert.strictEqual(1, "1"); // throws an error
````

### `assert.notStrictEqual(actual, expected, [message: string | Error]);`

Added in v1.0.0

Inverse of `strictEqual(actual, expected, [message: string | Error]);`.

````js
assert.notStrictEqual(1, "1"); // passes
// assert.notStrictEqual(NaN, NaN); // throws an error
````

### `assert.deepEqual(actual, expected, [message: string | Error]);`

Added in v1.0.0

Deep equality check.

````js
assert.deepEqual({ a: 1 }, { a: 1 }); // passes
assert.deepEqual([1, 2], [1, 2]); // passes
// assert.deepEqual({ a: 1 }, { a: 2 }); // throws an error
````

### `assert.notDeepEqual(actual, expected, [message: string | Error]);`

Added in v1.0.0

Inverse of `deepEqual(actual, expected, [message: string | Error]);`.

````js
assert.notDeepEqual({ a: 1 }, { a: 2 }); // passes
// assert.notDeepEqual({ a: 1 }, { a: 1 }); // throws an error
````

---

## Exception Assertions

### `assert.throws(fn, [ErrorType|string|RegExp], [message: string | Error]);`

Added in v1.0.0

Ensures that a function __throws__.

````js
assert.throws(() => { throw new TypeError("oops"); }, TypeError); // passes
assert.throws(() => { throw new Error("boom"); }, /boom/); // passes
// assert.throws(() => 42); // did not throw
````

### `await assert.rejects(asyncFnOrPromise, [ErrorType|string|RegExp], [message: string | Error]);`

Added in v1.0.0

Ensures that an async function or promise __rejects__.

````js
await assert.rejects(async () => { throw new Error("fail"); }, /fail/);  // passes
// await assert.rejects(async () => 42); // resolved, didn’t reject
````

### `await assert.doesNotReject(asyncFnOrPromise, [ErrorType|string|RegExp], [message: string | Error]);`

Added in v1.0.0

Ensures an async function or promise __resolves__ (does _not_ reject).

````js
await assert.doesNotReject(async () => 42); // passes
// await assert.doesNotReject(async () => { throw new Error("oops"); }); // throws an error
````

---

## Boolean Assertions

### `assert.isTrue(value, [message: string | Error]);`

Added in v1.0.0

Ensures value is exactly `true`.

````js
assert.isTrue(true); // passes
// assert.isTrue(1); // throws an error
````

### `assert.isFalse(value, [message: string | Error]);`

Added in v1.0.0

Ensures value is exactly `false`.

````js
assert.isFalse(false); // passes
// assert.isFalse(0); // throws an error
````

---

## String Assertions

### `assert.match(string, regexp, [message: string | Error]);`

Added in v1.0.0

Ensures a string matches a regular expression.

````js
assert.match("hello world", /world/); // passes
// assert.match("hello", /bye/); // throws an error
````

### `assert.doesNotMatch(string, regexp, [message: string | Error]);`

Added in v1.0.0

Ensures a string does not match a regular expression.

````js
assert.doesNotMatch("hello", /bye/); // passes
// assert.doesNotMatch("hello world", /world/); // throws an error
````

### `assert.stringContains(actual, substring, [message: string | Error]);`

Added in v1.0.0

Ensures a string contains a substring.

````js
assert.stringContains("hello world", "world"); // passes
// assert.stringContains("hello", "z"); // throws an error
````

### `assert.stringNotContains(actual, substring, [message: string | Error]);`

Added in v1.0.0

Ensures a string _does not_ contain a substring.

````js
assert.stringNotContains("hello", "z"); // passes
// assert.stringNotContains("hello", "he"); // throws an error
````

---

## Comparison Assertions

### `assert.lt(value1, value2, [message: string | Error]);`

Added in v1.0.0

Ensures `a < b` and value types have to be same type.

````js
assert.lt(3, 5); // passes
// assert.lt(5, 3); // throws an error
````

### `assert.lte(value1, value2, [message: string | Error]);`

Added in v1.0.0

Ensures `a <= b` and value types have to be same type.

````js
assert.lte(3, 3); // passes
assert.lte(2, 4); // passes
// assert.lte(5, 3); // throws an error
````

### `assert.gt(value1, value2, [message: string | Error]);`

Added in v1.0.0

Ensures `a > b` and value types have to be same type.

````js
assert.gt(5, 3); // passes
// assert.gt(3, 5); // throws an error
````

### `assert.gte(value1, value2, [message: string | Error]);`

Added in v1.0.0

Ensures `a >= b` and value types have to be same type.

````js
assert.gte(3, 3); // passes
assert.gte(5, 3); // passes
// assert.gte(2, 3); // throws an error
````

### `assert.inRange(value, min, max, [message: string | Error]);`

Added in v1.0.3

Ensures `min <= value <= max` and the value types have to be same type.

````js
assert.inRange(1, -5, 3); // passes
// assert.inRange(0, 1, 3); // throws an error
// assert.inRange(4, 1, 3); // throws an error
// assert.inRange(2, 1n, 3); // throws an error
````

### `assert.notInRange(value, min, max, [message: string | Error]);`

Added in v1.0.3

Inverse of `inRange(value, min, max, [message: string | Error]);`.

````js
assert.notInRange(0, 1, 3); // passes
assert.notInRange(4, 1, 3); // passes
assert.notInRange(2, 1n, 3); // passes
// assert.notInRange(1, -5, 3); // throws an error
````

---

## Object Assertions

### `assert.includes(container, options: {keyOrValue, [value] }, [message: string | Error]);`

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

````js
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

### `assert.doesNotInclude(container, options: {keyOrValue, [value] }, [message: string | Error]);`

Added in v1.0.1

Inverse of `assert.includes(container, options: {keyOrValue, [value] }, [message: string | Error]);`.

````js
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

### `assert.isEmpty(value, [message: string | Error]);`

Added in v1.0.1

Ensures value is empty.

- `null`, `undefined`, and `NaN` are empty.
- Arrays, TypedArrays, and strings are empty if length === 0.
- Maps and Sets are empty if size === 0.
- ArrayBuffer and DataView are empty if byteLength === 0.
- Iterable objects are empty if they have no elements.
- Plain objects are empty if they have no own properties.

````js
assert.isEmpty(new Map()); // passes
// assert.isEmpty([1, 2, 3]); // throws an error
````

### `assert.isNotEmpty(value, [message: string | Error]);`

Added in v1.0.1

Inverse of `assert.isEmpty(value, [message: string | Error]);`.

````js
assert.isNotEmpty([1, 2, 3]); // passes
// assert.isNotEmpty(new Map()); // throws an error
````

---

## Type Assertions

### `assert.is(value, expectedType: string | function | Array<string | function>, [message: string | Error]);`

Added in v1.0.0

Ensures a value matches a type or constructor. The expected type can be a string, function or an array of strings and functions.

````js
assert.is(123, "number"); // passes
assert.is([], Array); // passes
assert.is(new Map(), [Map, Object]); // passes
// assert.is("hi", Number); // throws an error
````

### `assert.isNot(value, expectedType: string | function | Array<string | function>, [message: string | Error]);`

Added in v1.0.0

Inverse of `is(value, expectedType, [message: string | Error]);`. The expected type can be a string, function or an array of strings and functions.

````js
assert.isNot("hello", Number); // passes
assert.isNot([], Set); // passes
// assert.isNot([], Array); // throws an error
````

### `assert.isPrimitive(value, [message: string | Error]);`

Added in v1.0.1

Ensures value is not `object` or `function`.

````js
assert.isPrimitive(42); // passes
// assert.isPrimitive([]]); // throws an error
````

### `assert.isNotPrimitive(value, [message: string | Error]);`

Added in v1.0.1

Ensures value is `object` or `function`.

````js
assert.isNotPrimitive([]); // passes
// assert.isNotPrimitive(42); // throws an error
````

### `assert.isNullish(value, [message: string | Error]);`

Added in v1.0.0

Ensures value is `null` or `undefined`.

````js
assert.isNullish(undefined); // passes
assert.isNullish(null); // passes
// assert.isNullish(0); // throws an error
````

### `assert.isNonNullable(value, [message: string | Error]);`

Added in v1.0.0

Old name before v1.1.0: `assert.isNotNullish();`.

Ensures value is _not_ `null` or `undefined`.

````js
assert.isNonNullable(42); // passes
assert.isNonNullable("ok"); // passes
// assert.isNonNullable(null); // throws an error
````

### `assert.isNull(value, [message: string | Error]);`

Added in v1.0.1

Ensures value is `null`.

````js
assert.isNull(null); // passes
// assert.isNull(0); // throws an error
````

### `assert.isNotNull(value, [message: string | Error]);`

Added in v1.0.1

Ensures value is _not_ `null`.

````js
assert.isNotNull("ok"); // passes
// assert.isNotNull(null); // throws an error
````

### `assert.isUndefined(value, [message: string | Error]);`

Added in v1.0.1

Ensures value is `undefined`.

````js
assert.isUndefined(undefined); // passes
// assert.isUndefined(0); // throws an error
````

### `assert.isDefined(value, [message: string | Error]);`

Added in v1.0.1

Old name before v1.1.0: `assert.isNotUndefined();`.

Ensures value is _not_ `undefined`.

````js
assert.isDefined("ok"); // passes
// assert.isDefined(undefined); // throws an error
````

### `assert.isString(value, [message: string | Error]);`

Added in v1.0.1

Ensures value is `string`.

````js
assert.isString("ok"); // passes
// assert.isString(null); // throws an error
````

### `assert.isNotString(value, [message: string | Error]);`

Added in v1.0.1

Ensures value is _not_ `string`.

````js
assert.isNotString(null); // passes
// assert.isNotString("ok"); // throws an error
````

### `assert.isNumber(value, [message: string | Error]);`

Added in v1.0.1

Ensures value is `number`.

````js
assert.isNumber(42); // passes
// assert.isNumber(null); // throws an error
````

### `assert.isNotNumber(value, [message: string | Error]);`

Added in v1.0.1

Ensures value is _not_ `number`.

````js
assert.isNotNumber(null); // passes
// assert.isNotNumber(42); // throws an error
````

### `assert.isBigInt(value, [message: string | Error]);`

Added in v1.0.1

Ensures value is `bigint`.

````js
assert.isBigInt(42n); // passes
// assert.isBigInt(null); // throws an error
````

### `assert.isNotBigInt(value, [message: string | Error]);`

Added in v1.0.1

Ensures value is _not_ `bigint`.

````js
assert.isNotBigInt(null); // passes
// assert.isNotBigInt(42n); // throws an error
````

### `assert.isBoolean(value, [message: string | Error]);`

Added in v1.0.1

Ensures value is `boolean`.

````js
assert.isBoolean(true); // passes
// assert.isBoolean(null); // throws an error
````

### `assert.isNotBoolean(value, [message: string | Error]);`

Added in v1.0.1

Ensures value is _not_ `boolean`.

````js
assert.isNotBoolean(null); // passes
// assert.isNotBoolean(true); // throws an error
````

### `assert.isSymbol(value, [message: string | Error]);`

Added in v1.0.1

Ensures value is `symbol`.

````js
assert.isSymbol(Symbol("foo")); // passes
// assert.isSymbol(null); // throws an error
````

### `assert.isNotSymbol(value, [message: string | Error]);`

Added in v1.0.1

Ensures value is _not_ `symbol`.

````js
assert.isNotSymbol(null); // passes
// assert.isNotSymbol(Symbol("foo")); // throws an error
````

### `assert.isFunction(value, [message: string | Error]);`

Added in v1.0.1

Ensures value is `function`.

````js
assert.isFunction(assert); // passes
// assert.isFunction(null); // throws an error
````

### `assert.isNotFunction(value, [message: string | Error]);`

Added in v1.0.1

Ensures value is _not_ `function`.

````js
assert.isNotFunction(null); // passes
// assert.isNotFunction(assert); // throws an error
````

### `assert.isObject(value, [message: string | Error]);`

Added in v1.0.1

Ensures value is `object` and value is _not_ `null`.

````js
assert.isObject({a: 1}); // passes
// assert.isObject(null); // throws an error
````

### `assert.isNotObject(value, [message: string | Error]);`

Added in v1.0.1

Ensures value is _not_ `object` or value is `null`.

````js
assert.isNotObject(null); // passes
// assert.isNotObject({a: 1}); // throws an error
````

### `assert.isNaN(value, [message: string | Error]);`

Added in v1.0.2

Ensures value is `number` and `NaN`.

````js
assert.isNaN(0 / 0); // passes
// assert.isNaN(42); // throws an error
// assert.isNaN("foo"); // throws an error
````

### `assert.isNotNaN(value, [message: string | Error]);`

Added in v1.0.2

Inverse of `assert.isNaN(value, [message: string | Error]);`.

````js
assert.isNotObject(42); // passes
assert.isNotObject("foo"); // passes
// assert.isNotObject(0 /0); // throws an error
````

---

## Testrunner

### `assert.testSync(block, name = "assert.testSync"): {ok: true, value: T, block: Function, name: string} | {ok: false, error: Error, block: Function, name: string}`

Added in v1.0.0

Synchronously runs a block of code and returns either its result or the caught error.

````js
if (assert.testCheck(assert.testSync(() => 42))) {
  console.log("passed");
} else {
  console.error("failed");
}
````

### `await assert.testASync(block, name = "assert.testAsync"): {ok: true, value: T, block: Function, name: string} | {ok: false, error: Error, block: Function, name: string}`

Added in v1.0.0

Asynchronously runs a block of code and returns either its result or the caught error.

````js
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

````js
if (assert.testCheck(assert.testSync(() => 42))) {
  console.log("passed");
} else {
  console.error("failed");
}
````

---

## Example Test File

````js
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
