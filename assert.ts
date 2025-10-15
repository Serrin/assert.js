// @ts-check
/// <reference lib="esnext" />
/// <reference lib="esnext.iterator" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="webworker.importscripts" />
"use strict";


/*
standard unit testing:
https://wiki.commonjs.org/wiki/Unit_Testing/1.0

Mozilla Assert functions
https://firefox-source-docs.mozilla.org/testing/assert.html
*/


/* TypeScript types */


/** @internal */
type MapLike = { [key: string]: any };

/**
 * Generic comparable types.
 *
 * @internal
 */
type Comparable = number | bigint | string | boolean;

/** @internal */
type AssertionErrorOptions = {
  message?: string,
  actual?: any,
  expected?: any,
  operator?: string,
  stackStartFn?: Function,
  diff?: any;
  cause: any;
};

/** @internal */
type TestResult<T> = { ok: true; value: T } | { ok: false; error: Error };


/** polyfills **/


 /* globalThis; */
(function (global) {
  if (!global.globalThis) {
    if (Object.defineProperty) {
      Object.defineProperty(global, "globalThis", {
        configurable: true, enumerable: false, value: global, writable: true
      });
    } else {
      global.globalThis = global;
    }
  }
})(typeof this === "object" ? this : Function("return this")());


/* Error.isError(); */
if (!("isError" in Error)) {
  // @ts-ignore
  Error.isError = function isError (value: unknown) {
    let className =
      Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
    return (className === "error" || className === "domexception");
  };
}


/* helper functions */


/**
 * @description Return the typeof operator result of the given value, except the null object ("null" instead of "object").
 *
 * @param {unknown} value The value to inspect.
 * @returns {string}
 * @interal
 */
const typeOf = (value: unknown): string =>
  value === null ? "null" : typeof value;


