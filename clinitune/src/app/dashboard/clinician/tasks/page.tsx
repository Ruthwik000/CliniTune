'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckSquare, Plus, Clock, User, Search, Calendar } from 'lucide-react';

interface Task {
  _id: string;
  title: string;
  description: string;
  patientId: {
    _id: string;
    name: string;
  };
  dueDate: string;
  completed: boolean;
  createdAt: string;
}

export default function ClinicianTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    patientId: '',
    dueDate: ''
  });
  const [availablePatients, setAvailablePatients] = useState<any[]>([]);

  useEffect(() => {
    fetchTasks();
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
          
          // Use all patients if no assigned patients
          setAvailablePatients(allPatientsData.allPatients || []);
        }
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();

      if (response.ok) {
        setTasks(data.tasks || []);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      });

      if (response.ok) {
        setShowCreateForm(false);
        setNewTask({
          title: '',
          description: '',
          patientId: '',
          dueDate: ''
        });
        fetchTasks();
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.patientId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingTasks = filteredTasks.filter(task => !task.completed);
  const completedTasks = filteredTasks.filter(task => task.completed);

  const getTaskPriority = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { label: 'Overdue', color: 'bg-red-100 text-red-800' };
    if (diffDays <= 1) return { label: 'Due Soon', color: 'bg-yellow-100 text-yellow-800' };
    if (diffDays <= 7) return { label: 'This Week', color: 'bg-blue-100 text-blue-800' };
    return { label: 'Upcoming', color: 'bg-gray-100 text-gray-800' };
  };

  return (
    <DashboardLayout role="clinician">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Task Management</h2>
            <p className="text-gray-600">Assign and track patient tasks</p>
          </div>
          <Button onClick={() => setShowCreateForm(true)} className="sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tasks by title, patient, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Task Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <CheckSquare className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tasks.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingTasks.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckSquare className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedTasks.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <CheckSquare className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create Task Form */}
        {showCreateForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Task</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={createTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Title
                  </label>
                  <Input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    placeholder="Enter task title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    placeholder="Enter task description"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Patient
                    </label>
                    <select
                      value={newTask.patientId}
                      onChange={(e) => setNewTask({...newTask, patientId: e.target.value})}
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
                      Due Date
                    </label>
                    <Input
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button type="submit" className="sm:w-auto">Create Task</Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)} className="sm:w-auto">
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Pending Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Pending Tasks
            </CardTitle>
            <CardDescription>
              {pendingTasks.length} tasks awaiting completion
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading tasks...</p>
              </div>
            ) : pendingTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No pending tasks</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingTasks.map((task) => {
                  const priority = getTaskPriority(task.dueDate);
                  return (
                    <div
                      key={task._id}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{task.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                            <p className="text-sm text-gray-500">
                              Assigned to: <strong>{task.patientId.name}</strong>
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end space-y-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priority.color}`}>
                            <Calendar className="h-3 w-3 mr-1" />
                            {priority.label}
                          </span>
                          <p className="text-sm text-gray-600">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Completed Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckSquare className="h-5 w-5 mr-2 text-green-600" />
              Completed Tasks
            </CardTitle>
            <CardDescription>
              {completedTasks.length} tasks completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            {completedTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No completed tasks yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {completedTasks.slice(0, 5).map((task) => (
                  <div
                    key={task._id}
                    className="p-4 border border-gray-200 rounded-lg opacity-75"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckSquare className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 line-through">{task.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                          <p className="text-sm text-gray-500">
                            Completed by: <strong>{task.patientId.name}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end space-y-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckSquare className="h-3 w-3 mr-1" />
                          Completed
                        </span>
                        <p className="text-sm text-gray-600">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </p>
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