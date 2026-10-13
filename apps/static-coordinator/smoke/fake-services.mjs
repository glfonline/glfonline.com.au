// One local HTTP server standing in for every external service the coordinator talks to:
//   POST /sanity-cdn/graphql, /sanity-api/graphql, /shopify/graphql   upstream content
//   POST /github/repos/:owner/:repo/actions/workflows/:file/dispatches workflow_dispatch
//   POST /resend/emails                                                alert email
//   POST /hc/:id[/fail]                                                Healthchecks pings
//   GET  /origin/__content.json                                        the live web Worker
// The smoke scenario drives it in-process through the returned `state`.
import http from 'node:http';

const UPSTREAM_PATH = /^\/(sanity-cdn|sanity-api|shopify)\/graphql$/;

export async function startFakeServices() {
	const state = {
		bodies: new Map(), // requestBody -> operationName
		api: {}, // operationName -> response body (authoritative content)
		cdn: {}, // operationName -> response body override (CDN lag); falls back to api
		upstreamMode: 'ok', // 'ok' | 'fail'
		githubMode: 'ok',
		resendMode: 'ok',
		live: null, // __content.json object, or null for 404
		log: { upstream: [], github: [], resend: [], hc: [], live: 0 },
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
		if (path === '/resend/emails' && req.method === 'POST') {
			state.log.resend.push({ auth: req.headers.authorization, ...JSON.parse(body) });
			if (state.resendMode === 'fail') return send(500, { message: 'resend down' });
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
