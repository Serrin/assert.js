// @ts-check
/// <reference lib="esnext" />
/// <reference lib="esnext.iterator" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="webworker.importscripts" />
"use strict";


/**
 * @name assert.js
 * @version 1.2.0
 * @author Ferenc Czigler
 * @see https://github.com/Serrin/assert.js/
 * @license MIT https://opensource.org/licenses/MIT
 */


const VERSION = "assert.js v1.2.0";


const config = { "alwaysStrict": false };


/*
standard unit testing:
https://wiki.commonjs.org/wiki/Unit_Testing/1.0

Mozilla Assert functions
https://firefox-source-docs.mozilla.org/testing/assert.html

Google Clojure Asserts
https://google.github.io/closure-library/api/goog.asserts.html
*/


/** TS browser and NodeJS common types from Celestra v6.7.0 **/


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

/** * @description Number and BigInt-like object. * @private */
type NumericLike = NumberLike | BigIntLike;

/** * @description String-like object. * @private */
type StringLike = string | String;

/** * @description String-like object. * @private */
type SymbolLike = symbol | Symbol;

/** * @description Any iterable or iterator. * @private */
/* @ts-ignore */
type IterableLike = Iterable<any> | Iterator<any> | IterableIterator<any>;

/** * @description Any iterable, iterator or array-like objects. * @private */
/* @ts-ignore */
type IterableLikeAndArrayLike =
  Iterable<any> | Iterator<any> | IterableIterator<any> | ArrayLike<any>;

/** * @description Iterable and Iterator and Generator types. * @private */
/* @ts-ignore */
type GeneratorLike =
  Iterable<any> | Iterator<any> | Generator<any, void, unknown>;

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
type ArrowFunction<Args extends any[] = any[], R = any> =
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
  (Error as any).isError = function isError (value: unknown) {
    let className =
      Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
    return (className === "error" || className === "domexception");
  };
}


/* Helper functions */


/**
 * Extended typeof operator with "null" type as string.
 * @param {unknown} x
 * @returns string
 * @private
 */
