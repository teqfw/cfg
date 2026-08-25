import {test} from 'node:test';
import assert from 'node:assert/strict';
import ObjectSource from '../../../src/Source/Object.mjs';

test('ObjectSource defers injected-record reads until Source load', async () => {
    let reads = 0;
    const entries = {};
    Object.defineProperty(entries, 'TEQFW_WEB__PORT', {enumerable: true, get() { reads++; return 3000; }});
    const source = new ObjectSource({contract: {assertRecord() {}, assertId: (id) => id}}).create(entries, 'object');
    assert.equal(reads, 0);
    assert.deepEqual(await source.load(), [{key: 'TEQFW_WEB__PORT', value: 3000}]);
    assert.equal(reads, 1);
});
