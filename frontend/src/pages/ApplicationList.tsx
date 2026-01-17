import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { useApplications } from '@/api/applications';
import { useUIStore } from '@/stores/uiStore';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatDate } from '@/utils/date';
import { STATUS_OPTIONS } from '@/types';

export function ApplicationList() {
  const { filters, setFilters, resetFilters } = useUIStore();
  const { data, isLoading } = useApplications(filters);
  const statusFilters = [{ value: '', label: 'All' }, ...STATUS_OPTIONS];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Job Tracker</h1>
        <Link to="/applications/new" className="btn btn-primary">
          + New Application
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
        <aside className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Status
            </h2>
            <button onClick={resetFilters} className="text-xs text-blue-600 hover:underline">
              Reset
            </button>
          </div>
          <div className="space-y-2">
            {statusFilters.map((status) => (
              <button
                key={status.value || 'all'}
                onClick={() => setFilters({ status: status.value as typeof filters.status })}
                className={clsx(
                  'w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  filters.status === status.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {status.label}
              </button>
            ))}
          </div>
        </aside>

        <section className="card">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold">Job Descriptions</h2>
              <p className="text-sm text-gray-500">
                Track applications by stage with quick status filters.
              </p>
            </div>
            <input
              type="text"
              className="input max-w-sm"
              placeholder="Search by company or position..."
              value={filters.search || ''}
              onChange={(e) => setFilters({ search: e.target.value })}
            />
          </div>

          {isLoading ? (
            <div className="py-10 text-center text-gray-500">Loading...</div>
          ) : !data?.results.length ? (
            <div className="py-10 text-center text-gray-500">
              No applications found.{' '}
              <Link to="/applications/new" className="text-blue-600 hover:underline">
                Add your first one!
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {data.results.map((app) => (
                <div
                  key={app.id}
                  className="flex flex-col md:flex-row md:items-center gap-4 border border-gray-200 rounded-lg px-4 py-3 bg-gray-50"
                >
                  <div className="min-w-[120px]">
                    <StatusBadge status={app.status} label={app.status_display} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{app.position_title}</div>
                    <div className="text-sm text-gray-600">
                      {app.company_name}
                      {app.location ? ` • ${app.location}` : ''}
                    </div>
                    {app.job_description && (
                      <p className="text-sm text-gray-500 mt-1 whitespace-pre-wrap">
                        {app.job_description}
                      </p>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 md:text-right min-w-[160px]">
                    <div>Applied {formatDate(app.date_applied)}</div>
                    {app.follow_up_date && (
                      <div>Follow-up {formatDate(app.follow_up_date)}</div>
                    )}
                    <div className="mt-2 flex gap-3 md:justify-end">
                      <Link
                        to={`/applications/${app.id}`}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View
                      </Link>
                      <Link
                        to={`/applications/${app.id}/edit`}
                        className="text-gray-600 hover:underline text-sm"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {data?.count && data.count > 20 && (
            <div className="mt-4 pt-4 border-t flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {data.results.length} of {data.count} applications
              </div>
              <div className="flex gap-2">
                <button
                  disabled={!data.previous}
                  onClick={() => setFilters({ page: (filters.page || 1) - 1 })}
                  className="btn btn-secondary btn-sm"
                >
                  Previous
                </button>
                <button
                  disabled={!data.next}
                  onClick={() => setFilters({ page: (filters.page || 1) + 1 })}
                  className="btn btn-secondary btn-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
