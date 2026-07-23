// @ts-check

/**
 * @namespace TeqFw_Cfg_Error
 * @description Internal construction of safe, stable cfg errors.
 */

export const ERROR_CODES = Object.freeze({
    INVALID_SOURCE: 'CFG_INVALID_SOURCE',
    INVALID_ENTRY: 'CFG_INVALID_ENTRY',
    INVALID_SOURCE_ID: 'CFG_INVALID_SOURCE_ID',
    INVALID_KEY: 'CFG_INVALID_KEY',
    INVALID_RAW_VALUE: 'CFG_INVALID_RAW_VALUE',
    SOURCE_FAILED: 'CFG_SOURCE_FAILED',
    STORE_EMPTY: 'CFG_STORE_EMPTY',
    STORE_LOADING: 'CFG_STORE_LOADING',
    INVALID_NAMESPACE: 'CFG_INVALID_NAMESPACE',
    LOAD_ALREADY_READY: 'CFG_LOAD_ALREADY_READY',
    ILLEGAL_STATE: 'CFG_ILLEGAL_STATE',
});

const MESSAGES = /** @type {Readonly<Record<string, string>>} */ (Object.freeze({
    CFG_INVALID_SOURCE: 'Configuration source is invalid.',
    CFG_INVALID_ENTRY: 'Configuration source entry is invalid.',
    CFG_INVALID_SOURCE_ID: 'Configuration source identifier is invalid.',
    CFG_INVALID_KEY: 'Configuration key is invalid.',
    CFG_INVALID_RAW_VALUE: 'Configuration raw value is invalid.',
    CFG_SOURCE_FAILED: 'Configuration source failed.',
    CFG_STORE_EMPTY: 'Configuration store is empty.',
    CFG_STORE_LOADING: 'Configuration store is loading.',
    CFG_INVALID_NAMESPACE: 'Configuration namespace is invalid.',
    CFG_LOAD_ALREADY_READY: 'Configuration has already been loaded.',
    CFG_ILLEGAL_STATE: 'Configuration lifecycle transition is invalid.',
}));

/**
 * @param {string} code
 * @param {Readonly<Record<string, string>>} [context]
 * @returns {Error & {readonly code: string, readonly context: Readonly<Record<string, string>>}}
 */
export function createCfgError(code, context = {}) {
    const error = new Error(MESSAGES[code] ?? 'Configuration operation failed.');
    error.name = 'CfgError';
    Object.defineProperty(error, 'code', {value: code, enumerable: true});
    Object.defineProperty(error, 'context', {value: Object.freeze({...context}), enumerable: true});
    return /** @type {any} */ (Object.freeze(error));
}

/**
 * @param {unknown} error
 * @returns {error is Error & {readonly code: string, readonly context: Readonly<Record<string, string>>}}
 */
export function isCfgError(error) {
    return error instanceof Error && typeof (/** @type {{code?: unknown}} */ (error)).code === 'string' && error.name === 'CfgError';
}

