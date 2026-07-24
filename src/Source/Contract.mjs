// @ts-check
/**
 * @namespace TeqFw_Cfg_Source_Contract
 * @description Shared Source validation and descriptor service.
 */
const ID = /^[A-Za-z0-9][A-Za-z0-9._:/-]{0,127}$/;
export default class Contract {
  /**
   * @param {object} deps
   * @param {TeqFw_Cfg_Error$} deps.error
   */
  constructor({ error }) {
    /**
     * @param {unknown} id
     * @returns {string}
     */
    this.assertId = (id) => {
      if (typeof id !== "string" || !ID.test(id))
        throw error.create(error.codes.INVALID_SOURCE_ID);
      return id;
    };
    /**
     * @param {string} field
     * @returns {never}
     */
    this.invalidSource = (field) => {
      throw error.create(error.codes.INVALID_SOURCE, { field });
    };
    /**
     * @param {unknown} value
     * @param {string} field
     * @returns {void}
     */
    this.assertRecord = (value, field) => {
      if (value === null || typeof value !== "object" || Array.isArray(value))
        throw error.create(error.codes.INVALID_SOURCE, { field });
    };
    /**
     * @param {unknown} sources
     * @returns {ReadonlyArray<TeqFw_Cfg_Source__Captured>}
     */
    this.capture = (sources) => {
      if (
        !Array.isArray(sources) ||
        Object.getPrototypeOf(sources) !== Array.prototype
      )
        throw error.create(error.codes.INVALID_SOURCE);
      /** @type {TeqFw_Cfg_Source__Captured[]} */
      const result = [];
      const ids = new Set();
      for (let index = 0; index < sources.length; index++) {
        if (!Object.prototype.hasOwnProperty.call(sources, index))
          throw error.create(error.codes.INVALID_SOURCE);
        /** @type {{id?: unknown, load?: unknown}} */
        const source = sources[index];
        if (
          source === null ||
          (typeof source !== "object" && typeof source !== "function")
        )
          throw error.create(error.codes.INVALID_SOURCE);
        let id, load;
        try {
          id = source.id;
          load = source.load;
        } catch {
          throw error.create(error.codes.INVALID_SOURCE);
        }
        if (typeof load !== "function" || id === undefined)
          throw error.create(error.codes.INVALID_SOURCE);
        id = this.assertId(id);
        if (ids.has(id))
          throw error.create(error.codes.INVALID_SOURCE_ID, { sourceId: id });
        ids.add(id);
        result.push(
          Object.freeze({
            id,
            load: /** @type {() => unknown} */ (load.bind(source)),
          }),
        );
      }
      return Object.freeze(result);
    };
  }
}
export const __deps__ = Object.freeze({
  default: Object.freeze({ error: "TeqFw_Cfg_Error$" }),
});
