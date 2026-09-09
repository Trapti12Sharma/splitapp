import Sidebar from '../components/layout/Sidebar'
import TopNavbar from '../components/layout/TopNavbar'
import BottomNavbar from '../components/layout/BottomNavbar'
import { NotificationProvider } from '../context/NotificationContext'

/**
 * The layout no longer reads the theme itself. It used to apply `dark` to this
 * div and set an inline background from its own copy of `isDark` — which both
 * duplicated the class already on <html> and, being an inline style, overrode
 * every `dark:` class underneath it. The body background now comes from the
 * design tokens in index.css.
 */
const AppLayout = ({ children }) => (
    <NotificationProvider>
        <div className="min-h-screen">
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

export default AppLayout
