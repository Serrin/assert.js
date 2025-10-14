type AssertionErrorOptions = {
    message?: string;
    actual?: any;
    expected?: any;
    operator?: string;
    stackStartFn?: Function;
    diff?: any;
    cause: any;
};
declare class AssertionError extends Error {
    expected: any;
    actual: any;
    operator: any;
    code: string;
    constructor(message?: any, options?: AssertionErrorOptions);
}
declare function assert(condition: any, message?: any): void;
declare namespace assert {
    var VERSION: string;
    var ok: (condition: any, message?: any) => void;
    var AssertionError: {
        new (message?: any, options?: AssertionErrorOptions): AssertionError;
        isError(error: unknown): error is Error;
    };
    var equal: (actual: any, expected: any, message?: any) => void;
    var notEqual: (actual: any, expected: any, message?: any) => void;
    var strictEqual: (actual: any, expected: any, message?: any) => void;
    var notStrictEqual: (actual: any, expected: any, message?: any) => void;
    var deepEqual: (actual: any, expected: any, message?: any) => void;
    var notDeepEqual: (actual: any, expected: any, message?: any) => void;
    var throws: (block: Function, Error_opt?: any, message?: any) => Error | undefined;
    var rejects: (block: Function, Error_opt?: any, message?: any) => Promise<any>;
    var doesNotReject: (block: Function, Error_opt?: any, message?: any) => Promise<any>;
    var fail: (message?: any) => void;
    var notOk: (condition: any, message?: any) => void;
    var isTrue: (condition: unknown, message?: any) => void;
    var isFalse: (condition: unknown, message?: any) => void;
    var is: (value: any, expectedType: string | Function | Array<string | Function>, message?: any) => void;
    var isNot: (value: any, expectedType: string | Function | Array<string | Function>, message?: any) => void;
    var isNullish: (value: unknown, message?: any) => void;
    var isNotNullish: (value: unknown, message?: any) => void;
    var match: (string: string, regexp: RegExp, message?: any) => void;
    var doesNotMatch: (string: string, regexp: RegExp, message?: any) => void;
    var lt: (value1: any, value2: any, message?: any) => void;
    var lte: (value1: any, value2: any, message?: any) => void;
    var gt: (value1: any, value2: any, message?: any) => void;
    var gte: (value1: any, value2: any, message?: any) => void;
    var stringContains: (actual: string, substring: string, message?: any) => void;
    var stringNotContains: (actual: string, substring: string, message: any) => void;
}
export { assert };
export default assert;
//# sourceMappingURL=assert.d.ts.map