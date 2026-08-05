// @ts-check
/**
 * @namespace TeqFw_Cfg_Reader
 * @description Synchronous detached namespace projection over Store.
 */

export default class Reader {
  /**
   * @param {object} deps
   * @param {TeqFw_Cfg_Error} deps.error
   * @param {TeqFw_Cfg_Key} deps.key
   * @param {TeqFw_Cfg_Raw} deps.raw
   * @param {TeqFw_Cfg_Store} deps.store
   */
  constructor({ error, key, raw, store }) {
    /**
     * @param {unknown} namespace
     * @returns {TeqFw_Cfg_NamespaceFragment}
     */
    this.get = (namespace) => {
      namespace = key.assertNamespace(namespace);
      /** @type {TeqFw_Cfg_RawSnapshot} */
      const snapshot = store.getSnapshot();
      /** @type {Record<string, TeqFw_Cfg_RawValue>} */
      const fragment = {};
      for (const name of Object.keys(snapshot)) {
        const parsed = key.parse(name);
        if (parsed.namespace === namespace)
          Object.defineProperty(fragment, parsed.parameter, {
            value: raw.copy(snapshot[name]),
            enumerable: true,
            writable: true,
            configurable: true,
          });
      }
      return fragment;
    };
  }
}
export const __deps__ = Object.freeze({
  default: Object.freeze({
    error: "TeqFw_Cfg_Error$",
    key: "TeqFw_Cfg_Key$",
    raw: "TeqFw_Cfg_Raw$",
    store: "TeqFw_Cfg_Store$",
  }),
});
