import {test} from 'node:test';
import assert from 'node:assert/strict';
import Store from '../../src/Store.mjs';

function errorService() {
    return {codes: {ILLEGAL_STATE: 'illegal', STORE_LOADING: 'loading'}, create: (code, context = {}) => Object.assign(new Error(code), {code, context})};
}

test('Store publishes one frozen snapshot after loading', () => {
    const raw = {copySnapshot: (value) => ({...value}), deepFreeze: Object.freeze};
    const store = new Store({error: errorService(), raw});
    store.beginLoading();
    store.publish({TEQFW_WEB__PORT: 3000});
    assert.equal('state' in store, false);
    assert.equal(store.getState(), 'ready');
    assert.deepEqual(store.getSnapshot(), {TEQFW_WEB__PORT: 3000});
    assert.equal(Object.isFrozen(store.getSnapshot()), true);
});