/* isDeepStrictEqual(value1: any, value2: any): boolean */
/** @internal */
function isDeepStrictEqual (value1: any, value2: any): boolean {
  /* helper functions */
  const _deepType = (value: any): string =>
    (value === null) ? "null" : (value !== value) ? "NaN" : (typeof value);
  const _isPrimitive = (value: any): boolean =>
    value == null
      || (typeof value !== "object" && typeof value !== "function");
  const _isObject = (value: any): boolean =>
    value != null && typeof value === "object";
  const _isSameInstance = (value1: any, value2: any, Class: Function): boolean =>
    value1 instanceof Class && value2 instanceof Class;
  const _classof = (value: any): string =>
    Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
  const _ownKeys = (value: MapLike): any[] =>
    Object.getOwnPropertyNames(value)
      // @ts-ignore
      .concat(Object.getOwnPropertySymbols(value));
  /* strict equality helper function */
  const _isEqual = (value1: any, value2: any): boolean =>
    Object.is(value1, value2);
  /* not strict equality helper function */
  /* const _isEqual = (value1, value2): boolean =>
    value1 == value2 || (value1 !== value1 && value2 !== value2); */
  /* primitives: Boolean, Number, BigInt, String + Function + Symbol */
  if (_isEqual(value1, value2)) { return true; }
  /* Object Wrappers (Boolean, Number, BigInt, String) */
  if (_isObject(value1) && _isPrimitive(value2) && _classof(value1) === typeof value2) {
    return _isEqual(value1.valueOf(), value2);
  }
  if (_isPrimitive(value1) && _isObject(value2) && typeof value1 === _classof(value2)) {
    return _isEqual(value1, value2.valueOf());
  }
  /* type (primitives, object, null, NaN) */
  if (_deepType(value1) !== _deepType(value2)) { return false; }
  /* objects */
  if (_isObject(value1) && _isObject(value2)) {
    /* objects / same memory adress */
    if (_isEqual(value1, value2)) { return true; }
    /* objects / not same constructor */
    if (Object.getPrototypeOf(value1).constructor !==
      Object.getPrototypeOf(value2).constructor
    ) {
      return false;
    }
    /* objects / WeakMap + WeakSet */
    if (_isSameInstance(value1, value2, WeakMap) || _isSameInstance(value1, value2, WeakSet)) {
      return _isEqual(value1, value2);
    }
    /* objects / Wrapper objects: Number, Boolean, String, BigInt */
    if (_isSameInstance(value1, value2, Number)
      || _isSameInstance(value1, value2, Boolean)
      || _isSameInstance(value1, value2, String)
      || _isSameInstance(value1, value2, BigInt)
    ) {
      return _isEqual(value1.valueOf(), value2.valueOf());
    }
    /* objects / Array */
    if (Array.isArray(value1) && Array.isArray(value2)) {
      if (value1.length !== value2.length) { return false; }
      if (value1.length === 0) { return true; }
      return value1.every((value: unknown, index: any): boolean =>
        isDeepStrictEqual(value, value2[index])
      );
    }
    /* objects / TypedArrays */
    if ( _isSameInstance(value1, value2, Int8Array)
      || _isSameInstance(value1, value2, Uint8Array)
      || _isSameInstance(value1, value2, Uint8ClampedArray)
      || _isSameInstance(value1, value2, Int16Array)
      || _isSameInstance(value1, value2, Uint16Array)
      || _isSameInstance(value1, value2, Int32Array)
      || _isSameInstance(value1, value2, Uint32Array)
      || ("Float16Array" in globalThis ?
          _isSameInstance(value1, value2, Float16Array) : false
         )
      || _isSameInstance(value1, value2, Float32Array)
      || _isSameInstance(value1, value2, Float64Array)
      || _isSameInstance(value1, value2, BigInt64Array)
      || _isSameInstance(value1, value2, BigUint64Array)
    ) {
      if (value1.length !== value2.length) { return false; }
      if (value1.length === 0) { return true; }
      return value1.every((value: unknown, index: any): boolean => _isEqual(value, value2[index]));
    }
    /* objects / ArrayBuffer */
    if (_isSameInstance(value1, value2, ArrayBuffer)) {
      if (value1.byteLength !== value2.byteLength) { return false; }
      if (value1.byteLength === 0) { return true; }
      let xTA = new Int8Array(value1), yTA = new Int8Array(value2);
      return xTA.every((value: unknown, index: any): boolean =>
        _isEqual(value, yTA[index]));
    }
    /* objects / DataView */
    if (_isSameInstance(value1, value2, DataView)) {
      if (value1.byteLength !== value2.byteLength) { return false; }
      if (value1.byteLength === 0) { return true; }
      for (let index = 0; index < value1.byteLength; index++) {
        if (!_isEqual(value1.getUint8(index), value2.getUint8(index))) { return false; }
      }
      return true;
    }
    /* objects / Map */
    if (_isSameInstance(value1, value2, Map)) {
      if (value1.size !== value2.size) { return false; }
      if (value1.size === 0) { return true; }
      return [...value1.keys()].every((value: unknown): boolean =>
        isDeepStrictEqual(value1.get(value), value2.get(value)));
    }
    /* objects / Set */
    if (_isSameInstance(value1, value2, Set)) {
      if (value1.size !== value2.size) { return false; }
      if (value1.size === 0) { return true; }
      return [...value1.keys()].every((value: unknown): boolean => value2.has(value));
    }
    /* objects / RegExp */
    if (_isSameInstance(value1, value2, RegExp)) {
      return _isEqual(value1.lastIndex, value2.lastIndex)
        && _isEqual(value1.flags, value2.flags)
        && _isEqual(value1.source, value2.source);
    }
    /* objects / Error */
    if (_isSameInstance(value1, value2, Error)) {
      return isDeepStrictEqual(
        Object.getOwnPropertyNames(value1)
          .reduce((acc: any, k: any): MapLike => { acc[k] = value1[k]; return acc; }, {}),
        Object.getOwnPropertyNames(value2)
          .reduce((acc: any, k: any): MapLike => { acc[k] = value2[k]; return acc; }, {})
      );
    }
    /* objects / Date */
    if (_isSameInstance(value1, value2, Date)) {
      return _isEqual(+value1, +value2);
    }
    /* objects / Proxy -> not detectable */
    /* objects / Objects */
      let value1Keys: any[] = _ownKeys(value1);
      let value2Keys: any[] = _ownKeys(value2);
    if (value1Keys.length !== value2Keys.length) { return false; }
    if (value1Keys.length === 0) { return true; }
    return value1Keys.every((key: any): boolean =>
      isDeepStrictEqual(value1[key], value2[key]));
  }
  /* default return false */
  return false;
}


/* isType (
    value: unknown,
    expected: string | Function | Array<string | Function> | undefined,
    Throw: boolean = false
  ): string | Function | boolean | throw TypeError */
/** @internal */
function isType (
  value: any,
  expectedType?: string | Function | Array<string | Function> | undefined,
  Throw: boolean = false): string | Function | boolean {
  /* Validate `expected` */
  if (!(["string", "function", "undefined"].includes(typeof expectedType))
    && !Array.isArray(expectedType)) {
    throw new TypeError(
      `[isType] TypeError: expectedType must be string, function, array or undefined. Got ${typeof expectedType}`
    );
  }
  /* Validate `Throw` */
  if (typeof Throw !== "boolean") {
    throw new TypeError(
      `[isType] TypeError: Throw has to be a boolean. Got ${typeof Throw}`
    );
  }
  /* Determine the type of `value` */
  const vType: string = (value === null ? "null" : typeof value);
  /* If no expected type provided, return type or constructor */
  if (expectedType == null) {
    return vType === "object"
      ? Object.getPrototypeOf(value)?.constructor ?? "object"
      : vType;
  }
  /* Normalize expected to an array */
  let expectedArray: Array<string | Function> =
    Array.isArray(expectedType) ? expectedType : [expectedType];
  /* Check against expected types or constructors */
  let matched: boolean = expectedArray.some(
    function (item: string | Function) {
      if (typeof item === "string") { return vType === item; }
      if (typeof item === "function") {
        return value != null && value instanceof item;
      }
      /* validate expected array elements */
      throw new TypeError(
        `[isType] TypeError: expectedType array elements have to be a string or function. Got ${typeof item}`
      );
    }
  );
  /* Throw error if mismatch and `Throw` is true */
  if (Throw && !matched) {
    let vName: string =
      value.toString ? value.toString() : Object.prototype.toString.call(value);
    let eNames: string = expectedArray.map((item: any): string =>
      (typeof item === "string" ? item.toString() : item.name ?? "anonymous")
    ).join(", ");
    throw new TypeError(`[isType] TypeError: ${vName} is not a ${eNames}`);
  }
  return matched;
}


