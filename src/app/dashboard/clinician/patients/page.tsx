'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, User, AlertCircle, Calendar } from 'lucide-react';
import Link from 'next/link';

interface Patient {
  id: string;
  name: string;
  email: string;
  lastSession: string | null;
  nextSession: string | null;
  status: 'active' | 'inactive' | 'alert';
  aiAlerts: number;
  completionRate: number;
}

export default function ClinicianPatientsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assignEmail, setAssignEmail] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/patients');
      const data = await response.json();

      if (response.ok) {
        setPatients(data.patients || []);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshAlerts = async () => {
    try {
      // First refresh the AI classifications
      const refreshResponse = await fetch('/api/dashboard/refresh-stats', {
        method: 'POST',
      });
      
      if (refreshResponse.ok) {
        // Then fetch updated patient data
        await fetchPatients();
      }
    } catch (error) {
      console.error('Error refreshing alerts:', error);
    }
  };

  const assignPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/patients/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ patientEmail: assignEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowAssignForm(false);
        setAssignEmail('');
        fetchPatients(); // Refresh the list
        alert('Patient assigned successfully!');
      } else {
        alert(data.error || 'Failed to assign patient');
      }
    } catch (error) {
      console.error('Error assigning patient:', error);
      alert('Failed to assign patient');
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'alert': return 'bg-red-100 text-red-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'alert': return <AlertCircle className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  return (
    <DashboardLayout role="clinician">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Patient Management</h2>
            <p className="text-gray-600">Monitor and manage your patient caseload</p>
          </div>
          <Button onClick={() => setShowAssignForm(true)} className="sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Assign Patient
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search patients by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assign Patient Form */}
        {showAssignForm && (
          <Card>
            <CardHeader>
              <CardTitle>Assign New Patient</CardTitle>
              <CardDescription>Enter the patient's email address to assign them to your care</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={assignPatient} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient Email
                  </label>
                  <Input
                    type="email"
                    value={assignEmail}
                    onChange={(e) => setAssignEmail(e.target.value)}
                    placeholder="Enter patient's email address"
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit">Assign Patient</Button>
                  <Button type="button" variant="outline" onClick={() => setShowAssignForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Patient Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <User className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patients.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
              <User className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {patients.filter(p => p.status === 'active').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alerts</CardTitle>
              <div className="flex items-center gap-2">
                <button
                  onClick={refreshAlerts}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  title="Refresh Alerts"
                >
                  <svg className="h-3 w-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {patients.filter(p => p.status === 'alert').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Completion</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {patients.length > 0 ? Math.round(patients.reduce((acc, p) => acc + p.completionRate, 0) / patients.length) : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patient List */}
        <Card>
          <CardHeader>
            <CardTitle>Patient List</CardTitle>
            <CardDescription>
              {filteredPatients.length} of {patients.length} patients
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading patients...</p>
              </div>
            ) : patients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No patients assigned yet.</p>
                <p className="text-sm mt-2">Patients will appear here when they are assigned to you.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 truncate">{patient.name}</h3>
                          <p className="text-sm text-gray-600 truncate">{patient.email}</p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6">
                        <div className="grid grid-cols-2 sm:flex sm:space-x-6 gap-4 sm:gap-0">
                          <div className="text-center">
                            <p className="text-xs sm:text-sm font-medium text-gray-900">Last Session</p>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {patient.lastSession
                                ? new Date(patient.lastSession).toLocaleDateString()
                                : 'No sessions yet'
                              }
                            </p>
                          </div>

                          <div className="text-center">
                            <p className="text-xs sm:text-sm font-medium text-gray-900">Next Session</p>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {patient.nextSession
                                ? new Date(patient.nextSession).toLocaleDateString()
                                : 'Not scheduled'
                              }
                            </p>
                          </div>

                          <div className="text-center">
                            <p className="text-xs sm:text-sm font-medium text-gray-900">Completion</p>
                            <p className="text-xs sm:text-sm text-gray-600">{patient.completionRate}%</p>
                          </div>

                          {patient.aiAlerts > 0 && (
                            <div className="text-center">
                              <p className="text-xs sm:text-sm font-medium text-red-600">AI Alerts</p>
                              <p className="text-xs sm:text-sm text-red-600">{patient.aiAlerts}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between sm:justify-end space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                            {getStatusIcon(patient.status)}
                            <span className="ml-1 capitalize">{patient.status}</span>
                          </span>

                          <div className="flex space-x-2">
                            <Link href={`/dashboard/clinician/patients/${patient.id}`}>
                              <Button size="sm" variant="outline" className="text-xs">
                                <span className="hidden sm:inline">View Profile</span>
                                <span className="sm:hidden">View</span>
                              </Button>
                            </Link>
                          </div>
                        </div>
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