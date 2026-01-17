import { Link } from 'react-router-dom';
import { useMasterResumes, useDeleteMasterResume, useDuplicateMasterResume } from '@/api/masterResume';
import { useUIStore } from '@/stores/uiStore';

export default function MasterResumeList() {
    const { data: resumes, isLoading } = useMasterResumes();
    const deleteMutation = useDeleteMasterResume();
    const duplicateMutation = useDuplicateMasterResume();
    const addToast = useUIStore((s) => s.addToast);

    const handleDelete = async (id: number, name: string) => {
        if (confirm(`Are you sure you want to delete "${name}"?`)) {
            try {
                await deleteMutation.mutateAsync(id);
                addToast('Resume deleted successfully', 'success');
            } catch {
                addToast('Failed to delete resume', 'error');
            }
        }
    };

    const handleDuplicate = async (id: number) => {
        try {
            await duplicateMutation.mutateAsync(id);
            addToast('Resume duplicated successfully', 'success');
        } catch {
            addToast('Failed to duplicate resume', 'error');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg">Loading resumes...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Master Resumes</h1>
                <Link to="/master-resumes/create" className="btn btn-primary">
                    ➕ Create New Resume
                </Link>
            </div>

            {!resumes || resumes.length === 0 ? (
                <div className="card text-center py-12">
                    <h2 className="text-xl font-semibold mb-4">No Master Resumes Yet</h2>
                    <p className="text-gray-600 mb-6">
                        Create a master resume template that you can quickly use when applying for jobs.
                    </p>
                    <Link to="/master-resumes/create" className="btn btn-primary">
                        Create Your First Resume
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {resumes.map((resume) => (
                        <div key={resume.id} className="card hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-xl font-semibold">{resume.name}</h2>
                                        {resume.is_default && (
                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                                                Default
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-700 mb-1">
                                        <strong>{resume.full_name}</strong> • {resume.email}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {resume.section_count} section{resume.section_count !== 1 ? 's' : ''}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-2">
                                        Updated: {new Date(resume.updated_at).toLocaleDateString()}
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <Link
                                        to={`/master-resumes/${resume.id}`}
                                        className="btn btn-secondary text-sm"
                                    >
                                        View
                                    </Link>
                                    <a
                                        href={`http://localhost:8000/api/master-resume/resumes/${resume.id}/pdf/`}
                                        download
                                        className="btn btn-primary text-sm"
                                    >
                                        PDF
                                    </a>
                                    <Link
                                        to={`/master-resumes/${resume.id}/edit`}
                                        className="btn btn-secondary text-sm"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDuplicate(resume.id)}
                                        className="btn btn-secondary text-sm"
                                        disabled={duplicateMutation.isPending}
                                    >
                                        Duplicate
                                    </button>
                                    <button
                                        onClick={() => handleDelete(resume.id, resume.name)}
                                        className="btn btn-danger text-sm"
                                        disabled={deleteMutation.isPending}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
