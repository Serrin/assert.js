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
 * @version 1.1.9
 * @author Ferenc Czigler
 * @see https://github.com/Serrin/assert.js/
 * @license MIT https://opensource.org/licenses/MIT
 */


const VERSION = "assert.js v1.1.9";


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
  cause?: any,
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

/** * The expected type(s) for type checking. * @private */
type ExpectedType = string | Function | Array<string | Function>;

/** * The expected options object for type includes functions * @private */
type IncludesOptions = { keyOrValue: any, value?: any };


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
 * @param {unknown} value
 * @returns string
 */
const _typeOf = (value: unknown): string =>
  value === null ? "null" : typeof value;


/**
 * @description Checks if two values are the same type.
 * @param {any} value1 - The first value to compare.
 * @param {any} value2 - The second value to compare.
 * @returns {boolean} True if both values are of the same type, false otherwise.
 */
const _isSameType = (value1: any, value2: any): boolean =>
  _typeOf(value1) === _typeOf(value2);


/**
 * @description Return the typeof operator result of the given value,except return "null" instead of "object" for null, and provide detailed object class names (Array, Date, etc. and custom classes).
 * @param {unknown} value - The value to check.
 * @returns {ClassOfTag}
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
function _classOf (value: unknown): string {
  /* primitives */
  let valueType: string = _typeOf(value);
  if (valueType !== "object" && valueType !== "function") { return valueType; }
  /* objects and functions */
  let ctor: string;
  try {
    ctor = Object.getPrototypeOf(value)?.constructor?.name ?? "Object";
  } catch (_error) {
    ctor = Object.prototype.toString.call(value).slice(8, -1);
  }
  return ctor === "Object" || ctor === "Function" ? ctor.toLowerCase() : ctor;
}


/**
 * @description Checks if the given value is a TypedArray (Int8Array, etc.).
 * @param {unknown} value - The value to check.
 * @returns True if the value is a TypedArray, false otherwise.
 */
const _isTypedArray = (value: unknown): value is TypedArray =>
  ArrayBuffer.isView(value) && !(value instanceof DataView);


/**
 * @description Checks if the values are deep equal.
 * @param {unknown} value1 - The value to check.
 * @param {unknown} value2 - The value to check.
 * @returns {boolean} True if the value are deep equal, false otherwise.
 * @private
 */
function _isDeepEqual (value1: any, value2: any): boolean {
  /* helper functions */
  const _isSameInstance =
    (value1: unknown, value2: unknown, Class: Function): boolean =>
      value1 instanceof Class && value2 instanceof Class;
  /* primitives: Boolean, Number, BigInt, String + Function + Symbol */
  if (Object.is(value1, value2)) { return true; }
  /* Object Wrappers (Boolean, Number, BigInt, String) */
  if (_typeOf(value1) === "object" && _isPrimitive(value2)
    && _classOf(value1) === typeof value2) {
    return Object.is(value1.valueOf(), value2);
  }
  if (_isPrimitive(value1)
    && _typeOf(value2) === "object"
    && typeof value1 === _classOf(value2)) {
    return Object.is(value1, value2.valueOf());
  }
  /* type (primitives, object, null, NaN) */
  /*if (_deepType(value1) !== _deepType(value2)) { return false; }*/
  if (!_isSameType(value1, value2)) { return false; }
  /* objects */
  if (_typeOf(value1) === "object" && _typeOf(value2) === "object") {
    /* objects / same memory adress */
    if (Object.is(value1, value2)) { return true; }
    /* objects / not same constructor */
    if (Object.getPrototypeOf(value1).constructor !==
      Object.getPrototypeOf(value2).constructor
    ) {
      return false;
    }
    /* objects / WeakMap + WeakSet */
    if (_isSameInstance(value1, value2, WeakMap)
      || _isSameInstance(value1, value2, WeakSet)) {
      return Object.is(value1, value2);
    }
    /* objects / Wrapper objects: Number, Boolean, String, BigInt */
    if (_isSameInstance(value1, value2, Number)
      || _isSameInstance(value1, value2, Boolean)
      || _isSameInstance(value1, value2, String)
      || _isSameInstance(value1, value2, Symbol)
      || _isSameInstance(value1, value2, BigInt)) {
      return Object.is(value1.valueOf(), value2.valueOf());
    }
    /* objects / Array */
    if (Array.isArray(value1) && Array.isArray(value2)) {
      if (value1.length !== value2.length) { return false; }
      if (value1.length === 0) { return true; }
      return value1.every((value: unknown, index: any): boolean =>
        _isDeepEqual(value, value2[index])
      );
    }
    /* objects / TypedArrays */
    if (_isTypedArray(value1)
      && _isTypedArray(value2)
      && _classOf(value1) === _classOf(value2)) {
      if ((value1 as any).length !== (value2 as any).length) { return false; }
      if ((value1 as any).length === 0) { return true; }
      return (value1 as any).every(
        (value: unknown, index: any): boolean =>
          Object.is(value, (value2 as any)[index])
      );
    }
    /* objects / ArrayBuffer */
    if (_isSameInstance(value1, value2, ArrayBuffer)) {
      if (value1.byteLength !== value2.byteLength) { return false; }
      if (value1.byteLength === 0) { return true; }
      let xTA = new Int8Array(value1), yTA = new Int8Array(value2);
      return xTA.every((value: unknown, index: number): boolean =>
        Object.is(value, yTA[index]));
    }
    /* objects / DataView */
    if (_isSameInstance(value1, value2, DataView)) {
      if (value1.byteLength !== value2.byteLength) { return false; }
      if (value1.byteLength === 0) { return true; }
      for (let index = 0; index < value1.byteLength; index++) {
        if (!Object.is(value1.getUint8(index), value2.getUint8(index))) {
          return false;
        }
      }
      return true;
    }
    /* objects / Map */
    if (_isSameInstance(value1, value2, Map)) {
      if (value1.size !== value2.size) { return false; }
      if (value1.size === 0) { return true; }
      return [...value1.keys()].every((value: unknown): boolean =>
        _isDeepEqual(value1.get(value), value2.get(value)));
    }
    /* objects / Set */
    if (_isSameInstance(value1, value2, Set)) {
      if (value1.size !== value2.size) { return false; }
      if (value1.size === 0) { return true; }
      return [...value1.keys()].every(
        (value: unknown): boolean => value2.has(value)
      );
    }
    /* objects / RegExp */
    if (_isSameInstance(value1, value2, RegExp)) {
      return Object.is(value1.lastIndex, value2.lastIndex)
        && Object.is(value1.flags, value2.flags)
        && Object.is(value1.source, value2.source);
    }
    /* objects / Error */
    if (_isSameInstance(value1, value2, Error)) {
      return _isDeepEqual(
        Object.getOwnPropertyNames(value1).reduce(
          (acc, key): ObjectLike => { acc[key] = value1[key]; return acc; },
          {}
        ),
        Object.getOwnPropertyNames(value2).reduce(
          (acc, key): ObjectLike => { acc[key] = value2[key]; return acc; },
          {}
        )
      );
    }
    /* objects / Date */
    if (_isSameInstance(value1, value2, Date)) {
      return Object.is(+value1, +value2);
    }
    /* objects / Proxy -> not detectable */
    /* objects / objects */
    let value1Keys: Array<string | symbol> = Reflect.ownKeys(value1);
    let value2Keys: Array<string | symbol> = Reflect.ownKeys(value2);
    if (value1Keys.length !== value2Keys.length) { return false; }
    if (value1Keys.length === 0) { return true; }
    return value1Keys.every((key: string | symbol): boolean =>
      _isDeepEqual(value1[key], value2[key]));
  }
  /* default return false */
  return false;
}


