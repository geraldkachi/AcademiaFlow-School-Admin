import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { DashboardLayout, ProtectedRoute } from './components';
import OnboardingPage from './pages/onboarding/OnboardingPage';
import { LoginPage, ForgotPasswordPage, VerifyCodePage, ResetPasswordPage, PasswordResetSuccessPage } from './pages/auth/AuthPages';
import DashboardPage from './pages/dashboard/DashboardPage';
import StudentsPage from './pages/students/StudentsPage';
import StaffsPage from './pages/staffs/StaffsPage';
import AcademicsPage from './pages/academics/AcademicsPage';
import ExamsPage from './pages/exams/ExamsPage';
import { AssignmentsPage, ResultsPage } from './pages/other/OtherPages';
import { NotificationsPage, SettingsPage } from './pages/other/NotifSettings';

const qc = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 5 * 60 * 1000 } } });

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{ className: 'text-sm font-medium' }}/>
          <Routes>
            <Route path="/onboarding" element={<OnboardingPage/>}/>
            <Route path="/login" element={<LoginPage/>}/>
            <Route path="/forgot-password" element={<ForgotPasswordPage/>}/>
            <Route path="/verify-code" element={<VerifyCodePage/>}/>
            <Route path="/reset-password" element={<ResetPasswordPage/>}/>
            <Route path="/password-reset-success" element={<PasswordResetSuccessPage/>}/>
            <Route element={<ProtectedRoute><DashboardLayout/></ProtectedRoute>}>
              <Route path="/dashboard" element={<DashboardPage/>}/>
              <Route path="/students" element={<StudentsPage/>}/>
              <Route path="/staffs" element={<StaffsPage/>}/>
              <Route path="/academics" element={<AcademicsPage/>}/>
              <Route path="/exams" element={<ExamsPage/>}/>
              <Route path="/assignments" element={<AssignmentsPage/>}/>
              <Route path="/results" element={<ResultsPage/>}/>
              <Route path="/notifications" element={<NotificationsPage/>}/>
              <Route path="/settings" element={<SettingsPage/>}/>
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
