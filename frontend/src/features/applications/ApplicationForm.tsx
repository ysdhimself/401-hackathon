import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { JobApplication, JobApplicationInput } from '@/types';
import { STATUS_OPTIONS, JOB_TYPE_OPTIONS, WORK_LOCATION_OPTIONS } from '@/types';
import { useUIStore } from '@/stores/uiStore';
import { getTodayString } from '@/utils/date';
import { useMasterResumes, useDefaultMasterResume } from '@/api/masterResume';

interface ApplicationFormProps {
  initialData?: JobApplication;
  onSubmit: (data: JobApplicationInput) => Promise<unknown>;
  isSubmitting?: boolean;
}

export function ApplicationForm({ initialData, onSubmit, isSubmitting }: ApplicationFormProps) {
  const navigate = useNavigate();
  const addToast = useUIStore((s) => s.addToast);

  // Fetch master resumes for selection
  const { data: masterResumes } = useMasterResumes();
  const { data: defaultResume } = useDefaultMasterResume();
  const [showMasterResumeSelector, setShowMasterResumeSelector] = useState(false);

  const [formData, setFormData] = useState<JobApplicationInput>({
    company_name: initialData?.company_name || '',
    position_title: initialData?.position_title || '',
    status: initialData?.status || 'applied',
    date_applied: initialData?.date_applied || getTodayString(),
    job_type: initialData?.job_type || 'full_time',
    job_description: initialData?.job_description || '',
    job_url: initialData?.job_url || '',
    location: initialData?.location || '',
    work_location_type: initialData?.work_location_type || 'onsite',
    salary_min: initialData?.salary_min || '',
    salary_max: initialData?.salary_max || '',
    contact_name: initialData?.contact_name || '',
    contact_email: initialData?.contact_email || '',
    contact_phone: initialData?.contact_phone || '',
    follow_up_date: initialData?.follow_up_date || '',
    reminder_days_before: initialData?.reminder_days_before || 1,
    notes: initialData?.notes || '',
    resume_version: initialData?.resume_version || '',
    cover_letter_sent: initialData?.cover_letter_sent || false,
    master_resume: initialData?.master_resume || null,
  });

  const handleUseMasterResume = (resumeId: number | null) => {
    if (resumeId) {
      setFormData((prev) => ({
        ...prev,
        master_resume: resumeId,
      }));
      addToast('Master resume linked to this application', 'success');
      setShowMasterResumeSelector(false);
    }
  };

  const handleUseDefaultResume = () => {
    if (defaultResume) {
      handleUseMasterResume(defaultResume.id);
    } else {
      addToast('No default resume set. Please select a resume or create one.', 'info');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const payload: JobApplicationInput = {
      ...formData,
      date_applied: formData.date_applied || getTodayString(),
      follow_up_date: formData.follow_up_date || null,
      salary_min: formData.salary_min === '' ? null : formData.salary_min,
      salary_max: formData.salary_max === '' ? null : formData.salary_max,
    };

    try {
      await onSubmit(payload);
      addToast('Application saved successfully!', 'success');
      navigate('/applications');
    } catch {
      addToast('Failed to save application', 'error');
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Company Name *</label>
            <input
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              required
              className="input"
            />
          </div>
          <div>
            <label className="label">Position Title *</label>
            <input
              type="text"
              name="position_title"
              value={formData.position_title}
              onChange={handleChange}
              required
              className="input"
            />
          </div>
          <div>
            <label className="label">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Date Applied</label>
            <input
              type="date"
              name="date_applied"
              value={formData.date_applied}
              onChange={handleChange}
              required
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Job Details */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Job Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="label">Job Type</label>
            <select
              name="job_type"
              value={formData.job_type}
              onChange={handleChange}
              className="input"
            >
              {JOB_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Work Location</label>
            <select
              name="work_location_type"
              value={formData.work_location_type}
              onChange={handleChange}
              className="input"
            >
              {WORK_LOCATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="City, State"
              className="input"
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="label">Job URL</label>
          <input
            type="url"
            name="job_url"
            value={formData.job_url}
            onChange={handleChange}
            placeholder="https://..."
            className="input"
          />
        </div>
        <div>
          <label className="label">Job Description</label>
          <textarea
            name="job_description"
            value={formData.job_description}
            onChange={handleChange}
            rows={4}
            className="input"
          />
        </div>
      </div>

      {/* Salary */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Salary Range</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Minimum</label>
            <input
              type="number"
              name="salary_min"
              value={formData.salary_min || ''}
              onChange={handleChange}
              placeholder="50000"
              className="input"
            />
          </div>
          <div>
            <label className="label">Maximum</label>
            <input
              type="number"
              name="salary_max"
              value={formData.salary_max || ''}
              onChange={handleChange}
              placeholder="80000"
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Contact Name</label>
            <input
              type="text"
              name="contact_name"
              value={formData.contact_name}
              onChange={handleChange}
              className="input"
            />
          </div>
          <div>
            <label className="label">Contact Email</label>
            <input
              type="email"
              name="contact_email"
              value={formData.contact_email}
              onChange={handleChange}
              className="input"
            />
          </div>
          <div>
            <label className="label">Contact Phone</label>
            <input
              type="tel"
              name="contact_phone"
              value={formData.contact_phone}
              onChange={handleChange}
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Follow-up */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Follow-up</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Follow-up Date</label>
            <input
              type="date"
              name="follow_up_date"
              value={formData.follow_up_date || ''}
              onChange={handleChange}
              className="input"
            />
          </div>
          <div>
            <label className="label">Remind Days Before</label>
            <input
              type="number"
              name="reminder_days_before"
              value={formData.reminder_days_before}
              onChange={handleChange}
              min="0"
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Additional Information</h2>

        {/* Master Resume Section */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-md font-medium">Master Resume Template</h3>
            {formData.master_resume && (
              <span className="text-sm text-green-600 font-medium">✓ Resume Linked</span>
            )}
          </div>

          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={handleUseDefaultResume}
              className="btn btn-secondary text-sm"
              disabled={!defaultResume}
            >
              📄 Use Default Resume
            </button>
            <button
              type="button"
              onClick={() => setShowMasterResumeSelector(!showMasterResumeSelector)}
              className="btn btn-secondary text-sm"
            >
              📋 {showMasterResumeSelector ? 'Hide' : 'Choose'} Resume
            </button>
            <button
              type="button"
              onClick={() => navigate('/master-resumes')}
              className="btn btn-secondary text-sm"
            >
              ➕ Manage Resumes
            </button>
          </div>

          {showMasterResumeSelector && masterResumes && masterResumes.length > 0 && (
            <div className="space-y-2 mt-3">
              <label className="label text-sm">Select a master resume:</label>
              <select
                value={formData.master_resume || ''}
                onChange={(e) => handleUseMasterResume(Number(e.target.value) || null)}
                className="input text-sm"
              >
                <option value="">-- Select Resume --</option>
                {masterResumes.map((resume) => (
                  <option key={resume.id} value={resume.id}>
                    {resume.name} {resume.is_default ? '(Default)' : ''} - {resume.full_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {showMasterResumeSelector && (!masterResumes || masterResumes.length === 0) && (
            <p className="text-sm text-gray-600 mt-3">
              No master resumes available. <button type="button" onClick={() => navigate('/master-resumes/create')} className="text-blue-600 underline">Create one now</button>
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="label">Resume Version</label>
            <input
              type="text"
              name="resume_version"
              value={formData.resume_version}
              onChange={handleChange}
              placeholder="e.g., v2.1"
              className="input"
            />
          </div>
          <div className="flex items-center pt-6">
            <input
              type="checkbox"
              name="cover_letter_sent"
              id="cover_letter_sent"
              checked={formData.cover_letter_sent}
              onChange={handleChange}
              className="w-4 h-4 mr-2"
            />
            <label htmlFor="cover_letter_sent">Cover letter sent</label>
          </div>
        </div>
        <div>
          <label className="label">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            className="input"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button type="submit" disabled={isSubmitting} className="btn btn-primary">
          {isSubmitting ? 'Saving...' : 'Save Application'}
        </button>
        <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}
