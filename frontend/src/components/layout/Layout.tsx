import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { ToastContainer } from '@/components/ui/Toast';

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>
      <ToastContainer />
    </div>
  );
}
