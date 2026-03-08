// Set env required by modules that run at import time (e.g. cart.ts)
process.env.ENCRYPTION_KEY = process.env.ENCRYPTION_KEY ?? 'test-encryption-key';
