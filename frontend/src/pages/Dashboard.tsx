import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { useDashboardStats, useRecentApplications, useFollowUps, useCreateApplication } from '@/api/applications';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useUIStore } from '@/stores/uiStore';
import { STATUS_OPTIONS } from '@/types';
import { formatDate } from '@/utils/date';
import { getTodayString } from '@/utils/date';

export function Dashboard() {
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickForm, setQuickForm] = useState({
    company_name: '',
    position_title: '',
    status: 'applied' as (typeof STATUS_OPTIONS)[number]['value'],
    date_applied: getTodayString(),
  });

  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentApps, isLoading: recentLoading } = useRecentApplications();
  const { data: followUps, isLoading: followUpsLoading } = useFollowUps();
  const createMutation = useCreateApplication();
  const addToast = useUIStore((s) => s.addToast);

  const handleQuickChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setQuickForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuickSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        ...quickForm,
        job_type: 'full_time',
        work_location_type: 'onsite',
      });
      addToast('Application created', 'success');
      setQuickForm({
        company_name: '',
        position_title: '',
        status: 'applied',
        date_applied: getTodayString(),
      });
      setShowQuickAdd(false);
    } catch {
      addToast('Failed to create application', 'error');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowQuickAdd((v) => !v)}
            className="btn btn-secondary"
          >
            {showQuickAdd ? 'Close Quick Add' : 'Quick Add'}
          </button>
          <Link to="/applications/new" className="btn btn-primary">
            + New Application
          </Link>
        </div>
      </div>

      {showQuickAdd && (
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Quick Add Application</h2>
              <p className="text-sm text-gray-500">
                Capture the basics now and fill in details later.
              </p>
            </div>
            <Link to="/applications/new" className="text-blue-600 hover:underline text-sm">
              Use full form →
            </Link>
          </div>
          <form
            onSubmit={handleQuickSubmit}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
          >
            <div>
              <label className="label">Company *</label>
              <input
                name="company_name"
                value={quickForm.company_name}
                onChange={handleQuickChange}
                required
                className="input"
                placeholder="Acme Corp"
              />
            </div>
            <div className="w-full min-w-0">
              <label className="label">Position *</label>
              <input
                name="position_title"
                value={quickForm.position_title}
                onChange={handleQuickChange}
                required
                className="input"
                placeholder="Product Manager"
              />
            </div>
            <div className="w-full min-w-0">
              <label className="label">Status</label>
              <select
                name="status"
                value={quickForm.status}
                onChange={handleQuickChange}
                className="input"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full min-w-0">
              <label className="label">Date Applied</label>
              <input
                type="date"
                name="date_applied"
                value={quickForm.date_applied}
                onChange={handleQuickChange}
                className="input"
                required
              />
            </div>
            <div className="md:col-span-4 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowQuickAdd(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Applications"
          value={stats?.total_applications || 0}
          loading={statsLoading}
        />
        <StatCard label="Applied" value={stats?.applied_count || 0} loading={statsLoading} />
        <StatCard
          label="Interviewing"
          value={stats?.interviewing_count || 0}
          loading={statsLoading}
        />
        <StatCard label="Offers" value={stats?.offers_count || 0} loading={statsLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Follow-ups */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Pending Follow-ups</h2>
            <Link to="/follow-ups" className="text-sm text-blue-600 hover:underline">
              View All
            </Link>
          </div>
          {followUpsLoading ? (
            <div className="text-gray-500">Loading...</div>
          ) : followUps?.length ? (
            <ul className="space-y-3">
              {followUps.slice(0, 5).map((app) => (
                <li
                  key={app.id}
                  className={clsx(
                    'p-3 border-l-4 rounded bg-gray-50',
                    app.is_overdue ? 'border-red-500' : 'border-gray-300'
                  )}
                >
                  <Link
                    to={`/applications/${app.id}`}
                    className="font-medium hover:text-blue-600"
                  >
                    {app.position_title}
                  </Link>
                  <div className="text-sm text-gray-500">{app.company_name}</div>
                  <div
                    className={clsx(
                      'text-sm',
                      app.is_overdue && 'text-red-600 font-medium'
                    )}
                  >
                    {formatDate(app.follow_up_date)}
                    {app.is_overdue && ' (OVERDUE)'}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No pending follow-ups.</p>
          )}
        </div>

        {/* Recent Applications */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Applications</h2>
            <Link to="/applications" className="text-sm text-blue-600 hover:underline">
              View All
            </Link>
          </div>
          {recentLoading ? (
            <div className="text-gray-500">Loading...</div>
          ) : recentApps?.length ? (
            <ul className="space-y-3">
              {recentApps.map((app) => (
                <li key={app.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <Link
                      to={`/applications/${app.id}`}
                      className="font-medium hover:text-blue-600"
                    >
                      {app.company_name}
                    </Link>
                    <div className="text-sm text-gray-500">{app.position_title}</div>
                  </div>
                  <StatusBadge status={app.status} label={app.status_display} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No recent applications.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  loading,
}: {
  label: string;
  value: number;
  loading: boolean;
}) {
  return (
    <div className="card text-center">
      <div className="text-4xl font-bold text-slate-800">
        {loading ? '-' : value}
      </div>
      <div className="text-sm text-gray-500 uppercase tracking-wide mt-1">{label}</div>
    </div>
  );
}
