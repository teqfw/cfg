import {test} from 'node:test';
import assert from 'node:assert/strict';
import ProcessEnvSource from '../../../src/Source/ProcessEnv.mjs';

test('ProcessEnvSource filters the injected environment record during load', async () => {
    const source = new ProcessEnvSource({
        contract: {assertRecord() {}, assertId: (id) => id},
        key: {isComplete: (name) => name === 'TEQFW_WEB__PORT'},
    }).create({TEQFW_WEB__PORT: '3000', UNRELATED: 'ignored'});
    assert.deepEqual(await source.load(), [{key: 'TEQFW_WEB__PORT', value: '3000'}]);
});
