'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Settings, Bell, Shield, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ClinicianSettingsPage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    specialization: '',
    licenseNumber: ''
  });
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    taskReminders: true,
    appointmentReminders: true,
    aiAlerts: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setProfile(prev => ({
        ...prev,
        name: session.user.name || '',
        email: session.user.email || '',
      }));
    }
  }, [session]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profile.name,
          specialization: profile.specialization,
          licenseNumber: profile.licenseNumber,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Profile updated successfully!');
        // Update session data if needed
        if (session?.user) {
          session.user.name = profile.name;
        }
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = async (key: string, value: boolean) => {
    const updatedNotifications = {
      ...notifications,
      [key]: value
    };
    
    setNotifications(updatedNotifications);
    
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notifications: updatedNotifications,
        }),
      });

      if (!response.ok) {
        console.error('Failed to update notification preferences');
        // Revert the change if API call failed
        setNotifications(notifications);
      }
    } catch (error) {
      console.error('Error updating notifications:', error);
      // Revert the change if API call failed
      setNotifications(notifications);
    }
  };

  return (
    <DashboardLayout role="clinician">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/clinician">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
            <p className="text-gray-600">Manage your account and preferences</p>
          </div>
        </div>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Profile Information
            </CardTitle>
            <CardDescription>Update your personal and professional information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    placeholder="Enter your email"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specialization
                  </label>
                  <Input
                    type="text"
                    value={profile.specialization}
                    onChange={(e) => setProfile({...profile, specialization: e.target.value})}
                    placeholder="e.g., Clinical Psychology, Counseling"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License Number
                  </label>
                  <Input
                    type="text"
                    value={profile.licenseNumber}
                    onChange={(e) => setProfile({...profile, licenseNumber: e.target.value})}
                    placeholder="Enter your license number"
                  />
                </div>
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notification Preferences
            </CardTitle>
            <CardDescription>Choose how you want to be notified</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Email Alerts</p>
                  <p className="text-sm text-gray-600">Receive important updates via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.emailAlerts}
                    onChange={(e) => handleNotificationUpdate('emailAlerts', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Task Reminders</p>
                  <p className="text-sm text-gray-600">Get notified about upcoming task deadlines</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.taskReminders}
                    onChange={(e) => handleNotificationUpdate('taskReminders', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Appointment Reminders</p>
                  <p className="text-sm text-gray-600">Receive reminders about upcoming appointments</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.appointmentReminders}
                    onChange={(e) => handleNotificationUpdate('appointmentReminders', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">AI Alerts</p>
                  <p className="text-sm text-gray-600">Get notified about AI-detected patient concerns</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.aiAlerts}
                    onChange={(e) => handleNotificationUpdate('aiAlerts', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security & Privacy
            </CardTitle>
            <CardDescription>Manage your account security</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Change Password</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Update your password to keep your account secure
                </p>
                <Button variant="outline">
                  Change Password
                </Button>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Two-Factor Authentication</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Add an extra layer of security to your account
                </p>
                <Button variant="outline">
                  Enable 2FA
                </Button>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Data Export</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Download a copy of your data and patient information
                </p>
                <Button variant="outline">
                  Export Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-700">Account Type</p>
                <p className="text-gray-600">Clinician</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Member Since</p>
                <p className="text-gray-600">
                  {session?.user ? new Date().toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Last Login</p>
                <p className="text-gray-600">Today</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Version</p>
                <p className="text-gray-600">CliniTune v1.0.0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}