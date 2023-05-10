var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const chalk = require("chalk");
const process = require("process");
const { pathToFileURL } = require("url");
const { testDefinitions } = require("@deno/shim-deno/test-internals");
const filePaths = [
    "mod_test.js",
];
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const testContext = {
            process,
            chalk,
        };
        for (const [i, filePath] of filePaths.entries()) {
            if (i > 0) {
                console.log("");
            }
            const scriptPath = "./script/" + filePath;
            console.log("Running tests in " + chalk.underline(scriptPath) + "...\n");
            process.chdir(__dirname + "/script");
            const scriptTestContext = Object.assign({ origin: pathToFileURL(filePath).toString() }, testContext);
            try {
                require(scriptPath);
            }
            catch (err) {
                console.error(err);
                process.exit(1);
            }
            yield runTestDefinitions(testDefinitions.splice(0, testDefinitions.length), scriptTestContext);
            const esmPath = "./esm/" + filePath;
            console.log("\nRunning tests in " + chalk.underline(esmPath) + "...\n");
            process.chdir(__dirname + "/esm");
            const esmTestContext = Object.assign({ origin: pathToFileURL(filePath).toString() }, testContext);
            yield import(esmPath);
            yield runTestDefinitions(testDefinitions.splice(0, testDefinitions.length), esmTestContext);
        }
    });
}
function runTestDefinitions(testDefinitions, options) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const testFailures = [];
        for (const definition of testDefinitions) {
            options.process.stdout.write("test " + definition.name + " ...");
            if (definition.ignore) {
                options.process.stdout.write(` ${options.chalk.gray("ignored")}\n`);
                continue;
            }
            const context = getTestContext(definition, undefined);
            let pass = false;
            try {
                yield definition.fn(context);
                if (context.hasFailingChild) {
                    testFailures.push({
                        name: definition.name,
                        err: new Error("Had failing test step.")
                    });
                }
                else {
                    pass = true;
                }
            }
            catch (err) {
                testFailures.push({
                    name: definition.name,
                    err
                });
            }
            const testStepOutput = context.getOutput();
            if (testStepOutput.length > 0) {
                options.process.stdout.write(testStepOutput);
            }
            else {
                options.process.stdout.write(" ");
            }
            options.process.stdout.write(getStatusText(pass ? "ok" : "fail"));
            options.process.stdout.write("\n");
        }
        if (testFailures.length > 0) {
            options.process.stdout.write("\nFAILURES");
            for (const failure of testFailures) {
                options.process.stdout.write("\n\n");
                options.process.stdout.write(failure.name + "\n");
                options.process.stdout.write(indentText(((_b = (_a = failure.err) === null || _a === void 0 ? void 0 : _a.stack) !== null && _b !== void 0 ? _b : failure.err).toString(), 1));
            }
            options.process.exit(1);
        }
        function getTestContext(definition, parent) {
            return {
                name: definition.name,
                parent,
                origin: options.origin,
                /** @type {any} */ err: undefined,
                status: "ok",
                children: [],
                get hasFailingChild() {
                    return this.children.some((c) => c.status === "fail" || c.status === "pending");
                },
                getOutput() {
                    var _a;
                    let output = "";
                    if (this.parent) {
                        output += "test " + this.name + " ...";
                    }
                    if (this.children.length > 0) {
                        output += "\n" + this.children.map((c) => indentText(c.getOutput(), 1)).join("\n") + "\n";
                    }
                    else if (!this.err) {
                        output += " ";
                    }
                    if (this.parent && this.err) {
                        output += "\n";
                    }
                    if (this.err) {
                        output += indentText(((_a = this.err.stack) !== null && _a !== void 0 ? _a : this.err).toString(), 1);
                        if (this.parent) {
                            output += "\n";
                        }
                    }
                    if (this.parent) {
                        output += getStatusText(this.status);
                    }
                    return output;
                },
                step(nameOrTestDefinition, fn) {
                    return __awaiter(this, void 0, void 0, function* () {
                        const definition = getDefinition();
                        const context = getTestContext(definition, this);
                        context.status = "pending";
                        this.children.push(context);
                        if (definition.ignore) {
                            context.status = "ignored";
                            return false;
                        }
                        try {
                            yield definition.fn(context);
                            context.status = "ok";
                            if (context.hasFailingChild) {
                                context.status = "fail";
                                return false;
                            }
                            return true;
                        }
                        catch (err) {
                            context.status = "fail";
                            context.err = err;
                            return false;
                        }
                        /** @returns {TestDefinition} */ function getDefinition() {
                            if (typeof nameOrTestDefinition === "string") {
                                if (!(fn instanceof Function)) {
                                    throw new TypeError("Expected function for second argument.");
                                }
                                return {
                                    name: nameOrTestDefinition,
                                    fn
                                };
                            }
                            else if (typeof nameOrTestDefinition === "object") {
                                return nameOrTestDefinition;
                            }
                            else {
                                throw new TypeError("Expected a test definition or name and function.");
                            }
                        }
                    });
                }
            };
        }
        function getStatusText(status) {
            switch (status) {
                case "ok":
                    return options.chalk.green(status);
                case "fail":
                case "pending":
                    return options.chalk.red(status);
                case "ignored":
                    return options.chalk.gray(status);
                default:
                    {
                        const _assertNever = status;
                        return status;
                    }
            }
        }
        function indentText(text, indentLevel) {
            if (text === undefined) {
                text = "[undefined]";
            }
            else if (text === null) {
                text = "[null]";
            }
            else {
                text = text.toString();
            }
            return text.split(/\r?\n/).map((line) => "  ".repeat(indentLevel) + line).join("\n");
        }
    });
}
main();
