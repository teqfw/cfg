import {test} from 'node:test';
import assert from 'node:assert/strict';
import ErrorService from '../../src/Error.mjs';

const codes = Object.freeze({INVALID_KEY: 'CFG_INVALID_KEY'});

test('Error creates frozen CfgError instances with safe context', () => {
    const service = new ErrorService({codes});
    const error = service.create(codes.INVALID_KEY, {key: 'TEQFW_WEB__PORT'});
    assert.equal(error.name, 'CfgError');
    assert.equal(error.code, codes.INVALID_KEY);
    assert.deepEqual(error.context, {key: 'TEQFW_WEB__PORT'});
    assert.equal(Object.isFrozen(error), true);
    assert.equal(service.is(error), true);
});
