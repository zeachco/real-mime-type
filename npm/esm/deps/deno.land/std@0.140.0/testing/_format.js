// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Converts the input into a string. Objects, Sets and Maps are sorted so as to
 * make tests less flaky
 * @param v Value to be formatted
 */
import * as dntShim from "../../../../_dnt.test_shims.js";
export function format(v) {
    // deno-lint-ignore no-explicit-any
    const { Deno } = dntShim.dntGlobalThis;
    return typeof (Deno === null || Deno === void 0 ? void 0 : Deno.inspect) === "function"
        ? Deno.inspect(v, {
            depth: Infinity,
            sorted: true,
            trailingComma: true,
            compact: false,
            iterableLimit: Infinity,
        })
        : `"${String(v).replace(/(?=["\\])/g, "\\")}"`;
}
//# sourceMappingURL=_format.js.map