/**
 * @description This function is a general purpose, type safe, predictable stringifier. Converts a value into a human-readable string for error messages Handles symbols, functions, nullish, circular references, etc.
 *
 * @param {unknown} value The value to inspect.
 * @returns {string}
 * @internal
 */
function toSafeString (value: unknown): string {
  const seen = new WeakSet<object>();
  const replacer = (_key: string, value: unknown): any => {
    if (typeof value === "function") {
      return `[Function: ${value.name || "anonymous"}]`;
    }
    if (typeof value === "symbol") { return value.toString(); }
    if (value instanceof Date) { return `Date(${value.toISOString()})`; }
    if (value instanceof Error) {
      return `${value.name}: ${value.message}, ${value.stack ?? ""}`;
    }
    if (value && typeof value === "object") {
      if (seen.has(value)) { return "[Circular]" };
      seen.add(value);
    }
    return value;
  };
  if (["undefined", "null", "string", "number", "boolean", "bigint"]
    .includes(value === null ? "null" : typeof value)) {
    return String(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(v => toSafeString(v)).join(", ")}]`;
  }
  if (value instanceof Map) {
    return `Map(${value.size}){${Array.from(value.entries()).map(([k, v]): string => `${toSafeString(k)} => ${toSafeString(v)}`).join(", ")}}`;
  }
  if (value instanceof Set) {
    return `Set(${value.size}){${Array.from(value.values()).map(v => toSafeString(v)).join(", ")}}`;
  }
  try {
    return JSON.stringify(value, replacer) ?? String(value);
  } catch (_e) {
    return String(value);
  }
}


/* isLessThan (value1: any, value2: any): boolean */
/**
 * @description isLessThan
 *
 * @param {Comparable} value1
 * @param {Comparable} value2
 * @returns {boolean}
 * @internal
 */
const isLessThan = (value1: Comparable, value2: Comparable): boolean =>
  typeOf(value1) === typeOf(value2) && value1 < value2;


/* exported functions */


/*
standard unit testing:
https://wiki.commonjs.org/wiki/Unit_Testing/1.0
*/


class AssertionError extends Error {
  expected: any;
  actual: any;
  operator: any;
  code: string;
  /*generatedMessage: boolean; */
  constructor(message?: any, options?: AssertionErrorOptions) {
    super(message, options);
    this.code = "ERR_ASSERTION";
    /*this.generatedMessage = Boolean(message); // always true? */
    if (options != null) {
      this.message = message ?? undefined;
      this.actual = options?.actual ?? undefined;
      this.expected = options?.expected ?? undefined;
      this.operator = options?.operator  ?? undefined;
    }
    /* stackStartFn <Function> If provided, the generated stack trace omits frames before this function. */
    /* diff <string> If set to 'full', shows the full diff in assertion errors. Defaults to 'simple'. Accepted values: 'simple', 'full'. */
    /* generatedMessage <boolean> Indicates if the message was auto-generated (true) or not. */
  }
}


/**
 * @description Checks that `condition` is truthy. Throws an `AssertionError` if falsy.
 *
 * @param {any} condition
 * @param {any} message
 * @returns {undefined}
 * @throws {AssertionError} If assertion is failed.
 */
function assert (condition: any, message?: any): void {
  if (!condition) {
    if (message instanceof Error) { throw message; }
    let errorMessage =
      `[assert] Assertion failed: ${toSafeString(condition)} should be truly${message ? " - " + toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
      message: errorMessage,
      cause: errorMessage,
      actual: condition,
      expected: true,
      operator: "=="
    });
  }
}


/**
 * @description Alias for `assert(condition, [message: string | Error]);`.
 *
 * @param {any} condition
 * @param {any} message
 * @returns {undefined}
 * @throws {AssertionError} If assertion is failed.
 */
function ok (condition: any, message?: any): void {
  assert(condition, message);
}


/**
 * @description `assert.equal(actual, expected, [message: string | Error]);`
 *
 * @param {any} actual
 * @param {any} expected
 * @param {any} message
 * @returns {undefined}
 * @throws {AssertionError} If assertion is failed.
 */
