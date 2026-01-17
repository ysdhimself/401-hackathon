import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { useFollowUps } from '@/api/applications';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatDate } from '@/utils/date';

export function FollowUpList() {
  const { data: followUps, isLoading } = useFollowUps();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Pending Follow-ups</h1>

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : !followUps?.length ? (
        <div className="card text-center py-8">
          <p className="text-gray-500 mb-4">No pending follow-ups!</p>
          <Link to="/applications" className="text-blue-600 hover:underline">
            View all applications
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {followUps.map((app) => (
            <div
              key={app.id}
              className={clsx(
                'card border-l-4',
                app.is_overdue ? 'border-red-500 bg-red-50' : 'border-orange-400'
              )}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Link
                      to={`/applications/${app.id}`}
                      className="text-lg font-semibold hover:text-blue-600"
                    >
                      {app.position_title}
                    </Link>
                    <StatusBadge status={app.status} label={app.status_display} />
                  </div>
                  <p className="text-gray-600">{app.company_name}</p>
                  {app.location && (
                    <p className="text-sm text-gray-500">{app.location}</p>
                  )}
                </div>
                <div className="text-right">
                  <p
                    className={clsx(
                      'text-lg font-semibold',
                      app.is_overdue ? 'text-red-600' : 'text-orange-600'
                    )}
                  >
                    {formatDate(app.follow_up_date)}
                  </p>
                  {app.is_overdue && (
                    <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded mt-1">
                      OVERDUE
                    </span>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    Applied {formatDate(app.date_applied)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t">
                <Link to={`/applications/${app.id}`} className="btn btn-primary btn-sm">
                  View Details
                </Link>
                <Link to={`/applications/${app.id}/edit`} className="btn btn-secondary btn-sm">
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
