// @ts-check
/** @namespace TeqFw_Cfg_Store @description Internal immutable snapshot state owner. */

export default class Store {
  /**
   * @param {object} deps
   * @param {object} deps.error
   * @param {object} deps.raw
   */
  constructor({ error, raw }) {
    let state = "empty",
      snapshot,
      failure;
    Object.defineProperty(this, "state", { get: () => state }); /**
     * @returns {any}
     */
    this.getState = () => state; /**
     * @returns {any}
     */
    this.beginLoading = () => {
      if (state !== "empty") throw error.create("CFG_ILLEGAL_STATE", { state });
      state = "loading";
    }; /**
     * @param {any} value
     * @returns {any}
     */
    this.publish = (value) => {
      if (state !== "loading")
        throw error.create("CFG_ILLEGAL_STATE", { state });
      snapshot = raw.copySnapshot(value);
      raw.deepFreeze(snapshot);
      state = "ready";
    }; /**
     * @param {any} value
     * @returns {any}
     */
    this.fail = (value) => {
      if (state !== "loading")
        throw error.create("CFG_ILLEGAL_STATE", { state });
      failure = value;
      state = "failed";
    }; /**
     * @returns {any}
     */
    this.getSnapshot = () => {
      if (state === "empty") throw error.create("CFG_STORE_EMPTY");
      if (state === "loading") throw error.create("CFG_STORE_LOADING");
      if (state === "failed") throw failure;
      return snapshot;
    }; /**
     * @returns {any}
     */
    this.getFailure = () => failure;
  }
}
export const __deps__ = Object.freeze({
  default: Object.freeze({ error: "TeqFw_Cfg_Error$", raw: "TeqFw_Cfg_Raw$" }),
});
