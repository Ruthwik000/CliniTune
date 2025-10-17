'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Plus, Clock, User, Search } from 'lucide-react';

interface Appointment {
  _id: string;
  patientId: {
    _id: string;
    name: string;
  };
  date: string;
  type: string;
  status: string;
  notes?: string;
}

export default function ClinicianAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    patientId: '',
    date: '',
    type: 'therapy',
    notes: ''
  });
  const [availablePatients, setAvailablePatients] = useState<any[]>([]);

  useEffect(() => {
    fetchAppointments();
    fetchAvailablePatients();
  }, []);

  const fetchAvailablePatients = async () => {
    try {
      // First try to get assigned patients
      const response = await fetch('/api/patients');
      const data = await response.json();
      
      if (response.ok && data.patients && data.patients.length > 0) {
        setAvailablePatients(data.patients);
      } else {
        // If no assigned patients, get all patients for debugging
        const allPatientsResponse = await fetch('/api/patients/all');
        const allPatientsData = await allPatientsResponse.json();
        
        if (allPatientsResponse.ok) {
          console.log('Debug - All patients:', allPatientsData.allPatients);
          console.log('Debug - Assigned patients:', allPatientsData.assignedPatients);
          console.log('Debug - Clinician info:', allPatientsData.clinicianInfo);
          
          // Use all patients if no assigned patients
          setAvailablePatients(allPatientsData.allPatients || []);
        }
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

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

  const createAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAppointment),
      });

      if (response.ok) {
        setShowCreateForm(false);
        setNewAppointment({
          patientId: '',
          date: '',
          type: 'therapy',
          notes: ''
        });
        fetchAppointments();
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
  };

  const filteredAppointments = appointments.filter(appointment =>
    appointment.patientId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const upcomingAppointments = filteredAppointments.filter(apt => 
    new Date(apt.date) >= new Date() && apt.status === 'upcoming'
  );

  const pastAppointments = filteredAppointments.filter(apt => 
    new Date(apt.date) < new Date() || apt.status === 'completed'
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout role="clinician">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Appointments</h2>
            <p className="text-gray-600">Manage your appointment schedule</p>
          </div>
          <Button onClick={() => setShowCreateForm(true)} className="sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Schedule Appointment</span>
            <span className="sm:hidden">Schedule</span>
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search appointments by patient name or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Create Appointment Form */}
        {showCreateForm && (
          <Card>
            <CardHeader>
              <CardTitle>Schedule New Appointment</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={createAppointment} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Patient
                    </label>
                    <select
                      value={newAppointment.patientId}
                      onChange={(e) => setNewAppointment({...newAppointment, patientId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Choose a patient...</option>
                      {availablePatients.map((patient) => (
                        <option key={patient.id} value={patient.id}>
                          {patient.name} ({patient.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date & Time
                    </label>
                    <Input
                      type="datetime-local"
                      value={newAppointment.date}
                      onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={newAppointment.type}
                      onChange={(e) => setNewAppointment({...newAppointment, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="therapy">Therapy Session</option>
                      <option value="consultation">Consultation</option>
                      <option value="follow-up">Follow-up</option>
                      <option value="assessment">Assessment</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <Input
                      type="text"
                      value={newAppointment.notes}
                      onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
                      placeholder="Optional notes"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button type="submit" className="sm:w-auto">Schedule Appointment</Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)} className="sm:w-auto">
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Upcoming Appointments
            </CardTitle>
            <CardDescription>
              {upcomingAppointments.length} upcoming appointments
            </CardDescription>
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
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment._id}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {appointment.patientId.name}
                          </h3>
                          <p className="text-sm text-gray-600 capitalize">
                            {appointment.type.replace('-', ' ')}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                        <div className="grid grid-cols-2 sm:flex sm:space-x-6 gap-4 sm:gap-0">
                          <div className="text-center">
                            <p className="text-xs sm:text-sm font-medium text-gray-900">Date</p>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {new Date(appointment.date).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="text-center">
                            <p className="text-xs sm:text-sm font-medium text-gray-900">Time</p>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {new Date(appointment.date).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>

                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)} self-start sm:self-center`}>
                          <Clock className="h-3 w-3 mr-1" />
                          {appointment.status}
                        </span>
                      </div>
                    </div>

                    {appointment.notes && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-sm text-gray-600">
                          <strong>Notes:</strong> {appointment.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Past Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Past Appointments</CardTitle>
            <CardDescription>
              {pastAppointments.length} completed appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pastAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No past appointments</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pastAppointments.slice(0, 5).map((appointment) => (
                  <div
                    key={appointment._id}
                    className="p-4 border border-gray-200 rounded-lg opacity-75"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {appointment.patientId.name}
                          </h3>
                          <p className="text-sm text-gray-600 capitalize">
                            {appointment.type.replace('-', ' ')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-900">Date</p>
                          <p className="text-sm text-gray-600">
                            {new Date(appointment.date).toLocaleDateString()}
                          </p>
                        </div>

                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
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