// @ts-check

/**
 * @namespace TeqFw_Cfg_Loader
 * @description One-shot sequential Source orchestrator.
 */

export default class Loader {
    /**
     * @param {{store: TeqFw_Cfg_Store$}} deps
     */
    constructor({store}) {
        /** @type {Promise<void>|undefined} */
        let operation;
        /** @param {readonly TeqFw_Cfg_Source[]} sources @returns {Promise<void>} */
        this.load = function (sources) {
            const state = store.getState();
            if (state === 'loading') return /** @type {Promise<void>} */ (operation);
            if (state === 'ready') return Promise.reject(createError('CFG_LOAD_ALREADY_READY'));
            if (state === 'failed') return Promise.reject(store.getFailure());

            let descriptors;
            try {
                descriptors = captureDescriptors(sources);
            } catch (error) {
                const failure = isCfgError(error) ? error : createError('CFG_INVALID_SOURCE');
                store.beginLoading();
                store.fail(failure);
                const rejected = Promise.reject(failure);
                rejected.catch(() => {});
                operation = rejected;
                return rejected;
            }
            store.beginLoading();
            let resolveOperation = /** @type {(value?: void|PromiseLike<void>) => void} */ (() => {});
            /** @type {(reason?: unknown) => void} */
            let rejectOperation = (reason) => { void reason; };
            operation = new Promise((resolve, reject) => {
                resolveOperation = resolve;
                rejectOperation = reject;
            });
            void run(descriptors, store, resolveOperation, rejectOperation);
            return operation;
        };
    }
}

/**
 * @param {ReadonlyArray<{readonly id: string, readonly load: () => Promise<readonly TeqFw_Cfg_RawEntry[]>}>} descriptors
 * @param {TeqFw_Cfg_Store$} store
 * @param {(value?: void|PromiseLike<void>) => void} resolve
 * @param {(reason?: unknown) => void} reject
 * @returns {Promise<void>}
 */
async function run(descriptors, store, resolve, reject) {
    try {
        const {copyRawValue, parseCompleteKey} = await import('./Key.mjs');
        /** @type {Record<string, TeqFw_Cfg_RawValue>} */
        const merged = {};
        for (const descriptor of descriptors) {
            let result;
            try {
                result = await descriptor.load();
            } catch {
                throw createError('CFG_SOURCE_FAILED', {sourceId: descriptor.id});
            }
            const entries = detachEntries(result, descriptor.id, parseCompleteKey, copyRawValue);
            for (const entry of entries) {
                Object.defineProperty(merged, entry.key, {
                    value: entry.value,
                    enumerable: true,
                    writable: true,
                    configurable: true,
                });
            }
        }
        store.publish(merged);
        resolve();
    } catch (error) {
        const failure = isCfgError(error) ? error : createError('CFG_ILLEGAL_STATE');
        store.fail(failure);
        reject(failure);
    }
}

/**
 * @param {unknown} sources
 * @returns {ReadonlyArray<{readonly id: string, readonly load: () => Promise<readonly TeqFw_Cfg_RawEntry[]>}>}
 */
function captureDescriptors(sources) {
    if (!Array.isArray(sources) || Object.getPrototypeOf(sources) !== Array.prototype) throw createError('CFG_INVALID_SOURCE');
    const descriptors = [];
    const ids = new Set();
    for (let index = 0; index < sources.length; index += 1) {
        if (!Object.prototype.hasOwnProperty.call(sources, index)) throw createError('CFG_INVALID_SOURCE');
        const source = sources[index];
        if ((source === null) || ((typeof source !== 'object') && (typeof source !== 'function'))) throw createError('CFG_INVALID_SOURCE');
        let id;
        let load;
        try {
            id = source.id;
            load = source.load;
        } catch {
            throw createError('CFG_INVALID_SOURCE');
        }
        if (typeof id !== 'string' || id.length < 1 || id.length > 128 || !/^[A-Za-z0-9][A-Za-z0-9._:/-]{0,127}$/.test(id)) {
            throw createError('CFG_INVALID_SOURCE_ID');
        }
        if (ids.has(id)) throw createError('CFG_INVALID_SOURCE_ID', {sourceId: id});
        if (typeof load !== 'function') throw createError('CFG_INVALID_SOURCE');
        ids.add(id);
        descriptors.push(Object.freeze({id, load: load.bind(source)}));
    }
    return Object.freeze(descriptors);
}

