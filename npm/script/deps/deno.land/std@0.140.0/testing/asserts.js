"use strict";
// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible. Do not rely on good formatting of values
// for AssertionError messages in browsers.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unreachable = exports.unimplemented = exports.assertRejects = exports.assertThrows = exports.assertIsError = exports.fail = exports.assertObjectMatch = exports.assertNotMatch = exports.assertMatch = exports.assertArrayIncludes = exports.assertStringIncludes = exports.assertExists = exports.assertInstanceOf = exports.assertAlmostEquals = exports.assertNotStrictEquals = exports.assertStrictEquals = exports.assertNotEquals = exports.assertEquals = exports.assertFalse = exports.assert = exports.equal = exports.AssertionError = void 0;
const colors_js_1 = require("../fmt/colors.js");
const _diff_js_1 = require("./_diff.js");
const _format_js_1 = require("./_format.js");
const CAN_NOT_DISPLAY = "[Cannot display]";
class AssertionError extends Error {
    constructor(message) {
        super(message);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "AssertionError"
        });
    }
}
exports.AssertionError = AssertionError;
function isKeyedCollection(x) {
    return [Symbol.iterator, "size"].every((k) => k in x);
}
/**
 * Deep equality comparison used in assertions
 * @param c actual value
 * @param d expected value
 */
function equal(c, d) {
    const seen = new Map();
    return (function compare(a, b) {
        // Have to render RegExp & Date for string comparison
        // unless it's mistreated as object
        if (a &&
            b &&
            ((a instanceof RegExp && b instanceof RegExp) ||
                (a instanceof URL && b instanceof URL))) {
            return String(a) === String(b);
        }
        if (a instanceof Date && b instanceof Date) {
            const aTime = a.getTime();
            const bTime = b.getTime();
            // Check for NaN equality manually since NaN is not
            // equal to itself.
            if (Number.isNaN(aTime) && Number.isNaN(bTime)) {
                return true;
            }
            return aTime === bTime;
        }
        if (typeof a === "number" && typeof b === "number") {
            return Number.isNaN(a) && Number.isNaN(b) || a === b;
        }
        if (Object.is(a, b)) {
            return true;
        }
        if (a && typeof a === "object" && b && typeof b === "object") {
            if (a && b && !constructorsEqual(a, b)) {
                return false;
            }
            if (a instanceof WeakMap || b instanceof WeakMap) {
                if (!(a instanceof WeakMap && b instanceof WeakMap))
                    return false;
                throw new TypeError("cannot compare WeakMap instances");
            }
            if (a instanceof WeakSet || b instanceof WeakSet) {
                if (!(a instanceof WeakSet && b instanceof WeakSet))
                    return false;
                throw new TypeError("cannot compare WeakSet instances");
            }
            if (seen.get(a) === b) {
                return true;
            }
            if (Object.keys(a || {}).length !== Object.keys(b || {}).length) {
                return false;
            }
            seen.set(a, b);
            if (isKeyedCollection(a) && isKeyedCollection(b)) {
                if (a.size !== b.size) {
                    return false;
                }
                let unmatchedEntries = a.size;
                for (const [aKey, aValue] of a.entries()) {
                    for (const [bKey, bValue] of b.entries()) {
                        /* Given that Map keys can be references, we need
                         * to ensure that they are also deeply equal */
                        if ((aKey === aValue && bKey === bValue && compare(aKey, bKey)) ||
                            (compare(aKey, bKey) && compare(aValue, bValue))) {
                            unmatchedEntries--;
                        }
                    }
                }
                return unmatchedEntries === 0;
            }
            const merged = Object.assign(Object.assign({}, a), b);
            for (const key of [
                ...Object.getOwnPropertyNames(merged),
                ...Object.getOwnPropertySymbols(merged),
            ]) {
                if (!compare(a && a[key], b && b[key])) {
                    return false;
                }
                if (((key in a) && (!(key in b))) || ((key in b) && (!(key in a)))) {
                    return false;
                }
            }
            if (a instanceof WeakRef || b instanceof WeakRef) {
                if (!(a instanceof WeakRef && b instanceof WeakRef))
                    return false;
                return compare(a.deref(), b.deref());
            }
            return true;
        }
        return false;
    })(c, d);
}
exports.equal = equal;
// deno-lint-ignore ban-types
function constructorsEqual(a, b) {
    return a.constructor === b.constructor ||
        a.constructor === Object && !b.constructor ||
        !a.constructor && b.constructor === Object;
}
/** Make an assertion, error will be thrown if `expr` does not have truthy value. */
function assert(expr, msg = "") {
    if (!expr) {
        throw new AssertionError(msg);
    }
}
exports.assert = assert;
/** Make an assertion, error will be thrown if `expr` have truthy value. */
function assertFalse(expr, msg = "") {
    if (expr) {
        throw new AssertionError(msg);
    }
}
exports.assertFalse = assertFalse;
function assertEquals(actual, expected, msg) {
    if (equal(actual, expected)) {
        return;
    }
    let message = "";
    const actualString = (0, _format_js_1.format)(actual);
    const expectedString = (0, _format_js_1.format)(expected);
    try {
        const stringDiff = (typeof actual === "string") &&
            (typeof expected === "string");
        const diffResult = stringDiff
            ? (0, _diff_js_1.diffstr)(actual, expected)
            : (0, _diff_js_1.diff)(actualString.split("\n"), expectedString.split("\n"));
        const diffMsg = (0, _diff_js_1.buildMessage)(diffResult, { stringDiff }).join("\n");
        message = `Values are not equal:\n${diffMsg}`;
    }
    catch (_a) {
        message = `\n${(0, colors_js_1.red)(CAN_NOT_DISPLAY)} + \n\n`;
    }
    if (msg) {
        message = msg;
    }
    throw new AssertionError(message);
}
exports.assertEquals = assertEquals;
function assertNotEquals(actual, expected, msg) {
    if (!equal(actual, expected)) {
        return;
    }
    let actualString;
    let expectedString;
    try {
        actualString = String(actual);
    }
    catch (_a) {
        actualString = "[Cannot display]";
    }
    try {
        expectedString = String(expected);
    }
    catch (_b) {
        expectedString = "[Cannot display]";
    }
    if (!msg) {
        msg = `actual: ${actualString} expected not to be: ${expectedString}`;
    }
    throw new AssertionError(msg);
}
exports.assertNotEquals = assertNotEquals;
/**
 * Make an assertion that `actual` and `expected` are strictly equal. If
 * not then throw.
 *
 * ```ts
 * import { assertStrictEquals } from "./asserts.ts";
 *
 * assertStrictEquals(1, 2)
 * ```
 */
