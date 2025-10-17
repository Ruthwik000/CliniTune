'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  LogOut,
  MessageSquare,
  CheckSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  role: 'clinician' | 'patient';
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const clinicianNavItems = [
    { href: '/dashboard/clinician', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/clinician/patients', label: 'Patients', icon: Users },
    { href: '/dashboard/clinician/appointments', label: 'Appointments', icon: Calendar },
    { href: '/dashboard/clinician/tasks', label: 'Tasks', icon: CheckSquare },
    { href: '/dashboard/clinician/settings', label: 'Settings', icon: Settings },
  ];

  const patientNavItems = [
    { href: '/dashboard/patient', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/patient/tasks', label: 'Tasks', icon: CheckSquare },
    { href: '/dashboard/patient/chat', label: 'AI Chat', icon: MessageSquare },
    { href: '/dashboard/patient/appointments', label: 'Appointments', icon: Calendar },
  ];

  const navItems = role === 'clinician' ? clinicianNavItems : patientNavItems;

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between lg:justify-start">
          <div>
            <h2 className="text-xl font-bold text-gray-900">CliniTune</h2>
            <p className="text-sm text-gray-500 capitalize">{role} Portal</p>
          </div>
          {/* Close button for mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => {
              const sidebar = document.getElementById('mobile-sidebar');
              if (sidebar) {
                sidebar.classList.add('hidden');
              }
            }}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
              onClick={() => {
                // Close mobile sidebar when navigating
                const sidebar = document.getElementById('mobile-sidebar');
                if (sidebar) {
                  sidebar.classList.add('hidden');
                }
              }}
            >
              <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
          <span className="truncate">Sign Out</span>
        </Button>
      </div>
    </div>
  );
}