// @ts-nocheck

import {test} from 'node:test';
import assert from 'node:assert/strict';
import createObjectSource from '../../src/Source/Object.mjs';
import createProcessEnvSource from '../../src/Source/ProcessEnv.mjs';
import createDotenvFileSource from '../../src/Source/DotenvFile.mjs';
import Loader, {__deps__ as loaderDeps} from '../../src/Loader.mjs';
import Reader, {__deps__ as readerDeps} from '../../src/Reader.mjs';

test('Source factories are DI-addressable default exports', () => {
    assert.equal(typeof createObjectSource({}, 'object'), 'object');
    assert.equal(typeof createProcessEnvSource({}, 'environment'), 'object');
    assert.equal(typeof createDotenvFileSource({path: 'unused'}), 'object');
});

test('Loader and Reader expose exact frozen DI declarations', () => {
    assert.deepEqual(loaderDeps, {default: {store: 'TeqFw_Cfg_Store$'}});
    assert.deepEqual(readerDeps, {default: {store: 'TeqFw_Cfg_Store$'}});
    assert.equal(Object.isFrozen(loaderDeps), true);
    assert.equal(Object.isFrozen(readerDeps.default), true);
    assert.equal(typeof Loader, 'function');
    assert.equal(typeof Reader, 'function');
});

test('there is no root ESM facade or package export map', async () => {
    const packageJson = await import('../../package.json', {with: {type: 'json'}});
    assert.equal(packageJson.default.exports, undefined);
    await assert.rejects(import('../../src/index.mjs'));
});

