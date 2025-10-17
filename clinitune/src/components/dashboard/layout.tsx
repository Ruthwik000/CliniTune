'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sidebar } from './sidebar';
import { Bell, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: 'clinician' | 'patient';
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/login');
      return;
    }

    if (session.user.role !== role) {
      const redirectPath = session.user.role === 'clinician' 
        ? '/dashboard/clinician' 
        : '/dashboard/patient';
      router.push(redirectPath);
    }
  }, [session, status, role, router]);

  useEffect(() => {
    if (session) {
      fetchNotifications();
    }
  }, [session]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.notification-dropdown') && !target.closest('.notification-button')) {
        setShowNotifications(false);
      }
      if (!target.closest('.profile-dropdown') && !target.closest('.profile-button')) {
        setShowProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      if (response.ok) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.notifications?.filter((n: any) => !n.read).length || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      const response = await fetch('/api/notifications/clear', {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchNotifications();
      } else {
        console.error('Failed to clear notifications');
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session || session.user.role !== role) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-shrink-0">
        <Sidebar role={role} />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4">
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden"
                onClick={() => {
                  const sidebar = document.getElementById('mobile-sidebar');
                  if (sidebar) {
                    sidebar.classList.toggle('hidden');
                  }
                }}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
              
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                <span className="hidden sm:inline">Welcome, {session.user.name}</span>
                <span className="sm:hidden">CliniTune</span>
              </h1>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Notifications */}
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative notification-button"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 notification-dropdown">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                          <p>No notifications</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification._id}
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                              !notification.read ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => markAsRead(notification._id)}
                          >
                            <div className="flex items-start space-x-3">
                              <div className={`w-2 h-2 rounded-full mt-2 ${
                                !notification.read ? 'bg-blue-500' : 'bg-gray-300'
                              }`} />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-2">
                                  {new Date(notification.createdAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="p-3 border-t border-gray-200 space-y-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-blue-600 hover:text-blue-700"
                          onClick={() => {
                            // Mark all as read
                            notifications.forEach(n => {
                              if (!n.read) markAsRead(n._id);
                            });
                          }}
                        >
                          Mark all as read
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-red-600 hover:text-red-700"
                          onClick={clearAllNotifications}
                        >
                          Clear all
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <Button
                  variant="ghost"
                  onClick={() => setShowProfile(!showProfile)}
                  className="flex items-center space-x-2 px-3 py-2 profile-button"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900 truncate max-w-32">
                      {session.user.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate max-w-32">
                      {session.user.email}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>

                {/* Profile Dropdown Menu */}
                {showProfile && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50 profile-dropdown">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {session.user.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {session.user.email}
                          </p>
                          <p className="text-xs text-blue-600 capitalize">
                            {session.user.role}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="py-2">
                      <Link
                        href={`/dashboard/${role}/settings`}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowProfile(false)}
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        Settings
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar Overlay */}
        <div 
          id="mobile-sidebar" 
          className="fixed inset-0 z-50 lg:hidden hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              e.currentTarget.classList.add('hidden');
            }
          }}
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
          <div className="fixed inset-y-0 left-0 w-64 bg-white">
            <Sidebar role={role} />
          </div>
        </div>
        
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}