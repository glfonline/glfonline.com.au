// One local HTTP server standing in for every external service the coordinator talks to:
//   POST /sanity-cdn/graphql, /sanity-api/graphql, /shopify/graphql   upstream content
//   POST /github/repos/:owner/:repo/actions/workflows/:file/dispatches workflow_dispatch
//   POST /github/repos/:owner/:repo/git/refs                           create a ref (ref-push)
//   DELETE /github/repos/:owner/:repo/git/refs/heads/<name>            delete a ref
//   GET  /github/repos/:owner/:repo/git/matching-refs/heads/<prefix>   list refs by prefix
//   GET  /github/repos/:owner/:repo                                    token check (permissions)
//   POST /resend/emails                                                alert email
//   POST /hc/:id[/fail]                                                Healthchecks pings
//   GET  /origin/__content.json                                        the live web Worker
// The smoke scenario (and test/coordinator.test.mjs) drive it in-process through `state`.
import http from 'node:http';

const UPSTREAM_PATH = /^\/(sanity-cdn|sanity-api|shopify)\/graphql$/;
const GITHUB_REPO = /^\/github\/repos\/[^/]+\/[^/]+$/;
const GIT_REFS = /^\/github\/repos\/[^/]+\/[^/]+\/git\/refs$/;
const GIT_REF = /^\/github\/repos\/[^/]+\/[^/]+\/git\/refs\/(heads\/.+)$/;
const GIT_MATCHING = /^\/github\/repos\/[^/]+\/[^/]+\/git\/matching-refs\/(heads\/.*)$/;

export async function startFakeServices() {
	const state = {
		bodies: new Map(), // requestBody -> operationName
		api: {}, // operationName -> response body (authoritative content)
		cdn: {}, // operationName -> response body override (CDN lag); falls back to api
		upstreamMode: 'ok', // 'ok' | 'fail'
		githubMode: 'ok',
		refsMode: 'ok', // 'ok' | 'fail' (git refs API returns 500)
		refs: new Map(), // 'refs/heads/<name>' -> sha
		resendMode: 'ok', // 'ok' | 'fail' | 'echo' (500 whose body echoes the recipients and auth header)
		live: null, // __content.json object, or null for 404
		log: { upstream: [], github: [], refs: [], resend: [], hc: [], live: 0 },
	};

	const server = http.createServer(async (req, res) => {
		let body = '';
		for await (const chunk of req) body += chunk;
		const url = new URL(req.url, 'http://fake');
		const send = (status, payload, type = 'application/json') => {
			res.writeHead(status, { 'content-type': type });
			res.end(typeof payload === 'string' ? payload : JSON.stringify(payload));
		};
		const path = url.pathname;

		const upstream = path.match(UPSTREAM_PATH);
		if (upstream && req.method === 'POST') {
			const host = upstream[1];
			const op = state.bodies.get(body);
			state.log.upstream.push({
				host,
				op: op ?? null,
				shopifyToken: req.headers['x-shopify-storefront-access-token'] ?? null,
			});
			if (state.upstreamMode === 'fail') return send(503, { error: 'upstream down' });
			if (!op) return send(200, { errors: [{ message: 'unknown request body' }] });
			const payload = host === 'sanity-cdn' ? (state.cdn[op] ?? state.api[op]) : state.api[op];
			return send(200, payload);
		}
		if (path.startsWith('/github/') && path.endsWith('/dispatches') && req.method === 'POST') {
			state.log.github.push({ path, auth: req.headers.authorization, body: JSON.parse(body) });
			if (state.githubMode === 'fail') return send(500, { message: 'GitHub is having a moment' });
			res.writeHead(204);
			return res.end();
		}
		if (GITHUB_REPO.test(path) && req.method === 'GET') {
			state.log.refs.push({ method: req.method, path, auth: req.headers.authorization });
			res.writeHead(state.githubMode === 'fail' ? 401 : 200, {
				'content-type': 'application/json',
				'x-accepted-github-permissions': 'metadata=read',
				'github-authentication-token-expiration': '2026-12-31 00:00:00 UTC',
			});
			return res.end(
				JSON.stringify(
					state.githubMode === 'fail'
						? { message: 'Bad credentials' }
						: { full_name: 'glfonline/glfonline.com.au', permissions: { admin: false, push: true, pull: true } },
				),
			);
		}
		const refsCall = path.match(GIT_REFS) ?? path.match(GIT_REF) ?? path.match(GIT_MATCHING);
		if (refsCall) {
			const entry = {
				method: req.method,
				path,
				auth: req.headers.authorization,
				body: body ? JSON.parse(body) : null,
				status: null,
			};
			state.log.refs.push(entry);
			const reply = (status, payload) => {
				entry.status = status;
				return send(status, payload);
			};
			if (state.refsMode === 'fail') return reply(500, { message: 'GitHub refs API is having a moment' });
			if (GIT_REFS.test(path) && req.method === 'POST') {
				const { ref, sha } = entry.body;
				if (state.refs.has(ref)) return reply(422, { message: 'Reference already exists' });
				state.refs.set(ref, sha);
				return reply(201, { ref, object: { sha, type: 'commit' } });
			}
			if (GIT_REF.test(path) && req.method === 'DELETE') {
				const ref = `refs/${path.match(GIT_REF)[1]}`;
				if (!state.refs.delete(ref)) return reply(422, { message: 'Reference does not exist' });
				entry.status = 204;
				res.writeHead(204);
				return res.end();
			}
			if (GIT_MATCHING.test(path) && req.method === 'GET') {
				const prefix = `refs/${path.match(GIT_MATCHING)[1]}`;
				const rows = [...state.refs]
					.filter(([ref]) => ref.startsWith(prefix))
					.map(([ref, sha]) => ({ ref, object: { sha, type: 'commit' } }));
				return reply(200, rows);
			}
		}
		if (path === '/resend/emails' && req.method === 'POST') {
			const message = JSON.parse(body);
			state.log.resend.push({ auth: req.headers.authorization, ...message });
			if (state.resendMode === 'fail') return send(500, { message: 'resend down' });
			if (state.resendMode === 'echo') {
				return send(500, { message: `rejected ${message.to.join(',')} with ${req.headers.authorization}` });
			}
			return send(200, { id: `email-${state.log.resend.length}` });
		}
		if (path.startsWith('/hc/')) {
			state.log.hc.push({ path, body });
			return send(200, 'OK', 'text/plain');
		}
		if (path === '/origin/__content.json' && req.method === 'GET') {
			state.log.live++;
			return state.live ? send(200, state.live) : send(404, 'not found', 'text/plain');
		}
		return send(404, { error: `fake: no route ${req.method} ${path}` });
	});

	await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
	const url = `http://127.0.0.1:${server.address().port}`;
	return {
		url,
		state,
		close: () =>
			new Promise((resolve) => {
				server.closeAllConnections();
				server.close(resolve);
			}),
	};
}
