"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParsedArguments = exports.ArgumentValidationError = void 0;
exports.tokenizeArguments = tokenizeArguments;
exports.parseAndValidateArguments = parseAndValidateArguments;
class ArgumentValidationError extends Error {
    argumentName;
    code;
    expected;
    value;
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
class ParsedArguments {
    values = new Map();
    constructor(parsedValues = {}) {
        for (const [k, v] of Object.entries(parsedValues)) {
            this.values.set(k, v);
        }
    }
    get(name) {
        return this.values.get(name);
    }
    getRaw(name) {
        return this.values.get(name);
    }
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
 * Tokenizes command argument string supporting quotes ("hello world") and escaping (\").
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
        // Token present -> consume
        tokenIndex++;
        let parsedVal;
        switch (opt.type) {
            case 'string': {
                parsedVal = rawToken;
                break;
            }
            case 'user':
            case 'snowflake': {
                // Strip mentions like <@123456789012345678>
                const match = /^<@!?(\d{16,20})>$/.exec(rawToken);
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
        result[name] = parsedVal;
    }
    return new ParsedArguments(result);
}
//# sourceMappingURL=CommandArgument.js.map