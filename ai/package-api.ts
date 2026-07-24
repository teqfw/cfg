export type ApiExposure = "public-runtime" | "public-structural" | "internal";

export interface MethodContract {
  readonly name: string;
  readonly signature: string;
  readonly summary: string;
  readonly constraints?: readonly string[];
}

export interface RuntimeComponentContract {
  readonly cdc: string;
  readonly role: string;
  readonly methods: readonly MethodContract[];
}

export interface StructuralContract {
  readonly name: string;
  readonly kind: "dto" | "protocol" | "enum" | "grammar";
  readonly summary: string;
  readonly fields?: Readonly<Record<string, string>>;
  readonly values?: Readonly<Record<string, string>>;
  readonly notes?: readonly string[];
}

export interface PackageApiContract {
  readonly packageName: "@teqfw/cfg";
  readonly packageRole: string;
  readonly composition: string;
  readonly publicRuntime: readonly RuntimeComponentContract[];
  readonly structuralContracts: readonly StructuralContract[];
  readonly operationalNotes: readonly string[];
}

/**
 * Supported DI contract for agents composing @teqfw/cfg in a TeqFW container.
 * This package intentionally has no JavaScript root export or package exports map.
 */
export const PACKAGE_API: PackageApiContract = {
  packageName: "@teqfw/cfg",
  packageRole:
    "TeqFW configuration plugin that loads ordered Sources into an immutable raw snapshot and exposes detached namespace projections.",
  composition:
    "Register package.json#teqfw namespace TeqFw_Cfg_ with @teqfw/di, then resolve the CDC components below.",
  publicRuntime: [
    {
      cdc: "TeqFw_Cfg_Loader$",
      role: "One-shot sequential Source orchestrator for the associated Store.",
      methods: [
        {
          name: "load",
          signature: "load(sources: readonly TeqFw_Cfg_Source[]): Promise<void>",
          summary: "Captures, sequentially loads, validates, merges, and atomically publishes Sources.",
          constraints: [
            "Only the first load may succeed; ready and failed states are terminal.",
            "Concurrent calls during loading return the same Promise.",
            "Later duplicate complete keys replace earlier values without deep merge.",
          ],
        },
      ],
    },
    {
      cdc: "TeqFw_Cfg_Reader$",
      role: "Synchronous namespace projection over the ready Store snapshot.",
      methods: [
        {
          name: "get",
          signature: "get(namespace: string): TeqFw_Cfg_NamespaceFragment",
          summary: "Returns a fresh detached mutable projection for one valid namespace.",
          constraints: [
            "Requires a ready Store.",
            "Returns an empty object for an absent valid namespace.",
            "Does not coerce values or validate application schema.",
          ],
        },
      ],
    },
    {
      cdc: "TeqFw_Cfg_Store$",
      role: "State owner for the immutable published raw snapshot.",
      methods: [
        { name: "getState", signature: "getState(): 'empty' | 'loading' | 'ready' | 'failed'", summary: "Reports current one-way lifecycle state." },
        { name: "getSnapshot", signature: "getSnapshot(): TeqFw_Cfg_RawSnapshot", summary: "Returns the stable deeply frozen snapshot when ready." },
      ],
    },
    {
      cdc: "TeqFw_Cfg_Source_Object$",
      role: "Factory for explicit programmatic Sources.",
      methods: [
        { name: "create", signature: "create(entries: Record<string, unknown>, id?: string): TeqFw_Cfg_Source", summary: "Creates a Source with id defaulting to 'object'." },
      ],
    },
    {
      cdc: "TeqFw_Cfg_Source_ProcessEnv$",
      role: "Factory for explicitly supplied process-environment Sources.",
      methods: [
        { name: "create", signature: "create(environment: Record<string, unknown>, id?: string): TeqFw_Cfg_Source", summary: "Creates a Source that emits complete cfg keys with string values; id defaults to 'process-env'." },
      ],
    },
    {
      cdc: "TeqFw_Cfg_Source_DotenvFile$",
      role: "Factory for UTF-8 dotenv-file Sources.",
      methods: [
        { name: "create", signature: "create({ path: string, id?: string }): TeqFw_Cfg_Source", summary: "Creates a lazily read dotenv Source; id defaults to 'dotenv-file'." },
      ],
    },
  ],
  structuralContracts: [
    {
      name: "Source",
      kind: "protocol",
      summary: "Custom source descriptor consumed by Loader.",
      fields: { id: "Unique identifier matching [A-Za-z0-9][A-Za-z0-9._:/-]{0,127}.", load: "() => Promise<ReadonlyArray<{key: string; value: RawValue}>>." },
    },
    {
      name: "RawValue",
      kind: "dto",
      summary: "Recursively copyable configuration value.",
      values: { accepted: "string | finite number | boolean | null | dense RawValue[] | plain record of RawValues", rejected: "undefined, non-finite number, bigint, symbol, function, cycles, custom instances, accessors, sparse arrays, and hidden or symbol properties" },
    },
    {
      name: "Configuration Key",
      kind: "grammar",
      summary: "Complete key addressed as NAMESPACE__PARAMETER.",
      values: { segment: "[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*", complete: "SEGMENT__SEGMENT" },
    },
    {
      name: "CfgError",
      kind: "dto",
      summary: "Frozen stable error with code and safe context.",
      fields: { name: '"CfgError"', code: "TeqFw_Cfg_ErrorCode", context: "Readonly<Record<string, string>>" },
    },
  ],
  operationalNotes: [
    "No package root import is supported; use the TeqFW DI namespace contract.",
    "Configuration is never read implicitly from process.env or a dotenv file.",
    "Store snapshots are immutable; Reader projections are detached and mutable.",
  ],
};
