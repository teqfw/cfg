export interface PackageApiContract {
    readonly packageName: '@teqfw/cfg';
    readonly packageRole: string;
    readonly status: 'bootstrap';
    readonly canonicalEntrypoints: readonly string[];
    readonly operationalNotes: readonly string[];
}

export const PACKAGE_API: PackageApiContract = {
    packageName: '@teqfw/cfg',
    packageRole: 'TeqFW configuration contract for loading .env-backed settings and providing them through dependency injection.',
    status: 'bootstrap',
    canonicalEntrypoints: [],
    operationalNotes: [
        'The package has no supported runtime API while it is in bootstrap state.',
        'Do not rely on internal paths or undocumented behavior.',
    ],
};
