// @ts-check

/**
 * @namespace TeqFw_Cfg_Source_DotenvFile
 * @description UTF-8 dotenv-file Source factory.
 */

const SOURCE_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:/-]{0,127}$/;
const COMPLETE_KEY_PATTERN = /^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*__[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*$/;

/**
 * @param {{path: string, id?: string}} options
 * @returns {TeqFw_Cfg_Source}
 */
export function createDotenvFileSource(options) {
    assertRecord(options, 'options');
    if (typeof options.path !== 'string') throw new TypeError('Dotenv source path must be a string.');
    const id = options.id ?? 'dotenv-file';
    assertId(id);
    const path = options.path;
    return Object.freeze({
        id,
        async load() {
            const {readFile} = await import('node:fs/promises');
            const dotenv = await import('dotenv');
            const bytes = await readFile(path);
            const text = new TextDecoder('utf-8', {fatal: true}).decode(bytes);
            const parsed = dotenv.default.parse(text);
            const result = [];
            for (const [key, value] of Object.entries(parsed)) {
                if (COMPLETE_KEY_PATTERN.test(key)) result.push(Object.freeze({key, value}));
            }
            return Object.freeze(result);
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

export default createDotenvFileSource;