function equal (actual: any, expected: any, message?: any): void {
  if (actual != expected) {
    if (message instanceof Error) { throw message; }
    let errorMessage =
      `[equal] Assertion failed: ${toSafeString(actual)} and ${toSafeString(expected)} should be equal${message ? " - " + toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
      message: errorMessage,
      cause: errorMessage,
      actual: actual,
      expected: expected,
      operator: "!="
    });
  }
}


/**
 * @description Inverse of `equal(actual, expected, [message: string | Error]);`.
 *
 * @param {any} actual
 * @param {any} expected
 * @param {any} message
 * @returns {undefined}
 * @throws {AssertionError} If assertion is failed.
 */
function notEqual (actual: any, expected: any, message?: any): void {
  if (actual == expected) {
    if (message instanceof Error) { throw message; }
    let errorMessage =
      `[notEqual] Assertion failed: ${toSafeString(actual)} and ${toSafeString(expected)} should be equal${message ? " - " + toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
      message: errorMessage,
      cause: errorMessage,
      actual: actual,
      expected: expected,
      operator: "=="
    });
  }
}


/**
 * @description Strict equality (`Object.is();`).
 *
 * @param {any} actual
 * @param {any} expected
 * @param {any} message
 * @returns {undefined}
 * @throws {AssertionError} If assertion is failed.
 */
function strictEqual (actual: any, expected: any, message?: any): void {
  if (!Object.is(actual, expected)) {
    if (message instanceof Error) { throw message; }
    let errorMessage =
      `[strictEqual] Assertion failed: ${toSafeString(actual)} and ${toSafeString(expected)} should be strictly equal${message ? " - " + toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
      message: errorMessage,
      cause: errorMessage,
      actual: actual,
      expected: expected,
      operator: "!Object.is(actual, expected);"
    });
  }
}


/**
 * @description Inverse of `strictEqual(actual, expected, [message: string | Error]);`.
 *
 * @param {any} actual
 * @param {any} expected
 * @param {any} message
 * @returns {undefined}
 * @throws {AssertionError} If assertion is failed.
 */
function notStrictEqual (actual: any, expected: any, message?: any): void {
  if (Object.is(actual, expected)) {
    if (message instanceof Error) { throw message; }
    let errorMessage =
      `[notStrictEqual] Assertion failed: ${toSafeString(actual)} and ${toSafeString(expected)} should not be strictly equal${message ? " - " + toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
      message: errorMessage,
      cause: errorMessage,
      actual: actual,
      expected: expected,
      operator: "Object.is(actual, expected);"
    });
  }
}

/**
 * @description Deep equality check.
 *
 * @param {any} actual
 * @param {any} expected
 * @param {any} message
 * @returns {undefined}
 * @throws {AssertionError} If assertion is failed.
 */
function deepEqual (actual: any, expected: any, message?: any): void {
  if (!isDeepStrictEqual(actual, expected)) {
    if (message instanceof Error) { throw message; }
    let errorMessage =
      `[deepEqual] Assertion failed: ${toSafeString(actual)} and ${toSafeString(expected)} should be deep equal${message ? " - " + toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
      message: errorMessage,
      cause: errorMessage,
      actual: actual,
      expected: expected,
      operator: "isDeepStrictEqual(actual, expected)"
    });
  }
}


/**
 * @description Inverse of `deepEqual(actual, expected, [message: string | Error]);`.
 *
 * @param {any} actual
 * @param {any} expected
 * @param {any} message
 * @returns {undefined}
 * @throws {AssertionError} If assertion is failed.
 */
function notDeepEqual (actual: any, expected: any, message?: any): void {
  if (isDeepStrictEqual(actual, expected)) {
    if (message instanceof Error) { throw message; }
    let errorMessage =
      `[notDeepEqual] Assertion failed: ${toSafeString(actual)} and ${toSafeString(expected)} should not be deep equal${message ? " - " + toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
      message: errorMessage,
      cause: errorMessage,
      actual: actual,
      expected: expected,
      operator: "!(isDeepStrictEqual(actual, expected))"
    });
  }
}


/**
 * @description Checks that a function throws.
 *
 * @param {Function} block
 * @param {any} Error_opt
 * @param {any} message
 * @returns {Error | undefined}
 * @throws {AssertionError} If assertion is failed.
 */
