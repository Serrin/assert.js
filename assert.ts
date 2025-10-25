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
 * @version 1.0.2
 * @author Ferenc Czigler
 * @see https://github.com/Serrin/assert.js/
 * @license MIT https://opensource.org/licenses/MIT
 */


const VERSION = "assert.js v1.0.2";


/*
standard unit testing:
https://wiki.commonjs.org/wiki/Unit_Testing/1.0

Mozilla Assert functions
https://firefox-source-docs.mozilla.org/testing/assert.html
*/


/* TypeScript types */


/**
 * @description Map-like object with string or symbol keys.
 *
 * @internal
 * */
type MapLike = { [key: string | symbol]: any };

/**
 * @description string or String object
 *
 * @internal
 * */
type StringLike = string | String;

/**
 * Generic comparable types.
 *
 * @internal
 */
type Comparable = number | bigint | string | boolean;

/**
 * @description Options for AssertionError.
 *
 * @internal
 */
type AssertionErrorOptions = {
  message?: unknown,
  cause?: unknown,
  actual?: unknown;
  expected?: unknown;
  operator?: string,
  stackStartFn?: Function,
  diff?: any
};

/**
 * @description The result of a test operation, indicating success or failure.
 *
 * @internal
 * */
type TestResult<T> = { ok: true; value: T } | { ok: false; error: Error };

/**
 * @description Return the typeof operator result of the given value,
 * except return "null" instead of "object" for null.
 *
 * @internal
 */
type TypeOfTag =
  | "null" | "undefined"
  | "number" | "bigint" | "boolean" | "string" | "symbol"
  | "object" | "function";

/**
 * @description Return a more detailed class name of the given value. Similar to typeof but with better handling of built-ins (Array, Date, Map, etc.) and correct "null" classification.
 *
 * @internal
 */
type ClassOfTag = TypeOfTag | string;

/**
 * The expected type(s) for type checking.
 *
 * @internal
 */
type ExpectedType = string | Function | Array<string | Function>;

/**
 * The expected options object for type includes functions
 *
 * @internal
 */
type IncludesOptions = {keyOrValue: any, value?: any};

/**
 * null or undefined
 *
 * @internal
 */
type Nullish = null | undefined;

/**
 * @description Not null or undefined or object or function.
 *
 * @internal
 */
type NonNullablePrimitive = number | bigint | boolean | string | symbol;

/**
 * @description Not object or function.
 *
 * @internal
 */
type Primitive = NonNullablePrimitive | null | undefined;

/**
 * @description Object or function.
 *
 * @internal
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
 * @description Return the typeof operator result of the given value,except return "null" instead of "object" for null, and provide detailed object class names (Array, Date, etc. and custom classes).
 *
 * @param {unknown} value - The value to check.
 * @returns {ClassOfTag}
 * @internal
 */
// @ts-ignore
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
 * @description Checks if the values are deep equal.
 *
 * @param {unknown} value1 - The value to check.
 * @param {unknown} value2 - The value to check.
 * @returns {boolean} True if the value are deep equal, false otherwise.
 * @internal
 */
