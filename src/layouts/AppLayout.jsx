import Sidebar from '../components/layout/Sidebar'
import TopNavbar from '../components/layout/TopNavbar'
import BottomNavbar from '../components/layout/BottomNavbar'
import { NotificationProvider } from '../context/NotificationContext'

const AppLayout = ({ children }) => {
    return (
        <NotificationProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
                <Sidebar />
                <TopNavbar />
                <main className="lg:ml-[260px] pb-20 lg:pb-0">
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
