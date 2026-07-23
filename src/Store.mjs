// @ts-check

/**
 * @namespace TeqFw_Cfg_Store
 * @description Internal immutable snapshot state owner.
 */

export default class Store {
    constructor() {
        /** @type {TeqFw_Cfg_Store_State} */
        let state = 'empty';
        /** @type {TeqFw_Cfg_RawSnapshot|undefined} */
        let snapshot;
        /** @type {Error|undefined} */
        let failure;

        Object.defineProperty(this, 'state', {get: () => state});
        this.getState = function () {
            return state;
        };
        this.beginLoading = function () {
            if (state !== 'empty') throw createError('CFG_ILLEGAL_STATE', {state});
            state = 'loading';
        };
        /** @param {TeqFw_Cfg_RawSnapshot} value */
        this.publish = function (value) {
            if (state !== 'loading') throw createError('CFG_ILLEGAL_STATE', {state});
            snapshot = copySnapshot(value);
            state = 'ready';
        };
        /** @param {Error} value */
        this.fail = function (value) {
            if (state !== 'loading') throw createError('CFG_ILLEGAL_STATE', {state});
            failure = value;
            state = 'failed';
        };
        this.getSnapshot = function () {
            if (state === 'empty') throw createError('CFG_STORE_EMPTY');
            if (state === 'loading') throw createError('CFG_STORE_LOADING');
            if (state === 'failed') throw failure;
            return /** @type {TeqFw_Cfg_RawSnapshot} */ (snapshot);
        };
        this.getFailure = function () {
            return failure;
        };
    }
}

/** @param {string} code @param {Readonly<Record<string, string>>} [context] */
function createError(code, context = {}) {
    const error = new Error('Configuration store lifecycle operation failed.');
    error.name = 'CfgError';
    Object.defineProperty(error, 'code', {value: code, enumerable: true});
    Object.defineProperty(error, 'context', {value: Object.freeze({...context}), enumerable: true});
    return Object.freeze(error);
}

/**
 * @param {Readonly<Record<string, TeqFw_Cfg_RawValue>>} value
 * @returns {TeqFw_Cfg_RawSnapshot}
 */
function copySnapshot(value) {
    if ((value === null) || (typeof value !== 'object') || Array.isArray(value)) {
        throw createError('CFG_INVALID_ENTRY');
    }
    const result = {};
    for (const key of Object.keys(value)) {
        const descriptor = Object.getOwnPropertyDescriptor(value, key);
        if (!descriptor || !('value' in descriptor)) throw createError('CFG_INVALID_ENTRY');
        Object.defineProperty(result, key, {
            value: copyRawValue(descriptor.value, new WeakSet()),
            enumerable: true,
            writable: true,
            configurable: true,
        });
    }
    return Object.freeze(result);
}

/** @param {unknown} value @param {WeakSet<object>} active @returns {TeqFw_Cfg_RawValue} */
function copyRawValue(value, active) {
    if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
    if ((typeof value !== 'object') || active.has(value)) throw createError('CFG_INVALID_RAW_VALUE');
    active.add(value);
    try {
        if (Array.isArray(value)) {
            if (Object.getPrototypeOf(value) !== Array.prototype) throw createError('CFG_INVALID_RAW_VALUE');
            const result = [];
            for (let index = 0; index < value.length; index += 1) {
                const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
                if (!descriptor || !('value' in descriptor)) throw createError('CFG_INVALID_RAW_VALUE');
                result.push(copyRawValue(descriptor.value, active));
            }
            return Object.freeze(result);
        }
        const prototype = Object.getPrototypeOf(value);
        if (prototype !== Object.prototype && prototype !== null) throw createError('CFG_INVALID_RAW_VALUE');
        const result = {};
        for (const key of Object.keys(value)) {
            const descriptor = Object.getOwnPropertyDescriptor(value, key);
            if (!descriptor || !('value' in descriptor)) throw createError('CFG_INVALID_RAW_VALUE');
            Object.defineProperty(result, key, {
                value: copyRawValue(descriptor.value, active),
                enumerable: true,
                writable: true,
                configurable: true,
            });
        }
        return Object.freeze(result);
    } finally {
        active.delete(value);
    }
}

