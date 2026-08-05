declare global {
    type TeqFw_Cfg_RawPrimitive = string | number | boolean | null;
    type TeqFw_Cfg_RawValue = TeqFw_Cfg_RawPrimitive | ReadonlyArray<TeqFw_Cfg_RawValue> | Readonly<Record<string, TeqFw_Cfg_RawValue>>;
    type TeqFw_Cfg_RawSnapshot = Readonly<Record<string, TeqFw_Cfg_RawValue>>;
    /** Detached raw namespace data; cfg does not freeze or cache returned fragments. */
    type TeqFw_Cfg_NamespaceFragment = Readonly<Record<string, TeqFw_Cfg_RawValue>>;
    type TeqFw_Cfg_RawEntry = Readonly<{key: string, value: TeqFw_Cfg_RawValue}>;
    /** Public custom Source contract. */
    type TeqFw_Cfg_Source = Readonly<{id: string, load: () => Promise<ReadonlyArray<TeqFw_Cfg_RawEntry>>}>;
    /** Source descriptor normalized by the internal contract service. */
    type TeqFw_Cfg_Source__Captured = Readonly<{id: string, load: () => unknown}>;
    type TeqFw_Cfg_Source_DotenvParser__Result = Readonly<{value: string, index: number}>;
    type TeqFw_Cfg_SourceFactory = Readonly<{create: (...args: readonly unknown[]) => TeqFw_Cfg_Source__Captured}>;
    type TeqFw_Cfg_Store_State = 'empty' | 'loading' | 'ready' | 'failed';
    type TeqFw_Cfg_ErrorCode = 'CFG_INVALID_SOURCE'|'CFG_INVALID_ENTRY'|'CFG_INVALID_SOURCE_ID'|'CFG_INVALID_KEY'|'CFG_INVALID_RAW_VALUE'|'CFG_SOURCE_FAILED'|'CFG_STORE_EMPTY'|'CFG_STORE_LOADING'|'CFG_INVALID_NAMESPACE'|'CFG_LOAD_ALREADY_READY'|'CFG_ILLEGAL_STATE';
    type TeqFw_Cfg_Error__DTO = Readonly<Error & {code: TeqFw_Cfg_ErrorCode, context: Readonly<Record<string, string>>}>;
    type TeqFw_Cfg_Key__Parsed = Readonly<{namespace: string, parameter: string}>;
    type TeqFw_Cfg_Error = typeof import('./src/Error.mjs').default;
    type TeqFw_Cfg_Error$ = InstanceType<TeqFw_Cfg_Error>;
    type TeqFw_Cfg_Enum_Error = typeof import('./src/Enum/Error.mjs').default;
    type TeqFw_Cfg_Key = typeof import('./src/Key.mjs').default;
    type TeqFw_Cfg_Key$ = InstanceType<TeqFw_Cfg_Key>;
    type TeqFw_Cfg_Loader = typeof import('./src/Loader.mjs').default;
    type TeqFw_Cfg_Loader$ = InstanceType<TeqFw_Cfg_Loader>;
    type TeqFw_Cfg_Reader = typeof import('./src/Reader.mjs').default;
    type TeqFw_Cfg_Reader$ = InstanceType<TeqFw_Cfg_Reader>;
    type TeqFw_Cfg_Raw = typeof import('./src/Raw.mjs').default;
    type TeqFw_Cfg_Raw$ = InstanceType<TeqFw_Cfg_Raw>;
    type TeqFw_Cfg_Store = typeof import('./src/Store.mjs').default;
    type TeqFw_Cfg_Store$ = InstanceType<TeqFw_Cfg_Store>;
    type TeqFw_Cfg_Source_Contract = typeof import('./src/Source/Contract.mjs').default;
    type TeqFw_Cfg_Source_Contract$ = InstanceType<TeqFw_Cfg_Source_Contract>;
    type TeqFw_Cfg_Source_DotenvParser = typeof import('./src/Source/DotenvParser.mjs').default;
    type TeqFw_Cfg_Source_DotenvParser$ = InstanceType<TeqFw_Cfg_Source_DotenvParser>;
    type TeqFw_Cfg_Source_Object = typeof import('./src/Source/Object.mjs').default;
    type TeqFw_Cfg_Source_Object$ = InstanceType<TeqFw_Cfg_Source_Object>;
    type TeqFw_Cfg_Source_ProcessEnv = typeof import('./src/Source/ProcessEnv.mjs').default;
    type TeqFw_Cfg_Source_ProcessEnv$ = InstanceType<TeqFw_Cfg_Source_ProcessEnv>;
    type TeqFw_Cfg_Source_DotenvFile = typeof import('./src/Source/DotenvFile.mjs').default;
    type TeqFw_Cfg_Source_DotenvFile$ = InstanceType<TeqFw_Cfg_Source_DotenvFile>;
}
export {};