/**
 * @description Checks if the given value is the given type(s).
 * @param {unknown} value - The value to check.
 * @param {ExpectedType} expectedType - The type(s) for checking.
 * @param {string} [callerName] - The name of the caller function.
 * @returns {boolean} True if the value is the given type(s), false otherwise.
 * @throws {TypeError} If ExpectedType is not a neccesary type.
 * @private
 */
function _is (
  value: unknown,
  expectedType: ExpectedType,
  callerName: string = "is"): boolean {
  /* caching types of the arguments */
  let expectedTypeType: string = _typeOf(expectedType);
  let valueType: string = _typeOf(value);
  /* expectedType is a `string` */
  if (expectedTypeType === "string") { return valueType === expectedType; }
  /* expectedType is a `function` */
  if (expectedTypeType === "function") {
    return value instanceof (expectedType as Function);
  }
  /* expectedType is an `Array` */
  if (Array.isArray(expectedType)) {
    return (expectedType as Array<unknown>).some(
      function (item: unknown) {
        if (typeof item === "string") { return valueType === item; }
        if (typeof item === "function") { return value instanceof item; }
        /* other types -> throw a TypeError */
        throw new TypeError(
          `[${callerName}] TypeError: expectedType array elements have to be a string or function. Got ${_typeOf(item)}`
        );
      }
    );
  }
  /* expectedtype error -> throw a `TypeError` */
  throw new TypeError(
    `[${callerName}] TypeError: expectedType must be a string, function or array. Got ${expectedTypeType}`
  );
}


/**
 * @description This function is a general purpose, type safe, predictable stringifier. Converts a value into a human-readable string for error messages Handles symbols, functions, nullish, circular references, etc.
 * @param {unknown} value The value to inspect.
 * @returns {string}
 */
