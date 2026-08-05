import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('package is DI-only, targets Node.js 20, and has no dotenv dependency', async () => {
    const pkg = JSON.parse(await readFile(new URL('../../package.json', import.meta.url)));
    assert.equal(pkg.type, 'module');
    assert.equal(pkg.engines.node, '>=20');
    assert.equal(pkg.exports, undefined);
    assert.equal(pkg.dependencies?.dotenv, undefined);
    assert.equal(pkg.devDependencies?.dotenv, undefined);
    assert.equal(pkg.devDependencies?.['@teqfw/di'], '>=2.9.0');
    assert.equal(pkg.devDependencies?.['@teqfw/log'], '>=2.0.0');
    assert.deepEqual(pkg.teqfw?.fw?.di?.namespaces, [{
        prefix: 'TeqFw_Cfg_',
        path: './src',
        ext: '.mjs',
    }]);
    assert.equal(pkg.teqfw?.fw?.di?.namespace, undefined);
    assert.equal(pkg.teqfw?.namespaces, undefined);
});

test('suite scripts explicitly target and compose all intended suites', async () => {
    const pkg = JSON.parse(await readFile(new URL('../../package.json', import.meta.url)));
    assert.equal(pkg.scripts['test:unit'], 'node test/run-suite.mjs unit');
    assert.equal(pkg.scripts['test:integration'], 'node test/run-suite.mjs integration');
    assert.equal(pkg.scripts['test:acceptance'], 'node test/run-suite.mjs acceptance');
    assert.equal(pkg.scripts['test:publish'], 'node test/run-suite.mjs publish');
    assert.equal(pkg.scripts.test, 'npm run test:unit && npm run test:integration && npm run test:acceptance && npm run test:publish');
});

test('suite discovery skips ENOENT but propagates other filesystem errors', async () => {
    const {discoverSuite} = await import('../run-suite.mjs');
    assert.deepEqual(await discoverSuite('optional', {readdirFn: async () => {
        const error = new Error('missing');
        error.code = 'ENOENT';
        throw error;
    }}), []);
    await assert.rejects(discoverSuite('broken', {readdirFn: async () => {
        const error = new Error('permission denied');
        error.code = 'EACCES';
        throw error;
    }}), (error) => error.code === 'EACCES');
});

test('suite discovery selects only explicit test files in deterministic order', async () => {
    const {discoverSuite} = await import('../run-suite.mjs');
    assert.deepEqual(await discoverSuite('unit', {
        readdirFn: async () => ['z.test.mjs', 'helper.mjs', 'a.test.mjs'],
    }), ['test/unit/a.test.mjs', 'test/unit/z.test.mjs']);
});
