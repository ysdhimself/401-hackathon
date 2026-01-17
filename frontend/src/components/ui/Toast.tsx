import { clsx } from 'clsx';
import { useUIStore } from '@/stores/uiStore';

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={clsx(
            'px-4 py-3 rounded-lg shadow-lg text-white flex items-center gap-3 min-w-[300px]',
            {
              'bg-green-600': toast.type === 'success',
              'bg-red-600': toast.type === 'error',
              'bg-blue-600': toast.type === 'info',
            }
          )}
        >
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-white/80 hover:text-white"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}
