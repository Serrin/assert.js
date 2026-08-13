/// <reference lib="esnext" />
/// <reference lib="dom" />
/// <reference lib="webworker.importscripts" />
/// <reference lib="scripthost" />
"use strict";

/**
 * @name assert.js
 * @version 1.2.2
 * @author Ferenc Czigler
 * @see https://github.com/Serrin/assert.js/
 * @license MIT https://opensource.org/licenses/MIT
 */

/*
Commonjs unit testing:    https://wiki.commonjs.org/wiki/Unit_Testing/1.0
Mozilla Assert functions: https://firefox-source-docs.mozilla.org/testing/assert.html
Google Clojure Asserts:   https://google.github.io/closure-library/api/goog.asserts.html
*/


/** TS browser and NodeJS common types from Celestra v7.1.0 **/

/**
 * @description False like values.
 * @see https://developer.mozilla.org/en-US/docs/Glossary/Falsy
 * @note Missing values: NaN and document.all
 * @private
 */
type Falsy = null | undefined | false | 0 | -0 | 0n | "";

/** * @description Truthy like values. * @private */
/* @ts-ignore */
type Truthy<T> = Exclude<T, Falsy>;

/** * @description Object key type. Built-in type. * @private */
/* type PropertyKey = string | number | symbol; */

/** * @description Object with string, number or symbol keys. * @private */
type ObjectLike = Record<PropertyKey, any>;

/** * @description String-like object. * @private */
type BooleanLike = boolean | Boolean;

/** * @description Number-like object. * @private */
type NumberLike = number | Number;

/** * @description BigInt-like object. * @private */
type BigIntLike = bigint | BigInt;

/** * @description Number-like object. * @private */
/* @ts-ignore */
type Numeric = number | bigint;

/** * @description Number-like and BigInt-like object. * @private */
type NumericLike = NumberLike | BigIntLike;

/** * @description String-like object. * @private */
type StringLike = string | String;

/** * @description String-like object. * @private */
type SymbolLike = symbol | Symbol;

/** * @description Any iterable or iterator. * @private */
type IterableLike = Iterable<any> | Iterator<any> | IterableIterator<any>;

/** * @description Any iterable, iterator or array-like objects. * @private */
/* @ts-ignore */
type IterableLikeAndArrayLike = IterableLike | ArrayLike<any>;

/** * @description Iterable and Iterator and Generator types. * @private */
/* @ts-ignore */
type GeneratorLike = IterableLike | Generator<any, void, unknown>;

/** * @description Type for undefined and null values. * @private */
type Nullish = undefined | null;

/** * @description Not null or undefined. Built-in type. * @private */
/* type NonNullable = number | boolean | string | symbol | object | Function; */

/** * @description Not null or undefined or object or function. * @private */
type NonNullablePrimitive = boolean | number | bigint | string | symbol;

/** * @description NonNullablePrimitiveLike object. * @private */
type NonNullablePrimitiveLike =
  BooleanLike | NumericLike | StringLike | SymbolLike;

/** * @description Not object or function. * @private */
type Primitive = Nullish | NonNullablePrimitive;

/** * @description Primitive-like object. * @private */
/* @ts-ignore */
type PrimitiveLike = Nullish | NonNullablePrimitiveLike;

/** * @description Object or function. * @private */
type NonPrimitive = object | Function;

/** * @description Generic comparable types. * @private */
type Comparable = number | bigint | string | boolean | Date;

/** * @description AsyncFunction. * @private */
/* @ts-ignore */
type AsyncFunction<T> = (...args: ReadonlyArray<any>) => Promise<T>;

/** * @description ArrowFunction. * @private */
/* @ts-ignore */
type ArrowFunction<Args extends any[] = [], R = any> =
  (this: void, ...args: Args) => R;

/** * @description TypedArray types. * @private */
type TypedArray = Exclude<ArrayBufferView, DataView>;


/** assert.js types **/

/** * @description Options for AssertionError. * @private */
type AssertionErrorOptions = {
  message?: string,
  actual?: any;
  expected?: any;
  operator?: any,
  stackStartFn?: Function,
  diff?: any
};

/** * @description The result of a test operation. * @private */
type TestResult<T> =
  | {ok: true, value: T, block: Function, name: string}
  | {ok: false, error: Error, block: Function, name: string};

/** * @description The expected type(s) for type checking. * @private */
type ExpectedType = string | Function | Array<string | Function>;

/** * @description The includes options object. * @private */
type IncludesOptions = { keyOrValue: any, value?: any };

/** * @description assertion message argument * @private */
type Message = string | Error;


/** polyfills **/

 /* globalThis; polyfill */
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

/* Error.isError(); polyfill */
if (!("isError" in Error)) {
  (Error as any).isError = function isError (v: unknown) {
    let cName = Object.prototype.toString.call(v).slice(8, -1).toLowerCase();
    return (cName === "error" || cName === "domexception");
  };
}


/* Helper functions */

/* Standard helpers */
/** @private */
const _isError = Error.isError;
/** @private */
const _isArray = Array.isArray;
/** @private */
const _ownKeys = Reflect.ownKeys;
/** @private */
const _oIs = Object.is;
/** @private */
const _getPrototypeOf = Object.getPrototypeOf;

/**
 * @description Extended typeof operator with "null" type as string.
 * @param {unknown} v
 * @returns string
 * @private
 */
const _typeOf = (v: unknown): string => v === null ? "null" : typeof v;

/**
 * @description Checks if two values are the same type.
 * @param {any} x
 * @param {any} y
 * @param {string} [type]
 * @returns {boolean}
 * @private
 */
const _isSameType = (x: any, y: any, type?: string): boolean =>
  typeof type === "string"
    ? _typeOf(x) === type && _typeOf(x) === _typeOf(y)
    : _typeOf(x) === _typeOf(y);

/**
 * @description Return the typeof operator result of the given value, except return "null" instead of "object" for null, and provide detailed object class names (Array, Date, etc. and custom classes).
 * @param {unknown} v
 * @returns {string}
 * @private
 * @example
 * console.log(_classOf(null))                   // "null"
 * console.log(_classOf(Object.create(null)))    // "object"
 * console.log(_classOf({}))                     // "object"
 * console.log(_classOf(42))                     // "number"
 * console.log(_classOf(Object(42)))             // "Number"
 * console.log(_classOf([]))                     // "Array"
 * console.log(_classOf(() => {}))               // "function"
 * console.log(_classOf(async () => {}))         // "AsyncFunction"
 * console.log(_classOf(function* g() {}))       // "GeneratorFunction"
 * console.log(_classOf(new (class Foo {})()))   // "Foo"
 * console.log(_classOf(new (class {})()))       // ""
 */
function _classOf (v: unknown): string {
  /* primitives */
  let vT = _typeOf(v);
  if (vT !== "object" && vT !== "function") { return vT; }
  /* objects and functions */
  let ctor: string;
  try {
    ctor = _getPrototypeOf(v)?.constructor?.name ?? "Object";
  } catch (_error) {
    ctor = Object.prototype.toString.call(v).slice(8, -1);
  }
  return ctor === "Object" || ctor === "Function" ? ctor.toLowerCase() : ctor;
}

/**
 * @description Checks if the given value is a TypedArray (Int8Array, etc.).
 * @param {unknown} v
 * @returns {boolean}
 * @private
 */
const _isTypedArray = (v: unknown): v is TypedArray =>
  ArrayBuffer.isView(v) && !(v instanceof DataView);

/**
 * @description Checks if the values are deep equal.
 * @param {unknown} x
 * @param {unknown} y
 * @returns {boolean}
 * @private
 */
