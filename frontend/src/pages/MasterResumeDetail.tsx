import { useParams, Link } from 'react-router-dom';
import { useMasterResume } from '@/api/masterResume';
import { useState, useEffect } from 'react';

export default function MasterResumeDetail() {
    const { id } = useParams();
    const { data: resume, isLoading } = useMasterResume(Number(id));
    const [pdfError, setPdfError] = useState<string | null>(null);
    const [pdfLoading, setPdfLoading] = useState(true);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    useEffect(() => {
        if (resume) {
            // Fetch the PDF as a blob and create an object URL
            const fetchPdf = async () => {
                try {
                    setPdfLoading(true);
                    setPdfError(null);

                    const response = await fetch(`/api/master-resume/resumes/${resume.id}/pdf/`);

                    if (!response.ok) {
                        throw new Error(`Failed to generate PDF: ${response.statusText}`);
                    }

                    const blob = await response.blob();
                    const url = URL.createObjectURL(blob);
                    setPdfUrl(url);
                    setPdfLoading(false);
                } catch (error) {
                    console.error('PDF fetch error:', error);
                    setPdfError(error instanceof Error ? error.message : 'Failed to load PDF');
                    setPdfLoading(false);
                }
            };

            fetchPdf();

            // Cleanup object URL on unmount
            return () => {
                if (pdfUrl) {
                    URL.revokeObjectURL(pdfUrl);
                }
            };
        }
    }, [resume?.id]);

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

    // URL for downloading (with download query param) - can use proxy
    const pdfDownloadUrl = `/api/master-resume/resumes/${resume.id}/pdf/?download=true`;

    return (
        <div className="container mx-auto py-4 px-4" style={{ maxWidth: '100%' }}>
            <div className="flex justify-between items-center mb-4">
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
                        href={pdfDownloadUrl}
                        className="btn btn-primary"
                    >
                        Download PDF
                    </a>
                    <Link
                        to={`/master-resumes/${resume.id}/edit`}
                        className="btn btn-secondary"
                    >
                        Edit
                    </Link>
                    <Link to="/master-resumes" className="btn btn-secondary">
                        ← Back
                    </Link>
                </div>
            </div>

            {/* PDF Preview */}
            <div className="card p-0 overflow-hidden" style={{ height: 'calc(100vh - 140px)' }}>
                {pdfLoading ? (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
                        <h3 className="text-xl font-semibold mb-2">Generating PDF...</h3>
                        <p className="text-gray-600">This may take up to 60 seconds as we compile your resume with LaTeX.</p>
                    </div>
                ) : pdfError ? (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                        <div className="text-red-600 mb-4">
                            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="text-xl font-semibold mb-2">Failed to Load PDF Preview</h3>
                            <p className="text-gray-600 mb-4">{pdfError}</p>
                        </div>
                        <div className="flex gap-4">
                            <a
                                href={pdfDownloadUrl}
                                className="btn btn-primary"
                            >
                                Try Download Instead
                            </a>
                            <button
                                onClick={() => {
                                    setPdfError(null);
                                    window.location.reload();
                                }}
                                className="btn btn-secondary"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                ) : pdfUrl ? (
                    <iframe
                        src={pdfUrl}
                        className="w-full h-full border-0"
                        title="Resume PDF Preview"
                    />
                ) : null}
            </div>
        </div>
    );
}
