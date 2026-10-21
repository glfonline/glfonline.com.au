import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { canonicalJson, contentHashOf, entryHash, manifestIdOf, sha256 } from '../src/content-hash.mjs';

const nodeSha = (s) => createHash('sha256').update(s, 'utf8').digest('hex');
const BUILD_SIDE = fileURLToPath(new URL('../../../scripts/static-homepage/content-hash.mjs', import.meta.url));

const FIXTURE_ENTRIES = [
	{
		source: 'shopify',
		operationName: 'SHOP_QUERY',
		requestBody: '{"query":"query Shop { shop { name } }"}',
		response: { body: '{"data":{"shop":{"name":"GLF","id":"gid://1"}}}' },
	},
	{
		source: 'sanity',
		operationName: 'MAIN_NAVIGATION_QUERY',
		requestBody: '{"query":"query Nav { nav { label } }"}',
		response: { body: '{"data":{"nav":[{"label":"Ladies","href":"/ladies","sub":[{"z":1,"a":2}]}],"_k":null}}' },
	},
	{
		source: 'sanity',
		operationName: 'HOME_PAGE_QUERY',
		requestBody: '{"query":"query Home($id: ID!) { HomePage(id: $id) { heading } }","variables":{"id":"home"}}',
		response: {
			body: '{"data":{"HomePage":{"heading":["é","\\u00e9\\n","\\ud83c\\udfcc️"],"n":1.0,"e":1e3,"10":"ten","2":"two","b":"x","_id":"home"}}}',
		},
	},
];

describe('content hash', () => {
	test('sha256 matches node:crypto, including non-ASCII and lone surrogates', async () => {
		for (const s of ['', 'abc', 'é🏌️', 'lone \ud800 surrogate']) assert.equal(await sha256(s), nodeSha(s));
	});

	test('canonicalJson sorts keys recursively, keeps array order, numbers as JSON.stringify emits', () => {
		assert.equal(
			canonicalJson({ b: 1, a: [{ d: 'x', c: null }, 2], é: true }),
			'{"a":[{"c":null,"d":"x"},2],"b":1,"é":true}',
		);
		assert.equal(
			canonicalJson(JSON.parse('{"n":1.0,"e":1e3,"s":"\\u00e9\\n","z":[]}')),
			'{"e":1000,"n":1,"s":"é\\n","z":[]}',
		);
		assert.equal(canonicalJson([3, 1, 2]), '[3,1,2]');
		assert.equal(canonicalJson({ B: 1, a: 2, _: 3 }), '{"B":1,"_":3,"a":2}');
		// Same construction as the build side: integer-like keys follow JavaScript property order.
		assert.equal(canonicalJson({ b: 1, 10: 2, 2: 3 }), '{"2":3,"10":2,"b":1}');
	});

	test('contentHash follows the contract and ignores key order', async () => {
		const entries = [
			{ operationName: 'SHOP_QUERY', response: { body: '{"data":{"y":1,"x":2}}' } },
			{ operationName: 'HOME_PAGE_QUERY', response: { body: '{"data": {"b":[1,{"k":"é","j":0}],"a":"x"}}' } },
		];
		const expected = nodeSha(
			`HOME_PAGE_QUERY\n${nodeSha('{"data":{"a":"x","b":[1,{"j":0,"k":"é"}]}}')}\nSHOP_QUERY\n${nodeSha('{"data":{"x":2,"y":1}}')}\n`,
		);
		assert.equal(await contentHashOf(entries), expected);
		const reordered = [
			{ operationName: 'HOME_PAGE_QUERY', response: { body: '{"data":{"a":"x","b":[1,{"j":0,"k":"é"}]}}' } },
			{ operationName: 'SHOP_QUERY', response: { body: '{"data":{"x":2,"y":1}}' } },
		];
		assert.equal(await contentHashOf(reordered), expected);
		const arrayOrderChanged = [
			reordered[0],
			{ operationName: 'SHOP_QUERY', response: { body: '{"data":{"x":[2,1],"y":1}}' } },
		];
		assert.notEqual(await contentHashOf(arrayOrderChanged), expected);
	});

	test('manifestId covers source, operationName and requestBody only, in operationName order', async () => {
		const entries = FIXTURE_ENTRIES.map(({ source, operationName, requestBody }) => ({
			source,
			operationName,
			requestBody,
		}));
		const sorted = [...entries].sort((a, b) => (a.operationName < b.operationName ? -1 : 1));
		const expected = nodeSha(
			`[${sorted.map((e) => `{"operationName":${JSON.stringify(e.operationName)},"requestBody":${JSON.stringify(e.requestBody)},"source":${JSON.stringify(e.source)}}`).join(',')}]`,
		);
		assert.equal(await manifestIdOf({ entries }), expected);
		assert.equal(await manifestIdOf({ entries: FIXTURE_ENTRIES }), expected, 'extra fields are ignored');
		const changed = entries.map((e) =>
			e.operationName === 'HOME_PAGE_QUERY' ? { ...e, requestBody: `${e.requestBody} ` } : e,
		);
		assert.notEqual(await manifestIdOf({ entries: changed }), expected);
	});

	test('invalid JSON body throws', async () => {
		await assert.rejects(contentHashOf([{ operationName: 'X', response: { body: '<html>' } }]), SyntaxError);
	});

	test('identical outputs to scripts/static-homepage/content-hash.mjs (build side)', {
		skip: !existsSync(BUILD_SIDE) && 'build-side file not present',
	}, async () => {
		const build = await import(BUILD_SIDE);
		const values = [
			JSON.parse(FIXTURE_ENTRIES[2].response.body),
			{ b: 1, 10: 2, 2: 3, a: { z: [{ y: 1, x: 2 }], __proto__x: 1 } },
			[null, true, 1.5e-7, 'é', { '': 0, ' ': 1 }],
			'plain',
		];
		for (const v of values) assert.equal(canonicalJson(v), build.canonicalJson(v));
		for (const e of FIXTURE_ENTRIES) assert.equal(await entryHash(e.response.body), build.entryHash(e.response.body));
		assert.equal(await contentHashOf(FIXTURE_ENTRIES), build.contentHashOf(FIXTURE_ENTRIES));
		assert.equal(await manifestIdOf({ entries: FIXTURE_ENTRIES }), build.manifestIdOf({ entries: FIXTURE_ENTRIES }));
		assert.equal(await sha256('é🏌️'), build.sha256('é🏌️'));
	});
});
