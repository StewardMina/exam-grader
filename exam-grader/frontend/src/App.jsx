import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import ExamBuilder from './pages/ExamBuilder';
import ExamResults from './pages/ExamResults';
import SubmissionDetail from './pages/SubmissionDetail';
import StudentEntry from './pages/StudentEntry';
import TakeExam from './pages/TakeExam';
import ExamDone from './pages/ExamDone';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Student routes */}
        <Route path="/" element={<StudentEntry />} />
        <Route path="/exam/:examId" element={<TakeExam />} />
        <Route path="/done" element={<ExamDone />} />

        {/* Teacher routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/subjects" element={<ProtectedRoute><Subjects /></ProtectedRoute>} />
        <Route path="/exams/:examId/questions" element={<ProtectedRoute><ExamBuilder /></ProtectedRoute>} />
        <Route path="/exams/:examId/results" element={<ProtectedRoute><ExamResults /></ProtectedRoute>} />
        <Route path="/submissions/:id" element={<ProtectedRoute><SubmissionDetail /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
