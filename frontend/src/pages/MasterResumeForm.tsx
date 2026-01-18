import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    useMasterResume,
    useCreateMasterResume,
    useUpdateMasterResume
} from '@/api/masterResume';
import { useUIStore } from '@/stores/uiStore';
import type { MasterResumeInput, ResumeSection, ResumeEntry } from '@/types';

type SectionType = 'experience' | 'education' | 'projects' | 'skills';

interface FormSection {
    id?: number;
    section_type: SectionType;
    section_title: string;
    order: number;
    entries: FormEntry[];
}

interface FormEntry {
    id?: number;
    title: string;
    organization: string;
    location: string;
    start_date: string;
    end_date: string;
    description: string; // Will store bullet points as newline-separated text
    technologies: string;
    order: number;
}

export default function MasterResumeForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const addToast = useUIStore((s) => s.addToast);
    const isEdit = !!id;

    const { data: existingResume, isLoading } = useMasterResume(Number(id));
    const createMutation = useCreateMasterResume();
    const updateMutation = useUpdateMasterResume(Number(id));

    const [formData, setFormData] = useState<MasterResumeInput>({
        name: '',
        is_default: false,
        full_name: '',
        email: '',
        phone: '',
        location: '',
        linkedin_url: '',
        portfolio_url: '',
        github_url: '',
        summary: '',
    });

    const [sections, setSections] = useState<FormSection[]>([
        { section_type: 'education', section_title: 'Education', order: 0, entries: [] },
        { section_type: 'experience', section_title: 'Experience', order: 1, entries: [] },
        { section_type: 'projects', section_title: 'Projects', order: 2, entries: [] },
        { section_type: 'skills', section_title: 'Technical Skills', order: 3, entries: [] },
    ]);

    useEffect(() => {
        if (existingResume) {
            setFormData({
                name: existingResume.name,
                is_default: existingResume.is_default,
                full_name: existingResume.full_name,
                email: existingResume.email,
                phone: existingResume.phone || '',
                location: existingResume.location || '',
                linkedin_url: existingResume.linkedin_url || '',
                portfolio_url: existingResume.portfolio_url || '',
                github_url: existingResume.github_url || '',
                summary: existingResume.summary || '',
            });

            // Map existing sections
            if (existingResume.sections && existingResume.sections.length > 0) {
                const mappedSections: FormSection[] = existingResume.sections.map((section: ResumeSection) => ({
                    id: section.id,
                    section_type: section.section_type as SectionType,
                    section_title: section.section_title,
                    order: section.order,
                    entries: section.entries?.map((entry: ResumeEntry) => ({
                        id: entry.id,
                        title: entry.title || '',
                        organization: entry.organization || '',
                        location: entry.location || '',
                        start_date: entry.start_date || '',
                        end_date: entry.end_date || '',
                        description: entry.description || '',
                        technologies: entry.technologies || '',
                        order: entry.order,
                    })) || []
                }));
                setSections(mappedSections);
            }
        }
    }, [existingResume]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const addEntry = (sectionIndex: number) => {
        setSections((prev) => {
            const newSections = [...prev];
            const newEntry: FormEntry = {
                title: '',
                organization: '',
                location: '',
                start_date: '',
                end_date: '',
                description: '',
                technologies: '',
                order: newSections[sectionIndex].entries.length,
            };
            newSections[sectionIndex].entries.push(newEntry);
            return newSections;
        });
    };

    const removeEntry = (sectionIndex: number, entryIndex: number) => {
        setSections((prev) => {
            const newSections = [...prev];
            newSections[sectionIndex].entries.splice(entryIndex, 1);
            // Reorder remaining entries
            newSections[sectionIndex].entries.forEach((entry, idx) => {
                entry.order = idx;
            });
            return newSections;
        });
    };

    const updateEntry = (sectionIndex: number, entryIndex: number, field: keyof FormEntry, value: string) => {
        setSections((prev) => {
            const newSections = [...prev];
            newSections[sectionIndex].entries[entryIndex] = {
                ...newSections[sectionIndex].entries[entryIndex],
                [field]: value,
            };
            return newSections;
        });
    };

    const addBulletPoint = (sectionIndex: number, entryIndex: number) => {
        setSections((prev) => {
            const newSections = [...prev];
            const currentDesc = newSections[sectionIndex].entries[entryIndex].description;
            newSections[sectionIndex].entries[entryIndex].description = currentDesc ? currentDesc + '\n• ' : '• ';
            return newSections;
        });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // Validate required fields
        if (!formData.full_name.trim() || !formData.email.trim()) {
            addToast('Name and Email are required', 'error');
            return;
        }

        try {
            let resumeId: number;

            // Step 1: Save/update basic resume info
            if (isEdit) {
                await updateMutation.mutateAsync(formData);
                resumeId = Number(id);
            } else {
                const created = await createMutation.mutateAsync(formData);
                resumeId = created.id;
            }

            // Step 2: Save sections and entries
            for (const section of sections) {
                // Skip empty sections
                if (section.entries.length === 0) continue;

                let sectionId: number;

                // Create or update section
                if (section.id) {
                    // Update existing section
                    const sectionData = {
                        resume: resumeId,
                        section_type: section.section_type,
                        section_title: section.section_title,
                        order: section.order
                    };
                    const response = await fetch(`/api/master-resume/resumes/${resumeId}/sections/${section.id}/`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(sectionData)
                    });
                    if (!response.ok) {
                        throw new Error(`Failed to update section: ${response.statusText}`);
                    }
                    sectionId = section.id;
                } else {
                    // Create new section
                    const response = await fetch(`/api/master-resume/resumes/${resumeId}/sections/`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            resume: resumeId,
                            section_type: section.section_type,
                            section_title: section.section_title,
                            order: section.order
                        })
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error('Section creation failed:', errorText);
                        throw new Error(`Failed to create section: ${response.statusText}`);
                    }

                    const newSection = await response.json();
                    sectionId = newSection.id;
                }

                // Save entries for this section
                for (const entry of section.entries) {
                    const entryData = {
                        section: sectionId,
                        title: entry.title,
                        organization: entry.organization,
                        location: entry.location,
                        start_date: entry.start_date,
                        end_date: entry.end_date,
                        description: entry.description,
                        technologies: entry.technologies,
                        order: entry.order,
                        is_active: true
                    };

                    if (entry.id) {
                        // Update existing entry
                        const response = await fetch(`/api/master-resume/sections/${sectionId}/entries/${entry.id}/`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(entryData)
                        });
                        if (!response.ok) {
                            console.error('Entry update failed:', await response.text());
                        }
                    } else {
                        // Create new entry
                        const response = await fetch(`/api/master-resume/sections/${sectionId}/entries/`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(entryData)
                        });
                        if (!response.ok) {
                            console.error('Entry creation failed:', await response.text());
                        }
                    }
                }
            }

            addToast('Resume saved successfully', 'success');
            navigate(`/master-resumes/${resumeId}`);
        } catch (error) {
            console.error('Save error:', error);
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
        <div className="py-8 px-4" style={{ maxWidth: '100%' }}>
            <h1 className="text-3xl font-bold mb-6 px-4">
                {isEdit ? 'Edit Master Resume' : 'Create Master Resume'}
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Section */}
                <div className="space-y-6 lg:col-span-2">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Info */}
                        <div className="card">
                            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="label">Resume Template Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g., Software Engineer Resume"
                                        className="input"
                                    />
                                </div>
                                <div>
                                    <label className="label">Full Name *</label>
                                    <input
                                        type="text"
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        required
                                        className="input"
                                        placeholder="John Doe"
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
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="label">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="+1 (555) 123-4567"
                                    />
                                </div>
                                <div>
                                    <label className="label">LinkedIn</label>
                                    <input
                                        type="url"
                                        name="linkedin_url"
                                        value={formData.linkedin_url}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="https://linkedin.com/in/johndoe"
                                    />
                                </div>
                                <div>
                                    <label className="label">GitHub</label>
                                    <input
                                        type="url"
                                        name="github_url"
                                        value={formData.github_url}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="https://github.com/johndoe"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Education Section */}
                        <div className="card">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">Education</h2>
                                <button
                                    type="button"
                                    onClick={() => addEntry(0)}
                                    className="btn btn-sm bg-blue-500 text-white hover:bg-blue-600"
                                >
                                    + Add Education
                                </button>
                            </div>
                            {sections[0].entries.map((entry, entryIdx) => (
                                <div key={entryIdx} className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="font-semibold text-gray-700">Education #{entryIdx + 1}</h3>
                                        <button
                                            type="button"
                                            onClick={() => removeEntry(0, entryIdx)}
                                            className="text-red-600 hover:text-red-800 text-sm"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="label text-sm">Degree</label>
                                            <input
                                                type="text"
                                                value={entry.title}
                                                onChange={(e) => updateEntry(0, entryIdx, 'title', e.target.value)}
                                                className="input input-sm"
                                                placeholder="Bachelor of Science in Computer Science"
                                            />
                                        </div>
                                        <div>
                                            <label className="label text-sm">Institution</label>
                                            <input
                                                type="text"
                                                value={entry.organization}
                                                onChange={(e) => updateEntry(0, entryIdx, 'organization', e.target.value)}
                                                className="input input-sm"
                                                placeholder="University of Example"
                                            />
                                        </div>
                                        <div>
                                            <label className="label text-sm">Location</label>
                                            <input
                                                type="text"
                                                value={entry.location}
                                                onChange={(e) => updateEntry(0, entryIdx, 'location', e.target.value)}
                                                className="input input-sm"
                                                placeholder="City, Province"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <div style={{ width: '110px' }}>
                                                <label className="label text-sm">Start Date</label>
                                                <input
                                                    type="text"
                                                    value={entry.start_date}
                                                    onChange={(e) => updateEntry(0, entryIdx, 'start_date', e.target.value)}
                                                    className="input input-sm"
                                                    style={{ width: '100px', minWidth: '100px', maxWidth: '100px' }}
                                                    placeholder="Sep 2022"
                                                />
                                            </div>
                                            <div style={{ width: '110px' }}>
                                                <label className="label text-sm">End Date</label>
                                                <input
                                                    type="text"
                                                    value={entry.end_date}
                                                    onChange={(e) => updateEntry(0, entryIdx, 'end_date', e.target.value)}
                                                    className="input input-sm"
                                                    style={{ width: '100px', minWidth: '100px', maxWidth: '100px' }}
                                                    placeholder="May 2026"
                                                />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="label text-sm">Details (Bullet Points)</label>
                                                <button
                                                    type="button"
                                                    onClick={() => addBulletPoint(0, entryIdx)}
                                                    className="text-xs text-blue-600 hover:text-blue-800"
                                                >
                                                    + Add Bullet
                                                </button>
                                            </div>
                                            <textarea
                                                value={entry.description}
                                                onChange={(e) => updateEntry(0, entryIdx, 'description', e.target.value)}
                                                className="input input-sm"
                                                rows={4}
                                                placeholder="• GPA: 3.8/4.0&#10;• Dean's List all semesters&#10;• Relevant coursework: Data Structures, Algorithms, Software Engineering"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {sections[0].entries.length === 0 && (
                                <p className="text-gray-500 text-sm text-center py-4">No education entries yet. Click "Add Education" to get started.</p>
                            )}
                        </div>

                        {/* Experience Section */}
                        <div className="card">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">Experience</h2>
                                <button
                                    type="button"
                                    onClick={() => addEntry(1)}
                                    className="btn btn-sm bg-blue-500 text-white hover:bg-blue-600"
                                >
                                    + Add Experience
                                </button>
                            </div>
                            {sections[1].entries.map((entry, entryIdx) => (
                                <div key={entryIdx} className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="font-semibold text-gray-700">Experience #{entryIdx + 1}</h3>
                                        <button
                                            type="button"
                                            onClick={() => removeEntry(1, entryIdx)}
                                            className="text-red-600 hover:text-red-800 text-sm"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="label text-sm">Job Title</label>
                                            <input
                                                type="text"
                                                value={entry.title}
                                                onChange={(e) => updateEntry(1, entryIdx, 'title', e.target.value)}
                                                className="input input-sm"
                                                placeholder="Software Engineer"
                                            />
                                        </div>
                                        <div>
                                            <label className="label text-sm">Company</label>
                                            <input
                                                type="text"
                                                value={entry.organization}
                                                onChange={(e) => updateEntry(1, entryIdx, 'organization', e.target.value)}
                                                className="input input-sm"
                                                placeholder="Tech Company Inc."
                                            />
                                        </div>
                                        <div>
                                            <label className="label text-sm">Location</label>
                                            <input
                                                type="text"
                                                value={entry.location}
                                                onChange={(e) => updateEntry(1, entryIdx, 'location', e.target.value)}
                                                className="input input-sm"
                                                placeholder="San Francisco, CA"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <div style={{ width: '110px' }}>
                                                <label className="label text-sm">Start Date</label>
                                                <input
                                                    type="text"
                                                    value={entry.start_date}
                                                    onChange={(e) => updateEntry(1, entryIdx, 'start_date', e.target.value)}
                                                    className="input input-sm"
                                                    style={{ width: '100px', minWidth: '100px', maxWidth: '100px' }}
                                                    placeholder="Jan 2022"
                                                />
                                            </div>
                                            <div style={{ width: '110px' }}>
                                                <label className="label text-sm">End Date</label>
                                                <input
                                                    type="text"
                                                    value={entry.end_date}
                                                    onChange={(e) => updateEntry(1, entryIdx, 'end_date', e.target.value)}
                                                    className="input input-sm"
                                                    style={{ width: '100px', minWidth: '100px', maxWidth: '100px' }}
                                                    placeholder="Present"
                                                />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="label text-sm">Responsibilities & Achievements (Bullet Points)</label>
                                                <button
                                                    type="button"
                                                    onClick={() => addBulletPoint(1, entryIdx)}
                                                    className="text-xs text-blue-600 hover:text-blue-800"
                                                >
                                                    + Add Bullet
                                                </button>
                                            </div>
                                            <textarea
                                                value={entry.description}
                                                onChange={(e) => updateEntry(1, entryIdx, 'description', e.target.value)}
                                                className="input input-sm"
                                                rows={5}
                                                placeholder="• Developed and maintained web applications using React and Node.js&#10;• Improved application performance by 40% through code optimization&#10;• Collaborated with cross-functional teams to deliver features on time"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {sections[1].entries.length === 0 && (
                                <p className="text-gray-500 text-sm text-center py-4">No experience entries yet. Click "Add Experience" to get started.</p>
                            )}
                        </div>

                        {/* Projects Section */}
                        <div className="card">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">Projects</h2>
                                <button
                                    type="button"
                                    onClick={() => addEntry(2)}
                                    className="btn btn-sm bg-blue-500 text-white hover:bg-blue-600"
                                >
                                    + Add Project
                                </button>
                            </div>
                            {sections[2].entries.map((entry, entryIdx) => (
                                <div key={entryIdx} className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="font-semibold text-gray-700">Project #{entryIdx + 1}</h3>
                                        <button
                                            type="button"
                                            onClick={() => removeEntry(2, entryIdx)}
                                            className="text-red-600 hover:text-red-800 text-sm"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="label text-sm">Project Name</label>
                                            <input
                                                type="text"
                                                value={entry.title}
                                                onChange={(e) => updateEntry(2, entryIdx, 'title', e.target.value)}
                                                className="input input-sm"
                                                placeholder="E-commerce Platform"
                                            />
                                        </div>
                                        <div>
                                            <label className="label text-sm">Organization/Context</label>
                                            <input
                                                type="text"
                                                value={entry.organization}
                                                onChange={(e) => updateEntry(2, entryIdx, 'organization', e.target.value)}
                                                className="input input-sm"
                                                placeholder="Personal Project / Hackathon / Course"
                                            />
                                        </div>
                                        <div>
                                            <label className="label text-sm">Technologies</label>
                                            <input
                                                type="text"
                                                value={entry.technologies}
                                                onChange={(e) => updateEntry(2, entryIdx, 'technologies', e.target.value)}
                                                className="input input-sm"
                                                placeholder="React, Node.js, MongoDB, AWS"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <div style={{ width: '110px' }}>
                                                <label className="label text-sm">Start Date</label>
                                                <input
                                                    type="text"
                                                    value={entry.start_date}
                                                    onChange={(e) => updateEntry(2, entryIdx, 'start_date', e.target.value)}
                                                    className="input input-sm"
                                                    style={{ width: '100px', minWidth: '100px', maxWidth: '100px' }}
                                                    placeholder="Jun 2023"
                                                />
                                            </div>
                                            <div style={{ width: '110px' }}>
                                                <label className="label text-sm">End Date</label>
                                                <input
                                                    type="text"
                                                    value={entry.end_date}
                                                    onChange={(e) => updateEntry(2, entryIdx, 'end_date', e.target.value)}
                                                    className="input input-sm"
                                                    style={{ width: '100px', minWidth: '100px', maxWidth: '100px' }}
                                                    placeholder="Aug 2023"
                                                />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="label text-sm">Project Description (Bullet Points)</label>
                                                <button
                                                    type="button"
                                                    onClick={() => addBulletPoint(2, entryIdx)}
                                                    className="text-xs text-blue-600 hover:text-blue-800"
                                                >
                                                    + Add Bullet
                                                </button>
                                            </div>
                                            <textarea
                                                value={entry.description}
                                                onChange={(e) => updateEntry(2, entryIdx, 'description', e.target.value)}
                                                className="input input-sm"
                                                rows={4}
                                                placeholder="• Built a full-stack e-commerce platform with user authentication and payment processing&#10;• Implemented responsive UI with React and Tailwind CSS&#10;• Deployed on AWS with CI/CD pipeline"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {sections[2].entries.length === 0 && (
                                <p className="text-gray-500 text-sm text-center py-4">No projects yet. Click "Add Project" to get started.</p>
                            )}
                        </div>

                        {/* Technical Skills Section */}
                        <div className="card">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">Technical Skills</h2>
                                <button
                                    type="button"
                                    onClick={() => addEntry(3)}
                                    className="btn btn-sm bg-blue-500 text-white hover:bg-blue-600"
                                >
                                    + Add Skill Category
                                </button>
                            </div>
                            {sections[3].entries.map((entry, entryIdx) => (
                                <div key={entryIdx} className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="font-semibold text-gray-700">Skill Category #{entryIdx + 1}</h3>
                                        <button
                                            type="button"
                                            onClick={() => removeEntry(3, entryIdx)}
                                            className="text-red-600 hover:text-red-800 text-sm"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3">
                                        <div>
                                            <label className="label text-sm">Category</label>
                                            <input
                                                type="text"
                                                value={entry.title}
                                                onChange={(e) => updateEntry(3, entryIdx, 'title', e.target.value)}
                                                className="input input-sm"
                                                placeholder="Programming Languages / Frameworks / Tools / Databases"
                                            />
                                        </div>
                                        <div>
                                            <label className="label text-sm">Skills</label>
                                            <input
                                                type="text"
                                                value={entry.technologies}
                                                onChange={(e) => updateEntry(3, entryIdx, 'technologies', e.target.value)}
                                                className="input input-sm"
                                                placeholder="Python, JavaScript, TypeScript, Java, C++"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Separate skills with commas</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {sections[3].entries.length === 0 && (
                                <p className="text-gray-500 text-sm text-center py-4">No skill categories yet. Click "Add Skill Category" to get started.</p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 sticky bottom-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                            <button
                                type="submit"
                                disabled={createMutation.isPending || updateMutation.isPending}
                                className="btn btn-primary flex-1"
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
                </div>

                {/* Live Preview Section - Hidden on mobile, visible on tablet and desktop */}
                <div className="hidden lg:block lg:sticky lg:top-4 h-fit lg:col-span-1">
                    <div style={{ backgroundColor: '#525659', padding: '2rem', display: 'inline-block' }}>
                        <div className="bg-white shadow-2xl" style={{
                            width: '490px',  // 60% of actual size
                            height: '634px',
                            padding: '29px 32px',
                            fontFamily: 'Computer Modern, Latin Modern Roman, serif',
                            fontSize: '6.6pt',
                            lineHeight: '1.2',
                            overflow: 'hidden'
                        }}>
                            {/* Header */}
                            <div className="text-center pb-1 mb-2" style={{ borderBottom: '0.9pt solid #000' }}>
                                <h1 className="font-bold uppercase tracking-wider" style={{ fontSize: '12pt', marginBottom: '1pt' }}>
                                    {formData.full_name || 'Your Name'}
                                </h1>
                                <div className="flex flex-wrap justify-center gap-0.5" style={{ fontSize: '6pt', marginTop: '1pt' }}>
                                    {formData.phone && <span>{formData.phone}</span>}
                                    {formData.phone && formData.email && <span className="mx-1">•</span>}
                                    {formData.email && <span style={{ textDecoration: 'underline' }}>{formData.email}</span>}
                                    {(formData.phone || formData.email) && formData.linkedin_url && <span className="mx-1">•</span>}
                                    {formData.linkedin_url && <span style={{ textDecoration: 'underline', color: '#0000EE' }}>linkedin.com/in/...</span>}
                                    {formData.linkedin_url && formData.github_url && <span className="mx-1">•</span>}
                                    {formData.github_url && <span style={{ textDecoration: 'underline', color: '#0000EE' }}>github.com/...</span>}
                                </div>
                            </div>

                            {/* Education */}
                            {sections[0].entries.length > 0 && (
                                <div className="mb-1.5">
                                    <h2 className="font-bold uppercase mb-0.5" style={{ fontSize: '6pt', borderBottom: '0.5pt solid #000' }}>Education</h2>
                                    {sections[0].entries.map((entry, idx) => (
                                        <div key={idx} className="mb-1" style={{ fontSize: '5pt' }}>
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <span className="font-bold">{entry.organization || 'Institution Name'}</span>
                                                    {entry.location && <span className="italic ml-2">{entry.location}</span>}
                                                </div>
                                                <span className="italic whitespace-nowrap ml-2">
                                                    {entry.start_date && entry.end_date ? `${entry.start_date} -- ${entry.end_date}` :
                                                        entry.start_date || entry.end_date || 'Dates'}
                                                </span>
                                            </div>
                                            {entry.title && (
                                                <div className="italic">{entry.title}</div>
                                            )}
                                            {entry.description && (
                                                <div className="mt-1 whitespace-pre-line" style={{ fontSize: '9.5pt', lineHeight: '1.15' }}>
                                                    {entry.description}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Experience */}
                            {sections[1].entries.length > 0 && (
                                <div className="mb-1.5">
                                    <h2 className="font-bold uppercase mb-0.5" style={{ fontSize: '6pt', borderBottom: '0.5pt solid #000' }}>Experience</h2>
                                    {sections[1].entries.map((entry, idx) => (
                                        <div key={idx} className="mb-1" style={{ fontSize: '5pt' }}>
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <span className="font-bold">{entry.organization || 'Company Name'}</span>
                                                    {entry.location && <span className="italic ml-2">{entry.location}</span>}
                                                </div>
                                                <span className="italic whitespace-nowrap ml-2">
                                                    {entry.start_date && entry.end_date ? `${entry.start_date} -- ${entry.end_date}` :
                                                        entry.start_date || entry.end_date || 'Dates'}
                                                </span>
                                            </div>
                                            {entry.title && (
                                                <div className="italic">{entry.title}</div>
                                            )}
                                            {entry.description && (
                                                <div className="mt-1 whitespace-pre-line" style={{ fontSize: '9.5pt', lineHeight: '1.15' }}>
                                                    {entry.description}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Projects */}
                            {sections[2].entries.length > 0 && (
                                <div className="mb-1.5">
                                    <h2 className="font-bold uppercase mb-0.5" style={{ fontSize: '6pt', borderBottom: '0.5pt solid #000' }}>Projects</h2>
                                    {sections[2].entries.map((entry, idx) => (
                                        <div key={idx} className="mb-1" style={{ fontSize: '5pt' }}>
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <span className="font-bold">{entry.title || 'Project Name'}</span>
                                                    {entry.technologies && <span className="ml-2">| <span className="italic">{entry.technologies}</span></span>}
                                                </div>
                                                <span className="italic whitespace-nowrap ml-2">
                                                    {entry.start_date && entry.end_date ? `${entry.start_date} -- ${entry.end_date}` :
                                                        entry.start_date || entry.end_date || 'Dates'}
                                                </span>
                                            </div>
                                            {entry.description && (
                                                <div className="mt-1 whitespace-pre-line" style={{ fontSize: '9.5pt', lineHeight: '1.15' }}>
                                                    {entry.description}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Technical Skills */}
                            {sections[3].entries.length > 0 && (
                                <div className="mb-1.5">
                                    <h2 className="font-bold uppercase mb-0.5" style={{ fontSize: '6pt', borderBottom: '0.5pt solid #000' }}>Technical Skills</h2>
                                    <div style={{ fontSize: '5pt' }}>
                                        {sections[3].entries.map((entry, idx) => (
                                            <div key={idx} className="mb-0.5">
                                                <span className="font-bold">{entry.title || 'Category'}: </span>
                                                <span>{entry.technologies || 'Skills here'}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Empty state */}
                            {sections.every(s => s.entries.length === 0) && !formData.full_name && (
                                <div className="text-center text-gray-400 py-6">
                                    <p style={{ fontSize: '6pt' }}>Start filling out the form to see your resume preview</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
