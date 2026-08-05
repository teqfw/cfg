// @ts-check
/**
 * @namespace TeqFw_Cfg_Source_DotenvFile
 * @description UTF-8 dotenv-file Source factory.
 */

export default class DotenvFileSource {
  /**
   * @param {object} deps
   * @param {TeqFw_Cfg_Source_Contract} deps.contract
   * @param {TeqFw_Cfg_Key} deps.key
   * @param {TeqFw_Cfg_Source_DotenvParser} deps.parser
   * @param {TeqFw_Cfg_Node_Fs__ReadFile} deps.readFile
   */
  constructor({ contract, key, parser, readFile }) {
    /**
     * @param {unknown} options
     * @returns {TeqFw_Cfg_Source__Captured}
     */
    this.create = (options) => {
      contract.assertRecord(options, "options");
      const record = /** @type {{path?: unknown, id?: unknown}} */ (options);
      if (typeof record.path !== "string" || record.path.length === 0)
        contract.invalidSource("path");
      const id = /** @type {string} */ (contract.assertId(record.id ?? "dotenv-file"));
      const path = /** @type {string} */ (record.path);
      return Object.freeze({
        id,
        async load() {
          const bytes = await readFile(path);
          const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
          const parsed = parser.parse(text);
          const result = [];
          for (const [name, value] of Object.entries(parsed))
            if (key.isComplete(name))
              result.push(Object.freeze({ key: name, value }));
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
    parser: "TeqFw_Cfg_Source_DotenvParser$",
    readFile: "node:fs/promises__readFile",
  }),
});
