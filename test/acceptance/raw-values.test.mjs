import {test, describe} from 'node:test';
import assert from 'node:assert/strict';
import {resolveCfg} from '../helpers/di.mjs';

async function loadValue(value) {
    const runtime = await resolveCfg();
    const source = runtime.object.create({TEQFW_WEB__VALUE: value});
    return {runtime, operation: runtime.loader.load([source])};
}

describe('accepted RawValues', () => {
    const values = [
        ['string', 'text'],
        ['finite number', 1.25],
        ['boolean', false],
        ['null', null],
        ['dense array', [1, 'two', null]],
        ['plain object', {a: true}],
        ['null-prototype object', Object.assign(Object.create(null), {a: {b: [1]}})],
        ['nested combination', {a: [{b: false}, null], c: 'x'}],
    ];
    for (const [name, value] of values) test(name, async () => {
        const {runtime, operation} = await loadValue(value);
        await operation;
        const actual = runtime.reader.get('TEQFW_WEB').VALUE;
        if (value !== null && typeof value === 'object') {
            assert.deepEqual(
                Object.fromEntries(Object.entries(actual)),
                Object.fromEntries(Object.entries(value)),
            );
        } else {
            assert.strictEqual(actual, value);
        }
    });
});

describe('rejected RawValues', () => {
    class Custom {
        value = 1;
    }
    const accessor = {};
    Object.defineProperty(accessor, 'value', {enumerable: true, get: () => 'secret'});
    const hidden = {visible: true};
    Object.defineProperty(hidden, 'hidden', {value: 'secret', enumerable: false});
    const symbolProperty = {visible: true};
    symbolProperty[Symbol('secret')] = true;
    const sparse = Array(2);
    sparse[1] = 'value';
    const extraArray = [];
    extraArray.extra = true;
    const nonEnumerableIndex = ['x'];
    Object.defineProperty(nonEnumerableIndex, '0', {value: 'x', enumerable: false});
    const cyclicObject = {};
    cyclicObject.self = cyclicObject;
    const cyclicArray = [];
    cyclicArray.push(cyclicArray);
    const cases = [
        ['undefined', undefined],
        ['NaN', NaN],
        ['positive infinity', Infinity],
        ['negative infinity', -Infinity],
        ['bigint', 1n],
        ['symbol', Symbol('value')],
        ['function', () => {}],
        ['cyclic object', cyclicObject],
        ['cyclic array', cyclicArray],
        ['Date', new Date()],
        ['Map', new Map()],
        ['Set', new Set()],
        ['class instance', new Custom()],
        ['accessor property', accessor],
        ['sparse array', sparse],
        ['symbol property', symbolProperty],
        ['extra array property', extraArray],
        ['non-enumerable array index', nonEnumerableIndex],
        ['unsupported prototype', Object.create({})],
        ['non-enumerable property', hidden],
    ];
    for (const [name, value] of cases) test(name, async () => {
        const {runtime, operation} = await loadValue(value);
        await assert.rejects(operation, (error) => error.code === 'CFG_INVALID_RAW_VALUE');
        assert.equal(runtime.store.getState(), 'failed');
        assert.throws(() => runtime.reader.get('TEQFW_WEB'), (error) => error.code === 'CFG_INVALID_RAW_VALUE');
    });
});

test('nested non-enumerable property publishes nothing', async () => {
    const nested = {accepted: 'visible'};
    Object.defineProperty(nested, 'token', {value: 'secret', enumerable: false});
    const {runtime, operation} = await loadValue({nested});
    await assert.rejects(operation, (error) => error.code === 'CFG_INVALID_RAW_VALUE');
    assert.equal(runtime.store.getState(), 'failed');
    assert.throws(() => runtime.store.getSnapshot(), (error) => error.code === 'CFG_INVALID_RAW_VALUE');
});

test('accepted properties are not silently lost across Loader, Store, and Reader', async () => {
    const value = Object.assign(Object.create(null), {zero: 0, empty: '', no: false, nil: null});
    const {runtime, operation} = await loadValue(value);
    await operation;
    assert.deepEqual(Object.keys(runtime.store.getSnapshot().TEQFW_WEB__VALUE), Object.keys(value));
    assert.deepEqual({...runtime.reader.get('TEQFW_WEB').VALUE}, {...value});
});
