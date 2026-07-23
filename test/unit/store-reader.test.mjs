// @ts-nocheck

import {test, describe} from 'node:test';
import assert from 'node:assert/strict';
import Store from '../../src/Store.mjs';
import Loader from '../../src/Loader.mjs';
import Reader from '../../src/Reader.mjs';
import {assertCode, deferred} from './helpers.mjs';

describe('Store', () => {
    test('follows empty, loading, ready lifecycle', () => {
        const store = new Store();
        assert.equal(store.state, 'empty');
        assert.throws(() => store.getSnapshot(), (error) => error.code === 'CFG_STORE_EMPTY');
        store.beginLoading();
        assert.equal(store.state, 'loading');
        assert.throws(() => store.getSnapshot(), (error) => error.code === 'CFG_STORE_LOADING');
        const nested = {array: [1, {value: true}]};
        const snapshot = {TEQFW_WEB__VALUE: nested};
        store.publish(snapshot);
        nested.array[1].value = false;
        assert.equal(store.state, 'ready');
        const stored = store.getSnapshot();
        assert.equal(stored.TEQFW_WEB__VALUE.array[1].value, true);
        assert.equal(Object.isFrozen(stored), true);
        assert.equal(Object.isFrozen(stored.TEQFW_WEB__VALUE), true);
        assert.equal(Object.isFrozen(stored.TEQFW_WEB__VALUE.array), true);
        assert.equal(Object.isFrozen(stored.TEQFW_WEB__VALUE.array[1]), true);
        assert.throws(() => store.publish({}), (error) => error.code === 'CFG_ILLEGAL_STATE');
    });

    test('retains canonical failure and has no snapshot', () => {
        const store = new Store();
        store.beginLoading();
        const failure = new Error('failure');
        store.fail(failure);
        assert.equal(store.state, 'failed');
        assert.equal(store.getFailure(), failure);
        assert.throws(() => store.getSnapshot(), (error) => error === failure);
    });
});

describe('Reader', () => {
    test('reports empty and loading states synchronously', () => {
        const store = new Store();
        const reader = new Reader({store});
        assert.throws(() => reader.get('TEQFW_WEB'), (error) => error.code === 'CFG_STORE_EMPTY');
        store.beginLoading();
        assert.throws(() => reader.get('TEQFW_WEB'), (error) => error.code === 'CFG_STORE_LOADING');
    });

    test('validates namespace and returns absent namespaces as cached frozen fragments', async () => {
        const store = new Store();
        const loader = new Loader({store});
        const reader = new Reader({store});
        await loader.load([{id: 'one', load: async () => [
            {key: 'TEQFW_WEB__HTTP_PORT', value: '8080'},
            {key: 'TEQFW_WEB__A_SINGLE_UNDERSCORE', value: {nested: [1, 2]}},
            {key: 'TEQFW_LOG__LEVEL', value: 'info'},
        ]}]);
        for (const invalid of ['', 'teqfw_web', 'TEQFW__WEB', 'TEQFW_WEB__PARAM']) {
            assert.throws(() => reader.get(invalid), (error) => error.code === 'CFG_INVALID_NAMESPACE');
        }
        const absent = reader.get('TEQFW_MISSING');
        assert.deepEqual(absent, {});
        assert.equal(Object.isFrozen(absent), true);
        assert.equal(reader.get('TEQFW_MISSING'), absent);
        const fragment = reader.get('TEQFW_WEB');
        assert.equal(reader.get('TEQFW_WEB'), fragment);
        assert.deepEqual(fragment, {
            HTTP_PORT: '8080',
            A_SINGLE_UNDERSCORE: {nested: [1, 2]},
        });
        assert.equal(Object.isFrozen(fragment), true);
        assert.equal(Object.isFrozen(fragment.A_SINGLE_UNDERSCORE), true);
        assert.equal(Object.isFrozen(fragment.A_SINGLE_UNDERSCORE.nested), true);
        assert.throws(() => { fragment.HTTP_PORT = 'changed'; }, TypeError);
        assert.throws(() => { fragment.A_SINGLE_UNDERSCORE.nested.push(3); }, TypeError);
    });

    test('throws the exact Store failure object after loading fails', async () => {
        const store = new Store();
        const loader = new Loader({store});
        const reader = new Reader({store});
        const gate = deferred();
        const promise = loader.load([{id: 'one', load: async () => gate.promise}]);
        assert.throws(() => reader.get('TEQFW_WEB'), (error) => error.code === 'CFG_STORE_LOADING');
        gate.reject(new Error('secret'));
        let failure;
        await assert.rejects(promise, (error) => {
            failure = error;
            return error.code === 'CFG_SOURCE_FAILED';
        });
        assert.throws(() => reader.get('TEQFW_WEB'), (error) => error === failure);
    });
});

