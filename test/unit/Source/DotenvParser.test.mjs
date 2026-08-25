import {test} from 'node:test';
import assert from 'node:assert/strict';
import DotenvParser from '../../../src/Source/DotenvParser.mjs';

test('DotenvParser parses supported assignments without environment expansion', () => {
    const parser = new DotenvParser();
    assert.deepEqual(parser.parse('\ufeff export TEQFW_WEB__PORT = 3000 # comment\nNAME="a\\nb"'), {TEQFW_WEB__PORT: '3000', NAME: 'a\nb'});
    assert.throws(() => parser.parse('NAME="bad\\q"'));
});
