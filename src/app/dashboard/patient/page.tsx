'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, CheckSquare, MessageSquare, Clock } from 'lucide-react';
import Link from 'next/link';

interface Task {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
}

interface Appointment {
  _id: string;
  date: string;
  type: string;
  clinicianId: {
    name: string;
  };
}

export default function PatientDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [tasksResponse, appointmentsResponse] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/appointments')
      ]);

      const tasksData = await tasksResponse.json();
      const appointmentsData = await appointmentsResponse.json();

      if (tasksResponse.ok) {
        setTasks(tasksData.tasks || []);
      }
      
      if (appointmentsResponse.ok) {
        setAppointments(appointmentsData.appointments || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const pendingTasks = tasks.filter(task => !task.completed);
  const upcomingAppointments = appointments.filter(apt => new Date(apt.date) >= new Date());
  const nextAppointment = upcomingAppointments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  
  const completedTasks = tasks.filter(task => task.completed);
  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
  return (
    <DashboardLayout role="patient">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome Back!</h2>
          <p className="text-gray-600">Here's your progress and upcoming activities</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <Link href="/dashboard/patient/chat">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Wellness Chat</CardTitle>
                <MessageSquare className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Chat Now</div>
                <p className="text-xs text-gray-500">
                  Share how you're feeling today
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/patient/tasks">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                <CheckSquare className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {loading ? '...' : pendingTasks.length}
                </div>
                <p className="text-xs text-gray-500">
                  Tasks to complete
                </p>
              </CardContent>
            </Card>
          </Link>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Appointment</CardTitle>
              <Calendar className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-lg font-bold text-purple-600">Loading...</div>
              ) : nextAppointment ? (
                <>
                  <div className="text-lg font-bold text-purple-600">
                    {new Date(nextAppointment.date).toLocaleDateString()}
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(nextAppointment.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} with {nextAppointment.clinicianId.name}
                  </p>
                </>
              ) : (
                <>
                  <div className="text-lg font-bold text-gray-400">No appointments</div>
                  <p className="text-xs text-gray-500">Schedule your next session</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Your scheduled sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading appointments...</p>
                </div>
              ) : upcomingAppointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No upcoming appointments</p>
                  <p className="text-sm mt-2">Your scheduled sessions will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingAppointments.slice(0, 3).map((appointment) => (
                    <div key={appointment._id} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{appointment.type}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(appointment.date).toLocaleDateString()}, {new Date(appointment.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                        <p className="text-sm text-gray-500 truncate">{appointment.clinicianId.name}</p>
                      </div>
                      <Clock className="h-5 w-5 text-purple-600 flex-shrink-0 ml-2" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>To-Do List</CardTitle>
              <CardDescription>Tasks assigned by your therapist</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading tasks...</p>
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No tasks assigned yet</p>
                  <p className="text-sm mt-2">Your therapist will assign tasks here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.slice(0, 3).map((task) => (
                    <div 
                      key={task._id} 
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        task.completed 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-yellow-50 border-yellow-200'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{task.title}</p>
                        <p className="text-sm text-gray-600">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      {task.completed ? (
                        <span className="text-sm text-green-600 flex-shrink-0 ml-2">✓ Done</span>
                      ) : (
                        <Link href="/dashboard/patient/tasks" className="flex-shrink-0 ml-2">
                          <Button size="sm" variant="outline" className="text-xs">
                            <span className="hidden sm:inline">Complete</span>
                            <span className="sm:hidden">Do</span>
                          </Button>
                        </Link>
                      )}
                    </div>
                  ))}
                  {tasks.length > 3 && (
                    <div className="text-center pt-2">
                      <Link href="/dashboard/patient/tasks">
                        <Button variant="ghost" size="sm">
                          View all tasks
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Progress Section */}
        <Card>
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
            <CardDescription>Weekly wellness summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {loading ? '...' : `${completionRate}%`}
                </div>
                <p className="text-sm text-gray-600">Task Completion</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {loading ? '...' : upcomingAppointments.length}
                </div>
                <p className="text-sm text-gray-600">Upcoming Sessions</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {loading ? '...' : tasks.length}
                </div>
                <p className="text-sm text-gray-600">Total Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}