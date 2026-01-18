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
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(
    STATUS_OPTIONS.map((status) => status.value)
  );
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
  const appliedCount = stats?.applied_count ?? 0;
  const interviewingCount = stats?.interviewing_count ?? 0;
  const statusCounts = stats?.status_counts ?? {};
  const statusData = STATUS_OPTIONS.map((status) => ({
    ...status,
    count: statusCounts[status.value] ?? 0,
    color: STATUS_COLORS[status.value],
  }));
  const chartStatuses = statusData.filter((status) => selectedStatuses.includes(status.value));

  const handleQuickChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setQuickForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleStatusToggle = (value: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(value) ? prev.filter((status) => status !== value) : [...prev, value]
    );
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
        <StatCard label="Applied" value={appliedCount} loading={statsLoading} />
        <StatCard
          label="Interviewing"
          value={interviewingCount}
          loading={statsLoading}
        />
        <StatCard label="Offers" value={stats?.offers_count || 0} loading={statsLoading} />
      </div>

      <div className="card mb-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <FilterIcon />
            <h2 className="text-lg font-semibold">Application Status Mix</h2>
          </div>
          <span className="text-sm text-gray-500">Select any statuses</span>
        </div>
        {statsLoading ? (
          <div className="text-gray-500">Loading chart...</div>
        ) : (
          <div className="flex flex-col md:flex-row items-start gap-6">
            <StatusPieChart segments={chartStatuses} />
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              {statusData.map((status) => (
                <button
                  key={status.value}
                  type="button"
                  onClick={() => handleStatusToggle(status.value)}
                  className={clsx(
                    'flex items-center gap-2 rounded-md px-2 py-1 text-left transition-colors',
                    selectedStatuses.includes(status.value)
                      ? 'bg-white/70 font-semibold text-gray-700'
                      : 'text-gray-400 hover:text-gray-600'
                  )}
                >
                  <span className="inline-flex h-3 w-3 rounded-full" style={{ backgroundColor: status.color }} />
                  {status.label}: {status.count}
                </button>
              ))}
            </div>
          </div>
        )}
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

function StatusPieChart({
  segments,
}: {
  segments: { value: string; label: string; count: number; color: string }[];
}) {
  const total = segments.reduce((sum, segment) => sum + segment.count, 0);
  const radius = 42;
  const stroke = 12;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-4">
      <svg width="120" height="120" viewBox="0 0 120 120" className="shrink-0">
        <g transform="translate(60 60) rotate(-90)">
          <circle r={radius} cx="0" cy="0" stroke="#E5E7EB" strokeWidth={stroke} fill="none" />
          {total > 0 &&
            segments
              .filter((segment) => segment.count > 0)
              .map((segment) => {
                const length = (segment.count / total) * circumference;
                const segmentOffset = offset;
                offset += length;
                return (
                  <circle
                    key={segment.value}
                    r={radius}
                    cx="0"
                    cy="0"
                    stroke={segment.color}
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={`${length} ${circumference}`}
                    strokeDashoffset={-segmentOffset}
                  />
                );
              })}
        </g>
        <text
          x="60"
          y="62"
          textAnchor="middle"
          className="fill-gray-600 text-sm font-medium"
        >
          {total}
        </text>
      </svg>
      {total === 0 && <span className="text-sm text-gray-500">No data yet.</span>}
    </div>
  );
}

function FilterIcon() {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      className="text-gray-500"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 5h18M6 12h12M10 19h4" />
    </svg>
  );
}

const STATUS_COLORS: Record<string, string> = {
  applied: '#DBEAFE',
  phone_screen: '#FFEDD5',
  interview: '#FFEDD5',
  technical: '#EDE9FE',
  onsite: '#FCE7F3',
  offered: '#DCFCE7',
  accepted: '#BBF7D0',
  rejected: '#FEE2E2',
  withdrawn: '#F3F4F6',
};
