import { Fragment } from 'react';

import * as gtag from '../lib/gtag';

export function GoogleAnalytics() {
	return (
		<Fragment>
			{gtag.trackingIds.map((id) => (
				<script async key={id} src={`https://www.googletagmanager.com/gtag/js?id=${id}`} />
			))}
			<script
				async
				dangerouslySetInnerHTML={{
					__html: gtagInitScript,
				}}
				id="gtag-init"
			/>
		</Fragment>
	);
}

const gtagInitScript = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
${gtag.trackingIds.map((id) => `gtag('config', '${id}', {page_path: window.location.pathname});`).join('\n')}
`;

export function MetaAnalytics() {
	return (
		<Fragment>
			<script dangerouslySetInnerHTML={{ __html: metaInitScript }} />
			<noscript
				dangerouslySetInnerHTML={{
					__html: `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"/>`,
				}}
			/>
		</Fragment>
	);
}

const pixelId = '145925746089592';

const metaInitScript = `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}');
fbq('track', 'PageView');
`;
