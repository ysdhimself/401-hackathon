import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { ApplicationList } from '@/pages/ApplicationList';
import { ApplicationCreate } from '@/pages/ApplicationCreate';
import { ApplicationDetail } from '@/pages/ApplicationDetail';
import { ApplicationEdit } from '@/pages/ApplicationEdit';
import { FollowUpList } from '@/pages/FollowUpList';
import { GmailPage } from '@/pages/GmailPage';
import { NotFound } from '@/pages/NotFound';
import MasterResumeList from '@/pages/MasterResumeList';
import MasterResumeForm from '@/pages/MasterResumeForm';
import MasterResumeDetail from '@/pages/MasterResumeDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="applications" element={<ApplicationList />} />
          <Route path="applications/new" element={<ApplicationCreate />} />
          <Route path="applications/:id" element={<ApplicationDetail />} />
          <Route path="applications/:id/edit" element={<ApplicationEdit />} />
          <Route path="follow-ups" element={<FollowUpList />} />
          <Route path="gmail" element={<GmailPage />} />
          <Route path="master-resumes" element={<MasterResumeList />} />
          <Route path="master-resumes/create" element={<MasterResumeForm />} />
          <Route path="master-resumes/:id" element={<MasterResumeDetail />} />
          <Route path="master-resumes/:id/edit" element={<MasterResumeForm />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
