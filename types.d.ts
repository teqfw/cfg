declare global {
    type TeqFw_Cfg_RawPrimitive = string | number | boolean | null;
    type TeqFw_Cfg_RawValue = TeqFw_Cfg_RawPrimitive | ReadonlyArray<TeqFw_Cfg_RawValue> | Readonly<Record<string, TeqFw_Cfg_RawValue>>;
    type TeqFw_Cfg_RawSnapshot = Readonly<Record<string, TeqFw_Cfg_RawValue>>;
    type TeqFw_Cfg_NamespaceFragment = Readonly<Record<string, TeqFw_Cfg_RawValue>>;
    type TeqFw_Cfg_RawEntry = Readonly<{key: string, value: TeqFw_Cfg_RawValue}>;
    type TeqFw_Cfg_Source = Readonly<{id: string, load: () => Promise<ReadonlyArray<TeqFw_Cfg_RawEntry>>}>;
    type TeqFw_Cfg_Store_State = 'empty' | 'loading' | 'ready' | 'failed';
    type TeqFw_Cfg_ErrorCode =
        | 'CFG_INVALID_SOURCE'
        | 'CFG_INVALID_ENTRY'
        | 'CFG_INVALID_SOURCE_ID'
        | 'CFG_INVALID_KEY'
        | 'CFG_INVALID_RAW_VALUE'
        | 'CFG_SOURCE_FAILED'
        | 'CFG_STORE_EMPTY'
        | 'CFG_STORE_LOADING'
        | 'CFG_INVALID_NAMESPACE'
        | 'CFG_LOAD_ALREADY_READY'
        | 'CFG_ILLEGAL_STATE';
    type TeqFw_Cfg_Error = Readonly<{code: TeqFw_Cfg_ErrorCode, context: Readonly<Record<string, string>>}>;

    type TeqFw_Cfg_Loader = typeof import('./src/Loader.mjs').default;
    type TeqFw_Cfg_Loader$ = InstanceType<TeqFw_Cfg_Loader>;
    type TeqFw_Cfg_Reader = typeof import('./src/Reader.mjs').default;
    type TeqFw_Cfg_Reader$ = InstanceType<TeqFw_Cfg_Reader>;
    type TeqFw_Cfg_Store = typeof import('./src/Store.mjs').default;
    type TeqFw_Cfg_Store$ = InstanceType<TeqFw_Cfg_Store>;
}

export {};
