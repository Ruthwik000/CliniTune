'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, RefreshCw, Bell, AlertCircle } from 'lucide-react';

export default function DebugPage() {
  const [debugData, setDebugData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const fetchDebugData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/patients/all');
      const data = await response.json();
      setDebugData(data);
    } catch (error) {
      console.error('Error fetching debug data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDemoData = async () => {
    setSeeding(true);
    try {
      const response = await fetch('/api/debug/seed', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (response.ok) {
        alert('Demo data created successfully!');
        fetchDebugData(); // Refresh the data
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error creating demo data:', error);
      alert('Failed to create demo data');
    } finally {
      setSeeding(false);
    }
  };

  const createTestNotifications = async () => {
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (response.ok) {
        alert('Test notifications created! Check the notification bell in the header.');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error creating test notifications:', error);
      alert('Failed to create test notifications');
    }
  };

  const fixAIClassifications = async () => {
    try {
      const response = await fetch('/api/ai/fix-classifications', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (response.ok) {
        alert(`Fixed ${data.updatedCount} AI chat classifications! Refresh the dashboard to see changes.`);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error fixing AI classifications:', error);
      alert('Failed to fix AI classifications');
    }
  };

  useEffect(() => {
    fetchDebugData();
  }, []);

  return (
    <DashboardLayout role="clinician">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Debug Information</h2>
            <p className="text-gray-600">Patient assignment debugging</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchDebugData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={createDemoData} disabled={seeding} variant="outline">
              <Users className={`h-4 w-4 mr-2 ${seeding ? 'animate-pulse' : ''}`} />
              {seeding ? 'Creating...' : 'Create Demo Data'}
            </Button>
            <Button onClick={createTestNotifications} variant="outline">
              <Bell className="h-4 w-4 mr-2" />
              Test Notifications
            </Button>
            <Button onClick={fixAIClassifications} variant="outline">
              <AlertCircle className="h-4 w-4 mr-2" />
              Fix AI Classifications
            </Button>
          </div>
        </div>

        {debugData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  All Patients in System
                </CardTitle>
              </CardHeader>
              <CardContent>
                {debugData.allPatients?.length > 0 ? (
                  <div className="space-y-3">
                    {debugData.allPatients.map((patient: any) => (
                      <div key={patient.id} className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium">{patient.name}</p>
                        <p className="text-sm text-gray-600">{patient.email}</p>
                        <p className="text-xs text-gray-500">ID: {patient.id}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No patients found in system</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  Assigned Patients
                </CardTitle>
              </CardHeader>
              <CardContent>
                {debugData.assignedPatients?.length > 0 ? (
                  <div className="space-y-3">
                    {debugData.assignedPatients.map((patient: any) => (
                      <div key={patient.id} className="p-3 bg-green-50 rounded-lg">
                        <p className="font-medium">{patient.name}</p>
                        <p className="text-sm text-gray-600">{patient.email}</p>
                        <p className="text-xs text-gray-500">ID: {patient.id}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No patients assigned to you</p>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Clinician Information</CardTitle>
              </CardHeader>
              <CardContent>
                {debugData.clinicianInfo ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Clinician ID</p>
                      <p className="text-gray-900">{debugData.clinicianInfo.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Name</p>
                      <p className="text-gray-900">{debugData.clinicianInfo.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Assigned Patients Count</p>
                      <p className="text-gray-900">{debugData.clinicianInfo.assignedCount}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No clinician information available</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p>1. If you see patients in "All Patients" but none in "Assigned Patients", you need to assign patients to yourself.</p>
              <p>2. Go to the Patients page and use the "Assign Patient" feature to assign patients by their email.</p>
              <p>3. If you don't see any patients at all, you may need to run the seed script to create demo data.</p>
              <p>4. Patient emails from seed data: patient@demo.com, sarah.johnson@demo.com, mike.chen@demo.com</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}