import { useState, type FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  useApplication,
  useDeleteApplication,
  useAddNote,
  useDeleteNote,
} from '@/api/applications';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useUIStore } from '@/stores/uiStore';
import { formatDate, formatDateTime } from '@/utils/date';

export function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: application, isLoading } = useApplication(Number(id));
  const deleteMutation = useDeleteApplication();
  const addNoteMutation = useAddNote();
  const deleteNoteMutation = useDeleteNote();
  const addToast = useUIStore((s) => s.addToast);

  const [noteContent, setNoteContent] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading application...</div>;
  }

  if (!application) {
    return <div className="text-center py-8 text-red-600">Application not found</div>;
  }

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(application.id);
      addToast('Application deleted', 'success');
      navigate('/applications');
    } catch {
      addToast('Failed to delete application', 'error');
    }
  };

  const handleAddNote = async (e: FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    try {
      await addNoteMutation.mutateAsync({
        applicationId: application.id,
        content: noteContent,
      });
      setNoteContent('');
      addToast('Note added', 'success');
    } catch {
      addToast('Failed to add note', 'error');
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    try {
      await deleteNoteMutation.mutateAsync({
        applicationId: application.id,
        noteId,
      });
      addToast('Note deleted', 'success');
    } catch {
      addToast('Failed to delete note', 'error');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold">{application.position_title}</h1>
          <p className="text-lg text-gray-600">{application.company_name}</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/applications/${application.id}/edit`} className="btn btn-primary">
            Edit
          </Link>
          <button onClick={() => setShowDeleteConfirm(true)} className="btn btn-danger">
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <StatusBadge status={application.status} label={application.status_display} />
              <span className="text-sm text-gray-500">
                Applied {formatDate(application.date_applied)}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Job Type</span>
                <p className="font-medium">{application.job_type_display}</p>
              </div>
              <div>
                <span className="text-gray-500">Location</span>
                <p className="font-medium">{application.location || '-'}</p>
              </div>
              <div>
                <span className="text-gray-500">Work Location</span>
                <p className="font-medium">{application.work_location_type_display}</p>
              </div>
              <div>
                <span className="text-gray-500">Salary</span>
                <p className="font-medium">{application.salary_range || '-'}</p>
              </div>
            </div>
            {application.job_url && (
              <div className="mt-4 pt-4 border-t">
                <a
                  href={application.job_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  View Job Posting &rarr;
                </a>
              </div>
            )}
          </div>

          {/* Description */}
          {application.job_description && (
            <div className="card">
              <h2 className="text-lg font-semibold mb-3">Job Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{application.job_description}</p>
            </div>
          )}

          {/* Notes */}
          {application.notes && (
            <div className="card">
              <h2 className="text-lg font-semibold mb-3">Notes</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{application.notes}</p>
            </div>
          )}

          {/* Activity Notes */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Activity Notes</h2>
            <form onSubmit={handleAddNote} className="mb-4">
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Add a note..."
                rows={3}
                className="input mb-2"
              />
              <button
                type="submit"
                disabled={addNoteMutation.isPending || !noteContent.trim()}
                className="btn btn-primary btn-sm"
              >
                {addNoteMutation.isPending ? 'Adding...' : 'Add Note'}
              </button>
            </form>
            {application.application_notes.length > 0 ? (
              <ul className="space-y-3">
                {application.application_notes.map((note) => (
                  <li key={note.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <p className="text-gray-700 whitespace-pre-wrap flex-1">{note.content}</p>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-red-500 hover:text-red-700 ml-2"
                        title="Delete note"
                      >
                        &times;
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {formatDateTime(note.created_at)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No activity notes yet.</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Follow-up */}
          <div
            className={clsx(
              'card',
              application.is_overdue && 'border-2 border-red-500'
            )}
          >
            <h2 className="text-lg font-semibold mb-3">Follow-up</h2>
            {application.follow_up_date ? (
              <>
                <p
                  className={clsx(
                    'text-lg font-medium',
                    application.is_overdue ? 'text-red-600' : 'text-gray-900'
                  )}
                >
                  {formatDate(application.follow_up_date)}
                </p>
                {application.is_overdue && (
                  <p className="text-red-600 text-sm mt-1">OVERDUE</p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  Reminder {application.reminder_days_before} day(s) before
                </p>
              </>
            ) : (
              <p className="text-gray-500">No follow-up date set</p>
            )}
          </div>

          {/* Contact */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-3">Contact</h2>
            {application.contact_name || application.contact_email || application.contact_phone ? (
              <div className="space-y-2 text-sm">
                {application.contact_name && (
                  <p>
                    <span className="text-gray-500">Name:</span> {application.contact_name}
                  </p>
                )}
                {application.contact_email && (
                  <p>
                    <span className="text-gray-500">Email:</span>{' '}
                    <a
                      href={`mailto:${application.contact_email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {application.contact_email}
                    </a>
                  </p>
                )}
                {application.contact_phone && (
                  <p>
                    <span className="text-gray-500">Phone:</span> {application.contact_phone}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No contact info</p>
            )}
          </div>

          {/* Additional Info */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-3">Additional Info</h2>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-gray-500">Resume Version:</span>{' '}
                {application.resume_version || '-'}
              </p>
              <p>
                <span className="text-gray-500">Cover Letter:</span>{' '}
                {application.cover_letter_sent ? 'Yes' : 'No'}
              </p>
              <p>
                <span className="text-gray-500">Created:</span>{' '}
                {formatDateTime(application.created_at)}
              </p>
              <p>
                <span className="text-gray-500">Updated:</span>{' '}
                {formatDateTime(application.updated_at)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Delete Application?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the application for{' '}
              <strong>{application.position_title}</strong> at{' '}
              <strong>{application.company_name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="btn btn-danger"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
