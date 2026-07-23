// @ts-check

/**
 * @namespace TeqFw_Cfg_Source_Contract
 * @description Internal Source argument validation helpers.
 */

const SOURCE_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:/-]{0,127}$/;

/**
 * @param {unknown} id
 * @returns {string}
 */
export function assertSourceId(id) {
    if (typeof id !== 'string' || id.length < 1 || id.length > 128 || !SOURCE_ID_PATTERN.test(id)) {
        throw createError('CFG_INVALID_SOURCE_ID');
    }
    return id;
}

/**
 * @param {unknown} value
 * @param {string} field
 * @returns {void}
 */
export function assertSourceRecord(value, field) {
    if ((value === null) || (typeof value !== 'object') || Array.isArray(value)) {
        throw createError('CFG_INVALID_SOURCE', {field});
    }
}

/**
 * @param {string} code
 * @param {Readonly<Record<string, string>>} [context]
 * @returns {Error & {readonly code: string, readonly context: Readonly<Record<string, string>>}}
 */
function createError(code, context = {}) {
    const error = new Error('Configuration source argument is invalid.');
    error.name = 'CfgError';
    Object.defineProperty(error, 'code', {value: code, enumerable: true});
    Object.defineProperty(error, 'context', {value: Object.freeze({...context}), enumerable: true});
    return /** @type {any} */ (Object.freeze(error));
}

