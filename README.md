# assert.js

Latest version: 1.0.0

Date: 2025-10-09T16:54:49.646Z

A modern, zero-dependency assertion library for Node.js, Deno and browser (ESM) environments.
Implements and extends the [CommonJS Unit Testing 1.0 spec](https://wiki.commonjs.org/wiki/Unit_Testing/1.0).

---

## Summary

Category | Assertions
---------|-------------
Constants | `VERSION;`
Errors | `AssertionError();`
Basic | `assert();`, `ok();`, `fail();`
Equality | `Equal();`, `notEqual();`, `strictEqual();`, `notStrictEqual();`, `deepEqual();`, `notDeepEqual();`
Exceptions | `throws();`, `rejects();`, `doesNotReject();`
Boolean | `isTrue();`, `isFalse();`, `notOk();`
Type | `is();`, `isNot();`
Nullish | `isNullish();`, `isNotNullish();`
String | `match();`, `stringContains();`, `stringNotContains();`
Comparison | `lt();`, `lte();`, `gt();`, `gte();`

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
globalThis.assert = assert;
````

### Dynamic import

````js
const assert = await import("./assert.js");
globalThis.assert = assert;
````

---

## Constants

### `assert.VERSION;`

Returns the library version string.

````js
console.log(assert.VERSION); // "assert.js v1.0.0"
````

---

## Errors

### `assert.AssertionError`

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

Checks that `condition` is truthy. Throws an `AssertionError` if falsy.

````js
assert(true); // passes
// assert(false, "should be true"); // throws an error fails
````

### `assert.ok(condition, [message: string | Error]);`

Alias for `assert(condition, [message: string | Error]);`.

````js
assert.ok(1 === 1); // passes
// assert.ok(0, "0 is falsy"); // throws an error
````

### `assert.fail([message: string | Error]);`

Forces a failure.

````js
// assert.fail("This should fail"); // throws an error
````

---

## Equality Assertions

### `assert.Equal(actual, expected, [message: string | Error]);`

Loose equality (`==`).

````js
assert.Equal(1, "1"); // passes
assert.Equal(true, 1); // passes
// assert.Equal(1, 2); // throws an error
````

### `assert.notEqual(actual, expected, [message: string | Error]);`

Inverse of `Equal(actual, expected, [message: string | Error]);`.

````js
assert.notEqual(1, 2); // passes
// assert.notEqual(1, "1"); // throws an error
````

### `assert.strictEqual(actual, expected, [message: string | Error]);`

Strict equality (`Object.is();`).

````js
assert.strictEqual(1, 1); // passes
assert.strictEqual(NaN, NaN); // passes
// assert.strictEqual(1, "1"); // throws an error
````

### `assert.notStrictEqual(actual, expected, [message: string | Error]);`

Inverse of `strictEqual(actual, expected, [message: string | Error]);`.

````js
assert.notStrictEqual(1, "1"); // passes
// assert.notStrictEqual(NaN, NaN); // throws an error
````

### `assert.deepEqual(actual, expected, [message: string | Error]);`

Deep equality check.

````js
assert.deepEqual({ a: 1 }, { a: 1 }); // passes
assert.deepEqual([1, 2], [1, 2]); // passes
// assert.deepEqual({ a: 1 }, { a: 2 }); // throws an error
````

### `assert.notDeepEqual(actual, expected, [message: string | Error]);`

Inverse of `deepEqual(actual, expected, [message: string | Error]);`.

````js
assert.notDeepEqual({ a: 1 }, { a: 2 }); // passes
// assert.notDeepEqual({ a: 1 }, { a: 1 }); // throws an error
````

---

## Exception Assertions

### `assert.throws(fn, [ErrorType|string|RegExp], [message: string | Error]);`

Checks that a function __throws__.

````js
assert.throws(() => { throw new TypeError("oops"); }, TypeError); // passes
assert.throws(() => { throw new Error("boom"); }, /boom/); // passes
// assert.throws(() => 42); // did not throw
````

### `await assert.rejects(asyncFnOrPromise, [ErrorType|string|RegExp], [message: string | Error]);`

Checks that an async function or promise __rejects__.

````js
await assert.rejects(async () => { throw new Error("fail"); }, /fail/);  // passes
// await assert.rejects(async () => 42); // resolved, didn’t reject
````

### `await assert.doesNotReject(asyncFnOrPromise, [ErrorType|string|RegExp], [message: string | Error]);`

Ensures an async function or promise __resolves__ (does *not* reject).

````js
await assert.doesNotReject(async () => 42); // passes
// await assert.doesNotReject(async () => { throw new Error("oops"); }); // throws an error
````

---

## Boolean Assertions

### `assert.notOk(value, [message: string | Error]);`

Ensures a value is falsy.

````js
assert.notOk(0); // passes
assert.notOk(""); // passes
// assert.notOk(true); // throws an error
````

### `assert.isTrue(value, [message: string | Error]);`

Ensures value is exactly `true`.

````js
assert.isTrue(true); // passes
// assert.isTrue(1); // throws an error
````

### `assert.isFalse(value, [message: string | Error]);`

Ensures value is exactly `false`.

````js
assert.isFalse(false); // passes
// assert.isFalse(0); // throws an error
````

---

## Type Assertions

### `assert.is(value, expectedType, [message: string | Error]);`

Ensures a value matches a type or constructor. The expected type can be a string, function or an array of strings and functions.

````js
assert.is(123, "number"); // passes
assert.is([], Array); // passes
assert.is(new Map(), [Map, Object]); // passes
// assert.is("hi", Number); // throws an error
````

### `assert.isNot(value, expectedType, [message: string | Error]);`

Inverse of `is(value, expectedType, [message: string | Error]);`. The expected type can be a string, function or an array of strings and functions.

````js
assert.isNot("hello", Number); // passes
assert.isNot([], Set); // passes
// assert.isNot([], Array); // throws an error
````

---

## Nullish Assertions

### `assert.isNullish(value, [message: string | Error]);`

Ensures value is `null` or `undefined`.

````js
assert.isNullish(undefined); // passes
assert.isNullish(null); // passes
// assert.isNullish(0); // throws an error
````

### `assert.isNotNullish(value, [message: string | Error]);`

Ensures value is *not* `null` or `undefined`.

````js
assert.isNotNullish(42); // passes
assert.isNotNullish("ok"); // passes
// assert.isNotNullish(null); // throws an error
````

---

## String Assertions

### `assert.match(string, regexp, [message: string | Error]);`

Ensures a string matches a regular expression.

````js
assert.match("hello world", /world/); // passes
// assert.match("hello", /bye/); // throws an error
````

### `assert.stringContains(actual, substring, [message: string | Error]);`

Ensures a string contains a substring.

````js
assert.stringContains("hello world", "world"); // passes
// assert.stringContains("hello", "z"); // throws an error
````

### `assert.stringNotContains(actual, substring, [message: string | Error]);`

Ensures a string *does not* contain a substring.

````js
assert.stringNotContains("hello", "z"); // passes
// assert.stringNotContains("hello", "he"); // throws an error
````

---

## Comparison Assertions

### `assert.lt(value1, value2, [message: string | Error]);`

Checks `a < b`.

````js
assert.lt(3, 5); // passes
// assert.lt(5, 3); // throws an error
````

### `assert.lte(value1, value2, [message: string | Error]);`

Checks `a <= b`.

````js
assert.lte(3, 3); // passes
assert.lte(2, 4); // passes
// assert.lte(5, 3); // throws an error
````

### `assert.gt(value1, value2, [message: string | Error]);`

Checks `a > b`.

````js
assert.gt(5, 3); // passes
// assert.gt(3, 5); // throws an error
````

### `assert.gte(value1, value2, [message: string | Error]);`

Checks `a >= b`.

````js
assert.gte(3, 3); // passes
assert.gte(5, 3); // passes
// assert.gte(2, 3); // throws an error
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
