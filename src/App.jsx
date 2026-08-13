import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './routes/ProtectedRoute'
import AppLayout from './layouts/AppLayout'

// Auth Pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'

// App Pages
import DashboardPage from './pages/DashboardPage'
import FriendsPage from './pages/FriendsPage'
import FriendDetailPage from './pages/FriendDetailPage'
import GroupsPage from './pages/GroupsPage'
import CreateGroupPage from './pages/CreateGroupPage'
import GroupDetailPage from './pages/GroupDetailPage'
import ExpensesPage from './pages/ExpensesPage'
import ExpenseDetailPage from './pages/ExpenseDetailPage'
import SettlementsPage from './pages/SettlementsPage'
import AnalyticsPage from './pages/AnalyticsPage'
import NotificationsPage from './pages/NotificationsPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'

const App = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 3000,
                        style: { fontSize: '14px', borderRadius: '10px', maxWidth: '380px' },
                        success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } },
                    }}
                />
                <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />

                    {/* Protected routes */}
                    <Route path="/" element={<ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>} />
                    <Route path="/dashboard" element={<ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>} />
                    <Route path="/friends" element={<ProtectedRoute><AppLayout><FriendsPage /></AppLayout></ProtectedRoute>} />
                    <Route path="/friends/:id" element={<ProtectedRoute><AppLayout><FriendDetailPage /></AppLayout></ProtectedRoute>} />
                    <Route path="/groups" element={<ProtectedRoute><AppLayout><GroupsPage /></AppLayout></ProtectedRoute>} />
                    <Route path="/groups/create" element={<ProtectedRoute><AppLayout><CreateGroupPage /></AppLayout></ProtectedRoute>} />
                    <Route path="/groups/:id" element={<ProtectedRoute><AppLayout><GroupDetailPage /></AppLayout></ProtectedRoute>} />
                    <Route path="/expenses" element={<ProtectedRoute><AppLayout><ExpensesPage /></AppLayout></ProtectedRoute>} />
                    <Route path="/expenses/:id" element={<ProtectedRoute><AppLayout><ExpenseDetailPage /></AppLayout></ProtectedRoute>} />
                    <Route path="/settlements" element={<ProtectedRoute><AppLayout><SettlementsPage /></AppLayout></ProtectedRoute>} />
                    <Route path="/analytics" element={<ProtectedRoute><AppLayout><AnalyticsPage /></AppLayout></ProtectedRoute>} />
                    <Route path="/notifications" element={<ProtectedRoute><AppLayout><NotificationsPage /></AppLayout></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute><AppLayout><SettingsPage /></AppLayout></ProtectedRoute>} />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    )
}

export default App
