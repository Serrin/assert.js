type Falsy = null | undefined | false | 0 | -0 | 0n | "";
type StringLike = string | String;
type Nullish = undefined | null;
type NonNullablePrimitive = boolean | number | bigint | string | symbol;
type Primitive = Nullish | NonNullablePrimitive;
type NonPrimitive = object | Function;
type Comparable = number | bigint | string | boolean | Date;
type AssertionErrorOptions = {
    message?: string;
    actual?: any;
    expected?: any;
    operator?: any;
    stackStartFn?: Function;
    diff?: any;
};
type TestResult<T> = {
    ok: true;
    value: T;
    block: Function;
    name: string;
} | {
    ok: false;
    error: Error;
    block: Function;
    name: string;
};
type ExpectedType = string | Function | Array<string | Function>;
type IncludesOptions = {
    keyOrValue: any;
    value?: any;
};
declare class AssertionError extends Error {
    actual?: unknown;
    expected?: unknown;
    operator?: string;
    code?: string;
    generatedMessage?: boolean;
    constructor(options?: AssertionErrorOptions);
}
declare function assert(value: unknown, message?: string | Error): asserts value;
declare namespace assert {
    var VERSION: string;
    var config: {
        alwaysStrict: boolean;
    };
    var AssertionError: {
        new (options?: AssertionErrorOptions): AssertionError;
        isError(error: unknown): error is Error;
    };
    var ok: (value: unknown, message?: string | Error) => asserts value;
    var equal: (actual: unknown, expected: unknown, message?: string | Error) => void;
    var notEqual: (actual: unknown, expected: unknown, message?: string | Error) => void;
    var strictEqual: (actual: unknown, expected: unknown, message?: string | Error) => void;
    var notStrictEqual: (actual: unknown, expected: unknown, message?: string | Error) => void;
    var deepEqual: (actual: unknown, expected: unknown, message?: string | Error) => void;
    var notDeepEqual: (actual: unknown, expected: unknown, message?: string | Error) => void;
    var deepStrictEqual: (actual: unknown, expected: unknown, message?: string | Error) => void;
    var notDeepStrictEqual: (actual: unknown, expected: unknown, message?: string | Error) => void;
    var throws: (block: Function, Error_opt?: unknown, message?: string | Error) => Error | undefined;
    var rejects: (block: Function | Promise<unknown>, Error_opt?: unknown, message?: string | Error) => Promise<unknown>;
    var doesNotReject: (block: Function, Error_opt?: unknown, message?: string | Error) => Promise<unknown>;
    var fail: {
        (message?: string | Error): void;
        (actual?: unknown, expected?: unknown, message?: string | Error, operator?: unknown): void;
    };
    var notOk: (value: unknown, message?: string | Error) => asserts value is Falsy;
    var isTrue: (value: unknown, message?: string | Error) => asserts value is true;
    var isNotTrue: <T>(value: T, message?: string | Error) => asserts value is Exclude<T, true>;
    var isFalse: (value: unknown, message?: string | Error) => asserts value is false;
    var isNotFalse: <T>(value: T, message?: string | Error) => asserts value is Exclude<T, false>;
    var is: (value: unknown, expectedType: ExpectedType, message?: string | Error) => void;
    var typeOf: (value: unknown, expectedType: string, message?: string | Error) => void;
    var notTypeOf: (value: unknown, expectedType: string, message?: string | Error) => void;
    var instanceOf: (value: unknown, expectedConstructor: Function, message?: string | Error) => void;
    var notInstanceOf: (value: unknown, expectedConstructor: Function, message?: string | Error) => void;
    var isNot: (value: unknown, expectedType: ExpectedType, message?: string | Error) => void;
    var isNullish: (value: unknown, message?: string | Error) => asserts value is Nullish;
    var ifError: (value: unknown, message?: string | Error) => asserts value is Nullish;
    var isNonNullable: (value: unknown, message?: string | Error) => asserts value is NonNullable<unknown>;
    var isNull: (value: unknown, message?: string | Error) => asserts value is null;
    var isNotNull: (value: unknown, message?: string | Error) => asserts value is Exclude<unknown, null>;
    var isUndefined: (value: unknown, message?: string | Error) => asserts value is undefined;
    var isDefined: (value: unknown, message?: string | Error) => asserts value is Exclude<unknown, undefined>;
    var isString: (value: unknown, message?: string | Error) => asserts value is string;
    var isNotString: (value: unknown, message?: string | Error) => asserts value is Exclude<unknown, string>;
    var isNumber: (value: unknown, message?: string | Error) => asserts value is number;
    var isNotNumber: (value: unknown, message?: string | Error) => asserts value is Exclude<unknown, number>;
    var isBigInt: (value: unknown, message?: string | Error) => asserts value is bigint;
    var isNotBigInt: (value: unknown, message?: string | Error) => asserts value is Exclude<unknown, bigint>;
    var isBoolean: (value: unknown, message?: string | Error) => asserts value is boolean;
    var isNotBoolean: (value: unknown, message?: string | Error) => asserts value is Exclude<unknown, boolean>;
    var isSymbol: (value: unknown, message?: string | Error) => asserts value is symbol;
    var isNotSymbol: (value: unknown, message?: string | Error) => asserts value is Exclude<unknown, symbol>;
    var isFunction: (value: unknown, message?: string | Error) => asserts value is Function;
    var isNotFunction: (value: unknown, message?: string | Error) => asserts value is Exclude<unknown, Function>;
    var isObject: (value: unknown, message?: string | Error) => asserts value is object;
    var isNotObject: (value: unknown, message?: string | Error) => asserts value is Exclude<unknown, object>;
    var isPrimitive: (value: unknown, message?: string | Error) => asserts value is Primitive;
    var isNotPrimitive: (value: unknown, message?: string | Error) => asserts value is NonPrimitive;
    var isNaN: (value: unknown, message?: string | Error) => void;
    var isNotNaN: (value: unknown, message?: string | Error) => void;
    var isInt: (value: unknown, message?: string | Error) => void;
    var isNotInt: (value: unknown, message?: string | Error) => void;
    var isFloat: (value: unknown, message?: string | Error) => void;
    var isNotFloat: (value: unknown, message?: string | Error) => void;
    var isEmpty: (value: unknown, message?: string | Error) => void;
    var isNotEmpty: (value: unknown, message?: string | Error) => void;
    var match: (string: StringLike, regexp: RegExp, message?: string | Error) => void;
    var doesNotMatch: (string: StringLike, regexp: RegExp, message?: string | Error) => void;
    var lt: (value1: Comparable, value2: Comparable, message?: string | Error) => void;
    var lte: (value1: Comparable, value2: Comparable, message?: string | Error) => void;
    var gt: (value1: Comparable, value2: Comparable, message?: string | Error) => void;
    var gte: (value1: Comparable, value2: Comparable, message?: string | Error) => void;
    var inRange: (value: Comparable, min: Comparable, max: Comparable, message?: string | Error) => void;
    var notInRange: (value: Comparable, min: Comparable, max: Comparable, message?: string | Error) => void;
    var stringContains: (actual: StringLike, substring: StringLike, message?: string | Error) => void;
    var stringNotContains: (actual: StringLike, substring: StringLike, message?: string | Error) => void;
    var stringStartsWith: (actual: StringLike, substring: StringLike, message?: string | Error) => void;
    var stringNotStartsWith: (actual: StringLike, substring: StringLike, message?: string | Error) => void;
    var stringEndsWith: (actual: StringLike, substring: StringLike, message?: string | Error) => void;
    var stringNotEndsWith: (actual: StringLike, substring: StringLike, message?: string | Error) => void;
    var includes: (container: any, options: IncludesOptions, message?: string | Error) => void;
    var doesNotInclude: (container: any, options: IncludesOptions, message?: string | Error) => void;
    var oneOf: (value: unknown, collection: unknown, message?: string | Error) => void;
    var notOneOf: (value: unknown, collection: unknown, message?: string | Error) => void;
    var testSync: <T>(block: () => T, name?: string) => TestResult<T>;
    var testAsync: <T>(block: () => Promise<T>, name?: string) => Promise<TestResult<T>>;
    var testCheck: <T>(result: TestResult<T>) => result is {
        ok: true;
        value: T;
        block: Function;
        name: string;
    };
}
export { assert };
export default assert;
//# sourceMappingURL=assert.d.ts.map