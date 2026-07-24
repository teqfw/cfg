// @ts-check
/**
 * @namespace TeqFw_Cfg_Key
 * @description Internal key and namespace grammar service.
 */

const SEGMENT = "[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*";
const NAMESPACE = new RegExp("^" + SEGMENT + "$");
const COMPLETE = new RegExp("^(" + SEGMENT + ")__(" + SEGMENT + ")$");
export default class Key {
  /**
   * @param {object} deps
   * @param {TeqFw_Cfg_Error$} deps.error
   */
  constructor({ error }) {
    /**
     * @param {unknown} value
     * @returns {boolean}
     */
    this.isComplete = (value) =>
      typeof value === "string" && COMPLETE.test(value);
    /**
     * @param {unknown} value
     * @param {Readonly<Record<string, string>>} context
     * @returns {TeqFw_Cfg_Key__Parsed}
     */
    this.parse = (value, context = {}) => {
      if (typeof value !== "string" || !COMPLETE.test(value))
        throw error.create(
          error.codes.INVALID_KEY,
          typeof value === "string" ? { key: value, ...context } : context,
        );
      const boundary = value.indexOf("__");
      return {
        namespace: value.slice(0, boundary),
        parameter: value.slice(boundary + 2),
      };
    };
    /**
     * @param {unknown} value
     * @returns {string}
     */
    this.assertNamespace = (value) => {
      if (typeof value !== "string" || !NAMESPACE.test(value))
        throw error.create(
          error.codes.INVALID_NAMESPACE,
          typeof value === "string" ? { namespace: value } : {},
        );
      return value;
    };
  }
}
export const __deps__ = Object.freeze({
  default: Object.freeze({ error: "TeqFw_Cfg_Error$" }),
});
