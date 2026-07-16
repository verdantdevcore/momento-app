/**
 * Where the chosen theme is persisted.
 *
 * This lives here rather than in theme-context.tsx because both the client
 * provider and the root layout's server-rendered inline script need it, and
 * theme-context.tsx is a 'use client' module: importing a value out of one into
 * a Server Component hands back a client-reference stub instead of the string,
 * which silently interpolates a throwing function body into the script.
 */
export const THEME_STORAGE_KEY = 'momento-theme'
