'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, MapPin, Phone } from 'lucide-react';

interface Appointment {
  _id: string;
  date: string;
  type: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;
  clinicianId: {
    name: string;
  };
}

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments');
      const data = await response.json();
      
      if (response.ok) {
        setAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const upcomingAppointments = appointments.filter(apt => 
    new Date(apt.date) >= new Date() && apt.status === 'upcoming'
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastAppointments = appointments.filter(apt => 
    new Date(apt.date) < new Date() || apt.status === 'completed'
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const isToday = (dateString: string) => {
    const today = new Date();
    const appointmentDate = new Date(dateString);
    return today.toDateString() === appointmentDate.toDateString();
  };

  const isTomorrow = (dateString: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const appointmentDate = new Date(dateString);
    return tomorrow.toDateString() === appointmentDate.toDateString();
  };

  return (
    <DashboardLayout role="patient">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Appointments</h2>
          <p className="text-gray-600">View and manage your therapy sessions</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {loading ? '...' : upcomingAppointments.length}
              </div>
              <p className="text-xs text-gray-500">
                Scheduled appointments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Clock className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {loading ? '...' : appointments.filter(apt => {
                  const aptDate = new Date(apt.date);
                  const now = new Date();
                  return aptDate.getMonth() === now.getMonth() && 
                         aptDate.getFullYear() === now.getFullYear();
                }).length}
              </div>
              <p className="text-xs text-gray-500">
                Total sessions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Session</CardTitle>
              <User className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-lg font-bold text-purple-600">Loading...</div>
              ) : upcomingAppointments.length > 0 ? (
                <>
                  <div className="text-lg font-bold text-purple-600">
                    {isToday(upcomingAppointments[0].date) ? 'Today' :
                     isTomorrow(upcomingAppointments[0].date) ? 'Tomorrow' :
                     formatDate(upcomingAppointments[0].date).date.split(',')[0]}
                  </div>
                  <p className="text-xs text-gray-500">
                    {formatDate(upcomingAppointments[0].date).time}
                  </p>
                </>
              ) : (
                <>
                  <div className="text-lg font-bold text-gray-400">None scheduled</div>
                  <p className="text-xs text-gray-500">Contact your therapist</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>Your scheduled therapy sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading appointments...</p>
              </div>
            ) : upcomingAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No upcoming appointments</p>
                <p className="text-sm mt-2">Contact your therapist to schedule your next session</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => {
                  const { date, time } = formatDate(appointment.date);
                  return (
                    <div
                      key={appointment._id}
                      className={`p-4 rounded-lg border-2 ${
                        isToday(appointment.date) 
                          ? 'border-blue-300 bg-blue-50 ring-2 ring-blue-200' 
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="h-6 w-6 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                              <h3 className="font-semibold text-gray-900 truncate">{appointment.type}</h3>
                              <div className="flex gap-2">
                                {isToday(appointment.date) && (
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    Today
                                  </span>
                                )}
                                {isTomorrow(appointment.date) && (
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                    Tomorrow
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="space-y-1 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 flex-shrink-0" />
                                <span>{date}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 flex-shrink-0" />
                                <span>{time}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 flex-shrink-0" />
                                <span className="truncate">with {appointment.clinicianId.name}</span>
                              </div>
                            </div>
                            {appointment.notes && (
                              <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
                                <strong>Notes:</strong> {appointment.notes}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                          {isToday(appointment.date) && (
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Phone className="h-4 w-4 mr-1" />
                                Join Call
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Past Appointments */}
        {pastAppointments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Past Appointments</CardTitle>
              <CardDescription>Your completed therapy sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pastAppointments.slice(0, 5).map((appointment) => {
                  const { date, time } = formatDate(appointment.date);
                  return (
                    <div
                      key={appointment._id}
                      className="p-3 bg-gray-50 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{appointment.type}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span>{date}</span>
                            <span>{time}</span>
                            <span>with {appointment.clinicianId.name}</span>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {pastAppointments.length > 5 && (
                  <div className="text-center pt-2">
                    <Button variant="ghost" size="sm">
                      View all past appointments ({pastAppointments.length - 5} more)
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}