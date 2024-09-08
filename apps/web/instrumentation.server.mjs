import * as Sentry from '@sentry/remix';

Sentry.init({
	autoInstrumentRemix: true,
	dsn: 'https://a2413a79501942ae9580c3a12c4addb2@o4504862915297280.ingest.us.sentry.io/4504862916476928',
	environment: process.env.NODE_ENV,
	tracesSampleRate: 1,
});
