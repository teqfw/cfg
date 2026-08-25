import {test} from 'node:test';
import assert from 'node:assert/strict';
import Loader from '../../src/Loader.mjs';

function errorService() {
    return {codes: {LOAD_ALREADY_READY: 'already-ready', INVALID_SOURCE: 'invalid-source', SOURCE_FAILED: 'source-failed', INVALID_ENTRY: 'invalid-entry', ILLEGAL_STATE: 'illegal'}, create: (code, context = {}) => Object.assign(new Error(code), {code, context}), is: (error) => typeof error?.code === 'string'};
}

test('Loader captures DI-provided Source descriptors and publishes their entries', async () => {
    const error = errorService();
    const events = [];
    const store = {state: 'empty', getState() { return this.state; }, beginLoading() { this.state = 'loading'; }, publish(value) { events.push(value); this.state = 'ready'; }, fail() { this.state = 'failed'; }, getFailure() { return undefined; }};
    const loader = new Loader({
        error,
        key: {parse: () => ({})},
        raw: {copy: (value) => value},
        contract: {capture: () => [Object.freeze({id: 'source', load: async () => [{key: 'TEQFW_WEB__PORT', value: 3000}]})]},
        store,
    });
    await loader.load([]);
    assert.deepEqual(events, [{TEQFW_WEB__PORT: 3000}]);
});
