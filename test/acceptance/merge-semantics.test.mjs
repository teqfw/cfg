import {test} from 'node:test';
import assert from 'node:assert/strict';
import {resolveCfg, customSource} from '../helpers/di.mjs';

const replacements = [
    ['scalar replaces scalar', 'first', 'second'],
    ['object replaces object without deep merge', {left: 1, shared: 'old'}, {right: 2, shared: 'new'}],
    ['array replaces array', [1, 2], [3]],
    ['null replaces a value', 'value', null],
    ['value replaces null', null, false],
    ['conflicting raw types replace', {nested: true}, ['array']],
];

for (const [name, earlier, later] of replacements) {
    test(name, async () => {
        const {loader, reader} = await resolveCfg();
        await loader.load([
            customSource('earlier', [{key: 'TEQFW_WEB__VALUE', value: earlier}]),
            customSource('later', [{key: 'TEQFW_WEB__VALUE', value: later}]),
        ]);
        assert.deepEqual(reader.get('TEQFW_WEB').VALUE, later);
    });
}

test('absent later entry preserves an earlier entry', async () => {
    const {loader, reader} = await resolveCfg();
    await loader.load([
        customSource('earlier', [{key: 'TEQFW_WEB__VALUE', value: 'kept'}]),
        customSource('later', [{key: 'TEQFW_WEB__OTHER', value: 'added'}]),
    ]);
    assert.deepEqual(reader.get('TEQFW_WEB'), {VALUE: 'kept', OTHER: 'added'});
});

test('last declaration within one Source wins', async () => {
    const {loader, reader} = await resolveCfg();
    await loader.load([customSource('duplicates', [
        {key: 'TEQFW_WEB__VALUE', value: 'first'},
        {key: 'TEQFW_WEB__VALUE', value: 'last'},
    ])]);
    assert.equal(reader.get('TEQFW_WEB').VALUE, 'last');
});

test('undefined is rejected instead of acting as absence', async () => {
    const {loader, reader} = await resolveCfg();
    await assert.rejects(loader.load([
        customSource('earlier', [{key: 'TEQFW_WEB__VALUE', value: 'visible'}]),
        customSource('later', [{key: 'TEQFW_WEB__VALUE', value: undefined}]),
    ]), (error) => error.code === 'CFG_INVALID_RAW_VALUE');
    assert.throws(() => reader.get('TEQFW_WEB'), (error) => error.code === 'CFG_INVALID_RAW_VALUE');
});
