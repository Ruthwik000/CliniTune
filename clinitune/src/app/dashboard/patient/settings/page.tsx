'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Bell, Shield, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PatientSettings() {
  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    notifications: {
      appointments: true,
      tasks: true,
      aiAlerts: true,
    },
  });

  // Update form data when session loads
  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        name: session.user.name || '',
        email: session.user.email || '',
      }));
    }
  }, [session]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save profile data
      const profileResponse = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
        }),
      });

      // Save notification preferences
      const preferencesResponse = await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notifications: formData.notifications,
        }),
      });

      if (profileResponse.ok && preferencesResponse.ok) {
        alert('Settings saved successfully!');
        // Update session data if needed
        if (session?.user) {
          session.user.name = formData.name;
        }
      } else {
        const profileData = await profileResponse.json();
        const preferencesData = await preferencesResponse.json();
        alert(`Error: ${profileData.error || preferencesData.error}`);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout role="patient">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/patient">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
            <p className="text-gray-600">Manage your account preferences</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <Input
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                  type="email"
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose what notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Appointment Reminders</p>
                  <p className="text-sm text-gray-500">Get notified about upcoming appointments</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.notifications.appointments}
                  onChange={(e) => setFormData({
                    ...formData,
                    notifications: {
                      ...formData.notifications,
                      appointments: e.target.checked
                    }
                  })}
                  className="h-4 w-4 text-blue-600 rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Task Notifications</p>
                  <p className="text-sm text-gray-500">Get reminded about pending tasks</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.notifications.tasks}
                  onChange={(e) => setFormData({
                    ...formData,
                    notifications: {
                      ...formData.notifications,
                      tasks: e.target.checked
                    }
                  })}
                  className="h-4 w-4 text-blue-600 rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">AI Health Alerts</p>
                  <p className="text-sm text-gray-500">Receive AI-generated health insights</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.notifications.aiAlerts}
                  onChange={(e) => setFormData({
                    ...formData,
                    notifications: {
                      ...formData.notifications,
                      aiAlerts: e.target.checked
                    }
                  })}
                  className="h-4 w-4 text-blue-600 rounded"
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Security
              </CardTitle>
              <CardDescription>
                Manage your privacy and security settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Data Sharing</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Your health data is securely stored and only shared with your assigned clinicians.
                  </p>
                  <Button variant="outline" size="sm">
                    View Privacy Policy
                  </Button>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Account Security</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Your account is protected with secure authentication.
                  </p>
                  <Button variant="outline" size="sm">
                    Change Password
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}