type StringLike = string | String;
type AssertionErrorOptions = {
    message?: string;
    actual?: any;
    expected?: any;
    operator?: string;
    stackStartFn?: Function;
    diff?: any;
    cause: any;
};
type TestResult<T> = {
    ok: true;
    value: T;
} | {
    ok: false;
    error: Error;
};
type ExpectedType = string | Function | Array<string | Function>;
type IncludesOptions = {
    keyOrValue: any;
    value?: any;
};
type Nullish = null | undefined;
type Primitive = null | undefined | number | bigint | boolean | string | symbol;
type NonPrimitive = object | Function;
declare class AssertionError extends Error {
    expected: any;
    actual: any;
    operator: any;
    code: string;
    constructor(message?: any, options?: AssertionErrorOptions);
}
declare function assert(condition: any, message?: any): asserts condition;
declare namespace assert {
    var VERSION: string;
    var AssertionError: {
        new (message?: any, options?: AssertionErrorOptions): AssertionError;
        isError(error: unknown): error is Error;
    };
    var ok: (condition: any, message?: any) => asserts condition;
    var equal: (actual: any, expected: any, message?: any) => void;
    var notEqual: (actual: any, expected: any, message?: any) => void;
    var strictEqual: (actual: any, expected: any, message?: any) => void;
    var notStrictEqual: (actual: any, expected: any, message?: any) => void;
    var deepEqual: (actual: any, expected: any, message?: any) => void;
    var notDeepEqual: (actual: any, expected: any, message?: any) => void;
    var throws: (block: Function, Error_opt?: any, message?: any) => Error | undefined;
    var rejects: (block: Function | Promise<any>, Error_opt?: any, message?: any) => Promise<any>;
    var doesNotReject: (block: Function, Error_opt?: any, message?: any) => Promise<any>;
    var fail: (message?: any) => void;
    var notOk: (condition: any, message?: any) => void;
    var isTrue: (condition: unknown, message?: any) => asserts condition is true;
    var isFalse: (condition: unknown, message?: any) => asserts condition is false;
    var is: (value: any, expectedType: ExpectedType, message?: any) => void;
    var isNot: (value: any, expectedType: ExpectedType, message?: any) => void;
    var isNullish: (value: unknown, message?: any) => asserts value is Nullish;
    var isNotNullish: (value: unknown, message?: any) => asserts value is NonNullable<unknown>;
    var isNull: (value: unknown, message?: any) => asserts value is null;
    var isNotNull: (value: unknown, message?: any) => asserts value is NonNullable<unknown>;
    var isUndefined: (value: unknown, message?: any) => asserts value is undefined;
    var isNotUndefined: (value: unknown, message?: any) => void;
    var isString: (value: unknown, message?: any) => asserts value is string;
    var isNotString: (value: unknown, message?: any) => void;
    var isNumber: (value: unknown, message?: any) => asserts value is number;
    var isNotNumber: (value: unknown, message?: any) => void;
    var isBigInt: (value: unknown, message?: any) => asserts value is bigint;
    var isNotBigInt: (value: unknown, message?: any) => void;
    var isBoolean: (value: unknown, message?: any) => asserts value is boolean;
    var isNotBoolean: (value: unknown, message?: any) => void;
    var isSymbol: (value: unknown, message?: any) => asserts value is symbol;
    var isNotSymbol: (value: unknown, message?: any) => void;
    var isFunction: (value: unknown, message?: any) => asserts value is Function;
    var isNotFunction: (value: unknown, message?: any) => void;
    var isObject: (value: unknown, message?: any) => asserts value is object;
    var isNotObject: (value: unknown, message?: any) => void;
    var isPrimitive: (value: unknown, message?: any) => asserts value is Primitive;
    var isNotPrimitive: (value: unknown, message?: any) => asserts value is NonPrimitive;
    var isEmpty: (value: unknown, message?: any) => void;
    var isNotEmpty: (value: unknown, message?: any) => void;
    var match: (string: StringLike, regexp: RegExp, message?: any) => void;
    var doesNotMatch: (string: StringLike, regexp: RegExp, message?: any) => void;
    var lt: (value1: any, value2: any, message?: any) => void;
    var lte: (value1: any, value2: any, message?: any) => void;
    var gt: (value1: any, value2: any, message?: any) => void;
    var gte: (value1: any, value2: any, message?: any) => void;
    var stringContains: (actual: StringLike, substring: StringLike, message?: any) => void;
    var stringNotContains: (actual: StringLike, substring: StringLike, message?: any) => void;
    var includes: (container: unknown, options: IncludesOptions, message?: any) => void;
    var doesNotInclude: (container: unknown, options: IncludesOptions, message?: any) => void;
    var testSync: <T>(block: () => T) => TestResult<T>;
    var testAsync: <T>(block: () => Promise<T>) => Promise<TestResult<T>>;
    var testCheck: <T>(result: TestResult<T>) => result is {
        ok: true;
        value: T;
    };
}
export { assert };
export default assert;
//# sourceMappingURL=assert.d.ts.map