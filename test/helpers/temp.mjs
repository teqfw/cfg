import {mkdtemp, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

export async function withTempFile(content, operation, options = undefined) {
    const directory = await mkdtemp(join(tmpdir(), 'teqfw-cfg-'));
    const path = join(directory, '.env');
    try {
        await writeFile(path, content, options);
        return await operation(path);
    } finally {
        await rm(directory, {recursive: true, force: true});
    }
}
