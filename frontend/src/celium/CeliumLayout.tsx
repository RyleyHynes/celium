import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { LogIn, LogOut, Moon, Sun } from 'lucide-react'
import Button from '@/components/buttons/Button'
import IconButton from '@/components/buttons/IconButton'
import Avatar from '@/components/user/Avatar'
import { useAuth } from '@/celium/auth'

const navItems = [
  { label: 'Explore', to: '/explore' },
  { label: 'Plan', to: '/plan' },
]

const CeliumLayout = () => {
  const [enabled, setEnabled] = useState(document.documentElement.classList.contains('dark'))
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const { isAuthenticated, user, login, logout } = useAuth()
  const userDisplayName = user?.name ?? user?.email ?? 'User'
  const userInitials = userDisplayName
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const toggleTheme = () => {
    const root = document.documentElement
    const next = !enabled
    if (next) root.classList.add('dark')
    else root.classList.remove('dark')
    setEnabled(next)
  }

  useEffect(() => {
    const handleDocumentMouseDown = (event: MouseEvent) => {
      if (!userMenuRef.current?.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleDocumentMouseDown)
    return () => document.removeEventListener('mousedown', handleDocumentMouseDown)
  }, [])

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 dark:border-slate-800 bg-white/85 dark:bg-slate-950/70 backdrop-blur">
        <div className="container-padded h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link className="flex items-center gap-2" to="/explore">
              <span className="h-9 w-9 rounded-xl bg-emerald-600 text-white grid place-items-center font-semibold">C</span>
              <span className="text-lg font-semibold tracking-tight">Celium</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map(item => (
                <NavLink
                  className={({ isActive }) => `navlink ${isActive ? 'text-emerald-600 dark:text-emerald-300' : ''}`}
                  key={item.to}
                  to={item.to}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <IconButton
              ariaLabel="Toggle dark mode"
              icon={enabled ? <Sun size={16} /> : <Moon size={16} />}
              onClick={toggleTheme}
            />
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <Button
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="menu"
                  aria-label="Open user menu"
                  className="rounded-full p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  type="button"
                  variant="unstyled"
                  onClick={() => setIsUserMenuOpen((current) => !current)}
                >
                  <Avatar initials={userInitials} />
                </Button>
                {isUserMenuOpen ? (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200/80 bg-white p-2 shadow-soft dark:border-white/10 dark:bg-slate-900"
                    role="menu"
                  >
                    <div className="border-b border-slate-200/80 px-3 py-2 text-sm font-medium text-slate-700 dark:border-white/10 dark:text-slate-200">
                      {userDisplayName}
                    </div>
                    <Button
                      className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-100 hover:text-emerald-700 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-emerald-200"
                      role="menuitem"
                      type="button"
                      variant="unstyled"
                      onClick={() => {
                        setIsUserMenuOpen(false)
                        logout()
                      }}
                    >
                      <LogOut size={14} />
                      Sign out
                    </Button>
                  </div>
                ) : null}
              </div>
            ) : (
              <Button
                className="inline-flex items-center gap-1 rounded-full border border-slate-300/80 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-emerald-500 hover:text-emerald-600 dark:border-slate-700 dark:text-slate-200"
                type="button"
                variant="ghost"
                onClick={() => void login({ returnTo: '/explore', mode: 'signin' })}
              >
                <LogIn size={14} />
                Sign in
              </Button>
            )}
          </div>
        </div>
      </header>
      <main className="container-padded py-8">
        <div id="content" />
        <Outlet />
      </main>
    </div>
  )
}

export default CeliumLayout
