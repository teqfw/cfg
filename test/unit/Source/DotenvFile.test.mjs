import {test} from 'node:test';
import assert from 'node:assert/strict';
import DotenvFileSource from '../../../src/Source/DotenvFile.mjs';

test('DotenvFileSource reads its injected file service only during load', async () => {
    const reads = [];
    const source = new DotenvFileSource({
        contract: {assertRecord() {}, assertId: (id) => id, invalidSource: (field) => { throw new Error(field); }},
        key: {isComplete: (name) => name === 'TEQFW_WEB__PORT'},
        parser: {parse: () => ({TEQFW_WEB__PORT: '3000', UNRELATED: 'ignored'})},
        readFile: async (path) => { reads.push(path); return new TextEncoder().encode('ignored'); },
    }).create({path: '/app/.env'});
    assert.deepEqual(reads, []);
    assert.deepEqual(await source.load(), [{key: 'TEQFW_WEB__PORT', value: '3000'}]);
    assert.deepEqual(reads, ['/app/.env']);
});
