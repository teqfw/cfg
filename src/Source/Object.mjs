// @ts-check

/**
 * @namespace TeqFw_Cfg_Source_Object
 * @description Explicit programmatic Source factory.
 */

const SOURCE_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:/-]{0,127}$/;

/**
 * @param {Readonly<Record<string, TeqFw_Cfg_RawValue>>} entries
 * @param {string} [id='object']
 * @returns {TeqFw_Cfg_Source}
 */
export function createObjectSource(entries, id = 'object') {
    assertRecord(entries, 'entries');
    assertId(id);
    const captured = Object.keys(entries).map((key) => Object.freeze({key, value: entries[key]}));
    return Object.freeze({
        id,
        async load() {
            return Object.freeze(captured.map(({key, value}) => Object.freeze({key, value})));
        },
    });
}

/**
 * @param {unknown} value
 * @param {string} field
 */
function assertRecord(value, field) {
    if ((value === null) || (typeof value !== 'object') || Array.isArray(value)) {
        throw createError('CFG_INVALID_SOURCE', {field});
    }
}

/** @param {unknown} id */
function assertId(id) {
    if (typeof id !== 'string' || id.length < 1 || id.length > 128 || !SOURCE_ID_PATTERN.test(id)) {
        throw createError('CFG_INVALID_SOURCE_ID');
    }
}

/** @param {string} code @param {Readonly<Record<string, string>>} [context] */
function createError(code, context = {}) {
    const error = new Error('Configuration source argument is invalid.');
    error.name = 'CfgError';
    Object.defineProperty(error, 'code', {value: code, enumerable: true});
    Object.defineProperty(error, 'context', {value: Object.freeze({...context}), enumerable: true});
    return Object.freeze(error);
}

export default createObjectSource;

