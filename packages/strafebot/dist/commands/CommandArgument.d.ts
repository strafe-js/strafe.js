import type { Attachment } from '@strafe-js/util';
export type ArgumentType = 'string' | 'integer' | 'number' | 'boolean' | 'user' | 'snowflake' | 'attachment';
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
export type InferArgumentType<Opt extends CommandArgumentOption> = Opt['type'] extends 'string' | 'user' | 'snowflake' ? Opt['choices'] extends Array<infer C> ? C : string : Opt['type'] extends 'integer' | 'number' ? Opt['choices'] extends Array<infer C> ? C : number : Opt['type'] extends 'boolean' ? boolean : Opt['type'] extends 'attachment' ? Attachment : unknown;
export type InferArguments<Schema extends CommandArgumentsSchema> = {
    [K in keyof Schema]: Schema[K]['required'] extends true ? InferArgumentType<Schema[K]> : InferArgumentType<Schema[K]> | (Schema[K]['default'] extends undefined ? undefined : InferArgumentType<Schema[K]>);
};
export declare class ArgumentValidationError extends Error {
    readonly argumentName: string;
    readonly code: 'REQUIRED' | 'INVALID_TYPE' | 'INVALID_CHOICE' | 'OUT_OF_RANGE' | 'INVALID_ATTACHMENT';
    readonly expected: string;
    readonly value: unknown;
    constructor(argumentName: string, code: 'REQUIRED' | 'INVALID_TYPE' | 'INVALID_CHOICE' | 'OUT_OF_RANGE' | 'INVALID_ATTACHMENT', message: string, expected: string, value: unknown);
}
export declare class ParsedArguments<Schema extends CommandArgumentsSchema = CommandArgumentsSchema> {
    private values;
    constructor(parsedValues?: Record<string, unknown>);
    get<K extends keyof Schema & string>(name: K): InferArguments<Schema>[K];
    getRaw(name: string): unknown;
    toObject(): Record<string, unknown>;
}
/**
 * Tokenizes command argument string supporting quotes ("hello world") and escaping (\").
 */
export declare function tokenizeArguments(input: string): string[];
export declare function parseAndValidateArguments<Schema extends CommandArgumentsSchema>(schema: Schema, tokens: string[], attachments?: Attachment[]): ParsedArguments<Schema>;
//# sourceMappingURL=CommandArgument.d.ts.map