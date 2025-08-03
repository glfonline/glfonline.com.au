import * as Sentry from '@sentry/remix';

// Only run Sentry in production mode
if (import.meta.env.PROD) {
	Sentry.init({
		autoInstrumentRemix: true,
		dsn: 'https://a2413a79501942ae9580c3a12c4addb2@o4504862915297280.ingest.us.sentry.io/4504862916476928',
		environment: import.meta.env.MODE,
		tracesSampleRate: 1,
	});
}
