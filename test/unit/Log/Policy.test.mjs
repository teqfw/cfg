import {test} from 'node:test';
import assert from 'node:assert/strict';
import Policy from '../../../src/Log/Policy.mjs';

function errorService() {
    return {codes: {INVALID_LOG_POLICY: 'invalid-policy', LOG_POLICY_FAILED: 'policy-failed'}, create: (code, context = {}) => Object.assign(new Error(code), {code, context})};
}

test('Policy applies an explicitly configured file through injected collaborators', async () => {
    const applied = [];
    const policy = new Policy({
        error: errorService(),
        reader: {get: () => ({POLICY_FILE: '/configured.policy'})},
        policyFile: {apply: async (path) => applied.push(path)},
        resolve: () => { throw new Error('conventional path must not be used'); },
    });
    assert.deepEqual(await policy.apply({appRoot: '/app'}), {path: '/configured.policy', configured: true, applied: true});
    assert.deepEqual(applied, ['/configured.policy']);
});
