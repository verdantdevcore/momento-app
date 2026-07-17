import { vi } from 'vitest'
import { NextRequest } from 'next/server'

/**
 * A stand-in for a Supabase query builder. Every builder method
 * (`.select()`, `.eq()`, `.order()`, `.update()`, …) returns the same object,
 * so any chain length works, and awaiting the chain — whether after a terminal
 * `.single()`/`.maybeSingle()` or directly after `.eq()` on a write — resolves
 * to `result`. `result` is what a real query resolves to: `{ data, error }`.
 */
export function makeChain(result: unknown) {
  const proxy: unknown = new Proxy(function () {}, {
    get(_target, prop) {
      if (prop === 'then') {
        return (resolve: (v: unknown) => unknown, reject: (e: unknown) => unknown) =>
          Promise.resolve(result).then(resolve, reject)
      }
      // Any other property is a builder method that continues the chain.
      return () => proxy
    },
    apply() {
      return proxy
    },
  })
  return proxy
}

type QueryResult = { data?: unknown; error?: unknown }

/**
 * Builds a mock service-role Supabase client.
 *
 * `tableResults` maps a table name to the `{ data, error }` its chain resolves
 * to. A handler that queries the same table more than once (e.g. reading a row
 * then updating it) gets the same result each time — pass a function as the
 * value to vary it, or override `.from` on the returned client for finer control.
 */
export function makeAdminClient(tableResults: Record<string, QueryResult> = {}) {
  return {
    from: vi.fn((table: string) => makeChain(tableResults[table] ?? { data: null, error: null })),
    auth: {
      admin: {
        listUsers: vi.fn().mockResolvedValue({ data: { users: [] }, error: null }),
        getUserById: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        signOut: vi.fn().mockResolvedValue({ error: null }),
        deleteUser: vi.fn().mockResolvedValue({ error: null }),
      },
    },
  }
}

/** A mock browser/server Supabase client that only needs `auth.getUser()`. */
export function makeServerClient(user: { id: string } | null) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
    },
  }
}

/** Builds a NextRequest with a JSON body and the given headers. */
export function jsonRequest(
  body: unknown,
  { method = 'POST', headers = {}, url = 'https://sharemomento.app/api/test' }: {
    method?: string
    headers?: Record<string, string>
    url?: string
  } = {},
) {
  return new NextRequest(url, {
    method,
    headers: { 'content-type': 'application/json', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

/** A GET NextRequest (optionally with query string via `url`). */
export function getRequest(url = 'https://sharemomento.app/api/test', headers: Record<string, string> = {}) {
  return new NextRequest(url, { method: 'GET', headers })
}
