import {test, describe} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, chmod, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {resolveCfg, rejectsCode} from '../helpers/di.mjs';
import {withTempFile} from '../helpers/temp.mjs';

async function loadText(text) {
    return withTempFile(text, async (path) => {
        const {dotenv} = await resolveCfg();
        return dotenv.create({path}).load();
    });
}

function asObject(entries) {
    return Object.fromEntries(entries.map(({key, value}) => [key, value]));
}

describe('dotenv physical input and ignored content', () => {
    for (const [name, text] of [
        ['LF with final newline', 'TEQFW_WEB__A=one\n'],
        ['LF without final newline', 'TEQFW_WEB__A=one'],
        ['CRLF', 'TEQFW_WEB__A=one\r\n'],
        ['UTF-8 BOM', '\uFEFFTEQFW_WEB__A=one\n'],
    ]) test(name, async () => assert.deepEqual(asObject(await loadText(text)), {TEQFW_WEB__A: 'one'}));

    test('empty, blank, and quoted comment lines are ignored', async () => {
        const entries = await loadText(`\n \t\n# "ordinary comment"\n# user's configuration\n# both '" types\n`);
        assert.deepEqual(entries, []);
    });

    test('invalid UTF-8 is rejected at the Loader boundary', async () => {
        await withTempFile(Uint8Array.from([0xC3, 0x28]), async (path) => {
            const {dotenv, loader} = await resolveCfg();
            await rejectsCode(loader.load([dotenv.create({path})]), 'CFG_SOURCE_FAILED', {
                sourceId: 'dotenv-file',
            });
        });
    });
});

describe('dotenv assignments, quoting, and comments', () => {
    const cases = [
        ['plain and empty values', 'TEQFW_WEB__A=plain\nTEQFW_WEB__B=', {TEQFW_WEB__A: 'plain', TEQFW_WEB__B: ''}],
        ['spacing and export', ' export TEQFW_WEB__A = value ', {TEQFW_WEB__A: 'value'}],
        ['unrelated names', 'OTHER=value\nTEQFW_WEB__A=yes', {TEQFW_WEB__A: 'yes'}],
        ['single quotes', "TEQFW_WEB__A='a # b'", {TEQFW_WEB__A: 'a # b'}],
        ['double quotes and spaces', 'TEQFW_WEB__A="a # b"', {TEQFW_WEB__A: 'a # b'}],
        ['apostrophe in double quotes', "TEQFW_WEB__A=\"user's\"", {TEQFW_WEB__A: "user's"}],
        ['double quote in single quotes', "TEQFW_WEB__A='a\"b'", {TEQFW_WEB__A: 'a"b'}],
        ['escaped double quote', String.raw`TEQFW_WEB__TEXT="a\"b"`, {TEQFW_WEB__TEXT: 'a"b'}],
        ['documented escapes', String.raw`TEQFW_WEB__A="a\n\r\t\\b"`, {TEQFW_WEB__A: 'a\n\r\t\\b'}],
        ['unquoted inline comment', 'TEQFW_WEB__A=value#comment', {TEQFW_WEB__A: 'value'}],
        ['last duplicate wins', 'TEQFW_WEB__A=first\nTEQFW_WEB__A=last', {TEQFW_WEB__A: 'last'}],
        ['no expansion or conversion', 'TEQFW_WEB__A=$OTHER\nTEQFW_WEB__B=$(command)\nTEQFW_WEB__C=true\nTEQFW_WEB__D=42', {
            TEQFW_WEB__A: '$OTHER',
            TEQFW_WEB__B: '$(command)',
            TEQFW_WEB__C: 'true',
            TEQFW_WEB__D: '42',
        }],
    ];
    for (const [name, text, expected] of cases) {
        test(name, async () => assert.deepEqual(asObject(await loadText(text)), expected));
    }

    test('quoted multiline values normalize physical newlines', async () => {
        assert.deepEqual(asObject(await loadText("TEQFW_WEB__A='one\ntwo'\nTEQFW_WEB__B=\"three\nfour\"")), {
            TEQFW_WEB__A: 'one\ntwo',
            TEQFW_WEB__B: 'three\nfour',
        });
    });
});

describe('dotenv failures', () => {
    for (const [name, text] of [
        ['malformed assignment', 'not an assignment'],
        ['invalid variable name', 'BAD NAME=value'],
        ['malformed export', 'export TEQFW_WEB__A'],
        ['unclosed single quote', "TEQFW_WEB__A='x"],
        ['unclosed double quote', 'TEQFW_WEB__A="x'],
        ['unsupported escape', String.raw`TEQFW_WEB__A="x\q"`],
    ]) test(name, async () => {
        await withTempFile(text, async (path) => {
            const {dotenv, loader} = await resolveCfg();
            await rejectsCode(loader.load([dotenv.create({path})]), 'CFG_SOURCE_FAILED', {
                sourceId: 'dotenv-file',
            });
        });
    });

    test('invalid path arguments use the common cfg error model', async () => {
        const {dotenv} = await resolveCfg();
        for (const options of [undefined, {}, {path: ''}, {path: 1}]) {
            assert.throws(() => dotenv.create(options), (error) => {
                assert.equal(error.code, 'CFG_INVALID_SOURCE');
                assert.equal(error.context.field, options === undefined ? 'options' : 'path');
                return true;
            });
        }
    });

    test('missing and unreadable file paths are source failures without path disclosure', async () => {
        const directory = await mkdtemp(join(tmpdir(), 'teqfw-cfg-missing-'));
        try {
            for (const path of [join(directory, 'token-secret.env'), directory]) {
                const {dotenv, loader} = await resolveCfg();
                await assert.rejects(loader.load([dotenv.create({path})]), (error) => {
                    assert.equal(error.code, 'CFG_SOURCE_FAILED');
                    assert.ok(!error.message.includes(path));
                    assert.ok(!JSON.stringify(error.context).includes(path));
                    return true;
                });
            }
        } finally {
            await chmod(directory, 0o700);
            await rm(directory, {recursive: true, force: true});
        }
    });
});
