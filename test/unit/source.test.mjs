// @ts-nocheck

import {test, describe} from 'node:test';
import assert from 'node:assert/strict';
import createDotenvFileSource from "../../src/Source/DotenvFile.mjs";
import {mkdtemp, rm, writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import createObjectSource from "../../src/Source/Object.mjs";
import createProcessEnvSource from "../../src/Source/ProcessEnv.mjs";
import {assertCode, createHarness} from './helpers.mjs';

describe('ObjectSource', () => {
    test('returns all supplied entries, including invalid keys for Loader validation', async () => {
        const source = createObjectSource({
            TEQFW_WEB__HTTP_PORT: '8080',
            invalid_key: 'kept',
        });
        assert.deepEqual(await source.load(), [
            {key: 'TEQFW_WEB__HTTP_PORT', value: '8080'},
            {key: 'invalid_key', value: 'kept'},
        ]);
        const {loader} = createHarness();
        await assertCode(loader.load([source]), 'CFG_INVALID_KEY');
    });

    test('captures enumerable entries and retains supported raw values', async () => {
        const entries = {
            TEQFW_WEB__PORT: '8080',
            TEQFW_WEB__FLAGS: [true, {enabled: false}],
            TEQFW_WEB__EMPTY: null,
        };
        const source = createObjectSource(entries);
        entries.TEQFW_WEB__PORT = 'changed';
        const loaded = await source.load();
        assert.equal(loaded[0].value, '8080');
        assert.deepEqual(loaded[1].value, [true, {enabled: false}]);
        assert.equal(loaded[2].value, null);
    });

    test('does not expose the caller input object as Source output', async () => {
        const source = createObjectSource({TEQFW_WEB__PORT: '8080'});
        const first = await source.load();
        const second = await source.load();
        assert.notEqual(first, second);
        assert.notEqual(first[0], second[0]);
    });
});

describe('ProcessEnvSource', () => {
    test('filters unrelated names and keeps explicit string values', async () => {
        const environment = {
            TEQFW_WEB__HTTP_PORT: '8080',
            TEQFW_WEB_HTTP_PORT: 'ignored',
            A__B__C: 'ignored',
            PATH: '/safe-to-ignore',
            TEQFW_WEB__UNSET: undefined,
        };
        const source = createProcessEnvSource(environment);
        const result = await source.load();
        assert.deepEqual(result, [{key: 'TEQFW_WEB__HTTP_PORT', value: '8080'}]);
        assert.equal(environment.PATH, '/safe-to-ignore');
        assert.equal(Object.prototype.hasOwnProperty.call(environment, 'TEQFW_WEB__UNSET'), true);
    });

    test('never reads global process.env implicitly', async () => {
        const previous = process.env.TEQFW_TEST__VALUE;
        process.env.TEQFW_TEST__VALUE = 'host-value';
        try {
            assert.deepEqual(await createProcessEnvSource({}).load(), []);
        } finally {
            if (previous === undefined) delete process.env.TEQFW_TEST__VALUE;
            else process.env.TEQFW_TEST__VALUE = previous;
        }
    });
});

describe('DotenvFileSource', () => {
    /** @param {string} content @returns {Promise<{path: string, cleanup: () => Promise<void>}>} */
    async function fixture(content) {
        const directory = await mkdtemp(join(tmpdir(), 'teqfw-cfg-'));
        const path = join(directory, '.env');
        await writeFile(path, content, 'utf8');
        return {path, cleanup: () => rm(directory, {recursive: true, force: true})};
    }

    test('parses UTF-8, comments, quotes, whitespace, export, multiline and duplicates', async () => {
        const item = await fixture([
            '# comment',
            'TEQFW_WEB__PLAIN =  first # comment',
            'TEQFW_WEB__SINGLE = "  quoted # value  "',
            "export TEQFW_WEB__EMPTY=",
            'TEQFW_WEB__DOUBLE="line1\\nline2"',
            'TEQFW_WEB__MULTI="line',
            'two"',
            'TEQFW_WEB__PLAIN=last',
            'UNRELATED=value',
            '',
        ].join('\n'));
        try {
            const values = await createDotenvFileSource({path: item.path}).load();
            assert.deepEqual(values, [
                {key: 'TEQFW_WEB__PLAIN', value: 'last'},
                {key: 'TEQFW_WEB__SINGLE', value: '  quoted # value  '},
                {key: 'TEQFW_WEB__EMPTY', value: ''},
                {key: 'TEQFW_WEB__DOUBLE', value: 'line1\nline2'},
                {key: 'TEQFW_WEB__MULTI', value: 'line\ntwo'},
            ]);
        } finally {
            await item.cleanup();
        }
    });

    test('ignores malformed and unrelated assignments', async () => {
        const item = await fixture([
            'not an assignment',
            'NOPE=value',
            'TEQFW_WEB___BAD=value',
            'TEQFW_WEB__GOOD=value',
        ].join('\n'));
        try {
            assert.deepEqual(await createDotenvFileSource({path: item.path}).load(), [
                {key: 'TEQFW_WEB__GOOD', value: 'value'},
            ]);
        } finally {
            await item.cleanup();
        }
    });

    test('uses fixed UTF-8 and fails on invalid UTF-8', async () => {
        const directory = await mkdtemp(join(tmpdir(), 'teqfw-cfg-'));
        const path = join(directory, '.env');
        await writeFile(path, Buffer.from([0x54, 0x45, 0x51, 0x46, 0x57, 0x5f, 0x5f, 0x41, 0xff]));
        try {
            await assert.rejects(createDotenvFileSource({path}).load());
        } finally {
            await rm(directory, {recursive: true, force: true});
        }
    });

    test('reports missing file through Loader source failure without path contents', async () => {
        const path = join(tmpdir(), 'cfg-missing-secret-token.env');
        const source = createDotenvFileSource({path, id: 'dotenv:test'});
        const {loader} = createHarness();
        const error = await assert.rejects(loader.load([source]), (value) => {
            assert.equal(value.code, 'CFG_SOURCE_FAILED');
            assert.equal(value.context.sourceId, 'dotenv:test');
            assert.equal(value.message.includes(path), false);
            return true;
        });
        assert.equal(error, undefined);
    });
});

describe('Source identifiers', () => {
    test('accepts documented identifier characters and rejects malformed ids', () => {
        for (const id of ['a', 'Vault:prod/v1', 'source-01._/']) {
            assert.equal(createObjectSource({}, id).id, id);
        }
        for (const id of ['', ' leading', 'trailing ', 'has space', 'x'.repeat(129), 'секрет']) {
            assert.throws(() => createObjectSource({}, id), (error) => error.code === 'CFG_INVALID_SOURCE_ID');
        }
    });

    test('does not echo invalid identifier data', () => {
        assert.throws(() => createObjectSource({}, 'secret-token-value '), (error) => {
            assert.equal(error.code, 'CFG_INVALID_SOURCE_ID');
            assert.equal(error.message.includes('secret-token-value'), false);
            return true;
        });
    });
});

