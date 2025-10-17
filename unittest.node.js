// @ts-check
"use strict";


/* assert.js v1.0.0 testcases for Node.js environment */


// Import the assert function
import assert from "./assert.js";
globalThis.assert = assert;

// import the defaultExport object
//import defaultExport from "./assert.js";
//globalThis.assert = defaultExport;


/**
 * @description A simple unit test function.
 *
 * @param {string} message - The message to display on failure
 * @param {boolean} error - Whether an error is expected
 * @param {function} callback - The function to test
 */
function unitTest (message, error = false, callback) {
  /** @type {boolean} */
  let result;
  if (error) {
    try {
      callback();
      result = false;
    } catch (/** @type any */ _e) { result = true; }
  } else {
    try {
      callback();
      result = true;
    } catch (/** @type any */ _e) { result = false; }
  }
  if (!result) { console.error(message); }
}


function autoTestSync () {

  unitTest("assert(); 01", false, () => assert(true));
  unitTest("assert(); 02", true, () => assert(false));
  unitTest("assert(); 03", true, () => assert(false, "should be true"));

  unitTest("assert.ok(); 01", false, () => assert.ok(true));
  unitTest("assert.ok(); 02", true, () => assert.ok(false));
  unitTest("assert.ok(); 03", true, () => assert.ok(false, "should be true"));

  unitTest("assert.fail(); 01", true, () => assert.fail(new Error("lorem")));
  unitTest("assert.fail(); 02", true, () => assert.fail("This should fail"));

  unitTest("assert.equal(); 01", false, () => assert.equal(1, "1"));
  unitTest("assert.equal(); 02", false, () => assert.equal(true, 1));
  unitTest("assert.equal(); 03", true, () => assert.equal(1, 2));
  unitTest("assert.equal(); 04", true, () => assert.equal(1, 2, "lorem"));

  unitTest("assert.notEqual(); 01", false, () => assert.notEqual(1, 2));
  unitTest("assert.notEqual(); 01", true, () => assert.notEqual(1, "1"));
  unitTest("assert.notEqual(); 01", true, () => assert.notEqual(1, "1", "lorem"));

  unitTest("assert.strictEqual(); 01", false, () => assert.strictEqual(1, 1));
  unitTest("assert.strictEqual(); 02", false, () => assert.strictEqual(NaN, NaN));
  unitTest("assert.strictEqual(); 03", true, () => assert.strictEqual(1, "1"));
  unitTest("assert.strictEqual(); 04", true,
    () => assert.strictEqual(1, "1", "lorem")
  );

  unitTest("assert.notStrictEqual(); 01", false, () => assert.notStrictEqual(1, "1"));
  unitTest("assert.notStrictEqual(); 02", true,
    () => assert.notStrictEqual(NaN, NaN)
  );
  unitTest("assert.notStrictEqual(); 03", true,
    () => assert.notStrictEqual(NaN, NaN, "lorem")
  );

  unitTest("assert.deepEqual(); 01", false,
    () => assert.deepEqual({ a: 1 }, { a: 1 })
  );
  unitTest("assert.deepEqual(); 02", false,
    () => assert.deepEqual([1, 2], [1, 2])
  );
  unitTest("assert.deepEqual(); 01", true,
    () => assert.deepEqual({ a: 1 }, { a: 2 })
  );
  unitTest("assert.deepEqual(); 01", true,
    () => assert.deepEqual({ a: 1 }, { a: 2 }, "lorem")
  );

  unitTest("assert.notDeepEqual(); 01", false,
    () => assert.notDeepEqual({ a: 1 }, { a: 2 })
  );
  unitTest("assert.notDeepEqual(); 01", true,
    () => assert.notDeepEqual({ a: 1 }, { a: 1 })
  );
  unitTest("assert.notDeepEqual(); 01", true,
    () => assert.notDeepEqual({ a: 1 }, { a: 1 }, "lorem")
  );

  unitTest("assert.throws(); 01", false,
    () => assert.throws(() => { throw new TypeError("oops"); }, TypeError)
  );
  unitTest("assert.throws(); 02", false,
    () => assert.throws(() => { throw new Error("boom"); }, /boom/)
  );
  unitTest("assert.throws(); 03", true, () => assert.throws(() => 42));
  unitTest("assert.throws(); 04", true, () => assert.throws(() => 42, "lorem"));

  unitTest("assert.notOk(); 01", false, () => assert.notOk(0));
  unitTest("assert.notOk(); 02", false, () => assert.notOk(""));
  unitTest("assert.notOk(); 03", true, () => assert.notOk(true));
  unitTest("assert.notOk(); 04", true, () => assert.notOk(true, "lorem"));

  unitTest("assert.isTrue(); 01", false, () => assert.isTrue(true));
  unitTest("assert.isTrue(); 02", true, () => assert.isTrue(1));
  unitTest("assert.isTrue(); 03", true, () => assert.isTrue(1, "lorem"));

  unitTest("assert.isFalse(); 01", false, () => assert.isFalse(false));
  unitTest("assert.isFalse(); 02", true, () => assert.isFalse(0));
  unitTest("assert.isFalse(); 03", true, () => assert.isFalse(0, "lorem"));

  unitTest("assert.is(); 01", false, () => assert.is(123, "number"));
  unitTest("assert.is(); 02", false, () => assert.is([], Array));
  unitTest("assert.is(); 03", false, () => assert.is(new Map(), [Object, Map]));
  unitTest("assert.is(); 04", true, () => assert.is("hi", Number));
  unitTest("assert.is(); 05", true, () => assert.is("hi", Number, "lorem"));
  unitTest("assert.is(); 06", true, () => assert.is("hi", [Number, Map], "lorem"));

  unitTest("assert.isNot(); 01", false, () => assert.isNot("hello", Number));
  unitTest("assert.isNot(); 02", false, () => assert.isNot([], Set));
  unitTest("assert.isNot(); 02", false, () => assert.isNot([], [Set, "boolean"]));
  unitTest("assert.isNot(); 03", true, () => assert.isNot([], Array));
  unitTest("assert.isNot(); 03", true, () => assert.isNot([], ["string", Array]));
  unitTest("assert.isNot(); 04", true, () => assert.isNot([], Array, "lorem"));

  unitTest("assert.isNullish(); 01", false, () => assert.isNullish(undefined));
  unitTest("assert.isNullish(); 02", false, () => assert.isNullish(null));
  unitTest("assert.isNullish(); 03", true, () => assert.isNullish(0));
  unitTest("assert.isNullish(); 04", true, () => assert.isNullish(0, "lorem"));

  unitTest("assert.isNotNullish(); 01", false, () => assert.isNotNullish(42));
  unitTest("assert.isNotNullish(); 01", false, () => assert.isNotNullish("ok"));
  unitTest("assert.isNotNullish(); 01", true, () => assert.isNotNullish(undefined));
  unitTest("assert.isNotNullish(); 01", true, () => assert.isNotNullish(null));
  unitTest("assert.isNotNullish(); 01", true,
    () => assert.isNotNullish(null, "lorem")
  );

  unitTest("assert.match(); 01", false, () => assert.match("hello world", /world/));
  unitTest("assert.match(); 02", true, () => assert.match("hello", /bye/));
  unitTest("assert.match(); 03", true, () => assert.match("hello", /bye/, "lorem"));

  unitTest("assert.doesNotMatch(); 01", false,
    () => assert.doesNotMatch("hello", /bye/)
  );
  unitTest("assert.doesNotMatch(); 02", true,
    () => assert.doesNotMatch("hello world", /world/)
  );
  unitTest("assert.doesNotMatch(); 03", true,
    () => assert.doesNotMatch("hello world", /world/, "lorem")
  );

  unitTest("assert.stringContains(); 01", false,
    () => assert.stringContains("hello world", "world")
  );
  unitTest("assert.stringContains(); 02", true,
    () => assert.stringContains("hello", "z")
  );
  unitTest("assert.stringContains(); 03", true,
    () => assert.stringContains("hello", "z", "lorem")
  );

  unitTest("assert.stringNotContains(); 01", false,
    () => assert.stringNotContains("hello", "z")
  );
  unitTest("assert.stringNotContains(); 02", true,
    () => assert.stringNotContains("hello", "he")
  );
  unitTest("assert.stringNotContains(); 03", true,
    () => assert.stringNotContains("hello", "he", "lorem")
  );

  unitTest("assert.lt(); 01", false, () => assert.lt(3, 5));
  unitTest("assert.lt(); 02", true, () => assert.lt(5, 3));
  unitTest("assert.lt(); 03", true, () => assert.lt(5, 3, "lorem"));
  unitTest("assert.lt(); 04", true, () => assert.lt(5, true));
  unitTest("assert.lt(); 05", true, () => assert.lt(5, true, "lorem"));

  unitTest("assert.lte(); 01", false, () => assert.lte(3, 3));
  unitTest("assert.lte(); 02", false, () => assert.lte(2, 4));
  unitTest("assert.lte(); 03", true, () => assert.lte(5, 3));
  unitTest("assert.lte(); 04", true, () => assert.lte(5, 3, "lorem"));
  unitTest("assert.lte(); 05", true, () => assert.lte(5, true));
  unitTest("assert.lte(); 06", true, () => assert.lte(5, true, "lorem"));

  unitTest("assert.gt(); 01", false, () => assert.gt(5, 3));
  unitTest("assert.gt(); 02", true, () => assert.gt(3, 5));
  unitTest("assert.gt(); 03", true, () => assert.gt(3, 5, "lorem"));
  unitTest("assert.gt(); 04", true, () => assert.gt(5, true));
  unitTest("assert.gt(); 05", true, () => assert.gt(5, true, "lorem"));

  unitTest("assert.gte(); 01", false, () => assert.gte(3, 3));
  unitTest("assert.gte(); 02", false, () => assert.gte(4, 2));
  unitTest("assert.gte(); 03", true, () => assert.gte(3, 5));
  unitTest("assert.gte(); 04", true, () => assert.gte(3, 5, "lorem"));
  unitTest("assert.gte(); 05", true, () => assert.gte(5, true));
  unitTest("assert.gte(); 06", true, () => assert.gte(5, true, "lorem"));

  unitTest("assert.VERSION; 01", false,
    () => assert.stringContains(assert.VERSION, "assert.js v")
  );

  try {
    assert(false, "example");
  } catch (e) {
    unitTest("assert.AssertionError 01", false,
      () => assert.is(e, assert.AssertionError)
    );
  }

  if (assert.testCheck(assert.testSync(() => 42))) {
    /* console.log("testSync(); 01 - passed"); */
  } else {
    console.error("testSync(); 01 - failed");
  }

  if (assert.testCheck(assert.testSync(function () { throw new Error("lorem"); }))) {
    console.error("testSync(); 02 - failed");
  } else {
    /* console.log("testSync(); 02 - passed"); */
  }

  console.log("\nEnd of the sync test.\n");
}