function _isDeepEqual (x: any, y: any): boolean {
  /* helper functions */
  const _isSameInstance = (x: unknown, y: unknown, Class: Function): boolean =>
    x instanceof Class && y instanceof Class;
  /* primitives: Boolean, Number, BigInt, String + Function + Symbol */
  if (_oIs(x, y)) { return true; }
  /* Object Wrappers (Boolean, Number, BigInt, String) */
  if (_typeOf(x) === "object" && _isPrimitive(y) && _classOf(x) === typeof y) {
    return _oIs(x.valueOf(), y);
  }
  if (_isPrimitive(x) && _typeOf(y) === "object" && typeof x === _classOf(y)) {
    return _oIs(x, y.valueOf());
  }
  /* type (primitives, object, null, NaN) */
  /*if (_deepType(value1) !== _deepType(value2)) { return false; }*/
  if (!_isSameType(x, y)) { return false; }
  /* objects */
  if (_isSameType(x, y, "object")) {
    /* objects / same memory adress */
    if (_oIs(x, y)) { return true; }
    /* objects / not same constructor */
    if (_getPrototypeOf(x).constructor !== _getPrototypeOf(y).constructor) {
      return false;
    }
    /* objects / WeakMap + WeakSet */
    if (_isSameInstance(x, y, WeakMap) || _isSameInstance(x, y, WeakSet)) {
      return _oIs(x, y);
    }
    /* objects / Wrapper objects: Number, Boolean, String, BigInt */
    if (_isSameInstance(x, y, Number)
      || _isSameInstance(x, y, Boolean)
      || _isSameInstance(x, y, String)
      || _isSameInstance(x, y, Symbol)
      || _isSameInstance(x, y, BigInt)) {
      return _oIs(x.valueOf(), y.valueOf());
    }
    /* objects / Array */
    if (_isArray(x) && _isArray(y)) {
      if (x.length !== y.length) { return false; }
      if (x.length === 0) { return true; }
      return x.every((v: unknown, i: any): boolean => _isDeepEqual(v, y[i]));
    }
    /* objects / TypedArrays */
    if (_isTypedArray(x) && _isTypedArray(y) && _classOf(x) === _classOf(y)) {
      if ((x as any).length !== (y as any).length) { return false; }
      if ((x as any).length === 0) { return true; }
      return (x as any).every(
        (v: unknown, i: any): boolean => _oIs(v, (y as any)[i])
      );
    }
    /* objects / ArrayBuffer */
    if (_isSameInstance(x, y, ArrayBuffer)) {
      if (x.byteLength !== y.byteLength) { return false; }
      if (x.byteLength === 0) { return true; }
      let xTA = new Int8Array(x)
      let yTA = new Int8Array(y);
      return xTA.every((v: unknown, i: number): boolean => _oIs(v, yTA[i]));
    }
    /* objects / DataView */
    if (_isSameInstance(x, y, DataView)) {
      if (x.byteLength !== y.byteLength) { return false; }
      if (x.byteLength === 0) { return true; }
      for (let i = 0; i < x.byteLength; i++) {
        if (!_oIs(x.getUint8(i), y.getUint8(i))) { return false; }
      }
      return true;
    }
    /* objects / Map */
    if (_isSameInstance(x, y, Map)) {
      if (x.size !== y.size) { return false; }
      if (x.size === 0) { return true; }
      return [...x.keys()].every(
        (v: unknown): boolean => _isDeepEqual(x.get(v), y.get(v))
      );
    }
    /* objects / Set */
    if (_isSameInstance(x, y, Set)) {
      if (x.size !== y.size) { return false; }
      if (x.size === 0) { return true; }
      return [...x.keys()].every((v: unknown): boolean => y.has(v));
    }
    /* objects / RegExp */
    if (_isSameInstance(x, y, RegExp)) {
      return _oIs(x.lastIndex, y.lastIndex)
        && _oIs(x.flags, y.flags)
        && _oIs(x.source, y.source);
    }
    /* objects / Error */
    if (_isSameInstance(x, y, Error)) {
      return _isDeepEqual(
        Object.getOwnPropertyNames(x).reduce(
          (acc, key): ObjectLike => { acc[key] = x[key]; return acc; },
          {}
        ),
        Object.getOwnPropertyNames(y).reduce(
          (acc, key): ObjectLike => { acc[key] = y[key]; return acc; },
          {}
        )
      );
    }
    /* objects / Date */
    if (_isSameInstance(x, y, Date)) { return _oIs(+x, +y); }
    /* objects / Proxy -> not detectable */
    /* objects / objects */
    let xKeys = _ownKeys(x);
    if (xKeys.length !== _ownKeys(y).length) { return false; }
    if (xKeys.length === 0) { return true; }
    return xKeys.every((key: PropertyKey): boolean =>
      _isDeepEqual(x[key], y[key])
    );
  }
  /* default return false */
  return false;
}

/**
 * @description Checks if the given value is the given type(s).
 * @notes From is.js v1.0.0 and added the "caller" argument.
 * @param {unknown} value
 * @param {string | Function | (string | Function)[]} expectedType
 * @returns {boolean}
 * @throws {RangeError} If expectedType array is empty.
 * @throws {TypeError} If elements of expectedType array are not a valid type.
 * @throws {TypeError} If expectedType is not a valid type.
 */
function _is (
  value: unknown,
  expectedType: ExpectedType,
  caller: string = "is"): boolean {
  /* helper functions */
  function _matches (value: unknown, expected: string | Function): boolean {
    if (typeof expected === "string") { return _typeOf(value) === expected; }
    try {
      return value instanceof expected;
    } catch (_error) {
      return false;
    }
  }
  /* expectedType is a string or function */
  if (typeof expectedType === "string" || typeof expectedType  === "function") {
    return _matches(value, expectedType);
  }
  /* expectedType is an Array */
  if (Array.isArray(expectedType)) {
    /* expectedType array is empty -> throw a RangeError */
    if (!expectedType.length) {
      throw new RangeError(`[${_str(caller)}] expectedType array must be not empty.`);
    }
    for (const item of expectedType) {
      if (typeof item !== "string" && typeof item !== "function") {
        /* item of expectedType is not a string or function -> throw a TypeError */
        throw new TypeError(
          `[${_str(caller)}] TypeError: expectedType array elements must be string or function. Got ${_typeOf(item)}`
        );
      }
    }
    return expectedType.some((item) => _matches(value, item));
  }
  /* expectedType error -> throw a TypeError */
  throw new TypeError(
    `[${_str(caller)}] expectedType array elements must be strings or constructors. Got ${_typeOf(expectedType)}`
  );
}

/**
 * @description This function is a general purpose, type safe, predictable stringifier. Converts a value into a human-readable string for error messages, symbols, functions, nullish, circular references, etc.
 * @param {unknown} v
 * @returns {string}
 * @private
 */
function _str (v: unknown): string {
  let seen = new WeakSet<object>();
  function replacer (_key: string, v: unknown): any {
    let vT = _typeOf(v);
    if (vT === "function") {
      return `[Function: ${(v as Function).name || "anonymous"}]`;
    }
    if (vT === "symbol") { return (v as Symbol).toString(); }
    if (v instanceof Date) { return `Date(${v.toISOString()})`; }
    if (_isError(v)) { return `${v.name}: ${v.message}, ${v.stack ?? ""}`; }
    if (vT === "object") {
      if (seen.has(v as object)) { return "[Circular]"; }
      seen.add(v as object);
    }
    return v;
  }
  /* primitives */
  if (!(["symbol", "object", "function"].includes(_typeOf(v)))) {
    return String(v);
  }
  /* Array + TypedArray */
  if (_isArray(v) && _isTypedArray(v)) {
    return `[${v.map(v => _str(v)).join(", ")}]`;
  }
  /* Map */
  if (v instanceof Map) {
    return `Map(${v.size}){${Array.from(v.entries()).map(([k, v]): string => `${_str(k)} => ${_str(v)}`).join(", ")}}`;
  }
  /* Set */
  if (v instanceof Set) {
    return `Set(${v.size}){${Array.from(v.values()).map(v => _str(v)).join(", ")}}`;
  }
  /* Other values */
  try {
    return JSON.stringify(v, replacer) ?? String(v);
  } catch (_error) {
    return String(v);
  }
}

