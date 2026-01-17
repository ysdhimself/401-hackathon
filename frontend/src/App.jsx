import { useMemo, useState } from 'react'
import './App.css'

function App() {
  const [activeStage, setActiveStage] = useState('All')
  const [query, setQuery] = useState('')

  const applications = [
    {
      id: 1,
      company: 'Brightline AI',
      role: 'Frontend Engineer',
      dateApplied: '2026-01-08',
      stage: 'Interview',
      nextStep: 'Portfolio review call',
      followUp: '2026-01-19',
      location: 'Seattle, WA',
      contact: 'tanya@brightline.ai',
    },
    {
      id: 2,
      company: 'Cloud Harbor',
      role: 'Full Stack Developer',
      dateApplied: '2026-01-10',
      stage: 'Applied',
      nextStep: 'Send availability',
      followUp: '2026-01-20',
      location: 'Remote',
      contact: 'recruiting@cloudharbor.com',
    },
    {
      id: 3,
      company: 'Northwind Robotics',
      role: 'Software Engineer',
      dateApplied: '2025-12-22',
      stage: 'Offer',
      nextStep: 'Review offer package',
      followUp: '2026-01-22',
      location: 'Portland, OR',
      contact: 'lisa@northwindrobotics.com',
    },
    {
      id: 4,
      company: 'Civic Labs',
      role: 'UI Engineer',
      dateApplied: '2025-12-15',
      stage: 'Rejected',
      nextStep: 'Ask for feedback',
      followUp: '2026-01-18',
      location: 'Remote',
      contact: 'talent@civiclabs.org',
    },
    {
      id: 5,
      company: 'Atlas Health',
      role: 'Product Engineer',
      dateApplied: '2026-01-05',
      stage: 'Interview',
      nextStep: 'Take-home submitted',
      followUp: '2026-01-21',
      location: 'Denver, CO',
      contact: 'people@atlashealth.com',
    },
  ]

  const reminders = [
    {
      id: 1,
      title: 'Send follow-up to Brightline AI',
      due: 'Today 3:00 PM',
      type: 'Follow-up',
    },
    {
      id: 2,
      title: 'Tailor resume for Cloud Harbor',
      due: 'Tomorrow 9:00 AM',
      type: 'Resume',
    },
    {
      id: 3,
      title: 'Prepare offer questions for Northwind',
      due: 'Jan 22',
      type: 'Offer',
    },
  ]

  const resumeVersions = [
    {
      id: 1,
      name: 'Master Resume - ATS Friendly',
      updated: 'Jan 12, 2026',
      tags: ['Core Skills', 'Projects', 'Leadership'],
    },
    {
      id: 2,
      name: 'Frontend Focus - Brightline AI',
      updated: 'Jan 14, 2026',
      tags: ['React', 'Design Systems', 'Accessibility'],
    },
    {
      id: 3,
      name: 'Full Stack - Cloud Harbor',
      updated: 'Jan 15, 2026',
      tags: ['Node', 'Django', 'AWS'],
    },
  ]

  const communications = [
    {
      id: 1,
      company: 'Brightline AI',
      channel: 'Email',
      summary: 'Interview invite received, scheduled for Jan 19.',
      date: 'Jan 16',
    },
    {
      id: 2,
      company: 'Atlas Health',
      channel: 'LinkedIn',
      summary: 'Recruiter asked for portfolio links.',
      date: 'Jan 15',
    },
    {
      id: 3,
      company: 'Northwind Robotics',
      channel: 'Email',
      summary: 'Offer extended, awaiting feedback.',
      date: 'Jan 12',
    },
  ]

  const stages = ['All', 'Applied', 'Interview', 'Offer', 'Rejected']

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesStage = activeStage === 'All' || app.stage === activeStage
      const matchesQuery =
        query.trim() === '' ||
        `${app.company} ${app.role} ${app.location}`
          .toLowerCase()
          .includes(query.trim().toLowerCase())
      return matchesStage && matchesQuery
    })
  }, [activeStage, query])

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <div className="brand-mark">JA</div>
          <div>
            <p className="brand-name">Job Application Organizer</p>
            <p className="brand-subtitle">
              Track applications, customize resumes, and stay on top of follow-ups.
            </p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn secondary">Import Resume</button>
          <button className="btn primary">Add Application</button>
        </div>
      </header>

      <section className="announcement">
        <div>
          <strong>Test access only</strong>
          <span>Use c401fileexchange@gmail.com for demo sign-in.</span>
        </div>
        <button className="btn text">View onboarding guide</button>
      </section>

      <section className="overview-grid">
        <div className="card stat">
          <p className="stat-label">Total Applications</p>
          <h2>23</h2>
          <p className="stat-meta">+3 this week</p>
        </div>
        <div className="card stat">
          <p className="stat-label">Active Interviews</p>
          <h2>4</h2>
          <p className="stat-meta">Next: Brightline AI</p>
        </div>
        <div className="card stat">
          <p className="stat-label">Offers</p>
          <h2>1</h2>
          <p className="stat-meta">Awaiting decision</p>
        </div>
        <div className="card stat">
          <p className="stat-label">Follow-ups Due</p>
          <h2>3</h2>
          <p className="stat-meta">Next 48 hours</p>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h3>Tracking Applications</h3>
            <p>Organize by stage with quick filters and a live search.</p>
          </div>
          <div className="panel-controls">
            <input
              className="input"
              placeholder="Search by company, role, or location"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>
        <div className="chip-row">
          {stages.map((stage) => (
            <button
              key={stage}
              className={`chip ${activeStage === stage ? 'active' : ''}`}
              onClick={() => setActiveStage(stage)}
            >
              {stage}
            </button>
          ))}
        </div>
        <div className="kanban">
          {stages.slice(1).map((stage) => (
            <div className="kanban-column" key={stage}>
              <div className="kanban-header">
                <span>{stage}</span>
                <span className="count">
                  {applications.filter((app) => app.stage === stage).length}
                </span>
              </div>
              <div className="kanban-body">
                {applications
                  .filter((app) => app.stage === stage)
                  .map((app) => (
                    <div className="kanban-card" key={app.id}>
                      <h4>{app.company}</h4>
                      <p>{app.role}</p>
                      <span className="badge">{app.followUp}</span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h3>Application Details</h3>
            <p>Track status, dates, and next steps in one place.</p>
          </div>
          <button className="btn ghost">Export CSV</button>
        </div>
        <div className="table">
          <div className="table-row table-head">
            <span>Company</span>
            <span>Role</span>
            <span>Date Applied</span>
            <span>Status</span>
            <span>Next Step</span>
          </div>
          {filteredApplications.map((app) => (
            <div className="table-row" key={app.id}>
              <span>
                <strong>{app.company}</strong>
                <small>{app.location}</small>
              </span>
              <span>{app.role}</span>
              <span>{app.dateApplied}</span>
              <span className={`status ${app.stage.toLowerCase()}`}>{app.stage}</span>
              <span>{app.nextStep}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="grid-two">
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Reminders & Follow-ups</h3>
              <p>Stay accountable with time-based nudges.</p>
            </div>
            <button className="btn ghost">Add reminder</button>
          </div>
          <div className="list">
            {reminders.map((item) => (
              <div className="list-item" key={item.id}>
                <div>
                  <h4>{item.title}</h4>
                  <p>{item.type}</p>
                </div>
                <span className="badge">{item.due}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Master Resume Management</h3>
              <p>
                Keep a master template and create tailored versions in minutes.
              </p>
            </div>
            <a
              className="btn ghost"
              href="https://www.overleaf.com/latex/templates/jakes-resume/syzfjbzwjncs"
              target="_blank"
              rel="noreferrer"
            >
              View ATS template
            </a>
          </div>
          <div className="list">
            {resumeVersions.map((resume) => (
              <div className="list-item" key={resume.id}>
                <div>
                  <h4>{resume.name}</h4>
                  <p>Updated {resume.updated}</p>
                </div>
                <div className="tag-row">
                  {resume.tags.map((tag) => (
                    <span className="tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid-two">
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Response Tracking</h3>
              <p>Log responses and outcomes to measure progress.</p>
            </div>
            <button className="btn ghost">Add response</button>
          </div>
          <div className="response-grid">
            <div className="response-card">
              <h4>Interview Invites</h4>
              <p className="response-number">7</p>
              <span>+2 this month</span>
            </div>
            <div className="response-card">
              <h4>Rejections</h4>
              <p className="response-number">5</p>
              <span>Most recent: Civic Labs</span>
            </div>
            <div className="response-card">
              <h4>Offers</h4>
              <p className="response-number">1</p>
              <span>Negotiation in progress</span>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Communication Log</h3>
              <p>Centralize notes from emails, calls, and LinkedIn.</p>
            </div>
            <button className="btn ghost">Log note</button>
          </div>
          <div className="list">
            {communications.map((note) => (
              <div className="list-item" key={note.id}>
                <div>
                  <h4>{note.company}</h4>
                  <p>
                    {note.channel} • {note.summary}
                  </p>
                </div>
                <span className="badge">{note.date}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel accessibility">
        <div>
          <h3>Ease of Use & Accessibility</h3>
          <p>
            Responsive layout, readable typography, and keyboard-friendly
            controls keep the experience smooth on desktop or mobile.
          </p>
        </div>
        <button className="btn primary">Review accessibility checklist</button>
      </section>
    </div>
  )
}

export default App
