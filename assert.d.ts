type Falsy = null | undefined | false | 0 | -0 | 0n | "";
type StringLike = string | String;
type Comparable = number | bigint | string | boolean;
type AssertionErrorOptions = {
    message?: unknown;
    cause?: unknown;
    actual?: unknown;
    expected?: unknown;
    operator?: string;
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
type Nullish = null | undefined;
type NonNullablePrimitive = number | bigint | boolean | string | symbol;
type Primitive = Nullish | NonNullablePrimitive;
type NonPrimitive = object | Function;
declare class AssertionError extends Error {
    actual?: unknown;
    expected?: unknown;
    operator?: string;
    code?: string;
    constructor(message?: string, options?: AssertionErrorOptions);
}
declare function assert(condition: unknown, message?: unknown): asserts condition;
declare namespace assert {
    var VERSION: string;
    var AssertionError: {
        new (message?: string, options?: AssertionErrorOptions): AssertionError;
        isError(error: unknown): error is Error;
    };
    var ok: (condition: unknown, message?: unknown) => asserts condition;
    var equal: (actual: unknown, expected: unknown, message?: unknown) => void;
    var notEqual: (actual: unknown, expected: unknown, message?: unknown) => void;
    var strictEqual: (actual: unknown, expected: unknown, message?: unknown) => void;
    var notStrictEqual: (actual: unknown, expected: unknown, message?: unknown) => void;
    var deepEqual: (actual: unknown, expected: unknown, message?: unknown) => void;
    var notDeepEqual: (actual: unknown, expected: unknown, message?: unknown) => void;
    var throws: (block: Function, Error_opt?: unknown, message?: unknown) => Error | undefined;
    var rejects: (block: Function | Promise<unknown>, Error_opt?: unknown, message?: unknown) => Promise<unknown>;
    var doesNotReject: (block: Function, Error_opt?: unknown, message?: unknown) => Promise<unknown>;
    var fail: (message?: unknown) => void;
    var notOk: (condition: unknown, message?: unknown) => asserts condition is Falsy;
    var isTrue: (condition: unknown, message?: unknown) => asserts condition is true;
    var isFalse: (condition: unknown, message?: unknown) => asserts condition is false;
    var is: (value: unknown, expectedType: ExpectedType, message?: unknown) => void;
    var isNot: (value: unknown, expectedType: ExpectedType, message?: unknown) => void;
    var isNullish: (value: unknown, message?: unknown) => asserts value is Nullish;
    var isNonNullable: (value: unknown, message?: unknown) => asserts value is NonNullable<unknown>;
    var isNull: (value: unknown, message?: unknown) => asserts value is null;
    var isNotNull: (value: unknown, message?: unknown) => asserts value is Exclude<unknown, null>;
    var isUndefined: (value: unknown, message?: unknown) => asserts value is undefined;
    var isDefined: (value: unknown, message?: unknown) => asserts value is Exclude<unknown, undefined>;
    var isString: (value: unknown, message?: unknown) => asserts value is string;
    var isNotString: (value: unknown, message?: unknown) => asserts value is Exclude<unknown, string>;
    var isNumber: (value: unknown, message?: unknown) => asserts value is number;
    var isNotNumber: (value: unknown, message?: unknown) => asserts value is Exclude<unknown, number>;
    var isBigInt: (value: unknown, message?: unknown) => asserts value is bigint;
    var isNotBigInt: (value: unknown, message?: unknown) => asserts value is Exclude<unknown, bigint>;
    var isBoolean: (value: unknown, message?: unknown) => asserts value is boolean;
    var isNotBoolean: (value: unknown, message?: unknown) => asserts value is Exclude<unknown, boolean>;
    var isSymbol: (value: unknown, message?: unknown) => asserts value is symbol;
    var isNotSymbol: (value: unknown, message?: unknown) => asserts value is Exclude<unknown, symbol>;
    var isFunction: (value: unknown, message?: unknown) => asserts value is Function;
    var isNotFunction: (value: unknown, message?: unknown) => asserts value is Exclude<unknown, Function>;
    var isObject: (value: unknown, message?: unknown) => asserts value is object;
    var isNotObject: (value: unknown, message?: unknown) => asserts value is Exclude<unknown, object> | Function;
    var isPrimitive: (value: unknown, message?: unknown) => asserts value is Primitive;
    var isNotPrimitive: (value: unknown, message?: unknown) => asserts value is NonPrimitive;
    var isNaN: (value: unknown, message?: unknown) => void;
    var isNotNaN: (value: unknown, message?: unknown) => void;
    var isEmpty: (value: unknown, message?: unknown) => void;
    var isNotEmpty: (value: unknown, message?: unknown) => void;
    var match: (string: StringLike, regexp: RegExp, message?: unknown) => void;
    var doesNotMatch: (string: StringLike, regexp: RegExp, message?: unknown) => void;
    var lt: (value1: Comparable, value2: Comparable, message?: unknown) => void;
    var lte: (value1: Comparable, value2: Comparable, message?: unknown) => void;
    var gt: (value1: Comparable, value2: Comparable, message?: unknown) => void;
    var gte: (value1: Comparable, value2: Comparable, message?: unknown) => void;
    var inRange: (value: Comparable, min: Comparable, max: Comparable, message?: unknown) => void;
    var notInRange: (value: Comparable, min: Comparable, max: Comparable, message?: unknown) => void;
    var stringContains: (actual: StringLike, substring: StringLike, message?: unknown) => void;
    var stringNotContains: (actual: StringLike, substring: StringLike, message?: unknown) => void;
    var includes: (container: any, options: IncludesOptions, message?: unknown) => void;
    var doesNotInclude: (container: any, options: IncludesOptions, message?: unknown) => void;
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