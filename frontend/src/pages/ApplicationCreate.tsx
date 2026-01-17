import { useCreateApplication } from '@/api/applications';
import { ApplicationForm } from '@/features/applications/ApplicationForm';

export function ApplicationCreate() {
  const createMutation = useCreateApplication();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">New Application</h1>
      <ApplicationForm
        onSubmit={(data) => createMutation.mutateAsync(data)}
        isSubmitting={createMutation.isPending}
      />
    </div>
  );
}
