// @ts-check
/**
 * @namespace TeqFw_Cfg_Raw
 * @description Internal RawValue validation, copying, and freezing service.
 */

export default class Raw {
  /**
   * @param {object} deps
   * @param {TeqFw_Cfg_Error} deps.error
   */
  constructor({ error }) {
    /**
     * @param {unknown} value
     * @returns {TeqFw_Cfg_RawValue}
     */
    this.copy = (value) => {
      try {
        return copy(value, new WeakSet(), error);
      } catch (reason) {
        if (error.is(reason)) throw reason;
        throw error.create(error.codes.INVALID_RAW_VALUE);
      }
    };
    /**
     * @param {unknown} entries
     * @returns {TeqFw_Cfg_RawSnapshot}
     */
    this.copySnapshot = (entries) => {
      if (
        !isPlainRecord(entries) ||
        Object.getOwnPropertySymbols(entries).length
      )
        throw error.create(error.codes.INVALID_ENTRY);
      const result = {};
      for (const key of Object.getOwnPropertyNames(entries)) {
        const descriptor = Object.getOwnPropertyDescriptor(entries, key);
        if (!descriptor || !descriptor.enumerable || !("value" in descriptor))
          throw error.create(error.codes.INVALID_ENTRY);
        Object.defineProperty(result, key, {
          value: this.copy(descriptor.value),
          enumerable: true,
          writable: true,
          configurable: true,
        });
      }
      return result;
    };
    /**
     * @param {TeqFw_Cfg_RawValue} value
     * @returns {TeqFw_Cfg_RawValue}
     */
    this.deepFreeze = (value) => freeze(value, new WeakSet());
  }
}
/**
 * @param {unknown} value
 * @returns {value is Record<string, unknown>}
 */
function isPlainRecord(value) {
  const proto =
    value && typeof value === "object" && Object.getPrototypeOf(value);
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    (proto === Object.prototype || proto === null)
  );
}
/**
 * @param {TeqFw_Cfg_Error} error
 * @returns {never}
 */
function invalid(error) {
  throw error.create(error.codes.INVALID_RAW_VALUE);
}
/**
 * @param {unknown} value
 * @param {WeakSet<object>} active
 * @param {TeqFw_Cfg_Error} error
 * @returns {TeqFw_Cfg_RawValue}
 */
function copy(value, active, error) {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean" ||
    (typeof value === "number" && Number.isFinite(value))
  )
    return value;
  if (typeof value !== "object" || active.has(value)) invalid(error);
  active.add(value);
  try {
    if (Array.isArray(value)) {
      if (
        Object.getPrototypeOf(value) !== Array.prototype ||
        Object.getOwnPropertySymbols(value).length
      )
        invalid(error);
      const descriptors = Object.getOwnPropertyDescriptors(value);
      const length = value.length;
      if (
        !Number.isSafeInteger(length) ||
        length < 0 ||
        Object.keys(descriptors).some(
          (name) =>
            name !== "length" &&
            (!/^\d+$/.test(name) || Number(name) >= length),
        )
      )
        invalid(error);
      /** @type {TeqFw_Cfg_RawValue[]} */
      const result = [];
      for (let index = 0; index < length; index++) {
        const descriptor = descriptors[index];
        if (!descriptor || !descriptor.enumerable || !("value" in descriptor))
          invalid(error);
        result.push(copy(descriptor.value, active, error));
      }
      return result;
    }
    if (!isPlainRecord(value) || Object.getOwnPropertySymbols(value).length)
      invalid(error);
    /** @type {Record<string, TeqFw_Cfg_RawValue>} */
    const result = {};
    for (const name of Object.getOwnPropertyNames(value)) {
      const descriptor = Object.getOwnPropertyDescriptor(value, name);
      if (!descriptor || !descriptor.enumerable || !("value" in descriptor))
        invalid(error);
      Object.defineProperty(result, name, {
        value: copy(descriptor.value, active, error),
        enumerable: true,
        writable: true,
        configurable: true,
      });
    }
    return result;
  } finally {
    active.delete(value);
  }
}
/**
 * @param {TeqFw_Cfg_RawValue} value
 * @param {WeakSet<object>} seen
 * @returns {TeqFw_Cfg_RawValue}
 */
function freeze(value, seen) {
  if (value === null || typeof value !== "object" || seen.has(value)) return value;
  seen.add(value);
  for (const child of Object.values(value)) freeze(child, seen);
  return Object.freeze(value);
}
export const __deps__ = Object.freeze({
  default: Object.freeze({ error: "TeqFw_Cfg_Error$" }),
});
