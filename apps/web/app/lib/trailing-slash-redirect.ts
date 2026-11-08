/** Redirects any path with trailing slashes to its canonical form, preserving method and query. */
export function trailingSlashRedirect(request: Request): Response | null {
	const url = new URL(request.url);
	const { pathname } = url;

	// Scan back from the end rather than using a regex, which backtracks
	// quadratically on long slash runs that do not end the path.
	let end = pathname.length;
	while (end > 1 && pathname[end - 1] === '/') end--;
	if (end === pathname.length) return null;

	url.pathname = pathname.slice(0, end);
	return Response.redirect(url.toString(), 308);
}