autoTestSync();


async function autoTestAsync () {

  // Passes: resolves successfully
  await assert.rejects(
    async () => { throw new TypeError("lorem error"); },
    TypeError
  )
    .then(() => { /* console.log("rejects(); 01 - passed - Caught expected TypeError"); */ })
    .catch((/** @type any */ _e) => { console.error("rejects(); 02 - bug"); });

  // Passes: resolves successfully
  await assert.rejects(Promise.reject(new Error("ipsum error")), /ipsum/i)
    .then(() => { /* console.log("rejects(); 02 - passed - Caught expected Error"); */ })
    .catch((e) => { console.error("rejects(); 02 - bug"); });

  // Fails: does not reject
  await assert.rejects(async () => 42)
    .then(() => { /* console.log("rejects(); 03 - passed"); */ })
    .catch((/** @type any */ _e) => { console.error("rejects(); 03 - bug"); });

  // Passes: resolves successfully
  await assert.doesNotReject(async () => 42)
    .then(() => { /* console.log("doesNotReject(); 01 - passed"); */ })
    .catch((/** @type any */ _e) => { console.error("doesNotReject(); 01 - bug"); });

  // Fails: rejects unexpectedly
  await assert.doesNotReject(async () => { throw new Error("boom"); })
    .then(() => { console.error("doesNotReject(); 02 - bug"); })
    .catch((/** @type any */ _e) => { /* console.log("doesNotReject(); 02 - passed"); */ });

  // Fails: rejects with disallowed error type/message
  await assert.doesNotReject(
    async () => { throw new TypeError("lorem2 error"); },
    TypeError,
    "Unexpected TypeError"
  )
    .then(() => { console.error("doesNotReject(); 03 - bug"); })
    .catch((/** @type any */ _e) => { /* console.log("doesNotReject(); 03 - passed"); */ });

  (async () => {
    const result = await assert.testAsync(async function () { return 42; });
    if (assert.testCheck(result)) {
      /* console.log("testAsync(); 01 - passed"); */
    } else {
      console.error("testAsync(); 01 - failed");
    }
  })();

  (async () => {
    const result = await assert.testAsync(async function () { throw new Error("lorem"); });
    if (assert.testCheck(result)) {
      console.log("testAsync(); 02 - failed");
    } else {
      /* console.error("testAsync(); 02 - passed"); */
    }
  })();

  console.log("\nEnd of the async test.");
}


autoTestAsync();
