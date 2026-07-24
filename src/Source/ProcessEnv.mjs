// @ts-check
/**
 * @namespace TeqFw_Cfg_Source_ProcessEnv
 * @description Explicit process-environment Source factory.
 */

export default class ProcessEnvSource {
  /**
   * @param {object} deps
   * @param {TeqFw_Cfg_Source_Contract$} deps.contract
   * @param {TeqFw_Cfg_Key$} deps.key
   */
  constructor({ contract, key }) {
    /**
     * @param {unknown} environment
     * @param {unknown} id
     * @returns {TeqFw_Cfg_Source__Captured}
     */
    this.create = (environment, id = "process-env") => {
      contract.assertRecord(environment, "environment");
      const sourceId = /** @type {string} */ (contract.assertId(id));
      const record = /** @type {Record<string, unknown>} */ (environment);
      return Object.freeze({
        id: sourceId,
        async load() {
          const result = [];
          for (const name of Object.keys(record)) {
            if (!key.isComplete(name)) continue;
            const value = record[name];
            if (value === undefined) continue;
            if (typeof value !== "string")
              throw new Error("invalid environment value");
            result.push(Object.freeze({ key: name, value }));
          }
          return Object.freeze(result);
        },
      });
    };
  }
}
export const __deps__ = Object.freeze({
  default: Object.freeze({
    contract: "TeqFw_Cfg_Source_Contract$",
    key: "TeqFw_Cfg_Key$",
  }),
});
