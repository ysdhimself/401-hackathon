import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMasterResume, useCreateMasterResume, useUpdateMasterResume } from '@/api/masterResume';
import { useUIStore } from '@/stores/uiStore';
import type { MasterResumeInput } from '@/types';

export default function MasterResumeForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const addToast = useUIStore((s) => s.addToast);
    const isEdit = !!id;

    const { data: existingResume, isLoading } = useMasterResume(Number(id));
    const createMutation = useCreateMasterResume();
    const updateMutation = useUpdateMasterResume(Number(id));

    const [formData, setFormData] = useState<MasterResumeInput>({
        name: existingResume?.name || '',
        is_default: existingResume?.is_default || false,
        full_name: existingResume?.full_name || '',
        email: existingResume?.email || '',
        phone: existingResume?.phone || '',
        location: existingResume?.location || '',
        linkedin_url: existingResume?.linkedin_url || '',
        portfolio_url: existingResume?.portfolio_url || '',
        github_url: existingResume?.github_url || '',
        summary: existingResume?.summary || '',
    });

    // Update form when data loads
    useState(() => {
        if (existingResume) {
            setFormData({
                name: existingResume.name,
                is_default: existingResume.is_default,
                full_name: existingResume.full_name,
                email: existingResume.email,
                phone: existingResume.phone,
                location: existingResume.location,
                linkedin_url: existingResume.linkedin_url,
                portfolio_url: existingResume.portfolio_url,
                github_url: existingResume.github_url,
                summary: existingResume.summary,
            });
        }
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            if (isEdit) {
                await updateMutation.mutateAsync(formData);
                addToast('Resume updated successfully', 'success');
            } else {
                await createMutation.mutateAsync(formData);
                addToast('Resume created successfully', 'success');
            }
            navigate('/master-resumes');
        } catch {
            addToast(`Failed to ${isEdit ? 'update' : 'create'} resume`, 'error');
        }
    };

    if (isLoading && isEdit) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg">Loading resume...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">
                {isEdit ? 'Edit Master Resume' : 'Create Master Resume'}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Resume Info */}
                <div className="card">
                    <h2 className="text-lg font-semibold mb-4">Resume Information</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="label">Resume Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="e.g., Software Engineer Resume"
                                className="input"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Give this resume template a descriptive name
                            </p>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="is_default"
                                id="is_default"
                                checked={formData.is_default}
                                onChange={handleChange}
                                className="w-4 h-4 mr-2"
                            />
                            <label htmlFor="is_default" className="font-medium">
                                Set as default resume
                            </label>
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="card">
                    <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="label">Full Name *</label>
                            <input
                                type="text"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                required
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="label">Email *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="label">Phone</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="input"
                            />
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
                </div>

                {/* Links */}
                <div className="card">
                    <h2 className="text-lg font-semibold mb-4">Professional Links</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="label">LinkedIn URL</label>
                            <input
                                type="url"
                                name="linkedin_url"
                                value={formData.linkedin_url}
                                onChange={handleChange}
                                placeholder="https://linkedin.com/in/..."
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="label">Portfolio URL</label>
                            <input
                                type="url"
                                name="portfolio_url"
                                value={formData.portfolio_url}
                                onChange={handleChange}
                                placeholder="https://..."
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="label">GitHub URL</label>
                            <input
                                type="url"
                                name="github_url"
                                value={formData.github_url}
                                onChange={handleChange}
                                placeholder="https://github.com/..."
                                className="input"
                            />
                        </div>
                    </div>
                </div>

                {/* Professional Summary */}
                <div className="card">
                    <h2 className="text-lg font-semibold mb-4">Professional Summary</h2>
                    <textarea
                        name="summary"
                        value={formData.summary}
                        onChange={handleChange}
                        rows={6}
                        placeholder="Write a brief professional summary or objective..."
                        className="input"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={createMutation.isPending || updateMutation.isPending}
                        className="btn btn-primary"
                    >
                        {createMutation.isPending || updateMutation.isPending
                            ? 'Saving...'
                            : isEdit
                                ? 'Update Resume'
                                : 'Create Resume'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/master-resumes')}
                        className="btn btn-secondary"
                    >
                        Cancel
                    </button>
                </div>
            </form>

            {isEdit && (
                <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                        <strong>Tip:</strong> After saving the basic information, you can add sections (experience,
                        education, skills, etc.) by viewing this resume.
                    </p>
                </div>
            )}
        </div>
    );
}
