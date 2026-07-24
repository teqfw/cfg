// @ts-check
/**
 * @namespace TeqFw_Cfg_Store
 * @description Internal immutable snapshot state owner.
 */

export default class Store {
  /**
   * @param {object} deps
   * @param {TeqFw_Cfg_Error$} deps.error
   * @param {TeqFw_Cfg_Raw$} deps.raw
   */
  constructor({ error, raw }) {
    /** @type {TeqFw_Cfg_Store_State} */
    let state = "empty";
    /** @type {TeqFw_Cfg_RawSnapshot | undefined} */
    let snapshot;
    /** @type {unknown} */
    let failure;
    Object.defineProperty(this, "state", { get: () => state });
    /**
     * @returns {TeqFw_Cfg_Store_State}
     */
    this.getState = () => state;
    /**
     * @returns {void}
     */
    this.beginLoading = () => {
      if (state !== "empty") throw error.create(error.codes.ILLEGAL_STATE, { state });
      state = "loading";
    };
    /**
     * @param {unknown} value
     * @returns {void}
     */
    this.publish = (value) => {
      if (state !== "loading")
        throw error.create(error.codes.ILLEGAL_STATE, { state });
      snapshot = raw.copySnapshot(value);
      raw.deepFreeze(snapshot);
      state = "ready";
    };
    /**
     * @param {unknown} value
     * @returns {void}
     */
    this.fail = (value) => {
      if (state !== "loading")
        throw error.create(error.codes.ILLEGAL_STATE, { state });
      failure = value;
      state = "failed";
    };
    /**
     * @returns {TeqFw_Cfg_RawSnapshot}
     */
    this.getSnapshot = () => {
      if (state === "empty") throw error.create(error.codes.STORE_EMPTY);
      if (state === "loading") throw error.create(error.codes.STORE_LOADING);
      if (state === "failed") throw failure;
      return /** @type {TeqFw_Cfg_RawSnapshot} */ (snapshot);
    };
    /**
     * @returns {unknown}
     */
    this.getFailure = () => failure;
  }
}
export const __deps__ = Object.freeze({
  default: Object.freeze({ error: "TeqFw_Cfg_Error$", raw: "TeqFw_Cfg_Raw$" }),
});
