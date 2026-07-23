// @ts-nocheck

import assert from 'node:assert/strict';
import {setTimeout as delay} from 'node:timers/promises';
import Store from '../../src/Store.mjs';
import Loader from '../../src/Loader.mjs';
import Reader from '../../src/Reader.mjs';

/** @returns {{promise: Promise<unknown>, resolve: (value?: unknown) => void, reject: (reason?: unknown) => void}} */
export function deferred() {
    /** @type {(value?: unknown) => void} */
    let resolve;
    /** @type {(reason?: unknown) => void} */
    let reject;
    const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return {promise, resolve, reject};
}

/**
 * @param {ReadonlyArray<{id: string, load: () => Promise<readonly TeqFw_Cfg_RawEntry[]>}>} sources
 * @returns {{store: TeqFw_Cfg_Store$, loader: TeqFw_Cfg_Loader$, reader: TeqFw_Cfg_Reader$}}
 */
export function createHarness(sources = []) {
    const store = new Store();
    const loader = new Loader({store});
    const reader = new Reader({store});
    if (sources.length > 0) void loader.load(sources);
    return {store, loader, reader};
}

/**
 * @param {Promise<unknown>} promise
 * @param {string} code
 * @returns {Promise<unknown>}
 */
export async function assertCode(promise, code) {
    await assert.rejects(promise, (error) => error?.code === code);
    return undefined;
}

export {assert, delay};