function assertStrictEquals(actual, expected, msg) {
    if (actual === expected) {
        return;
    }
    let message;
    if (msg) {
        message = msg;
    }
    else {
        const actualString = (0, _format_js_1.format)(actual);
        const expectedString = (0, _format_js_1.format)(expected);
        if (actualString === expectedString) {
            const withOffset = actualString
                .split("\n")
                .map((l) => `    ${l}`)
                .join("\n");
            message =
                `Values have the same structure but are not reference-equal:\n\n${(0, colors_js_1.red)(withOffset)}\n`;
        }
        else {
            try {
                const stringDiff = (typeof actual === "string") &&
                    (typeof expected === "string");
                const diffResult = stringDiff
                    ? (0, _diff_js_1.diffstr)(actual, expected)
                    : (0, _diff_js_1.diff)(actualString.split("\n"), expectedString.split("\n"));
                const diffMsg = (0, _diff_js_1.buildMessage)(diffResult, { stringDiff }).join("\n");
                message = `Values are not strictly equal:\n${diffMsg}`;
            }
            catch (_a) {
                message = `\n${(0, colors_js_1.red)(CAN_NOT_DISPLAY)} + \n\n`;
            }
        }
    }
    throw new AssertionError(message);
}
exports.assertStrictEquals = assertStrictEquals;
function assertNotStrictEquals(actual, expected, msg) {
    if (actual !== expected) {
        return;
    }
    throw new AssertionError(msg !== null && msg !== void 0 ? msg : `Expected "actual" to be strictly unequal to: ${(0, _format_js_1.format)(actual)}\n`);
}
exports.assertNotStrictEquals = assertNotStrictEquals;
/**
 * Make an assertion that `actual` and `expected` are almost equal numbers through
 * a given tolerance. It can be used to take into account IEEE-754 double-precision
 * floating-point representation limitations.
 * If the values are not almost equal then throw.
 *
 * ```ts
 * import { assertAlmostEquals, assertThrows } from "./asserts.ts";
 *
 * assertAlmostEquals(0.1, 0.2);
 *
 * // Using a custom tolerance value
 * assertAlmostEquals(0.1 + 0.2, 0.3, 1e-16);
 * assertThrows(() => assertAlmostEquals(0.1 + 0.2, 0.3, 1e-17));
 * ```
 */
