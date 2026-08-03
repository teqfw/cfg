import {test, describe} from 'node:test';
import assert from 'node:assert/strict';
import {resolveCfg, customSource} from '../helpers/di.mjs';

const messages = {
    CFG_INVALID_SOURCE: 'Configuration source is invalid.',
    CFG_INVALID_ENTRY: 'Configuration source entry is invalid.',
    CFG_INVALID_SOURCE_ID: 'Configuration source identifier is invalid.',
    CFG_INVALID_KEY: 'Configuration key is invalid.',
    CFG_INVALID_RAW_VALUE: 'Configuration raw value is invalid.',
    CFG_SOURCE_FAILED: 'Configuration source failed.',
    CFG_STORE_EMPTY: 'Configuration store is empty.',
    CFG_STORE_LOADING: 'Configuration store is loading.',
    CFG_INVALID_NAMESPACE: 'Configuration namespace is invalid.',
    CFG_LOAD_ALREADY_READY: 'Configuration has already been loaded.',
    CFG_ILLEGAL_STATE: 'Configuration lifecycle transition is invalid.',
};

describe('stable package error table', () => {
    for (const [code, message] of Object.entries(messages)) {
        test(code, async () => {
            const {error: service} = await resolveCfg();
            const error = service.create(code, {field: 'safe'});
            assert.equal(error.code, code);
            assert.equal(error.message, message);
            assert.deepEqual(error.context, {field: 'safe'});
            assert.equal(Object.isFrozen(error.context), true);
        });
    }
});

test('representative public failures use documented codes and common messages', async () => {
    const scenarios = [
        ['invalid Source id', async (runtime) => {
            try { runtime.object.create({}, 'bad id'); } catch (error) { return error; }
        }, 'CFG_INVALID_SOURCE_ID'],
        ['invalid Source descriptor', async (runtime) => runtime.loader.load([{}]).catch((error) => error), 'CFG_INVALID_SOURCE'],
        ['invalid Source entry', async (runtime) => runtime.loader.load([customSource('bad', {})]).catch((error) => error), 'CFG_INVALID_ENTRY'],
        ['invalid complete key', async (runtime) => runtime.loader.load([customSource('bad', [{key: 'bad', value: 1}])]).catch((error) => error), 'CFG_INVALID_KEY'],
        ['invalid RawValue', async (runtime) => runtime.loader.load([customSource('bad', [{key: 'TEQFW_WEB__A', value: undefined}])]).catch((error) => error), 'CFG_INVALID_RAW_VALUE'],
        ['Source failure', async (runtime) => runtime.loader.load([customSource('bad', () => { throw new Error('secret'); })]).catch((error) => error), 'CFG_SOURCE_FAILED'],
        ['invalid namespace', async (runtime) => {
            try { runtime.reader.get('invalid'); } catch (error) { return error; }
        }, 'CFG_INVALID_NAMESPACE'],
    ];
    for (const [name, produce, code] of scenarios) {
        const error = await produce(await resolveCfg());
        assert.equal(error.code, code, name);
        assert.equal(error.message, messages[code], name);
    }
});

test('invalid namespace preserves the supplied namespace exactly', async () => {
    const {reader} = await resolveCfg();
    const suppliedNamespace = 'invalid namespace';
    assert.throws(() => reader.get(suppliedNamespace), (error) => {
        assert.equal(error.context.namespace, suppliedNamespace);
        return true;
    });
});

test('operational errors disclose no values, file contents, secrets, or tokens', async () => {
    const secret = 'TOKEN_super_secret_123';
    const {loader} = await resolveCfg();
    const error = await loader.load([customSource('safe-id', async () => {
        throw new Error(secret);
    })]).catch((reason) => reason);
    const publicText = `${error.message} ${JSON.stringify(error.context)}`;
    assert.equal(error.code, 'CFG_SOURCE_FAILED');
    assert.ok(!publicText.includes(secret));
    assert.deepEqual(error.context, {sourceId: 'safe-id'});
});

test('failed Store and later Loader calls retain the canonical error object', async () => {
    const {loader, reader, store} = await resolveCfg();
    const failure = await loader.load([customSource('bad', async () => {
        throw new Error('secret');
    })]).catch((error) => error);
    assert.strictEqual(store.getFailure(), failure);
    assert.throws(() => reader.get('TEQFW_WEB'), (error) => error === failure);
    assert.strictEqual(await loader.load([]).catch((error) => error), failure);
});
