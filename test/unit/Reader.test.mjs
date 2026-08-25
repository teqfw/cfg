import {test} from 'node:test';
import assert from 'node:assert/strict';
import Reader from '../../src/Reader.mjs';

test('Reader projects one namespace with detached values', () => {
    const reader = new Reader({
        error: {},
        key: {assertNamespace: (value) => value, parse: (name) => {
            const boundary = name.indexOf('__');
            return {namespace: name.slice(0, boundary), parameter: name.slice(boundary + 2)};
        }},
        raw: {copy: (value) => structuredClone(value)},
        store: {getSnapshot: () => ({TEQFW_WEB__OPTIONS: {enabled: true}, TEQFW_DB__HOST: 'localhost'})},
    });
    const result = reader.get('TEQFW_WEB');
    assert.deepEqual(result, {OPTIONS: {enabled: true}});
    assert.notStrictEqual(result.OPTIONS, reader.get('TEQFW_WEB').OPTIONS);
});
