// @ts-check

/**
 * @namespace TeqFw_Cfg_Reader
 * @description Synchronous namespace projection over the ready Store.
 */

export default class Reader {
    /**
     * @param {{store: TeqFw_Cfg_Store$}} deps
     */
    constructor({store}) {
        /** @param {string} namespace @returns {TeqFw_Cfg_NamespaceFragment} */
        this.get = function (namespace) {
            assertNamespace(namespace);
            const cached = cache.get(namespace);
            if (cached) return cached;
            const snapshot = store.getSnapshot();
            const fragment = {};
            for (const key of Object.keys(snapshot)) {
                const parsed = parseKey(key);
                if (parsed.namespace === namespace) {
                    Object.defineProperty(fragment, parsed.parameter, {
                        value: snapshot[key],
                        enumerable: true,
                        writable: true,
                        configurable: true,
                    });
                }
            }
            const frozen = Object.freeze(fragment);
            cache.set(namespace, frozen);
            return frozen;
        };
        /** @type {Map<string, TeqFw_Cfg_NamespaceFragment>} */
        const cache = new Map();
    }
}

const SEGMENT = '[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*';
const NAMESPACE_PATTERN = new RegExp(`^${SEGMENT}$`);
const COMPLETE_KEY_PATTERN = new RegExp(`^(${SEGMENT})__(${SEGMENT})$`);

/** @param {unknown} namespace */
function assertNamespace(namespace) {
    if (typeof namespace !== 'string' || !NAMESPACE_PATTERN.test(namespace)) {
        const error = createError('CFG_INVALID_NAMESPACE', typeof namespace === 'string' ? {namespace} : {});
        throw error;
    }
}

/** @param {string} key @returns {{namespace: string, parameter: string}} */
function parseKey(key) {
    const match = COMPLETE_KEY_PATTERN.exec(key);
    if (!match) throw createError('CFG_INVALID_KEY');
    return {namespace: match[1], parameter: match[2]};
}

/** @param {string} code */
function createError(code, context = {}) {
    const error = new Error('Configuration reader operation failed.');
    error.name = 'CfgError';
    Object.defineProperty(error, 'code', {value: code, enumerable: true});
    Object.defineProperty(error, 'context', {value: Object.freeze({}), enumerable: true, configurable: true});
    return Object.freeze(error);
}

export const __deps__ = Object.freeze({
    default: Object.freeze({store: 'TeqFw_Cfg_Store$'}),
});

