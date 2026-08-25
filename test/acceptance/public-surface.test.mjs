import {test} from 'node:test';
import assert from 'node:assert/strict';
import Loader, {__deps__ as loaderDeps} from '../../src/Loader.mjs';
import Reader, {__deps__ as readerDeps} from '../../src/Reader.mjs';
import Store, {__deps__ as storeDeps} from '../../src/Store.mjs';
import ObjectFactory, {__deps__ as objectDeps} from '../../src/Source/Object.mjs';

test('package has no root runtime facade or export map', async () => {
    const packageJson = await import('../../package.json', {with: {type: 'json'}});
    assert.equal(packageJson.default.exports, undefined);
    await assert.rejects(import('../../src/index.mjs'));
});

test('documented modules expose their default exports and exact dependencies', () => {
    assert.deepEqual(loaderDeps, {default: {error: 'TeqFw_Cfg_Error$', key: 'TeqFw_Cfg_Key$', raw: 'TeqFw_Cfg_Raw$', contract: 'TeqFw_Cfg_Source_Contract$', store: 'TeqFw_Cfg_Store$'}});
    assert.deepEqual(readerDeps, {default: {key: 'TeqFw_Cfg_Key$', raw: 'TeqFw_Cfg_Raw$', store: 'TeqFw_Cfg_Store$'}});
    assert.deepEqual(storeDeps, {default: {error: 'TeqFw_Cfg_Error$', raw: 'TeqFw_Cfg_Raw$'}});
    assert.deepEqual(objectDeps, {default: {contract: 'TeqFw_Cfg_Source_Contract$'}});
    assert.equal(typeof Loader, 'function');
    assert.equal(typeof Reader, 'function');
    assert.equal(typeof Store, 'function');
    assert.equal(typeof ObjectFactory, 'function');
});

test('dotenv is absent from package dependencies', async () => {
    const packageJson = await import('../../package.json', {with: {type: 'json'}});
    assert.equal(packageJson.default.dependencies?.dotenv, undefined);
});
