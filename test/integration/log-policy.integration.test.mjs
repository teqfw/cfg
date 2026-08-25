import assert from 'node:assert/strict';
import {mkdtemp, mkdir, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {test} from 'node:test';
import {fileURLToPath} from 'node:url';

import Container from '@teqfw/di';

const cfgRoot = fileURLToPath(new URL('../../src', import.meta.url));
const logRoot = fileURLToPath(new URL('../../node_modules/@teqfw/log/src', import.meta.url));

async function withRoot(operation) {
  const appRoot = await mkdtemp(join(tmpdir(), 'teqfw-cfg-log-'));
  try {
    return await operation(appRoot);
  } finally {
    await rm(appRoot, {recursive: true, force: true});
  }
}

async function runtime(entries = {}) {
  const container = new Container();
  container.addNamespaceRoot('TeqFw_Cfg_', cfgRoot, '.mjs');
  container.addNamespaceRoot('TeqFw_Log_', logRoot, '.mjs');
  const loader = await container.get('TeqFw_Cfg_Loader$');
  const object = await container.get('TeqFw_Cfg_Source_Object$');
  await loader.load([object.create(entries)]);
  const bridge = await container.get('TeqFw_Cfg_Log_Policy$');
  const policy = await container.get('TeqFw_Log_Policy$');
  return {bridge, policy};
}

test('cfg applies the conventional optional etc/log.policy file', async () => {
  await withRoot(async (appRoot) => {
    const {bridge, policy} = await runtime();
    await mkdir(join(appRoot, 'etc'));
    await writeFile(join(appRoot, 'etc', 'log.policy'), '*=warn\nApp_Import_*=trace\n');
    assert.deepEqual(await bridge.apply({appRoot}), {path: join(appRoot, 'etc', 'log.policy'), configured: false, applied: true});
    assert.equal(policy.isEnabled('App_Import_Run', 'trace'), true);
  });
});

test('cfg leaves the default policy when the conventional file is absent', async () => {
  await withRoot(async (appRoot) => {
    const {bridge, policy} = await runtime();
    assert.deepEqual(await bridge.apply({appRoot}), {path: join(appRoot, 'etc', 'log.policy'), configured: false, applied: false});
    assert.equal(policy.isEnabled('App_User_Service', 'info'), true);
  });
});

test('TEQFW_LOG__POLICY_FILE overrides the conventional location', async () => {
  await withRoot(async (appRoot) => {
    const file = join(appRoot, 'custom.policy');
    await writeFile(file, '*=error\n');
    const {bridge, policy} = await runtime({TEQFW_LOG__POLICY_FILE: file});
    assert.deepEqual(await bridge.apply({appRoot}), {path: file, configured: true, applied: true});
    assert.equal(policy.isEnabled('App_User_Service', 'warn'), false);
  });
});

test('an explicit missing or malformed logging policy fails clearly', async () => {
  await withRoot(async (appRoot) => {
    const missing = join(appRoot, 'missing.policy');
    const absent = await runtime({TEQFW_LOG__POLICY_FILE: missing});
    await assert.rejects(absent.bridge.apply({appRoot}), (error) => error?.code === 'CFG_LOG_POLICY_FAILED' && error.context.field === 'policyFile');
    const bad = join(appRoot, 'bad.policy');
    await writeFile(bad, '*=unexpected\n');
    const malformed = await runtime({TEQFW_LOG__POLICY_FILE: bad});
    await assert.rejects(malformed.bridge.apply({appRoot}), (error) => error?.code === 'CFG_LOG_POLICY_FAILED' && error.context.field === 'policyFile');
  });
});

test('invalid logging-policy inputs use the cfg error contract', async () => {
  const invalidRoot = await runtime();
  await assert.rejects(invalidRoot.bridge.apply({appRoot: ''}), (error) => error?.code === 'CFG_INVALID_LOG_POLICY' && error.context.field === 'appRoot');
  const invalidPath = await runtime({TEQFW_LOG__POLICY_FILE: 1});
  await assert.rejects(invalidPath.bridge.apply({appRoot: '/app'}), (error) => error?.code === 'CFG_INVALID_LOG_POLICY' && error.context.field === 'policyFile');
});
