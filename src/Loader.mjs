// @ts-check
/**
 * @namespace TeqFw_Cfg_Loader
 * @description One-shot sequential Source orchestrator.
 */

export default class Loader {
  /**
   * @param {object} deps
   * @param {TeqFw_Cfg_Error$} deps.error
   * @param {TeqFw_Cfg_Key$} deps.key
   * @param {TeqFw_Cfg_Raw$} deps.raw
   * @param {TeqFw_Cfg_Source_Contract$} deps.contract
   * @param {TeqFw_Cfg_Store$} deps.store
   */
  constructor({ error, key, raw, contract, store }) {
    /** @type {Promise<void> | undefined} */
    let operation;
    /**
     * @param {unknown} sources
     * @returns {Promise<void>}
     */
    this.load = (sources) => {
      const state = store.getState();
      if (state === "loading") return /** @type {Promise<void>} */ (operation);
      if (state === "ready")
        return Promise.reject(error.create(error.codes.LOAD_ALREADY_READY));
      if (state === "failed") return Promise.reject(store.getFailure());
      /** @type {ReadonlyArray<TeqFw_Cfg_Source__Captured>} */
      let descriptors;
      try {
        descriptors = contract.capture(sources);
      } catch (reason) {
        const failure = error.is(reason)
          ? reason
          : error.create(error.codes.INVALID_SOURCE);
        store.beginLoading();
        store.fail(failure);
        operation = Promise.reject(failure);
        operation.catch(() => {});
        return operation;
      }
      store.beginLoading();
      operation = this.run(descriptors, store);
      operation.catch(() => {});
      return operation;
    };
    /**
     * @param {ReadonlyArray<TeqFw_Cfg_Source__Captured>} descriptors
     * @param {TeqFw_Cfg_Store$} target
     * @returns {Promise<void>}
     */
    this.run = async (descriptors, target) => {
      try {
        /** @type {Record<string, TeqFw_Cfg_RawValue>} */
        const merged = {};
        for (const descriptor of descriptors) {
          /** @type {unknown} */
          let result;
          try {
            result = await descriptor.load();
          } catch {
            throw error.create(error.codes.SOURCE_FAILED, {
              sourceId: descriptor.id,
            });
          }
          if (
            !Array.isArray(result) ||
            Object.getPrototypeOf(result) !== Array.prototype
          )
            throw error.create(error.codes.INVALID_ENTRY, {
              sourceId: descriptor.id,
            });
          for (let index = 0; index < result.length; index++) {
            if (!Object.prototype.hasOwnProperty.call(result, index))
              throw error.create(error.codes.INVALID_ENTRY, {
                sourceId: descriptor.id,
              });
            const entry = result[index];
            if (
              entry === null ||
              typeof entry !== "object" ||
              Array.isArray(entry) ||
              Object.getOwnPropertySymbols(entry).length ||
              Object.getOwnPropertyNames(entry).some(
                (name) => name !== "key" && name !== "value",
              ) ||
              !["key", "value"].every((name) =>
                Object.prototype.hasOwnProperty.call(entry, name),
              )
            )
              throw error.create(error.codes.INVALID_ENTRY, {
                sourceId: descriptor.id,
              });
            const keyDescriptor = Object.getOwnPropertyDescriptor(entry, "key"),
              valueDescriptor = Object.getOwnPropertyDescriptor(entry, "value");
            if (
              !keyDescriptor ||
              !valueDescriptor ||
              !keyDescriptor.enumerable ||
              !valueDescriptor.enumerable ||
              !("value" in keyDescriptor) ||
              !("value" in valueDescriptor) ||
              typeof keyDescriptor.value !== "string"
            )
              throw error.create(error.codes.INVALID_ENTRY, {
                sourceId: descriptor.id,
              });
            key.parse(keyDescriptor.value, { sourceId: descriptor.id });
            const value = raw.copy(valueDescriptor.value);
            Object.defineProperty(merged, keyDescriptor.value, {
              value,
              enumerable: true,
              writable: true,
              configurable: true,
            });
          }
        }
        target.publish(merged);
      } catch (reason) {
        const failure = error.is(reason)
          ? reason
          : error.create(error.codes.ILLEGAL_STATE);
        target.fail(failure);
        throw failure;
      }
    };
  }
}
export const __deps__ = Object.freeze({
  default: Object.freeze({
    error: "TeqFw_Cfg_Error$",
    key: "TeqFw_Cfg_Key$",
    raw: "TeqFw_Cfg_Raw$",
    contract: "TeqFw_Cfg_Source_Contract$",
    store: "TeqFw_Cfg_Store$",
  }),
});
