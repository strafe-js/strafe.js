"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParsedArguments = exports.ArgumentValidationError = void 0;
exports.tokenizeArguments = tokenizeArguments;
exports.parseAndValidateArguments = parseAndValidateArguments;
/**
 * Structured error thrown by {@link parseAndValidateArguments} and emitted via the `commandArgumentError`
 * event when a user's command invocation fails schema validation.
 */
class ArgumentValidationError extends Error {
    /** Name of the argument key in {@link CommandArgumentsSchema} that failed validation. */
    argumentName;
    /** Machine-readable validation failure reason code. */
    code;
    /** Human-readable description of the expected type, range, or choice set. */
    expected;
    /** Raw token or parsed value that triggered the validation failure. */
    value;
    /**
     * Creates a new {@link ArgumentValidationError}.
     */
    constructor(argumentName, code, message, expected, value) {
        super(message);
        this.name = 'ArgumentValidationError';
        this.argumentName = argumentName;
        this.code = code;
        this.expected = expected;
        this.value = value;
    }
}
exports.ArgumentValidationError = ArgumentValidationError;
/**
 * Typed container holding validated command arguments accessible via `ctx.arguments` (or `ctx.parsedArguments`).
 */
class ParsedArguments {
    values = new Map();
    /**
     * Initializes the container from a plain record of parsed argument values.
     */
    constructor(parsedValues = {}) {
        for (const [k, v] of Object.entries(parsedValues)) {
            this.values.set(k, v);
        }
    }
    /**
     * Retrieves the validated value for `name` with its type inferred from `Schema[K]`.
     *
     * @example
     * ```ts
     * const count = ctx.arguments.get('count');
     * ```
     */
    get(name) {
        return this.values.get(name);
    }
    /**
     * Retrieves a parsed argument value by untyped string key.
     */
    getRaw(name) {
        return this.values.get(name);
    }
    /**
     * Returns a shallow plain-object copy of all parsed `{ [argumentName]: value }` pairs.
     */
    toObject() {
        const obj = {};
        for (const [k, v] of this.values.entries()) {
            obj[k] = v;
        }
        return obj;
    }
}
exports.ParsedArguments = ParsedArguments;
/**
 * Splits a raw command argument string on whitespace while preserving double-quoted segments
 * (`"hello world"`) as single tokens and honoring backslash escapes (`\"`, `\\`).
 *
 * @example
 * ```ts
 * tokenizeArguments('ban 123456789012345678 "spamming links"');
 * // ['ban', '123456789012345678', 'spamming links']
 * ```
 */
function tokenizeArguments(input) {
    const tokens = [];
    let current = '';
    let inQuotes = false;
    let escape = false;
    for (let i = 0; i < input.length; i++) {
        const char = input[i];
        if (escape) {
            current += char;
            escape = false;
            continue;
        }
        if (char === '\\') {
            escape = true;
            continue;
        }
        if (char === '"') {
            inQuotes = !inQuotes;
            continue;
        }
        if (/\s/.test(char) && !inQuotes) {
            if (current.length > 0) {
                tokens.push(current);
                current = '';
            }
            continue;
        }
        current += char;
    }
    if (current.length > 0) {
        tokens.push(current);
    }
    return tokens;
}
/**
 * Parses and validates tokenized command arguments and message attachments against `schema` in key order.
 *
 * @throws {ArgumentValidationError} When a required argument is missing, fails type coercion, violates `choices`, or falls outside `[min, max]`.
 */
