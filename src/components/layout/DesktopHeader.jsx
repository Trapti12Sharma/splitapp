import NotificationDropdown from '../notifications/NotificationDropdown'
import ProfileMenuDropdown from './ProfileMenuDropdown'

/**
 * Desktop only (mobile already gets the bell in TopNavbar's header). Sits
 * above the main content, offset to clear the fixed sidebar. Previously the
 * only way to reach notifications on desktop was a full nav item in the
 * sidebar that navigated away to the notifications page — no quick popover
 * like mobile has. That nav item is gone now; this bell (with the same
 * dropdown component mobile uses) replaces it.
 *
 * The profile menu (dark mode toggle, Settings, Logout) used to be pinned to
 * the bottom of the sidebar — it's a dropdown off the avatar here instead,
 * next to the bell.
 */
const DesktopHeader = () => (
    <header
        className="hidden lg:flex items-center justify-end gap-2 lg:ml-[240px] h-16 px-6 sticky top-0 z-30 border-b"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
        <NotificationDropdown />
        <ProfileMenuDropdown />
    </header>
)

export default DesktopHeader
