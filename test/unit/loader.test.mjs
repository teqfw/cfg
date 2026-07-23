// @ts-nocheck

import {test, describe} from 'node:test';
import assert from 'node:assert/strict';
import createObjectSource from '../../src/Source/Object.mjs';
import {assertCode, createHarness, deferred} from './helpers.mjs';

/** @param {string} id @param {readonly TeqFw_Cfg_RawEntry[]} entries @returns {TeqFw_Cfg_Source} */
function source(id, entries) {
    return Object.freeze({id, load: async () => entries});
}

describe('Loader lifecycle and merge', () => {
    test('loads no Sources and publishes an empty ready snapshot', async () => {
        const {loader, store, reader} = createHarness();
        await loader.load([]);
        assert.equal(store.state, 'ready');
        assert.deepEqual(reader.get('TEQFW_WEB'), {});
    });

    test('invokes Sources sequentially and later Sources replace complete keys', async () => {
        const events = [];
        const secondGate = deferred();
        const first = Object.freeze({
            id: 'first',
            load: async () => {
                events.push('first:start');
                events.push('first:end');
                return [{key: 'TEQFW_WEB__VALUE', value: {old: true}}, {key: 'TEQFW_WEB__KEEP', value: 'yes'}];
            },
        });
        const second = Object.freeze({
            id: 'second',
            load: async () => {
                events.push('second:start');
                await secondGate.promise;
                events.push('second:end');
                return [{key: 'TEQFW_WEB__VALUE', value: ['new']}, {key: 'TEQFW_WEB__NULL', value: null}];
            },
        });
        const {loader, reader} = createHarness();
        const operation = loader.load([first, second]);
        await new Promise((resolve) => setImmediate(resolve));
        assert.deepEqual(events, ['first:start', 'first:end', 'second:start']);
        secondGate.resolve();
        await operation;
        assert.deepEqual(reader.get('TEQFW_WEB'), {
            VALUE: ['new'],
            KEEP: 'yes',
            NULL: null,
        });
    });

    test('uses last declaration within one Source and rejects undefined', async () => {
        const {loader, reader} = createHarness();
        await loader.load([source('values', [
            {key: 'TEQFW_WEB__VALUE', value: 'first'},
            {key: 'TEQFW_WEB__VALUE', value: 'last'},
        ])]);
        assert.equal(reader.get('TEQFW_WEB').VALUE, 'last');

        const failed = createHarness();
        await assertCode(failed.loader.load([source('bad', [{key: 'TEQFW_WEB__VALUE', value: undefined}])]), 'CFG_INVALID_RAW_VALUE');
        assert.equal(failed.store.state, 'failed');
    });

    test('invalid keys are Loader-owned errors and do not reveal values', async () => {
        const {loader} = createHarness();
        const secret = 'top-secret-value';
        const error = await assert.rejects(loader.load([source('object', [{key: 'bad-key', value: secret}])]), (value) => {
            assert.equal(value.code, 'CFG_INVALID_KEY');
            assert.equal(value.context.sourceId, 'object');
            assert.equal(value.context.key, 'bad-key');
            assert.equal(value.message.includes(secret), false);
            return true;
        });
        assert.equal(error, undefined);
    });

    test('rejects invalid entries, cycles, accessors and unsupported prototypes', async () => {
        const cases = [
            [{key: 'TEQFW_WEB__VALUE', value: undefined}, 'CFG_INVALID_RAW_VALUE'],
            [{key: 'TEQFW_WEB__VALUE', value: () => 'x'}, 'CFG_INVALID_RAW_VALUE'],
            [{key: 'TEQFW_WEB__VALUE', value: Symbol('x')}, 'CFG_INVALID_RAW_VALUE'],
            [{key: 'TEQFW_WEB__VALUE', value: 1n}, 'CFG_INVALID_RAW_VALUE'],
            [{key: 'TEQFW_WEB__VALUE', value: new Date()}, 'CFG_INVALID_RAW_VALUE'],
        ];
        for (const [entry, code] of cases) {
            const {loader} = createHarness();
            await assertCode(loader.load([source('bad', [entry])]), code);
        }
        const cyclic = {};
        cyclic.self = cyclic;
        const cyclicHarness = createHarness();
        await assertCode(cyclicHarness.loader.load([source('cycle', [{key: 'TEQFW_WEB__VALUE', value: cyclic}])]), 'CFG_INVALID_RAW_VALUE');

        const accessor = {};
        Object.defineProperty(accessor, 'secret', {get: () => 'value', enumerable: true});
        const accessorHarness = createHarness();
        await assertCode(accessorHarness.loader.load([source('accessor', [{key: 'TEQFW_WEB__VALUE', value: accessor}])]), 'CFG_INVALID_RAW_VALUE');

        const classHarness = createHarness();
        await assertCode(classHarness.loader.load([source('class', [{key: 'TEQFW_WEB__VALUE', value: new (class Example {})()}])]), 'CFG_INVALID_RAW_VALUE');
    });

    test('does not publish partial state and normalizes operational failure', async () => {
        let called = false;
        const first = source('first', [{key: 'TEQFW_WEB__VALUE', value: 'kept-only-in-flight'}]);
        const failing = Object.freeze({id: 'failing', load: async () => { throw new Error('secret failure'); }});
        const later = Object.freeze({id: 'later', load: async () => { called = true; return []; }});
        const {loader, store, reader} = createHarness();
        const promise = loader.load([first, failing, later]);
        let error;
        await assert.rejects(promise, (value) => { error = value; return value.code === 'CFG_SOURCE_FAILED'; });
        assert.equal(store.state, 'failed');
        assert.equal(called, false);
        assert.throws(() => reader.get('TEQFW_WEB'), (value) => value === error);
    });
});