/**
 * @param {unknown} result
 * @param {string} sourceId
 * @param {(key: unknown, context?: Readonly<Record<string, string>>) => {namespace: string, parameter: string}} parseCompleteKey
 * @param {(value: unknown) => TeqFw_Cfg_RawValue} copyRawValue
 */
function detachEntries(result, sourceId, parseCompleteKey, copyRawValue) {
    if (!Array.isArray(result) || Object.getPrototypeOf(result) !== Array.prototype) throw createError('CFG_INVALID_ENTRY', {sourceId});
    const entries = [];
    for (let index = 0; index < result.length; index += 1) {
        if (!Object.prototype.hasOwnProperty.call(result, index)) throw createError('CFG_INVALID_ENTRY', {sourceId});
        const entry = result[index];
        if ((entry === null) || (typeof entry !== 'object') || Array.isArray(entry) ||
            (Object.getPrototypeOf(entry) !== Object.prototype && Object.getPrototypeOf(entry) !== null)) {
            throw createError('CFG_INVALID_ENTRY', {sourceId});
        }
        const descriptors = Object.getOwnPropertyDescriptors(entry);
        if (Object.getOwnPropertySymbols(entry).length > 0 ||
            Object.keys(descriptors).some((name) => name !== 'key' && name !== 'value')) throw createError('CFG_INVALID_ENTRY', {sourceId});
        const keyDescriptor = descriptors.key;
        const valueDescriptor = descriptors.value;
        if (!keyDescriptor || !valueDescriptor || !('value' in keyDescriptor) || !('value' in valueDescriptor)) throw createError('CFG_INVALID_ENTRY', {sourceId});
        if (typeof keyDescriptor.value !== 'string') throw createError('CFG_INVALID_ENTRY', {sourceId});
        parseCompleteKey(keyDescriptor.value, {sourceId});
        entries.push(Object.freeze({key: keyDescriptor.value, value: copyRawValue(valueDescriptor.value)}));
    }
    return Object.freeze(entries);
}

/** @param {unknown} error @returns {error is Error} */
function isCfgError(error) {
    return error instanceof Error && typeof (/** @type {{code?: unknown}} */ (error)).code === 'string' && error.name === 'CfgError';
}

/** @param {string} code @param {Readonly<Record<string, string>>} [context] */
function createError(code, context = {}) {
    const messages = /** @type {Readonly<Record<string, string>>} */ ({
        CFG_INVALID_SOURCE: 'Configuration source is invalid.',
        CFG_INVALID_ENTRY: 'Configuration source entry is invalid.',
        CFG_INVALID_SOURCE_ID: 'Configuration source identifier is invalid.',
        CFG_SOURCE_FAILED: 'Configuration source failed.',
        CFG_INVALID_KEY: 'Configuration key is invalid.',
        CFG_INVALID_RAW_VALUE: 'Configuration raw value is invalid.',
        CFG_ILLEGAL_STATE: 'Configuration lifecycle transition is invalid.',
        CFG_LOAD_ALREADY_READY: 'Configuration has already been loaded.',
    });
    const error = new Error(messages[code] ?? 'Configuration operation failed.');
    error.name = 'CfgError';
    Object.defineProperty(error, 'code', {value: code, enumerable: true});
    Object.defineProperty(error, 'context', {value: Object.freeze({...context}), enumerable: true});
    return Object.freeze(error);
}

export const __deps__ = Object.freeze({
    default: Object.freeze({store: 'TeqFw_Cfg_Store$'}),
});

