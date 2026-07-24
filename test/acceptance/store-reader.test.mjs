import {test} from 'node:test';
import assert from 'node:assert/strict';
import {resolveCfg} from '../helpers/di.mjs';

test('Store owns one deeply frozen stable snapshot', async () => {
    const {loader, store, object} = await resolveCfg();
    await loader.load([object.create({TEQFW_WEB__NESTED: {array: [{value: 1}]}})]);
    const snapshot = store.getSnapshot();
    assert.equal(Object.isFrozen(snapshot), true);
    assert.equal(Object.isFrozen(snapshot.TEQFW_WEB__NESTED), true);
    assert.equal(Object.isFrozen(snapshot.TEQFW_WEB__NESTED.array), true);
    assert.equal(Object.isFrozen(snapshot.TEQFW_WEB__NESTED.array[0]), true);
    assert.strictEqual(store.getSnapshot(), snapshot);
});

test('Reader validates namespace grammar and preserves supplied invalid namespace context', async () => {
    const {loader, reader} = await resolveCfg();
    await loader.load([]);
    for (const namespace of ['', 'teqfw', 'TEQFW__WEB', ' TEQFW', 'TEQFW ']) {
        assert.throws(() => reader.get(namespace), (error) => {
            assert.equal(error.code, 'CFG_INVALID_NAMESPACE');
            assert.equal(error.context.namespace, namespace);
            return true;
        });
    }
});

test('Reader selects exact namespace, strips one prefix, and treats parameter as opaque', async () => {
    const {loader, reader, object} = await resolveCfg();
    await loader.load([object.create({
        TEQFW_WEB__A_B: 'text',
        TEQFW_WEB2__A: 'other',
        TEQFW_WEB__NUMBER: '42',
        TEQFW_WEB__BOOL: 'true',
    })]);
    assert.deepEqual(reader.get('TEQFW_WEB'), {A_B: 'text', NUMBER: '42', BOOL: 'true'});
});

test('Reader returns a fresh empty object for an absent valid namespace', async () => {
    const {loader, reader} = await resolveCfg();
    await loader.load([]);
    const first = reader.get('TEQFW_MISSING');
    const second = reader.get('TEQFW_MISSING');
    assert.deepEqual(first, {});
    assert.notStrictEqual(first, second);
});

test('Reader fragments are fresh, detached, mutable, and not runtime-frozen', async () => {
    const {loader, reader, store, object} = await resolveCfg();
    await loader.load([object.create({TEQFW_WEB__NESTED: {array: [1]}})]);
    const snapshot = store.getSnapshot();
    const first = reader.get('TEQFW_WEB');
    const second = reader.get('TEQFW_WEB');
    assert.notStrictEqual(first, second);
    assert.notStrictEqual(first.NESTED, snapshot.TEQFW_WEB__NESTED);
    assert.notStrictEqual(first.NESTED.array, snapshot.TEQFW_WEB__NESTED.array);
    assert.equal(Object.isFrozen(first), false);
    assert.equal(Object.isFrozen(first.NESTED), false);
    first.NESTED.array.push(2);
    first.EXTRA = 'allowed';
    assert.deepEqual(second, {NESTED: {array: [1]}});
    assert.deepEqual(reader.get('TEQFW_WEB'), {NESTED: {array: [1]}});
});

test('Reader reports Store empty and loading lifecycle states', async () => {
    const {loader, reader} = await resolveCfg();
    assert.throws(() => reader.get('TEQFW_WEB'), (error) => error.code === 'CFG_STORE_EMPTY');
    let release;
    const pending = new Promise((resolve) => {
        release = resolve;
    });
    const operation = loader.load([{id: 'pending', load: async () => {
        await pending;
        return [];
    }}]);
    assert.throws(() => reader.get('TEQFW_WEB'), (error) => error.code === 'CFG_STORE_LOADING');
    release();
    await operation;
});