function throws (block: Function, Error_opt?: any, message?: any): Error | undefined {
  let thrownError;
  try {
    block();
  } catch (catchedError) {
    thrownError = catchedError as Error;
  }
  if (!thrownError) {
    let errorMessage =
      `[throws] Assertion failed: function did not throw${message ? " - " + toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
      message: errorMessage,
      cause: errorMessage,
      operator: "throws"
    });
  }
  // If Error_opt is provided, check the thrown error
  if (Error_opt) {
    const errorMatches =
      (typeof Error_opt === "function" && thrownError instanceof Error_opt) ||
      (typeof Error_opt === "string" && thrownError?.message?.includes(Error_opt)) ||
      (Error_opt instanceof RegExp && Error_opt.test(thrownError?.message));
    if (!errorMatches) {
      let errorMessage =
        `[throws] Assertion failed: function threw unexpected error: ${toSafeString(thrownError)}${message ? " - " + toSafeString(message) : ""}`;
      throw new assert.AssertionError(errorMessage, {
        message: errorMessage,
        cause: thrownError,
        actual: thrownError,
        expected: Error_opt,
        operator: "throws"
      });
    }
  }
  return thrownError;
}


/**
 * @description Asserts that an async function or Promise rejects.
 *
 * @param {(() => Promise<any>) | Promise<any>} block - Async function or promise expected to reject.
 * @param {ErrorConstructor | string | RegExp} [Error_opt] - Expected error type, substring, or pattern.
 * @param {any} [message] - Optional custom message or Error.
 * @returns {Promise<any>} - Resolves with the rejection reason if assertion passes.
 * @throws {AssertionError} If assertion is failed.
 */
async function rejects (block: Function, Error_opt?: any, message?: any): Promise<any> {
  let rejectedError;
  try {
    const result = typeof block === "function" ? await block() : await block;
    // If we reach here, it resolved successfully
    let errorMessage =
      `[rejects] Assertion failed: function/promise did not reject${message ? " - " + toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
      message: errorMessage,
      cause: result,
      expected: Error_opt,
      operator: "rejects"
    });
  } catch (catchedError) {
    rejectedError = catchedError;
  }
  // If expected error provided, validate it
  if (Error_opt) {
    const errorMatches =
      (typeof Error_opt === "function" && rejectedError instanceof Error_opt) ||
      (typeof Error_opt === "string" && typeof (rejectedError as Error)?.message === "string" && (rejectedError as Error).message.includes(Error_opt)) ||
      (Error_opt instanceof RegExp && typeof (rejectedError as Error)?.message === "string" && Error_opt.test((rejectedError as Error).message));
    if (!errorMatches) {
      let errorMessage =
        `[rejects] Assertion failed: rejected with unexpected error: ${toSafeString(rejectedError)}${message ? " - " + toSafeString(message) : ""}`;
      throw new assert.AssertionError(errorMessage, {
        message: errorMessage,
        cause: rejectedError,
        actual: rejectedError,
        expected: Error_opt,
        operator: "rejects"
      });
    }
  }
  return rejectedError;
}


/**
 * @description Asserts that an async function or Promise resolves successfully (i.e., does NOT reject).
 *
 * @param {(() => Promise<any>) | Promise<any>} block - Async function or promise expected to resolve.
 * @param {ErrorConstructor | string | RegExp} [Error_opt] - Optional: an error type, message, or pattern that must NOT appear in a rejection.
 * @param {any} [message] - Optional custom message or Error to throw.
 * @returns {Promise<any>} - Resolves with the resolved value if assertion passes.
 * @throws {assert.AssertionError} If the function or promise rejects.
 */
async function doesNotReject (block: Function, Error_opt?: any, message?: any): Promise<any> {
  try {
    // Execute async function or promise
    const result = typeof block === "function" ? await block() : await block;
    return result;
  } catch (catchedError) {
    // Check if a specific unexpected error type or message was provided
    if (Error_opt) {
      const errorMatches =
        (typeof Error_opt === "function" && catchedError instanceof Error_opt) ||
        (typeof Error_opt === "string" && (catchedError as Error).message?.includes(Error_opt)) ||
        (Error_opt instanceof RegExp && Error_opt.test((catchedError as Error).message));

      if (errorMatches) {
        if (message instanceof Error) throw message;
        let errorMessage =
          `[doesNotReject] Assertion failed: function/promise rejected with disallowed error: ${toSafeString(catchedError)}${message ? " - " + toSafeString(message) : ""}`;
        throw new assert.AssertionError(errorMessage, {
          message: errorMessage,
          cause: catchedError,
          actual: catchedError,
          expected: undefined,
          operator: "doesNotReject"
        });
      }
    }

    if (message instanceof Error) throw message;
    let errorMessage =
      `[doesNotReject] Assertion failed: function/promise rejected unexpectedly${message ? " - " + toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
      message: errorMessage,
      cause: catchedError,
      actual: catchedError,
      expected: undefined,
      operator: "doesNotReject"
    });
  }
}


/**
 * @description Forces a failure.
 *
 * @param {any} message
 * @returns {undefined}
 * @throws {AssertionError}
 */
function fail (message?: any): void {
  if (message instanceof Error) { throw message; }
  let errorMessage =
    `[fail] Assertion failed${message ? ": " + toSafeString(message) : ""}`;
  throw new assert.AssertionError(errorMessage, {message: errorMessage, cause: errorMessage});
}


/**
 * @description Ensures a value is falsy.
 *
 * @param {any} condition
 * @param {any} message
 * @returns {undefined}
 * @throws {AssertionError} If assertion is failed.
 */
function notOk (condition: any, message?: any): void {
  if (condition) {
    if (message instanceof Error) { throw message; }
    let errorMessage =
      `[notOk] Assertion failed: ${toSafeString(condition)} should be falsy${message ? " - " + toSafeString(message) : ""}`;
   throw new assert.AssertionError(errorMessage, {
      message: errorMessage,
      cause: errorMessage,
      actual: condition,
      expected: false,
      operator: "=="
    });
  }
}


/**
 * @description Ensures value is exactly `true`.
 *
 * @param {any} condition
 * @param {any} message
 * @returns {undefined}
 * @throws {AssertionError} If assertion is failed.
 */
function isTrue (condition: unknown, message?: any): void {
  if (condition !== true) {
    if (message instanceof Error) { throw message; }
    let errorMessage =
      `[isTrue] Assertion failed: ${toSafeString(condition)} should be true${message ? " - " + toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
      message: errorMessage,
      cause: errorMessage,
      actual: condition,
      expected: true,
      operator: "!=="
    });
  }
}


