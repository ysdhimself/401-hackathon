import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-4">
      <div className="text-6xl">🧭</div>
      <div>
        <h1 className="text-3xl font-bold mb-2">Page not found</h1>
        <p className="text-gray-600 max-w-md">
          We couldn&apos;t find the page you were looking for. Use the navigation or head back to the dashboard to continue tracking your applications.
        </p>
      </div>
      <div className="flex gap-3">
        <Link to="/" className="btn btn-primary">
          Back to Dashboard
        </Link>
        <Link to="/applications" className="btn btn-secondary">
          View Applications
        </Link>
      </div>
    </div>
  );
}
