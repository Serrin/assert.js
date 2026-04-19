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
 * @version 1.1.7
 * @author Ferenc Czigler
 * @see https://github.com/Serrin/assert.js/
 * @license MIT https://opensource.org/licenses/MIT
 */


const VERSION = "assert.js v1.1.7";


const config = { "alwaysStrict": false };


/*
standard unit testing:
https://wiki.commonjs.org/wiki/Unit_Testing/1.0

Mozilla Assert functions
https://firefox-source-docs.mozilla.org/testing/assert.html

Google Clojure Asserts
https://google.github.io/closure-library/api/goog.asserts.html
*/


/* TypeScript types */


/**
 * @description False like values.
 * @see https://developer.mozilla.org/en-US/docs/Glossary/Falsy
 * Missing values: NaN and document.all
 *
 * @private
 */
type Falsy = null | undefined | false | 0 | -0 | 0n | "";
/* type Truthy<T> = Exclude<T, Falsy>; */

/**
 * @description Map-like object with string or symbol keys.
 *
 * @private
 */
type MapLike = Record<PropertyKey, any>;

/**
 * @description string or String object
 *
 * @private
 */
type StringLike = string | String;

/**
 * @description TypedArray types.
 *
 * @private
 */
type TypedArray = Exclude<ArrayBufferView, DataView>;

/**
 * Generic comparable types.
 *
 * @private
 */
type Comparable = number | bigint | string | boolean | Date;

/**
 * @description Options for AssertionError.
 *
 * @private
 */
type AssertionErrorOptions = {
  message?: string,
  cause?: any,
  actual?: any;
  expected?: any;
  operator?: any,
  stackStartFn?: Function,
  diff?: any
};

/**
 * @description The result of a test operation, indicating success or failure.
 *
 * @private
 */
type TestResult<T> =
  | {ok: true, value: T, block: Function, name: string}
  | {ok: false, error: Error, block: Function, name: string};

/**
 * @description Return the typeof operator result of the given value,
 * except return "null" instead of "object" for null.
 *
 * @private
 */
type TypeOfTag =
  | "null" | "undefined"
  | "number" | "bigint" | "boolean" | "string" | "symbol"
  | "object" | "function";

/**
 * @description Return a more detailed class name of the given value. Similar to typeof but with better handling of built-ins (Array, Date, Map, etc.) and correct "null" classification.
 *
 * @private
 */
type ClassOfTag = TypeOfTag | string;

/**
 * The expected type(s) for type checking.
 *
 * @private
 */
type ExpectedType = string | Function | Array<string | Function>;

/**
 * The expected options object for type includes functions
 *
 * @private
 */
type IncludesOptions = { keyOrValue: any, value?: any };

/**
 * null or undefined
 *
 * @private
 */
type Nullish = null | undefined;

/**
 * @description Not null or undefined or object or function.
 *
 * @private
 */
type NonNullablePrimitive = number | bigint | boolean | string | symbol;

/**
 * @description Not object or function.
 *
 * @private
 */
type Primitive = Nullish | NonNullablePrimitive;

/**
 * @description Object or function.
 *
 * @private
 */
type NonPrimitive = object | Function;


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


/* internal functions */


/**
 * @description Shorthand of `Array.isArray();`
 *
 * @param {value} value The value to check.
 * @returns {boolean}
 * @interal
 */
const { isArray } = Array;


/**
 * @description Return the typeof operator result of the given value, except the null object ("null" instead of "object").
 *
 * @param {unknown} value The value to check.
 * @returns {TypeOfTag}
 * @interal
 */
const _typeOf = (value: unknown): TypeOfTag =>
  value === null ? "null" : typeof value;
/* const _typeOf = (value) => value === null ? "null" : typeof value; */


/**
 * @description Checks the first and second values have the same type (using _typeOf), returns true if they have the same type, false otherwise.
 *
 * @param {unknown} value1 The first value to check.
 * @param {unknown} value2 The second value to check.
 * @returns {boolean} True if the values have the same type, false otherwise.
 * @private
 */
const _isSameType = (value1: unknown, value2: unknown): boolean =>
  _typeOf(value1) === _typeOf(value2);


/**
 * @description Return the typeof operator result of the given value,except return "null" instead of "object" for null, and provide detailed object class names (Array, Date, etc. and custom classes).
 *
 * @param {unknown} value - The value to check.
 * @returns {ClassOfTag}
 * @private
 */
function _classOf (value: unknown): ClassOfTag {
  /* primitives */
  const valueType: TypeOfTag = _typeOf(value);
  if (valueType !== "object" && valueType !== "function") { return valueType; }
  /* objects and functions */
  let ctor: ClassOfTag;
  try {
    ctor = Object.getPrototypeOf(value)?.constructor?.name ?? "Object";
  } catch (_e) {
    ctor = Object.prototype.toString.call(value).slice(8, -1);
  }
  return ctor === "Object" || ctor === "Function" ? ctor.toLowerCase() : ctor;
}
/*
console.log(_classOf(null))                   //"null"
console.log(_classOf(Object.create(null)))    //"object"
console.log(_classOf({}))                     //"object"
console.log(_classOf(42))                     //"number"
console.log(_classOf(Object(42)))             //"Number"
console.log(_classOf([]))                     //"Array"
console.log(_classOf(() => {}))               //"function"
console.log(_classOf(async () => {}))         //"AsyncFunction"
console.log(_classOf(function* g() {}))       //"GeneratorFunction"
console.log(_classOf(new (class Foo {})()))   //"Foo"
*/


/**
 * Checks if a value is a TypedArray (Int8Array, etc.).
 *
 * @param {unknown} value The value to check.
 * @returns boolean
 * @private
 */
const _isTypedArray = (value: unknown): value is TypedArray =>
  ArrayBuffer.isView(value) && !(value instanceof DataView);


/**
 * @description Checks if the values are deep equal.
 *
 * @param {unknown} value1 - The value to check.
 * @param {unknown} value2 - The value to check.
 * @returns {boolean} True if the value are deep equal, false otherwise.
 * @private
 */
