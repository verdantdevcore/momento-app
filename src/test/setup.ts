import { vi } from 'vitest'

// Several lib modules build clients at import time from these env vars
// (`createClient(process.env.X!, ...)`, `cloudinary.config(...)`). The values
// are never used against a real service in unit tests — every network client
// is mocked below — but they must be present and non-empty so those top-level
// constructors don't throw the moment a route file is imported.
process.env.NEXT_PUBLIC_SUPABASE_URL ??= 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= 'anon-test-key'
process.env.SUPABASE_SERVICE_ROLE_KEY ??= 'service-role-test-key'
process.env.NEXT_PUBLIC_APP_URL ??= 'https://sharemomento.app'
process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ??= 'test-cloud'
process.env.CLOUDINARY_API_KEY ??= 'test-cloudinary-key'
process.env.CLOUDINARY_API_SECRET ??= 'test-cloudinary-secret'

// The Upstash clients reach out to Redis/QStash on construction or use. Stub
// the packages so importing a route (or upload-security) never opens a socket.
vi.mock('@upstash/redis', () => ({
  Redis: class {
    static fromEnv() {
      return new this()
    }
  },
}))

vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: class {
    static slidingWindow() {
      return {}
    }
    limit = vi.fn()
  },
}))

// verifySignatureAppRouter normally wraps a handler with QStash request-
// signature verification. In unit tests we exercise the handler directly, so
// the wrapper is a pass-through.
vi.mock('@upstash/qstash/nextjs', () => ({
  verifySignatureAppRouter: (handler: unknown) => handler,
}))
