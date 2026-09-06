export const AUTH_RETURN_COOKIE = 'tajawang_auth_return';

export function safeAuthReturn(path: string | null | undefined): string {
  return path && /^\/(?:[A-Za-z0-9_-]+\/?)*$/.test(path) ? path : '/';
}
