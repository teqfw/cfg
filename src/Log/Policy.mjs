// @ts-check

/**
 * @namespace TeqFw_Cfg_Log_Policy
 * @description Applies cfg-resolved host policy files to the shared log-owned Policy.
 */

export default class Policy {
  /**
   * @param {object} deps
   * @param {TeqFw_Cfg_Reader} deps.reader
   * @param {TeqFw_Cfg_Log_Policy_File} deps.policyFile
   * @param {TeqFw_Cfg_Log_Policy_Resolve} deps.resolve
   */
  constructor({ reader, policyFile, resolve }) {
    /**
     * Applies the configured policy file. The conventional file is optional;
     * an explicit override is mandatory and any failure is propagated.
     * @param {TeqFw_Cfg_Log_Policy_Options} options
     * @returns {Promise<TeqFw_Cfg_Log_Policy_Result>}
     */
    this.apply = async (options) => {
      if (
        options === null ||
        typeof options !== "object" ||
        typeof options.appRoot !== "string" ||
        options.appRoot.length === 0
      )
        throw new Error("Logging policy application requires a non-empty appRoot.");
      const configuredPath = reader.get("TEQFW_LOG").POLICY_FILE;
      if (configuredPath !== undefined && (typeof configuredPath !== "string" || configuredPath.length === 0))
        throw new Error("TEQFW_LOG__POLICY_FILE must be a non-empty string.");
      const configured = configuredPath !== undefined;
      const path = configured ? configuredPath : resolve(options.appRoot, "etc", "log.policy");
      try {
        await policyFile.apply(path);
        return { path, configured, applied: true };
      } catch (error) {
        if (!configured && /** @type {{code?: unknown}} */ (error)?.code === "ENOENT") {
          return { path, configured, applied: false };
        }
        throw error;
      }
    };
    Object.freeze(this);
  }
}

export const __deps__ = Object.freeze({
  default: Object.freeze({
    reader: "TeqFw_Cfg_Reader$",
    policyFile: "TeqFw_Log_Policy_File$",
    resolve: "node:path__resolve",
  }),
});