function _toString (value: unknown): string {
  let seen = new WeakSet<object>();
  function replacer (_key: string, value: unknown): any {
    let valueType = _typeOf(value);
    if (valueType === "function") {
      return `[Function: ${(value as Function).name || "anonymous"}]`;
    }
    if (valueType === "symbol") { return (value as Symbol).toString(); }
    if (value instanceof Date) { return `Date(${value.toISOString()})`; }
    if (value instanceof Error) {
      return `${value.name}: ${value.message}, ${value.stack ?? ""}`;
    }
    if (valueType === "object") {
      if (seen.has(value as object)) { return "[Circular]"; }
      seen.add(value as object);
    }
    return value;
  }
  if (["undefined", "null", "string", "number", "boolean", "bigint"]
    .includes(_typeOf(value))) {
    return String(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(v => _toString(v)).join(", ")}]`;
  }
  if (value instanceof Map) {
    return `Map(${value.size}){${Array.from(value.entries()).map(([k, v]): string => `${_toString(k)} => ${_toString(v)}`).join(", ")}}`;
  }
  if (value instanceof Set) {
    return `Set(${value.size}){${Array.from(value.values()).map(v => _toString(v)).join(", ")}}`;
  }
  try {
    return JSON.stringify(value, replacer) ?? String(value);
  } catch (_error) {
    return String(value);
  }
}


/**
 * @description Error message generator helper function.
 * @param {unknown} value
 * @returns {string}
 * @private
 */
const _msgHandler = (value: unknown): string =>
  value ? ` - ${_toString(value)}` : "";


/**
 * @description Checks value1 is less than value2.
 * @param {Comparable} value1 The value1 to check.
 * @param {Comparable} value2 The value2 to check.
 * @returns {boolean} value1 is less than value2.
 * @private
 */
const _lt = (value1: Comparable, value2: Comparable): boolean =>
  _isSameType(value1, value2) && value1 < value2;


/**
 * @description Checks value1 is less than value2 or equal (uses `Object.is();`).
 * @param {Comparable} value1 The value1 to check.
 * @param {Comparable} value2 The value2 to check.
 * @returns {boolean} value1 is less than value2.
 * @private
 */
const _lte = (value1: Comparable, value2: Comparable): boolean =>
  _isSameType(value1, value2) && (value1 < value2 || Object.is(value1, value2));


/**
 * @description Checks value is greater than or equal min and value is less than or equal max.
 * @param {Comparable} value The value1 to check.
 * @param {Comparable} min The value2 to check.
 * @param {Comparable} max The value2 to check.
 * @returns {boolean} value is greater than or equal min and value is less than or equal max.
 * @private
 */
const _inRange = (
  value: Comparable,
  min: Comparable,
  max: Comparable): boolean =>
  _isSameType(value, min)
    && _isSameType(min, max)
    && ((min < value && value < max)
      || Object.is(value, min)
      || Object.is(value, max)
    );


/**
 * Checks if a key or value exists in a container.
 * @param {any} container The container to check.
 * @param {any} keyOrValue The key or value to look for.
 * @param {unknown} valueIfKey The value to check if the key exists.
 * @returns True if the key or value exists, false otherwise.
 * @private
 */
function _includes<T extends object, K extends keyof T>(container: T, keyOrValue: K, valueIfKey?: T[K]): boolean;
function _includes<T>(container: T[], value: T): boolean;
function _includes<T extends ArrayBufferView>(container: T, value: number): boolean;
function _includes<K, V>(container: Map<K, V>, keyOrValue: K, valueIfKey?: V): boolean;
function _includes<K extends object, V>(container: WeakMap<K, V>, keyOrValue: K): boolean;
function _includes<T>(container: Set<T>, value: T): boolean;
function _includes<T extends object>(container: WeakSet<T>, valueIfKey: T): boolean;
function _includes<T>(container: Iterable<T>, keyOrValue: T): boolean;
function _includes<T>(container: Iterator<T>, keyOrValue: T): boolean;
function _includes<T>(container: IterableIterator<T>, keyOrValue: T): boolean;
function _includes<T>(container: string, keyOrValue: unknown): boolean;
function _includes(container: any, keyOrValue: any, valueIfKey?: unknown): boolean {
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
 * Checks if a value is empty.
 * - `null`, `undefined`, and `NaN` are empty.
 * - Arrays, TypedArrays, and strings are empty if length === 0.
 * - Maps and Sets are empty if size === 0.
 * - ArrayBuffer and DataView are empty if byteLength === 0.
 * - Iterable objects are empty if they have no elements.
 * - Plain objects are empty if they have no own properties.
 * @param {any} value The value to check.
 * @returns boolean
 * @private
 */
function _isEmpty (value: any): boolean {
  /* Check undefined, null, NaN */
  if (value == null || value !== value) { return true; }
  /* Check Array, TypedArrays, string, String */
  if (Array.isArray(value)
    || _isTypedArray(value)
    || typeof value === "string"
    || value instanceof String) {
    return (value as any).length === 0;
  }
  /* Checks Map and Set */
  if (value instanceof Map || value instanceof Set) { return value.size === 0; }
  /* Check ArrayBuffer and DataView */
  if (value instanceof ArrayBuffer || value instanceof DataView) {
    return value.byteLength === 0;
  }
  /* Check Iterable objects */
  if (typeof value[Symbol.iterator] === "function") {
    return value[Symbol.iterator]().next().done;
  }
  /* Check Iterator objects */
  if ("Iterator" in globalThis ? (value instanceof Iterator)
    : (_typeOf(value) === "object"
    && typeof value.next === "function")) {
    try {
      /* Has at least one element */
      for (let _item of value) { return false; }
      return true;
    } catch (_error) { /* Not iterable */ }
  }
  /* Other objects - check own properties (including symbols) */
  if (_typeOf(value) === "object") {
    let keys: unknown[] = [
      ...Object.getOwnPropertyNames(value),
      ...Object.getOwnPropertySymbols(value)
    ];
    if (keys.length === 0) return true;
    /* Special case: object with single "length" property that is 0 */
    if (keys.length === 1
      && keys[0] === "length"
      && (value as { length?: unknown }).length === 0) {
      return true;
    }
  }
  /* Return default false */
  return false;
}


/**
 * @description Checks if the given value is Primitive.
 * @param {unknown} value - The value to check.
 * @returns True if the value is Primitive, false otherwise.
 * @private
 */
const _isPrimitive = (value: unknown): value is Primitive =>
  _typeOf(value) !== "object" && typeof value !== "function";


/**
 * @description Checks if a value is a floating-point number.
 * @param {unknown} value - The value to check.
 * @returns {boolean} True if the value is a float, false otherwise.
 * @private
 */
const _isFloat = (value: unknown): boolean =>
  typeof value === "number" && value === value && Boolean(value % 1);


/**
 * @description If value is an error, then it will be thrown.
 * @param {unknown} value - The value to check.
 * @param {Function} caller
 * @returns {void}
 * @private
 */
function _errorCheck (value: unknown, caller: Function): void {
  if (Error.isError(value)) {
    if (typeof (Error as any).captureStackTrace === "function") {
      (Error as any).captureStackTrace(caller, value);
    }
    throw value;
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
 * @description Ensures that `condition` is truthy. Throws an `AssertionError` if falsy.
 * @param {unknown} condition The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
function assert (condition: unknown, message?: unknown): asserts condition {
  if (!condition) {
    _errorCheck(message, assert);
    let msg =
      `[assert] Assertion failed: ${_toString(condition)} should be truly${_msgHandler(message)}`;
    throw new AssertionError({
      message: msg,
      cause: msg,
      actual: condition,
      expected: true,
      operator: "==",
    });
  }
}


/**
 * @description Alias for `assert(condition, [message: string | Error]);`.
 * @param {unknown} condition The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
const ok = (condition: unknown, message?: unknown): asserts condition =>
  assert(condition, message);


/**
 * @description `assert.equal(actual, expected, [message: string | Error]);`
 * @param {unknown} actual The actual value to check.
 * @param {unknown} expected The expected value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
function equal (actual: unknown, expected: unknown, message?: unknown): void {
  if (assert.config.alwaysStrict === true) {
    return strictEqual(actual, expected, message);
  }
  if (actual != expected) {
    _errorCheck(message, equal);
    let msg =
      `[equal] Assertion failed: ${_toString(actual)} and ${_toString(expected)} should be equal${_msgHandler(message)}`;
    throw new AssertionError({
      message: msg,
      cause: msg,
      actual: actual,
      expected: expected,
      operator: "!="
    });
  }
}


/**
 * @description Inverse of `equal(actual, expected, [message: string | Error]);`.
 * @param {unknown} actual The actual value to check.
 * @param {unknown} expected The expected value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
function notEqual (
  actual: unknown,
  expected: unknown,
  message?: unknown): void {
  if (assert.config.alwaysStrict === true) {
    return notStrictEqual(actual, expected, message);
  }
  if (actual == expected) {
    _errorCheck(message, notEqual);
    let msg =
      `[notEqual] Assertion failed: ${_toString(actual)} and ${_toString(expected)} should be equal${_msgHandler(message)}`;
    throw new AssertionError({
      message: msg,
      cause: msg,
      actual: actual,
      expected: expected,
      operator: "=="
    });
  }
}


/**
 * @description Strict equality (`Object.is();`).
 * @param {unknown} actual The actual value to check.
 * @param {unknown} expected The expected value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
function strictEqual (
  actual: unknown,
  expected: unknown,
  message?: unknown): void {
  if (!Object.is(actual, expected)) {
    _errorCheck(message, strictEqual);
    let msg =
      `[strictEqual] Assertion failed: ${_toString(actual)} and ${_toString(expected)} should be strictly equal${_msgHandler(message)}`;
    throw new AssertionError({
      message: msg,
      cause: msg,
      actual: actual,
      expected: expected,
      operator: "strictEqual"
    });
  }
}


/**
 * @description Inverse of `strictEqual(actual, expected, [message: string | Error]);`.
 * @param {unknown} actual The actual value to check.
 * @param {unknown} expected The expected value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
function notStrictEqual (
  actual: unknown,
  expected: unknown,
  message?: unknown): void {
  if (Object.is(actual, expected)) {
    _errorCheck(message, notStrictEqual);
    let msg =
      `[notStrictEqual] Assertion failed: ${_toString(actual)} and ${_toString(expected)} should not be strictly equal${_msgHandler(message)}`;
    throw new AssertionError({
      message: msg,
      cause: msg,
      actual: actual,
      expected: expected,
      operator: "notStrictEqual"
    });
  }
}


/**
 * @description Deep equality check.
 * @param {unknown} actual The actual value to check.
 * @param {unknown} expected The expected value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
function deepEqual (
  actual: unknown,
  expected: unknown,
  message?: unknown): void {
  if (!_isDeepEqual(actual, expected)) {
    _errorCheck(message, deepEqual);
    let msg =
      `[deepEqual] Assertion failed: ${_toString(actual)} and ${_toString(expected)} should be deep equal${_msgHandler(message)}`;
    throw new AssertionError({
      message: msg,
      cause: msg,
      actual: actual,
      expected: expected,
      operator: "deepEqual"
    });
  }
}


/**
 * @description Inverse of `deepEqual(actual, expected, [message: string | Error]);`.
 * @param {unknown} actual The actual value to check.
 * @param {unknown} expected The expected value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
function notDeepEqual (
  actual: unknown,
  expected: unknown,
  message?: unknown): void {
  if (_isDeepEqual(actual, expected)) {
    _errorCheck(message, notDeepEqual);
    let msg =
      `[notDeepEqual] Assertion failed: ${_toString(actual)} and ${_toString(expected)} should not be deep equal${_msgHandler(message)}`;
    throw new AssertionError({
      message: msg,
      cause: msg,
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
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {Error | undefined}
 * @throws {AssertionError} If assertion is failed.
 */
function throws (
  block: Function,
  Error_opt?: unknown,
  message?: unknown): Error | undefined {
  let thrownError: any = undefined;
  try {
    block();
  } catch (catchedError) {
    thrownError = catchedError as Error;
  }
  if (!thrownError) {
    let msg =
      `[throws] Assertion failed: function did not throw${_msgHandler(message)}`;
    throw new AssertionError({
      message: msg,
      cause: msg,
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
        `[throws] Assertion failed: function threw unexpected error: ${_toString(thrownError)}${_msgHandler(message)}`;
      throw new AssertionError({
        message: msg,
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
 * @param {(() => Promise<unknown>) | Promise<unknown>} block - Async function or promise expected to reject.
 * @param {ErrorConstructor | string | RegExp} [Error_opt] - Expected error type, substring, or pattern.
 * @param {unknown} [message] - Optional custom message or Error.
 * @returns {Promise<unknown>} - Resolves with the rejection reason if assertion passes.
 * @throws {AssertionError} If assertion is failed.
 */
async function rejects (
  block: Function | Promise<unknown>,
  Error_opt?: unknown,
  message?: unknown): Promise<unknown> {
  let rejectedError: any = undefined;
  try {
    let result = typeof block === "function" ? await block() : await block;
    /* If we reach here, it resolved successfully */
    let msg =
      `[rejects] Assertion failed: function/promise did not reject${_msgHandler(message)}`;
    throw new AssertionError({
      message: msg,
      cause: result,
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
        `[rejects] Assertion failed: rejected with unexpected error: ${_toString(rejectedError)}${_msgHandler(message)}`;
      throw new AssertionError({
        message: msg,
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
 * @param {(() => Promise<unknown>) | Promise<unknown>} block - Async function or promise expected to resolve.
 * @param {ErrorConstructor | string | RegExp} [Error_opt] - Optional: an error type, message, or pattern that must NOT appear in a rejection.
 * @param {unknown} [message] - Optional custom message or Error to throw.
 * @returns {Promise<unknown>} - Resolves with the resolved value if assertion passes.
 * @throws {AssertionError} If the function or promise rejects.
 */
async function doesNotReject (
  block: Function,
  Error_opt?: unknown,
  message?: unknown): Promise<unknown> {
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
          `[doesNotReject] Assertion failed: function/promise rejected with disallowed error: ${_toString(catchedError)}${_msgHandler(message)}`;
        throw new AssertionError({
          message: msg,
          cause: catchedError,
          actual: catchedError,
          expected: undefined,
          operator: "doesNotReject"
        });
      }
    }
    _errorCheck(message, doesNotReject);
    let msg =
      `[doesNotReject] Assertion failed: function/promise rejected unexpectedly${_msgHandler(message)}`;
    throw new AssertionError({
      message: msg,
      cause: catchedError,
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
function fail (message?: unknown): void;
function fail (actual?: unknown, expected?: unknown, message?: string, operator?: unknown): void;
function fail (...args: unknown[]): void {
  let message = args.length === 1 ? args[0] :
    (args.length > 1 ? args[2] : undefined);
  _errorCheck(message, fail);
  let msg =
    `[fail] Assertion failed${message ? `: ${_toString(message)}` : ""}`;
  throw new AssertionError({
    message: msg,
    cause: msg,
    actual: args.length > 1 ? args[0] : undefined,
    expected: args.length > 1 ? args[1] : undefined,
    operator: args.length > 1 ? args[3] : undefined
  });
}


/**
 * @description Ensures a value is falsy.
 * @param {unknown} condition The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
function notOk (
  condition: unknown,
  message?: unknown): asserts condition is Falsy {
  if (condition) {
    _errorCheck(message, notOk);
    let msg =
      `[notOk] Assertion failed: ${_toString(condition)} should be falsy${_msgHandler(message)}`;
    throw new AssertionError({
      message: msg,
      cause: msg,
      actual: condition,
      expected: false,
      operator: "=="
    });
  }
}


/**
 * @description Ensures value is exactly `true`.
 * @param {unknown} condition The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
const isTrue = (
  condition: unknown,
  message?: unknown): asserts condition is true =>
  strictEqual(condition, true, message);


/**
 * @description Ensures value is exactly not `true`, but can be `false` or truthy or falsy.
 * @param {T} condition The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
const isNotTrue = <T>(
  condition: T,
  message?: unknown): asserts condition is Exclude<T, true> =>
  notStrictEqual(condition, true, message);


/**
 * @description Ensures value is exactly `false`.
 * @param {unknown} condition The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
const isFalse = (
  condition: unknown,
  message?: unknown): asserts condition is false =>
  strictEqual(condition, false, message);


/**
 * @description Ensures value is exactly not `false`, but can be `true` or truthy or falsy.
 * @param {T} condition The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
const isNotFalse = <T>(
  condition: T,
  message?: unknown): asserts condition is Exclude<T, false> =>
  notStrictEqual(condition, false, message);


/**
 * @description Ensures a value matches a type or constructor. The expected type can be a string, function or an array of strings and functions.
 * @param {unknown} value The value to check.
 * @param {string | Function | Array<string | Function>} expectedType
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
function is (
  value: unknown,
  expectedType: ExpectedType,
  message?: unknown): void {
  if (!_is(value, expectedType, "is")) {
    _errorCheck(message, is);
    let msg =
      `[is] Assertion failed: ${_toString(value)} should be an expected type: ${_toString(expectedType)}${_msgHandler(message)}`;
    throw new AssertionError({
      message: msg,
      cause: msg,
      actual: value,
      expected: expectedType,
      operator: "is"
    });
  }
}


/**
 * @description Inverse of `is(value, expectedType, [message: string | Error]);`. The expected type can be a string, function or an array of strings and functions.
 * @param {unknown} value The value to check.
 * @param {string | Function | Array<string | Function>} expectedType
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
function isNot (
  value: unknown,
  expectedType: ExpectedType,
  message?: unknown): void {
  if (_is(value, expectedType, "isNot")) {
    _errorCheck(message, isNot);
    let msg =
      `[isNot] Assertion failed: ${_toString(value)} should not be an expected type: ${_toString(expectedType)}${_msgHandler(message)}`;
    throw new AssertionError({
      message: msg,
      cause: msg,
      actual: value,
      expected: expectedType,
      operator: "isNot"
    });
  }
}


/**
 * @description Ensures a value matches a type. The expected type can be a string.
 * @param {unknown} value The value to check.
 * @param {string} expectedType
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
function typeOf (value: unknown, expectedType: string, message: unknown): void {
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
 * @param {unknown} value The value to check.
 * @param {string} expectedType
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
function notTypeOf (
  value: unknown,
  expectedType: string,
  message: unknown): void {
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
 * @param {unknown} value The value to check.
 * @param {Function} expectedConstructor
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
function instanceOf (
  value: unknown,
  expectedConstructor: Function,
  message: unknown): void {
  is(expectedConstructor, "function", message);
  is(value, expectedConstructor, message);
}


/**
 * @description Ensures a value don't match a constructor. The expected type can be a function.
 * @param {unknown} value The value to check.
 * @param {Function} expectedConstructor
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
function notInstanceOf (
  value: unknown,
  expectedConstructor: Function,
  message: unknown): void {
  is(expectedConstructor, "function", message);
  isNot(value, expectedConstructor, message);
}


/**
 * @description Ensures value is `null` or `undefined`.
 * @param {unknown} value The value to check.
* @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
const isNullish = (
  value: unknown,
  message?: unknown): asserts value is Nullish =>
  is(value, ["null", "undefined"], message);


/**
 * @description Ensures value is not `null` or `undefined`.
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
const isNonNullable = (
  value: unknown,
  message?: unknown): asserts value is NonNullable<unknown> =>
  isNot(value, ["null", "undefined"], message);


/**
 * @description Ensures value is `null`.
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
const isNull = (value: unknown, message?: unknown): asserts value is null =>
  is(value, "null", message);


/**
 * @description Ensures value is not `null`.
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
const isNotNull = (
  value: unknown,
  message?: unknown): asserts value is Exclude<unknown, null> =>
  isNot(value, "null", message);


/**
 * @description Ensures value is `undefined`.
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
const isUndefined = (
  value: unknown,
  message?: unknown): asserts value is undefined =>
  is(value, "undefined", message);


/**
 * @description Ensures value is not `undefined`.
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
const isDefined = (
  value: unknown,
  message?: unknown): asserts value is Exclude<unknown, undefined> =>
  isNot(value, "undefined", message);


/**
 * @description Ensures value is `string`.
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
const isString = (value: unknown, message?: unknown): asserts value is string =>
  is(value, "string", message);


/**
 * @description Ensures value is not `string`.
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
const isNotString = (
  value: unknown,
  message?: unknown): asserts value is Exclude<unknown, string> =>
  isNot(value, "string", message);


/**
 * @description Ensures value is `number`.
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
const isNumber = (value: unknown, message?: unknown): asserts value is number =>
  is(value, "number", message);


/**
 * @description Ensures value is not `number`.
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
const isNotNumber = (
  value: unknown,
  message?: unknown): asserts value is Exclude<unknown, number> =>
  isNot(value, "number", message);


/**
 * @description Ensures value is `bigint`.
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
const isBigInt = (value: unknown, message?: unknown): asserts value is bigint =>
  is(value, "bigint", message);


/**
 * @description Ensures value is not `bigint`.
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
const isNotBigInt = (
  value: unknown,
  message?: unknown): asserts value is Exclude<unknown, bigint> =>
  isNot(value, "bigint", message);


/**
 * @description Ensures value is `boolean`.
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
const isBoolean = (
  value: unknown,
  message?: unknown): asserts value is boolean =>
  is(value, "boolean", message);


/**
 * @description Ensures value is not `boolean`.
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
const isNotBoolean = (
  value: unknown,
  message?: unknown): asserts value is Exclude<unknown, boolean> =>
  isNot(value, "boolean", message);


/**
 * @description Ensures value is `symbol`.
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
const isSymbol = (value: unknown, message?: unknown): asserts value is symbol =>
  is(value, "symbol", message);


/**
 * @description Ensures value is not `symbol`.
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
const isNotSymbol = (
  value: unknown,
  message?: unknown): asserts value is Exclude<unknown, symbol> =>
  isNot(value, "symbol", message);


/**
 * @description Ensures value is `function`.
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
const isFunction = (
  value: unknown,
  message?: unknown): asserts value is Function =>
  is(value, "function", message);


/**
 * @description Ensures value is not `function`.
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
const isNotFunction = (
  value: unknown,
  message?: unknown): asserts value is Exclude<unknown, Function> =>
  isNot(value, "function", message);


/**
 * @description Ensures value is `object`.
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
const isObject = (value: unknown, message?: unknown): asserts value is object =>
  is(value, "object", message);


/**
 * @description Ensures value is not `object`.
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
const isNotObject = (
  value: unknown,
  message?: unknown): asserts value is Exclude<unknown, object> =>
  isNot(value, "object", message);


/**
 * @description Ensures value is not `object` or `function`.
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
const isPrimitive = (
  value: unknown,
  message?: unknown): asserts value is Primitive =>
  isNot(value, ["object", "function"], message);


/**
 * @description Ensures value is `object` or `function`.
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
const isNotPrimitive = (
  value: unknown,
  message?: unknown): asserts value is NonPrimitive =>
  is(value, ["object", "function"], message);


/**
 * @description Ensures value is a number and NaN.
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
const isNaN = (value: unknown, message?: unknown): void =>
  strictEqual(value, NaN, message);


/**
 * @description Ensures value is not a number and NaN.
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
const isNotNaN = (value: unknown, message?: unknown): void =>
  notStrictEqual(value, NaN, message);


/**
 * @description Ensures value is a number and integer.
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
function isInt (value: unknown, message?: unknown): void {
  if (!Number.isInteger(value)) {
    _errorCheck(message, isInt);
    let msg =
      `[isInt] Assertion failed: ${_toString(value)} should be an integer${_msgHandler(message)}`;
    throw new AssertionError({
      message: msg,
      cause: msg,
      actual: value,
      expected: "",
      operator: "isInt"
    });
  }
}


/**
 * @description Ensures value is not a number and integer.
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
function isNotInt (value: unknown, message?: unknown): void {
  if (Number.isInteger(value)) {
    _errorCheck(message, isNotInt);
    let msg =
      `[isNotInt] Assertion failed: ${_toString(value)} should not be an integer${_msgHandler(message)}`;
    throw new AssertionError({
      message: msg,
      cause: msg,
      actual: value,
      expected: "",
      operator: "isNotInt"
    });
  }
}


/**
 * @description Ensures value is a float and integer.
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
function isFloat (value: unknown, message?: unknown): void {
  if (!_isFloat(value)) {
    _errorCheck(message, isFloat);
    let msg =
      `[isFloat] Assertion failed: ${_toString(value)} should be a float${_msgHandler(message)}`;
    throw new AssertionError({
      message: msg,
      cause: msg,
      actual: value,
      expected: "",
      operator: "isFloat"
    });
  }
}


/**
 * @description Ensures value is not a number and float.
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
function isNotFloat (value: unknown, message?: unknown): void {
  if (_isFloat(value)) {
    _errorCheck(message, isNotFloat);
    let msg =
      `[isNotFloat] Assertion failed: ${_toString(value)} should not be a float${_msgHandler(message)}`;
    throw new AssertionError({
      message: msg,
      cause: msg,
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
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
function isEmpty (value: unknown, message?: unknown): void {
  if (!_isEmpty(value)) {
    _errorCheck(message, isEmpty);
    let msg =
      `[isEmpty] Assertion failed: ${_toString(value)} should be empty${_msgHandler(message)}`;
    throw new AssertionError({
      message: msg,
      cause: msg,
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
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
function isNotEmpty (value: unknown, message?: unknown): void {
  if (_isEmpty(value)) {
    _errorCheck(message, isNotEmpty);
    let msg =
      `[isNotEmpty] Assertion failed: ${_toString(value)} should be not empty${_msgHandler(message)}`;
    throw new AssertionError({
      message: msg,
      cause: msg,
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
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {TypeError} If parameter types are not matched.
 * @throws {AssertionError} If assertion is failed.
 */
function match (string: StringLike, regexp: RegExp, message?: unknown): void {
  /* Type validation */
  is(string, ["string", String], message);
  is(regexp, RegExp, message);
  /* Assertion */
  if (!(regexp.test(String(string)) || (string as any) instanceof String)) {
    _errorCheck(message, match);
    let msg =
      `[match] Assertion failed: ${_toString(string)} is not matched with ${_toString(regexp)}${_msgHandler(message)}`;
    throw new AssertionError({
      message: msg,
      cause: msg,
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
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {TypeError} If parameter types are not matched.
 * @throws {AssertionError} If assertion is failed.
 */
function doesNotMatch (
  string: StringLike,
  regexp: RegExp, message?: unknown): void {
  /* Type validation */
  is(string, ["string", String], message);
  is(regexp, RegExp, message);
  /* Assertion */
  if (regexp.test(String(string))) {
    _errorCheck(message, doesNotMatch);
    let msg =
      `[doesNotMatch] Assertion failed: ${_toString(string)} is matched with ${_toString(regexp)}${_msgHandler(message)}`;
    throw new AssertionError({
      message: msg,
      cause: msg,
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
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
function lt (value1: Comparable, value2: Comparable, message?: unknown): void {
  if (!_lt(value1, value2)) {
    _errorCheck(message, lt);
    let msg =
      `[lt] Assertion failed: ${_toString(value1)} should be less than ${_toString(value2)}${_msgHandler(message)}`;
    throw new AssertionError({
      message: msg,
      cause: msg,
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
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
function lte (value1: Comparable, value2: Comparable, message?: unknown): void {
  if (!_lte(value1, value2)) {
    _errorCheck(message, lte);
    let msg =
      `[lte] Assertion failed: ${_toString(value1)} should be less than or equal ${_toString(value2)}${_msgHandler(message)}`;
    throw new AssertionError({
      message: msg,
      cause: msg,
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
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
function gt (value1: Comparable, value2: Comparable, message?: unknown): void {
  if (!_lt(value2, value1)) {
    _errorCheck(message, gt);
    let msg =
      `[gt] Assertion failed: ${_toString(value1)} should be greater than ${_toString(value2)}${_msgHandler(message)}`;
    throw new AssertionError({
      message: msg,
      cause: msg,
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
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
function gte (value1: Comparable, value2: Comparable, message?: unknown): void {
  if (!_lte(value2, value1)) {
    _errorCheck(message, gte);
    let msg =
      `[gte] Assertion failed: ${_toString(value1)} should be greater than or equal ${_toString(value2)}${_msgHandler(message)}`;
    throw new AssertionError({
      message: msg,
      cause: msg,
      actual: value1,
      expected: value2,
      operator: "> or Object.is();"
    });
  }
}


/**
 * @description Ensures `min <= value <= max` and the value types have to be same type.
 * @param {Comparable} value The value to check.
 * @param {Comparable} min The min value to check.
 * @param {Comparable} max The max value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
function inRange (
  value: Comparable,
  min: Comparable,
  max: Comparable,
  message?: unknown): void {
  if (!_inRange(value, min, max)) {
    _errorCheck(message, inRange);
    let msg =
      `[inRange] Assertion failed: ${_toString(value)} should be in range ${_toString(min)} and ${_toString(max)} or the type of the values are not the same${_msgHandler(message)}`;
    throw new AssertionError({
      message: msg,
      cause: msg,
      actual: value,
      expected: `${_toString(min)} and ${_toString(max)}`,
      operator: "inRange"
    });
  }
}


/**
 * @description Inverse of `inRange(value, min, max, [message: string | Error]);`.
 * @param {Comparable} value The value to check.
 * @param {Comparable} min The min value to check.
 * @param {Comparable} max The max value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
function notInRange (
  value: Comparable,
  min: Comparable,
  max: Comparable,
  message?: unknown): void {
  if (_inRange(value, min, max)) {
    _errorCheck(message, notInRange);
    let msg =
      `[notInRange] Assertion failed: ${_toString(value)} should be not in range ${_toString(min)} and ${_toString(max)}${_msgHandler(message)}`;
    throw new AssertionError({
      message: msg,
      cause: msg,
      actual: value,
      expected: `${_toString(min)} and ${_toString(max)}`,
      operator: "notInRange"
    });
  }
}


/**
 * @description Asserts that `actual` (a string) contains the specified `substring`.
 * @param {string} actual - The string to check.
 * @param {string} substring - The substring expected to appear within `actual`.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
function stringContains (
  actual: StringLike,
  substring: StringLike,
  message?: unknown): void {
  /* Type validation */
  is(actual, ["string", String], message);
  is(substring, ["string", String], message);
  /* Assertion */
  if (!String(actual).includes(String(substring))) {
    _errorCheck(message, stringContains);
    let msg =
      `[stringContains] Assertion failed: ${_toString(actual)} does not contain substring ${_toString(substring)}${_msgHandler(message)}`;
    throw new AssertionError({
      message: msg,
      cause: msg,
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
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
function stringNotContains (
  actual: StringLike,
  substring: StringLike,
  message?: unknown): void {
  /* Type validation */
  is(actual, ["string", String], message);
  is(substring, ["string", String], message);
  /* Assertion */
  if (actual.includes(String(substring))) {
    _errorCheck(message, stringNotContains);
    let msg =
      `[stringNotContains] Assertion failed: ${_toString(actual)} should not contain substring ${_toString(substring)}${_msgHandler(message)}`;
    throw new AssertionError({
      message: msg,
      cause: msg,
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
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
function stringStartsWith (
  actual: StringLike,
  substring: StringLike,
  message?: unknown): void {
  /* Type validation */
  is(actual, ["string", String], message);
  is(substring, ["string", String], message);
  /* Assertion */
  if (!String(actual).startsWith(String(substring))) {
    _errorCheck(message, stringStartsWith);
    let msg =
      `[stringStartsWith] Assertion failed: ${_toString(actual)} does not start with substring ${_toString(substring)}${_msgHandler(message)}`;
    throw new AssertionError({
      message: msg,
      cause: msg,
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
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
function stringNotStartsWith (
  actual: StringLike,
  substring: StringLike,
  message?: unknown): void {
  /* Type validation */
  is(actual, ["string", String], message);
  is(substring, ["string", String], message);
  /* Assertion */
  if (String(actual).startsWith(String(substring))) {
    _errorCheck(message, stringNotStartsWith);
    let msg =
      `[stringNotStartsWith] Assertion failed: ${_toString(actual)} starts with substring ${_toString(substring)}${_msgHandler(message)}`;
    throw new AssertionError({
      message: msg,
      cause: msg,
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
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
function stringEndsWith (
  actual: StringLike,
  substring: StringLike,
  message?: unknown): void {
  /* Type validation */
  is(actual, ["string", String], message);
  is(substring, ["string", String], message);
  /* Assertion */
  if (!String(actual).endsWith(String(substring))) {
    _errorCheck(message, stringEndsWith);
    let msg =
      `[stringEndsWith] Assertion failed: ${_toString(actual)} does not end with substring ${_toString(substring)}${_msgHandler(message)}`;
    throw new AssertionError({
      message: msg,
      cause: msg,
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
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
function stringNotEndsWith (
  actual: StringLike,
  substring: StringLike,
  message?: unknown): void {
  /* Type validation */
  is(actual, ["string", String], message);
  is(substring, ["string", String], message);
  /* Assertion */
  if (String(actual).endsWith(String(substring))) {
    _errorCheck(message, stringNotEndsWith);
    let msg =
      `[stringNotEndsWith] Assertion failed: ${_toString(actual)} ends with substring ${_toString(substring)}${_msgHandler(message)}`;
    throw new AssertionError({
      message: msg,
      cause: msg,
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
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {TypeError} If parameter types are not matched.
 * @throws {AssertionError} If assertion is failed.
 */
function includes (
  container: any,
  options: IncludesOptions,
  message?: unknown): void {
  /* Type validation */
  is(options, "object", message);
  /* Assertion */
  if (!_includes(container, options.keyOrValue, options?.value ?? undefined)) {
    _errorCheck(message, includes);
    let msg =
      `[includes] Assertion failed: ${_toString(container)} does not include${_toString(options)}${_msgHandler(message)}`;
    throw new AssertionError({
      message: msg,
      cause: msg,
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
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {TypeError} If parameter types are not matched.
 * @throws {AssertionError} If assertion is failed.
 */
function doesNotInclude (
  container: any,
  options: IncludesOptions,
  message?: unknown): void {
  /* Type validation */
  is(options, "object", message);
  /* Assertion */
  if (_includes(container, options.keyOrValue, options?.value ?? undefined)) {
    _errorCheck(message, doesNotInclude);
    let msg =
      `[doesNotInclude] Assertion failed: ${_toString(container)} does not include ${_toString(options)}${_msgHandler(message)}`;
    throw new AssertionError({
      message: msg,
      cause: msg,
      actual: container,
      expected: options,
      operator: "doesNotInclude"
    });
  }
}


/**
 * @description Ensures a value is in a flat collection (`Array`, iterables, etc.).
 * @param {unknown} value - The value to check.
 * @param {unknown} collection - List of the possibly values.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
const oneOf = (value: unknown, collection: unknown, message?: unknown): void =>
  includes(collection, {keyOrValue: value}, message);


/**
 * @description Ensures a value is not in a flat collection (`Array`, iterables, etc.).
 * @param {unknown} value - The value to check.
 * @param {unknown} collection - List of the possibly values.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {AssertionError} If assertion is failed.
 */
const notOneOf = (
  value: unknown,
  collection: unknown,
  message?: unknown): void =>
  doesNotInclude(collection, {keyOrValue: value}, message);


/* testrunner functions */


/**
 * @description Synchronously runs a block of code and returns either its result or the caught error.
 * @param {Function} block - The function to execute.
 * @returns {TestResult<T>} The result of the block if successful, or the caught error if it throws.
 */
function testSync <T>(block: () => T, name = "assert.testSync"): TestResult<T> {
  try {
    return {ok: true, value: block(), block: block, name: _toString(name)};
  } catch (error) {
    return {
      ok: false,
      error: Error.isError(error) ? error : new Error(_toString(error)),
      block: block,
      name: _toString(name)
    };
  }
}


/**
 * @description Asynchronously runs a block of code and returns either its resolved result or the caught error.
 * @param {Function} block - The async function to execute.
 * @returns {Promise<TestResult<T>>} A promise that resolves to either the result or an Error.
 */
async function testAsync <T>(
  block: () => Promise<T>,
  name = "assert.testAsync"): Promise<TestResult<T>> {
  try {
    return {
      ok: true,
      value: await block(),
      block: block,
      name: _toString(name)
    };
  } catch (error) {
    return {
      ok: false,
      error: Error.isError(error) ? error : new Error(_toString(error)),
      block: block,
      name: _toString(name)
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
assert.throws = throws;
assert.rejects = rejects;
assert.doesNotReject = doesNotReject;
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
assert.testAsync = testAsync;
assert.testCheck = testCheck;


/* ESM export */
export {assert};
export default assert;
