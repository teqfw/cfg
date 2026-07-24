import assert from 'node:assert/strict';
import ErrorService from '../../src/Error.mjs';
import Key from '../../src/Key.mjs';
import Raw from '../../src/Raw.mjs';
import Contract from '../../src/Source/Contract.mjs';
import DotenvParser from '../../src/Source/DotenvParser.mjs';
import Store from '../../src/Store.mjs';
import Loader from '../../src/Loader.mjs';
import Reader from '../../src/Reader.mjs';
import ObjectFactory from '../../src/Source/Object.mjs';
import ProcessEnvFactory from '../../src/Source/ProcessEnv.mjs';
import DotenvFileFactory from '../../src/Source/DotenvFile.mjs';

export async function resolveCfg() {
    const error = new ErrorService();
    const key = new Key({error});
    const raw = new Raw({error});
    const contract = new Contract({error});
    const parser = new DotenvParser();
    const store = new Store({error, raw});
    const loader = new Loader({error, key, raw, contract, store});
    const reader = new Reader({error, key, raw, store});
    const object = new ObjectFactory({contract});
    const processEnv = new ProcessEnvFactory({contract, key});
    const dotenv = new DotenvFileFactory({contract, key, parser});
    return {error, key, raw, contract, parser, loader, reader, store, object, processEnv, dotenv};
}

export function customSource(id, entriesOrLoad) {
    return {
        id,
        load: typeof entriesOrLoad === 'function'
            ? entriesOrLoad
            : async () => entriesOrLoad,
    };
}

export function deferred() {
    let resolve;
    let reject;
    const promise = new Promise((onResolve, onReject) => {
        resolve = onResolve;
        reject = onReject;
    });
    return {promise, resolve, reject};
}

export function assertCfgError(error, code, context = undefined) {
    assert.equal(error?.name, 'CfgError');
    assert.equal(error?.code, code);
    if (context !== undefined) assert.deepEqual(error.context, context);
    return true;
}

export async function rejectsCode(value, code, context = undefined) {
    await assert.rejects(value, (error) => assertCfgError(error, code, context));
}