const _typeOf = (x: unknown): string => x === null ? "null" : typeof x;


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
  let vType: string = _typeOf(v);
  if (vType !== "object" && vType !== "function") { return vType; }
  /* objects and functions */
  let ctor: string;
  try {
    ctor = Object.getPrototypeOf(v)?.constructor?.name ?? "Object";
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
  if (Object.is(x, y)) { return true; }
  /* Object Wrappers (Boolean, Number, BigInt, String) */
  if (_typeOf(x) === "object" && _isPrimitive(y) && _classOf(x) === typeof y) {
    return Object.is(x.valueOf(), y);
  }
  if (_isPrimitive(x) && _typeOf(y) === "object" && typeof x === _classOf(y)) {
    return Object.is(x, y.valueOf());
  }
  /* type (primitives, object, null, NaN) */
  /*if (_deepType(value1) !== _deepType(value2)) { return false; }*/
  if (!_isSameType(x, y)) { return false; }
  /* objects */
  if (_isSameType(x, y, "object")) {
    /* objects / same memory adress */
    if (Object.is(x, y)) { return true; }
    /* objects / not same constructor */
    if (Object.getPrototypeOf(x).constructor !==
      Object.getPrototypeOf(y).constructor
    ) {
      return false;
    }
    /* objects / WeakMap + WeakSet */
    if (_isSameInstance(x, y, WeakMap) || _isSameInstance(x, y, WeakSet)) {
      return Object.is(x, y);
    }
    /* objects / Wrapper objects: Number, Boolean, String, BigInt */
    if (_isSameInstance(x, y, Number)
      || _isSameInstance(x, y, Boolean)
      || _isSameInstance(x, y, String)
      || _isSameInstance(x, y, Symbol)
      || _isSameInstance(x, y, BigInt)) {
      return Object.is(x.valueOf(), y.valueOf());
    }
    /* objects / Array */
    if (Array.isArray(x) && Array.isArray(y)) {
      if (x.length !== y.length) { return false; }
      if (x.length === 0) { return true; }
      return x.every((v: unknown, i: any): boolean => _isDeepEqual(v, y[i]));
    }
    /* objects / TypedArrays */
    if (_isTypedArray(x) && _isTypedArray(y) && _classOf(x) === _classOf(y)) {
      if ((x as any).length !== (y as any).length) { return false; }
      if ((x as any).length === 0) { return true; }
      return (x as any).every(
        (v: unknown, i: any): boolean => Object.is(v, (y as any)[i])
      );
    }
    /* objects / ArrayBuffer */
    if (_isSameInstance(x, y, ArrayBuffer)) {
      if (x.byteLength !== y.byteLength) { return false; }
      if (x.byteLength === 0) { return true; }
      let xTA = new Int8Array(x)
      let yTA = new Int8Array(y);
      return xTA.every(
        (v: unknown, i: number): boolean => Object.is(v, yTA[i])
      );
    }
    /* objects / DataView */
    if (_isSameInstance(x, y, DataView)) {
      if (x.byteLength !== y.byteLength) { return false; }
      if (x.byteLength === 0) { return true; }
      for (let i = 0; i < x.byteLength; i++) {
        if (!Object.is(x.getUint8(i), y.getUint8(i))) { return false; }
      }
      return true;
    }
    /* objects / Map */
    if (_isSameInstance(x, y, Map)) {
      if (x.size !== y.size) { return false; }
      if (x.size === 0) { return true; }
      return [...x.keys()].every(
        (v: unknown): boolean => _isDeepEqual(x.get(v), y.get(v)));
    }
    /* objects / Set */
    if (_isSameInstance(x, y, Set)) {
      if (x.size !== y.size) { return false; }
      if (x.size === 0) { return true; }
      return [...x.keys()].every((v: unknown): boolean => y.has(v));
    }
    /* objects / RegExp */
    if (_isSameInstance(x, y, RegExp)) {
      return Object.is(x.lastIndex, y.lastIndex)
        && Object.is(x.flags, y.flags)
        && Object.is(x.source, y.source);
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
    if (_isSameInstance(x, y, Date)) { return Object.is(+x, +y); }
    /* objects / Proxy -> not detectable */
    /* objects / objects */
    let xKeys: Array<string | symbol> = Reflect.ownKeys(x);
    let yKeys: Array<string | symbol> = Reflect.ownKeys(y);
    if (xKeys.length !== yKeys.length) { return false; }
    if (xKeys.length === 0) { return true; }
    return xKeys.every((key: string | symbol): boolean =>
      _isDeepEqual(x[key], y[key])
    );
  }
  /* default return false */
  return false;
}


/**
 * @description Checks if the given value is the given type(s).
 * @param {unknown} v
 * @param {ExpectedType} eT
 * @param {string} [caller] - The name of the caller function.
 * @returns {boolean}
 * @throws {TypeError} If ExpectedType is not a neccesary type.
 * @private
 */
function _is (v: unknown, eT: ExpectedType, caller: string = "is"): boolean {
  /* caching types of the arguments */
  let eTT: string = _typeOf(eT);
  /* expectedType is a `string` */
  if (eTT === "string") { return _typeOf(v) === eT; }
  /* expectedType is a `function` */
  if (eTT === "function") { return v instanceof (eT as Function); }
  /* expectedType is an `Array` */
  if (Array.isArray(eT)) {
    return (eT as Array<unknown>).some(
      function (item: unknown) {
        if (typeof item === "string") { return _typeOf(v) === item; }
        if (typeof item === "function") { return v instanceof item; }
        /* other types -> throw a TypeError */
        throw new TypeError(
          `[${caller}] TypeError: expectedType array elements have to be a string or function. Got ${_typeOf(item)}`
        );
      }
    );
  }
  /* expectedtype error -> throw a `TypeError` */
  throw new TypeError(
    `[${_toStr(caller)}] TypeError: expectedType must be a string, function or array. Got ${_toStr(eTT)}`
  );
}


/**
 * @description This function is a general purpose, type safe, predictable stringifier. Converts a value into a human-readable string for error messages Handles symbols, functions, nullish, circular references, etc.
 * @param {unknown} v
 * @returns {string}
 * @private
 */
function _toStr (v: unknown): string {
  let seen = new WeakSet<object>();
  function replacer (_key: string, v: unknown): any {
    let vT: string = _typeOf(v);
    if (vT === "function") {
      return `[Function: ${(v as Function).name || "anonymous"}]`;
    }
    if (vT === "symbol") { return (v as Symbol).toString(); }
    if (v instanceof Date) { return `Date(${v.toISOString()})`; }
    if (v instanceof Error) {
      return `${v.name}: ${v.message}, ${v.stack ?? ""}`;
    }
    if (vT === "object") {
      if (seen.has(v as object)) { return "[Circular]"; }
      seen.add(v as object);
    }
    return v;
  }
  if (["undefined", "null", "string", "number", "boolean", "bigint"]
    .includes(_typeOf(v))) {
    return String(v);
  }
  if (Array.isArray(v)) { return `[${v.map(v => _toStr(v)).join(", ")}]`; }
  if (v instanceof Map) {
    return `Map(${v.size}){${Array.from(v.entries()).map(([k, v]): string => `${_toStr(k)} => ${_toStr(v)}`).join(", ")}}`;
  }
  if (v instanceof Set) {
    return `Set(${v.size}){${Array.from(v.values()).map(v => _toStr(v)).join(", ")}}`;
  }
  try {
    return JSON.stringify(v, replacer) ?? String(v);
  } catch (_error) {
    return String(v);
  }
}


/**
 * @description Error message generator helper function.
 * @param {unknown} msg
 * @returns {string}
 * @private
 */
const _addMsg = (msg: unknown): string => msg ? ` - ${_toStr(msg)}` : "";


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
const _lte = (x: Comparable, y: Comparable): boolean =>
  _isSameType(x, y) && (x < y || Object.is(x, y));


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
    && ((min < v && v < max) || Object.is(v, min) || Object.is(v, max));


/**
 * @description Checks if a key or value exists in a container.
 * @param {any} container The container to check.
 * @param {any} keyOrValue The key or value to look for.
 * @param {unknown} valueIfKey The value to check if the key exists.
 * @returns {boolean}
 * @private
 */
function _includes (
  container: any,
  keyOrValue: any,
  valueIfKey?: unknown): boolean {
  /* String */
  if (typeof container === "string" || container instanceof String) {
    return String(container).includes(keyOrValue);
  }
  /* Check for primitives, null, undefined */
  if (container == null || typeof container !== "object") { return false; }
  /* Map + WeakMap */
  if (container instanceof Map || container instanceof WeakMap) {
    if (!container.has(keyOrValue)) { return false; }
    return valueIfKey === undefined
      || Object.is(container.get(keyOrValue), valueIfKey);
  }
  /* WeakSet */
  if (container instanceof WeakSet) { return container.has(keyOrValue); }
  /* Iterator */
  if (typeof (container).next === "function") {
    let iterator = container;
    let result = iterator.next();
    while (!result.done) {
      if (Object.is(result.value, keyOrValue)) { return true; }
      result = iterator.next();
    }
    return false;
  }
  /* Array + TypedArray + Set + Iterables */
  if (Array.isArray(container)
    || _isTypedArray(container)
    || container instanceof Set
    || typeof container[Symbol.iterator] === "function") {
    let iterator = container[Symbol.iterator]();
    let result = iterator.next();
    while (!result.done) {
      if (Object.is(result.value, keyOrValue)) { return true; }
      result = iterator.next();
    }
    return false;
  }
  /* Plain object */
  if (!Object.hasOwn(container, keyOrValue)) { return false; }
  return valueIfKey === undefined
    || Object.is(container[keyOrValue], valueIfKey);
}


/**
 * @description Checks if a value is empty.
 * - `null`, `undefined`, and `NaN` are empty.
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
  /* Check undefined, null, NaN */
  if (v == null || v !== v) { return true; }
  /* Check Array, TypedArrays, string, String */
  if (Array.isArray(v)
    || _isTypedArray(v)
    || typeof v === "string"
    || v instanceof String) {
    return (v as any).length === 0;
  }
  /* Checks Map and Set */
  if (v instanceof Map || v instanceof Set) { return v.size === 0; }
  /* Check ArrayBuffer and DataView */
  if (v instanceof ArrayBuffer || v instanceof DataView) {
    return v.byteLength === 0;
  }
  /* Check Iterable objects */
  if (typeof v[Symbol.iterator] === "function") {
    return v[Symbol.iterator]().next().done;
  }
  /* Check Iterator objects */
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
    let keys: Array<string | symbol> = Reflect.ownKeys(v);
    if (keys.length === 0) return true;
    /* Special case: object with single "length" property that is 0 */
    if (keys.length === 1
      && keys[0] === "length"
      && (v as { length?: unknown }).length === 0) {
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
  typeof v === "number" && !Number.isNaN(v) && !Number.isInteger(v);


/**
 * @description If value is an error, then it will be thrown.
 * @param {unknown} msg
 * @param {Function} caller
 * @returns {void}
 * @private
 */
function _errorCheck (msg: unknown, caller: Function): void {
  if (Error.isError(msg)) {
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
 * @description Ensures that `value` is truthy. Throws an `AssertionError` if falsy.
 * @param {unknown} value
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function assert (value: unknown, message?: Message): asserts value {
  if (!value) {
    _errorCheck(message, assert);
    let msg =
      `[assert] Assertion failed: ${_toStr(value)} should be truly${_addMsg(message)}`;
    throw new AssertionError({
      message: msg,
      actual: value,
      expected: true,
      operator: "==",
    });
  }
}


/**
 * @description Alias for `assert(value, [message: string | Error]);`.
 * @param {unknown} value
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const ok = (value: unknown, message?: Message): asserts value =>
  assert(value, message);


/**
 * @description `assert.equal(actual, expected, [message: string | Error]);`
 * @param {unknown} actual
 * @param {unknown} expected
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function equal (actual: unknown, expected: unknown, message?: Message): void {
  if (assert.config.alwaysStrict === true) {
    return strictEqual(actual, expected, message);
  }
  if (actual != expected) {
    _errorCheck(message, equal);
    let msg =
      `[equal] Assertion failed: ${_toStr(actual)} and ${_toStr(expected)} should be equal${_addMsg(message)}`;
    throw new AssertionError({
      message: msg,
      actual: actual,
      expected: expected,
      operator: "!="
    });
  }
}


/**
 * @description Inverse of `equal(actual, expected, [message: string | Error]);`.
 * @param {unknown} actual
 * @param {unknown} expected
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function notEqual (
  actual: unknown,
  expected: unknown,
  message?: Message): void {
  if (assert.config.alwaysStrict === true) {
    return notStrictEqual(actual, expected, message);
  }
  if (actual == expected) {
    _errorCheck(message, notEqual);
    let msg =
      `[notEqual] Assertion failed: ${_toStr(actual)} and ${_toStr(expected)} should be equal${_addMsg(message)}`;
    throw new AssertionError({
      message: msg,
      actual: actual,
      expected: expected,
      operator: "=="
    });
  }
}


/**
 * @description Strict equality (`Object.is();`).
 * @param {unknown} actual
 * @param {unknown} expected
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function strictEqual (
  actual: unknown,
  expected: unknown,
  message?: Message): void {
  if (!Object.is(actual, expected)) {
    _errorCheck(message, strictEqual);
    let msg =
      `[strictEqual] Assertion failed: ${_toStr(actual)} and ${_toStr(expected)} should be strictly equal${_addMsg(message)}`;
    throw new AssertionError({
      message: msg,
      actual: actual,
      expected: expected,
      operator: "strictEqual"
    });
  }
}


/**
 * @description Inverse of `strictEqual(actual, expected, [message: string | Error]);`.
 * @param {unknown} actual
 * @param {unknown} expected
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function notStrictEqual (
  actual: unknown,
  expected: unknown,
  message?: Message): void {
  if (Object.is(actual, expected)) {
    _errorCheck(message, notStrictEqual);
    let msg =
      `[notStrictEqual] Assertion failed: ${_toStr(actual)} and ${_toStr(expected)} should not be strictly equal${_addMsg(message)}`;
    throw new AssertionError({
      message: msg,
      actual: actual,
      expected: expected,
      operator: "notStrictEqual"
    });
  }
}


/**
 * @description Deep equality check.
 * @param {unknown} actual
 * @param {unknown} expected
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function deepEqual (
  actual: unknown,
  expected: unknown,
  message?: Message): void {
  if (!_isDeepEqual(actual, expected)) {
    _errorCheck(message, deepEqual);
    let msg =
      `[deepEqual] Assertion failed: ${_toStr(actual)} and ${_toStr(expected)} should be deep equal${_addMsg(message)}`;
    throw new AssertionError({
      message: msg,
      actual: actual,
      expected: expected,
      operator: "deepEqual"
    });
  }
}


/**
 * @description Inverse of `deepEqual(actual, expected, [message: string | Error]);`.
 * @param {unknown} actual
 * @param {unknown} expected
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function notDeepEqual (
  actual: unknown,
  expected: unknown,
  message?: Message): void {
  if (_isDeepEqual(actual, expected)) {
    _errorCheck(message, notDeepEqual);
    let msg =
      `[notDeepEqual] Assertion failed: ${_toStr(actual)} and ${_toStr(expected)} should not be deep equal${_addMsg(message)}`;
    throw new AssertionError({
      message: msg,
      actual: actual,
      expected: expected,
      operator: "notDeepEqual"
    });
  }
}


/**
 * @description Ensures that a function throws.
 * @param {Function} block
 * @param {unknown} Error_opt
 * @param {string | Error} [message]
 * @returns {Error | undefined}
 * @throws {AssertionError}
 */
function throws (
  block: Function,
  Error_opt?: unknown,
  message?: Message): Error | undefined {
  let thrownError: any = undefined;
  try {
    block();
  } catch (catchedError) {
    thrownError = catchedError as Error;
  }
  if (!thrownError) {
    let msg =
      `[throws] Assertion failed: function did not throw${_addMsg(message)}`;
    throw new AssertionError({
      message: msg,
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
      let msg =
        `[throws] Assertion failed: function threw unexpected error: ${_toStr(thrownError)}${_addMsg(message)}`;
      throw new AssertionError({
        message: msg,
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
 * @param {string | Error} [message] - Optional custom message or Error.
 * @returns {Promise<unknown>} - Resolves with the rejection reason if assertion passes.
 * @throws {AssertionError}
 */
async function rejects (
  block: Function | Promise<unknown>,
  Error_opt?: unknown,
  message?: Message): Promise<unknown> {
  let rejectedError: any = undefined;
  try {
    let result = typeof block === "function" ? await block() : await block;
    /* If we reach here, it resolved successfully */
    let msg =
      `[rejects] Assertion failed: function/promise did not reject - ${_toStr(result)}${_addMsg(message)}`;
    throw new AssertionError({
      message: msg,
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
      let msg =
        `[rejects] Assertion failed: rejected with unexpected error: ${_toStr(rejectedError)}${_addMsg(message)}`;
      throw new AssertionError({
        message: msg,
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
 * @param {string | Error} [message]
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
        if (Error.isError(message)) throw message;
        let msg =
          `[doesNotReject] Assertion failed: function/promise rejected with disallowed error: ${_toStr(catchedError)}${_addMsg(message)}`;
        throw new AssertionError({
          message: msg,
          actual: catchedError,
          expected: undefined,
          operator: "doesNotReject"
        });
      }
    }
    _errorCheck(message, doesNotReject);
    let msg =
      `[doesNotReject] Assertion failed: function/promise rejected unexpectedly${_addMsg(message)}`;
    throw new AssertionError({
      message: msg,
      actual: catchedError,
      expected: undefined,
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
  _errorCheck(message, fail);
  let msg =
    `[fail] Assertion failed${message ? `: ${_toStr(message)}` : ""}`;
  throw new AssertionError({
    message: msg,
    actual: args.length > 1 ? args[0] : undefined,
    expected: args.length > 1 ? args[1] : undefined,
    operator: args.length > 1 ? args[3] : undefined
  });
}


/**
 * @description Ensures a value is falsy.
 * @param {unknown} value
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function notOk (value: unknown, message?: Message): asserts value is Falsy {
  if (value) {
    _errorCheck(message, notOk);
    let msg =
      `[notOk] Assertion failed: ${_toStr(value)} should be falsy${_addMsg(message)}`;
    throw new AssertionError({
      message: msg,
      actual: value,
      expected: false,
      operator: "=="
    });
  }
}


/**
 * @description Ensures value is exactly `true`.
 * @param {unknown} value
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isTrue = (value: unknown, message?: Message): asserts value is true =>
  strictEqual(value, true, message);


/**
 * @description Ensures value is exactly not `true`, but can be `false` or truthy or falsy.
 * @param {T} value
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isNotTrue = <T>(
  value: T,
  message?: Message): asserts value is Exclude<T, true> =>
  notStrictEqual(value, true, message);


/**
 * @description Ensures value is exactly `false`.
 * @param {unknown} value
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isFalse = (value: unknown, message?: Message): asserts value is false =>
  strictEqual(value, false, message);


/**
 * @description Ensures value is exactly not `false`, but can be `true` or truthy or falsy.
 * @param {T} value
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isNotFalse = <T>(
  value: T,
  message?: Message): asserts value is Exclude<T, false> =>
  notStrictEqual(value, false, message);


/**
 * @description Ensures a value matches a type or constructor. The expected type can be a string, function or an array of strings and functions.
 * @param {unknown} value
 * @param {string | Function | Array<string | Function>} expectedType
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function is (
  value: unknown,
  expectedType: ExpectedType,
  message?: Message): void {
  if (!_is(value, expectedType, "is")) {
    _errorCheck(message, is);
    let msg =
      `[is] Assertion failed: ${_toStr(value)} should be an expected type: ${_toStr(expectedType)}${_addMsg(message)}`;
    throw new AssertionError({
      message: msg,
      actual: value,
      expected: expectedType,
      operator: "is"
    });
  }
}


/**
 * @description Inverse of `is(value, expectedType, [message: string | Error]);`. The expected type can be a string, function or an array of strings and functions.
 * @param {unknown} value
 * @param {string | Function | Array<string | Function>} expectedType
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function isNot (
  value: unknown,
  expectedType: ExpectedType,
  message?: Message): void {
  if (_is(value, expectedType, "isNot")) {
    _errorCheck(message, isNot);
    let msg =
      `[isNot] Assertion failed: ${_toStr(value)} should not be an expected type: ${_toStr(expectedType)}${_addMsg(message)}`;
    throw new AssertionError({
      message: msg,
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
 * @param {string | Error} [message]
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
 * @param {string | Error} [message]
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
 * @param {string | Error} [message]
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
 * @param {string | Error} [message]
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
 * @description Ensures value is `null` or `undefined`.
 * @param {unknown} value
* @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isNullish = (
  value: unknown,
  message?: Message): asserts value is Nullish =>
  is(value, ["null", "undefined"], message);


/**
 * @description Ensures value is not `null` or `undefined`.
 * @param {unknown} value
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isNonNullable = (
  value: unknown,
  message?: Message): asserts value is NonNullable<unknown> =>
  isNot(value, ["null", "undefined"], message);


/**
 * @description Ensures value is `null`.
 * @param {unknown} value
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isNull = (value: unknown, message?: Message): asserts value is null =>
  is(value, "null", message);


/**
 * @description Ensures value is not `null`.
 * @param {unknown} value
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isNotNull = (
  value: unknown,
  message?: Message): asserts value is Exclude<unknown, null> =>
  isNot(value, "null", message);


/**
 * @description Ensures value is `undefined`.
 * @param {unknown} value
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isUndefined = (
  value: unknown,
  message?: Message): asserts value is undefined =>
  is(value, "undefined", message);


/**
 * @description Ensures value is not `undefined`.
 * @param {unknown} value
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isDefined = (
  value: unknown,
  message?: Message): asserts value is Exclude<unknown, undefined> =>
  isNot(value, "undefined", message);


/**
 * @description Ensures value is `string`.
 * @param {unknown} value
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isString = (value: unknown, message?: Message): asserts value is string =>
  is(value, "string", message);


/**
 * @description Ensures value is not `string`.
 * @param {unknown} value
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isNotString = (
  value: unknown,
  message?: Message): asserts value is Exclude<unknown, string> =>
  isNot(value, "string", message);


/**
 * @description Ensures value is `number`.
 * @param {unknown} value
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isNumber = (value: unknown, message?: Message): asserts value is number =>
  is(value, "number", message);


/**
 * @description Ensures value is not `number`.
 * @param {unknown} value
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isNotNumber = (
  value: unknown,
  message?: Message): asserts value is Exclude<unknown, number> =>
  isNot(value, "number", message);


/**
 * @description Ensures value is `bigint`.
 * @param {unknown} value
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isBigInt = (value: unknown, message?: Message): asserts value is bigint =>
  is(value, "bigint", message);


/**
 * @description Ensures value is not `bigint`.
 * @param {unknown} value
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isNotBigInt = (
  value: unknown,
  message?: Message): asserts value is Exclude<unknown, bigint> =>
  isNot(value, "bigint", message);


/**
 * @description Ensures value is `boolean`.
 * @param {unknown} value
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isBoolean = (
  value: unknown,
  message?: Message): asserts value is boolean =>
  is(value, "boolean", message);


/**
 * @description Ensures value is not `boolean`.
 * @param {unknown} value
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isNotBoolean = (
  value: unknown,
  message?: Message): asserts value is Exclude<unknown, boolean> =>
  isNot(value, "boolean", message);


/**
 * @description Ensures value is `symbol`.
 * @param {unknown} value
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isSymbol = (value: unknown, message?: Message): asserts value is symbol =>
  is(value, "symbol", message);


/**
 * @description Ensures value is not `symbol`.
 * @param {unknown} value
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isNotSymbol = (
  value: unknown,
  message?: Message): asserts value is Exclude<unknown, symbol> =>
  isNot(value, "symbol", message);


/**
 * @description Ensures value is `function`.
 * @param {unknown} value
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isFunction = (
  value: unknown,
  message?: Message): asserts value is Function =>
  is(value, "function", message);


/**
 * @description Ensures value is not `function`.
 * @param {unknown} value
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isNotFunction = (
  value: unknown,
  message?: Message): asserts value is Exclude<unknown, Function> =>
  isNot(value, "function", message);


/**
 * @description Ensures value is `object`.
 * @param {unknown} value
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isObject = (value: unknown, message?: Message): asserts value is object =>
  is(value, "object", message);


/**
 * @description Ensures value is not `object`.
 * @param {unknown} value
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isNotObject = (
  value: unknown,
  message?: Message): asserts value is Exclude<unknown, object> =>
  isNot(value, "object", message);


/**
 * @description Ensures value is not `object` or `function`.
 * @param {unknown} value
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isPrimitive = (
  value: unknown,
  message?: Message): asserts value is Primitive =>
  isNot(value, ["object", "function"], message);


/**
 * @description Ensures value is `object` or `function`.
 * @param {unknown} value
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isNotPrimitive = (
  value: unknown,
  message?: Message): asserts value is NonPrimitive =>
  is(value, ["object", "function"], message);


/**
 * @description Ensures value is a number and NaN.
 * @param {unknown} value
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isNaN = (value: unknown, message?: Message): void =>
  strictEqual(value, NaN, message);


/**
 * @description Ensures value is not a number and NaN.
 * @param {unknown} value
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const isNotNaN = (value: unknown, message?: Message): void =>
  notStrictEqual(value, NaN, message);


/**
 * @description Ensures value is a number and integer.
 * @param {unknown} value
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function isInt (value: unknown, message?: Message): void {
  if (!Number.isInteger(value)) {
    _errorCheck(message, isInt);
    let msg =
      `[isInt] Assertion failed: ${_toStr(value)} should be an integer${_addMsg(message)}`;
    throw new AssertionError({
      message: msg,
      actual: value,
      expected: "",
      operator: "isInt"
    });
  }
}


/**
 * @description Ensures value is not a number and integer.
 * @param {unknown} value
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function isNotInt (value: unknown, message?: Message): void {
  if (Number.isInteger(value)) {
    _errorCheck(message, isNotInt);
    let msg =
      `[isNotInt] Assertion failed: ${_toStr(value)} should not be an integer${_addMsg(message)}`;
    throw new AssertionError({
      message: msg,
      actual: value,
      expected: "",
      operator: "isNotInt"
    });
  }
}


/**
 * @description Ensures value is a float and integer.
 * @param {unknown} value
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function isFloat (value: unknown, message?: Message): void {
  if (!_isFloat(value)) {
    _errorCheck(message, isFloat);
    let msg =
      `[isFloat] Assertion failed: ${_toStr(value)} should be a float${_addMsg(message)}`;
    throw new AssertionError({
      message: msg,
      actual: value,
      expected: "",
      operator: "isFloat"
    });
  }
}


/**
 * @description Ensures value is not a number and float.
 * @param {unknown} value
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function isNotFloat (value: unknown, message?: Message): void {
  if (_isFloat(value)) {
    _errorCheck(message, isNotFloat);
    let msg =
      `[isNotFloat] Assertion failed: ${_toStr(value)} should not be a float${_addMsg(message)}`;
    throw new AssertionError({
      message: msg,
      actual: value,
      expected: "",
      operator: "isNotFloat"
    });
  }
}


/**
 * @description Ensures value is empty.
 * - `null`, `undefined`, and `NaN` are empty.
 * - Arrays, TypedArrays, and strings are empty if length === 0.
 * - Maps and Sets are empty if size === 0.
 * - ArrayBuffer and DataView are empty if byteLength === 0.
 * - Iterable objects are empty if they have no elements.
 * - Plain objects are empty if they have no own properties.
 * @param {unknown} value
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function isEmpty (value: unknown, message?: Message): void {
  if (!_isEmpty(value)) {
    _errorCheck(message, isEmpty);
    let msg =
      `[isEmpty] Assertion failed: ${_toStr(value)} should be empty${_addMsg(message)}`;
    throw new AssertionError({
      message: msg,
      actual: value,
      expected: "",
      operator: "isEmpty"
    });
  }
}


/**
 * @description Ensures value is not empty.
 * - `null`, `undefined`, and `NaN` are empty.
 * - Arrays, TypedArrays, and strings are empty if length === 0.
 * - Maps and Sets are empty if size === 0.
 * - ArrayBuffer and DataView are empty if byteLength === 0.
 * - Iterable objects are empty if they have no elements.
 * - Plain objects are empty if they have no own properties.
 * @param {unknown} value
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function isNotEmpty (value: unknown, message?: Message): void {
  if (_isEmpty(value)) {
    _errorCheck(message, isNotEmpty);
    let msg =
      `[isNotEmpty] Assertion failed: ${_toStr(value)} should be not empty${_addMsg(message)}`;
    throw new AssertionError({
      message: msg,
      actual: value,
      expected: "",
      operator: "isNotEmpty"
    });
  }
}


/**
 * @description Ensures a string matches a regular expression.
 * @param {string} string
 * @param {RegExp} regexp
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {TypeError} If parameter types are not matched.
 * @throws {AssertionError}
 */
function match (string: StringLike, regexp: RegExp, message?: Message): void {
  /* Type validation */
  is(string, ["string", String], message);
  is(regexp, RegExp, message);
  /* Assertion */
  if (!(regexp.test(String(string)))) {
    _errorCheck(message, match);
    let msg =
      `[match] Assertion failed: ${_toStr(string)} is not matched with ${_toStr(regexp)}${_addMsg(message)}`;
    throw new AssertionError({
      message: msg,
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
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {TypeError} If parameter types are not matched.
 * @throws {AssertionError}
 */
function doesNotMatch (
  string: StringLike,
  regexp: RegExp,
  message?: Message): void {
  /* Type validation */
  is(string, ["string", String], message);
  is(regexp, RegExp, message);
  /* Assertion */
  if (regexp.test(String(string))) {
    _errorCheck(message, doesNotMatch);
    let msg =
      `[doesNotMatch] Assertion failed: ${_toStr(string)} is matched with ${_toStr(regexp)}${_addMsg(message)}`;
    throw new AssertionError({
      message: msg,
      actual: string,
      expected: regexp,
      operator: "doesNotMatch"
    });
  }
}


/**
 * @description Ensures `a < b` and value types have to be same type.
 * @param {Comparable} value1 The value1 to check.
 * @param {Comparable} value2 The value2 to check.
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function lt (value1: Comparable, value2: Comparable, message?: Message): void {
  if (!_lt(value1, value2)) {
    _errorCheck(message, lt);
    let msg =
      `[lt] Assertion failed: ${_toStr(value1)} should be less than ${_toStr(value2)}${_addMsg(message)}`;
    throw new AssertionError({
      message: msg,
      actual: value1,
      expected: value2,
      operator: "<"
    });
  }
}


/**
 * @description Ensures `a >= b` and value types have to be same type.
 * @param {Comparable} value1 The value1 to check.
 * @param {Comparable} value2 The value2 to check.
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function lte (value1: Comparable, value2: Comparable, message?: Message): void {
  if (!_lte(value1, value2)) {
    _errorCheck(message, lte);
    let msg =
      `[lte] Assertion failed: ${_toStr(value1)} should be less than or equal ${_toStr(value2)}${_addMsg(message)}`;
    throw new AssertionError({
      message: msg,
      actual: value1,
      expected: value2,
      operator: "< or Object.is();"
    });
  }
}


/**
 * @description Ensures `a > b` and value types have to be same type.
 * @param {Comparable} value1 The value1 to check.
 * @param {Comparable} value2 The value2 to check.
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function gt (value1: Comparable, value2: Comparable, message?: Message): void {
  if (!_lt(value2, value1)) {
    _errorCheck(message, gt);
    let msg =
      `[gt] Assertion failed: ${_toStr(value1)} should be greater than ${_toStr(value2)}${_addMsg(message)}`;
    throw new AssertionError({
      message: msg,
      actual: value1,
      expected: value2,
      operator: ">"
    });
  }
}


/**
 * @description Ensures `a <= b` and value types have to be same type.
 * @param {Comparable} value1 The value1 to check.
 * @param {Comparable} value2 The value2 to check.
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function gte (value1: Comparable, value2: Comparable, message?: Message): void {
  if (!_lte(value2, value1)) {
    _errorCheck(message, gte);
    let msg =
      `[gte] Assertion failed: ${_toStr(value1)} should be greater than or equal ${_toStr(value2)}${_addMsg(message)}`;
    throw new AssertionError({
      message: msg,
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
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function inRange (
  value: Comparable,
  min: Comparable,
  max: Comparable,
  message?: Message): void {
  if (!_inRange(value, min, max)) {
    _errorCheck(message, inRange);
    let msg =
      `[inRange] Assertion failed: ${_toStr(value)} should be in range ${_toStr(min)} and ${_toStr(max)} or the type of the values are not the same${_addMsg(message)}`;
    throw new AssertionError({
      message: msg,
      actual: value,
      expected: `${_toStr(min)} and ${_toStr(max)}`,
      operator: "inRange"
    });
  }
}


/**
 * @description Inverse of `inRange(value, min, max, [message: string | Error]);`.
 * @param {Comparable} value
 * @param {Comparable} min
 * @param {Comparable} max
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function notInRange (
  value: Comparable,
  min: Comparable,
  max: Comparable,
  message?: Message): void {
  if (_inRange(value, min, max)) {
    _errorCheck(message, notInRange);
    let msg =
      `[notInRange] Assertion failed: ${_toStr(value)} should be not in range ${_toStr(min)} and ${_toStr(max)}${_addMsg(message)}`;
    throw new AssertionError({
      message: msg,
      actual: value,
      expected: `${_toStr(min)} and ${_toStr(max)}`,
      operator: "notInRange"
    });
  }
}


/**
 * @description Asserts that `actual` (a string) contains the specified `substring`.
 * @param {string} actual - The string to check.
 * @param {string} substring - The substring expected to appear within `actual`.
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function stringContains (
  actual: StringLike,
  substring: StringLike,
  message?: Message): void {
  /* Type validation */
  is(actual, ["string", String], message);
  is(substring, ["string", String], message);
  /* Assertion */
  if (!String(actual).includes(String(substring))) {
    _errorCheck(message, stringContains);
    let msg =
      `[stringContains] Assertion failed: ${_toStr(actual)} does not contain substring ${_toStr(substring)}${_addMsg(message)}`;
    throw new AssertionError({
      message: msg,
      actual,
      expected: substring,
      operator: "stringContains"
    });
  }
}


/**
 * @description Asserts that `actual` (a string) does NOT contain the specified `substring`.
 * @param {string} actual - The string to check.
 * @param {string} substring - The substring that must not appear in `actual`.
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function stringNotContains (
  actual: StringLike,
  substring: StringLike,
  message?: Message): void {
  /* Type validation */
  is(actual, ["string", String], message);
  is(substring, ["string", String], message);
  /* Assertion */
  if (actual.includes(String(substring))) {
    _errorCheck(message, stringNotContains);
    let msg =
      `[stringNotContains] Assertion failed: ${_toStr(actual)} should not contain substring ${_toStr(substring)}${_addMsg(message)}`;
    throw new AssertionError({
      message: msg,
      actual,
      expected: substring,
      operator: "stringNotContains"
    });
  }
}


/**
 * @description Asserts that `actual` (a string) starts with the specified `substring`.
 * @param {string} actual - The string to check.
 * @param {string} substring - The substring expected to appear within `actual`.
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function stringStartsWith (
  actual: StringLike,
  substring: StringLike,
  message?: Message): void {
  /* Type validation */
  is(actual, ["string", String], message);
  is(substring, ["string", String], message);
  /* Assertion */
  if (!String(actual).startsWith(String(substring))) {
    _errorCheck(message, stringStartsWith);
    let msg =
      `[stringStartsWith] Assertion failed: ${_toStr(actual)} does not start with substring ${_toStr(substring)}${_addMsg(message)}`;
    throw new AssertionError({
      message: msg,
      actual,
      expected: substring,
      operator: "stringStartsWith"
    });
  }
}


/**
 * @description Asserts that `actual` (a string) does not start with the specified `substring`.
 * @param {string} actual - The string to check.
 * @param {string} substring - The substring expected to appear within `actual`.
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function stringNotStartsWith (
  actual: StringLike,
  substring: StringLike,
  message?: Message): void {
  /* Type validation */
  is(actual, ["string", String], message);
  is(substring, ["string", String], message);
  /* Assertion */
  if (String(actual).startsWith(String(substring))) {
    _errorCheck(message, stringNotStartsWith);
    let msg =
      `[stringNotStartsWith] Assertion failed: ${_toStr(actual)} starts with substring ${_toStr(substring)}${_addMsg(message)}`;
    throw new AssertionError({
      message: msg,
      actual,
      expected: substring,
      operator: "doesNotStartWith"
    });
  }
}


/**
 * @description Asserts that `actual` (a string) ends with the specified `substring`.
 * @param {string} actual - The string to check.
 * @param {string} substring - The substring expected to appear within `actual`.
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function stringEndsWith (
  actual: StringLike,
  substring: StringLike,
  message?: Message): void {
  /* Type validation */
  is(actual, ["string", String], message);
  is(substring, ["string", String], message);
  /* Assertion */
  if (!String(actual).endsWith(String(substring))) {
    _errorCheck(message, stringEndsWith);
    let msg =
      `[stringEndsWith] Assertion failed: ${_toStr(actual)} does not end with substring ${_toStr(substring)}${_addMsg(message)}`;
    throw new AssertionError({
      message: msg,
      actual,
      expected: substring,
      operator: "stringEndsWith"
    });
  }
}


/**
 * @description Asserts that `actual` (a string) does not end with the specified `substring`.
 * @param {string} actual - The string to check.
 * @param {string} substring - The substring expected to appear within `actual`.
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
function stringNotEndsWith (
  actual: StringLike,
  substring: StringLike,
  message?: Message): void {
  /* Type validation */
  is(actual, ["string", String], message);
  is(substring, ["string", String], message);
  /* Assertion */
  if (String(actual).endsWith(String(substring))) {
    _errorCheck(message, stringNotEndsWith);
    let msg =
      `[stringNotEndsWith] Assertion failed: ${_toStr(actual)} ends with substring ${_toStr(substring)}${_addMsg(message)}`;
    throw new AssertionError({
      message: msg,
      actual,
      expected: substring,
      operator: "stringEndsWith"
    });
  }
}


/**
 * @description Ensures a container includes a key and value.
 * @param {any} container The container to check.
 * @param {IncludesOptions} options Options object with the checking key and value.
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {TypeError} If parameter types are not matched.
 * @throws {AssertionError}
 */
function includes (
  container: any,
  options: IncludesOptions,
  message?: Message): void {
  /* Type validation */
  is(options, "object", message);
  /* Assertion */
  if (!_includes(container, options.keyOrValue, options?.value ?? undefined)) {
    _errorCheck(message, includes);
    let msg =
      `[includes] Assertion failed: ${_toStr(container)} does not include${_toStr(options)}${_addMsg(message)}`;
    throw new AssertionError({
      message: msg,
      actual: container,
      expected: options,
      operator: "includes"
    });
  }
}


/**
 * @description Ensures a container does not include a key and value.
 * @param {any} container The container to check.
 * @param {IncludesOptions} options Options object with the checking key and value.
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {TypeError} If parameter types are not matched.
 * @throws {AssertionError}
 */
function doesNotInclude (
  container: any,
  options: IncludesOptions,
  message?: Message): void {
  /* Type validation */
  is(options, "object", message);
  /* Assertion */
  if (_includes(container, options.keyOrValue, options?.value ?? undefined)) {
    _errorCheck(message, doesNotInclude);
    let msg =
      `[doesNotInclude] Assertion failed: ${_toStr(container)} does not include ${_toStr(options)}${_addMsg(message)}`;
    throw new AssertionError({
      message: msg,
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
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const oneOf = (value: unknown, collection: unknown, message?: Message): void =>
  includes(collection, {keyOrValue: value}, message);


/**
 * @description Ensures a value is not in a flat collection (`Array`, iterables, etc.).
 * @param {unknown} value
 * @param {unknown} collection - List of the possibly values.
 * @param {string | Error} [message]
 * @returns {void}
 * @throws {AssertionError}
 */
const notOneOf = (
  value: unknown,
  collection: unknown,
  message?: Message): void =>
  doesNotInclude(collection, {keyOrValue: value}, message);


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
    return {ok: true, value: block(), block: block, name: _toStr(name)};
  } catch (error) {
    return {
      ok: false,
      error: Error.isError(error) ? error : new Error(_toStr(error)),
      block: block,
      name: _toStr(name)
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
  block: () => Promise<T>
  ): Promise<TestResult<T>> {
  try {
    return {
      ok: true,
      value: await block(),
      block: block,
      name: _toStr(name)
    };
  } catch (error) {
    return {
      ok: false,
      error: Error.isError(error) ? error : new Error(_toStr(error)),
      block: block,
      name: _toStr(name)
    };
  }
}


/**
 * @description Checks if the result is successful and narrows the type accordingly.
 * @param {TestResult<T>} result - The result to check.
 * @returns {boolean} True if the result is successful, false otherwise.
 */
function testCheck <T>(result: TestResult<T>):
  result is { ok: true; value: T, block: Function, name: string} {
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
  /**
   * @description Clear all testResults.
   * @returns {TestSuite} this
   */
  clear(): this {
    this.results.length = 0;
    return this;
  }
  /**
   * @description Return an IterableIterator with failed testCases.
   * @returns {IterableIterator<TestResult<any>>}
   */
  get size(): number { return this.results.length; }
  /**
   * @description Return an IterableIterator with success testCases.
   * @returns {IterableIterator<TestResult<any>>}
   */
  success (): IterableIterator<TestResult<any>> {
    return this.results.filter((testCase) => testCase.ok).values();
  }
  /**
   * @description Return an IterableIterator with failed testCases.
   * @returns {IterableIterator<TestResult<any>>}
   */
  failed (): IterableIterator<TestResult<any>> {
    return this.results.filter((testCase) => !testCase.ok).values();
  }
  /**
   * @description Return an IterableIterator with all testCases.
   * @returns {IterableIterator<TestResult<any>>}
   */
  values (): IterableIterator<TestResult<any>> {
    return this.results.values();
  }
  /**
   * @description Return an Array with all testCases.
   * @returns {Array<TestResult<any>>}
   */
  toArray (): Array<TestResult<any>> { return this.results.slice(); }
  /**
   * @description Return an IterableIterator with all testCases.
   * @returns {IterableIterator<TestResult<any>>}
   */
  [Symbol.iterator](): Iterator<TestResult<any>> {
    return this.results[Symbol.iterator]();
  }
}


/* build the assert library function */
assert.VERSION = VERSION;
assert.config = config;
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
/* testrunner functions */
assert.testSync = testSync;
assert.test = testSync; /* alias */
assert.it = testSync; /* alias */
assert.testAsync = testAsync;
assert.testCheck = testCheck;
assert.TestSuite = TestSuite;
/* undocumented developer functions */
/*assert._typeOf = _typeOf;
assert._isSameType = _isSameType;
assert._classOf = _classOf;
assert._isTypedArray = _isTypedArray;
assert._isDeepEqual = _isDeepEqual;
assert._is = _is;
assert._toStr = _toStr;
assert._addMsg = _addMsg;
assert._lt = _lt;
assert._lte = _lte;
assert._inRange = _inRange;
assert._includes = _includes;
assert._isEmpty = _isEmpty;
assert._isPrimitive = _isPrimitive;
assert._isFloat = _isFloat;
assert._errorCheck = _errorCheck;*/


/* ESM export */
export {assert};
export default assert;
