// @ts-check

/**
 * @namespace TeqFw_Cfg_Key
 * @description Internal complete-key, namespace, raw-value and immutability helpers.
 */

const SEGMENT = '[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*';
const NAMESPACE_PATTERN = new RegExp(`^${SEGMENT}$`);
const COMPLETE_KEY_PATTERN = new RegExp(`^(${SEGMENT})__(${SEGMENT})$`);
const MESSAGES = /** @type {Readonly<Record<string, string>>} */ (Object.freeze({
    CFG_INVALID_KEY: 'Configuration key is invalid.',
    CFG_INVALID_RAW_VALUE: 'Configuration raw value is invalid.',
    CFG_INVALID_NAMESPACE: 'Configuration namespace is invalid.',
    CFG_INVALID_ENTRY: 'Configuration source entry is invalid.',
}));

/**
 * @param {string} code
 * @param {Readonly<Record<string, string>>} [context]
 * @returns {Error & {readonly code: string, readonly context: Readonly<Record<string, string>>}}
 */
function createError(code, context = {}) {
    const error = new Error(MESSAGES[code] ?? 'Configuration operation failed.');
    error.name = 'CfgError';
    Object.defineProperty(error, 'code', {value: code, enumerable: true});
    Object.defineProperty(error, 'context', {value: Object.freeze({...context}), enumerable: true});
    return /** @type {any} */ (Object.freeze(error));
}

/**
 * @param {unknown} key
 * @returns {boolean}
 */
export function isCompleteKey(key) {
    return typeof key === 'string' && COMPLETE_KEY_PATTERN.test(key);
}

/**
 * @param {unknown} key
 * @param {Readonly<Record<string, string>>} [context]
 * @returns {{namespace: string, parameter: string}}
 */
export function parseCompleteKey(key, context = {}) {
    if (typeof key !== 'string' || !COMPLETE_KEY_PATTERN.test(key)) {
        const safeContext = typeof key === 'string' ? {key, ...context} : context;
        throw createError('CFG_INVALID_KEY', safeContext);
    }
    const boundary = key.indexOf('__');
    return {namespace: key.slice(0, boundary), parameter: key.slice(boundary + 2)};
}

/**
 * @param {unknown} namespace
 * @returns {string}
 */
export function assertNamespace(namespace) {
    if (typeof namespace !== 'string' || !NAMESPACE_PATTERN.test(namespace)) {
        /** @type {Readonly<Record<string, string>>} */
        const context = typeof namespace === 'string' ? {namespace} : {};
        throw createError('CFG_INVALID_NAMESPACE', context);
    }
    return namespace;
}

/**
 * @param {unknown} value
 * @returns {TeqFw_Cfg_RawValue}
 */
export function copyRawValue(value) {
    try {
        return copyRawValueInternal(value, new WeakSet());
    } catch (error) {
        if (error instanceof Error && (((/** @type {{code?: unknown}} */ (error)).code ?? '') === 'CFG_INVALID_RAW_VALUE')) throw error;
        throw createError('CFG_INVALID_RAW_VALUE');
    }
}

/**
 * @param {unknown} value
 * @param {WeakSet<object>} active
 * @returns {TeqFw_Cfg_RawValue}
 */
function copyRawValueInternal(value, active) {
    if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return value;
    }
    if ((typeof value !== 'object') || active.has(value)) throw createError('CFG_INVALID_RAW_VALUE');
    active.add(value);
    try {
        if (Array.isArray(value)) return copyArray(value, active);
        const prototype = Object.getPrototypeOf(value);
        if (prototype !== Object.prototype && prototype !== null) throw createError('CFG_INVALID_RAW_VALUE');
        return copyRecord(value, active);
    } finally {
        active.delete(value);
    }
}

/**
 * @param {unknown[]} value
 * @param {WeakSet<object>} active
 * @returns {ReadonlyArray<TeqFw_Cfg_RawValue>}
 */
function copyArray(value, active) {
    if (Object.getPrototypeOf(value) !== Array.prototype) throw createError('CFG_INVALID_RAW_VALUE');
    const descriptors = /** @type {Record<string, PropertyDescriptor>} */ (Object.getOwnPropertyDescriptors(value));
    if (Object.getOwnPropertySymbols(value).length > 0) throw createError('CFG_INVALID_RAW_VALUE');
    const lengthDescriptor = descriptors['length'];
    const length = lengthDescriptor && ("value" in lengthDescriptor) && typeof lengthDescriptor.value === "number" ? lengthDescriptor.value : NaN;
    if (!Number.isSafeInteger(length) || length < 0) throw createError('CFG_INVALID_RAW_VALUE');
    const result = new Array(length);
    for (let index = 0; index < length; index += 1) {
        const descriptor = descriptors[String(index)];
        if (!descriptor || !('value' in descriptor)) throw createError('CFG_INVALID_RAW_VALUE');
        Object.defineProperty(result, String(index), {
            value: copyRawValueInternal(descriptor.value, active),
            enumerable: true,
            writable: true,
            configurable: true,
        });
    }
    for (const name of Object.keys(descriptors)) {
        if (name !== 'length' && (!/^\d+$/.test(name) || Number(name) >= length)) {
            throw createError('CFG_INVALID_RAW_VALUE');
        }
        if (!('value' in descriptors[name])) throw createError('CFG_INVALID_RAW_VALUE');
    }
    return Object.freeze(result);
}

/**
 * @param {object} value
 * @param {WeakSet<object>} active
 * @returns {Readonly<Record<string, TeqFw_Cfg_RawValue>>}
 */
function copyRecord(value, active) {
    const descriptors = /** @type {Record<string, PropertyDescriptor>} */ (Object.getOwnPropertyDescriptors(value));
    if (Object.getOwnPropertySymbols(value).length > 0) throw createError('CFG_INVALID_RAW_VALUE');
    const result = {};
    for (const name of Object.keys(descriptors)) {
        const descriptor = descriptors[name];
        if (!('value' in descriptor)) throw createError('CFG_INVALID_RAW_VALUE');
        Object.defineProperty(result, name, {
            value: copyRawValueInternal(descriptor.value, active),
            enumerable: descriptor.enumerable,
            writable: true,
            configurable: true,
        });
    }
    return Object.freeze(result);
}

/**
 * @param {Readonly<Record<string, TeqFw_Cfg_RawValue>>} snapshot
 * @returns {TeqFw_Cfg_RawSnapshot}
 */
export function copySnapshot(snapshot) {
    if ((snapshot === null) || (typeof snapshot !== 'object') || Array.isArray(snapshot)) {
        throw createError('CFG_INVALID_ENTRY');
    }
    const result = {};
    for (const key of Object.keys(snapshot)) {
        const descriptor = Object.getOwnPropertyDescriptor(snapshot, key);
        if (!descriptor || !('value' in descriptor)) throw createError('CFG_INVALID_ENTRY');
        Object.defineProperty(result, key, {
            value: copyRawValue(descriptor.value),
            enumerable: true,
            writable: true,
            configurable: true,
        });
    }
    return Object.freeze(result);
}

