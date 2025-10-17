'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Calendar, CheckSquare, MessageSquare, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Patient {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface Appointment {
  _id: string;
  date: string;
  type: string;
  status: string;
  notes?: string;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
}

interface AIChat {
  _id: string;
  summary: string;
  createdAt: string;
}

export default function PatientProfilePage() {
  const params = useParams();
  const patientId = params.id as string;
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [aiChats, setAiChats] = useState<AIChat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patientId) {
      fetchPatientData();
    }
  }, [patientId]);

  const fetchPatientData = async () => {
    try {
      const [patientRes, appointmentsRes, tasksRes, aiChatsRes] = await Promise.all([
        fetch(`/api/patients/${patientId}`),
        fetch(`/api/appointments?patientId=${patientId}`),
        fetch(`/api/tasks?patientId=${patientId}`),
        fetch(`/api/ai/chat?patientId=${patientId}`)
      ]);

      if (patientRes.ok) {
        const patientData = await patientRes.json();
        setPatient(patientData.patient);
      }

      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json();
        setAppointments(appointmentsData.appointments || []);
      }

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData.tasks || []);
      }

      if (aiChatsRes.ok) {
        const aiChatsData = await aiChatsRes.json();
        setAiChats(aiChatsData.chats || []);
      }
    } catch (error) {
      console.error('Error fetching patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="clinician">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading patient profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!patient) {
    return (
      <DashboardLayout role="clinician">
        <div className="text-center py-8">
          <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">Patient not found</p>
          <Link href="/dashboard/clinician/patients">
            <Button className="mt-4">Back to Patients</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);
  const upcomingAppointments = appointments.filter(apt => 
    new Date(apt.date) >= new Date() && apt.status === 'upcoming'
  );

  return (
    <DashboardLayout role="clinician">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <Link href="/dashboard/clinician/patients">
              <Button variant="ghost" size="sm" className="self-start">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Patients
              </Button>
            </Link>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{patient.name}</h2>
              <p className="text-gray-600">Patient Profile</p>
            </div>
          </div>
        </div>

        {/* Patient Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Name</p>
                <p className="text-gray-900">{patient.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Email</p>
                <p className="text-gray-900">{patient.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Patient Since</p>
                <p className="text-gray-900">
                  {new Date(patient.createdAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckSquare className="h-5 w-5 mr-2" />
                Task Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Tasks</span>
                <span className="font-medium">{tasks.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Completed</span>
                <span className="font-medium text-green-600">{completedTasks.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Pending</span>
                <span className="font-medium text-yellow-600">{pendingTasks.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Completion Rate</span>
                <span className="font-medium">
                  {tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Appointments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Sessions</span>
                <span className="font-medium">{appointments.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Upcoming</span>
                <span className="font-medium text-blue-600">{upcomingAppointments.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Last Session</span>
                <span className="font-medium">
                  {appointments.length > 0 
                    ? new Date(appointments[appointments.length - 1].date).toLocaleDateString()
                    : 'None'
                  }
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Tasks</CardTitle>
              <CardDescription>Latest assigned tasks</CardDescription>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No tasks assigned</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.slice(0, 5).map((task) => (
                    <div key={task._id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {task.title}
                        </p>
                        <p className="text-sm text-gray-600">{task.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        task.completed 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-yellow-100 text-yellow-600'
                      }`}>
                        {task.completed ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Chat Summaries</CardTitle>
              <CardDescription>Recent therapeutic conversation insights</CardDescription>
            </CardHeader>
            <CardContent>
              {aiChats.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No AI chat sessions</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {aiChats.slice(0, 3).map((chat) => {
                    const isAlert = chat.summary.toLowerCase().includes('concern') || 
                                   chat.summary.toLowerCase().includes('alert');
                    
                    return (
                      <div key={chat._id} className={`p-3 rounded-lg border ${
                        isAlert ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            isAlert ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {isAlert ? (
                              <>
                                <AlertCircle className="h-3 w-3 mr-1 inline" />
                                Alert
                              </>
                            ) : (
                              'Summary'
                            )}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(chat.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {chat.summary.length > 150 
                            ? `${chat.summary.substring(0, 150)}...` 
                            : chat.summary
                          }
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>Scheduled sessions with this patient</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No upcoming appointments</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 capitalize">
                        {appointment.type.replace('-', ' ')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(appointment.date).toLocaleDateString()} at{' '}
                        {new Date(appointment.date).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {appointment.notes && (
                        <p className="text-sm text-gray-500 mt-1">{appointment.notes}</p>
                      )}
                    </div>
                    <span className="text-sm px-3 py-1 bg-blue-100 text-blue-600 rounded-full">
                      {appointment.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}