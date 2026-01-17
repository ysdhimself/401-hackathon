import {
  useGmailStatus,
  useGmailEmails,
  useGmailConnect,
  useFetchEmails,
  useDisconnectGmail,
} from '@/api/gmail';
import { useUIStore } from '@/stores/uiStore';
import { formatDateTime } from '@/utils/date';

export function GmailPage() {
  const { data: status, isLoading: statusLoading } = useGmailStatus();
  const { data: emails, isLoading: emailsLoading } = useGmailEmails();
  const connectMutation = useGmailConnect();
  const fetchMutation = useFetchEmails();
  const disconnectMutation = useDisconnectGmail();
  const addToast = useUIStore((s) => s.addToast);

  const handleConnect = async () => {
    try {
      await connectMutation.mutateAsync();
      addToast('Gmail connected successfully!', 'success');
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to connect Gmail', 'error');
    }
  };

  const handleFetch = async () => {
    try {
      const result = await fetchMutation.mutateAsync();
      addToast(`Fetched ${result.fetched} emails, stored ${result.stored} new`, 'success');
    } catch {
      addToast('Failed to fetch emails', 'error');
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectMutation.mutateAsync();
      addToast('Gmail disconnected', 'info');
    } catch {
      addToast('Failed to disconnect', 'error');
    }
  };

  if (statusLoading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>;
  }

  // Not connected
  if (!status?.connected) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Gmail Integration</h1>
        <div className="card max-w-md mx-auto text-center">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-xl font-semibold mb-2">Connect Your Gmail</h2>
          <p className="text-gray-600 mb-6">
            Connect your Gmail inbox to automatically track job application emails.
          </p>
          <button
            onClick={handleConnect}
            disabled={connectMutation.isPending}
            className="btn btn-primary"
          >
            {connectMutation.isPending ? 'Connecting...' : 'Sign in with Gmail'}
          </button>
          <p className="text-xs text-gray-500 mt-4">
            We only request read-only access to your emails.
          </p>
        </div>
      </div>
    );
  }

  // Connected
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gmail Emails</h1>
          <p className="text-gray-600">Connected as {status.account?.email}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleFetch}
            disabled={fetchMutation.isPending}
            className="btn btn-primary"
          >
            {fetchMutation.isPending ? 'Fetching...' : 'Refresh Emails'}
          </button>
          <button
            onClick={handleDisconnect}
            disabled={disconnectMutation.isPending}
            className="btn btn-secondary"
          >
            Disconnect
          </button>
        </div>
      </div>

      <div className="card">
        {emailsLoading ? (
          <div className="text-center py-8 text-gray-500">Loading emails...</div>
        ) : !emails?.length ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No emails fetched yet.</p>
            <button onClick={handleFetch} className="btn btn-primary">
              Fetch Emails Now
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                  Subject
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                  From
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                  Received
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {emails.map((email) => (
                <tr key={email.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">
                      {email.subject || '(No subject)'}
                    </p>
                    {email.snippet && (
                      <p className="text-sm text-gray-500 truncate max-w-md">
                        {email.snippet}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm">{email.sender}</td>
                  <td className="px-4 py-3 text-gray-600 text-sm">
                    {formatDateTime(email.received_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