/**
 * @description Ensures value is exactly `false`.
 *
 * @param {any} condition
 * @param {any} message
 * @returns {undefined}
 * @throws {AssertionError} If assertion is failed.
 */
function isFalse (condition: unknown, message?: any): void {
  if (condition !== false) {
    if (message instanceof Error) { throw message; }
    let errorMessage =
      `[isFalse] Assertion failed: ${toSafeString(condition)} should be false${message ? " - " + toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
      message: errorMessage,
      cause: errorMessage,
      actual: condition,
      expected: false,
      operator: "!=="
    });
  }
}


/**
 * @description Ensures a value matches a type or constructor. The expected type can be a string, function or an array of strings and functions.
 *
 * @param {any} value
 * @param {string | Function | Array<string | Function>} expectedType
 * @param {any} message
 * @returns {undefined}
 * @throws {AssertionError} If assertion is failed.
 */
function is (
  value: any,
  expectedType: string | Function | Array<string | Function>,
  message?: any ) {
  if (!isType(value, expectedType, false)) {
    if (message instanceof Error) { throw message; }
    let errorMessage =
      `[is] Assertion failed: ${toSafeString(value)} should be an expected type${message ? " - " + toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
      message: errorMessage,
      cause: errorMessage,
      actual: value,
      expected: expectedType,
      operator: "is"
    });
  }
}


/**
 * @description Inverse of `is(value, expectedType, [message: string | Error]);`. The expected type can be a string, function or an array of strings and functions.
 *
 * @param {any} value
 * @param {string | Function | Array<string | Function>} expectedType
 * @param {any} message
 * @returns {undefined}
 * @throws {AssertionError} If assertion is failed.
 */
function isNot (
  value: any,
  expectedType: string | Function | Array<string | Function>,
  message?: any): void {
  if (isType(value, expectedType, false)) {
    if (message instanceof Error) { throw message; }
    let errorMessage =
      `[isNot] Assertion failed: ${toSafeString(value)} should not be an expected type${message ? " - " + toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
      message: errorMessage,
      cause: errorMessage,
      actual: value,
      expected: expectedType,
      operator: "is not"
    });
  }
}


/**
 * @description Ensures value is `null` or `undefined`.
 *
 * @param {any} value
 * @param {any} message
 * @returns {undefined}
 * @throws {AssertionError} If assertion is failed.
 */
function isNullish (value: unknown, message?: any): void {
  if (value != null) {
    if (message instanceof Error) { throw message; }
    let errorMessage =
      `[isNullish] Assertion failed: ${toSafeString(value)} should be nullish${message ? " - " + toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
      message: errorMessage,
      cause: errorMessage,
      actual: value,
      expected: null,
      operator: "!="
    });
  }
}


/**
 * @description Ensures value is not `null` or `undefined`.
 *
 * @param {any} value
 * @param {any} message
 * @returns {undefined}
 * @throws {AssertionError} If assertion is failed.
 */
