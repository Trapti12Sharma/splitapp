import Sidebar from '../components/layout/Sidebar'
import TopNavbar from '../components/layout/TopNavbar'
import BottomNavbar from '../components/layout/BottomNavbar'
import { NotificationProvider } from '../context/NotificationContext'
import { useDarkMode } from '../hooks/useDarkMode'

const AppLayout = ({ children }) => {
    const { isDark } = useDarkMode()
    return (
        <NotificationProvider>
            <div className={`min-h-screen transition-colors duration-200 ${isDark ? 'dark' : ''}`}
                style={{ background: isDark ? '#0f0f1a' : '#f8f7ff' }}>
                <Sidebar />
                <TopNavbar />
                <main className="lg:ml-[240px] pb-24 lg:pb-8 pt-0">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
                        {children}
                    </div>
                </main>
                <BottomNavbar />
            </div>
        </NotificationProvider>
    )
}

export default AppLayout
