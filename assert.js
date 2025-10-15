"use strict";
(function (global) {
    if (!global.globalThis) {
        if (Object.defineProperty) {
            Object.defineProperty(global, "globalThis", {
                configurable: true, enumerable: false, value: global, writable: true
            });
        }
        else {
            global.globalThis = global;
        }
    }
})(typeof this === "object" ? this : Function("return this")());
if (!("isError" in Error)) {
    Error.isError = function isError(value) {
        let className = Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
        return (className === "error" || className === "domexception");
    };
}
const typeOf = (value) => value === null ? "null" : typeof value;
function isDeepStrictEqual(value1, value2) {
    const _deepType = (value) => (value === null) ? "null" : (value !== value) ? "NaN" : (typeof value);
    const _isPrimitive = (value) => value == null
        || (typeof value !== "object" && typeof value !== "function");
    const _isObject = (value) => value != null && typeof value === "object";
    const _isSameInstance = (value1, value2, Class) => value1 instanceof Class && value2 instanceof Class;
    const _classof = (value) => Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
    const _ownKeys = (value) => Object.getOwnPropertyNames(value)
        .concat(Object.getOwnPropertySymbols(value));
    const _isEqual = (value1, value2) => Object.is(value1, value2);
    if (_isEqual(value1, value2)) {
        return true;
    }
    if (_isObject(value1) && _isPrimitive(value2) && _classof(value1) === typeof value2) {
        return _isEqual(value1.valueOf(), value2);
    }
    if (_isPrimitive(value1) && _isObject(value2) && typeof value1 === _classof(value2)) {
        return _isEqual(value1, value2.valueOf());
    }
    if (_deepType(value1) !== _deepType(value2)) {
        return false;
    }
    if (_isObject(value1) && _isObject(value2)) {
        if (_isEqual(value1, value2)) {
            return true;
        }
        if (Object.getPrototypeOf(value1).constructor !==
            Object.getPrototypeOf(value2).constructor) {
            return false;
        }
        if (_isSameInstance(value1, value2, WeakMap) || _isSameInstance(value1, value2, WeakSet)) {
            return _isEqual(value1, value2);
        }
        if (_isSameInstance(value1, value2, Number)
            || _isSameInstance(value1, value2, Boolean)
            || _isSameInstance(value1, value2, String)
            || _isSameInstance(value1, value2, BigInt)) {
            return _isEqual(value1.valueOf(), value2.valueOf());
        }
        if (Array.isArray(value1) && Array.isArray(value2)) {
            if (value1.length !== value2.length) {
                return false;
            }
            if (value1.length === 0) {
                return true;
            }
            return value1.every((value, index) => isDeepStrictEqual(value, value2[index]));
        }
        if (_isSameInstance(value1, value2, Int8Array)
            || _isSameInstance(value1, value2, Uint8Array)
            || _isSameInstance(value1, value2, Uint8ClampedArray)
            || _isSameInstance(value1, value2, Int16Array)
            || _isSameInstance(value1, value2, Uint16Array)
            || _isSameInstance(value1, value2, Int32Array)
            || _isSameInstance(value1, value2, Uint32Array)
            || ("Float16Array" in globalThis ?
                _isSameInstance(value1, value2, Float16Array) : false)
            || _isSameInstance(value1, value2, Float32Array)
            || _isSameInstance(value1, value2, Float64Array)
            || _isSameInstance(value1, value2, BigInt64Array)
            || _isSameInstance(value1, value2, BigUint64Array)) {
            if (value1.length !== value2.length) {
                return false;
            }
            if (value1.length === 0) {
                return true;
            }
            return value1.every((value, index) => _isEqual(value, value2[index]));
        }
        if (_isSameInstance(value1, value2, ArrayBuffer)) {
            if (value1.byteLength !== value2.byteLength) {
                return false;
            }
            if (value1.byteLength === 0) {
                return true;
            }
            let xTA = new Int8Array(value1), yTA = new Int8Array(value2);
            return xTA.every((value, index) => _isEqual(value, yTA[index]));
        }
        if (_isSameInstance(value1, value2, DataView)) {
            if (value1.byteLength !== value2.byteLength) {
                return false;
            }
            if (value1.byteLength === 0) {
                return true;
            }
            for (let index = 0; index < value1.byteLength; index++) {
                if (!_isEqual(value1.getUint8(index), value2.getUint8(index))) {
                    return false;
                }
            }
            return true;
        }
        if (_isSameInstance(value1, value2, Map)) {
            if (value1.size !== value2.size) {
                return false;
            }
            if (value1.size === 0) {
                return true;
            }
            return [...value1.keys()].every((value) => isDeepStrictEqual(value1.get(value), value2.get(value)));
        }
        if (_isSameInstance(value1, value2, Set)) {
            if (value1.size !== value2.size) {
                return false;
            }
            if (value1.size === 0) {
                return true;
            }
            return [...value1.keys()].every((value) => value2.has(value));
        }
        if (_isSameInstance(value1, value2, RegExp)) {
            return _isEqual(value1.lastIndex, value2.lastIndex)
                && _isEqual(value1.flags, value2.flags)
                && _isEqual(value1.source, value2.source);
        }
        if (_isSameInstance(value1, value2, Error)) {
            return isDeepStrictEqual(Object.getOwnPropertyNames(value1)
                .reduce((acc, k) => { acc[k] = value1[k]; return acc; }, {}), Object.getOwnPropertyNames(value2)
                .reduce((acc, k) => { acc[k] = value2[k]; return acc; }, {}));
        }
        if (_isSameInstance(value1, value2, Date)) {
            return _isEqual(+value1, +value2);
        }
        let value1Keys = _ownKeys(value1);
        let value2Keys = _ownKeys(value2);
        if (value1Keys.length !== value2Keys.length) {
            return false;
        }
        if (value1Keys.length === 0) {
            return true;
        }
        return value1Keys.every((key) => isDeepStrictEqual(value1[key], value2[key]));
    }
    return false;
}
function isType(value, expectedType, Throw = false) {
    if (!(["string", "function", "undefined"].includes(typeof expectedType))
        && !Array.isArray(expectedType)) {
        throw new TypeError(`[isType] TypeError: expectedType must be string, function, array or undefined. Got ${typeof expectedType}`);
    }
    if (typeof Throw !== "boolean") {
        throw new TypeError(`[isType] TypeError: Throw has to be a boolean. Got ${typeof Throw}`);
    }
    const vType = (value === null ? "null" : typeof value);
    if (expectedType == null) {
        return vType === "object"
            ? Object.getPrototypeOf(value)?.constructor ?? "object"
            : vType;
    }
    let expectedArray = Array.isArray(expectedType) ? expectedType : [expectedType];
    let matched = expectedArray.some(function (item) {
        if (typeof item === "string") {
            return vType === item;
        }
        if (typeof item === "function") {
            return value != null && value instanceof item;
        }
        throw new TypeError(`[isType] TypeError: expectedType array elements have to be a string or function. Got ${typeof item}`);
    });
    if (Throw && !matched) {
        let vName = value.toString ? value.toString() : Object.prototype.toString.call(value);
        let eNames = expectedArray.map((item) => (typeof item === "string" ? item.toString() : item.name ?? "anonymous")).join(", ");
        throw new TypeError(`[isType] TypeError: ${vName} is not a ${eNames}`);
    }
    return matched;
}
function toSafeString(value) {
    const seen = new WeakSet();
    const replacer = (_key, value) => {
        if (typeof value === "function") {
            return `[Function: ${value.name || "anonymous"}]`;
        }
        if (typeof value === "symbol") {
            return value.toString();
        }
        if (value instanceof Date) {
            return `Date(${value.toISOString()})`;
        }
        if (value instanceof Error) {
            return `${value.name}: ${value.message}, ${value.stack ?? ""}`;
        }
        if (value && typeof value === "object") {
            if (seen.has(value)) {
                return "[Circular]";
            }
            ;
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
        return `Map(${value.size}){${Array.from(value.entries()).map(([k, v]) => `${toSafeString(k)} => ${toSafeString(v)}`).join(", ")}}`;
    }
    if (value instanceof Set) {
        return `Set(${value.size}){${Array.from(value.values()).map(v => toSafeString(v)).join(", ")}}`;
    }
    try {
        return JSON.stringify(value, replacer) ?? String(value);
    }
    catch (_e) {
        return String(value);
    }
}
const isLessThan = (value1, value2) => typeOf(value1) === typeOf(value2) && value1 < value2;
class AssertionError extends Error {
    expected;
    actual;
    operator;
    code;
    constructor(message, options) {
        super(message, options);
        this.code = "ERR_ASSERTION";
        if (options != null) {
            this.message = message ?? undefined;
            this.actual = options?.actual ?? undefined;
            this.expected = options?.expected ?? undefined;
            this.operator = options?.operator ?? undefined;
        }
    }
}
function assert(condition, message) {
    if (!condition) {
        if (message instanceof Error) {
            throw message;
        }
        let errorMessage = `[assert] Assertion failed: ${toSafeString(condition)} should be truly${message ? " - " + toSafeString(message) : ""}`;
        throw new assert.AssertionError(errorMessage, {
            message: errorMessage,
            cause: errorMessage,
            actual: condition,
            expected: true,
            operator: "=="
        });
    }
}
function ok(condition, message) {
    assert(condition, message);
}
function equal(actual, expected, message) {
    if (actual != expected) {
        if (message instanceof Error) {
            throw message;
        }
        let errorMessage = `[equal] Assertion failed: ${toSafeString(actual)} and ${toSafeString(expected)} should be equal${message ? " - " + toSafeString(message) : ""}`;
        throw new assert.AssertionError(errorMessage, {
            message: errorMessage,
            cause: errorMessage,
            actual: actual,
            expected: expected,
            operator: "!="
        });
    }
}
function notEqual(actual, expected, message) {
    if (actual == expected) {
        if (message instanceof Error) {
            throw message;
        }
        let errorMessage = `[notEqual] Assertion failed: ${toSafeString(actual)} and ${toSafeString(expected)} should be equal${message ? " - " + toSafeString(message) : ""}`;
        throw new assert.AssertionError(errorMessage, {
            message: errorMessage,
            cause: errorMessage,
            actual: actual,
            expected: expected,
            operator: "=="
        });
    }
}
function strictEqual(actual, expected, message) {
    if (!Object.is(actual, expected)) {
        if (message instanceof Error) {
            throw message;
        }
        let errorMessage = `[strictEqual] Assertion failed: ${toSafeString(actual)} and ${toSafeString(expected)} should be strictly equal${message ? " - " + toSafeString(message) : ""}`;
        throw new assert.AssertionError(errorMessage, {
            message: errorMessage,
            cause: errorMessage,
            actual: actual,
            expected: expected,
            operator: "!Object.is(actual, expected);"
        });
    }
}
function notStrictEqual(actual, expected, message) {
    if (Object.is(actual, expected)) {
        if (message instanceof Error) {
            throw message;
        }
        let errorMessage = `[notStrictEqual] Assertion failed: ${toSafeString(actual)} and ${toSafeString(expected)} should not be strictly equal${message ? " - " + toSafeString(message) : ""}`;
        throw new assert.AssertionError(errorMessage, {
            message: errorMessage,
            cause: errorMessage,
            actual: actual,
            expected: expected,
            operator: "Object.is(actual, expected);"
        });
    }
}
function deepEqual(actual, expected, message) {
    if (!isDeepStrictEqual(actual, expected)) {
        if (message instanceof Error) {
            throw message;
        }
        let errorMessage = `[deepEqual] Assertion failed: ${toSafeString(actual)} and ${toSafeString(expected)} should be deep equal${message ? " - " + toSafeString(message) : ""}`;
        throw new assert.AssertionError(errorMessage, {
            message: errorMessage,
            cause: errorMessage,
            actual: actual,
            expected: expected,
            operator: "isDeepStrictEqual(actual, expected)"
        });
    }
}
function notDeepEqual(actual, expected, message) {
    if (isDeepStrictEqual(actual, expected)) {
        if (message instanceof Error) {
            throw message;
        }
        let errorMessage = `[notDeepEqual] Assertion failed: ${toSafeString(actual)} and ${toSafeString(expected)} should not be deep equal${message ? " - " + toSafeString(message) : ""}`;
        throw new assert.AssertionError(errorMessage, {
            message: errorMessage,
            cause: errorMessage,
            actual: actual,
            expected: expected,
            operator: "!(isDeepStrictEqual(actual, expected))"
        });
    }
}
function throws(block, Error_opt, message) {
    let thrownError;
    try {
        block();
    }
    catch (catchedError) {
        thrownError = catchedError;
    }
    if (!thrownError) {
        let errorMessage = `[throws] Assertion failed: function did not throw${message ? " - " + toSafeString(message) : ""}`;
        throw new assert.AssertionError(errorMessage, {
            message: errorMessage,
            cause: errorMessage,
            operator: "throws"
        });
    }
    if (Error_opt) {
        const errorMatches = (typeof Error_opt === "function" && thrownError instanceof Error_opt) ||
            (typeof Error_opt === "string" && thrownError?.message?.includes(Error_opt)) ||
            (Error_opt instanceof RegExp && Error_opt.test(thrownError?.message));
        if (!errorMatches) {
            let errorMessage = `[throws] Assertion failed: function threw unexpected error: ${toSafeString(thrownError)}${message ? " - " + toSafeString(message) : ""}`;
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
async function rejects(block, Error_opt, message) {
    let rejectedError;
    try {
        const result = typeof block === "function" ? await block() : await block;
        let errorMessage = `[rejects] Assertion failed: function/promise did not reject${message ? " - " + toSafeString(message) : ""}`;
        throw new assert.AssertionError(errorMessage, {
            message: errorMessage,
            cause: result,
            expected: Error_opt,
            operator: "rejects"
        });
    }
    catch (catchedError) {
        rejectedError = catchedError;
    }
    if (Error_opt) {
        const errorMatches = (typeof Error_opt === "function" && rejectedError instanceof Error_opt) ||
            (typeof Error_opt === "string" && typeof rejectedError?.message === "string" && rejectedError.message.includes(Error_opt)) ||
            (Error_opt instanceof RegExp && typeof rejectedError?.message === "string" && Error_opt.test(rejectedError.message));
        if (!errorMatches) {
            let errorMessage = `[rejects] Assertion failed: rejected with unexpected error: ${toSafeString(rejectedError)}${message ? " - " + toSafeString(message) : ""}`;
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
async function doesNotReject(block, Error_opt, message) {
    try {
        const result = typeof block === "function" ? await block() : await block;
        return result;
    }
    catch (catchedError) {
        if (Error_opt) {
            const errorMatches = (typeof Error_opt === "function" && catchedError instanceof Error_opt) ||
                (typeof Error_opt === "string" && catchedError.message?.includes(Error_opt)) ||
                (Error_opt instanceof RegExp && Error_opt.test(catchedError.message));
            if (errorMatches) {
                if (message instanceof Error)
                    throw message;
                let errorMessage = `[doesNotReject] Assertion failed: function/promise rejected with disallowed error: ${toSafeString(catchedError)}${message ? " - " + toSafeString(message) : ""}`;
                throw new assert.AssertionError(errorMessage, {
                    message: errorMessage,
                    cause: catchedError,
                    actual: catchedError,
                    expected: undefined,
                    operator: "doesNotReject"
                });
            }
        }
        if (message instanceof Error)
            throw message;
        let errorMessage = `[doesNotReject] Assertion failed: function/promise rejected unexpectedly${message ? " - " + toSafeString(message) : ""}`;
        throw new assert.AssertionError(errorMessage, {
            message: errorMessage,
            cause: catchedError,
            actual: catchedError,
            expected: undefined,
            operator: "doesNotReject"
        });
    }
}
function fail(message) {
    if (message instanceof Error) {
        throw message;
    }
    let errorMessage = `[fail] Assertion failed${message ? ": " + toSafeString(message) : ""}`;
    throw new assert.AssertionError(errorMessage, { message: errorMessage, cause: errorMessage });
}
function notOk(condition, message) {
    if (condition) {
        if (message instanceof Error) {
            throw message;
        }
        let errorMessage = `[notOk] Assertion failed: ${toSafeString(condition)} should be falsy${message ? " - " + toSafeString(message) : ""}`;
        throw new assert.AssertionError(errorMessage, {
            message: errorMessage,
            cause: errorMessage,
            actual: condition,
            expected: false,
            operator: "=="
        });
    }
}
function isTrue(condition, message) {
    if (condition !== true) {
        if (message instanceof Error) {
            throw message;
        }
        let errorMessage = `[isTrue] Assertion failed: ${toSafeString(condition)} should be true${message ? " - " + toSafeString(message) : ""}`;
        throw new assert.AssertionError(errorMessage, {
            message: errorMessage,
            cause: errorMessage,
            actual: condition,
            expected: true,
            operator: "!=="
        });
    }
}
function isFalse(condition, message) {
    if (condition !== false) {
        if (message instanceof Error) {
            throw message;
        }
        let errorMessage = `[isFalse] Assertion failed: ${toSafeString(condition)} should be false${message ? " - " + toSafeString(message) : ""}`;
        throw new assert.AssertionError(errorMessage, {
            message: errorMessage,
            cause: errorMessage,
            actual: condition,
            expected: false,
            operator: "!=="
        });
    }
}
function is(value, expectedType, message) {
    if (!isType(value, expectedType, false)) {
        if (message instanceof Error) {
            throw message;
        }
        let errorMessage = `[is] Assertion failed: ${toSafeString(value)} should be an expected type${message ? " - " + toSafeString(message) : ""}`;
        throw new assert.AssertionError(errorMessage, {
            message: errorMessage,
            cause: errorMessage,
            actual: value,
            expected: expectedType,
            operator: "is"
        });
    }
}
function isNot(value, expectedType, message) {
    if (isType(value, expectedType, false)) {
        if (message instanceof Error) {
            throw message;
        }
        let errorMessage = `[isNot] Assertion failed: ${toSafeString(value)} should not be an expected type${message ? " - " + toSafeString(message) : ""}`;
        throw new assert.AssertionError(errorMessage, {
            message: errorMessage,
            cause: errorMessage,
            actual: value,
            expected: expectedType,
            operator: "is not"
        });
    }
}
function isNullish(value, message) {
    if (value != null) {
        if (message instanceof Error) {
            throw message;
        }
        let errorMessage = `[isNullish] Assertion failed: ${toSafeString(value)} should be nullish${message ? " - " + toSafeString(message) : ""}`;
        throw new assert.AssertionError(errorMessage, {
            message: errorMessage,
            cause: errorMessage,
            actual: value,
            expected: null,
            operator: "!="
        });
    }
}
function isNotNullish(value, message) {
    if (value == null) {
        if (message instanceof Error) {
            throw message;
        }
        let errorMessage = `[isNotNullish] Assertion failed: ${toSafeString(value)} should be not nullish${message ? " - " + toSafeString(message) : ""}`;
        throw new assert.AssertionError(errorMessage, {
            message: errorMessage,
            cause: errorMessage,
            actual: value,
            expected: null,
            operator: "=="
        });
    }
}
function match(string, regexp, message) {
    if (typeof string !== "string") {
        if (message instanceof Error) {
            throw message;
        }
        throw new TypeError("[match] TypeError: " + string + " is not a string"
            + (message ? " - " + toSafeString(message) : ""));
    }
    if (!(regexp instanceof RegExp)) {
        if (message instanceof Error) {
            throw message;
        }
        throw new TypeError("[match] TypeError: " + regexp + " is not a RegExp"
            + (message ? " - " + toSafeString(message) : ""));
    }
    if (!(regexp.test(string))) {
        if (message instanceof Error) {
            throw message;
        }
        let errorMessage = `[match] Assertion failed: ${string} is not matched with ${regexp}${message ? " - " + toSafeString(message) : ""}`;
        throw new assert.AssertionError(errorMessage, {
            message: errorMessage,
            cause: errorMessage,
            actual: string,
            expected: regexp,
            operator: "match"
        });
    }
}
function doesNotMatch(string, regexp, message) {
    if (typeof string !== "string") {
        if (message instanceof Error) {
            throw message;
        }
        throw new TypeError("[doesNotMatch] TypeError: " + string + " is not a string"
            + (message ? " - " + toSafeString(message) : ""));
    }
    if (!(regexp instanceof RegExp)) {
        if (message instanceof Error) {
            throw message;
        }
        throw new TypeError("[doesNotMatch] TypeError: " + regexp + " is not a RegExp"
            + (message ? " - " + toSafeString(message) : ""));
    }
    if (regexp.test(string)) {
        if (message instanceof Error) {
            throw message;
        }
        let errorMessage = `[doesNotMatch] Assertion failed: ${string} is matched with ${regexp}${message ? " - " + toSafeString(message) : ""}`;
        throw new assert.AssertionError(errorMessage, {
            message: errorMessage,
            cause: errorMessage,
            actual: string,
            expected: regexp,
            operator: "doesNotMatch"
        });
    }
}
function lt(value1, value2, message) {
    if (!isLessThan(value1, value2)) {
        if (message instanceof Error) {
            throw message;
        }
        let errorMessage = `[lt] Assertion failed: ${toSafeString(value1)} should be less than ${toSafeString(value2)}${message ? " - " + toSafeString(message) : ""}`;
        throw new assert.AssertionError(errorMessage, {
            message: errorMessage,
            cause: errorMessage,
            actual: value1,
            expected: value2,
            operator: "<"
        });
    }
}
function lte(value1, value2, message) {
    if (!isLessThan(value1, value2) && !Object.is(value1, value2)) {
        if (message instanceof Error) {
            throw message;
        }
        let errorMessage = `[lte] Assertion failed: ${toSafeString(value1)} should be less than or equal ${toSafeString(value2)}${message ? " - " + toSafeString(message) : ""}`;
        throw new assert.AssertionError(errorMessage, {
            message: errorMessage,
            cause: errorMessage,
            actual: value1,
            expected: value2,
            operator: "< or Object.is();"
        });
    }
}
function gt(value1, value2, message) {
    if (!isLessThan(value2, value1)) {
        if (message instanceof Error) {
            throw message;
        }
        let errorMessage = `[gt] Assertion failed: ${toSafeString(value1)} should be greater than ${toSafeString(value2)}${message ? " - " + toSafeString(message) : ""}`;
        throw new assert.AssertionError(errorMessage, {
            message: errorMessage,
            cause: errorMessage,
            actual: value1,
            expected: value2,
            operator: ">"
        });
    }
}
function gte(value1, value2, message) {
    if (!isLessThan(value2, value1) && !Object.is(value1, value2)) {
        if (message instanceof Error) {
            throw message;
        }
        let errorMessage = `[gte] Assertion failed: ${toSafeString(value1)} should be greater than or equal ${value2}${message ? " - " + toSafeString(message) : ""}`;
        throw new assert.AssertionError(errorMessage, {
            message: errorMessage,
            cause: errorMessage,
            actual: value1,
            expected: value2,
            operator: "> or Object.is();"
        });
    }
}
function stringContains(actual, substring, message) {
    if (typeof actual !== "string") {
        if (message instanceof Error) {
            throw message;
        }
        throw new TypeError(`[stringContains] TypeError: ${toSafeString(actual)} is not a string${message ? " - " + toSafeString(message) : ""}`);
    }
    if (typeof substring !== "string") {
        if (message instanceof Error) {
            throw message;
        }
        throw new TypeError(`[stringContains] TypeError: ${toSafeString(substring)} is not a string${message ? " - " + toSafeString(message) : ""}`);
    }
    if (!actual.includes(substring)) {
        if (message instanceof Error) {
            throw message;
        }
        let errorMessage = `[stringContains] Assertion failed: ${toSafeString(actual)} does not contain substring ${toSafeString(substring)}${message ? " - " + toSafeString(message) : ""}`;
        throw new assert.AssertionError(errorMessage, {
            message: errorMessage,
            cause: errorMessage,
            actual,
            expected: substring,
            operator: "stringContains"
        });
    }
}
function stringNotContains(actual, substring, message) {
    if (typeof actual !== "string") {
        if (message instanceof Error) {
            throw message;
        }
        throw new TypeError(`[stringNotContains] TypeError: ${toSafeString(actual)} is not a string${message ? " - " + toSafeString(message) : ""}`);
    }
    if (typeof substring !== "string") {
        if (message instanceof Error) {
            throw message;
        }
        throw new TypeError(`[stringNotContains] TypeError: ${toSafeString(substring)} is not a string${message ? " - " + toSafeString(message) : ""}`);
    }
    if (actual.includes(substring)) {
        if (message instanceof Error) {
            throw message;
        }
        let errorMessage = `[stringNotContains] Assertion failed: ${toSafeString(actual)} should not contain substring ${toSafeString(substring)}${message ? " - " + toSafeString(message) : ""}`;
        throw new assert.AssertionError(errorMessage, {
            message: errorMessage,
            cause: errorMessage,
            actual,
            expected: substring,
            operator: "stringNotContains"
        });
    }
}
assert["VERSION"] = "assert.js v1.0.0";
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
export { assert };
export default assert;
