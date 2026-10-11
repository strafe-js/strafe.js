import type { Snowflake, Attachment } from '@strafe-js/util';

export type ArgumentType =
  | 'string'
  | 'integer'
  | 'number'
  | 'boolean'
  | 'user'
  | 'snowflake'
  | 'attachment';

export interface CommandArgumentOption<T extends ArgumentType = ArgumentType> {
  type: T;
  description?: string;
  required?: boolean;
  choices?: Array<string | number>;
  min?: number;
  max?: number;
  default?: unknown;
}

export type CommandArgumentsSchema = Record<string, CommandArgumentOption>;

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

export type InferArguments<Schema extends CommandArgumentsSchema> = {
  [K in keyof Schema]: Schema[K]['required'] extends true
    ? InferArgumentType<Schema[K]>
    : InferArgumentType<Schema[K]> | (Schema[K]['default'] extends undefined ? undefined : InferArgumentType<Schema[K]>);
};

export class ArgumentValidationError extends Error {
  readonly argumentName: string;
  readonly code: 'REQUIRED' | 'INVALID_TYPE' | 'INVALID_CHOICE' | 'OUT_OF_RANGE' | 'INVALID_ATTACHMENT';
  readonly expected: string;
  readonly value: unknown;

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

export class ParsedArguments<Schema extends CommandArgumentsSchema = CommandArgumentsSchema> {
  private values = new Map<string, unknown>();

  constructor(parsedValues: Record<string, unknown> = {}) {
    for (const [k, v] of Object.entries(parsedValues)) {
      this.values.set(k, v);
    }
  }

  get<K extends keyof Schema & string>(name: K): InferArguments<Schema>[K] {
    return this.values.get(name) as InferArguments<Schema>[K];
  }

  getRaw(name: string): unknown {
    return this.values.get(name);
  }

  toObject(): Record<string, unknown> {
    const obj: Record<string, unknown> = {};
    for (const [k, v] of this.values.entries()) {
      obj[k] = v;
    }
    return obj;
  }
}

/**
 * Tokenizes command argument string supporting quotes ("hello world") and escaping (\").
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

    // Token present -> consume
    tokenIndex++;

    let parsedVal: unknown;
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
