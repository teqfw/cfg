import {test, describe} from 'node:test';
import assert from 'node:assert/strict';
import {resolveCfg, rejectsCode} from '../helpers/di.mjs';

describe('common Source contract', () => {
    const invalidIds = ['', ' leading', 'trailing ', 'a'.repeat(129), 'bad?char'];
    for (const id of invalidIds) {
        test(`rejects invalid Source id ${JSON.stringify(id)}`, async () => {
            const {object} = await resolveCfg();
            assert.throws(() => object.create({}, id), (error) => {
                assert.equal(error.code, 'CFG_INVALID_SOURCE_ID');
                if (id !== '') assert.ok(!error.message.includes(id));
                return true;
            });
        });
    }

    test('accepts a safe maximum-length Source id', async () => {
        const {object} = await resolveCfg();
        assert.equal(object.create({}, 'a'.repeat(128)).id, 'a'.repeat(128));
    });
});

test('ObjectSource defers getters, returns every own enumerable key, and preserves input', async () => {
    const {object} = await resolveCfg();
    let reads = 0;
    const parent = {TEQFW_WEB__INHERITED: 'no'};
    const entries = Object.create(parent);
    Object.defineProperty(entries, 'TEQFW_WEB__VALUE', {
        enumerable: true,
        get() {
            reads++;
            return {nested: true};
        },
    });
    entries.invalid = 'reported by Loader';
    const source = object.create(entries);
    assert.equal(reads, 0);
    const result = await source.load();
    assert.equal(reads, 1);
    assert.deepEqual(result.map(({key}) => key), ['TEQFW_WEB__VALUE', 'invalid']);
    assert.equal(Object.hasOwn(entries, 'TEQFW_WEB__VALUE'), true);
});

test('ObjectSource getter failure occurs during load and is normalized by Loader', async () => {
    const {object, loader} = await resolveCfg();
    const entries = {};
    Object.defineProperty(entries, 'TEQFW_WEB__TOKEN', {
        enumerable: true,
        get() {
            throw new Error('super-secret');
        },
    });
    const source = object.create(entries, 'programmatic');
    await rejectsCode(loader.load([source]), 'CFG_SOURCE_FAILED', {sourceId: 'programmatic'});
});

test('ObjectSource leaves complete-key validation to Loader', async () => {
    const {object, loader} = await resolveCfg();
    await rejectsCode(loader.load([object.create({invalid: 'secret'})]), 'CFG_INVALID_KEY', {
        key: 'invalid',
        sourceId: 'object',
    });
});

test('ProcessEnvSource defers getters, filters unrelated and inherited names, and returns strings', async () => {
    const {processEnv} = await resolveCfg();
    let reads = 0;
    const environment = Object.create({TEQFW_WEB__INHERITED: 'no'});
    Object.defineProperty(environment, 'TEQFW_WEB__TEXT', {
        enumerable: true,
        get() {
            reads++;
            return '42';
        },
    });
    environment.UNRELATED = 'ignored';
    const source = processEnv.create(environment);
    assert.equal(reads, 0);
    assert.deepEqual(await source.load(), [{key: 'TEQFW_WEB__TEXT', value: '42'}]);
    assert.equal(reads, 1);
    assert.equal(environment.UNRELATED, 'ignored');
});

test('ProcessEnvSource uses only the explicitly supplied environment record', async () => {
    const {processEnv} = await resolveCfg();
    const hostName = 'TEQFW_ACCEPTANCE__HOST_ONLY';
    const before = process.env[hostName];
    process.env[hostName] = 'must-not-be-read';
    try {
        assert.deepEqual(await processEnv.create({}).load(), []);
    } finally {
        if (before === undefined) delete process.env[hostName];
        else process.env[hostName] = before;
    }
});