function isNotNullish (value: unknown, message?: any): void {
  if (value == null) {
    if (message instanceof Error) { throw message; }
    let errorMessage =
      `[isNotNullish] Assertion failed: ${toSafeString(value)} should be not nullish${message ? " - " + toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
      message: errorMessage,
      cause: errorMessage,
      actual: value,
      expected: null,
      operator: "=="
    });
  }
}


/**
 * @description Ensures a string matches a regular expression.
 *
 * @param {string} string
 * @param {RegExp} regexp
 * @param {any} message
 * @returns {undefined}
 * @throws {TypeError} If parameter types are not matched.
 * @throws {AssertionError} If assertion is failed.
 */
function match (string: string, regexp: RegExp, message?: any): void {
  if (typeof string !== "string") {
    if (message instanceof Error) { throw message; }
    throw new TypeError(
      "[match] TypeError: " + string + " is not a string"
        + (message ? " - " + toSafeString(message) : "")
    );
  }
  if (!(regexp instanceof RegExp)) {
    if (message instanceof Error) { throw message; }
    throw new TypeError(
      "[match] TypeError: " + regexp + " is not a RegExp"
        + (message ? " - " + toSafeString(message) : "")
    );
  }
  if (!(regexp.test(string))) {
    if (message instanceof Error) { throw message; }
    let errorMessage =
      `[match] Assertion failed: ${string} is not matched with ${regexp}${message ? " - " + toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
      message: errorMessage,
      cause: errorMessage,
      actual: string,
      expected: regexp,
      operator: "match"
    });
  }
}


/**
 * @description Ensures a string does not match a regular expression.
 *
 * @param {string} string
 * @param {RegExp} regexp
 * @param {any} message
 * @returns {undefined}
 * @throws {TypeError} If parameter types are not matched.
 * @throws {AssertionError} If assertion is failed.
 */
function doesNotMatch (string: string, regexp: RegExp, message?: any): void {
  if (typeof string !== "string") {
    if (message instanceof Error) { throw message; }
    throw new TypeError(
      "[doesNotMatch] TypeError: " + string + " is not a string"
        + (message ? " - " + toSafeString(message) : "")
    );
  }
  if (!(regexp instanceof RegExp)) {
    if (message instanceof Error) { throw message; }
    throw new TypeError(
      "[doesNotMatch] TypeError: " + regexp + " is not a RegExp"
        + (message ? " - " + toSafeString(message) : "")
    );
  }
  if (regexp.test(string)) {
    if (message instanceof Error) { throw message; }
    let errorMessage =
      `[doesNotMatch] Assertion failed: ${string} is matched with ${regexp}${message ? " - " + toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
      message: errorMessage,
      cause: errorMessage,
      actual: string,
      expected: regexp,
      operator: "doesNotMatch"
    });
  }
}


/**
 * @description Checks `a < b`, but the value types have to be same type.
 *
 * @param {any} value1
 * @param {any} value2
 * @param {any} message
 * @returns {undefined}
 */
function lt (value1: any, value2: any, message?: any): void {
  if (!isLessThan(value1, value2)) {
    if (message instanceof Error) { throw message; }
    let errorMessage =
      `[lt] Assertion failed: ${toSafeString(value1)} should be less than ${toSafeString(value2)}${message ? " - " + toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
      message: errorMessage,
      cause: errorMessage,
      actual: value1,
      expected: value2,
      operator: "<"
    });
  }
}


/**
 * @description Checks `a >= b`, but the value types have to be same type.
 *
 * @param {any} value1
 * @param {any} value2
 * @param {any} message
 * @returns {undefined}
 */
function lte (value1: any, value2: any, message?: any): void {
  if (!isLessThan(value1, value2) && !Object.is(value1, value2)) {
    if (message instanceof Error) { throw message; }
    let errorMessage =
      `[lte] Assertion failed: ${toSafeString(value1)} should be less than or equal ${toSafeString(value2)}${message ? " - " + toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
      message: errorMessage,
      cause: errorMessage,
      actual: value1,
      expected: value2,
      operator: "< or Object.is();"
    });
  }
}


/**
 * @description Checks `a > b`, but the value types have to be same type.
 *
 * @param {any} value1
 * @param {any} value2
 * @param {any} message
 * @returns {undefined}
 */
function gt (value1: any, value2: any, message?: any): void {
  if (!isLessThan(value2, value1)) {
    if (message instanceof Error) { throw message; }
    let errorMessage =
      `[gt] Assertion failed: ${toSafeString(value1)} should be greater than ${toSafeString(value2)}${message ? " - " + toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
      message: errorMessage,
      cause: errorMessage,
      actual: value1,
      expected: value2,
      operator: ">"
    });
  }
}


/**
 * @description Checks `a <= b`, but the value types have to be same type.
 *
 * @param {any} value1
 * @param {any} value2
 * @param {any} message
 * @returns {undefined}
 */
