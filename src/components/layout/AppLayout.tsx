import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Toaster } from 'react-hot-toast';

const navItems = [
  { to: '/departments', label: 'Departments' },
  { to: '/positions', label: 'Position' },
  { to: '/employees', label: 'Employees' },
  { to: '/roster', label: 'Roster Planning' },
  
];

export default function AppLayout() {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-surface-canvas text-gray-800">
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />

      <header className="flex h-14 shrink-0 items-center gap-1 border-b border-gray-200 bg-surface-white px-4">
        <div className="mr-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
            C
          </div>
          <div>
            <div className="text-sm font-bold leading-none text-gray-800">Comficare</div>
            <div className="text-xs leading-none text-gray-400">Roster Management</div>
          </div>
        </div>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'rounded-sm px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive ? 'bg-primary-tint text-primary' : 'text-gray-600 hover:bg-surface-offwhite'
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
            AS
          </div>
          <div className="text-right leading-tight">
            <div className="text-xs font-semibold text-gray-700">Dr. Ananya Singh</div>
            <div className="text-xs text-gray-400">Administrator</div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
