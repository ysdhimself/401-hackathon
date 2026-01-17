import { Link } from 'react-router-dom';
import { useApplications } from '@/api/applications';
import { useUIStore } from '@/stores/uiStore';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatDate } from '@/utils/date';
import { STATUS_OPTIONS, JOB_TYPE_OPTIONS, WORK_LOCATION_OPTIONS } from '@/types';

export function ApplicationList() {
  const { filters, setFilters, resetFilters } = useUIStore();
  const { data, isLoading } = useApplications(filters);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Applications</h1>
        <Link to="/applications/new" className="btn btn-primary">
          + New Application
        </Link>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="label">Search</label>
            <input
              type="text"
              className="input"
              placeholder="Company or position..."
              value={filters.search || ''}
              onChange={(e) => setFilters({ search: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Status</label>
            <select
              className="input"
              value={filters.status || ''}
              onChange={(e) => setFilters({ status: e.target.value as typeof filters.status })}
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Job Type</label>
            <select
              className="input"
              value={filters.job_type || ''}
              onChange={(e) => setFilters({ job_type: e.target.value as typeof filters.job_type })}
            >
              <option value="">All Types</option>
              {JOB_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Location</label>
            <select
              className="input"
              value={filters.work_location_type || ''}
              onChange={(e) =>
                setFilters({ work_location_type: e.target.value as typeof filters.work_location_type })
              }
            >
              <option value="">All Locations</option>
              {WORK_LOCATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <button onClick={resetFilters} className="btn btn-secondary">
            Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : !data?.results.length ? (
          <div className="p-8 text-center text-gray-500">
            No applications found.{' '}
            <Link to="/applications/new" className="text-blue-600 hover:underline">
              Add your first one!
            </Link>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                    Company
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                    Position
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                    Date Applied
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.results.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        to={`/applications/${app.id}`}
                        className="font-medium text-gray-900 hover:text-blue-600"
                      >
                        {app.company_name}
                      </Link>
                      {app.location && (
                        <div className="text-sm text-gray-500">{app.location}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{app.position_title}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={app.status} label={app.status_display} />
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm">
                      {app.job_type_display}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm">
                      {formatDate(app.date_applied)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {data.count > 20 && (
              <div className="px-4 py-3 border-t flex justify-between items-center">
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
          </>
        )}
      </div>
    </div>
  );
}