/**
 * @description Error message generator helper function.
 * @param {unknown} m
 * @returns {string}
 * @private
 */
const _msg = (m: unknown): string => m ? ` - ${_str(m)}` : "";

/**
 * @description Checks value1 is less than value2.
 * @param {Comparable} x
 * @param {Comparable} y
 * @returns {boolean}
 * @private
 */
const _lt = (x: Comparable, y: Comparable): boolean =>
  _isSameType(x, y) && x < y;

/**
 * @description Checks value1 is less than value2 or equal (uses `Object.is();`).
 * @param {Comparable} x
 * @param {Comparable} y
 * @returns {boolean}
 * @private
 */
const _lte = (x: Comparable, y: Comparable): boolean => _lt(x, y) || _oIs(x, y);

/**
 * @description Checks value is greater than or equal min and value is less than or equal max.
 * @param {Comparable} v
 * @param {Comparable} min
 * @param {Comparable} max
 * @returns {boolean}
 * @private
 */
const _inRange = (v: Comparable, min: Comparable, max: Comparable): boolean =>
  _isSameType(v, min)
    && _isSameType(min, max)
    && ((min < v && v < max) || _oIs(v, min) || _oIs(v, max));

/**
 * @description Checks if a key or value exists in a container.
 * @param {any} container
 * @param {any} keyOrValue The key or value to look for.
 * @param {unknown} valueIfKey The value to check if the key exists.
 * @returns {boolean}
 * @private
 */
function _includes (
  container: any,
  keyOrValue: any,
  valueIfKey?: unknown): boolean {
  /* string and String */
  if (typeof container === "string" || container instanceof String) {
    return String(container).includes(keyOrValue);
  }
  /* Check for primitives, null, undefined */
  if (container == null || typeof container !== "object") { return false; }
  /* Map + WeakMap */
  if (container instanceof Map || container instanceof WeakMap) {
    if (!container.has(keyOrValue)) { return false; }
    return valueIfKey === undefined
      || _oIs(container.get(keyOrValue), valueIfKey);
  }
  /* WeakSet */
  if (container instanceof WeakSet) { return container.has(keyOrValue); }
  /* Array + TypedArray + Set + Iterator + Iterables */
  if (_isArray(container)
    || _isTypedArray(container)
    || container instanceof Set
    || typeof container[Symbol.iterator] === "function"
    || typeof container.next === "function") {
    return Iterator.from(container).some((v: unknown) => _oIs(v, keyOrValue));
  }
  /* Plain object */
  if (!Object.hasOwn(container, keyOrValue)) { return false; }
  return valueIfKey === undefined || _oIs(container[keyOrValue], valueIfKey);
}

/**
 * @description Checks if a value is empty.
 * - null, undefined, and NaN are empty.
 * - Arrays, TypedArrays, and strings are empty if length === 0.
 * - Maps and Sets are empty if size === 0.
 * - ArrayBuffer and DataView are empty if byteLength === 0.
 * - Iterable objects are empty if they have no elements.
 * - Plain objects are empty if they have no own properties.
 * @param {any} v
 * @returns {boolean}
 * @private
 */
function _isEmpty (v: any): boolean {
  /* undefined + null + NaN */
  if (v == null || v !== v) { return true; }
  /* Array + TypedArray + string + String */
  if (_isArray(v)
    || _isTypedArray(v)
    || typeof v === "string"
    || v instanceof String) {
    return (v as ArrayLike<any>).length === 0;
  }
  /* Map + Set */
  if (v instanceof Map || v instanceof Set) { return v.size === 0; }
  /* ArrayBuffer + DataView */
  if (v instanceof ArrayBuffer || v instanceof DataView) {
    return v.byteLength === 0;
  }
  /* Iterable */
  if (typeof v[Symbol.iterator] === "function") {
    return v[Symbol.iterator]().next().done;
  }
  /* Iterator */
  if ("Iterator" in globalThis
    ? (v instanceof Iterator)
    : (_typeOf(v) === "object" && typeof v.next === "function")) {
    try {
      /* Has at least one element */
      for (let _item of v) { return false; }
      return true;
    } catch (_error) { /* Not iterable */ }
  }
  /* Other objects - check own properties (including symbols) */
  if (_typeOf(v) === "object") {
    let keys = _ownKeys(v);
    if (keys.length === 0) return true;
    /* Object with single "length" property that is 0 */
    if (keys.length === 1
      && keys[0] === "length"
      && (v as ArrayLike<any>).length === 0) {
      return true;
    }
  }
  /* Return default false */
  return false;
}

/**
 * @description Checks if the given value is Primitive.
 * @param {unknown} v
 * @returns {boolean}
 * @private
 */
const _isPrimitive = (v: unknown): v is Primitive =>
  _typeOf(v) !== "object" && typeof v !== "function";

/**
 * @description Checks if a value is a floating-point number.
 * @param {unknown} v
 * @returns {boolean}
 * @private
 */
const _isFloat = (v: unknown): boolean =>
  typeof v === "number" && v === v && !Number.isInteger(v);

/**
 * @description If value is an error, then it will be thrown.
 * @param {unknown} msg
 * @param {Function} caller
 * @returns {void}
 * @private
 */
function _watchdog (msg: unknown, caller: Function): void {
  if (_isError(msg)) {
    if (typeof (Error as ObjectLike).captureStackTrace === "function") {
      (Error as any).captureStackTrace(caller, msg);
    }
    throw msg;
  }
}


/* Exported functions */

/**
 * @description An error thrown when an assertion fails.
 * @param {AssertionErrorOptions} [options] - Additional options for the error.
 * @property {string} [message] - The error message.
 * @property {unknown} [actual] - The actual value that failed the assertion.
 * @property {unknown} [expected] - The expected value for the assertion.
 * @property {string} [operator] - The operator used in the assertion.
 * @property {string} [code] - The error code, set to "ERR_ASSERTION".
 * @property {boolean} [generatedMessage] - Indicates if the message was generated by the assertion.
 * @property {string} [name] - The name of the error, set to "AssertionError".
 * @property {string} [cause] - The cause of the error, set to the message.
 * @constructor
 */
class AssertionError extends Error {
  actual?: unknown;
  expected?: unknown;
  operator?: string;
  code?: string;
  generatedMessage?: boolean;
  constructor (options?: AssertionErrorOptions) {
    super(options?.message ?? "AssertionError");
    this.code = "ERR_ASSERTION";
    this.name = "AssertionError";
    this.generatedMessage = true;
    this.message = options?.message ?? "AssertionError";
    this.cause = options?.message ?? "AssertionError";
    this.actual = options?.actual ?? undefined;
    this.expected = options?.expected ?? undefined;
    this.operator = options?.operator ?? undefined;
    /* capture stack properly */
    if (typeof (Error as any).captureStackTrace === "function") {
      (Error as any).captureStackTrace(this, AssertionError);
    }
  }
}