function parseAndValidateArguments(schema, tokens, attachments = []) {
    const result = {};
    const entries = Object.entries(schema);
    let tokenIndex = 0;
    for (const [name, opt] of entries) {
        let rawToken = tokens[tokenIndex];
        if (opt.type === 'attachment') {
            const att = attachments[0];
            if (!att) {
                if (opt.required) {
                    throw new ArgumentValidationError(name, 'REQUIRED', `Missing required attachment for argument "${name}"`, 'Attachment', undefined);
                }
                result[name] = opt.default ?? undefined;
                continue;
            }
            result[name] = att;
            continue;
        }
        if (rawToken === undefined || rawToken === '') {
            if (opt.required) {
                throw new ArgumentValidationError(name, 'REQUIRED', `Missing required argument "${name}"`, opt.type, undefined);
            }
            result[name] = opt.default ?? undefined;
            continue;
        }
        if (opt.type === 'string' && opt.rest) {
            rawToken = tokens.slice(tokenIndex).join(' ');
            tokenIndex = tokens.length;
        }
        else {
            tokenIndex++;
        }
        let parsedVal;
        switch (opt.type) {
            case 'string': {
                parsedVal = rawToken;
                break;
            }
            case 'user': {
                const match = /^<@!?(\d{16,20})>$/.exec(rawToken);
                parsedVal = match ? match[1] : rawToken;
                break;
            }
            case 'room': {
                const match = /^<#(\d{16,20})>$/.exec(rawToken);
                if (match) {
                    parsedVal = match[1];
                }
                else if (/^\d{16,20}$/.test(rawToken)) {
                    parsedVal = rawToken;
                }
                else {
                    throw new ArgumentValidationError(name, 'INVALID_TYPE', `Argument "${name}" must be a room mention (<#id>) or Snowflake ID`, 'room', rawToken);
                }
                break;
            }
            case 'role': {
                const match = /^<@&(\d{16,20})>$/.exec(rawToken);
                if (match) {
                    parsedVal = match[1];
                }
                else if (/^\d{16,20}$/.test(rawToken)) {
                    parsedVal = rawToken;
                }
                else {
                    throw new ArgumentValidationError(name, 'INVALID_TYPE', `Argument "${name}" must be a role mention (<@&id>) or Snowflake ID`, 'role', rawToken);
                }
                break;
            }
            case 'snowflake': {
                const match = /^<(?:@!?|@&|#)(\d{16,20})>$/.exec(rawToken);
                parsedVal = match ? match[1] : rawToken;
                break;
            }
            case 'integer': {
                const num = parseInt(rawToken, 10);
                if (isNaN(num) || String(num) !== rawToken.trim()) {
                    throw new ArgumentValidationError(name, 'INVALID_TYPE', `Argument "${name}" must be an integer`, 'integer', rawToken);
                }
                parsedVal = num;
                break;
            }
            case 'number': {
                const num = parseFloat(rawToken);
                if (isNaN(num)) {
                    throw new ArgumentValidationError(name, 'INVALID_TYPE', `Argument "${name}" must be a number`, 'number', rawToken);
                }
                parsedVal = num;
                break;
            }
            case 'boolean': {
                const lower = rawToken.toLowerCase();
                if (['true', '1', 'yes', 'y'].includes(lower)) {
                    parsedVal = true;
                }
                else if (['false', '0', 'no', 'n'].includes(lower)) {
                    parsedVal = false;
                }
                else {
                    throw new ArgumentValidationError(name, 'INVALID_TYPE', `Argument "${name}" must be a boolean (true/false)`, 'boolean', rawToken);
                }
                break;
            }
            default:
                parsedVal = rawToken;
        }
        if (opt.choices && opt.choices.length > 0) {
            if (!opt.choices.includes(parsedVal)) {
                throw new ArgumentValidationError(name, 'INVALID_CHOICE', `Argument "${name}" must be one of: ${opt.choices.join(', ')}`, opt.choices.join('|'), parsedVal);
            }
        }
        if (typeof parsedVal === 'number') {
            if (opt.min !== undefined && parsedVal < opt.min) {
                throw new ArgumentValidationError(name, 'OUT_OF_RANGE', `Argument "${name}" must be at least ${opt.min}`, `>= ${opt.min}`, parsedVal);
            }
            if (opt.max !== undefined && parsedVal > opt.max) {
                throw new ArgumentValidationError(name, 'OUT_OF_RANGE', `Argument "${name}" must be at most ${opt.max}`, `<= ${opt.max}`, parsedVal);
            }
        }
        if (typeof parsedVal === 'string') {
            if (opt.minLength !== undefined && parsedVal.length < opt.minLength) {
                throw new ArgumentValidationError(name, 'OUT_OF_RANGE', `Argument "${name}" must be at least ${opt.minLength} characters long`, `length >= ${opt.minLength}`, parsedVal);
            }
            if (opt.maxLength !== undefined && parsedVal.length > opt.maxLength) {
                throw new ArgumentValidationError(name, 'OUT_OF_RANGE', `Argument "${name}" must be at most ${opt.maxLength} characters long`, `length <= ${opt.maxLength}`, parsedVal);
            }
        }
        result[name] = parsedVal;
    }
    return new ParsedArguments(result);
}
//# sourceMappingURL=CommandArgument.js.map