function _isDeepStrictEqual (value1: any, value2: any): boolean {
  /* helper functions */
  const _isSameInstance = (value1: unknown, value2: unknown, Class: Function): boolean =>
    value1 instanceof Class && value2 instanceof Class;
  const _ownKeys = Reflect?.ownKeys ?? ((value: MapLike): Array<string | symbol> =>
    [...Object.getOwnPropertyNames(value), ...Object.getOwnPropertySymbols(value)]);
  /* strict equality helper function */
  const _isEqual = (value1: unknown, value2: unknown): boolean =>
    Object.is(value1, value2);
  /* primitives: Boolean, Number, BigInt, String + Function + Symbol */
  if (_isEqual(value1, value2)) { return true; }
  /* Object Wrappers (Boolean, Number, BigInt, String) */
  if (_typeOf(value1) === "object" && _isPrimitive(value2)
    && _classOf(value1) === typeof value2) {
    return _isEqual(value1.valueOf(), value2);
  }
  if (_isPrimitive(value1)
    && _typeOf(value2) === "object"
    && typeof value1 === _classOf(value2)) {
    return _isEqual(value1, value2.valueOf());
  }
  /* type (primitives, object, null, NaN) */
  /*if (_deepType(value1) !== _deepType(value2)) { return false; }*/
  if (!_isSameType(value1, value2)) { return false; }
  /* objects */
  if (_typeOf(value1) === "object" && _typeOf(value2) === "object") {
    /* objects / same memory adress */
    if (_isEqual(value1, value2)) { return true; }
    /* objects / not same constructor */
    if (Object.getPrototypeOf(value1).constructor !==
      Object.getPrototypeOf(value2).constructor
    ) {
      return false;
    }
    /* objects / WeakMap + WeakSet */
    if (_isSameInstance(value1, value2, WeakMap)
      || _isSameInstance(value1, value2, WeakSet)) {
      return _isEqual(value1, value2);
    }
    /* objects / Wrapper objects: Number, Boolean, String, BigInt */
    if (_isSameInstance(value1, value2, Number)
      || _isSameInstance(value1, value2, Boolean)
      || _isSameInstance(value1, value2, String)
      || _isSameInstance(value1, value2, Symbol)
      || _isSameInstance(value1, value2, BigInt)) {
      return _isEqual(value1.valueOf(), value2.valueOf());
    }
    /* objects / Array */
    if (isArray(value1) && isArray(value2)) {
      if (value1.length !== value2.length) { return false; }
      if (value1.length === 0) { return true; }
      return value1.every((value: unknown, index: any): boolean =>
        _isDeepStrictEqual(value, value2[index])
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
          _isEqual(value, (value2 as any)[index])
      );
    }
    /* objects / ArrayBuffer */
    if (_isSameInstance(value1, value2, ArrayBuffer)) {
      if (value1.byteLength !== value2.byteLength) { return false; }
      if (value1.byteLength === 0) { return true; }
      let xTA = new Int8Array(value1), yTA = new Int8Array(value2);
      return xTA.every((value: unknown, index: number): boolean =>
        _isEqual(value, yTA[index]));
    }
    /* objects / DataView */
    if (_isSameInstance(value1, value2, DataView)) {
      if (value1.byteLength !== value2.byteLength) { return false; }
      if (value1.byteLength === 0) { return true; }
      for (let index = 0; index < value1.byteLength; index++) {
        if (!_isEqual(value1.getUint8(index), value2.getUint8(index))) {
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
        _isDeepStrictEqual(value1.get(value), value2.get(value)));
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
      return _isEqual(value1.lastIndex, value2.lastIndex)
        && _isEqual(value1.flags, value2.flags)
        && _isEqual(value1.source, value2.source);
    }
    /* objects / Error */
    if (_isSameInstance(value1, value2, Error)) {
      return _isDeepStrictEqual(
        Object.getOwnPropertyNames(value1).reduce(
          (acc, key): MapLike => { acc[key] = value1[key]; return acc; },
          {}
        ),
        Object.getOwnPropertyNames(value2).reduce(
          (acc, key): MapLike => { acc[key] = value2[key]; return acc; },
          {}
        )
      );
    }
    /* objects / Date */
    if (_isSameInstance(value1, value2, Date)) {
      return _isEqual(+value1, +value2);
    }
    /* objects / Proxy -> not detectable */
    /* objects / objects */
    let value1Keys: Array<string | symbol> = _ownKeys(value1);
    let value2Keys: Array<string | symbol> = _ownKeys(value2);
    if (value1Keys.length !== value2Keys.length) { return false; }
    if (value1Keys.length === 0) { return true; }
    return value1Keys.every((key: string | symbol): boolean =>
      _isDeepStrictEqual(value1[key], value2[key]));
  }
  /* default return false */
  return false;
}


/**
 * @description Checks if the given value is the given type(s).
 *
 * @param {any} value - The value to check.
 * @param {ExpectedType | undefined} [expectedType] - The type(s) for checking.
 * @param {boolean} Throw Default false.
 * @returns {boolean} True if the value is the given type(s), false otherwise.
 * @throws If Throw is true and type checking is failed.
 * @private
 */
function _isType (
  value: any,
  expectedType?: ExpectedType | undefined,
  Throw: boolean = false): string | Function | boolean {
  /* Validate `expected` */
  if (!(["string", "function", "undefined"].includes(typeof expectedType))
    && !isArray(expectedType)) {
    throw new TypeError(
      `[isType] TypeError: expectedType must be string, function, array or undefined. Got ${typeof expectedType}`
    );
  }
  /* Validate `Throw` */
  if (typeof Throw !== "boolean") {
    throw new TypeError(
      `[isType] TypeError: Throw has to be a boolean. Got ${_typeOf(Throw)}`
    );
  }
  /* Determine the type of `value` */
  const vType: string = _typeOf(value);
  /* If no expected type provided, return type or constructor */
  if (expectedType == null) {
    return vType === "object"
      ? Object.getPrototypeOf(value)?.constructor ?? "object"
      : vType;
  }
  /* Normalize expected to an array */
  let expectedArray: Array<string | Function> =
    isArray(expectedType) ? expectedType : [expectedType];
  /* Checks against expected types or constructors */
  let matched: boolean = expectedArray.some(
    function (item: string | Function) {
      if (typeof item === "string") { return vType === item; }
      if (typeof item === "function") { return value != null && value instanceof item; }
      /* validate expected array elements */
      throw new TypeError(
        `[isType] TypeError: expectedType array elements have to be a string or function. Got ${_typeOf(item)}`
      );
    }
  );
  /* Throw error if mismatch and `Throw` is true */
  if (Throw && !matched) {
    let vName: string =
      value.toString ? value.toString() : Object.prototype.toString.call(value);
    let eNames: string = expectedArray.map((item: any): string =>
      (typeof item === "string" ? item.toString() : (item.name ?? "anonymous"))
    ).join(", ");
    throw new TypeError(`[isType] TypeError: ${vName} is not a ${eNames}`);
  }
  return matched;
}


/**
 * @description Checks if the given value is an error.
 *
 * @param {unknown} value - The value to check.
 * @returns {boolean} True if the value is an error, false otherwise.
 * @private
 */
const _isError = (value: unknown): value is Error =>
  Error.isError ? Error.isError(value) : value instanceof Error;


/**
 * @description This function is a general purpose, type safe, predictable stringifier. Converts a value into a human-readable string for error messages Handles symbols, functions, nullish, circular references, etc.
 *
 * @param {unknown} value The value to check.
 * @returns {string}
 * @private
 */
function _toSafeString (value: unknown): string {
  const seen = new WeakSet<object>();
  function replacer (_key: string, value: unknown): unknown {
    if (typeof value === "function") {
      return `[Function: ${value.name || "anonymous"}]`;
    }
    if (typeof value === "symbol") { return value.toString(); }
    if (value instanceof Date) { return `Date(${value.toISOString()})`; }
    if (_isError(value)) {
      return `${value.name}: ${value.message}, ${value.stack ?? ""}`;
    }
    if (value && _typeOf(value) === "object") {
      if (seen.has(value)) { return "[Circular]" };
      seen.add(value);
    }
    return value;
  }
  if (["undefined", "null", "string", "number", "boolean", "bigint"]
    .includes(_typeOf(value))) {
    return String(value);
  }
  if (isArray(value)) {
    return `[${value.map(v => _toSafeString(v)).join(", ")}]`;
  }
  if (_isTypedArray(value)) {
    return `[${[...(value as any)].map(v => _toSafeString(v)).join(", ")}]`;
  }
  if (value instanceof Map) {
    return `Map(${value.size}){${Array.from(value.entries()).map(([k, v]): string => `${_toSafeString(k)} => ${_toSafeString(v)}`).join(", ")}}`;
  }
  if (value instanceof Set) {
    return `Set(${value.size}){${Array.from(value.values()).map(v => _toSafeString(v)).join(", ")}}`;
  }
  try {
    return JSON.stringify(value, replacer) ?? String(value);
  } catch (_e) {
    return String(value);
  }
}


/**
 * @description Checks value1 is less than value2.
 *
 * @param {Comparable} value1 The value1 to check.
 * @param {Comparable} value2 The value2 to check.
 * @returns {boolean} value1 is less than value2.
 * @private
 */
const _isLessThan = (value1: Comparable, value2: Comparable): boolean =>
  _isSameType(value1, value2) && value1 < value2;


/**
 * @description Checks value1 is less than value2 or equal (uses `Object.is();`).
 *
 * @param {Comparable} value1 The value1 to check.
 * @param {Comparable} value2 The value2 to check.
 * @returns {boolean} value1 is less than value2.
 * @private
 */
const _isLessThanOrEqual = (value1: Comparable, value2: Comparable): boolean =>
  _isSameType(value1, value2) && (value1 < value2 || Object.is(value1, value2));


/**
 * @description Checks value is greater than or equal min and value is less than or equal max.
 *
 * @param {Comparable} value The value1 to check.
 * @param {Comparable} min The value2 to check.
 * @param {Comparable} max The value2 to check.
 * @returns {boolean} value is greater than or equal min and value is less than or equal max.
 * @private
 */
const _inRange = (value: Comparable, min: Comparable, max: Comparable): boolean =>
  _isSameType(value, min)
    && _isSameType(min, max)
    && ((min < value && value < max)
        || Object.is(value, min)
        || Object.is(value, max)
    );


/**
 * Checks if a key or value exists in a container.
 *
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
    let it = container;
    let res = it.next();
    while (!res.done) {
      if (Object.is(res.value, keyOrValue)) { return true; }
      res = it.next();
    }
    return false;
  }
  /* Array + TypedArray + Set + Iterables */
  if (isArray(container)
    || _isTypedArray(container)
    || container instanceof Set
    || typeof container[Symbol.iterator] === "function") {
    let it = container[Symbol.iterator]();
    let res = it.next();
    while (!res.done) {
      if (Object.is(res.value, keyOrValue)) { return true; }
      res = it.next();
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
 *
 * - `null`, `undefined`, and `NaN` are empty.
 * - Arrays, TypedArrays, and strings are empty if length === 0.
 * - Maps and Sets are empty if size === 0.
 * - ArrayBuffer and DataView are empty if byteLength === 0.
 * - Iterable objects are empty if they have no elements.
 * - Plain objects are empty if they have no own properties.
 *
 * @param {any} value The value to check.
 * @returns boolean
 * @private
 */
function _isEmpty (value: any): boolean {
  /* Check undefined, null, NaN */
  if (value == null || value !== value) { return true; }
  /* Check Array, TypedArrays, string, String */
  if (isArray(value)
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
    const it = value[Symbol.iterator]();
    return it.next().done; /* avoids consuming entire iterator */
  }
  /* Check Iterator objects */
  if ("Iterator" in globalThis ? (value instanceof Iterator)
    : (_typeOf(value) === "object" && typeof value.next === "function")) {
    try {
      /* Has at least one element */
      for (const _item of value) { return false; }
      return true;
    } catch { /* Not iterable */ }
  }
  /* Other objects - check own properties (including symbols) */
  if (_typeOf(value) === "object") {
    const keys: unknown[] = [
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
 *
 * @param {unknown} value - The value to check.
 * @returns True if the value is Primitive, false otherwise.
 * @private
 */
const _isPrimitive = (value: unknown): value is Primitive =>
  _typeOf(value) !== "object" && typeof value !== "function";


/**
 * @description Checks if a value is a floating-point number.
 *
 * @param {unknown} value - The value to check.
 * @returns {boolean} True if the value is a float, false otherwise.
 * @private
 */
const _isFloat = (value: unknown): boolean =>
  typeof value === "number" && value === value && Boolean(value % 1);


/**
 * @description If value is an error, then it will be thrown.
 *
 * @param {unknown} value - The value to check.
 * @param {Function} caller
 * @returns {void}
 * @private
 */
function _errorCheck (value: unknown, caller: Function): void {
  if (_isError(value)) {
    if (typeof (Error as any).captureStackTrace === "function") {
      (Error as any).captureStackTrace(caller, value);
    }
    throw value;
  }
}


/* exported functions */


/**
 * @description An error thrown when an assertion fails.
 *
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
  constructor(options?: AssertionErrorOptions) {
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
 *
 * @param {unknown} condition The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function assert (condition: unknown, message?: unknown): asserts condition {
  if (!condition) {
    _errorCheck(message, assert);
    let errorMessage =
      `[assert] Assertion failed: ${_toSafeString(condition)} should be truly${message ? ` - ${_toSafeString(message)}` : ""}`;
    throw new assert.AssertionError({
      message: errorMessage,
      cause: errorMessage,
      actual: condition,
      expected: true,
      operator: "==",
    });
  }
}


/**
 * @description Alias for `assert(condition, [message: string | Error]);`.
 *
 * @param {unknown} condition The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
const ok = (condition: unknown, message?: unknown): asserts condition =>
  assert(condition, message);


/**
 * @description `assert.equal(actual, expected, [message: string | Error]);`
 *
 * @param {unknown} actual The actual value to check.
 * @param {unknown} expected The expected value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function equal (actual: unknown, expected: unknown, message?: unknown): void {
  if (assert.config.alwaysStrict === true) {
    return assert.strictEqual(actual, expected, message);
  }
  if (actual != expected) {
    _errorCheck(message, equal);
    let errorMessage =
      `[equal] Assertion failed: ${_toSafeString(actual)} and ${_toSafeString(expected)} should be equal${message ? ` - ${_toSafeString(message)}` : ""}`;
    throw new assert.AssertionError({
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
 * @param {unknown} actual The actual value to check.
 * @param {unknown} expected The expected value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function notEqual (actual: unknown, expected: unknown, message?: unknown): void {
  if (assert.config.alwaysStrict === true) {
    return assert.notStrictEqual(actual, expected, message);
  }
  if (actual == expected) {
    _errorCheck(message, notEqual);
    let errorMessage =
      `[notEqual] Assertion failed: ${_toSafeString(actual)} and ${_toSafeString(expected)} should be equal${message ? ` - ${_toSafeString(message)}` : ""}`;
    throw new assert.AssertionError({
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
 * @param {unknown} actual The actual value to check.
 * @param {unknown} expected The expected value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function strictEqual (actual: unknown, expected: unknown, message?: unknown): void {
  if (!Object.is(actual, expected)) {
    _errorCheck(message, strictEqual);
    let errorMessage =
      `[strictEqual] Assertion failed: ${_toSafeString(actual)} and ${_toSafeString(expected)} should be strictly equal${message ? ` - ${_toSafeString(message)}` : ""}`;
    throw new assert.AssertionError({
      message: errorMessage,
      cause: errorMessage,
      actual: actual,
      expected: expected,
      operator: "strictEqual"
    });
  }
}


/**
 * @description Inverse of `strictEqual(actual, expected, [message: string | Error]);`.
 *
 * @param {unknown} actual The actual value to check.
 * @param {unknown} expected The expected value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function notStrictEqual (actual: unknown, expected: unknown, message?: unknown): void {
  if (Object.is(actual, expected)) {
    _errorCheck(message, notStrictEqual);
    let errorMessage =
      `[notStrictEqual] Assertion failed: ${_toSafeString(actual)} and ${_toSafeString(expected)} should not be strictly equal${message ? ` - ${_toSafeString(message)}` : ""}`;
    throw new assert.AssertionError({
      message: errorMessage,
      cause: errorMessage,
      actual: actual,
      expected: expected,
      operator: "notStrictEqual"
    });
  }
}


/**
 * @description Deep equality check.
 *
 * @param {unknown} actual The actual value to check.
 * @param {unknown} expected The expected value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function deepEqual (actual: unknown, expected: unknown, message?: unknown): void {
  if (!_isDeepStrictEqual(actual, expected)) {
    _errorCheck(message, deepEqual);
    let errorMessage =
      `[deepEqual] Assertion failed: ${_toSafeString(actual)} and ${_toSafeString(expected)} should be deep equal${message ? ` - ${_toSafeString(message)}` : ""}`;
    throw new assert.AssertionError({
      message: errorMessage,
      cause: errorMessage,
      actual: actual,
      expected: expected,
      operator: "deepEqual"
    });
  }
}


/**
 * @description Inverse of `deepEqual(actual, expected, [message: string | Error]);`.
 *
 * @param {unknown} actual The actual value to check.
 * @param {unknown} expected The expected value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function notDeepEqual (actual: unknown, expected: unknown, message?: unknown): void {
  if (_isDeepStrictEqual(actual, expected)) {
    _errorCheck(message, notDeepEqual);
    let errorMessage =
      `[notDeepEqual] Assertion failed: ${_toSafeString(actual)} and ${_toSafeString(expected)} should not be deep equal${message ? ` - ${_toSafeString(message)}` : ""}`;
    throw new assert.AssertionError({
      message: errorMessage,
      cause: errorMessage,
      actual: actual,
      expected: expected,
      operator: "notDeepEqual"
    });
  }
}


/**
 * @description Ensures that a function throws.
 *
 * @param {Function} block
 * @param {unknown} Error_opt
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {Error | undefined}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function throws (block: Function, Error_opt?: unknown, message?: unknown): Error | undefined {
  let thrownError: any = undefined;
  try {
    block();
  } catch (catchedError) {
    thrownError = catchedError as Error;
  }
  if (!thrownError) {
    let errorMessage =
      `[throws] Assertion failed: function did not throw${message ? ` - ${_toSafeString(message)}` : ""}`;
    throw new assert.AssertionError({
      message: errorMessage,
      cause: errorMessage,
      operator: "throws"
    });
  }
  /* If Error_opt is provided, check the thrown error */
  if (Error_opt) {
    const errorMatches =
      (typeof Error_opt === "function" && thrownError instanceof Error_opt)
        || (typeof Error_opt === "string"
          && thrownError?.message?.includes(Error_opt))
        || (Error_opt instanceof RegExp
          && Error_opt.test(thrownError?.message));
    if (!errorMatches) {
      let errorMessage =
        `[throws] Assertion failed: function threw unexpected error: ${_toSafeString(thrownError)}${message ? ` - ${_toSafeString(message)}` : ""}`;
      throw new assert.AssertionError({
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
 * @param {(() => Promise<unknown>) | Promise<unknown>} block - Async function or promise expected to reject.
 * @param {ErrorConstructor | string | RegExp} [Error_opt] - Expected error type, substring, or pattern.
 * @param {unknown} [message] - Optional custom message or Error.
 * @returns {Promise<unknown>} - Resolves with the rejection reason if assertion passes.
 * @throws {assert.AssertionError} If assertion is failed.
 */
async function rejects (block: Function | Promise<unknown>, Error_opt?: unknown, message?: unknown): Promise<unknown> {
  let rejectedError: any;
  try {
    const result = typeof block === "function" ? await block() : await block;
    /* If we reach here, it resolved successfully */
    let errorMessage =
      `[rejects] Assertion failed: function/promise did not reject${message ? ` - ${_toSafeString(message)}` : ""}`;
    throw new assert.AssertionError({
      message: errorMessage,
      cause: result,
      expected: Error_opt,
      operator: "rejects"
    });
  } catch (catchedError) {
    rejectedError = catchedError;
  }
  /* If expected error provided, validate it */
  if (Error_opt) {
    const errorMatches =
      (typeof Error_opt === "function" && rejectedError instanceof Error_opt)
        || (typeof Error_opt === "string"
          && typeof (rejectedError as Error)?.message === "string")
        && (rejectedError as Error).message.includes(Error_opt)
        || (Error_opt instanceof RegExp
          && typeof (rejectedError as Error)?.message === "string"
          && Error_opt.test((rejectedError as Error).message));
    if (!errorMatches) {
      let errorMessage =
        `[rejects] Assertion failed: rejected with unexpected error: ${_toSafeString(rejectedError)}${message ? ` - ${_toSafeString(message)}` : ""}`;
      throw new assert.AssertionError({
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
 * @param {(() => Promise<unknown>) | Promise<unknown>} block - Async function or promise expected to resolve.
 * @param {ErrorConstructor | string | RegExp} [Error_opt] - Optional: an error type, message, or pattern that must NOT appear in a rejection.
 * @param {unknown} [message] - Optional custom message or Error to throw.
 * @returns {Promise<unknown>} - Resolves with the resolved value if assertion passes.
 * @throws {assert.AssertionError} If the function or promise rejects.
 */
async function doesNotReject (block: Function, Error_opt?: unknown, message?: unknown): Promise<unknown> {
  try {
    /* Execute async function or promise */
    const result = typeof block === "function" ? await block() : block;
    return result;
  } catch (catchedError) {
    /* Check if a specific unexpected error type or message was provided */
    if (Error_opt) {
      const errorMatches =
        (typeof Error_opt === "function" && catchedError instanceof Error_opt)
          || (typeof Error_opt === "string"
            && (catchedError as Error).message?.includes(Error_opt))
          || (Error_opt instanceof RegExp
            && Error_opt.test((catchedError as Error).message));
      if (errorMatches) {
        if (_isError(message)) throw message;
        let errorMessage =
          `[doesNotReject] Assertion failed: function/promise rejected with disallowed error: ${_toSafeString(catchedError)}${message ? ` - ${_toSafeString(message)}` : ""}`;
        throw new assert.AssertionError({
          message: errorMessage,
          cause: catchedError,
          actual: catchedError,
          expected: undefined,
          operator: "doesNotReject"
        });
      }
    }
    _errorCheck(message, doesNotReject);
    let errorMessage =
      `[doesNotReject] Assertion failed: function/promise rejected unexpectedly${message ? ` - ${_toSafeString(message)}` : ""}`;
    throw new assert.AssertionError({
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
 * @param {unknown[]} ...args - Optional arguments.
 * @returns {void}
 * @throws {assert.AssertionError}
 */
function fail (message?: unknown): void;
function fail (actual?: unknown, expected?: unknown, message?: string, operator?: unknown): void;
function fail (...args: unknown[]): void {
  let message = args.length === 1 ? args[0] :
    (args.length > 1 ? args[2] : undefined);
  _errorCheck(message, fail);
  let errorMessage =
    `[fail] Assertion failed${message ? `: ${_toSafeString(message)}` : ""}`;
  throw new assert.AssertionError({
    message: errorMessage,
    cause: errorMessage,
    actual: args.length > 1 ? args[0] : undefined,
    expected: args.length > 1 ? args[1] : undefined,
    operator: args.length > 1 ? args[3] : undefined
  });
}


/**
 * @description Ensures a value is falsy.
 *
 * @param {unknown} condition The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function notOk (condition: unknown, message?: unknown): asserts condition is Falsy {
  if (condition) {
    _errorCheck(message, notOk);
    let errorMessage =
      `[notOk] Assertion failed: ${_toSafeString(condition)} should be falsy${message ? ` - ${_toSafeString(message)}` : ""}`;
    throw new assert.AssertionError({
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
 * @param {unknown} condition The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function isTrue (condition: unknown, message?: unknown): asserts condition is true {
  if (condition !== true) {
    _errorCheck(message, isTrue);
    let errorMessage =
      `[isTrue] Assertion failed: ${_toSafeString(condition)} should be true${message ? ` - ${_toSafeString(message)}` : ""}`;
    throw new assert.AssertionError({
      message: errorMessage,
      cause: errorMessage,
      actual: condition,
      expected: true,
      operator: "!=="
    });
  }
}


/**
 * @description Ensures value is exactly not `true`, but can be `false` or truthy or falsy.
 *
 * @param {T} condition The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function isNotTrue <T>(condition: T, message?: unknown): asserts condition is Exclude<T, true> {
  if (condition === true) {
    _errorCheck(message, isNotTrue);
    let errorMessage =
      `[isNotTrue] Assertion failed: ${_toSafeString(condition)} should be not true${message ? ` - ${_toSafeString(message)}` : ""}`;
    throw new assert.AssertionError({
      message: errorMessage,
      cause: errorMessage,
      actual: condition,
      expected: true,
      operator: "==="
    });
  }
}


/**
 * @description Ensures value is exactly `false`.
 *
 * @param {unknown} condition The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function isFalse (condition: unknown, message?: unknown): asserts condition is false {
  if (condition !== false) {
    _errorCheck(message, isFalse);
    let errorMessage =
      `[isFalse] Assertion failed: ${_toSafeString(condition)} should be false${message ? ` - ${_toSafeString(message)}` : ""}`;
    throw new assert.AssertionError({
      message: errorMessage,
      cause: errorMessage,
      actual: condition,
      expected: false,
      operator: "!=="
    });
  }
}


/**
 * @description Ensures value is exactly not `false`, but can be `true` or truthy or falsy.
 *
 * @param {T} condition The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function isNotFalse <T>(condition: T, message?: unknown): asserts condition is Exclude<T, false> {
  if (condition === false) {
    _errorCheck(message, isNotFalse);
    let errorMessage =
      `[isNotFalse] Assertion failed: ${_toSafeString(condition)} should be not false${message ? ` - ${_toSafeString(message)}` : ""}`;
    throw new assert.AssertionError({
      message: errorMessage,
      cause: errorMessage,
      actual: condition,
      expected: false,
      operator: "==="
    });
  }
}


/**
 * @description Ensures a value matches a type or constructor. The expected type can be a string, function or an array of strings and functions.
 *
 * @param {unknown} value The value to check.
 * @param {string | Function | Array<string | Function>} expectedType
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function is (
  value: unknown,
  expectedType: ExpectedType,
  message?: unknown): void {
  if (!_isType(value, expectedType, false)) {
    _errorCheck(message, is);
    let errorMessage =
      `[is] Assertion failed: ${_toSafeString(value)} should be an expected type: ${_toSafeString(expectedType)}${message ? ` - ${_toSafeString(message)}` : ""}`;
    throw new assert.AssertionError({
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
 * @param {unknown} value The value to check.
 * @param {string | Function | Array<string | Function>} expectedType
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function isNot (value: unknown, expectedType: ExpectedType, message?: unknown): void {
  if (_isType(value, expectedType, false)) {
    _errorCheck(message, isNot);
    let errorMessage =
      `[isNot] Assertion failed: ${_toSafeString(value)} should not be an expected type: ${_toSafeString(expectedType)}${message ? ` - ${_toSafeString(message)}` : ""}`;
    throw new assert.AssertionError({
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
 * @param {unknown} value The value to check.
* @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
const isNullish = (value: unknown, message?: unknown): asserts value is NonNullable<unknown> =>
  assert.is(value,
    ["null", "undefined"],
    `[isNullish] Assertion failed: ${_toSafeString(value)} should be null or undefined${message ? ` - ${_toSafeString(message)}` : ""}`
  );


/**
 * @description Ensures value is not `null` or `undefined`.
 *
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
const isNonNullable = (value: unknown, message?: unknown): asserts value is NonNullable<unknown> =>
  assert.isNot(value,
    ["null", "undefined"],
    `[isNonNullable] Assertion failed: ${_toSafeString(value)} should be not null or undefined${message ? ` - ${_toSafeString(message)}` : ""}`
  );


/**
 * @description Ensures value is `null`.
 *
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
const isNull = (value: unknown, message?: unknown): asserts value is null =>
  assert.is(value, "null", message);


/**
 * @description Ensures value is not `null`.
 *
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
const isNotNull = (value: unknown, message?: unknown): asserts value is Exclude<unknown, null> =>
  assert.isNot(value, "null", message);


/**
 * @description Ensures value is `undefined`.
 *
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
const isUndefined = (value: unknown, message?: unknown): asserts value is undefined =>
  assert.is(value, "undefined", message);


/**
 * @description Ensures value is not `undefined`.
 *
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
const isDefined = (value: unknown, message?: unknown): asserts value is Exclude<unknown, undefined> =>
  assert.isNot(value, "undefined", message);


/**
 * @description Ensures value is `string`.
 *
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
const isString = (value: unknown, message?: unknown): asserts value is string =>
  assert.is(value, "string", message);


/**
 * @description Ensures value is not `string`.
 *
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
const isNotString = (value: unknown, message?: unknown): asserts value is Exclude<unknown, string> =>
  assert.isNot(value, "string", message);


/**
 * @description Ensures value is `number`.
 *
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
const isNumber = (value: unknown, message?: unknown): asserts value is number =>
  assert.is(value, "number", message);


/**
 * @description Ensures value is not `number`.
 *
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
const isNotNumber = (value: unknown, message?: unknown): asserts value is Exclude<unknown, number> =>
  assert.isNot(value, "number", message);


/**
 * @description Ensures value is `bigint`.
 *
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
const isBigInt = (value: unknown, message?: unknown): asserts value is bigint =>
  assert.is(value, "bigint", message);


/**
 * @description Ensures value is not `bigint`.
 *
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
const isNotBigInt = (value: unknown, message?: unknown): asserts value is Exclude<unknown, bigint> =>
  assert.isNot(value, "bigint", message);


/**
 * @description Ensures value is `boolean`.
 *
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
const isBoolean = (value: unknown, message?: unknown): asserts value is boolean =>
  assert.is(value, "boolean", message);


/**
 * @description Ensures value is not `boolean`.
 *
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
const isNotBoolean = (value: unknown, message?: unknown): asserts value is Exclude<unknown, boolean> =>
  assert.isNot(value, "boolean", message);


/**
 * @description Ensures value is `symbol`.
 *
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
const isSymbol = (value: unknown, message?: unknown): asserts value is symbol =>
  assert.is(value, "symbol", message);


/**
 * @description Ensures value is not `symbol`.
 *
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
const isNotSymbol = (value: unknown, message?: unknown): asserts value is Exclude<unknown, symbol> =>
  assert.isNot(value, "symbol", message);


/**
 * @description Ensures value is `function`.
 *
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
const isFunction = (value: unknown, message?: unknown): asserts value is Function =>
  assert.is(value, "function", message);


/**
 * @description Ensures value is not `function`.
 *
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
const isNotFunction = (value: unknown, message?: unknown): asserts value is Exclude<unknown, Function> =>
  assert.isNot(value, "function", message);


/**
 * @description Ensures value is `object`.
 *
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
const isObject = (value: unknown, message?: unknown): asserts value is object =>
  assert.is(value, "object", message);


/**
 * @description Ensures value is not `object`.
 *
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
const isNotObject = (value: unknown, message?: unknown): asserts value is Exclude<unknown, object> =>
  assert.isNot(value, "object", message);


/**
 * @description Ensures value is not `object` or `function`.
 *
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
const isPrimitive = (value: unknown, message?: unknown): asserts value is Primitive =>
  assert.isNot(value, ["object", "function"], message);


/**
 * @description Ensures value is `object` or `function`.
 *
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
const isNotPrimitive = (value: unknown, message?: unknown): asserts value is NonPrimitive =>
  assert.is(value, ["object", "function"], message);


/**
 * @description Ensures value is a number and NaN.
 *
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function isNaN (value: unknown, message?: unknown): void {
  if (!Number.isNaN(value)) {
    _errorCheck(message, isNaN);
    let errorMessage =
      `[isNaN] Assertion failed: ${_toSafeString(value)} should be NaN${message ? ` - ${_toSafeString(message)}` : ""}`;
    throw new assert.AssertionError({
      message: errorMessage,
      cause: errorMessage,
      actual: value,
      expected: "",
      operator: "isNaN"
    });
  }
}


/**
 * @description Ensures value is not a number and NaN.
 *
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function isNotNaN (value: unknown, message?: unknown): void {
    if (Number.isNaN(value)) {
    _errorCheck(message, isNotNaN);
    let errorMessage =
      `[isNotNaN] Assertion failed: ${_toSafeString(value)} should be NaN${message ? ` - ${_toSafeString(message)}` : ""}`;
    throw new assert.AssertionError({
      message: errorMessage,
      cause: errorMessage,
      actual: value,
      expected: "",
      operator: "isNaN"
    });
  }
}


/**
 * @description Ensures value is a number and integer.
 *
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function isInt (value: unknown, message?: unknown): void {
  if (!Number.isInteger(value)) {
    _errorCheck(message, isInt);
    let errorMessage =
      `[isInt] Assertion failed: ${_toSafeString(value)} should be an integer${message ? ` - ${_toSafeString(message)}` : ""}`;
    throw new assert.AssertionError({
      message: errorMessage,
      cause: errorMessage,
      actual: value,
      expected: "",
      operator: "isInt"
    });
  }
}


/**
 * @description Ensures value is not a number and integer.
 *
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function isNotInt (value: unknown, message?: unknown): void {
  if (Number.isInteger(value)) {
    _errorCheck(message, isNotInt);
    let errorMessage =
      `[isNotInt] Assertion failed: ${_toSafeString(value)} should not be an integer${message ? ` - ${_toSafeString(message)}` : ""}`;
    throw new assert.AssertionError({
      message: errorMessage,
      cause: errorMessage,
      actual: value,
      expected: "",
      operator: "isNotInt"
    });
  }
}


/**
 * @description Ensures value is a float and integer.
 *
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function isFloat (value: unknown, message?: unknown): void {
  if (!_isFloat(value)) {
    _errorCheck(message, isFloat);
    let errorMessage =
      `[isFloat] Assertion failed: ${_toSafeString(value)} should be a float${message ? ` - ${_toSafeString(message)}` : ""}`;
    throw new assert.AssertionError({
      message: errorMessage,
      cause: errorMessage,
      actual: value,
      expected: "",
      operator: "isFloat"
    });
  }
}


/**
 * @description Ensures value is not a number and float.
 *
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function isNotFloat (value: unknown, message?: unknown): void {
  if (_isFloat(value)) {
    _errorCheck(message, isNotFloat);
    let errorMessage =
      `[isNotFloat] Assertion failed: ${_toSafeString(value)} should not be a float${message ? ` - ${_toSafeString(message)}` : ""}`;
    throw new assert.AssertionError({
      message: errorMessage,
      cause: errorMessage,
      actual: value,
      expected: "",
      operator: "isNotFloat"
    });
  }
}


/**
 * @description Ensures value is empty.
 *
 * - `null`, `undefined`, and `NaN` are empty.
 * - Arrays, TypedArrays, and strings are empty if length === 0.
 * - Maps and Sets are empty if size === 0.
 * - ArrayBuffer and DataView are empty if byteLength === 0.
 * - Iterable objects are empty if they have no elements.
 * - Plain objects are empty if they have no own properties.
 *
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function isEmpty (value: unknown, message?: unknown): void {
  if (!_isEmpty(value)) {
    _errorCheck(message, isEmpty);
    let errorMessage =
      `[isEmpty] Assertion failed: ${_toSafeString(value)} should be empty${message ? ` - ${_toSafeString(message)}` : ""}`;
    throw new assert.AssertionError({
      message: errorMessage,
      cause: errorMessage,
      actual: value,
      expected: "",
      operator: "isEmpty"
    });
  }
}


/**
 * @description Ensures value is not empty.
 *
 * - `null`, `undefined`, and `NaN` are empty.
 * - Arrays, TypedArrays, and strings are empty if length === 0.
 * - Maps and Sets are empty if size === 0.
 * - ArrayBuffer and DataView are empty if byteLength === 0.
 * - Iterable objects are empty if they have no elements.
 * - Plain objects are empty if they have no own properties.
 *
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function isNotEmpty (value: unknown, message?: unknown): void {
  if (_isEmpty(value)) {
    _errorCheck(message, isNotEmpty);
    let errorMessage =
      `[isNotEmpty] Assertion failed: ${_toSafeString(value)} should be not empty${message ? ` - ${_toSafeString(message)}` : ""}`;
    throw new assert.AssertionError({
      message: errorMessage,
      cause: errorMessage,
      actual: value,
      expected: "",
      operator: "isNotEmpty"
    });
  }
}


/**
 * @description Ensures a string matches a regular expression.
 *
 * @param {string} string
 * @param {RegExp} regexp
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {TypeError} If parameter types are not matched.
 * @throws {assert.AssertionError} If assertion is failed.
 */
function match (string: StringLike, regexp: RegExp, message?: unknown): void {
  if (typeof string !== "string" || (string as any) instanceof String) {
    _errorCheck(message, match);
    throw new TypeError(
      `[match] TypeError: " ${string} is not a string${message ? ` - ${_toSafeString(message)}` : ""}`
    );
  }
  if (!(regexp instanceof RegExp)) {
    _errorCheck(message, match);
    throw new TypeError(
      `[match] TypeError: ${_toSafeString(regexp)} is not a RegExp${message ? ` - ${_toSafeString(message)}` : ""}`
    );
  }
  if (!(regexp.test(String(string)) || (string as any) instanceof String)) {
    _errorCheck(message, match);
    let errorMessage =
      `[match] Assertion failed: ${_toSafeString(string)} is not matched with ${_toSafeString(regexp)}${message ? ` - ${_toSafeString(message)}` : ""}`;
    throw new assert.AssertionError({
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
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {TypeError} If parameter types are not matched.
 * @throws {assert.AssertionError} If assertion is failed.
 */
function doesNotMatch (string: StringLike, regexp: RegExp, message?: unknown): void {
  if (typeof string !== "string") {
    _errorCheck(message, doesNotMatch);
    throw new TypeError(
      `[doesNotMatch] TypeError: " ${string} is not a string${message ? ` - ${_toSafeString(message)}` : ""}`
    );
  }
  if (!(regexp instanceof RegExp)) {
    _errorCheck(message, doesNotMatch);
    throw new TypeError(
      `[doesNotMatch] TypeError: ${_toSafeString(regexp)} is not a RegExp${message ? ` - ${_toSafeString(message)}` : ""}`
    );
  }
  if (regexp.test(String(string))) {
    _errorCheck(message, doesNotMatch);
    let errorMessage =
      `[doesNotMatch] Assertion failed: ${_toSafeString(string)} is matched with ${_toSafeString(regexp)}${message ? ` - ${_toSafeString(message)}` : ""}`;
    throw new assert.AssertionError({
      message: errorMessage,
      cause: errorMessage,
      actual: string,
      expected: regexp,
      operator: "doesNotMatch"
    });
  }
}


/**
 * @description Ensures `a < b` and value types have to be same type.
 *
 * @param {Comparable} value1 The value1 to check.
 * @param {Comparable} value2 The value2 to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function lt (value1: Comparable, value2: Comparable, message?: unknown): void {
  if (!_isLessThan(value1, value2)) {
    _errorCheck(message, lt);
    let errorMessage =
      `[lt] Assertion failed: ${_toSafeString(value1)} should be less than ${_toSafeString(value2)}${message ? ` - ${_toSafeString(message)}` : ""}`;
    throw new assert.AssertionError({
      message: errorMessage,
      cause: errorMessage,
      actual: value1,
      expected: value2,
      operator: "<"
    });
  }
}


/**
 * @description Ensures `a >= b` and value types have to be same type.
 *
 * @param {Comparable} value1 The value1 to check.
 * @param {Comparable} value2 The value2 to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function lte (value1: Comparable, value2: Comparable, message?: unknown): void {
  if (!_isLessThanOrEqual(value1, value2)) {
    _errorCheck(message, lte);
    let errorMessage =
      `[lte] Assertion failed: ${_toSafeString(value1)} should be less than or equal ${_toSafeString(value2)}${message ? ` - ${_toSafeString(message)}` : ""}`;
    throw new assert.AssertionError({
      message: errorMessage,
      cause: errorMessage,
      actual: value1,
      expected: value2,
      operator: "< or Object.is();"
    });
  }
}


/**
 * @description Ensures `a > b` and value types have to be same type.
 *
 * @param {Comparable} value1 The value1 to check.
 * @param {Comparable} value2 The value2 to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function gt (value1: Comparable, value2: Comparable, message?: unknown): void {
  if (!_isLessThan(value2, value1)) {
    _errorCheck(message, gt);
    let errorMessage =
      `[gt] Assertion failed: ${_toSafeString(value1)} should be greater than ${_toSafeString(value2)}${message ? ` - ${_toSafeString(message)}` : ""}`;
    throw new assert.AssertionError({
      message: errorMessage,
      cause: errorMessage,
      actual: value1,
      expected: value2,
      operator: ">"
    });
  }
}


/**
 * @description Ensures `a <= b` and value types have to be same type.
 *
 * @param {Comparable} value1 The value1 to check.
 * @param {Comparable} value2 The value2 to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function gte (value1: Comparable, value2: Comparable, message?: unknown): void {
  if (!_isLessThanOrEqual(value2, value1)) {
    _errorCheck(message, gte);
    let errorMessage =
      `[gte] Assertion failed: ${_toSafeString(value1)} should be greater than or equal ${_toSafeString(value2)}${message ? ` - ${_toSafeString(message)}` : ""}`;
    throw new assert.AssertionError({
      message: errorMessage,
      cause: errorMessage,
      actual: value1,
      expected: value2,
      operator: "> or Object.is();"
    });
  }
}


/**
 * @description Ensures `min <= value <= max` and the value types have to be same type.
 *
 * @param {Comparable} value The value to check.
 * @param {Comparable} min The min value to check.
 * @param {Comparable} max The max value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function inRange (value: Comparable, min: Comparable, max: Comparable, message?: unknown): void {
  if (!_inRange(value, min, max)) {
    _errorCheck(message, inRange);
    let errorMessage =
      `[inRange] Assertion failed: ${_toSafeString(value)} should be in range ${_toSafeString(min)} and ${_toSafeString(max)} or the type of the values are not the same${message ? ` - ${_toSafeString(message)}` : ""}`;
    throw new assert.AssertionError({
      message: errorMessage,
      cause: errorMessage,
      actual: value,
      expected: `${_toSafeString(min)} and ${_toSafeString(max)}`,
      operator: "inRange"
    });
  }
}


/**
 * @description Inverse of `inRange(value, min, max, [message: string | Error]);`.
 *
 * @param {Comparable} value The value to check.
 * @param {Comparable} min The min value to check.
 * @param {Comparable} max The max value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function notInRange (value: Comparable, min: Comparable, max: Comparable, message?: unknown): void {
  if (_inRange(value, min, max)) {
    _errorCheck(message, notInRange);
    let errorMessage =
      `[notInRange] Assertion failed: ${_toSafeString(value)} should be not in range ${_toSafeString(min)} and ${_toSafeString(max)}${message ? ` - ${_toSafeString(message)}` : ""}`;
    throw new assert.AssertionError({
      message: errorMessage,
      cause: errorMessage,
      actual: value,
      expected: `${_toSafeString(min)} and ${_toSafeString(max)}`,
      operator: "notInRange"
    });
  }
}


/**
 * @description Asserts that `actual` (a string) contains the specified `substring`.
 *
 * @param {string} actual - The string to check.
 * @param {string} substring - The substring expected to appear within `actual`.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function stringContains(actual: StringLike, substring: StringLike, message?: unknown): void {
  /* Type validation */
  if (typeof actual !== "string" || (actual as any) instanceof String) {
    _errorCheck(message, stringContains);
    throw new TypeError(
      `[stringContains] TypeError: ${_toSafeString(actual)} is not a string${message ? ` - ${_toSafeString(message)}` : ""}`
    );
  }
  if (typeof substring !== "string" || (substring as any) instanceof String) {
    _errorCheck(message, stringContains);
    throw new TypeError(
      `[stringContains] TypeError: ${_toSafeString(substring)} is not a string${message ? ` - ${_toSafeString(message)}` : ""}`
    );
  }
  /* Assertion */
  if (!String(actual).includes(String(substring))) {
    _errorCheck(message, stringContains);
    let errorMessage =
      `[stringContains] Assertion failed: ${_toSafeString(actual)} does not contain substring ${_toSafeString(substring)}${message ? ` - ${_toSafeString(message)}` : ""}`;
    throw new assert.AssertionError({
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
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function stringNotContains(actual: StringLike, substring: StringLike, message?: unknown): void {
  /* Type validation */
  if (typeof actual !== "string" || (actual as any) instanceof String) {
    _errorCheck(message, stringNotContains);
    throw new TypeError(
      `[stringNotContains] TypeError: ${_toSafeString(actual)} is not a string${message ? ` - ${_toSafeString(message)}` : ""}`
    );
  }
  if (typeof substring !== "string" || (substring as any) instanceof String) {
    _errorCheck(message, stringNotContains);
    throw new TypeError(
      `[stringNotContains] TypeError: ${_toSafeString(substring)} is not a string${message ? ` - ${_toSafeString(message)}` : ""}`
    );
  }
  /* Assertion */
  if (actual.includes(String(substring))) {
    _errorCheck(message, stringNotContains);
    let errorMessage =
      `[stringNotContains] Assertion failed: ${_toSafeString(actual)} should not contain substring ${_toSafeString(substring)}${message ? ` - ${_toSafeString(message)}` : ""}`;
    throw new assert.AssertionError({
      message: errorMessage,
      cause: errorMessage,
      actual,
      expected: substring,
      operator: "stringNotContains"
    });
  }
}


/**
 * @description Asserts that `actual` (a string) starts with the specified `substring`.
 *
 * @param {string} actual - The string to check.
 * @param {string} substring - The substring expected to appear within `actual`.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function stringStartsWith(actual: StringLike, substring: StringLike, message?: unknown): void {
  /* Type validation */
  if (typeof actual !== "string" || (actual as any) instanceof String) {
    _errorCheck(message, stringStartsWith);
    throw new TypeError(
      `[stringStartsWith] TypeError: ${_toSafeString(actual)} is not a string${message ? ` - ${_toSafeString(message)}` : ""}`
    );
  }
  if (typeof substring !== "string" || (substring as any) instanceof String) {
    _errorCheck(message, stringStartsWith);
    throw new TypeError(
      `[stringStartsWith] TypeError: ${_toSafeString(substring)} is not a string${message ? ` - ${_toSafeString(message)}` : ""}`
    );
  }
  /* Assertion */
  if (!String(actual).startsWith(String(substring))) {
    _errorCheck(message, stringStartsWith);
    let errorMessage =
      `[stringStartsWith] Assertion failed: ${_toSafeString(actual)} does not start with substring ${_toSafeString(substring)}${message ? ` - ${_toSafeString(message)}` : ""}`;
    throw new assert.AssertionError({
      message: errorMessage,
      cause: errorMessage,
      actual,
      expected: substring,
      operator: "stringStartsWith"
    });
  }
}


/**
 * @description Asserts that `actual` (a string) does not start with the specified `substring`.
 *
 * @param {string} actual - The string to check.
 * @param {string} substring - The substring expected to appear within `actual`.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function stringNotStartsWith(actual: StringLike, substring: StringLike, message?: unknown): void {
  /* Type validation */
  if (typeof actual !== "string" || (actual as any) instanceof String) {
    _errorCheck(message, stringNotStartsWith);
    throw new TypeError(
      `[stringNotStartsWith] TypeError: ${_toSafeString(actual)} is not a string${message ? ` - ${_toSafeString(message)}` : ""}`
    );
  }
  if (typeof substring !== "string" || (substring as any) instanceof String) {
    _errorCheck(message, stringNotStartsWith);
    throw new TypeError(
      `[stringNotStartsWith] TypeError: ${_toSafeString(substring)} is not a string${message ? ` - ${_toSafeString(message)}` : ""}`
    );
  }
  /* Assertion */
  if (String(actual).startsWith(String(substring))) {
    _errorCheck(message, stringNotStartsWith);
    let errorMessage =
      `[stringNotStartsWith] Assertion failed: ${_toSafeString(actual)} starts with substring ${_toSafeString(substring)}${message ? ` - ${_toSafeString(message)}` : ""}`;
    throw new assert.AssertionError({
      message: errorMessage,
      cause: errorMessage,
      actual,
      expected: substring,
      operator: "doesNotStartWith"
    });
  }
}


/**
 * @description Asserts that `actual` (a string) ends with the specified `substring`.
 *
 * @param {string} actual - The string to check.
 * @param {string} substring - The substring expected to appear within `actual`.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function stringEndsWith(actual: StringLike, substring: StringLike, message?: unknown): void {
  /* Type validation */
  if (typeof actual !== "string" || (actual as any) instanceof String) {
    _errorCheck(message, stringEndsWith);
    throw new TypeError(
      `[stringEndsWith] TypeError: ${_toSafeString(actual)} is not a string${message ? ` - ${_toSafeString(message)}` : ""}`
    );
  }
  if (typeof substring !== "string" || (substring as any) instanceof String) {
    _errorCheck(message, stringEndsWith);
    throw new TypeError(
      `[stringEndsWith] TypeError: ${_toSafeString(substring)} is not a string${message ? ` - ${_toSafeString(message)}` : ""}`
    );
  }
  /* Assertion */
  if (!String(actual).endsWith(String(substring))) {
    _errorCheck(message, stringEndsWith);
    let errorMessage =
      `[stringEndsWith] Assertion failed: ${_toSafeString(actual)} does not end with substring ${_toSafeString(substring)}${message ? ` - ${_toSafeString(message)}` : ""}`;
    throw new assert.AssertionError({
      message: errorMessage,
      cause: errorMessage,
      actual,
      expected: substring,
      operator: "stringEndsWith"
    });
  }
}


/**
 * @description Asserts that `actual` (a string) does not end with the specified `substring`.
 *
 * @param {string} actual - The string to check.
 * @param {string} substring - The substring expected to appear within `actual`.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function stringNotEndsWith(actual: StringLike, substring: StringLike, message?: unknown): void {
  /* Type validation */
  if (typeof actual !== "string" || (actual as any) instanceof String) {
    _errorCheck(message, stringNotEndsWith);
    throw new TypeError(
      `[stringEndsWith] TypeError: ${_toSafeString(actual)} is not a string${message ? ` - ${_toSafeString(message)}` : ""}`
    );
  }
  if (typeof substring !== "string" || (substring as any) instanceof String) {
    _errorCheck(message, stringNotEndsWith);
    throw new TypeError(
      `[stringEndsWith] TypeError: ${_toSafeString(substring)} is not a string${message ? ` - ${_toSafeString(message)}` : ""}`
    );
  }
  /* Assertion */
  if (String(actual).endsWith(String(substring))) {
    _errorCheck(message, stringNotEndsWith);
    let errorMessage =
      `[stringNotEndsWith] Assertion failed: ${_toSafeString(actual)} ends with substring ${_toSafeString(substring)}${message ? ` - ${_toSafeString(message)}` : ""}`;
    throw new assert.AssertionError({
      message: errorMessage,
      cause: errorMessage,
      actual,
      expected: substring,
      operator: "stringEndsWith"
    });
  }
}


/**
 * @description Ensures a container includes a key and value.
 *
 * @param {any} container The container to check.
 * @param {IncludesOptions} options Options object with the checking key and value.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {TypeError} If parameter types are not matched.
 * @throws {assert.AssertionError} If assertion is failed.
 */
function includes (
  container: any,
  options: IncludesOptions,
  message?: unknown): void {
  if (_typeOf(options) !== "object") {
    _errorCheck(message, includes);
    throw new TypeError(
      `[includes] TypeError: ${_toSafeString(options)} is not an object${message ? ` - ${_toSafeString(message)}` : ""}`
    );
  }
  if (!_includes(container, options.keyOrValue, options?.value ?? undefined)) {
    _errorCheck(message, includes);
    let errorMessage =
      `[includes] Assertion failed: ${_toSafeString(container)} does not include${_toSafeString(options)}${message ? ` - ${_toSafeString(message)}` : ""}`;
    throw new assert.AssertionError({
      message: errorMessage,
      cause: errorMessage,
      actual: container,
      expected: options,
      operator: "includes"
    });
  }
}


/**
 * @description Ensures a container does not include a key and value.
 *
 * @param {any} container The container to check.
 * @param {IncludesOptions} options Options object with the checking key and value.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {TypeError} If parameter types are not matched.
 * @throws {assert.AssertionError} If assertion is failed.
 */
function doesNotInclude (
  container: any,
  options: IncludesOptions,
  message?: unknown): void {
  if (_typeOf(options) !== "object") {
    _errorCheck(message, doesNotInclude);
    throw new TypeError(
      `[doesNotInclude] TypeError: ${_toSafeString(options)} is not an object${message ? ` - ${_toSafeString(message)}` : ""}`
    );
  }
  if (_includes(container, options.keyOrValue, options?.value ?? undefined)) {
    _errorCheck(message, doesNotInclude);
    let errorMessage =
      `[doesNotInclude] Assertion failed: ${_toSafeString(container)} does not include ${_toSafeString(options)}${message ? ` - ${_toSafeString(message)}` : ""}`;
    throw new assert.AssertionError({
      message: errorMessage,
      cause: errorMessage,
      actual: container,
      expected: options,
      operator: "doesNotInclude"
    });
  }
}


/**
 * @description Ensures a value is in a flat collection (`Array`, iterables, etc.).
 *
 * @param {unknown} value - The value to check.
 * @param {unknown} collection - List of the possibly values.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
const oneOf = (value: unknown, collection: unknown, message?: unknown): void =>
  assert.includes(collection, {keyOrValue: value}, message);


/**
 * @description Ensures a value is not in a flat collection (`Array`, iterables, etc.).
 *
 * @param {unknown} value - The value to check.
 * @param {unknown} collection - List of the possibly values.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
const notOneOf = (value: unknown, collection: unknown, message?: unknown): void =>
  assert.doesNotInclude(collection, {keyOrValue: value}, message);


/* testrunner functions */


/**
 * Synchronously runs a block of code and returns either its result or the caught error.
 *
 * @param {Function} block - The function to execute.
 * @returns {TestResult<T>} The result of the block if successful, or the caught error if it throws.
 */
function testSync <T>(block: () => T, name = "assert.testSync"): TestResult<T> {
  try {
    return {ok: true, value: block(), block: block, name: _toSafeString(name)};
  } catch (error) {
    return {
      ok: false,
      error: _isError(error) ? error : new Error(_toSafeString(error)),
      block: block,
      name: _toSafeString(name)
    };
  }
}


/**
 * Asynchronously runs a block of code and returns either its resolved result or the caught error.
 *
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
      name: _toSafeString(name)
    };
  } catch (error) {
    return {
      ok: false,
      error: _isError(error) ? error : new Error(_toSafeString(error)),
      block: block,
      name: _toSafeString(name)
    };
  }
}


/**
 * Checks if the result is successful and narrows the type accordingly.
 *
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
assert.is = is; // xxx
assert.isNot = isNot; // xxx
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
assert.isEmpty = isEmpty; // xxx
assert.isNotEmpty = isNotEmpty; // xxx
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
assert.includes = includes; // xxx
assert.doesNotInclude = doesNotInclude; /// xxx
assert.oneOf = oneOf;
assert.notOneOf = notOneOf;
/* testrunner functions */
assert.testSync = testSync;
assert.testAsync = testAsync;
assert.testCheck = testCheck;


/* ESM export */
export {assert};
export default assert;
