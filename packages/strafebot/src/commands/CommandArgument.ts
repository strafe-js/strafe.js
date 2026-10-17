import type { Snowflake, Attachment } from '@strafe-js/util';

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
export type ArgumentType =
  | 'string'
  | 'integer'
  | 'number'
  | 'boolean'
  | 'user'
  | 'snowflake'
  | 'attachment';

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
export type InferArgumentType<Opt extends CommandArgumentOption> =
  Opt['type'] extends 'string' | 'user' | 'snowflake'
    ? Opt['choices'] extends Array<infer C>
      ? C
      : string
    : Opt['type'] extends 'integer' | 'number'
    ? Opt['choices'] extends Array<infer C>
      ? C
      : number
    : Opt['type'] extends 'boolean'
    ? boolean
    : Opt['type'] extends 'attachment'
    ? Attachment
    : unknown;

/**
 * Infers the full map of argument names to resolved TypeScript types for a {@link CommandArgumentsSchema}.
 */
export type InferArguments<Schema extends CommandArgumentsSchema> = {
  [K in keyof Schema]: Schema[K]['required'] extends true
    ? InferArgumentType<Schema[K]>
    : InferArgumentType<Schema[K]> | (Schema[K]['default'] extends undefined ? undefined : InferArgumentType<Schema[K]>);
};

/**
 * Structured error thrown by {@link parseAndValidateArguments} and emitted via the `commandArgumentError`
 * event when a user's command invocation fails schema validation.
 */
export class ArgumentValidationError extends Error {
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
  constructor(
    argumentName: string,
    code: 'REQUIRED' | 'INVALID_TYPE' | 'INVALID_CHOICE' | 'OUT_OF_RANGE' | 'INVALID_ATTACHMENT',
    message: string,
    expected: string,
    value: unknown,
  ) {
    super(message);
    this.name = 'ArgumentValidationError';
    this.argumentName = argumentName;
    this.code = code;
    this.expected = expected;
    this.value = value;
  }
}

/**
 * Typed container holding validated command arguments accessible via `ctx.arguments` (or `ctx.parsedArguments`).
 */
export class ParsedArguments<Schema extends CommandArgumentsSchema = CommandArgumentsSchema> {
  private values = new Map<string, unknown>();

  /**
   * Initializes the container from a plain record of parsed argument values.
   */
  constructor(parsedValues: Record<string, unknown> = {}) {
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
  get<K extends keyof Schema & string>(name: K): InferArguments<Schema>[K] {
    return this.values.get(name) as InferArguments<Schema>[K];
  }

  /**
   * Retrieves a parsed argument value by untyped string key.
   */
  getRaw(name: string): unknown {
    return this.values.get(name);
  }

  /**
   * Returns a shallow plain-object copy of all parsed `{ [argumentName]: value }` pairs.
   */
  toObject(): Record<string, unknown> {
    const obj: Record<string, unknown> = {};
    for (const [k, v] of this.values.entries()) {
      obj[k] = v;
    }
    return obj;
  }
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
export function tokenizeArguments(input: string): string[] {
  const tokens: string[] = [];
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
export function parseAndValidateArguments<Schema extends CommandArgumentsSchema>(
  schema: Schema,
  tokens: string[],
  attachments: Attachment[] = [],
): ParsedArguments<Schema> {
  const result: Record<string, unknown> = {};
  const entries = Object.entries(schema);

  let tokenIndex = 0;

  for (const [name, opt] of entries) {
    let rawToken: string | undefined = tokens[tokenIndex];

    if (opt.type === 'attachment') {
      const att = attachments[0];
      if (!att) {
        if (opt.required) {
          throw new ArgumentValidationError(
            name,
            'REQUIRED',
            `Missing required attachment for argument "${name}"`,
            'Attachment',
            undefined,
          );
        }
        result[name] = opt.default ?? undefined;
        continue;
      }
      result[name] = att;
      continue;
    }

    if (rawToken === undefined || rawToken === '') {
      if (opt.required) {
        throw new ArgumentValidationError(
          name,
          'REQUIRED',
          `Missing required argument "${name}"`,
          opt.type,
          undefined,
        );
      }
      result[name] = opt.default ?? undefined;
      continue;
    }

    tokenIndex++;

    let parsedVal: unknown;
    switch (opt.type) {
      case 'string': {
        parsedVal = rawToken;
        break;
      }
      case 'user':
      case 'snowflake': {
        const match = /^<@!?(\d{16,20})>$/.exec(rawToken);
        parsedVal = match ? match[1] : rawToken;
        break;
      }
      case 'integer': {
        const num = parseInt(rawToken, 10);
        if (isNaN(num) || String(num) !== rawToken.trim()) {
          throw new ArgumentValidationError(
            name,
            'INVALID_TYPE',
            `Argument "${name}" must be an integer`,
            'integer',
            rawToken,
          );
        }
        parsedVal = num;
        break;
      }
      case 'number': {
        const num = parseFloat(rawToken);
        if (isNaN(num)) {
          throw new ArgumentValidationError(
            name,
            'INVALID_TYPE',
            `Argument "${name}" must be a number`,
            'number',
            rawToken,
          );
        }
        parsedVal = num;
        break;
      }
      case 'boolean': {
        const lower = rawToken.toLowerCase();
        if (['true', '1', 'yes', 'y'].includes(lower)) {
          parsedVal = true;
        } else if (['false', '0', 'no', 'n'].includes(lower)) {
          parsedVal = false;
        } else {
          throw new ArgumentValidationError(
            name,
            'INVALID_TYPE',
            `Argument "${name}" must be a boolean (true/false)`,
            'boolean',
            rawToken,
          );
        }
        break;
      }
      default:
        parsedVal = rawToken;
    }

    if (opt.choices && opt.choices.length > 0) {
      if (!opt.choices.includes(parsedVal as string | number)) {
        throw new ArgumentValidationError(
          name,
          'INVALID_CHOICE',
          `Argument "${name}" must be one of: ${opt.choices.join(', ')}`,
          opt.choices.join('|'),
          parsedVal,
        );
      }
    }

    if (typeof parsedVal === 'number') {
      if (opt.min !== undefined && parsedVal < opt.min) {
        throw new ArgumentValidationError(
          name,
          'OUT_OF_RANGE',
          `Argument "${name}" must be at least ${opt.min}`,
          `>= ${opt.min}`,
          parsedVal,
        );
      }
      if (opt.max !== undefined && parsedVal > opt.max) {
        throw new ArgumentValidationError(
          name,
          'OUT_OF_RANGE',
          `Argument "${name}" must be at most ${opt.max}`,
          `<= ${opt.max}`,
          parsedVal,
        );
      }
    }

    result[name] = parsedVal;
  }

  return new ParsedArguments<Schema>(result);
}
