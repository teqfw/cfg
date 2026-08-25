import assert from 'node:assert/strict';
import {mkdtemp, mkdir, readFile, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {test} from 'node:test';

import CfgLogPolicy from '../../src/Log/Policy.mjs';
import Levels from '../../../log/src/Enum/Level.mjs';
import LogPolicy from '../../../log/src/Policy.mjs';
import LogPolicyFile from '../../../log/src/Policy/File.mjs';
import {resolveCfg} from '../helpers/di.mjs';

async function withRoot(operation) {
  const appRoot = await mkdtemp(join(tmpdir(), 'teqfw-cfg-log-'));
  try {
    return await operation(appRoot);
  } finally {
    await rm(appRoot, {recursive: true, force: true});
  }
}

async function runtime(entries = {}) {
  const cfg = await resolveCfg();
  await cfg.loader.load([cfg.object.create(entries)]);
  const policy = new LogPolicy({levels: Levels});
  const policyFile = new LogPolicyFile({policy, readFile});
  return {cfg, policy, bridge: new CfgLogPolicy({reader: cfg.reader, policyFile, resolve})};
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
    await assert.rejects(absent.bridge.apply({appRoot}), (error) => error?.code === 'ENOENT');
    const bad = join(appRoot, 'bad.policy');
    await writeFile(bad, '*=unexpected\n');
    const malformed = await runtime({TEQFW_LOG__POLICY_FILE: bad});
    await assert.rejects(malformed.bridge.apply({appRoot}), /level is invalid/);
  });
});
