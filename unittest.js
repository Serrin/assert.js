
function testIsOK (message, callback) {
  try {
    let result = callback();
    if (result || result === undefined) { return true; } else { return false; }
  } catch (e) { return false; }
}

function testIsError (message, callback) {
  try {
    let result = callback();
    if (result) { return false; }
  } catch (e) { return true; }
  return false;
}

function test (message, error = false, callback) {
  if (error) {
    var res = testIsError(message, callback);
  } else {
    var res = testIsOK(message, callback);
  }
  if (!res) { alert(message); }
}

function autoTestSync () {

  test("assert(); 01", false, () => assert(true));
  test("assert(); 02", true, () => assert(false));
  test("assert(); 03", true, () => assert(false, "should be true"));

  test("assert.ok(); 01", false, () => assert.ok(true));
  test("assert.ok(); 02", true, () => assert.ok(false));
  test("assert.ok(); 03", true, () => assert.ok(false, "should be true"));

  test("assert.fail(); 01", true, () => assert.fail(new Error("lorem")));
  test("assert.fail(); 02", true, () => assert.fail("This should fail"));

  test("assert.equal(); 01", false, () => assert.equal(1, "1"));
  test("assert.equal(); 02", false, () => assert.equal(true, 1));
  test("assert.equal(); 03", true, () => assert.equal(1, 2));
  test("assert.equal(); 04", true, () => assert.equal(1, 2, "lorem"));

  test("assert.notEqual(); 01", false, () => assert.notEqual(1, 2));
  test("assert.notEqual(); 01", true, () => assert.notEqual(1, "1"));
  test("assert.notEqual(); 01", true, () => assert.notEqual(1, "1", "lorem"));

  test("assert.strictEqual(); 01", false, () => assert.strictEqual(1, 1));
  test("assert.strictEqual(); 02", false, () => assert.strictEqual(NaN, NaN));
  test("assert.strictEqual(); 03", true, () => assert.strictEqual(1, "1"));
  test("assert.strictEqual(); 04", true,
    () => assert.strictEqual((1, "1", "lorem"))
  );

  test("assert.notStrictEqual(); 01", false, () => assert.notStrictEqual(1, "1"));
  test("assert.notStrictEqual(); 02", true,
    () => assert.notStrictEqual(NaN, NaN)
  );
  test("assert.notStrictEqual(); 03", true,
    () => assert.notStrictEqual(NaN, NaN, "lorem")
  );

  test("assert.deepEqual(); 01", false,
    () => assert.deepEqual({ a: 1 }, { a: 1 })
  );
  test("assert.deepEqual(); 02", false,
    () => assert.deepEqual([1, 2], [1, 2])
  );
  test("assert.deepEqual(); 01", true,
    () => assert.deepEqual({ a: 1 }, { a: 2 })
  );
  test("assert.deepEqual(); 01", true,
    () => assert.deepEqual({ a: 1 }, { a: 2 }, "lorem")
  );

  test("assert.notDeepEqual(); 01", false,
    () => assert.notDeepEqual({ a: 1 }, { a: 2 })
  );
  test("assert.notDeepEqual(); 01", true,
    () => assert.notDeepEqual({ a: 1 }, { a: 1 })
  );
  test("assert.notDeepEqual(); 01", true,
    () => assert.notDeepEqual({ a: 1 }, { a: 1 }, "lorem")
  );

  test("assert.throws(); 01", false,
    () => assert.throws(() => { throw new TypeError("oops"); }, TypeError)
  );
  test("assert.throws(); 02", false,
    () => assert.throws(() => { throw new Error("boom"); }, /boom/)
  );
  test("assert.throws(); 03", true, () => assert.throws(() => 42));
  test("assert.throws(); 04", true, () => assert.throws(() => 42, "lorem"));

/*
await assert.rejects(async () => { throw new Error("fail"); }, /fail/);
// await assert.rejects(async () => 42); // ❌ resolved, didn’t reject
// await assert.rejects(async () => 42, "lorem"); // ❌ resolved, didn’t reject

await assert.doesNotReject(async () => 42); // ✅
// await assert.doesNotReject(async () => { throw new Error("oops"); }); // ❌
// await assert.doesNotReject(async () => { throw new Error("oops"); }, "lorem"); // ❌
*/

  test("assert.notOk(); 01", false, () => assert.notOk(0));
  test("assert.notOk(); 02", false, () => assert.notOk(""));
  test("assert.notOk(); 03", true, () => assert.notOk(true));
  test("assert.notOk(); 04", true, () => assert.notOk(true, "lorem"));

  test("assert.isTrue(); 01", false, () => assert.isTrue(true));
  test("assert.isTrue(); 02", true, () => assert.isTrue(1));
  test("assert.isTrue(); 03", true, () => assert.isTrue(1, "lorem"));

  test("assert.isFalse(); 01", false, () => assert.isFalse(false));
  test("assert.isFalse(); 02", true, () => assert.isFalse(0));
  test("assert.isFalse(); 03", true, () => assert.isFalse(0, "lorem"));

  test("assert.is(); 01", false, () => assert.is(123, "number"));
  test("assert.is(); 02", false, () => assert.is([], Array));
  test("assert.is(); 03", false, () => assert.is(new Map(), [Object, Map]));
  test("assert.is(); 04", true, () => assert.is("hi", Number));
  test("assert.is(); 05", true, () => assert.is("hi", Number, "lorem"));
  test("assert.is(); 06", true, () => assert.is("hi", [Number, Map], "lorem"));

  test("assert.isNot(); 01", false, () => assert.isNot("hello", Number));
  test("assert.isNot(); 02", false, () => assert.isNot([], Set));
  test("assert.isNot(); 02", false, () => assert.isNot([], [Set, "boolean"]));
  test("assert.isNot(); 03", true, () => assert.isNot([], Array));
  test("assert.isNot(); 03", true, () => assert.isNot([], ["string", Array]));
  test("assert.isNot(); 04", true, () => assert.isNot([], Array, "lorem"));

  test("assert.isNullish(); 01", false, () => assert.isNullish(undefined));
  test("assert.isNullish(); 02", false, () => assert.isNullish(null));
  test("assert.isNullish(); 03", true, () => assert.isNullish(0));
  test("assert.isNullish(); 04", true, () => assert.isNullish(0, "lorem"));

  test("assert.isNotNullish(); 01", false, () => assert.isNotNullish(42));
  test("assert.isNotNullish(); 01", false, () => assert.isNotNullish("ok"));
  test("assert.isNotNullish(); 01", true, () => assert.isNotNullish(undefined));
  test("assert.isNotNullish(); 01", true, () => assert.isNotNullish(null));
  test("assert.isNotNullish(); 01", true,
    () => assert.isNotNullish(null, "lorem")
  );

  test("assert.match(); 01", false, () => assert.match("hello world", /world/));
  test("assert.match(); 02", true, () => assert.match("hello", /bye/));
  test("assert.match(); 03", true, () => assert.match("hello", /bye/, "lorem"));

  test("assert.doesNotMatch(); 01", false,
    () => assert.doesNotMatch("hello", /bye/)
  );
  test("assert.doesNotMatch(); 02", true,
    () => assert.doesNotMatch("hello world", /world/)
  );
  test("assert.doesNotMatch(); 03", true,
    () => assert.doesNotMatch("hello world", /world/, "lorem")
  );

  test("assert.stringContains(); 01", false,
    () => assert.stringContains("hello world", "world")
  );
  test("assert.stringContains(); 02", true,
    () => assert.stringContains("hello", "z")
  );
  test("assert.stringContains(); 03", true,
    () => assert.stringContains("hello", "z", "lorem")
  );

  test("assert.stringNotContains(); 01", false,
    () => assert.stringNotContains("hello", "z")
  );
  test("assert.stringNotContains(); 02", true,
    () => assert.stringNotContains("hello", "he")
  );
  test("assert.stringNotContains(); 03", true,
    () => assert.stringNotContains("hello", "he", "lorem")
  );

  test("assert.lt(); 01", false, () => assert.lt(3, 5));
  test("assert.lt(); 02", true, () => assert.lt(5, 3));
  test("assert.lt(); 03", true, () => assert.lt(5, 3, "lorem"));
  test("assert.lt(); 04", true, () => assert.lt(5, true));
  test("assert.lt(); 05", true, () => assert.lt(5, true, "lorem"));

  test("assert.lte(); 01", false, () => assert.lte(3, 3));
  test("assert.lte(); 02", false, () => assert.lte(2, 4));
  test("assert.lte(); 03", true, () => assert.lte(5, 3));
  test("assert.lte(); 04", true, () => assert.lte(5, 3, "lorem"));
  test("assert.lte(); 05", true, () => assert.lte(5, true));
  test("assert.lte(); 06", true, () => assert.lte(5, true, "lorem"));

  test("assert.gt(); 01", false, () => assert.gt(5, 3));
  test("assert.gt(); 02", true, () => assert.gt(3, 5));
  test("assert.gt(); 03", true, () => assert.gt(3, 5, "lorem"));
  test("assert.gt(); 04", true, () => assert.gt(5, true));
  test("assert.gt(); 05", true, () => assert.gt(5, true, "lorem"));

  test("assert.gte(); 01", false, () => assert.gte(3, 3));
  test("assert.gte(); 02", false, () => assert.gte(4, 2));
  test("assert.gte(); 03", true, () => assert.gte(3, 5));
  test("assert.gte(); 04", true, () => assert.gte(3, 5, "lorem"));
  test("assert.gte(); 05", true, () => assert.gte(5, true));
  test("assert.gte(); 06", true, () => assert.gte(5, true, "lorem"));

  test("assert.VERSION; 01", false,
    () => assert.stringContains(assert.VERSION, "assert.js v")
  );

  try {
    assert(false, "example");
  } catch (e) {
    test("assert.AssertionError 01", false,
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

  alert("End of the sync test.");
}


async function autoTestAsync () {

  // Passes: resolves successfully
  await assert.rejects(
    async () => { throw new TypeError("lorem error"); },
    TypeError
  )
  .then(() => { /* alert("rejects(); 01 - Caught expected TypeError"); */ })
  .catch((e) => { alert("rejects(); 02 - bug"); });

  // Passes: resolves successfully
  await assert.rejects(Promise.reject(new Error("ipsum error")), /ipsum/i)
  .then(() => { /* alert("rejects(); 02 - Caught expected Error"); */ })
  .catch((e) => { alert("rejects(); 02 - bug"); });

  // Fails: does not reject
  await assert.rejects(async () => 42)
  .then(() => { /* alert("rejects(); 03 - passed"); */ })
  .catch((e) => { alert("rejects(); 03 - bug"); });

  // Passes: resolves successfully
  await assert.doesNotReject(async () => 42)
  .then(() => { /*alert("doesNotReject(); 01 - passed"); */})
  .catch((e) => { alert("doesNotReject(); 01 - bug"); });

  // Fails: rejects unexpectedly
  await assert.doesNotReject(async () => { throw new Error("boom"); })
  .then(() => { alert("doesNotReject(); 02 - bug"); })
  .catch((e) => { /* alert("doesNotReject(); 02 - passed"); */ });

  // Fails: rejects with disallowed error type/message
  await assert.doesNotReject(
    async () => { throw new TypeError("Bad type"); },
    TypeError,
    "Unexpected TypeError"
  )
  .then(() => { alert("doesNotReject(); 03 - bug"); })
  .catch((e) => { /* alert("doesNotReject(); 03 - passed"); */ });

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