function gte (value1: any, value2: any, message?: any): void {
  if (!isLessThan(value2, value1) && !Object.is(value1, value2)) {
    if (message instanceof Error) { throw message; }
    let errorMessage =
      `[gte] Assertion failed: ${toSafeString(value1)} should be greater than or equal ${value2}${message ? " - " + toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
      message: errorMessage,
      cause: errorMessage,
      actual: value1,
      expected: value2,
      operator: "> or Object.is();"
    });
  }
}


/**
 * @description Asserts that `actual` (a string) contains the specified `substring`.
 *
 * @param {string} actual - The string to check.
 * @param {string} substring - The substring expected to appear within `actual`.
 * @param {any} [message] - Optional message or Error to throw.
 * @throws {assert.AssertionError} If `actual` does not contain `substring`.
 */
function stringContains(actual: string, substring: string, message?: any): void {
  // Type validation
  if (typeof actual !== "string") {
    if (message instanceof Error) { throw message; }
    throw new TypeError(
      `[stringContains] TypeError: ${toSafeString(actual)} is not a string${message ? " - " + toSafeString(message) : ""}`
    );
  }
  if (typeof substring !== "string") {
    if (message instanceof Error) { throw message; }
    throw new TypeError(
      `[stringContains] TypeError: ${toSafeString(substring)} is not a string${message ? " - " + toSafeString(message) : ""}`
    );
  }
  // Assertion
  if (!actual.includes(substring)) {
    if (message instanceof Error) { throw message; }
    let errorMessage =
      `[stringContains] Assertion failed: ${toSafeString(actual)} does not contain substring ${toSafeString(substring)}${message ? " - " + toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
      message: errorMessage,
      cause: errorMessage,
      actual,
      expected: substring,
      operator: "stringContains"
    });
  }
}


/**
 * @description Asserts that `actual` (a string) does NOT contain the specified `substring`.
 *
 * @param {string} actual - The string to check.
 * @param {string} substring - The substring that must not appear in `actual`.
 * @param {any} [message] - Optional message or Error to throw.
 * @throws {assert.AssertionError} If `actual` contains `substring`.
 */
function stringNotContains(actual: string, substring: string, message: any) {
  // Type validation
  if (typeof actual !== "string") {
    if (message instanceof Error) { throw message; }
    throw new TypeError(
      `[stringNotContains] TypeError: ${toSafeString(actual)} is not a string${message ? " - " + toSafeString(message) : ""}`
    );
  }
  if (typeof substring !== "string") {
    if (message instanceof Error) { throw message; }
    throw new TypeError(
      `[stringNotContains] TypeError: ${toSafeString(substring)} is not a string${message ? " - " + toSafeString(message) : ""}`
    );
  }
  // Assertion
  if (actual.includes(substring)) {
    if (message instanceof Error) { throw message; }
    let errorMessage =
      `[stringNotContains] Assertion failed: ${toSafeString(actual)} should not contain substring ${toSafeString(substring)}${message ? " - " + toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
      message: errorMessage,
      cause: errorMessage,
      actual,
      expected: substring,
      operator: "stringNotContains"
    });
  }
}


/* test functions */


/**
 * Synchronously runs a block of code and returns either its result or the caught error.
 *
 * @param {Function} block - The function to execute.
 * @returns {TestResult<T>} The result of the block if successful, or the caught error if it throws.
 */
function testSync<T>(block: () => T): TestResult<T> {
  try {
    return { ok: true, value: block() };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}


/**
 * Asynchronously runs a block of code and returns either its resolved result or the caught error.
 *
 * @param {Function} block - The async function to execute.
 * @returns {Promise<TestResult<T>>} A promise that resolves to either the result or an Error.
 */
async function testAsync<T>(block: () => Promise<T>): Promise<TestResult<T>> {
  try {
    return { ok: true, value: await block() };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}


/**
 * Checks if the result is successful and narrows the type accordingly.
 *
 * @param {TestResult<T>} result - The result to check.
 * @returns {boolean} True if the result is successful, false otherwise.
 */
function testCheck<T>(result: TestResult<T>): result is { ok: true; value: T} {
  return result.ok;
}


assert["VERSION"] = "assert.js v1.0.0";
/** @see https://wiki.commonjs.org/wiki/Unit_Testing/1.0 */
assert["AssertionError"] = AssertionError;
assert["ok"] = ok;
assert["equal"] = equal;
assert["notEqual"] = notEqual;
assert["strictEqual"] = strictEqual;
assert["notStrictEqual"] = notStrictEqual;
assert["deepEqual"] = deepEqual;
assert["notDeepEqual"] = notDeepEqual;
assert["throws"] = throws;
assert["rejects"] = rejects;
assert["doesNotReject"] = doesNotReject;
/* extensions */
assert["fail"] = fail;
assert["notOk"] = notOk;
assert["isTrue"] = isTrue;
assert["isFalse"] = isFalse;
assert["is"] = is;
assert["isNot"] = isNot;
assert["isNullish"] = isNullish;
assert["isNotNullish"] = isNotNullish;
assert["match"] = match;
assert["doesNotMatch"] = doesNotMatch;
assert["lt"] = lt;
assert["lte"] = lte;
assert["gt"] = gt;
assert["gte"] = gte;
assert["stringContains"] = stringContains;
assert["stringNotContains"] = stringNotContains;
/* test functions */
assert["testSync"] = testSync;
assert["testAsync"] = testAsync;
assert["testCheck"] = testCheck;

export {assert};
export default assert;