function assertAlmostEquals(actual, expected, tolerance = 1e-7, msg) {
    if (actual === expected) {
        return;
    }
    const delta = Math.abs(expected - actual);
    if (delta <= tolerance) {
        return;
    }
    const f = (n) => Number.isInteger(n) ? n : n.toExponential();
    throw new AssertionError(msg !== null && msg !== void 0 ? msg : `actual: "${f(actual)}" expected to be close to "${f(expected)}": \
delta "${f(delta)}" is greater than "${f(tolerance)}"`);
}
exports.assertAlmostEquals = assertAlmostEquals;
/**
 * Make an assertion that `obj` is an instance of `type`.
 * If not then throw.
 */
function assertInstanceOf(actual, expectedType, msg = "") {
    var _a, _b;
    if (!msg) {
        const expectedTypeStr = expectedType.name;
        let actualTypeStr = "";
        if (actual === null) {
            actualTypeStr = "null";
        }
        else if (actual === undefined) {
            actualTypeStr = "undefined";
        }
        else if (typeof actual === "object") {
            actualTypeStr = (_b = (_a = actual.constructor) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : "Object";
        }
        else {
            actualTypeStr = typeof actual;
        }
        if (expectedTypeStr == actualTypeStr) {
            msg = `Expected object to be an instance of "${expectedTypeStr}".`;
        }
        else if (actualTypeStr == "function") {
            msg =
                `Expected object to be an instance of "${expectedTypeStr}" but was not an instanced object.`;
        }
        else {
            msg =
                `Expected object to be an instance of "${expectedTypeStr}" but was "${actualTypeStr}".`;
        }
    }
    assert(actual instanceof expectedType, msg);
}
exports.assertInstanceOf = assertInstanceOf;
/**
 * Make an assertion that actual is not null or undefined.
 * If not then throw.
 */
function assertExists(actual, msg) {
    if (actual === undefined || actual === null) {
        if (!msg) {
            msg = `actual: "${actual}" expected to not be null or undefined`;
        }
        throw new AssertionError(msg);
    }
}
exports.assertExists = assertExists;
/**
 * Make an assertion that actual includes expected. If not
 * then throw.
 */
function assertStringIncludes(actual, expected, msg) {
    if (!actual.includes(expected)) {
        if (!msg) {
            msg = `actual: "${actual}" expected to contain: "${expected}"`;
        }
        throw new AssertionError(msg);
    }
}
exports.assertStringIncludes = assertStringIncludes;
function assertArrayIncludes(actual, expected, msg) {
    const missing = [];
    for (let i = 0; i < expected.length; i++) {
        let found = false;
        for (let j = 0; j < actual.length; j++) {
            if (equal(expected[i], actual[j])) {
                found = true;
                break;
            }
        }
        if (!found) {
            missing.push(expected[i]);
        }
    }
    if (missing.length === 0) {
        return;
    }
    if (!msg) {
        msg = `actual: "${(0, _format_js_1.format)(actual)}" expected to include: "${(0, _format_js_1.format)(expected)}"\nmissing: ${(0, _format_js_1.format)(missing)}`;
    }
    throw new AssertionError(msg);
}
exports.assertArrayIncludes = assertArrayIncludes;
/**
 * Make an assertion that `actual` match RegExp `expected`. If not
 * then throw.
 */
function assertMatch(actual, expected, msg) {
    if (!expected.test(actual)) {
        if (!msg) {
            msg = `actual: "${actual}" expected to match: "${expected}"`;
        }
        throw new AssertionError(msg);
    }
}
exports.assertMatch = assertMatch;
/**
 * Make an assertion that `actual` not match RegExp `expected`. If match
 * then throw.
 */
function assertNotMatch(actual, expected, msg) {
    if (expected.test(actual)) {
        if (!msg) {
            msg = `actual: "${actual}" expected to not match: "${expected}"`;
        }
        throw new AssertionError(msg);
    }
}
exports.assertNotMatch = assertNotMatch;
/**
 * Make an assertion that `actual` object is a subset of `expected` object, deeply.
 * If not, then throw.
 */
function assertObjectMatch(
// deno-lint-ignore no-explicit-any
actual, expected) {
    function filter(a, b) {
        const seen = new WeakMap();
        return fn(a, b);
        function fn(a, b) {
            // Prevent infinite loop with circular references with same filter
            if ((seen.has(a)) && (seen.get(a) === b)) {
                return a;
            }
            seen.set(a, b);
            // Filter keys and symbols which are present in both actual and expected
            const filtered = {};
            const entries = [
                ...Object.getOwnPropertyNames(a),
                ...Object.getOwnPropertySymbols(a),
            ]
                .filter((key) => key in b)
                .map((key) => [key, a[key]]);
            for (const [key, value] of entries) {
                // On array references, build a filtered array and filter nested objects inside
                if (Array.isArray(value)) {
                    const subset = b[key];
                    if (Array.isArray(subset)) {
                        filtered[key] = fn(Object.assign({}, value), Object.assign({}, subset));
                        continue;
                    }
                } // On regexp references, keep value as it to avoid loosing pattern and flags
                else if (value instanceof RegExp) {
                    filtered[key] = value;
                    continue;
                } // On nested objects references, build a filtered object recursively
                else if (typeof value === "object") {
                    const subset = b[key];
                    if ((typeof subset === "object") && (subset)) {
                        // When both operands are maps, build a filtered map with common keys and filter nested objects inside
                        if ((value instanceof Map) && (subset instanceof Map)) {
                            filtered[key] = new Map([...value].filter(([k]) => subset.has(k)).map(([k, v]) => [k, typeof v === "object" ? fn(v, subset.get(k)) : v]));
                            continue;
                        }
                        // When both operands are set, build a filtered set with common values
                        if ((value instanceof Set) && (subset instanceof Set)) {
                            filtered[key] = new Set([...value].filter((v) => subset.has(v)));
                            continue;
                        }
                        filtered[key] = fn(value, subset);
                        continue;
                    }
                }
                filtered[key] = value;
            }
            return filtered;
        }
    }
    return assertEquals(
    // get the intersection of "actual" and "expected"
    // side effect: all the instances' constructor field is "Object" now.
    filter(actual, expected), 
    // set (nested) instances' constructor field to be "Object" without changing expected value.
    // see https://github.com/denoland/deno_std/pull/1419
    filter(expected, expected));
}
exports.assertObjectMatch = assertObjectMatch;
/**
 * Forcefully throws a failed assertion
 */
function fail(msg) {
    assert(false, `Failed assertion${msg ? `: ${msg}` : "."}`);
}
exports.fail = fail;
/**
 * Make an assertion that `error` is an `Error`.
 * If not then an error will be thrown.
 * An error class and a string that should be included in the
 * error message can also be asserted.
 */
function assertIsError(error, 
// deno-lint-ignore no-explicit-any
ErrorClass, msgIncludes, msg) {
    var _a;
    if (error instanceof Error === false) {
        throw new AssertionError(`Expected "error" to be an Error object.`);
    }
    if (ErrorClass && !(error instanceof ErrorClass)) {
        msg = `Expected error to be instance of "${ErrorClass.name}", but was "${typeof error === "object" ? (_a = error === null || error === void 0 ? void 0 : error.constructor) === null || _a === void 0 ? void 0 : _a.name : "[not an object]"}"${msg ? `: ${msg}` : "."}`;
        throw new AssertionError(msg);
    }
    if (msgIncludes && (!(error instanceof Error) ||
        !(0, colors_js_1.stripColor)(error.message).includes((0, colors_js_1.stripColor)(msgIncludes)))) {
        msg = `Expected error message to include "${msgIncludes}", but got "${error instanceof Error ? error.message : "[not an Error]"}"${msg ? `: ${msg}` : "."}`;
        throw new AssertionError(msg);
    }
}
exports.assertIsError = assertIsError;
function assertThrows(fn, errorClassOrCallback, msgIncludesOrMsg, msg) {
    // deno-lint-ignore no-explicit-any
    let ErrorClass = undefined;
    let msgIncludes = undefined;
    let errorCallback;
    if (errorClassOrCallback == null ||
        errorClassOrCallback.prototype instanceof Error ||
        errorClassOrCallback.prototype === Error.prototype) {
        // deno-lint-ignore no-explicit-any
        ErrorClass = errorClassOrCallback;
        msgIncludes = msgIncludesOrMsg;
        errorCallback = null;
    }
    else {
        errorCallback = errorClassOrCallback;
        msg = msgIncludesOrMsg;
    }
    let doesThrow = false;
    try {
        fn();
    }
    catch (error) {
        if (error instanceof Error === false) {
            throw new AssertionError("A non-Error object was thrown.");
        }
        assertIsError(error, ErrorClass, msgIncludes, msg);
        if (typeof errorCallback == "function") {
            errorCallback(error);
        }
        doesThrow = true;
    }
    if (!doesThrow) {
        msg = `Expected function to throw${msg ? `: ${msg}` : "."}`;
        throw new AssertionError(msg);
    }
}
exports.assertThrows = assertThrows;
function assertRejects(fn, errorClassOrCallback, msgIncludesOrMsg, msg) {
    return __awaiter(this, void 0, void 0, function* () {
        // deno-lint-ignore no-explicit-any
        let ErrorClass = undefined;
        let msgIncludes = undefined;
        let errorCallback;
        if (errorClassOrCallback == null ||
            errorClassOrCallback.prototype instanceof Error ||
            errorClassOrCallback.prototype === Error.prototype) {
            // deno-lint-ignore no-explicit-any
            ErrorClass = errorClassOrCallback;
            msgIncludes = msgIncludesOrMsg;
            errorCallback = null;
        }
        else {
            errorCallback = errorClassOrCallback;
            msg = msgIncludesOrMsg;
        }
        let doesThrow = false;
        let isPromiseReturned = false;
        const msgToAppendToError = msg ? `: ${msg}` : ".";
        try {
            const possiblePromise = fn();
            if (possiblePromise instanceof Promise) {
                isPromiseReturned = true;
                yield possiblePromise;
            }
        }
        catch (error) {
            if (!isPromiseReturned) {
                throw new AssertionError(`Function throws when expected to reject${msgToAppendToError}`);
            }
            if (error instanceof Error === false) {
                throw new AssertionError("A non-Error object was rejected.");
            }
            assertIsError(error, ErrorClass, msgIncludes, msg);
            if (typeof errorCallback == "function") {
                errorCallback(error);
            }
            doesThrow = true;
        }
        if (!doesThrow) {
            throw new AssertionError(`Expected function to reject${msgToAppendToError}`);
        }
    });
}
exports.assertRejects = assertRejects;
/** Use this to stub out methods that will throw when invoked. */
function unimplemented(msg) {
    throw new AssertionError(msg || "unimplemented");
}
exports.unimplemented = unimplemented;
/** Use this to assert unreachable code. */
function unreachable() {
    throw new AssertionError("unreachable");
}
exports.unreachable = unreachable;
//# sourceMappingURL=asserts.js.map