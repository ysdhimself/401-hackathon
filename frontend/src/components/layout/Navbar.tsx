import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useFollowUps } from '@/api/applications';

export function Navbar() {
  const { data: followUps } = useFollowUps();
  const followUpCount = followUps?.length || 0;

  return (
    <nav className="bg-slate-800 px-8 py-4 flex justify-between items-center">
      <Link to="/" className="text-white text-xl font-bold">
        Job Tracker
      </Link>
      <ul className="flex gap-2">
        <NavItem to="/">Dashboard</NavItem>
        <NavItem to="/applications">All Applications</NavItem>
        <NavItem to="/follow-ups">
          Follow-ups
          {followUpCount > 0 && (
            <span className="ml-1.5 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {followUpCount}
            </span>
          )}
        </NavItem>
        <NavItem to="/master-resumes">Master Resume</NavItem>
        <NavItem to="/applications/new">+ New Application</NavItem>
        <NavItem to="/gmail">Gmail</NavItem>
      </ul>
    </nav>
  );
}

function NavItem({ to, children }: { to: string; children: ReactNode }) {
  return (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) =>
          `text-gray-300 hover:text-white px-3 py-2 rounded transition-colors inline-flex items-center ${isActive ? 'bg-slate-700 text-white' : ''
          }`
        }
      >
        {children}
      </NavLink>
    </li>
  );
}
