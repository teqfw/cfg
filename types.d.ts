declare global {
    type TeqFw_Cfg_Enum_Error = typeof import('./src/Enum/Error.mjs').default;
    type TeqFw_Cfg_Error = InstanceType<typeof import('./src/Error.mjs').default>;
    type TeqFw_Cfg_ErrorCode = 'CFG_INVALID_SOURCE'|'CFG_INVALID_ENTRY'|'CFG_INVALID_SOURCE_ID'|'CFG_INVALID_KEY'|'CFG_INVALID_RAW_VALUE'|'CFG_SOURCE_FAILED'|'CFG_STORE_EMPTY'|'CFG_STORE_LOADING'|'CFG_INVALID_NAMESPACE'|'CFG_LOAD_ALREADY_READY'|'CFG_ILLEGAL_STATE';
    type TeqFw_Cfg_Error__Class = typeof import('./src/Error.mjs').default;
    type TeqFw_Cfg_Error__DTO = Readonly<Error & {code: TeqFw_Cfg_ErrorCode, context: Readonly<Record<string, string>>}>;
    type TeqFw_Cfg_Key = import('./src/Key.mjs').default;
    type TeqFw_Cfg_Key__Class = typeof import('./src/Key.mjs').default;
    type TeqFw_Cfg_Key__Parsed = Readonly<{namespace: string, parameter: string}>;
    type TeqFw_Cfg_Loader = import('./src/Loader.mjs').default;
    type TeqFw_Cfg_Loader__Class = typeof import('./src/Loader.mjs').default;
    /** Detached raw namespace data; cfg does not freeze or cache returned fragments. */
    type TeqFw_Cfg_NamespaceFragment = Readonly<Record<string, TeqFw_Cfg_RawValue>>;
    type TeqFw_Cfg_Node_Fs__ReadFile = (path: string) => Promise<Uint8Array>;
    type TeqFw_Cfg_Raw = import('./src/Raw.mjs').default;
    type TeqFw_Cfg_RawEntry = Readonly<{key: string, value: TeqFw_Cfg_RawValue}>;
    type TeqFw_Cfg_RawPrimitive = string | number | boolean | null;
    type TeqFw_Cfg_RawSnapshot = Readonly<Record<string, TeqFw_Cfg_RawValue>>;
    type TeqFw_Cfg_RawValue = TeqFw_Cfg_RawPrimitive | ReadonlyArray<TeqFw_Cfg_RawValue> | Readonly<Record<string, TeqFw_Cfg_RawValue>>;
    type TeqFw_Cfg_Raw__Class = typeof import('./src/Raw.mjs').default;
    type TeqFw_Cfg_Reader = import('./src/Reader.mjs').default;
    type TeqFw_Cfg_Reader__Class = typeof import('./src/Reader.mjs').default;
    /** Public custom Source contract. */
    type TeqFw_Cfg_Source = Readonly<{id: string, load: () => Promise<ReadonlyArray<TeqFw_Cfg_RawEntry>>}>;
    type TeqFw_Cfg_SourceFactory = Readonly<{create: (...args: readonly unknown[]) => TeqFw_Cfg_Source__Captured}>;
    type TeqFw_Cfg_Source_Contract = import('./src/Source/Contract.mjs').default;
    type TeqFw_Cfg_Source_Contract__Class = typeof import('./src/Source/Contract.mjs').default;
    type TeqFw_Cfg_Source_DotenvFile = import('./src/Source/DotenvFile.mjs').default;
    type TeqFw_Cfg_Source_DotenvFile__Class = typeof import('./src/Source/DotenvFile.mjs').default;
    type TeqFw_Cfg_Source_DotenvParser = InstanceType<typeof import('./src/Source/DotenvParser.mjs').default>;
    type TeqFw_Cfg_Source_DotenvParser__Class = typeof import('./src/Source/DotenvParser.mjs').default;
    type TeqFw_Cfg_Source_DotenvParser__Result = Readonly<{value: string, index: number}>;
    type TeqFw_Cfg_Source_Object = import('./src/Source/Object.mjs').default;
    type TeqFw_Cfg_Source_Object__Class = typeof import('./src/Source/Object.mjs').default;
    type TeqFw_Cfg_Source_ProcessEnv = import('./src/Source/ProcessEnv.mjs').default;
    type TeqFw_Cfg_Source_ProcessEnv__Class = typeof import('./src/Source/ProcessEnv.mjs').default;
    /** Source descriptor normalized by the internal contract service. */
    type TeqFw_Cfg_Source__Captured = Readonly<{id: string, load: () => unknown}>;
    type TeqFw_Cfg_Store = import('./src/Store.mjs').default;
    type TeqFw_Cfg_Store_State = 'empty' | 'loading' | 'ready' | 'failed';
    type TeqFw_Cfg_Store__Class = typeof import('./src/Store.mjs').default;
}
export {};