/**
 * @description Ensures that value is truthy. Throws an AssertionError if falsy.
 * @param {unknown} value
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function assert (value: unknown, message?: Message): asserts value {
  if (!value) {
    _watchdog(message, assert);
    throw new AssertionError({
      message: `[assert] Assertion failed: ${_str(value)} should be truly${_msg(message)}`,
      actual: value,
      expected: true,
      operator: "==",
    });
  }
}

/**
 * @description Alias of `assert(value, [message: Message]);`.
 * @param {unknown} value
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const ok = (value: unknown, message?: Message): asserts value =>
  assert(value, message);

/**
 * @description Ensures that actual is equal to expected.
 * @param {unknown} actual
 * @param {unknown} expected
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const equal = (actual: unknown, expected: unknown, message?: Message): void =>
  operator(
    actual,
    assert.config.alwaysStrict ? "Object.is" : "==",
    expected,
    message
  );

/**
 * @description Inverse of `equal(actual, expected, [message: Message]);`.
 * @param {unknown} actual
 * @param {unknown} expected
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const notEqual =
  (actual: unknown, expected: unknown, message?: Message): void => operator(
    actual,
    assert.config.alwaysStrict ? "!Object.is" : "!=",
    expected,
    message
  );

/**
 * @description Strict equality (`Object.is();`).
 * @param {unknown} actual
 * @param {unknown} expected
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const strictEqual =
  (actual: unknown, expected: unknown, message?: Message): void =>
  operator(actual, "Object.is", expected, message);

/**
 * @description Inverse of `strictEqual(actual, expected, [message: Message]);`.
 * @param {unknown} actual
 * @param {unknown} expected
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const notStrictEqual =
  (actual: unknown, expected: unknown, message?: Message): void =>
  operator(actual, "!Object.is", expected, message);

/**
 * @description Deep equality check.
 * @param {unknown} actual
 * @param {unknown} expected
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function deepEqual (
  actual: unknown,
  expected: unknown,
  message?: Message): void {
  if (!_isDeepEqual(actual, expected)) {
    _watchdog(message, deepEqual);
    throw new AssertionError({
      message: `[deepEqual] Assertion failed: ${_str(actual)} and ${_str(expected)} should be deep equal${_msg(message)}`,
      actual,
      expected,
      operator: "deepEqual"
    });
  }
}

/**
 * @description Inverse of `deepEqual(actual, expected, [message: Message]);`.
 * @param {unknown} actual
 * @param {unknown} expected
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function notDeepEqual (
  actual: unknown,
  expected: unknown,
  message?: Message): void {
  if (_isDeepEqual(actual, expected)) {
    _watchdog(message, notDeepEqual);
    throw new AssertionError({
      message: `[notDeepEqual] Assertion failed: ${_str(actual)} and ${_str(expected)} should not be deep equal${_msg(message)}`,
      actual,
      expected,
      operator: "notDeepEqual"
    });
  }
}

/**
 * @description Ensures that a function throws.
 * @param {Function} block
 * @param {unknown} Error_opt
 * @param {Message} [message]
 * @returns {Error | undefined}
 * @throws {AssertionError}
 */
