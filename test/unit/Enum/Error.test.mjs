import {test} from 'node:test';
import assert from 'node:assert/strict';
import codes from '../../../src/Enum/Error.mjs';

test('Error enum is immutable and exposes stable codes', () => {
    assert.equal(Object.isFrozen(codes), true);
    assert.equal(codes.INVALID_LOG_POLICY, 'CFG_INVALID_LOG_POLICY');
    assert.equal(codes.LOG_POLICY_FAILED, 'CFG_LOG_POLICY_FAILED');
});
