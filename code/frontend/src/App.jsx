import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import TopicGridPage from './pages/TopicGridPage';
import TopicDetailPage from './pages/TopicDetailPage';
import WeeklyCalendarPage from './pages/WeeklyCalendarPage';
import StatsPage from './pages/StatsPage';
import JournalPage from './pages/JournalPage';
import CreateTaskModal from './components/CreateTaskModal';
import CreateTopicModal from './components/CreateTopicModal';
import api from './services/api';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#FF8F7E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppContent = () => {
  const { isAuthenticated } = useAuth();
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [createTaskDate, setCreateTaskDate] = useState(null);
  const [isCreateTopicOpen, setIsCreateTopicOpen] = useState(false);
  const [topics, setTopics] = useState([]);

  // Fetch topics list for global CreateTaskModal dropdown
  const fetchTopics = async () => {
    if (isAuthenticated) {
      try {
        const res = await api.get('/topics');
        setTopics(res.data);
      } catch (err) {
        console.error('Failed to load topics for modal:', err);
      }
    }
  };

  useEffect(() => {
    fetchTopics();
  }, [isAuthenticated, isCreateTaskOpen]);

  const handleOpenCreateTask = (date = null) => {
    setCreateTaskDate(date);
    setIsCreateTaskOpen(true);
  };

  return (
    <div className="min-h-screen pb-12 flex flex-col justify-between">
      <div>
        <Navbar onOpenCreateTask={() => handleOpenCreateTask()} />

        <main className="mt-4">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <WeeklyCalendarPage
                    onOpenCreateTask={handleOpenCreateTask}
                    topics={topics}
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/topics"
              element={
                <ProtectedRoute>
                  <TopicGridPage onOpenCreateTask={() => handleOpenCreateTask()} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/topics/:id"
              element={
                <ProtectedRoute>
                  <TopicDetailPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/stats"
              element={
                <ProtectedRoute>
                  <StatsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/journal"
              element={
                <ProtectedRoute>
                  <JournalPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-16 text-center text-xs font-bold text-gray-500 py-4 border-t border-gray-200/50 max-w-7xl mx-auto w-full">
        <p className="flex items-center justify-center gap-1">
          TaskFlow System &copy; 2026 — Designed with <span className="text-[#FF5CA8]">♥</span> in <span className="font-script text-[#FF8F7E] text-sm">Solar Pastel Pop</span> Vibe
        </p>
      </footer>

      {/* Global Modals */}
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        initialDate={createTaskDate}
        onCreated={() => {
          fetchTopics();
          window.dispatchEvent(new Event('taskCreated'));
        }}
        topics={topics}
        onOpenCreateTopic={() => setIsCreateTopicOpen(true)}
      />

      <CreateTopicModal
        isOpen={isCreateTopicOpen}
        onClose={() => setIsCreateTopicOpen(false)}
        onCreated={() => {
          fetchTopics();
        }}
      />
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
