import {test} from 'node:test';
import assert from 'node:assert/strict';
import {resolveCfg, customSource, deferred} from '../helpers/di.mjs';

test('winning load executes Sources sequentially, replaces whole keys, and publishes once', async () => {
    const {loader, reader, store} = await resolveCfg();
    const events = [];
    await loader.load([
        customSource('first', async () => {
            events.push('first:start');
            events.push('first:end');
            return [
                {key: 'TEQFW_WEB__VALUE', value: {old: true}},
                {key: 'TEQFW_WEB__ONLY_FIRST', value: 1},
            ];
        }),
        customSource('second', async () => {
            events.push('second:start');
            events.push('second:end');
            return [{key: 'TEQFW_WEB__VALUE', value: {new: true}}];
        }),
    ]);
    assert.deepEqual(events, ['first:start', 'first:end', 'second:start', 'second:end']);
    assert.deepEqual(reader.get('TEQFW_WEB'), {VALUE: {new: true}, ONLY_FIRST: 1});
    assert.strictEqual(store.getSnapshot(), store.getSnapshot());
});

test('Store remains loading and exposes no partial snapshot before all Sources finish', async () => {
    const {loader, reader, store} = await resolveCfg();
    const gate = deferred();
    const operation = loader.load([
        customSource('first', [{key: 'TEQFW_WEB__A', value: 'ready'}]),
        customSource('delayed', async () => {
            await gate.promise;
            return [];
        }),
    ]);
    await Promise.resolve();
    assert.equal(store.getState(), 'loading');
    assert.throws(() => reader.get('TEQFW_WEB'), (error) => error.code === 'CFG_STORE_LOADING');
    gate.resolve();
    await operation;
});

test('concurrent calls return the identical Promise and ignore later arguments', async () => {
    const {loader, store} = await resolveCfg();
    const gate = deferred();
    let secondReads = 0;
    const invalidSecond = [];
    Object.defineProperty(invalidSecond, 0, {
        enumerable: true,
        get() {
            secondReads++;
            throw new Error('must not inspect');
        },
    });
    invalidSecond.length = 1;
    const first = loader.load([customSource('winner', async () => {
        await gate.promise;
        return [];
    })]);
    const second = loader.load(invalidSecond);
    assert.strictEqual(first, second);
    assert.equal(secondReads, 0);
    gate.resolve();
    await first;
    assert.equal(store.getState(), 'ready');
});

test('winning descriptors are captured before load returns', async () => {
    const {loader, reader} = await resolveCfg();
    const gate = deferred();
    const calls = [];
    const first = {
        id: 'first',
        async load() {
            calls.push('first');
            await gate.promise;
            return [{key: 'TEQFW_WEB__A', value: 1}];
        },
    };
    const second = {
        id: 'second',
        async load() {
            calls.push('second');
            return [{key: 'TEQFW_WEB__B', value: 2}];
        },
    };
    const sources = [first, second];
    const operation = loader.load(sources);
    sources.reverse();
    sources[0] = customSource('replacement', () => {
        throw new Error('must not run');
    });
    first.id = 'changed';
    first.load = async () => [];
    second.id = 'changed-too';
    second.load = async () => [];
    gate.resolve();
    await operation;
    assert.deepEqual(calls, ['first', 'second']);
    assert.deepEqual(reader.get('TEQFW_WEB'), {A: 1, B: 2});
});

test('Source results are detached immediately after each resolution', async () => {
    const {loader, reader} = await resolveCfg();
    const gate = deferred();
    const returned = {nested: {value: 1}};
    const operation = loader.load([
        customSource('first', [{key: 'TEQFW_WEB__DATA', value: returned}]),
        customSource('delayed', async () => {
            await gate.promise;
            return [];
        }),
    ]);
    await Promise.resolve();
    await Promise.resolve();
    returned.nested.value = 99;
    gate.resolve();
    await operation;
    assert.equal(reader.get('TEQFW_WEB').DATA.nested.value, 1);
});

test('ready and failed states are terminal', async () => {
    const successful = await resolveCfg();
    let successCalls = 0;
    await successful.loader.load([customSource('once', async () => {
        successCalls++;
        return [];
    })]);
    const readyError = await successful.loader.load([customSource('again', async () => {
        successCalls++;
        return [];
    })]).catch((error) => error);
    assert.equal(readyError.code, 'CFG_LOAD_ALREADY_READY');
    assert.equal(successCalls, 1);

    const failed = await resolveCfg();
    let failure;
    await assert.rejects(failed.loader.load([customSource('bad', async () => {
        throw new Error('secret');
    })]), (error) => {
        failure = error;
        return true;
    });
    let retryCalls = 0;
    const retryError = await failed.loader.load([customSource('retry', async () => {
        retryCalls++;
        return [];
    })]).catch((error) => error);
    assert.strictEqual(retryError, failure);
    assert.throws(() => failed.reader.get('TEQFW_WEB'), (error) => error === failure);
    assert.equal(retryCalls, 0);
});

test('duplicate Source identifiers and malformed winning descriptors fail before execution', async () => {
    const duplicate = await resolveCfg();
    let calls = 0;
    const source = customSource('same', async () => {
        calls++;
        return [];
    });
    await assert.rejects(duplicate.loader.load([source, source]), (error) => {
        assert.equal(error.code, 'CFG_INVALID_SOURCE_ID');
        assert.deepEqual(error.context, {sourceId: 'same'});
        return true;
    });
    assert.equal(calls, 0);

    for (const sources of [null, {}, [null], [{id: 'ok'}], Array(1)]) {
        const runtime = await resolveCfg();
        await assert.rejects(runtime.loader.load(sources), (error) => error.code === 'CFG_INVALID_SOURCE');
    }
});
