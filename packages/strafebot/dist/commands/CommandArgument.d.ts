import type { Attachment } from '@strafe-js/util';
/**
 * Supported argument data types for {@link CommandArgumentOption}:
 * - `'string'`: Raw token string (unquoted if wrapped in `"..."`).
 * - `'integer'`: Base-10 whole number parsed via `parseInt(token, 10)`.
 * - `'number'`: Floating-point number parsed via `parseFloat(token)`.
 * - `'boolean'`: Accepts `'true' | '1' | 'yes' | 'y'` (`true`) or `'false' | '0' | 'no' | 'n'` (`false`).
 * - `'user'`: Extracts the Snowflake ID from `<@id>` / `<@!id>` user mentions or passes a raw ID string.
 * - `'snowflake'`: Extracts the Snowflake ID from `<@id>` / `<@!id>` or passes a raw ID string.
 * - `'attachment'`: Consumes `message.attachments[0]` without advancing the text token cursor.
 */
export type ArgumentType = 'string' | 'integer' | 'number' | 'boolean' | 'user' | 'snowflake' | 'attachment';
/**
 * Validation and parsing specification for a single command argument in a {@link CommandArgumentsSchema}.
 */
export interface CommandArgumentOption<T extends ArgumentType = ArgumentType> {
    /** Target parser type ({@link ArgumentType}). */
    type: T;
    /** Optional description of the argument for help generation. */
    description?: string;
    /** When `true`, throws {@link ArgumentValidationError} (`code: 'REQUIRED'`) if the argument is omitted. */
    required?: boolean;
    /** Whitelist of allowed string or numeric values. Throws `code: 'INVALID_CHOICE'` if the parsed value is not included. */
    choices?: Array<string | number>;
    /** Minimum inclusive numeric bound for `'integer'` and `'number'` arguments (`code: 'OUT_OF_RANGE'`). */
    min?: number;
    /** Maximum inclusive numeric bound for `'integer'` and `'number'` arguments (`code: 'OUT_OF_RANGE'`). */
    max?: number;
    /** Fallback value returned by `ctx.arguments.get(name)` when an optional argument is omitted. */
    default?: unknown;
}
/**
 * Ordered record mapping argument names to their {@link CommandArgumentOption} definitions.
 * Arguments are consumed in property definition order.
 */
export type CommandArgumentsSchema = Record<string, CommandArgumentOption>;
/**
 * Maps a single {@link CommandArgumentOption} to its resolved TypeScript value type.
 */
export type InferArgumentType<Opt extends CommandArgumentOption> = Opt['type'] extends 'string' | 'user' | 'snowflake' ? Opt['choices'] extends Array<infer C> ? C : string : Opt['type'] extends 'integer' | 'number' ? Opt['choices'] extends Array<infer C> ? C : number : Opt['type'] extends 'boolean' ? boolean : Opt['type'] extends 'attachment' ? Attachment : unknown;
/**
 * Infers the full map of argument names to resolved TypeScript types for a {@link CommandArgumentsSchema}.
 */
export type InferArguments<Schema extends CommandArgumentsSchema> = {
    [K in keyof Schema]: Schema[K]['required'] extends true ? InferArgumentType<Schema[K]> : InferArgumentType<Schema[K]> | (Schema[K]['default'] extends undefined ? undefined : InferArgumentType<Schema[K]>);
};
/**
 * Structured error thrown by {@link parseAndValidateArguments} and emitted via the `commandArgumentError`
 * event when a user's command invocation fails schema validation.
 */
export declare class ArgumentValidationError extends Error {
    /** Name of the argument key in {@link CommandArgumentsSchema} that failed validation. */
    readonly argumentName: string;
    /** Machine-readable validation failure reason code. */
    readonly code: 'REQUIRED' | 'INVALID_TYPE' | 'INVALID_CHOICE' | 'OUT_OF_RANGE' | 'INVALID_ATTACHMENT';
    /** Human-readable description of the expected type, range, or choice set. */
    readonly expected: string;
    /** Raw token or parsed value that triggered the validation failure. */
    readonly value: unknown;
    /**
     * Creates a new {@link ArgumentValidationError}.
     */
    constructor(argumentName: string, code: 'REQUIRED' | 'INVALID_TYPE' | 'INVALID_CHOICE' | 'OUT_OF_RANGE' | 'INVALID_ATTACHMENT', message: string, expected: string, value: unknown);
}
/**
 * Typed container holding validated command arguments accessible via `ctx.arguments` (or `ctx.parsedArguments`).
 */
export declare class ParsedArguments<Schema extends CommandArgumentsSchema = CommandArgumentsSchema> {
    private values;
    /**
     * Initializes the container from a plain record of parsed argument values.
     */
    constructor(parsedValues?: Record<string, unknown>);
    /**
     * Retrieves the validated value for `name` with its type inferred from `Schema[K]`.
     *
     * @example
     * ```ts
     * const count = ctx.arguments.get('count');
     * ```
     */
    get<K extends keyof Schema & string>(name: K): InferArguments<Schema>[K];
    /**
     * Retrieves a parsed argument value by untyped string key.
     */
    getRaw(name: string): unknown;
    /**
     * Returns a shallow plain-object copy of all parsed `{ [argumentName]: value }` pairs.
     */
    toObject(): Record<string, unknown>;
}
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
export declare function tokenizeArguments(input: string): string[];
/**
 * Parses and validates tokenized command arguments and message attachments against `schema` in key order.
 *
 * @throws {ArgumentValidationError} When a required argument is missing, fails type coercion, violates `choices`, or falls outside `[min, max]`.
 */
export declare function parseAndValidateArguments<Schema extends CommandArgumentsSchema>(schema: Schema, tokens: string[], attachments?: Attachment[]): ParsedArguments<Schema>;
//# sourceMappingURL=CommandArgument.d.ts.map