// @ts-check
/**
 * @namespace TeqFw_Cfg_Error
 * @description Internal construction of safe, stable cfg errors.
 */

const MESSAGES = Object.freeze({
  CFG_INVALID_SOURCE: "Configuration source is invalid.",
  CFG_INVALID_ENTRY: "Configuration source entry is invalid.",
  CFG_INVALID_SOURCE_ID: "Configuration source identifier is invalid.",
  CFG_INVALID_KEY: "Configuration key is invalid.",
  CFG_INVALID_RAW_VALUE: "Configuration raw value is invalid.",
  CFG_SOURCE_FAILED: "Configuration source failed.",
  CFG_STORE_EMPTY: "Configuration store is empty.",
  CFG_STORE_LOADING: "Configuration store is loading.",
  CFG_INVALID_NAMESPACE: "Configuration namespace is invalid.",
  CFG_LOAD_ALREADY_READY: "Configuration has already been loaded.",
  CFG_ILLEGAL_STATE: "Configuration lifecycle transition is invalid.",
});
/**
 * @this {TeqFw_Cfg_Error}
 * @param {object} deps
 * @param {TeqFw_Cfg_Enum_Error} deps.codes
 */
export default function ErrorService(
  /** @type {{codes: TeqFw_Cfg_Enum_Error}} */ { codes },
) {
  this.codes = codes;
  /**
   * @param {TeqFw_Cfg_ErrorCode} code
   * @param {Readonly<Record<string, string>>} context
   * @returns {TeqFw_Cfg_Error__DTO}
   */
  this.create = function (code, context = {}) {
    const error = new globalThis.Error(
      MESSAGES[code] ?? "Configuration operation failed.",
    );
    error.name = "CfgError";
    Object.defineProperty(error, "code", { value: code, enumerable: true });
    Object.defineProperty(error, "context", {
      value: Object.freeze({ ...context }),
      enumerable: true,
    });
    return /** @type {TeqFw_Cfg_Error__DTO} */ (Object.freeze(error));
  };
  /**
   * @param {unknown} error
   * @returns {error is TeqFw_Cfg_Error__DTO}
   */
  this.is = function (error) {
    const candidate = /** @type {TeqFw_Cfg_Error__DTO} */ (error);
    return (
      error instanceof globalThis.Error &&
      error.name === "CfgError" &&
      typeof candidate.code === "string"
    );
  };
}
export const __deps__ = Object.freeze({
  default: Object.freeze({ codes: "TeqFw_Cfg_Enum_Error" }),
});
