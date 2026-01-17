import { useParams, Link } from 'react-router-dom';
import { useMasterResume } from '@/api/masterResume';

export default function MasterResumeDetail() {
    const { id } = useParams();
    const { data: resume, isLoading } = useMasterResume(Number(id));

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg">Loading resume...</div>
            </div>
        );
    }

    if (!resume) {
        return (
            <div className="container mx-auto py-8">
                <div className="card text-center py-12">
                    <h2 className="text-xl font-semibold mb-4">Resume Not Found</h2>
                    <Link to="/master-resumes" className="btn btn-primary">
                        Back to Resumes
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">{resume.name}</h1>
                    {resume.is_default && (
                        <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded">
                            Default Resume
                        </span>
                    )}
                </div>
                <div className="flex gap-2">
                    <a
                        href={`http://localhost:8000/api/master-resume/resumes/${resume.id}/pdf/`}
                        download
                        className="btn btn-primary"
                    >
                        📄 Download PDF
                    </a>
                    <Link
                        to={`/master-resumes/${resume.id}/edit`}
                        className="btn btn-secondary"
                    >
                        ✏️ Edit
                    </Link>
                    <Link to="/master-resumes" className="btn btn-secondary">
                        ← Back
                    </Link>
                </div>
            </div>            {/* Contact Information */}
            <div className="card mb-6">
                <h2 className="text-xl font-semibold mb-4 text-center">{resume.full_name}</h2>
                <div className="text-center text-gray-600 space-y-1">
                    <p>{resume.email}</p>
                    {resume.phone && <p>{resume.phone}</p>}
                    {resume.location && <p>{resume.location}</p>}
                    <div className="flex justify-center gap-4 mt-3 flex-wrap">
                        {resume.linkedin_url && (
                            <a
                                href={resume.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                            >
                                LinkedIn
                            </a>
                        )}
                        {resume.portfolio_url && (
                            <a
                                href={resume.portfolio_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                            >
                                Portfolio
                            </a>
                        )}
                        {resume.github_url && (
                            <a
                                href={resume.github_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                            >
                                GitHub
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Professional Summary */}
            {resume.summary && (
                <div className="card mb-6">
                    <h2 className="text-xl font-semibold mb-3">Professional Summary</h2>
                    <p className="text-gray-700 whitespace-pre-wrap">{resume.summary}</p>
                </div>
            )}

            {/* Sections */}
            {resume.sections && resume.sections.length > 0 ? (
                <div className="space-y-6">
                    {resume.sections.map((section) => (
                        <div key={section.id} className="card">
                            <h2 className="text-xl font-semibold mb-4">{section.section_title}</h2>

                            {section.entries && section.entries.length > 0 ? (
                                <div className="space-y-4">
                                    {section.entries
                                        .filter((entry) => entry.is_active)
                                        .map((entry) => (
                                            <div key={entry.id} className="border-l-4 border-blue-500 pl-4">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="font-semibold text-lg">{entry.title}</h3>
                                                    {entry.start_date && (
                                                        <span className="text-sm text-gray-600">
                                                            {entry.start_date} - {entry.end_date || 'Present'}
                                                        </span>
                                                    )}
                                                </div>
                                                {entry.organization && (
                                                    <p className="text-gray-700 mb-1">
                                                        <strong>{entry.organization}</strong>
                                                        {entry.location && ` • ${entry.location}`}
                                                    </p>
                                                )}
                                                {entry.description && (
                                                    <p className="text-gray-600 whitespace-pre-wrap mb-2">
                                                        {entry.description}
                                                    </p>
                                                )}
                                                {entry.technologies && (
                                                    <p className="text-sm text-gray-500">
                                                        <strong>Technologies:</strong> {entry.technologies}
                                                    </p>
                                                )}
                                                {entry.link && (
                                                    <a
                                                        href={entry.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:underline text-sm"
                                                    >
                                                        View Project →
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">No entries in this section yet.</p>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card text-center py-12">
                    <h3 className="text-lg font-semibold mb-2">No Sections Yet</h3>
                    <p className="text-gray-600 mb-4">
                        Add sections like Experience, Education, Skills, etc. to build your resume.
                    </p>
                    <Link
                        to={`/master-resumes/${resume.id}/edit`}
                        className="btn btn-primary"
                    >
                        Add Sections
                    </Link>
                </div>
            )}
        </div>
    );
}
