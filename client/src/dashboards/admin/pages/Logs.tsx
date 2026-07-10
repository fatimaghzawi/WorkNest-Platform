import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import { logsApi } from '../../../api/logs.api';
import Button from '../../../components/common/Button';
import Pagination from '../../../components/common/Pagination';
import DashboardPageHeader from '../../_shared/DashboardPageHeader';
import LogsOverview from '../components/logs/LogsOverview';
import LogStream from '../components/logs/LogStream';
import type { LogLevelFilter, LogStats, SystemLog } from '../../../types/log';
import { useToast } from '../../../hooks/useToast';
import { getApiErrorMessage } from '../../../utils/apiError';
import '../../../css/DesignSystem.css';
import '../../../css/AdminAnalytics.css';
import '../../../css/DashboardFeatures.css';
import '../../../css/LogsAdmin.css';

const LEVEL_FILTERS: { value: LogLevelFilter; label: string; className?: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'info', label: 'Info', className: 'info' },
  { value: 'warning', label: 'Warnings', className: 'warning' },
  { value: 'error', label: 'Errors', className: 'error' },
];

const emptyStats: LogStats = {
  total: 0,
  info: 0,
  warning: 0,
  error: 0,
  last24h: { total: 0, warning: 0, error: 0 },
};

export default function AdminLogs() {
  const toast = useToast();
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [stats, setStats] = useState<LogStats>(emptyStats);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [levelFilter, setLevelFilter] = useState<LogLevelFilter>('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      const response = await logsApi.getStats();
      setStats(response.data.data);
    } catch (error) {
      toast.warning(getApiErrorMessage(error, 'Could not refresh log overview stats.'));
    }
  }, [toast]);

  const loadLogs = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await logsApi.list({
        page,
        limit: 20,
        level: levelFilter === 'all' ? undefined : levelFilter,
        search: search || undefined,
      });
      setLogs(response.data.data);
      setTotalPages(response.data.meta?.totalPages || 1);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load logs.'));
      setLogs([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [page, levelFilter, search, toast]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const refreshAll = async () => {
    await Promise.all([loadLogs(true), loadStats()]);
    toast.success('Logs refreshed.');
  };

  if (loading && logs.length === 0) {
    return (
      <div className="wn-logs-page wn-analytics">
        <DashboardPageHeader
          hero
          eyebrow="Admin"
          title="System logs"
          subtitle="Loading audit trail..."
        />
        <div className="wn-logs-overview wn-logs-overview--loading" aria-hidden>
          <div className="wn-logs-overview__spotlight" />
          <div className="wn-logs-overview__tiles">
            <div className="wn-logs-overview__tile" />
            <div className="wn-logs-overview__tile" />
            <div className="wn-logs-overview__tile" />
          </div>
        </div>
        <div className="wn-logs-console">
          <div className="wn-logs-console__body wn-logs-console__body--loading">
            Reading log stream...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wn-logs-page wn-analytics">
      <DashboardPageHeader
        hero
        eyebrow="Admin"
        title="System logs"
        subtitle="Audit trail for authentication, API warnings, and application errors."
        actions={
          <Button
            variant="outline"
            leftIcon={<RefreshCw size={16} />}
            onClick={refreshAll}
            disabled={loading}
          >
            Refresh
          </Button>
        }
      />

      <LogsOverview stats={stats} />

      <div className="wn-logs-toolbar">
        <div className="wn-logs-filters" role="tablist" aria-label="Filter by log level">
          {LEVEL_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              role="tab"
              aria-selected={levelFilter === filter.value}
              className={[
                'wn-logs-filter',
                filter.className ? `wn-logs-filter--${filter.className}` : '',
                levelFilter === filter.value ? 'wn-logs-filter--active' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => {
                setLevelFilter(filter.value);
                setPage(1);
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <label className="wn-logs-search">
          <span className="wn-sr-only">Search logs</span>
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search message, source, path, email..."
            aria-label="Search logs"
          />
        </label>
      </div>

      <section className="wn-logs-console" aria-label="Log viewer">
        <header className="wn-logs-console__header">
          <div className="wn-logs-console__dots" aria-hidden>
            <span />
            <span />
            <span />
          </div>
          <p className="wn-logs-console__title">worknest.log — live stream</p>
          <Search size={14} color="rgba(255,255,255,0.35)" aria-hidden />
        </header>

        <div className="wn-logs-console__body">
          {logs.length === 0 ? (
            <div className="wn-logs-console__body--empty">
              <p>No logs found</p>
              <span>
                {levelFilter !== 'all' || search
                  ? 'Try clearing filters or broadening your search.'
                  : 'Events appear here as the API records warnings and errors.'}
              </span>
            </div>
          ) : (
            <LogStream logs={logs} />
          )}
        </div>
      </section>

      {totalPages > 1 && (
        <div className="wn-logs-pagination">
          <Pagination totalPages={totalPages} currentPage={page} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
