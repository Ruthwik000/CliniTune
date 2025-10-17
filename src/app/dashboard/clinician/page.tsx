'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, AlertCircle, TrendingUp } from 'lucide-react';

interface DashboardStats {
  todayAppointments: number;
  activePatients: number;
  aiAlerts: number;
  completionRate: number;
}

interface RecentActivity {
  todayAppointments: Array<{
    id: string;
    patientName: string;
    time: string;
    type: string;
    status: string;
  }>;
  recentAISummaries: Array<{
    patientName: string;
    summary: string;
    alertType: 'alert' | 'positive' | 'neutral';
    createdAt: string;
  }>;
}

export default function ClinicianDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    activePatients: 0,
    aiAlerts: 0,
    completionRate: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity>({
    todayAppointments: [],
    recentAISummaries: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, activityResponse] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/recent-activity')
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        setRecentActivity(activityData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshAIAlerts = async () => {
    try {
      // First refresh the AI classifications
      const refreshResponse = await fetch('/api/dashboard/refresh-stats', {
        method: 'POST',
      });
      
      if (refreshResponse.ok) {
        // Then fetch updated dashboard data
        await fetchDashboardData();
      }
    } catch (error) {
      console.error('Error refreshing AI alerts:', error);
    }
  };

  return (
    <DashboardLayout role="clinician">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-gray-600">Monitor your practice and patient progress</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Sessions</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats.todayAppointments}
              </div>
              <p className="text-xs text-muted-foreground">
                Scheduled for today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats.activePatients}
              </div>
              <p className="text-xs text-muted-foreground">
                Under your care
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Alerts</CardTitle>
              <div className="flex items-center gap-2">
                <button
                  onClick={refreshAIAlerts}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  title="Refresh AI Alerts"
                >
                  <svg className="h-3 w-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {loading ? '...' : stats.aiAlerts}
              </div>
              <p className="text-xs text-muted-foreground">
                Requires attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {loading ? '...' : `${stats.completionRate}%`}
              </div>
              <p className="text-xs text-muted-foreground">
                Task completion
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Today's Appointments</CardTitle>
              <CardDescription>Upcoming sessions for today</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading appointments...</p>
                </div>
              ) : recentActivity.todayAppointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No appointments scheduled for today</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.todayAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{appointment.patientName}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(appointment.time).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })} - {appointment.type}
                        </p>
                      </div>
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        appointment.status === 'upcoming' ? 'bg-blue-100 text-blue-600' :
                        appointment.status === 'completed' ? 'bg-green-100 text-green-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent AI Summaries</CardTitle>
              <CardDescription>Latest patient check-in insights</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading summaries...</p>
                </div>
              ) : recentActivity.recentAISummaries.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No recent AI summaries available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.recentAISummaries.map((summary, index) => (
                    <div key={index} className={`p-3 rounded-lg border ${
                      summary.alertType === 'alert' ? 'bg-red-50 border-red-200' :
                      summary.alertType === 'positive' ? 'bg-green-50 border-green-200' :
                      'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{summary.patientName}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          summary.alertType === 'alert' ? 'bg-red-100 text-red-600' :
                          summary.alertType === 'positive' ? 'bg-green-100 text-green-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {summary.alertType}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {summary.summary.length > 120 
                          ? `${summary.summary.substring(0, 120)}...` 
                          : summary.summary
                        }
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}