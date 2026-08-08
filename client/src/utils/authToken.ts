/** In-memory access token only — never persist to storage (XSS-resistant). Cookies hold the session. */
let memoryToken: string | null = null;

export function getAccessToken(): string | null {
  return memoryToken;
}

export function setAccessToken(token: string): void {
  memoryToken = token;
}

export function clearAccessToken(): void {
  memoryToken = null;
}
