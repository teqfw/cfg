// @ts-check
import {readdir} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';

export async function discoverSuite(suite, {readdirFn = readdir} = {}) {
    const directory = join('test', suite);
    try {
        return (await readdirFn(directory))
            .filter((name) => name.endsWith('.test.mjs'))
            .sort()
            .map((name) => join(directory, name));
    } catch (error) {
        if (error?.code === 'ENOENT') return [];
        throw error;
    }
}

export async function runSuite(suite) {
    const files = await discoverSuite(suite);
    if (files.length === 0) {
        console.log(`Skipped ${suite} suite: no test files.`);
        return 0;
    }
    return new Promise((resolve, reject) => {
        const child = spawn(process.execPath, ['--test', ...files], {stdio: 'inherit'});
        child.once('error', reject);
        child.once('exit', (code, signal) => resolve(code ?? (signal ? 1 : 0)));
    });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    process.exitCode = await runSuite(process.argv[2]);
}
