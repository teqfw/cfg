import {test} from 'node:test';
import assert from 'node:assert/strict';
import Key from '../../src/Key.mjs';

function errorService() {
    return {codes: {INVALID_KEY: 'invalid-key', INVALID_NAMESPACE: 'invalid-namespace'}, create: (code, context = {}) => Object.assign(new Error(code), {code, context})};
}

test('Key parses complete keys and rejects invalid namespaces', () => {
    const key = new Key({error: errorService()});
    assert.deepEqual(key.parse('TEQFW_WEB__PORT'), {namespace: 'TEQFW_WEB', parameter: 'PORT'});
    assert.equal(key.isComplete('TEQFW_WEB__PORT'), true);
    assert.throws(() => key.assertNamespace('bad'), (error) => error.code === 'invalid-namespace' && error.context.namespace === 'bad');
});
