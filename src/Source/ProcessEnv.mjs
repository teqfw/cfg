// @ts-check

/**
 * @namespace TeqFw_Cfg_Source_ProcessEnv
 * @description Explicit process-environment Source factory.
 */

const SOURCE_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:/-]{0,127}$/;
const COMPLETE_KEY_PATTERN = /^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*__[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*$/;

/**
 * @param {Readonly<Record<string, string|undefined>>} environment
 * @param {string} [id='process-env']
 * @returns {TeqFw_Cfg_Source}
 */
export function createProcessEnvSource(environment, id = 'process-env') {
    assertRecord(environment, 'environment');
    assertId(id);
    /** @type {Array<{key: string, value: string}>} */
    const captured = [];
    for (const key of Object.keys(environment)) {
        if (!COMPLETE_KEY_PATTERN.test(key)) continue;
        const value = environment[key];
        if (value === undefined) continue;
        if (typeof value !== 'string') throw createError('CFG_INVALID_SOURCE', {field: 'environment'});
        captured.push(Object.freeze({key, value}));
    }
    return Object.freeze({
        id,
        async load() {
            return Object.freeze(captured.map(({key, value}) => Object.freeze({key, value})));
        },
    });
}

/** @param {unknown} value @param {string} field */
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

export default createProcessEnvSource;

