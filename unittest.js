// @ts-nocheck
"use strict";


/* assert.js v1.0.1 testcases for ESM environment */


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
    } catch (_e) { result = true; }
  } else {
    try {
      callback();
      result = true;
    } catch (_e) { result = false; }
  }
  if (!result) { alert(message); }
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
  } catch (/** @type any */ e) {
    unitTest("assert.AssertionError 01", false,
      () => assert.is(e, assert.AssertionError)
    );
  }

  if (assert.testCheck(assert.testSync(() => 42))) {
    /* alert("testSync(); 01 - passed"); */
  } else {
    alert("testSync(); 01 - failed");
  }

  if (assert.testCheck(assert.testSync(function () { throw new Error("lorem"); }))) {
    alert("testSync(); 02 - failed");
  } else {
    /* alert("testSync(); 02 - passed"); */
  }

  unitTest("assert.includes(); 01a", true, () => assert.includes("lorem", 42));
  unitTest("assert.includes(); 01b", true, () => assert.includes("lorem", 42, "lorem"));

  unitTest("assert.includes(); 02", true, () => assert.includes(null, {keyOrValue: "a"}));
  unitTest("assert.includes(); 03", true, () => assert.includes(undefined, {keyOrValue: "a"}));
  unitTest("assert.includes(); 04", true, () => assert.includes(42, {keyOrValue: "a"}));

  unitTest("assert.includes(); 05", false, () => assert.includes({"a": 1, "b": 2}, {keyOrValue: "a"}));
  unitTest("assert.includes(); 06", false, () => assert.includes({"a": 1, "b": 2}, {keyOrValue: "a", value: 1}));
  unitTest("assert.includes(); 07", true, () => assert.includes({"a": 1, "b": 2}, {keyOrValue: "a", value: 2}));
  unitTest("assert.includes(); 08", true, () => assert.includes({"a": 1, "b": 2}, {keyOrValue: "c"}));
  unitTest("assert.includes(); 09", true, () => assert.includes({"a": 1, "b": 2}, {keyOrValue: "c", value: 3}));

  unitTest("assert.includes(); 10", false, () => assert.includes([1, 2, 3], {keyOrValue: 3}));
  unitTest("assert.includes(); 11", true, () => assert.includes([1, 2, 3], {keyOrValue: 4}));

  unitTest("assert.includes(); 12", false, () => assert.includes(new Int8Array([1, 2, 3]), {keyOrValue: 3}));
  unitTest("assert.includes(); 13", true, () => assert.includes(new Int8Array([1, 2, 3]), {keyOrValue: 4}));

  let testMapIncludes = new Map([["x", 42]]);
  unitTest("assert.includes(); 14", false, () => assert.includes(testMapIncludes, {keyOrValue: "x"}));
  unitTest("assert.includes(); 15", false, () => assert.includes(testMapIncludes, {keyOrValue: "x", value: 42}));
  unitTest("assert.includes(); 16", true, () => assert.includes(testMapIncludes, {keyOrValue: "x", value: 43}));
  unitTest("assert.includes(); 17", true, () => assert.includes(testMapIncludes, {keyOrValue: "y"}));
  unitTest("assert.includes(); 18", true, () => assert.includes(testMapIncludes, {keyOrValue: "y", value: 42}));

  let testWeakMapIncludes = new WeakMap();
  let testWeakMapObjectIncludes = {};
  testWeakMapIncludes.set(testWeakMapObjectIncludes, 10);
  unitTest("assert.includes(); 19", false, () => assert.includes(testWeakMapIncludes, {keyOrValue: testWeakMapObjectIncludes}));
  unitTest("assert.includes(); 20", false, () => assert.includes(testWeakMapIncludes, {keyOrValue: testWeakMapObjectIncludes, value: 10}));
  unitTest("assert.includes(); 21", true, () => assert.includes(testWeakMapIncludes, {keyOrValue: testWeakMapObjectIncludes, value: 20}));
  unitTest("assert.includes(); 22", true, () => assert.includes(testWeakMapIncludes, {keyOrValue: {}}));
  unitTest("assert.includes(); 23", true, () => assert.includes(testWeakMapIncludes, {keyOrValue: {}, value: 10}));
  unitTest("assert.includes(); 24", true, () => assert.includes(testWeakMapIncludes, {keyOrValue: {}, value: 20}));

  unitTest("assert.includes(); 25", false, () => assert.includes(new Set([1, 2, 3]), {keyOrValue: 3}));
  unitTest("assert.includes(); 26", true, () => assert.includes(new Set([1, 2, 3]), {keyOrValue: 4}));

  let testWeakSetIncludes = new WeakSet();
  let testWeakSetObjectIncludes = {};
  testWeakSetIncludes.add(testWeakSetObjectIncludes);
  unitTest("assert.includes(); 27", false, () => assert.includes(testWeakSetIncludes, {keyOrValue: testWeakSetObjectIncludes}));
  unitTest("assert.includes(); 28", true, () => assert.includes(testWeakSetIncludes, {keyOrValue: {}}));

  unitTest("assert.includes(); 29", false, () => assert.includes([1, 2, 3].values(), {keyOrValue: 3}));
  unitTest("assert.includes(); 30", true, () => assert.includes([1, 2, 3].values(), {keyOrValue: 4}));

  unitTest("assert.includes(); 31", false, () => assert.includes("lorem ipsum", {keyOrValue: "lorem"}));
  unitTest("assert.includes(); 32", true, () => assert.includes("lorem ipsum", {keyOrValue: "42"}));

  unitTest("assert.includes(); 33", false, () => assert.includes(Object("lorem ipsum"), {keyOrValue: "lorem"}));
  unitTest("assert.includes(); 34", true, () => assert.includes(Object("lorem ipsum"), {keyOrValue: "42"}));

  unitTest("assert.doesNotInclude(); 01a", true, () => assert.doesNotInclude("lorem", 42));
  unitTest("assert.doesNotInclude(); 01b", true, () => assert.doesNotInclude("lorem", 42), "lorem");

  unitTest("assert.doesNotInclude(); 02", false, () => assert.doesNotInclude(null, {keyOrValue: "a"}));
  unitTest("assert.doesNotInclude(); 03", false, () => assert.doesNotInclude(undefined, {keyOrValue: "a"}));
  unitTest("assert.doesNotInclude(); 04", false, () => assert.doesNotInclude(42, {keyOrValue: "a"}));

  unitTest("assert.doesNotInclude(); 05", true, () => assert.doesNotInclude({"a": 1, "b": 2}, {keyOrValue: "a"}));
  unitTest("assert.doesNotInclude(); 06", true, () => assert.doesNotInclude({"a": 1, "b": 2}, {keyOrValue: "a", value: 1}));
  unitTest("assert.doesNotInclude(); 07", false, () => assert.doesNotInclude({"a": 1, "b": 2}, {keyOrValue: "a", value: 2}));
  unitTest("assert.doesNotInclude(); 08", false, () => assert.doesNotInclude({"a": 1, "b": 2}, {keyOrValue: "c"}));
  unitTest("assert.doesNotInclude(); 09", false, () => assert.doesNotInclude({"a": 1, "b": 2}, {keyOrValue: "c", value: 3}));

  unitTest("assert.doesNotInclude(); 10", true, () => assert.doesNotInclude([1, 2, 3], {keyOrValue: 3}));
  unitTest("assert.doesNotInclude(); 11", false, () => assert.doesNotInclude([1, 2, 3], {keyOrValue: 4}));

  unitTest("assert.doesNotInclude(); 12", true, () => assert.doesNotInclude(new Int8Array([1, 2, 3]), {keyOrValue: 3}));
  unitTest("assert.doesNotInclude(); 13", false, () => assert.doesNotInclude(new Int8Array([1, 2, 3]), {keyOrValue: 4}));

  testMapIncludes = new Map([["x", 42]]);
  unitTest("assert.doesNotInclude(); 14", true, () => assert.doesNotInclude(testMapIncludes, {keyOrValue: "x"}));
  unitTest("assert.doesNotInclude(); 15", true, () => assert.doesNotInclude(testMapIncludes, {keyOrValue: "x", value: 42}));
  unitTest("assert.doesNotInclude(); 16", false, () => assert.doesNotInclude(testMapIncludes, {keyOrValue: "x", value: 43}));
  unitTest("assert.doesNotInclude(); 17", false, () => assert.doesNotInclude(testMapIncludes, {keyOrValue: "y"}));
  unitTest("assert.doesNotInclude(); 18", false, () => assert.doesNotInclude(testMapIncludes, {keyOrValue: "y", value: 42}));

  testWeakMapIncludes = new WeakMap();
  testWeakMapObjectIncludes = {};
  testWeakMapIncludes.set(testWeakMapObjectIncludes, 10);
  unitTest("assert.doesNotInclude(); 19", true, () => assert.doesNotInclude(testWeakMapIncludes, {keyOrValue: testWeakMapObjectIncludes}));
  unitTest("assert.doesNotInclude(); 20", true, () => assert.doesNotInclude(testWeakMapIncludes, {keyOrValue: testWeakMapObjectIncludes, value: 10}));
  unitTest("assert.doesNotInclude(); 21", false, () => assert.doesNotInclude(testWeakMapIncludes, {keyOrValue: testWeakMapObjectIncludes, value: 20}));
  unitTest("assert.doesNotInclude(); 22", false, () => assert.doesNotInclude(testWeakMapIncludes, {keyOrValue: {}}));
  unitTest("assert.doesNotInclude(); 23", false, () => assert.doesNotInclude(testWeakMapIncludes, {keyOrValue: {}, value: 10}));
  unitTest("assert.doesNotInclude(); 24", false, () => assert.doesNotInclude(testWeakMapIncludes, {keyOrValue: {}, value: 20}));

  unitTest("assert.doesNotInclude(); 25", true, () => assert.doesNotInclude(new Set([1, 2, 3]), {keyOrValue: 3}));
  unitTest("assert.doesNotInclude(); 26", false, () => assert.doesNotInclude(new Set([1, 2, 3]), {keyOrValue: 4}));

  testWeakSetIncludes = new WeakSet();
  testWeakSetObjectIncludes = {};
  testWeakSetIncludes.add(testWeakSetObjectIncludes);
  unitTest("assert.doesNotInclude(); 27", true, () => assert.doesNotInclude(testWeakSetIncludes, {keyOrValue: testWeakSetObjectIncludes}));
  unitTest("assert.doesNotInclude(); 28", false, () => assert.doesNotInclude(testWeakSetIncludes, {keyOrValue: {}}));

  unitTest("assert.doesNotInclude(); 29", true, () => assert.doesNotInclude([1, 2, 3].values(), {keyOrValue: 3}));
  unitTest("assert.doesNotInclude(); 30", false, () => assert.doesNotInclude([1, 2, 3].values(), {keyOrValue: 4}));

  unitTest("assert.doesNotInclude(); 31", true, () => assert.doesNotInclude("lorem ipsum", {keyOrValue: "lorem"}));
  unitTest("assert.doesNotInclude(); 32", false, () => assert.doesNotInclude("lorem ipsum", {keyOrValue: "42"}));

  unitTest("assert.doesNotInclude(); 33", true, () => assert.doesNotInclude(Object("lorem ipsum"), {keyOrValue: "lorem"}));
  unitTest("assert.doesNotInclude(); 34", false, () => assert.doesNotInclude(Object("lorem ipsum"), {keyOrValue: "42"}));

  unitTest("assert.isNull(); 01", false, () => assert.isNull(null));
  unitTest("assert.isNull(); 02", true, () => assert.isNull(42));
  unitTest("assert.isNull(); 03", true, () => assert.isNull(42, "foo"));

  unitTest("assert.isNotNull(); 01", false, () => assert.isNotNull(42));
  unitTest("assert.isNotNull(); 02", true, () => assert.isNotNull(null));
  unitTest("assert.isNotNull(); 03", true, () => assert.isNotNull(null, "foo"));

  unitTest("assert.isUndefined(); 01", false, () => assert.isUndefined(undefined));
  unitTest("assert.isUndefined(); 02", true, () => assert.isUndefined(42));
  unitTest("assert.isUndefined(); 03", true, () => assert.isUndefined(42, "foo"));

  unitTest("assert.isNotUndefined(); 01", false, () => assert.isNotUndefined(42));
  unitTest("assert.isNotUndefined(); 02", true, () => assert.isNotUndefined(undefined));
  unitTest("assert.isNotUndefined(); 03", true, () => assert.isNotUndefined(undefined, "foo"));

  unitTest("assert.isString(); 01", false, () => assert.isString("bar"));
  unitTest("assert.isString(); 02", true, () => assert.isString(42));
  unitTest("assert.isString(); 03", true, () => assert.isString(42, "foo"));

  unitTest("assert.isNotString(); 01", false, () => assert.isNotString(42));
  unitTest("assert.isNotString(); 02", true, () => assert.isNotString("bar"));
  unitTest("assert.isNotString(); 03", true, () => assert.isNotString("bar", "foo"));

  unitTest("assert.isNumber(); 01", false, () => assert.isNumber(42));
  unitTest("assert.isNumber(); 02", true, () => assert.isNumber(null));
  unitTest("assert.isNumber(); 03", true, () => assert.isNumber(null, "foo"));

  unitTest("assert.isNotNumber(); 01", false, () => assert.isNotNumber(null));
  unitTest("assert.isNotNumber(); 02", true, () => assert.isNotNumber(42));
  unitTest("assert.isNotNumber(); 03", true, () => assert.isNotNumber(42, "foo"));

  unitTest("assert.isBigInt(); 01", false, () => assert.isBigInt(42n));
  unitTest("assert.isBigInt(); 02", true, () => assert.isBigInt(null));
  unitTest("assert.isBigInt(); 03", true, () => assert.isBigInt(null, "foo"));

  unitTest("assert.isNotBigInt(); 01", false, () => assert.isNotBigInt(null));
  unitTest("assert.isNotBigInt(); 02", true, () => assert.isNotBigInt(42n));
  unitTest("assert.isNotBigInt(); 03", true, () => assert.isNotBigInt(42n, "foo"));

  unitTest("assert.isBoolean(); 01", false, () => assert.isBoolean(true));
  unitTest("assert.isBoolean(); 02", true, () => assert.isBoolean(null));
  unitTest("assert.isBoolean(); 03", true, () => assert.isBoolean(null, "foo"));

  unitTest("assert.isNotBoolean(); 01", false, () => assert.isNotBoolean(null));
  unitTest("assert.isNotBoolean(); 02", true, () => assert.isNotBoolean(true));
  unitTest("assert.isNotBoolean(); 03", true, () => assert.isNotBoolean(false, "foo"));

  unitTest("assert.isSymbol(); 01", false, () => assert.isSymbol(Symbol(42)));
  unitTest("assert.isSymbol(); 02", true, () => assert.isSymbol(null));
  unitTest("assert.isSymbol(); 03", true, () => assert.isSymbol(null, "foo"));

  unitTest("assert.isNotSymbol(); 01", false, () => assert.isNotSymbol(42));
  unitTest("assert.isNotSymbol(); 02", true, () => assert.isNotSymbol(Symbol(42)));
  unitTest("assert.isNotSymbol(); 03", true, () => assert.isNotSymbol(Symbol(42), "foo"));

  unitTest("assert.isFunction(); 01", false, () => assert.isFunction(() => {}));
  unitTest("assert.isFunction(); 02", true, () => assert.isFunction(null));
  unitTest("assert.isFunction(); 03", true, () => assert.isFunction(null, "foo"));

  unitTest("assert.isNotFunction(); 01", false, () => assert.isNotFunction(null));
  unitTest("assert.isNotFunction(); 02", true, () => assert.isNotFunction(() => {}));
  unitTest("assert.isNotFunction(); 03", true, () => assert.isNotFunction(() => {}, "foo"));

  unitTest("assert.isObject(); 01", false, () => assert.isObject({}));
  unitTest("assert.isObject(); 02", true, () => assert.isObject(null));
  unitTest("assert.isObject(); 03", true, () => assert.isObject(42, "foo"));

  unitTest("assert.isNotObject(); 01", false, () => assert.isNotObject(null));
  unitTest("assert.isNotObject(); 02", true, () => assert.isNotObject({}));
  unitTest("assert.isNotObject(); 03", true, () => assert.isNotObject({}, "foo"));

  unitTest("assert.isPrimitive(); 01", false, () => assert.isPrimitive(null));
  unitTest("assert.isPrimitive(); 02", false, () => assert.isPrimitive(undefined));
  unitTest("assert.isPrimitive(); 03", false, () => assert.isPrimitive(""));
  unitTest("assert.isPrimitive(); 04", false, () => assert.isPrimitive(42));
  unitTest("assert.isPrimitive(); 05", false, () => assert.isPrimitive(42n));
  unitTest("assert.isPrimitive(); 06", false, () => assert.isPrimitive(true));
  unitTest("assert.isPrimitive(); 07", false, () => assert.isPrimitive(Symbol(42)));
  unitTest("assert.isPrimitive(); 08", true, () => assert.isPrimitive(() => {}));
  unitTest("assert.isPrimitive(); 09", true, () => assert.isPrimitive({}));

  unitTest("assert.isNotPrimitive(); 01", true, () => assert.isNotPrimitive(null));
  unitTest("assert.isNotPrimitive(); 02", true, () => assert.isNotPrimitive(undefined));
  unitTest("assert.isNotPrimitive(); 03", true, () => assert.isNotPrimitive(""));
  unitTest("assert.isNotPrimitive(); 04", true, () => assert.isNotPrimitive(42));
  unitTest("assert.isNotPrimitive(); 05", true, () => assert.isNotPrimitive(42n));
  unitTest("assert.isNotPrimitive(); 06", true, () => assert.isNotPrimitive(true));
  unitTest("assert.isNotPrimitive(); 07", true, () => assert.isNotPrimitive(Symbol(42)));
  unitTest("assert.isNotPrimitive(); 08", false, () => assert.isNotPrimitive(() => {}));
  unitTest("assert.isNotPrimitive(); 09", false, () => assert.isNotPrimitive({}));

  unitTest("assert.isEmpty(); 01", false, () => assert.isEmpty(null));
  unitTest("assert.isEmpty(); 02", false, () => assert.isEmpty(undefined));
  unitTest("assert.isEmpty(); 03", false, () => assert.isEmpty(NaN));
  unitTest("assert.isEmpty(); 04", false, () => assert.isEmpty([]));
  unitTest("assert.isEmpty(); 05", false, () => assert.isEmpty(new Uint16Array()));
  unitTest("assert.isEmpty(); 06", false, () => assert.isEmpty(""));
  unitTest("assert.isEmpty(); 07", false, () => assert.isEmpty(new Map()));
  unitTest("assert.isEmpty(); 08", false, () => assert.isEmpty(new Set()));
  unitTest("assert.isEmpty(); 09", false, () => assert.isEmpty(new ArrayBuffer()));
  unitTest("assert.isEmpty(); 10", false, () => assert.isEmpty(new DataView(new ArrayBuffer())));
  unitTest("assert.isEmpty(); 11", false, () => assert.isEmpty([].values()));
  unitTest("assert.isEmpty(); 12", false, () => assert.isEmpty({}));

  unitTest("assert.isEmpty(); 14", true, () => assert.isEmpty(42));
  unitTest("assert.isEmpty(); 15", true, () => assert.isEmpty([42]));
  unitTest("assert.isEmpty(); 16", true, () => assert.isEmpty(new Uint16Array([1,2])));
  unitTest("assert.isEmpty(); 17", true, () => assert.isEmpty("foo"));
  // @ts-ignore
  unitTest("assert.isEmpty(); 18", true, () => assert.isEmpty(new Map([[1, 2]])));
  unitTest("assert.isEmpty(); 19", true, () => assert.isEmpty(new Set([1,2])));
  unitTest("assert.isEmpty(); 20", true, () => assert.isEmpty(new ArrayBuffer(2)));
  unitTest("assert.isEmpty(); 21", true, () => assert.isEmpty(new DataView(new ArrayBuffer(2))));
  unitTest("assert.isEmpty(); 22", true, () => assert.isEmpty([1,2].values()));
  unitTest("assert.isEmpty(); 23", true, () => assert.isEmpty({"a": 1}));

  unitTest("assert.isNotEmpty(); 01", true, () => assert.isNotEmpty(null));
  unitTest("assert.isNotEmpty(); 02", true, () => assert.isNotEmpty(undefined));
  unitTest("assert.isNotEmpty(); 03", true, () => assert.isNotEmpty(NaN));
  unitTest("assert.isNotEmpty(); 04", true, () => assert.isNotEmpty([]));
  unitTest("assert.isNotEmpty(); 05", true, () => assert.isNotEmpty(new Uint16Array()));
  unitTest("assert.isNotEmpty(); 06", true, () => assert.isNotEmpty(""));
  unitTest("assert.isNotEmpty(); 07", true, () => assert.isNotEmpty(new Map()));
  unitTest("assert.isNotEmpty(); 08", true, () => assert.isNotEmpty(new Set()));
  unitTest("assert.isNotEmpty(); 09", true, () => assert.isNotEmpty(new ArrayBuffer()));
  unitTest("assert.isNotEmpty(); 10", true, () => assert.isNotEmpty(new DataView(new ArrayBuffer())));
  unitTest("assert.isNotEmpty(); 11", true, () => assert.isNotEmpty([].values()));
  unitTest("assert.isNotEmpty(); 12", true, () => assert.isNotEmpty({}));

  unitTest("assert.isNotEmpty(); 14", false, () => assert.isNotEmpty(42));
  unitTest("assert.isNotEmpty(); 15", false, () => assert.isNotEmpty([42]));
  unitTest("assert.isNotEmpty(); 16", false, () => assert.isNotEmpty(new Uint16Array([1,2])));
  unitTest("assert.isNotEmpty(); 17", false, () => assert.isNotEmpty("foo"));
  // @ts-ignore
  unitTest("assert.isNotEmpty(); 18", false, () => assert.isNotEmpty(new Map([[1, 2]])));
  unitTest("assert.isNotEmpty(); 19", false, () => assert.isNotEmpty(new Set([1,2])));
  unitTest("assert.isNotEmpty(); 20", false, () => assert.isNotEmpty(new ArrayBuffer(2)));
  unitTest("assert.isNotEmpty(); 21", false, () => assert.isNotEmpty(new DataView(new ArrayBuffer(2))));
  unitTest("assert.isNotEmpty(); 22", false, () => assert.isNotEmpty([1,2].values()));
  unitTest("assert.isNotEmpty(); 23", false, () => assert.isNotEmpty({"a": 1}));

  alert("End of the sync test.");
}