describe('Loader first-call ownership', () => {
    test('concurrent calls return the exact Promise and ignore later arguments', async () => {
        const gate = deferred();
        let laterInvoked = false;
        const firstSource = Object.freeze({
            id: 'first',
            load: async () => {
                await gate.promise;
                return [{key: 'TEQFW_WEB__VALUE', value: 'first'}];
            },
        });
        const laterSource = Object.freeze({
            id: 'later',
            load: async () => {
                laterInvoked = true;
                return [{key: 'TEQFW_WEB__VALUE', value: 'later'}];
            },
        });
        const {loader, reader} = createHarness();
        const first = loader.load([firstSource]);
        const second = loader.load([null, {id: 'bad id'}]);
        assert.equal(first, second);
        gate.resolve();
        await first;
        assert.equal(laterInvoked, false);
        assert.equal(reader.get('TEQFW_WEB').VALUE, 'first');
    });

    test('captures source array, order, id and load before execution', async () => {
        const gate = deferred();
        const calls = [];
        const first = {
            id: 'first',
            load: async () => {
                calls.push('first');
                await gate.promise;
                return [{key: 'TEQFW_WEB__VALUE', value: 'first'}];
            },
        };
        const replacement = {id: 'replacement', load: async () => { calls.push('replacement'); return []; }};
        const sources = [first];
        const operation = createHarness().loader;
        const promise = operation.load(sources);
        sources[0] = replacement;
        sources.push(replacement);
        first.id = 'changed';
        first.load = async () => { calls.push('changed'); return []; };
        gate.resolve();
        await promise;
        assert.deepEqual(calls, ['first']);
    });

    test('retains a canonical failure object across Loader and Reader', async () => {
        const failing = Object.freeze({id: 'failing', load: async () => { throw new Error('secret'); }});
        const {loader, reader} = createHarness();
        let initial;
        await assert.rejects(loader.load([failing]), (error) => {
            initial = error;
            return error.code === 'CFG_SOURCE_FAILED';
        });
        await assert.rejects(loader.load([]), (error) => error === initial);
        assert.throws(() => reader.get('TEQFW_WEB'), (error) => error === initial);
        await assert.rejects(loader.load([failing]), (error) => error === initial);
    });

    test('does not retry after failure and rejects ready reload', async () => {
        let calls = 0;
        const one = Object.freeze({id: 'one', load: async () => { calls += 1; return []; }});
        const {loader} = createHarness();
        await loader.load([one]);
        await assertCode(loader.load([one]), 'CFG_LOAD_ALREADY_READY');
        assert.equal(calls, 1);
    });

    test('detaches a resolved raw result before a later Source proceeds', async () => {
        const nested = {deep: {value: 'original'}};
        const result = [{key: 'TEQFW_WEB__VALUE', value: nested}];
        const gate = deferred();
        const first = Object.freeze({id: 'first', load: async () => result});
        const second = Object.freeze({id: 'second', load: async () => { nested.deep.value = 'mutated-after-detach'; await gate.promise; return []; }});
        const {loader, reader} = createHarness();
        const operation = loader.load([first, second]);
        await new Promise((resolve) => setImmediate(resolve));
        gate.resolve();
        await operation;
        assert.equal(reader.get('TEQFW_WEB').VALUE.deep.value, 'original');
    });
});

