import {test} from 'node:test';
import assert from 'node:assert/strict';
import Contract from '../../../src/Source/Contract.mjs';

function errorService() {
    return {codes: {INVALID_SOURCE_ID: 'invalid-id', INVALID_SOURCE: 'invalid-source'}, create: (code, context = {}) => Object.assign(new Error(code), {code, context})};
}

test('Contract captures an immutable Source descriptor and rejects duplicate identifiers', () => {
    const contract = new Contract({error: errorService()});
    const captured = contract.capture([{id: 'valid-source', load() { return []; }}]);
    assert.equal(Object.isFrozen(captured), true);
    assert.equal(captured[0].id, 'valid-source');
    assert.throws(() => contract.capture([{id: 'same', load() {}}, {id: 'same', load() {}}]), (error) => error.code === 'invalid-id');
});
