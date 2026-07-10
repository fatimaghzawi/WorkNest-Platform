import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { SystemLog } from '../../../../types/log';
import { formatDateTime } from '../../../../utils/format';

const LEVEL_LABELS = {
  info: 'Info',
  warning: 'Warning',
  error: 'Error',
} as const;

function MetaBlock({ meta }: { meta: Record<string, unknown> }) {
  return (
    <pre className="wn-log-entry__meta-json">
      {JSON.stringify(meta, null, 2)}
    </pre>
  );
}

function LogEntry({ log }: { log: SystemLog }) {
  const [open, setOpen] = useState(false);
  const hasDetails =
    Boolean(log.path) ||
    Boolean(log.actorEmail) ||
    Boolean(log.ip) ||
    Boolean(log.meta) ||
    log.statusCode !== null;

  return (
    <article className={`wn-log-entry wn-log-entry--${log.level}`}>
      <div className="wn-log-entry__main">
        <time className="wn-log-entry__time" dateTime={log.createdAt || undefined}>
          {log.createdAt ? formatDateTime(log.createdAt) : '—'}
        </time>

        <span className={`wn-log-entry__level wn-log-entry__level--${log.level}`}>
          {LEVEL_LABELS[log.level]}
        </span>

        <span className="wn-log-entry__source">{log.source}</span>

        {log.statusCode !== null && (
          <span className="wn-log-entry__status">{log.statusCode}</span>
        )}

        <p className="wn-log-entry__message">{log.message}</p>

        {hasDetails && (
          <button
            type="button"
            className="wn-log-entry__toggle"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label={open ? 'Hide log details' : 'Show log details'}
          >
            {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        )}
      </div>

      {open && hasDetails && (
        <div className="wn-log-entry__details">
          {log.method && log.path && (
            <p>
              <span>Request</span>
              <code>
                {log.method} {log.path}
              </code>
            </p>
          )}
          {log.category && (
            <p>
              <span>Category</span>
              <strong>{log.category}</strong>
            </p>
          )}
          {log.actorEmail && (
            <p>
              <span>Actor</span>
              <strong>{log.actorEmail}</strong>
            </p>
          )}
          {log.ip && (
            <p>
              <span>IP</span>
              <strong>{log.ip}</strong>
            </p>
          )}
          {log.meta && <MetaBlock meta={log.meta} />}
        </div>
      )}
    </article>
  );
}

export default function LogStream({ logs }: { logs: SystemLog[] }) {
  return (
    <div className="wn-log-stream" role="log" aria-live="polite" aria-relevant="additions">
      {logs.map((log) => (
        <LogEntry key={log._id} log={log} />
      ))}
    </div>
  );
}