function throws (
  block: Function,
  Error_opt?: unknown,
  message?: Message): Error | undefined {
  let thrownError: any;
  try {
    block();
  } catch (catchedError) {
    thrownError = catchedError as Error;
  }
  if (!thrownError) {
    throw new AssertionError({
      message: `[throws] Assertion failed: function did not throw${_msg(message)}`,
      operator: "throws"
    });
  }
  /* If Error_opt is provided, check the thrown error */
  if (Error_opt) {
    let errorMatches =
      (typeof Error_opt === "function" && thrownError instanceof Error_opt)
        || (typeof Error_opt === "string"
          && thrownError?.message?.includes(Error_opt))
        || (Error_opt instanceof RegExp
          && Error_opt.test(thrownError?.message));
    if (!errorMatches) {
      throw new AssertionError({
        message: `[throws] Assertion failed: function threw unexpected error: ${_str(thrownError)}${_msg(message)}`,
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
 * @param {(() => Promise<unknown>) | Promise<unknown>} block - Async function or promise expected to reject.
 * @param {ErrorConstructor | string | RegExp} [Error_opt] - Expected error type, substring, or pattern.
 * @param {Message} [message] - Optional custom message or Error.
 * @returns {Promise<unknown>} - Resolves with the rejection reason if assertion passes.
 * @throws {AssertionError}
 */
async function rejects (
  block: Function | Promise<unknown>,
  Error_opt?: unknown,
  message?: Message): Promise<unknown> {
  let rejectedError: any;
  try {
    let result = typeof block === "function" ? await block() : await block;
    /* If we reach here, it resolved successfully */
    throw new AssertionError({
      message: `[rejects] Assertion failed: function/promise did not reject - ${_str(result)}${_msg(message)}`,
      expected: Error_opt,
      operator: "rejects"
    });
  } catch (catchedError) {
    rejectedError = catchedError;
  }
  /* If expected error provided, validate it */
  if (Error_opt) {
    let errorMatches =
      (typeof Error_opt === "function" && rejectedError instanceof Error_opt)
        || (typeof Error_opt === "string"
          && typeof (rejectedError as Error)?.message === "string")
        && (rejectedError as Error).message.includes(Error_opt)
        || (Error_opt instanceof RegExp
          && typeof (rejectedError as Error)?.message === "string"
          && Error_opt.test((rejectedError as Error).message));
    if (!errorMatches) {
      throw new AssertionError({
        message: `[rejects] Assertion failed: rejected with unexpected error: ${_str(rejectedError)}${_msg(message)}`,
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
 * @param {(() => Promise<unknown>) | Promise<unknown>} block - Async function or promise expected to resolve.
 * @param {ErrorConstructor | string | RegExp} [Error_opt] - Optional: an error type, message, or pattern that must NOT appear in a rejection.
 * @param {Message} [message]
 * @returns {Promise<unknown>} - Resolves with the resolved value if assertion passes.
 * @throws {AssertionError} If the function or promise rejects.
 */
async function doesNotReject (
  block: Function,
  Error_opt?: unknown,
  message?: Message): Promise<unknown> {
  try {
    /* Execute async function or promise */
    let result = typeof block === "function" ? await block() : block;
    return result;
  } catch (catchedError) {
    /* Check if a specific unexpected error type or message was provided */
    if (Error_opt) {
      let errorMatches =
        (typeof Error_opt === "function" && catchedError instanceof Error_opt)
          || (typeof Error_opt === "string"
            && (catchedError as Error).message?.includes(Error_opt))
          || (Error_opt instanceof RegExp
            && Error_opt.test((catchedError as Error).message));
      if (errorMatches) {
        if (_isError(message)) { throw message; }
        throw new AssertionError({
          message: `[doesNotReject] Assertion failed: function/promise rejected with disallowed error: ${_str(catchedError)}${_msg(message)}`,
          actual: catchedError,
          operator: "doesNotReject"
        });
      }
    }
    _watchdog(message, doesNotReject);
    throw new AssertionError({
      message: `[doesNotReject] Assertion failed: function/promise rejected unexpectedly${_msg(message)}`,
      actual: catchedError,
      operator: "doesNotReject"
    });
  }
}

/**
 * @description Forces a failure.
 * @param {unknown[]} ...args - Optional arguments.
 * @returns {void}
 * @throws {AssertionError}
 */
function fail (message?: Message): void;
function fail (actual?: unknown, expected?: unknown, message?: Message, operator?: unknown): void;
function fail (...args: unknown[]): void {
  let message = args.length === 1 ? args[0] :
    (args.length > 1 ? args[2] : undefined);
  _watchdog(message, fail);
  throw new AssertionError({
    message: `[fail] Assertion failed${message ? `: ${_str(message)}` : ""}`,
    actual: args.length > 1 ? args[0] : undefined,
    expected: args.length > 1 ? args[1] : undefined,
    operator: args.length > 1 ? args[3] : undefined
  });
}

/**
 * @description Ensures a value is falsy.
 * @param {unknown} value
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const notOk = (value: unknown, message?: Message): asserts value is Falsy =>
  operator(value, "!=", true, message);

/**
 * @description Ensures value is exactly true.
 * @param {unknown} value
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isTrue = (value: unknown, message?: Message): asserts value is true =>
  strictEqual(value, true, message);

/**
 * @description Ensures value is exactly not true, but can be false or truthy or falsy.
 * @param {T} value
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isNotTrue =
  <T>(value: T, message?: Message): asserts value is Exclude<T, true> =>
  notStrictEqual(value, true, message);

/**
 * @description Ensures value is exactly false.
 * @param {unknown} value
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isFalse = (value: unknown, message?: Message): asserts value is false =>
  strictEqual(value, false, message);

/**
 * @description Ensures value is exactly not false, but can be true or truthy or falsy.
 * @param {T} value
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isNotFalse =
  <T>(value: T, message?: Message): asserts value is Exclude<T, false> =>
  notStrictEqual(value, false, message);

/**
 * @description Ensures a value matches a type or constructor. The expected type can be a string, function or an array of strings and functions.
 * @param {unknown} value
 * @param {string | Function | Array<string | Function>} expectedType
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function is (
  value: unknown,
  expectedType: ExpectedType,
  message?: Message): void {
  if (!_is(value, expectedType, "is")) {
    _watchdog(message, is);
    throw new AssertionError({
      message: `[is] Assertion failed: ${_str(value)} should be an expected type: ${_str(expectedType)}${_msg(message)}`,
      actual: value,
      expected: expectedType,
      operator: "is"
    });
  }
}

/**
 * @description Inverse of `is(value, expectedType, [message: Message]);`. The expected type can be a string, function or an array of strings and functions.
 * @param {unknown} value
 * @param {string | Function | Array<string | Function>} expectedType
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function isNot (
  value: unknown,
  expectedType: ExpectedType,
  message?: Message): void {
  if (_is(value, expectedType, "isNot")) {
    _watchdog(message, isNot);
    throw new AssertionError({
      message: `[isNot] Assertion failed: ${_str(value)} should not be an expected type: ${_str(expectedType)}${_msg(message)}`,
      actual: value,
      expected: expectedType,
      operator: "isNot"
    });
  }
}

/**
 * @description Ensures a value matches a type. The expected type can be a string.
 * @param {unknown} value
 * @param {string} expectedType
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function typeOf (
  value: unknown,
  expectedType: string,
  message?: Message): void {
  oneOf(
    expectedType,
    ["undefined", "null", "boolean", "number", "bigint", "string", "symbol",
      "function", "object"],
    message
  );
  is(value, expectedType, message);
}

/**
 * @description Ensures a value don't match a type. The expected type can be a string.
 * @param {unknown} value
 * @param {string} expectedType
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function notTypeOf (
  value: unknown,
  expectedType: string,
  message?: Message): void {
  oneOf(
    expectedType,
    ["undefined", "null", "boolean", "number", "bigint", "string", "symbol",
      "function", "object"],
    message
  );
  isNot(value, expectedType, message);
}

/**
 * @description Ensures a value matches a constructor. The expected type can be a function.
 * @param {unknown} value
 * @param {Function} expectedConstructor
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function instanceOf (
  value: unknown,
  expectedConstructor: Function,
  message?: Message): void {
  is(expectedConstructor, "function", message);
  is(value, expectedConstructor, message);
}

/**
 * @description Ensures a value don't match a constructor. The expected type can be a function.
 * @param {unknown} value
 * @param {Function} expectedConstructor
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function notInstanceOf (
  value: unknown,
  expectedConstructor: Function,
  message?: Message): void {
  is(expectedConstructor, "function", message);
  isNot(value, expectedConstructor, message);
}

/**
 * @description Ensures value is null or undefined.
 * @param {unknown} value
* @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isNullish =
  (value: unknown, message?: Message): asserts value is Nullish =>
  is(value, ["null", "undefined"], message);

/**
 * @description Ensures value is not null or undefined.
 * @param {unknown} value
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isNonNullable =
  (value: unknown, message?: Message): asserts value is NonNullable<unknown> =>
  isNot(value, ["null", "undefined"], message);

/**
 * @description Ensures value is null.
 * @param {unknown} value
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isNull = (value: unknown, message?: Message): asserts value is null =>
  is(value, "null", message);

/**
 * @description Ensures value is not null.
 * @param {unknown} value
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isNotNull = (
  value: unknown,
  message?: Message): asserts value is Exclude<unknown, null> =>
  isNot(value, "null", message);

/**
 * @description Ensures value is undefined.
 * @param {unknown} value
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isUndefined =
  (value: unknown, message?: Message): asserts value is undefined =>
  is(value, "undefined", message);

/**
 * @description Ensures value is not undefined.
 * @param {unknown} value
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isDefined = (
  value: unknown,
  message?: Message): asserts value is Exclude<unknown, undefined> =>
  isNot(value, "undefined", message);

/**
 * @description Ensures value is string.
 * @param {unknown} value
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isString = (value: unknown, message?: Message): asserts value is string =>
  is(value, "string", message);

/**
 * @description Ensures value is not string.
 * @param {unknown} value
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isNotString = (
  value: unknown,
  message?: Message): asserts value is Exclude<unknown, string> =>
  isNot(value, "string", message);

/**
 * @description Ensures value is number.
 * @param {unknown} value
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isNumber = (value: unknown, message?: Message): asserts value is number =>
  is(value, "number", message);

/**
 * @description Ensures value is not number.
 * @param {unknown} value
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isNotNumber = (
  value: unknown,
  message?: Message): asserts value is Exclude<unknown, number> =>
  isNot(value, "number", message);

/**
 * @description Ensures value is bigint.
 * @param {unknown} value
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isBigInt = (value: unknown, message?: Message): asserts value is bigint =>
  is(value, "bigint", message);

/**
 * @description Ensures value is not bigint.
 * @param {unknown} value
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isNotBigInt = (
  value: unknown,
  message?: Message): asserts value is Exclude<unknown, bigint> =>
  isNot(value, "bigint", message);

/**
 * @description Ensures value is boolean.
 * @param {unknown} value
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isBoolean =
  (value: unknown, message?: Message): asserts value is boolean =>
  is(value, "boolean", message);

/**
 * @description Ensures value is not boolean.
 * @param {unknown} value
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isNotBoolean = (
  value: unknown,
  message?: Message): asserts value is Exclude<unknown, boolean> =>
  isNot(value, "boolean", message);

/**
 * @description Ensures value is symbol.
 * @param {unknown} value
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isSymbol = (value: unknown, message?: Message): asserts value is symbol =>
  is(value, "symbol", message);

/**
 * @description Ensures value is not symbol.
 * @param {unknown} value
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isNotSymbol = (
  value: unknown,
  message?: Message): asserts value is Exclude<unknown, symbol> =>
  isNot(value, "symbol", message);

/**
 * @description Ensures value is function.
 * @param {unknown} value
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isFunction =
  (value: unknown, message?: Message): asserts value is Function =>
  is(value, "function", message);

/**
 * @description Ensures value is not function.
 * @param {unknown} value
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isNotFunction = (
  value: unknown,
  message?: Message): asserts value is Exclude<unknown, Function> =>
  isNot(value, "function", message);

/**
 * @description Ensures value is object.
 * @param {unknown} value
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isObject = (value: unknown, message?: Message): asserts value is object =>
  is(value, "object", message);

/**
 * @description Ensures value is not object.
 * @param {unknown} value
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isNotObject = (
  value: unknown,
  message?: Message): asserts value is Exclude<unknown, object> =>
  isNot(value, "object", message);

/**
 * @description Ensures value is not object or function.
 * @param {unknown} value
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isPrimitive =
  (value: unknown, message?: Message): asserts value is Primitive =>
  isNot(value, ["object", "function"], message);

/**
 * @description Ensures value is object or function.
 * @param {unknown} value
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isNotPrimitive =
  (value: unknown, message?: Message): asserts value is NonPrimitive =>
  is(value, ["object", "function"], message);

/**
 * @description Ensures value is a number and NaN.
 * @param {unknown} value
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isNaN = (value: unknown, message?: Message): void =>
  strictEqual(value, NaN, message);

/**
 * @description Ensures value is not a number and NaN.
 * @param {unknown} value
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isNotNaN = (value: unknown, message?: Message): void =>
  notStrictEqual(value, NaN, message);

/**
 * @description Ensures value is a number and integer.
 * @param {unknown} value
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function isInt (value: unknown, message?: Message): void {
  if (!Number.isInteger(value)) {
    _watchdog(message, isInt);
    throw new AssertionError({
      message: `[isInt] Assertion failed: ${_str(value)} should be an integer${_msg(message)}`,
      actual: value,
      operator: "isInt"
    });
  }
}

/**
 * @description Ensures value is not a number and integer.
 * @param {unknown} value
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function isNotInt (value: unknown, message?: Message): void {
  if (Number.isInteger(value)) {
    _watchdog(message, isNotInt);
    throw new AssertionError({
      message: `[isNotInt] Assertion failed: ${_str(value)} should not be an integer${_msg(message)}`,
      actual: value,
      operator: "isNotInt"
    });
  }
}

/**
 * @description Ensures value is a float and integer.
 * @param {unknown} value
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function isFloat (value: unknown, message?: Message): void {
  if (!_isFloat(value)) {
    _watchdog(message, isFloat);
    throw new AssertionError({
      message: `[isFloat] Assertion failed: ${_str(value)} should be a float${_msg(message)}`,
      actual: value,
      operator: "isFloat"
    });
  }
}

/**
 * @description Ensures value is not a number and float.
 * @param {unknown} value
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function isNotFloat (value: unknown, message?: Message): void {
  if (_isFloat(value)) {
    _watchdog(message, isNotFloat);
    throw new AssertionError({
      message: `[isNotFloat] Assertion failed: ${_str(value)} should not be a float${_msg(message)}`,
      actual: value,
      operator: "isNotFloat"
    });
  }
}

/**
 * @description Ensures value is empty.
 * - null, undefined, and NaN are empty.
 * - Arrays, TypedArrays, and strings are empty if length === 0.
 * - Maps and Sets are empty if size === 0.
 * - ArrayBuffer and DataView are empty if byteLength === 0.
 * - Iterable objects are empty if they have no elements.
 * - Plain objects are empty if they have no own properties.
 * @param {unknown} value
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function isEmpty (value: unknown, message?: Message): void {
  if (!_isEmpty(value)) {
    _watchdog(message, isEmpty);
    throw new AssertionError({
      message: `[isEmpty] Assertion failed: ${_str(value)} should be empty${_msg(message)}`,
      actual: value,
      operator: "isEmpty"
    });
  }
}

/**
 * @description Ensures value is not empty.
 * - null, undefined, and NaN are empty.
 * - Arrays, TypedArrays, and strings are empty if length === 0.
 * - Maps and Sets are empty if size === 0.
 * - ArrayBuffer and DataView are empty if byteLength === 0.
 * - Iterable objects are empty if they have no elements.
 * - Plain objects are empty if they have no own properties.
 * @param {unknown} value
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function isNotEmpty (value: unknown, message?: Message): void {
  if (_isEmpty(value)) {
    _watchdog(message, isNotEmpty);
    throw new AssertionError({
      message: `[isNotEmpty] Assertion failed: ${_str(value)} should be not empty${_msg(message)}`,
      actual: value,
      operator: "isNotEmpty"
    });
  }
}

/**
 * @description Ensures a string matches a regular expression.
 * @param {string} string
 * @param {RegExp} regexp
 * @param {Message} [message]
 * @returns {void}
 * @throws {TypeError} If parameter types are not matched.
 * @throws {AssertionError}
 */
function match (string: StringLike, regexp: RegExp, message?: Message): void {
  /* validation */
  is(string, ["string", String], message);
  is(regexp, RegExp, message);
  /* assertion */
  if (!regexp.test(String(string))) {
    _watchdog(message, match);
    throw new AssertionError({
      message: `[match] Assertion failed: ${_str(string)} is not matched with ${_str(regexp)}${_msg(message)}`,
      actual: string,
      expected: regexp,
      operator: "match"
    });
  }
}

/**
 * @description Ensures a string does not match a regular expression.
 * @param {string} string
 * @param {RegExp} regexp
 * @param {Message} [message]
 * @returns {void}
 * @throws {TypeError} If parameter types are not matched.
 * @throws {AssertionError}
 */
function doesNotMatch (
  string: StringLike,
  regexp: RegExp,
  message?: Message): void {
  /* validation */
  is(string, ["string", String], message);
  is(regexp, RegExp, message);
  /* assertion */
  if (regexp.test(String(string))) {
    _watchdog(message, doesNotMatch);
    throw new AssertionError({
      message: `[doesNotMatch] Assertion failed: ${_str(string)} is matched with ${_str(regexp)}${_msg(message)}`,
      actual: string,
      expected: regexp,
      operator: "doesNotMatch"
    });
  }
}

/**
 * @description Ensures `a < b` and value types have to be same type.
 * @param {Comparable} value1
 * @param {Comparable} value2
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function lt (value1: Comparable, value2: Comparable, message?: Message): void {
  if (!_lt(value1, value2)) {
    _watchdog(message, lt);
    throw new AssertionError({
      message: `[lt] Assertion failed: ${_str(value1)} should be less than ${_str(value2)}${_msg(message)}`,
      actual: value1,
      expected: value2,
      operator: "<"
    });
  }
}

/**
 * @description Ensures `a >= b` and value types have to be same type.
 * @param {Comparable} value1
 * @param {Comparable} value2
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function lte (value1: Comparable, value2: Comparable, message?: Message): void {
  if (!_lte(value1, value2)) {
    _watchdog(message, lte);
    throw new AssertionError({
      message: `[lte] Assertion failed: ${_str(value1)} should be less than or equal ${_str(value2)}${_msg(message)}`,
      actual: value1,
      expected: value2,
      operator: "< or Object.is();"
    });
  }
}

/**
 * @description Ensures `a > b` and value types have to be same type.
 * @param {Comparable} value1
 * @param {Comparable} value2
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function gt (value1: Comparable, value2: Comparable, message?: Message): void {
  if (!_lt(value2, value1)) {
    _watchdog(message, gt);
    throw new AssertionError({
      message: `[gt] Assertion failed: ${_str(value1)} should be greater than ${_str(value2)}${_msg(message)}`,
      actual: value1,
      expected: value2,
      operator: ">"
    });
  }
}

/**
 * @description Ensures `a <= b` and value types have to be same type.
 * @param {Comparable} value1
 * @param {Comparable} value2
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function gte (value1: Comparable, value2: Comparable, message?: Message): void {
  if (!_lte(value2, value1)) {
    _watchdog(message, gte);
    throw new AssertionError({
      message: `[gte] Assertion failed: ${_str(value1)} should be greater than or equal ${_str(value2)}${_msg(message)}`,
      actual: value1,
      expected: value2,
      operator: "> or Object.is();"
    });
  }
}

/**
 * @description Ensures `min <= value <= max` and the value types have to be same type.
 * @param {Comparable} value
 * @param {Comparable} min
 * @param {Comparable} max
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function inRange (
  value: Comparable,
  min: Comparable,
  max: Comparable,
  message?: Message): void {
  if (!_inRange(value, min, max)) {
    _watchdog(message, inRange);
    throw new AssertionError({
      message: `[inRange] Assertion failed: ${_str(value)} should be in range ${_str(min)} and ${_str(max)} or the type of the values are not the same${_msg(message)}`,
      actual: value,
      expected: `${_str(min)} and ${_str(max)}`,
      operator: "inRange"
    });
  }
}

/**
 * @description Inverse of `inRange(value, min, max, [message: Message]);`.
 * @param {Comparable} value
 * @param {Comparable} min
 * @param {Comparable} max
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function notInRange (
  value: Comparable,
  min: Comparable,
  max: Comparable,
  message?: Message): void {
  if (_inRange(value, min, max)) {
    _watchdog(message, notInRange);
    throw new AssertionError({
      message: `[notInRange] Assertion failed: ${_str(value)} should be not in range ${_str(min)} and ${_str(max)}${_msg(message)}`,
      actual: value,
      expected: `${_str(min)} and ${_str(max)}`,
      operator: "notInRange"
    });
  }
}

/**
 * @description Asserts that actual (a string) contains the specified substring.
 * @param {string} actual
 * @param {string} substring
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function stringContains (
  actual: StringLike,
  substring: StringLike,
  message?: Message): void {
  /* validation */
  is(actual, ["string", String], message);
  is(substring, ["string", String], message);
  /* assertion */
  if (!String(actual).includes(String(substring))) {
    _watchdog(message, stringContains);
    throw new AssertionError({
      message: `[stringContains] Assertion failed: ${_str(actual)} does not contain substring ${_str(substring)}${_msg(message)}`,
      actual,
      expected: substring,
      operator: "stringContains"
    });
  }
}

/**
 * @description Asserts that actual (a string) does NOT contain the specified substring.
 * @param {string} actual
 * @param {string} substring
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function stringNotContains (
  actual: StringLike,
  substring: StringLike,
  message?: Message): void {
  /* validation */
  is(actual, ["string", String], message);
  is(substring, ["string", String], message);
  /* assertion */
  if (actual.includes(String(substring))) {
    _watchdog(message, stringNotContains);
    throw new AssertionError({
      message: `[stringNotContains] Assertion failed: ${_str(actual)} should not contain substring ${_str(substring)}${_msg(message)}`,
      actual,
      expected: substring,
      operator: "stringNotContains"
    });
  }
}

/**
 * @description Asserts that actual (a string) starts with the specified substring.
 * @param {string} actual
 * @param {string} substring
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function stringStartsWith (
  actual: StringLike,
  substring: StringLike,
  message?: Message): void {
  /* validation */
  is(actual, ["string", String], message);
  is(substring, ["string", String], message);
  /* assertion */
  if (!String(actual).startsWith(String(substring))) {
    _watchdog(message, stringStartsWith);
    throw new AssertionError({
      message: `[stringStartsWith] Assertion failed: ${_str(actual)} does not start with substring ${_str(substring)}${_msg(message)}`,
      actual,
      expected: substring,
      operator: "stringStartsWith"
    });
  }
}

/**
 * @description Asserts that actual (a string) does not start with the specified substring.
 * @param {string} actual
 * @param {string} substring
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function stringNotStartsWith (
  actual: StringLike,
  substring: StringLike,
  message?: Message): void {
  /* validation */
  is(actual, ["string", String], message);
  is(substring, ["string", String], message);
  /* assertion */
  if (String(actual).startsWith(String(substring))) {
    _watchdog(message, stringNotStartsWith);
    throw new AssertionError({
      message: `[stringNotStartsWith] Assertion failed: ${_str(actual)} starts with substring ${_str(substring)}${_msg(message)}`,
      actual,
      expected: substring,
      operator: "doesNotStartWith"
    });
  }
}

/**
 * @description Asserts that actual (a string) ends with the specified substring.
 * @param {string} actual
 * @param {string} substring
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function stringEndsWith (
  actual: StringLike,
  substring: StringLike,
  message?: Message): void {
  /* validation */
  is(actual, ["string", String], message);
  is(substring, ["string", String], message);
  /* assertion */
  if (!String(actual).endsWith(String(substring))) {
    _watchdog(message, stringEndsWith);
    throw new AssertionError({
      message: `[stringEndsWith] Assertion failed: ${_str(actual)} does not end with substring ${_str(substring)}${_msg(message)}`,
      actual,
      expected: substring,
      operator: "stringEndsWith"
    });
  }
}

/**
 * @description Asserts that actual (a string) does not end with the specified substring.
 * @param {string} actual
 * @param {string} substring
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function stringNotEndsWith (
  actual: StringLike,
  substring: StringLike,
  message?: Message): void {
  /* validation */
  is(actual, ["string", String], message);
  is(substring, ["string", String], message);
  /* assertion */
  if (String(actual).endsWith(String(substring))) {
    _watchdog(message, stringNotEndsWith);
    throw new AssertionError({
      message: `[stringNotEndsWith] Assertion failed: ${_str(actual)} ends with substring ${_str(substring)}${_msg(message)}`,
      actual,
      expected: substring,
      operator: "stringEndsWith"
    });
  }
}

/**
 * @description Ensures a container includes a key and value.
 * @param {any} container
 * @param {IncludesOptions} options
 * @param {Message} [message]
 * @returns {void}
 * @throws {TypeError} If parameter types are not matched.
 * @throws {AssertionError}
 */
function includes (
  container: any,
  options: IncludesOptions,
  message?: Message): void {
  /* validation */
  is(options, "object", message);
  /* assertion */
  if (!_includes(container, options.keyOrValue, options?.value ?? undefined)) {
    _watchdog(message, includes);
    throw new AssertionError({
      message: `[includes] Assertion failed: ${_str(container)} does not include${_str(options)}${_msg(message)}`,
      actual: container,
      expected: options,
      operator: "includes"
    });
  }
}

/**
 * @description Ensures a container does not include a key and value.
 * @param {any} container
 * @param {IncludesOptions} options Options object with the checking key and value.
 * @param {Message} [message]
 * @returns {void}
 * @throws {TypeError} If parameter types are not matched.
 * @throws {AssertionError}
 */
function doesNotInclude (
  container: any,
  options: IncludesOptions,
  message?: Message): void {
  /* validation */
  is(options, "object", message);
  /* assertion */
  if (_includes(container, options.keyOrValue, options?.value ?? undefined)) {
    _watchdog(message, doesNotInclude);
    throw new AssertionError({
      message: `[doesNotInclude] Assertion failed: ${_str(container)} does not include ${_str(options)}${_msg(message)}`,
      actual: container,
      expected: options,
      operator: "doesNotInclude"
    });
  }
}

/**
 * @description Ensures a value is in a flat collection (`Array`, iterables, etc.).
 * @param {unknown} value
 * @param {unknown} collection - List of the possibly values.
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const oneOf = (value: unknown, collection: unknown, message?: Message): void =>
  includes(collection, {keyOrValue: value}, message);

/**
 * @description Ensures a value is not in a flat collection (`Array`, iterables, etc.).
 * @param {unknown} value
 * @param {unknown} collection - List of the possibly values.
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const notOneOf =
  (value: unknown, collection: unknown, message?: Message): void =>
  doesNotInclude(collection, {keyOrValue: value}, message);

/**
 * @description Ensures a value matches a comparison operator with another value.
 * @param {any} value1
 * @param {string} operatorStr
 * @param {any} value2
 * @param {Message} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function operator (
  value1: any,
  operatorStr: string,
  value2: any,
  message?: Message) {
  /* validation */
  oneOf(
    operatorStr,
    ["==", "!=", "===", "!==", "<", "<=", ">", ">=", "Object.is", "!Object.is"],
    message
  );
  /* assertion */
  let result = false;
  switch (operatorStr) {
    case "==": result = value1 == value2; break;
    case "!=": result = value1 != value2; break;
    case "===": result = value1 === value2; break;
    case "!==": result = value1 !== value2; break;
    case "<": result = value1 < value2; break;
    case "<=": result = value1 <= value2; break;
    case ">": result = value1 > value2; break;
    case ">=": result = value1 >= value2; break;
    case "Object.is": result = _oIs(value1, value2); break;
    case "!Object.is": result = !_oIs(value1, value2); break;
  }
  if (!result) {
    _watchdog(message, equal);
    throw new AssertionError({
      message: `[operator] Assertion failed: ${_str(value1)} does not match with the operator ${_str(operatorStr)} and ${_str(value2)}${_msg(message)}`,
      actual: value1,
      expected: value2,
      operator: operatorStr
    });
  }
}


/* testrunner functions */

/**
 * @description Synchronously runs a block of code and returns either its result or the caught error.
 * @param {string} name
 * @param {Function} block - The function to execute.
 * @returns {TestResult<T>} The result of the block if successful, or the caught error if it throws.
 */
function testSync <T>(
  name: string = "assert.testSync",
  block: () => T): TestResult<T> {
  try {
    return {ok: true, value: block(), block, name: _str(name)};
  } catch (error) {
    return {
      ok: false,
      error: _isError(error) ? error : new Error(_str(error)),
      block,
      name: _str(name)
    };
  }
}

/**
 * @description Asynchronously runs a block of code and returns either its resolved result or the caught error.
 * @param {string} name
 * @param {Function} block - The async function to execute.
 * @returns {Promise<TestResult<T>>} A promise that resolves to either the result or an Error.
 */
async function testAsync <T>(
  name: string = "assert.testAsync",
  block: () => Promise<T>): Promise<TestResult<T>> {
  try {
    return {ok: true, value: await block(), block, name: _str(name)};
  } catch (error) {
    return {
      ok: false,
      error: _isError(error) ? error : new Error(_str(error)),
      block,
      name: _str(name)
    };
  }
}

/**
 * @description Checks if the result is successful and narrows the type accordingly.
 * @param {TestResult<T>} result
 * @returns {boolean}
 */
function testCheck <T>(result: TestResult<T>):
  result is {ok: true, value: T, block: Function, name: string} {
  return result.ok;
}

/**
 * @description The TestSuite is a collection of TestResults with custom methods.
 * @constructor
 */
class TestSuite {
  private readonly results: TestResult<any>[] = [];
  /**
   * @description Add testcases.
   * @param {Array<TestResult<any>>} args
   * @returns {TestSuite} this
   */
  add(...args: Array<TestResult<any>>): this {
    for (let item of args) { this.results.push(item); }
    return this;
  }
  /** * @description Clear all testResults. * @returns {TestSuite} this */
  clear(): this {
    this.results.length = 0;
    return this;
  }
  /**
   * @description Return an Iterator with failed testCases.
   * @returns {Iterator<TestResult<any>>}
   */
  get size(): number { return this.results.length; }
  /**
   * @description Return an Iterator with success testCases.
   * @returns {Iterator<TestResult<any>>}
   */
  success (): Iterator<TestResult<any>> {
    return this.results.filter((testCase) => testCase.ok).values();
  }
  /**
   * @description Return an Iterator with failed testCases.
   * @returns {Iterator<TestResult<any>>}
   */
  failed (): Iterator<TestResult<any>> {
    return this.results.filter((testCase) => !testCase.ok).values();
  }
  /**
   * @description Return an Iterator with all testCases.
   * @returns {Iterator<TestResult<any>>}
   */
  values (): Iterator<TestResult<any>> { return this.results.values(); }
  /**
   * @description Return an Array with all testCases.
   * @returns {Array<TestResult<any>>}
   */
  toArray (): Array<TestResult<any>> { return this.results.slice(); }
  /**
   * @description Return an Iterator with all testCases.
   * @returns {Iterator<TestResult<any>>}
   */
  [Symbol.iterator](): Iterator<TestResult<any>> {
    return this.results.values();
  }
}


/* build the assert library function */
assert.VERSION = "assert.js v1.2.2";
assert.config = { "alwaysStrict": false };
/** @see https://wiki.commonjs.org/wiki/Unit_Testing/1.0 */
assert.AssertionError = AssertionError;
assert.ok = ok;
assert.equal = equal;
assert.notEqual = notEqual;
assert.strictEqual = strictEqual;
assert.notStrictEqual = notStrictEqual;
assert.deepEqual = deepEqual;
assert.notDeepEqual = notDeepEqual;
assert.deepStrictEqual = deepEqual; /* alias */
assert.notDeepStrictEqual = notDeepEqual; /* alias */
assert.throws = throws;
assert.rejects = rejects;
assert.doesNotReject = doesNotReject;
/* missing: assert.doesNotThrow(fn[, error][, message]); */
/* missing: assert.partialDeepStrictEqual(actual, expected[, message]); */
/* extensions */
assert.fail = fail;
assert.notOk = notOk;
assert.isTrue = isTrue;
assert.isNotTrue = isNotTrue;
assert.isFalse = isFalse;
assert.isNotFalse = isNotFalse;
assert.is = is;
assert.typeOf = typeOf;
assert.notTypeOf = notTypeOf;
assert.instanceOf = instanceOf;
assert.notInstanceOf = notInstanceOf;
assert.isNot = isNot;
assert.isNullish = isNullish;
assert.ifError = isNullish; /* alias */
assert.isNonNullable = isNonNullable;
assert.isNull = isNull;
assert.isNotNull = isNotNull;
assert.isUndefined = isUndefined;
assert.isDefined = isDefined;
assert.isString = isString;
assert.isNotString = isNotString;
assert.isNumber = isNumber;
assert.isNotNumber = isNotNumber;
assert.isBigInt = isBigInt;
assert.isNotBigInt = isNotBigInt;
assert.isBoolean = isBoolean;
assert.isNotBoolean = isNotBoolean;
assert.isSymbol = isSymbol;
assert.isNotSymbol = isNotSymbol;
assert.isFunction = isFunction;
assert.isNotFunction = isNotFunction;
assert.isObject = isObject;
assert.isNotObject = isNotObject;
assert.isPrimitive = isPrimitive;
assert.isNotPrimitive = isNotPrimitive;
assert.isNaN = isNaN;
assert.isNotNaN = isNotNaN;
assert.isInt = isInt;
assert.isNotInt = isNotInt;
assert.isFloat = isFloat;
assert.isNotFloat = isNotFloat;
assert.isEmpty = isEmpty;
assert.isNotEmpty = isNotEmpty;
assert.match = match;
assert.doesNotMatch = doesNotMatch;
assert.lt = lt;
assert.lte = lte;
assert.gt = gt;
assert.gte = gte;
assert.inRange = inRange;
assert.notInRange = notInRange;
assert.stringContains = stringContains;
assert.stringNotContains = stringNotContains;
assert.stringStartsWith = stringStartsWith;
assert.stringNotStartsWith = stringNotStartsWith;
assert.stringEndsWith = stringEndsWith;
assert.stringNotEndsWith = stringNotEndsWith;
assert.includes = includes;
assert.doesNotInclude = doesNotInclude;
assert.oneOf = oneOf;
assert.notOneOf = notOneOf;
assert.operator = operator;
/* testrunner functions */
assert.testSync = testSync;
assert.test = testSync; /* alias */
assert.it = testSync; /* alias */
assert.testAsync = testAsync;
assert.testCheck = testCheck;
assert.TestSuite = TestSuite;
/* undocumented helper functions */
/* assert._isError = _isError;
assert._isArray = _isArray;
assert._ownKeys = _ownKeys;
assert._oIs = _oIs;
assert._typeOf = _typeOf;
assert._isSameType = _isSameType;
assert._classOf = _classOf;
assert._isTypedArray = _isTypedArray;
assert._isDeepEqual = _isDeepEqual;
assert._is = _is;
assert._getPrototypeOf = _getPrototypeOf;
assert._toStr = _toStr;
assert._msg = _msg;
assert._lt = _lt;
assert._lte = _lte;
assert._inRange = _inRange;
assert._includes = _includes;
assert._isEmpty = _isEmpty;
assert._isPrimitive = _isPrimitive;
assert._isFloat = _isFloat;
assert._watchdog = _watchdog; */

/* ESM export */
export { assert };
export default assert;
