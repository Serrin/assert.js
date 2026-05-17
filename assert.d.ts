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
type Message = string | Error;
declare class AssertionError extends Error {
    actual?: unknown;
    expected?: unknown;
    operator?: string;
    code?: string;
    generatedMessage?: boolean;
    constructor(options?: AssertionErrorOptions);
}
declare function assert(value: unknown, message?: Message): asserts value;
declare namespace assert {
    var VERSION: string;
    var config: {
        alwaysStrict: boolean;
    };
    var AssertionError: {
        new (options?: AssertionErrorOptions): AssertionError;
        isError(error: unknown): error is Error;
    };
    var ok: (value: unknown, message?: Message) => asserts value;
    var equal: (actual: unknown, expected: unknown, message?: Message) => void;
    var notEqual: (actual: unknown, expected: unknown, message?: Message) => void;
    var strictEqual: (actual: unknown, expected: unknown, message?: Message) => void;
    var notStrictEqual: (actual: unknown, expected: unknown, message?: Message) => void;
    var deepEqual: (actual: unknown, expected: unknown, message?: Message) => void;
    var notDeepEqual: (actual: unknown, expected: unknown, message?: Message) => void;
    var deepStrictEqual: (actual: unknown, expected: unknown, message?: Message) => void;
    var notDeepStrictEqual: (actual: unknown, expected: unknown, message?: Message) => void;
    var throws: (block: Function, Error_opt?: unknown, message?: Message) => Error | undefined;
    var rejects: (block: Function | Promise<unknown>, Error_opt?: unknown, message?: Message) => Promise<unknown>;
    var doesNotReject: (block: Function, Error_opt?: unknown, message?: Message) => Promise<unknown>;
    var fail: {
        (message?: Message): void;
        (actual?: unknown, expected?: unknown, message?: Message, operator?: unknown): void;
    };
    var notOk: (value: unknown, message?: Message) => asserts value is Falsy;
    var isTrue: (value: unknown, message?: Message) => asserts value is true;
    var isNotTrue: <T>(value: T, message?: Message) => asserts value is Exclude<T, true>;
    var isFalse: (value: unknown, message?: Message) => asserts value is false;
    var isNotFalse: <T>(value: T, message?: Message) => asserts value is Exclude<T, false>;
    var is: (value: unknown, expectedType: ExpectedType, message?: Message) => void;
    var typeOf: (value: unknown, expectedType: string, message?: Message) => void;
    var notTypeOf: (value: unknown, expectedType: string, message?: Message) => void;
    var instanceOf: (value: unknown, expectedConstructor: Function, message?: Message) => void;
    var notInstanceOf: (value: unknown, expectedConstructor: Function, message?: Message) => void;
    var isNot: (value: unknown, expectedType: ExpectedType, message?: Message) => void;
    var isNullish: (value: unknown, message?: Message) => asserts value is Nullish;
    var ifError: (value: unknown, message?: Message) => asserts value is Nullish;
    var isNonNullable: (value: unknown, message?: Message) => asserts value is NonNullable<unknown>;
    var isNull: (value: unknown, message?: Message) => asserts value is null;
    var isNotNull: (value: unknown, message?: Message) => asserts value is Exclude<unknown, null>;
    var isUndefined: (value: unknown, message?: Message) => asserts value is undefined;
    var isDefined: (value: unknown, message?: Message) => asserts value is Exclude<unknown, undefined>;
    var isString: (value: unknown, message?: Message) => asserts value is string;
    var isNotString: (value: unknown, message?: Message) => asserts value is Exclude<unknown, string>;
    var isNumber: (value: unknown, message?: Message) => asserts value is number;
    var isNotNumber: (value: unknown, message?: Message) => asserts value is Exclude<unknown, number>;
    var isBigInt: (value: unknown, message?: Message) => asserts value is bigint;
    var isNotBigInt: (value: unknown, message?: Message) => asserts value is Exclude<unknown, bigint>;
    var isBoolean: (value: unknown, message?: Message) => asserts value is boolean;
    var isNotBoolean: (value: unknown, message?: Message) => asserts value is Exclude<unknown, boolean>;
    var isSymbol: (value: unknown, message?: Message) => asserts value is symbol;
    var isNotSymbol: (value: unknown, message?: Message) => asserts value is Exclude<unknown, symbol>;
    var isFunction: (value: unknown, message?: Message) => asserts value is Function;
    var isNotFunction: (value: unknown, message?: Message) => asserts value is Exclude<unknown, Function>;
    var isObject: (value: unknown, message?: Message) => asserts value is object;
    var isNotObject: (value: unknown, message?: Message) => asserts value is Exclude<unknown, object>;
    var isPrimitive: (value: unknown, message?: Message) => asserts value is Primitive;
    var isNotPrimitive: (value: unknown, message?: Message) => asserts value is NonPrimitive;
    var isNaN: (value: unknown, message?: Message) => void;
    var isNotNaN: (value: unknown, message?: Message) => void;
    var isInt: (value: unknown, message?: Message) => void;
    var isNotInt: (value: unknown, message?: Message) => void;
    var isFloat: (value: unknown, message?: Message) => void;
    var isNotFloat: (value: unknown, message?: Message) => void;
    var isEmpty: (value: unknown, message?: Message) => void;
    var isNotEmpty: (value: unknown, message?: Message) => void;
    var match: (string: StringLike, regexp: RegExp, message?: Message) => void;
    var doesNotMatch: (string: StringLike, regexp: RegExp, message?: Message) => void;
    var lt: (value1: Comparable, value2: Comparable, message?: Message) => void;
    var lte: (value1: Comparable, value2: Comparable, message?: Message) => void;
    var gt: (value1: Comparable, value2: Comparable, message?: Message) => void;
    var gte: (value1: Comparable, value2: Comparable, message?: Message) => void;
    var inRange: (value: Comparable, min: Comparable, max: Comparable, message?: Message) => void;
    var notInRange: (value: Comparable, min: Comparable, max: Comparable, message?: Message) => void;
    var stringContains: (actual: StringLike, substring: StringLike, message?: Message) => void;
    var stringNotContains: (actual: StringLike, substring: StringLike, message?: Message) => void;
    var stringStartsWith: (actual: StringLike, substring: StringLike, message?: Message) => void;
    var stringNotStartsWith: (actual: StringLike, substring: StringLike, message?: Message) => void;
    var stringEndsWith: (actual: StringLike, substring: StringLike, message?: Message) => void;
    var stringNotEndsWith: (actual: StringLike, substring: StringLike, message?: Message) => void;
    var includes: (container: any, options: IncludesOptions, message?: Message) => void;
    var doesNotInclude: (container: any, options: IncludesOptions, message?: Message) => void;
    var oneOf: (value: unknown, collection: unknown, message?: Message) => void;
    var notOneOf: (value: unknown, collection: unknown, message?: Message) => void;
    var testSync: <T>(name: string | undefined, block: () => T) => TestResult<T>;
    var test: <T>(name: string | undefined, block: () => T) => TestResult<T>;
    var it: <T>(name: string | undefined, block: () => T) => TestResult<T>;
    var testAsync: <T>(name: string | undefined, block: () => Promise<T>) => Promise<TestResult<T>>;
    var testCheck: <T>(result: TestResult<T>) => result is {
        ok: true;
        value: T;
        block: Function;
        name: string;
    };
    var TestSuite: {
        new (): TestSuite;
    };
}
declare class TestSuite {
    private readonly results;
    add(...args: Array<TestResult<any>>): this;
    clear(): this;
    get size(): number;
    success(): IterableIterator<TestResult<any>>;
    failed(): IterableIterator<TestResult<any>>;
    values(): IterableIterator<TestResult<any>>;
    toArray(): Array<TestResult<any>>;
    [Symbol.iterator](): Iterator<TestResult<any>>;
}
export { assert };
export default assert;
//# sourceMappingURL=assert.d.ts.map