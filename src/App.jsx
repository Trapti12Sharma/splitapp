import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './routes/ProtectedRoute'
import AppLayout from './layouts/AppLayout'

// Auth pages are needed immediately on a cold visit, so they stay in the main bundle.
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import DashboardPage from './pages/DashboardPage'

// Everything else is loaded on demand. Previously every page — including the
// chart-heavy Analytics screen — was in one 800 kB bundle that had to download
// before anything rendered.
const FriendsPage = lazy(() => import('./pages/FriendsPage'))
const FriendDetailPage = lazy(() => import('./pages/FriendDetailPage'))
const GroupsPage = lazy(() => import('./pages/GroupsPage'))
const CreateGroupPage = lazy(() => import('./pages/CreateGroupPage'))
const GroupDetailPage = lazy(() => import('./pages/GroupDetailPage'))
const ExpensesPage = lazy(() => import('./pages/ExpensesPage'))
const ExpenseDetailPage = lazy(() => import('./pages/ExpenseDetailPage'))
const SettlementsPage = lazy(() => import('./pages/SettlementsPage'))
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'))
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))

const PageLoader = () => (
    <div className="flex items-center justify-center py-24">
        <div className="w-9 h-9 border-[3px] border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
)

// Protected pages all share the same shell; this keeps the route table readable.
const protectedPage = (Page) => (
    <ProtectedRoute>
        <AppLayout>
            <Suspense fallback={<PageLoader />}>
                <Page />
            </Suspense>
        </AppLayout>
    </ProtectedRoute>
)

const App = () => (
    <BrowserRouter>
        <ThemeProvider>
            <AuthProvider>
                <Toaster
                    // top-right used to sit exactly on top of the mobile header's
                    // notification-bell and hamburger-menu buttons — react-hot-toast
                    // renders at z-index 9999, well above the header's z-40, so for
                    // the ~3s a toast was up it visually replaced those icons and
                    // they couldn't be tapped. Centering it and dropping it below
                    // the mobile header's height clears both the header and (since
                    // it's centered, not right-aligned) the icons entirely; on
                    // desktop there is no top header, so the extra offset just
                    // leaves a little more breathing room above the toast.
                    position="top-center"
                    containerStyle={{ top: 72 }}
                    toastOptions={{
                        duration: 3000,
                        // Token-driven so toasts match the active theme instead of
                        // always rendering on a white card.
                        style: {
                            fontSize: '14px',
                            borderRadius: '12px',
                            maxWidth: '380px',
                            background: 'var(--surface)',
                            color: 'var(--text)',
                            border: '1px solid var(--border)',
                            boxShadow: 'var(--shadow-lg)',
                        },
                        success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
                        error: { iconTheme: { primary: '#f43f5e', secondary: '#fff' } },
                    }}
                />
                <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />

                    {/* Protected routes */}
                    <Route path="/" element={protectedPage(DashboardPage)} />
                    <Route path="/dashboard" element={protectedPage(DashboardPage)} />
                    <Route path="/friends" element={protectedPage(FriendsPage)} />
                    <Route path="/friends/:id" element={protectedPage(FriendDetailPage)} />
                    <Route path="/groups" element={protectedPage(GroupsPage)} />
                    <Route path="/groups/create" element={protectedPage(CreateGroupPage)} />
                    <Route path="/groups/:id" element={protectedPage(GroupDetailPage)} />
                    <Route path="/expenses" element={protectedPage(ExpensesPage)} />
                    <Route path="/expenses/:id" element={protectedPage(ExpenseDetailPage)} />
                    <Route path="/settlements" element={protectedPage(SettlementsPage)} />
                    <Route path="/analytics" element={protectedPage(AnalyticsPage)} />
                    <Route path="/notifications" element={protectedPage(NotificationsPage)} />
                    <Route path="/profile" element={protectedPage(ProfilePage)} />
                    <Route path="/settings" element={protectedPage(SettingsPage)} />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </AuthProvider>
        </ThemeProvider>
    </BrowserRouter>
)

export default App
