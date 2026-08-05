// @ts-check
/**
 * @namespace TeqFw_Cfg_Source_Object
 * @description Explicit programmatic Source factory.
 */

export default class ObjectSource {
  /**
   * @param {object} deps
   * @param {TeqFw_Cfg_Source_Contract} deps.contract
   */
  constructor({ contract }) {
    /**
     * @param {unknown} entries
     * @param {unknown} id
     * @returns {TeqFw_Cfg_Source__Captured}
     */
    this.create = (entries, id = "object") => {
      contract.assertRecord(entries, "entries");
      const sourceId = /** @type {string} */ (contract.assertId(id));
      const record = /** @type {Record<string, unknown>} */ (entries);
      return Object.freeze({
        id: sourceId,
        async load() {
          const result = [];
          for (const key of Object.keys(record))
            result.push(Object.freeze({ key, value: record[key] }));
          return Object.freeze(result);
        },
      });
    };
  }
}
export const __deps__ = Object.freeze({
  default: Object.freeze({ contract: "TeqFw_Cfg_Source_Contract$" }),
});