function _isDeepStrictEqual (value1: any, value2: any): boolean {
  /* helper functions */
  const _isObject = (value: unknown): boolean => _typeOf(value) === "object";
  const _isSameInstance = (value1: unknown, value2: unknown, Class: Function): boolean =>
    value1 instanceof Class && value2 instanceof Class;
  const _classof = (value: unknown): string =>
    Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
  const _ownKeys = (value: MapLike): unknown[] =>
    [...Object.getOwnPropertyNames(value), ...Object.getOwnPropertySymbols(value)];
  /* strict equality helper function */
  const _isEqual = (value1: unknown, value2: unknown): boolean =>
    Object.is(value1, value2);
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
  //if (_deepType(value1) !== _deepType(value2)) { return false; }
  if (_typeOf(value1) !== _typeOf(value2)) { return false; }
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
    if (_isSameInstance(value1, value2, WeakMap)
      || _isSameInstance(value1, value2, WeakSet)) {
      return _isEqual(value1, value2);
    }
    /* objects / Wrapper objects: Number, Boolean, String, BigInt */
    if (_isSameInstance(value1, value2, Number)
      || _isSameInstance(value1, value2, Boolean)
      || _isSameInstance(value1, value2, String)
      || _isSameInstance(value1, value2, BigInt)) {
      return _isEqual(value1.valueOf(), value2.valueOf());
    }
    /* objects / Array */
    if (Array.isArray(value1) && Array.isArray(value2)) {
      if (value1.length !== value2.length) { return false; }
      if (value1.length === 0) { return true; }
      return value1.every((value: unknown, index: any): boolean =>
        _isDeepStrictEqual(value, value2[index])
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
      || ("Float16Array" in globalThis
          ? _isSameInstance(value1, value2, Float16Array)
          : false
        )
      || _isSameInstance(value1, value2, Float32Array)
      || _isSameInstance(value1, value2, Float64Array)
      || _isSameInstance(value1, value2, BigInt64Array)
      || _isSameInstance(value1, value2, BigUint64Array)) {
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
        Object.getOwnPropertyNames(value1)
          .reduce((acc: any, k: any): MapLike => {
            acc[k] = value1[k]; return acc;
          }, {}),
        Object.getOwnPropertyNames(value2)
          .reduce((acc: any, k: any): MapLike => {
            acc[k] = value2[k]; return acc;
          }, {})
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
 * @throws If Throw is true and type check is failed.
 * @internal
 */
function _isType (
  value: any,
  expectedType?: ExpectedType | undefined,
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
  const vType: string = _typeOf(value);
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
      if (_isString(item)) { return vType === item; }
      if (_isFunction(item)) {
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
      (_isString(item) ? item.toString() : item.name ?? "anonymous")
    ).join(", ");
    throw new TypeError(`[isType] TypeError: ${vName} is not a ${eNames}`);
  }
  return matched;
}


/**
 * @description Checks if the given value is null or undefined.
 *
 * @param {unknown} value - The value to check.
 * @returns {boolean} True if the value is null or undefined, false otherwise.
 * @internal
 */
const _isNullish = (value: unknown): value is Nullish =>
  typeof value === "undefined" || value === null;


/**
 * @description Checks if the given value is null.
 *
 * @param {unknown} value - The value to check.
 * @returns {boolean} True if the value is null, false otherwise.
 * @internal
 */
const _isNull = (value: unknown): value is null => value === null;


/**
 * @description Checks if the given value is undefined.
 *
 * @param {unknown} value - The value to check.
 * @returns {boolean} True if the value is undefined, false otherwise.
 * @internal
 */
const _isUndefined = (value: unknown): value is undefined =>
  typeof value === "undefined";


/**
 * @description Checks if the given value is a string.
 *
 * @param {unknown} value - The value to check.
 * @returns {boolean} True if the value is a string, false otherwise.
 * @internal
 */
const _isString = (value: unknown): value is string =>
  typeof value === "string";


/**
 * @description Checks if the given value is a number.
 *
 * @param {unknown} value - The value to check.
 * @returns {boolean} True if the value is a number, false otherwise.
 * @internal
 */
const _isNumber = (value: unknown): value is number =>
  typeof value === "number";


/**
 * @description Checks if the given value is a bigint.
 *
 * @param {unknown} value - The value to check.
 * @returns {boolean} True if the value is a bigint, false otherwise.
 * @internal
 */
const _isBigInt = (value: unknown): value is bigint =>
  typeof value === "bigint";


/**
 * @description Checks if the given value is a boolean.
 *
 * @param {unknown} value - The value to check.
 * @returns {boolean} True if the value is a boolean, false otherwise.
 * @internal
 */
const _isBoolean = (value: unknown): value is boolean =>
  typeof value === "boolean";


/**
 * @description Checks if the given value is a symbol.
 *
 * @param {unknown} value - The value to check.
 * @returns {boolean} True if the value is a symbol, false otherwise.
 * @internal
 */
const _isSymbol = (value: unknown): value is symbol =>
  typeof value === "symbol";


/**
 * @description Checks if the given value is a function.
 *
 * @param {unknown} value - The value to check.
 * @returns {boolean} True if the value is a function, false otherwise.
 * @internal
 */
const _isFunction = (value: unknown): value is Function =>
  typeof value === "function";


/**
 * @description Checks if the given value is an object.
 *
 * @param {unknown} value - The value to check.
 * @returns {boolean} True if the value is an object, false otherwise.
 * @internal
 */
const _isObject = (value: unknown): value is object =>
  value != null && typeof value === "object";


/**
 * @description Checks if the given value is an error.
 *
 * @param {unknown} value - The value to check.
 * @returns {boolean} True if the value is an error, false otherwise.
 * @internal
 */
const _isError = (value: unknown): value is Error =>
  Error.isError ? Error.isError(value) : value instanceof Error;


/**
 * @description This function is a general purpose, type safe, predictable stringifier. Converts a value into a human-readable string for error messages Handles symbols, functions, nullish, circular references, etc.
 *
 * @param {unknown} value The value to check.
 * @returns {string}
 * @internal
 */
function _toSafeString (value: unknown): string {
  const seen = new WeakSet<object>();
  const replacer = (_key: string, value: unknown): unknown => {
    if (_isFunction(value)) {
      return `[Function: ${value.name || "anonymous"}]`;
    }
    if (_isSymbol(value)) { return value.toString(); }
    if (value instanceof Date) { return `Date(${value.toISOString()})`; }
    if (_isError(value)) {
      return `${value.name}: ${value.message}, ${value.stack ?? ""}`;
    }
    if (value && _isObject(value)) {
      if (seen.has(value)) { return "[Circular]" };
      seen.add(value);
    }
    return value;
  };
  if (["undefined", "null", "string", "number", "boolean", "bigint"]
    .includes(_typeOf(value))) {
    return String(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(v => _toSafeString(v)).join(", ")}]`;
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
 * @description Check value1 is less than value2.
 *
 * @param {Comparable} value1 The value1 to check.
 * @param {Comparable} value2 The value2 to check.
 * @returns {boolean} value1 is less than value2
 * @internal
 */
const _isLessThan = (value1: Comparable, value2: Comparable): boolean =>
  _typeOf(value1) === _typeOf(value2) && value1 < value2;


/**
 * Checks if a key or value exists in a container.
 *
 * @param {any} container The container to check.
 * @param keyOrValue The key or value to look for.
 * @param valueIfKey The value to check if the key exists.
 * @returns True if the key or value exists, false otherwise.
 * @internal
 */
function _includes<T extends object, K extends keyof T>(
  container: T,
  key: K,
  valueIfKey?: T[K]
): boolean;
function _includes<T>(container: T[], value: T): boolean;
function _includes<T extends ArrayBufferView>(container: T, value: number): boolean;
function _includes<K, V>(container: Map<K, V>, key: K, valueIfKey?: V): boolean;
function _includes<K extends object, V>(container: WeakMap<K, V>, key: K): boolean;
function _includes<T>(container: Set<T>, value: T): boolean;
function _includes<T extends object>(container: WeakSet<T>, value: T): boolean;
function _includes<T>(container: Iterable<T>, keyOrValue: T): boolean;
function _includes<T>(container: Iterator<T>, keyOrValue: T): boolean;
function _includes<T>(container: IterableIterator<T>, keyOrValue: T): boolean;
function _includes<T>(container: string, keyOrValue: any): boolean;
function _includes<T>(container: String, keyOrValue: any): boolean;
function _includes(container: any, keyOrValue: any, value?: any): boolean {
  /* String */
  if (typeof container === "string" || container instanceof String) {
    return String(container).includes(keyOrValue);
  }
  /* Check for primitives, null, undefined */
  if (container == null || typeof container !== "object") { return false; }
  /* Map + WeakMap */
  if (container instanceof Map || container instanceof WeakMap) {
    if (!container.has(keyOrValue)) { return false; }
    return value === undefined || Object.is(container.get(keyOrValue), value);
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
  if (Array.isArray(container)
    || ArrayBuffer.isView(container)
    || container instanceof Set
    || typeof (container)[Symbol.iterator] === "function") {
    for (const item of container) {
      if (Object.is(item, keyOrValue)) { return true; }
    }
    return false;
  }
  /* Plain object */
  if (!Object.hasOwn(container, keyOrValue)) { return false; }
  return value === undefined || Object.is(container[keyOrValue], value);
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
 * @internal
 */
function _isEmpty (value: any): boolean {
  /**
   * Checks if a value is a TypedArray (Int8Array, etc.).
   *
   * @param {any} value The value to check.
   * @returns boolean
   */
  function _isTypedArray (value: any): boolean {
    const constructors = [
      Int8Array, Uint8Array, Uint8ClampedArray,
      Int16Array, Uint16Array,
      Int32Array, Uint32Array,
      Float32Array, Float64Array,
      BigInt64Array, BigUint64Array];
    if ("Float16Array" in globalThis) {
      constructors.push((globalThis as any).Float16Array);
    }
    return constructors.some((item): boolean => value instanceof item);
  }
  /* Check undefined, null, NaN */
  if (value == null || Number.isNaN(value)) { return true; }
  /* Check Array, TypedArrays, string, String */
  if (Array.isArray(value)
    || _isTypedArray(value)
    || _isString(value)
    || value instanceof String) {
    return value.length === 0;
  }
  /* Check Map and Set */
  if (value instanceof Map || value instanceof Set) { return value.size === 0; }
  /* Check ArrayBuffer and DataView */
  if (value instanceof ArrayBuffer || value instanceof DataView) {
    return value.byteLength === 0;
  }
  /* Check Iterable objects */
  if (typeof value[Symbol.iterator] === "function") {
    const it = value[Symbol.iterator]();
    return it.next().done; // avoids consuming entire iterator
  }
  /* Check Iterator objects */
  if ("Iterator" in globalThis ? (value instanceof Iterator)
    : (_typeOf(value) === "object" && typeof value.next === "function")) {
    try {
      /* Has at least one element */
      for (const _ of value) { return false; }
      return true;
    } catch { /* Not iterable */ }
  }
  /* Other objects - check own properties (including symbols) */
  if (_isObject(value)) {
    const keys: any[] = [
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
 * @internal
 */
const _isPrimitive = (value: unknown): value is Primitive =>
  _typeOf(value) !== "object" && _typeOf(value) !== "function";


/**
 * @description If value is an error, then it will be thrown.
 *
 * @param {unknown} value - The value to check.
 * @returns void
 * @internal
 */
function _errorCheck (value: unknown): void {
  if (_isError(value)) { throw value; }
}


/* exported functions */


/*
standard unit testing:
https://wiki.commonjs.org/wiki/Unit_Testing/1.0
*/


class AssertionError extends Error {
  actual?: unknown;
  expected?: unknown;
  operator?: string;
  code?: string;
  constructor(message: string, options?: AssertionErrorOptions) {
    super(message);
    this.code = "ERR_ASSERTION";
    this.name = "AssertionError";
    this.message = message ?? undefined;
    this.cause = message ?? undefined;
    if (options != null && typeof options === "object") {
      this.actual = options?.actual;
      this.expected = options?.expected;
      this.operator = options?.operator;
    }
    /* capture stack properly */
    if (typeof (Error as any).captureStackTrace === "function") {
      (Error as any).captureStackTrace(this, AssertionError);
    }
  }
}

/**
 * @description Checks that `condition` is truthy. Throws an `AssertionError` if falsy.
 *
 * @param {unknown} condition The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {asserts condition}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function assert (condition: unknown, message?: unknown): asserts condition {
  if (!condition) {
    _errorCheck(message);
    let errorMessage =
      `[assert] Assertion failed: ${_toSafeString(condition)} should be truly${message ? " - " + _toSafeString(message) : ""}`;
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
 * @param {unknown} condition The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {asserts condition}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function ok (condition: unknown, message?: unknown): asserts condition {
  assert(condition, message);
}


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
  if (actual != expected) {
    _errorCheck(message);
    let errorMessage =
      `[equal] Assertion failed: ${_toSafeString(actual)} and ${_toSafeString(expected)} should be equal${message ? " - " + _toSafeString(message) : ""}`;
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
 * @param {unknown} actual The actual value to check.
 * @param {unknown} expected The expected value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function notEqual (actual: unknown, expected: unknown, message?: unknown): void {
  if (actual == expected) {
    _errorCheck(message);
    let errorMessage =
      `[notEqual] Assertion failed: ${_toSafeString(actual)} and ${_toSafeString(expected)} should be equal${message ? " - " + _toSafeString(message) : ""}`;
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
 * @param {unknown} actual The actual value to check.
 * @param {unknown} expected The expected value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function strictEqual (actual: unknown, expected: unknown, message?: unknown): void {
  if (!Object.is(actual, expected)) {
    _errorCheck(message);
    let errorMessage =
      `[strictEqual] Assertion failed: ${_toSafeString(actual)} and ${_toSafeString(expected)} should be strictly equal${message ? " - " + _toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
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
    _errorCheck(message);
    let errorMessage =
      `[notStrictEqual] Assertion failed: ${_toSafeString(actual)} and ${_toSafeString(expected)} should not be strictly equal${message ? " - " + _toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
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
    _errorCheck(message);
    let errorMessage =
      `[deepEqual] Assertion failed: ${_toSafeString(actual)} and ${_toSafeString(expected)} should be deep equal${message ? " - " + _toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
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
    _errorCheck(message);
    let errorMessage =
      `[notDeepEqual] Assertion failed: ${_toSafeString(actual)} and ${_toSafeString(expected)} should not be deep equal${message ? " - " + _toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
      message: errorMessage,
      cause: errorMessage,
      actual: actual,
      expected: expected,
      operator: "notDeepEqual"
    });
  }
}


/**
 * @description Checks that a function throws.
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
      `[throws] Assertion failed: function did not throw${message ? " - " + _toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
      message: errorMessage,
      cause: errorMessage,
      operator: "throws"
    });
  }
  /* If Error_opt is provided, check the thrown error */
  if (Error_opt) {
    const errorMatches =
      (_isFunction(Error_opt) && thrownError instanceof Error_opt) ||
      (typeof Error_opt === "string" && thrownError?.message?.includes(Error_opt)) ||
      (Error_opt instanceof RegExp && Error_opt.test(thrownError?.message));
    if (!errorMatches) {
      let errorMessage =
        `[throws] Assertion failed: function threw unexpected error: ${_toSafeString(thrownError)}${message ? " - " + _toSafeString(message) : ""}`;
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
 * @param {unknown} [message] - Optional custom message or Error.
 * @returns {Promise<any>} - Resolves with the rejection reason if assertion passes.
 * @throws {assert.AssertionError} If assertion is failed.
 */
async function rejects (block: Function | Promise<any>, Error_opt?: unknown, message?: unknown): Promise<any> {
  let rejectedError; /* don't add type for his variable! */
  try {
    const result = typeof block === "function" ? await block() : await block;
    // If we reach here, it resolved successfully
    let errorMessage =
      `[rejects] Assertion failed: function/promise did not reject${message ? " - " + _toSafeString(message) : ""}`;
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
      (_isFunction(Error_opt) && rejectedError instanceof Error_opt) ||
      (_isString(Error_opt) && _isString((rejectedError as Error)?.message)
      && (rejectedError as Error).message.includes(Error_opt)) ||
        (Error_opt instanceof RegExp && typeof (rejectedError as Error)?.message === "string" && Error_opt.test((rejectedError as Error).message));
    if (!errorMatches) {
      let errorMessage =
        `[rejects] Assertion failed: rejected with unexpected error: ${_toSafeString(rejectedError)}${message ? " - " + _toSafeString(message) : ""}`;
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
 * @param {unknown} [message] - Optional custom message or Error to throw.
 * @returns {Promise<unknown>} - Resolves with the resolved value if assertion passes.
 * @throws {assert.AssertionError} If the function or promise rejects.
 */
async function doesNotReject (block: Function, Error_opt?: unknown, message?: unknown): Promise<any> {
  try {
    /* Execute async function or promise */
    const result = _isFunction(block) ? await block() : await block;
    return result;
  } catch (catchedError) {
    /* Check if a specific unexpected error type or message was provided */
    if (Error_opt) {
      const errorMatches =
        (_isFunction(Error_opt) && catchedError instanceof Error_opt) ||
        (_isString(Error_opt) && (catchedError as Error).message?.includes(Error_opt)) ||
        (Error_opt instanceof RegExp && Error_opt.test((catchedError as Error).message));

      if (errorMatches) {
        if (_isError(message)) throw message;
        let errorMessage =
          `[doesNotReject] Assertion failed: function/promise rejected with disallowed error: ${_toSafeString(catchedError)}${message ? " - " + _toSafeString(message) : ""}`;
        throw new assert.AssertionError(errorMessage, {
          message: errorMessage,
          cause: catchedError,
          actual: catchedError,
          expected: undefined,
          operator: "doesNotReject"
        });
      }
    }
    _errorCheck(message);
    let errorMessage =
      `[doesNotReject] Assertion failed: function/promise rejected unexpectedly${message ? " - " + _toSafeString(message) : ""}`;
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
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function fail (message?: unknown): void {
  _errorCheck(message);
  let errorMessage =
    `[fail] Assertion failed${message ? ": " + _toSafeString(message) : ""}`;
  throw new assert.AssertionError(errorMessage, {message: errorMessage, cause: errorMessage});
}


/**
 * @description Ensures a value is falsy.
 *
 * @param {unknown} condition The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function notOk (condition: unknown, message?: unknown): void {
  if (condition) {
    _errorCheck(message);
    let errorMessage =
      `[notOk] Assertion failed: ${_toSafeString(condition)} should be falsy${message ? " - " + _toSafeString(message) : ""}`;
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
 * @param {unknown} condition The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function isTrue (condition: unknown, message?: unknown): asserts condition is true {
  if (condition !== true) {
    _errorCheck(message);
    let errorMessage =
      `[isTrue] Assertion failed: ${_toSafeString(condition)} should be true${message ? " - " + _toSafeString(message) : ""}`;
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
 * @param {unknown} condition The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function isFalse (condition: unknown, message?: unknown): asserts condition is false {
  if (condition !== false) {
    _errorCheck(message);
    let errorMessage =
      `[isFalse] Assertion failed: ${_toSafeString(condition)} should be false${message ? " - " + _toSafeString(message) : ""}`;
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
 * @param {unknown} value The value to check.
 * @param {string | Function | Array<string | Function>} expectedType
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function is (value: unknown, expectedType: ExpectedType, message?: unknown): void {
  if (!_isType(value, expectedType, false)) {
    _errorCheck(message);
    let errorMessage =
      `[is] Assertion failed: ${_toSafeString(value)} should be an expected type${message ? " - " + _toSafeString(message) : ""}`;
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
 * @param {unknown} value The value to check.
 * @param {string | Function | Array<string | Function>} expectedType
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function isNot (value: unknown, expectedType: ExpectedType, message?: unknown): void {
  if (_isType(value, expectedType, false)) {
    _errorCheck(message);
    let errorMessage =
      `[isNot] Assertion failed: ${_toSafeString(value)} should not be an expected type${message ? " - " + _toSafeString(message) : ""}`;
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
 * @param {unknown} value The value to check.
* @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function isNullish (value: unknown, message?: unknown): asserts value is Nullish {
  if (!_isNullish(value)) {
    _errorCheck(message);
    let errorMessage =
      `[isNullish] Assertion failed: ${_toSafeString(value)} should be null or undefined${message ? " - " + _toSafeString(message) : ""}`;
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
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function isNotNullish (value: unknown, message?: unknown): asserts value is NonNullable<unknown> {
  if (_isNullish(value)) {
    _errorCheck(message);
    let errorMessage =
      `[isNotNullish] Assertion failed: ${_toSafeString(value)} should be not null or undefined${message ? " - " + _toSafeString(message) : ""}`;
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
 * @description Ensures value is `null`.
 *
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function isNull (value: unknown, message?: unknown): asserts value is null {
  if (!_isNull(value)) {
    _errorCheck(message);
    let errorMessage =
      `[isNull] Assertion failed: ${_toSafeString(value)} should be null ${message ? " - " + _toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
      message: errorMessage,
      cause: errorMessage,
      actual: value,
      expected: null,
      operator: "!=="
    });
  }
}


/**
 * @description Ensures value is not `null`.
 *
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function isNotNull (value: unknown, message?: unknown): asserts value is NonNullable<unknown> {
  if (_isNull(value)) {
    _errorCheck(message);
    let errorMessage =
      `[isNotNull] Assertion failed: ${_toSafeString(value)} should be not null ${message ? " - " + _toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
      message: errorMessage,
      cause: errorMessage,
      actual: value,
      expected: null,
      operator: "==="
    });
  }
}


/**
 * @description Ensures value is `undefined`.
 *
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function isUndefined (value: unknown, message?: unknown): asserts value is undefined {
  if (!_isUndefined(value)) {
    _errorCheck(message);
    let errorMessage =
      `[isUndefined] Assertion failed: ${_toSafeString(value)} should be undefined${message ? " - " + _toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
      message: errorMessage,
      cause: errorMessage,
      actual: value,
      expected: undefined,
      operator: "!=="
    });
  }
}


/**
 * @description Ensures value is not `undefined`.
 *
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function isNotUndefined (value: unknown, message?: unknown): void {
  if (_isUndefined(value)) {
    _errorCheck(message);
    let errorMessage =
      `[isNotUndefined] Assertion failed: ${_toSafeString(value)} should be not undefined${message ? " - " + _toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
      message: errorMessage,
      cause: errorMessage,
      actual: value,
      expected: undefined,
      operator: "==="
    });
  }
}

/**
 * @description Ensures value is `string`.
 *
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function isString (value: unknown, message?: unknown): asserts value is string {
  if (!_isString(value)) {
    _errorCheck(message);
    let errorMessage =
      `[isString] Assertion failed: ${_toSafeString(value)} should be string${message ? " - " + _toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
      message: errorMessage,
      cause: errorMessage,
      actual: value,
      expected: "string",
      operator: "typeof !=="
    });
  }
}


/**
 * @description Ensures value is not `string`.
 *
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function isNotString (value: unknown, message?: unknown): void {
  if (_isString(value)) {
    _errorCheck(message);
    let errorMessage =
      `[isNotString] Assertion failed: ${_toSafeString(value)} should be not string${message ? " - " + _toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
      message: errorMessage,
      cause: errorMessage,
      actual: value,
      expected: "string",
      operator: "typeof ==="
    });
  }
}


/**
 * @description Ensures value is `number`.
 *
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function isNumber (value: unknown, message?: unknown): asserts value is number {
  if (!_isNumber(value)) {
    _errorCheck(message);
    let errorMessage =
      `[isNumber] Assertion failed: ${_toSafeString(value)} should be number${message ? " - " + _toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
      message: errorMessage,
      cause: errorMessage,
      actual: value,
      expected: "number",
      operator: "typeof !=="
    });
  }
}


/**
 * @description Ensures value is not `number`.
 *
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function isNotNumber (value: unknown, message?: unknown): void {
  if (_isNumber(value)) {
    _errorCheck(message);
    let errorMessage =
      `[isNotNumber] Assertion failed: ${_toSafeString(value)} should be not number${message ? " - " + _toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
      message: errorMessage,
      cause: errorMessage,
      actual: value,
      expected: "number",
      operator: "typeof ==="
    });
  }
}


/**
 * @description Ensures value is `bigint`.
 *
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function isBigInt (value: unknown, message?: unknown): asserts value is bigint {
  if (!_isBigInt(value)) {
    _errorCheck(message);
    let errorMessage =
      `[isBigInt] Assertion failed: ${_toSafeString(value)} should be bigint${message ? " - " + _toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
      message: errorMessage,
      cause: errorMessage,
      actual: value,
      expected: "bigint",
      operator: "typeof !=="
    });
  }
}


/**
 * @description Ensures value is not `bigint`.
 *
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function isNotBigInt (value: unknown, message?: unknown): void {
  if (_isBigInt(value)) {
    _errorCheck(message);
    let errorMessage =
      `[isNotBigInt] Assertion failed: ${_toSafeString(value)} should be not bigint${message ? " - " + _toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
      message: errorMessage,
      cause: errorMessage,
      actual: value,
      expected: "bigint",
      operator: "typeof ==="
    });
  }
}


/**
 * @description Ensures value is `boolean`.
 *
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function isBoolean (value: unknown, message?: unknown): asserts value is boolean {
  if (!_isBoolean(value)) {
    _errorCheck(message);
    let errorMessage =
      `[isBoolean] Assertion failed: ${_toSafeString(value)} should be boolean${message ? " - " + _toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
      message: errorMessage,
      cause: errorMessage,
      actual: value,
      expected: "boolean",
      operator: "typeof !=="
    });
  }
}


/**
 * @description Ensures value is not `boolean`.
 *
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function isNotBoolean (value: unknown, message?: unknown): void {
  if (_isBoolean(value)) {
    _errorCheck(message);
    let errorMessage =
      `[isNotBoolean] Assertion failed: ${_toSafeString(value)} should be not boolean${message ? " - " + _toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
      message: errorMessage,
      cause: errorMessage,
      actual: value,
      expected: "boolean",
      operator: "typeof ==="
    });
  }
}


/**
 * @description Ensures value is `symbol`.
 *
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function isSymbol (value: unknown, message?: unknown): asserts value is symbol {
  if (!_isSymbol(value)) {
    _errorCheck(message);
    let errorMessage =
      `[isSymbol] Assertion failed: ${_toSafeString(value)} should be symbol${message ? " - " + _toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
      message: errorMessage,
      cause: errorMessage,
      actual: value,
      expected: "symbol",
      operator: "typeof !=="
    });
  }
}


/**
 * @description Ensures value is not `symbol`.
 *
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function isNotSymbol (value: unknown, message?: unknown): void {
  if (_isSymbol(value)) {
    _errorCheck(message);
    let errorMessage =
      `[isNotSymbol] Assertion failed: ${_toSafeString(value)} should be not symbol${message ? " - " + _toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
      message: errorMessage,
      cause: errorMessage,
      actual: value,
      expected: "symbol",
      operator: "typeof ==="
    });
  }
}


/**
 * @description Ensures value is `function`.
 *
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function isFunction (value: unknown, message?: unknown): asserts value is Function {
  if (!_isFunction(value)) {
    _errorCheck(message);
    let errorMessage =
      `[isFunction] Assertion failed: ${_toSafeString(value)} should be function${message ? " - " + _toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
      message: errorMessage,
      cause: errorMessage,
      actual: value,
      expected: "function",
      operator: "typeof !=="
    });
  }
}


/**
 * @description Ensures value is not `function`.
 *
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function isNotFunction (value: unknown, message?: unknown): void {
  if (_isFunction(value)) {
    _errorCheck(message);
    let errorMessage =
      `[isNotFunction] Assertion failed: ${_toSafeString(value)} should be not function${message ? " - " + _toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
      message: errorMessage,
      cause: errorMessage,
      actual: value,
      expected: "function",
      operator: "typeof ==="
    });
  }
}


/**
 * @description Ensures value is `object`.
 *
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function isObject (value: unknown, message?: unknown): asserts value is object {
  if (!_isObject(value)) {
    _errorCheck(message);
    let errorMessage =
      `[isObject] Assertion failed: ${_toSafeString(value)} should be object${message ? " - " + _toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
      message: errorMessage,
      cause: errorMessage,
      actual: value,
      expected: "object",
      operator: "typeof !=="
    });
  }
}


/**
 * @description Ensures value is not `object`.
 *
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function isNotObject (value: unknown, message?: unknown): void {
  if (_isObject(value)) {
    _errorCheck(message);
    let errorMessage =
      `[isNotObject] Assertion failed: ${_toSafeString(value)} should be not object${message ? " - " + _toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
      message: errorMessage,
      cause: errorMessage,
      actual: value,
      expected: "object",
      operator: "typeof ==="
    });
  }
}


/**
 * @description Ensures value is not `object` or `function`.
 *
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function isPrimitive (value: unknown, message?: unknown): asserts value is Primitive {
  if (!_isPrimitive(value)) {
    _errorCheck(message);
    let errorMessage =
      `[isPrimitive] Assertion failed: ${_toSafeString(value)} should be not object or function${message ? " - " + _toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
      message: errorMessage,
      cause: errorMessage,
      actual: value,
      expected: "",
      operator: "isPrimitive"
    });
  }
}


/**
 * @description Ensures value is `object` or `function`.
 *
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function isNotPrimitive (value: unknown, message?: unknown): asserts value is NonPrimitive {
  if (_isPrimitive(value)) {
    _errorCheck(message);
    let errorMessage =
      `[isNotPrimitive] Assertion failed: ${_toSafeString(value)} should be object or function${message ? " - " + _toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
      message: errorMessage,
      cause: errorMessage,
      actual: value,
      expected: "",
      operator: "isNotPrimitive"
    });
  }
}


/**
 * @description Ensures value is a number and NaN.
 *
 * @param {unknown} value The value to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function isNaN (value: unknown, message?: unknown): void {
  if (typeof value !== "number" || !Number.isNaN(value)) {
    _errorCheck(message);
    let errorMessage =
      `[isNaN] Assertion failed: ${_toSafeString(value)} should be NaN${message ? " - " + _toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
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
  if (typeof value === "number" && Number.isNaN(value)) {
    _errorCheck(message);
    let errorMessage =
      `[isNotNaN] Assertion failed: ${_toSafeString(value)} should be NaN${message ? " - " + _toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
      message: errorMessage,
      cause: errorMessage,
      actual: value,
      expected: "",
      operator: "isNaN"
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
    _errorCheck(message);
    let errorMessage =
      `[isEmpty] Assertion failed: ${_toSafeString(value)} should be empty${message ? " - " + _toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
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
    _errorCheck(message);
    let errorMessage =
      `[isNotEmpty] Assertion failed: ${_toSafeString(value)} should be not empty${message ? " - " + _toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
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
  if (typeof string !== "string") {
    _errorCheck(message);
    throw new TypeError(
      "[match] TypeError: " + string + " is not a string"
        + (message ? " - " + _toSafeString(message) : "")
    );
  }
  if (!(regexp instanceof RegExp)) {
    _errorCheck(message);
    throw new TypeError(
      "[match] TypeError: " + regexp + " is not a RegExp"
        + (message ? " - " + _toSafeString(message) : "")
    );
  }
  if (!(regexp.test(String(string)))) {
    _errorCheck(message);
    let errorMessage =
      `[match] Assertion failed: ${_toSafeString(string)} is not matched with ${_toSafeString(regexp)}${message ? " - " + _toSafeString(message) : ""}`;
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
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {TypeError} If parameter types are not matched.
 * @throws {assert.AssertionError} If assertion is failed.
 */
function doesNotMatch (string: StringLike, regexp: RegExp, message?: unknown): void {
  if (typeof string !== "string") {
    _errorCheck(message);
    throw new TypeError(
      "[doesNotMatch] TypeError: " + string + " is not a string"
        + (message ? " - " + _toSafeString(message) : "")
    );
  }
  if (!(regexp instanceof RegExp)) {
    _errorCheck(message);
    throw new TypeError(
      "[doesNotMatch] TypeError: " + regexp + " is not a RegExp"
        + (message ? " - " + _toSafeString(message) : "")
    );
  }
  if (regexp.test(String(string))) {
    _errorCheck(message);
    let errorMessage =
      `[doesNotMatch] Assertion failed: ${_toSafeString(string)} is matched with ${_toSafeString(regexp)}${message ? " - " + _toSafeString(message) : ""}`;
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
 * @param {any} value1 The value1 to check.
 * @param {any} value2 The value2 to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function lt (value1: any, value2: any, message?: unknown): void {
  if (!_isLessThan(value1, value2)) {
    _errorCheck(message);
    let errorMessage =
      `[lt] Assertion failed: ${_toSafeString(value1)} should be less than ${_toSafeString(value2)}${message ? " - " + _toSafeString(message) : ""}`;
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
 * @param {any} value1 The value1 to check.
 * @param {any} value2 The value2 to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function lte (value1: any, value2: any, message?: any): void {
  if (!_isLessThan(value1, value2) && !Object.is(value1, value2)) {
    _errorCheck(message);
    let errorMessage =
      `[lte] Assertion failed: ${_toSafeString(value1)} should be less than or equal ${_toSafeString(value2)}${message ? " - " + _toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
      message: errorMessage,
      cause: errorMessage,
      actual: value1,
      expected: value2,
      operator: "< || Object.is();"
    });
  }
}


/**
 * @description Checks `a > b`, but the value types have to be same type.
 *
 * @param {any} value1 The value1 to check.
 * @param {any} value2 The value2 to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function gt (value1: any, value2: any, message?: any): void {
  if (!_isLessThan(value2, value1)) {
    _errorCheck(message);
    let errorMessage =
      `[gt] Assertion failed: ${_toSafeString(value1)} should be greater than ${_toSafeString(value2)}${message ? " - " + _toSafeString(message) : ""}`;
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
 * @param {any} value1 The value1 to check.
 * @param {any} value2 The value2 to check.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @returns {void}
 * @throws {assert.AssertionError} If assertion is failed.
 */
function gte (value1: any, value2: any, message?: unknown): void {
  if (!_isLessThan(value2, value1) && !Object.is(value1, value2)) {
    _errorCheck(message);
    let errorMessage =
      `[gte] Assertion failed: ${_toSafeString(value1)} should be greater than or equal ${value2}${message ? " - " + _toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
      message: errorMessage,
      cause: errorMessage,
      actual: value1,
      expected: value2,
      operator: "> || Object.is();"
    });
  }
}


/**
 * @description Asserts that `actual` (a string) contains the specified `substring`.
 *
 * @param {string} actual - The string to check.
 * @param {string} substring - The substring expected to appear within `actual`.
 * @param {unknown} [message] - Optional message or Error to throw.
 * @throws {assert.AssertionError} If `actual` does not contain `substring`.
 */
function stringContains(actual: StringLike, substring: StringLike, message?: unknown): void {
  /* Type validation */
  if (typeof actual !== "string") {
    _errorCheck(message);
    throw new TypeError(
      `[stringContains] TypeError: ${_toSafeString(actual)} is not a string${message ? " - " + _toSafeString(message) : ""}`
    );
  }
  if (typeof substring !== "string") {
    _errorCheck(message);
    throw new TypeError(
      `[stringContains] TypeError: ${_toSafeString(substring)} is not a string${message ? " - " + _toSafeString(message) : ""}`
    );
  }
  /* Assertion */
  if (!actual.includes(String(substring))) {
    _errorCheck(message);
    let errorMessage =
      `[stringContains] Assertion failed: ${_toSafeString(actual)} does not contain substring ${_toSafeString(substring)}${message ? " - " + _toSafeString(message) : ""}`;
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
 * @param {unknown} [message] - Optional message or Error to throw.
 * @throws {assert.AssertionError} If `actual` contains `substring`.
 */
function stringNotContains(actual: StringLike, substring: StringLike, message?: unknown): void {
  /* Type validation */
  if (typeof actual !== "string") {
    _errorCheck(message);
    throw new TypeError(
      `[stringNotContains] TypeError: ${_toSafeString(actual)} is not a string${message ? " - " + _toSafeString(message) : ""}`
    );
  }
  if (typeof substring !== "string") {
    _errorCheck(message);
    throw new TypeError(
      `[stringNotContains] TypeError: ${_toSafeString(substring)} is not a string${message ? " - " + _toSafeString(message) : ""}`
    );
  }
  /* Assertion */
  if (actual.includes(String(substring))) {
    _errorCheck(message);
    let errorMessage =
      `[stringNotContains] Assertion failed: ${_toSafeString(actual)} should not contain substring ${_toSafeString(substring)}${message ? " - " + _toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
      message: errorMessage,
      cause: errorMessage,
      actual,
      expected: substring,
      operator: "stringNotContains"
    });
  }
}


/* objects */


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
  if (typeof options !== "object") {
    _errorCheck(message);
    throw new TypeError(
      "[includes] TypeError: " + _toSafeString(options) + " is not an object"
        + (message ? " - " + _toSafeString(message) : "")
    );
  }
  if (!_includes(container, options.keyOrValue, options?.value ?? undefined)) {
    _errorCheck(message);
    let errorMessage =
      `[includes] Assertion failed: ${_toSafeString(container)} does not include ${_toSafeString(options)}${message ? " - " + _toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
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
  if (typeof options !== "object") {
    _errorCheck(message);
    throw new TypeError(
      "[doesNotInclude] TypeError: " + _toSafeString(options) + " is not an object"
        + (message ? " - " + _toSafeString(message) : "")
    );
  }
  if (_includes(container, options.keyOrValue, options?.value ?? undefined)) {
    _errorCheck(message);
    let errorMessage =
      `[doesNotInclude] Assertion failed: ${_toSafeString(container)} does not include ${_toSafeString(options)}${message ? " - " + _toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, {
      message: errorMessage,
      cause: errorMessage,
      actual: container,
      expected: options,
      operator: "doesNotInclude"
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
      error: _isError(error) ? error : new Error(String(error)),
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
      error: _isError(error) ? error : new Error(String(error)),
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


assert["VERSION"] = VERSION;
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
assert["isNull"] = isNull;
assert["isNotNull"] = isNotNull;
assert["isUndefined"] = isUndefined;
assert["isNotUndefined"] = isNotUndefined;
assert["isString"] = isString;
assert["isNotString"] = isNotString;
assert["isNumber"] = isNumber;
assert["isNotNumber"] = isNotNumber;
assert["isBigInt"] = isBigInt;
assert["isNotBigInt"] = isNotBigInt;
assert["isBoolean"] = isBoolean;
assert["isNotBoolean"] = isNotBoolean;
assert["isSymbol"] = isSymbol;
assert["isNotSymbol"] = isNotSymbol;
assert["isFunction"] = isFunction;
assert["isNotFunction"] = isNotFunction;
assert["isObject"] = isObject;
assert["isNotObject"] = isNotObject;
assert["isPrimitive"] = isPrimitive;
assert["isNotPrimitive"] = isNotPrimitive;
assert["isNaN"] = isNaN;
assert["isNotNaN"] = isNotNaN;
assert["isEmpty"] = isEmpty;
assert["isNotEmpty"] = isNotEmpty;
assert["match"] = match;
assert["doesNotMatch"] = doesNotMatch;
assert["lt"] = lt;
assert["lte"] = lte;
assert["gt"] = gt;
assert["gte"] = gte;
assert["stringContains"] = stringContains;
assert["stringNotContains"] = stringNotContains;
assert["includes"] = includes;
assert["doesNotInclude"] = doesNotInclude;
/* test functions */
assert["testSync"] = testSync;
assert["testAsync"] = testAsync;
assert["testCheck"] = testCheck;

export {assert};
export default assert;