async function autoTestAsync () {

  // Passes: resolves successfully
  await assert.rejects(
    async () => { throw new TypeError("lorem error"); },
    TypeError
  )
    .then(() => { /* alert("rejects(); 01 - Caught expected TypeError"); */ })
    .catch((/** @type any */ _e) => { alert("rejects(); 02 - bug"); });

  // Passes: resolves successfully
  await assert.rejects(Promise.reject(new Error("ipsum error")), /ipsum/i)
    .then(() => { /* console.log("rejects(); 02 - passed - Caught expected Error"); */ })
    .catch((e) => { console.error("rejects(); 02 - bug"); });

  // Fails: does not reject
  await assert.rejects(async () => 42)
    .then(() => { /* alert("rejects(); 03 - passed"); */ })
    .catch((/** @type any */ _e) => { alert("rejects(); 03 - bug"); });

  // Passes: resolves successfully
  await assert.doesNotReject(async () => 42)
    .then(() => { /*alert("doesNotReject(); 01 - passed"); */})
    .catch((/** @type any */ _e) => { alert("doesNotReject(); 01 - bug"); });

  // Fails: rejects unexpectedly
  await assert.doesNotReject(async () => { throw new Error("boom"); })
    .then(() => { alert("doesNotReject(); 02 - bug"); })
    .catch((/** @type any */ _e) => { /* alert("doesNotReject(); 02 - passed"); */ });

  // Fails: rejects with disallowed error type/message
  await assert.doesNotReject(
    async () => { throw new TypeError("Bad type"); },
    TypeError,
    "Unexpected TypeError"
  )
    .then(() => { alert("doesNotReject(); 03 - bug"); })
    .catch((/** @type any */ _e) => { /* alert("doesNotReject(); 03 - passed"); */ });

  (async () => {
    const result = await assert.testAsync(async function () { return 42; });
    if (assert.testCheck(result)) {
      /* alert("testAsync(); 01 - passed"); */
    } else {
      alert("testAsync(); 01 - failed");
    }
  })();

  (async () => {
    const result = await assert.testAsync(async function () { throw new Error("lorem"); });
    if (assert.testCheck(result)) {
      alert("testAsync(); 02 - failed");
    } else {
      /* alert("testAsync(); 02 - passed"); */
    }
  })();

  alert("End of the async test.");
}
