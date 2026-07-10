export type EmailComposeOptions = { subject?: string; body?: string };

export function buildMailtoUrl(email: string, options?: EmailComposeOptions): string {
  const address = email.trim();
  if (!address) return '';

  const parts: string[] = [];
  if (options?.subject) parts.push(`subject=${encodeURIComponent(options.subject)}`);
  if (options?.body) parts.push(`body=${encodeURIComponent(options.body)}`);
  const query = parts.join('&');
  return query ? `mailto:${address}?${query}` : `mailto:${address}`;
}

/** Gmail web compose — opens reliably in the browser. */
export function buildGmailComposeUrl(email: string, options?: EmailComposeOptions): string {
  const address = email.trim();
  if (!address) return '';

  const params = new URLSearchParams({ view: 'cm', to: address });
  if (options?.subject) params.set('su', options.subject);
  if (options?.body) params.set('body', options.body);
  return `https://mail.google.com/mail/?${params.toString()}`;
}

/** Outlook web compose. */
export function buildOutlookComposeUrl(email: string, options?: EmailComposeOptions): string {
  const address = email.trim();
  if (!address) return '';

  const params = new URLSearchParams({ to: address });
  if (options?.subject) params.set('subject', options.subject);
  if (options?.body) params.set('body', options.body);
  return `https://outlook.live.com/mail/0/deeplink/compose?${params.toString()}`;
}

/**
 * Opens email compose in a new browser tab (Gmail web).
 * Works without a desktop mail app configured on Windows.
 */
export function openEmailCompose(email: string, options?: EmailComposeOptions): void {
  const url = buildGmailComposeUrl(email, options);
  if (!url) return;
  window.open(url, '_blank', 'noopener,noreferrer');
}

/** @deprecated Use openEmailCompose */
export const openMailto = openEmailCompose;
