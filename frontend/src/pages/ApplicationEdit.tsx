import { useParams } from 'react-router-dom';
import { useApplication, useUpdateApplication } from '@/api/applications';
import { ApplicationForm } from '@/features/applications/ApplicationForm';

export function ApplicationEdit() {
  const { id } = useParams<{ id: string }>();
  const { data: application, isLoading } = useApplication(Number(id));
  const updateMutation = useUpdateApplication();

  if (isLoading) {
    return (
      <div className="text-center py-8 text-gray-500">Loading application...</div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-8 text-red-600">Application not found</div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Application</h1>
      <ApplicationForm
        initialData={application}
        onSubmit={(data) => updateMutation.mutateAsync({ ...data, id: application.id })}
        isSubmitting={updateMutation.isPending}
      />
    </div>
  );
}
