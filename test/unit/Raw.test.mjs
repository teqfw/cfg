import {test} from 'node:test';
import assert from 'node:assert/strict';
import Raw from '../../src/Raw.mjs';

function errorService() {
    return {codes: {INVALID_RAW_VALUE: 'invalid-raw', INVALID_ENTRY: 'invalid-entry'}, create: (code) => Object.assign(new Error(code), {code}), is: (error) => error?.code?.startsWith('invalid-')};
}

test('Raw copies accepted values and rejects unsupported values', () => {
    const raw = new Raw({error: errorService()});
    const value = {nested: [true, null]};
    const copy = raw.copy(value);
    assert.deepEqual(copy, value);
    assert.notStrictEqual(copy.nested, value.nested);
    assert.throws(() => raw.copy(new Map()), (error) => error.code === 'invalid-raw');
});
