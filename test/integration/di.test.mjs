import {test} from 'node:test';
import assert from 'node:assert/strict';
import Container from '@teqfw/di';
import {fileURLToPath} from 'node:url';

const sourceRoot = fileURLToPath(new URL('../../src', import.meta.url));

function createContainer() {
    const container = new Container();
    container.addNamespaceRoot('TeqFw_Cfg_', sourceRoot, '.mjs');
    return container;
}

test('documented cfg CDC tokens resolve through a real TeqFW container', async () => {
    const container = createContainer();
    for (const token of [
        'TeqFw_Cfg_Loader$',
        'TeqFw_Cfg_Reader$',
        'TeqFw_Cfg_Store$',
        'TeqFw_Cfg_Source_Object$',
        'TeqFw_Cfg_Source_ProcessEnv$',
        'TeqFw_Cfg_Source_DotenvFile$',
    ]) assert.ok(await container.get(token), token);
});

test('Loader receives dependencies and shares Store with Reader', async () => {
    const container = createContainer();
    const loader = await container.get('TeqFw_Cfg_Loader$');
    const reader = await container.get('TeqFw_Cfg_Reader$');
    const store = await container.get('TeqFw_Cfg_Store$');
    const object = await container.get('TeqFw_Cfg_Source_Object$');
    await loader.load([object.create({TEQFW_WEB__PORT: 8080})]);
    assert.deepEqual(reader.get('TEQFW_WEB'), {PORT: 8080});
    assert.deepEqual(store.getSnapshot(), {TEQFW_WEB__PORT: 8080});
});

test('component instances are singleton and Source descriptors are transient', async () => {
    const container = createContainer();
    const firstLoader = await container.get('TeqFw_Cfg_Loader$');
    const secondLoader = await container.get('TeqFw_Cfg_Loader$');
    const factory = await container.get('TeqFw_Cfg_Source_Object$');
    assert.strictEqual(firstLoader, secondLoader);
    assert.notStrictEqual(factory.create({}), factory.create({}));
});
