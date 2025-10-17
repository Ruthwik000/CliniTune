'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckSquare, Clock, Calendar, AlertCircle } from 'lucide-react';

interface Task {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  clinicianId: {
    name: string;
  };
}

export default function PatientTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

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

  const completeTask = async (taskId: string) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId,
          completed: true,
        }),
      });

      if (response.ok) {
        setTasks(prev => prev.map(task => 
          task._id === taskId ? { ...task, completed: true } : task
        ));
      }
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const pendingTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  return (
    <DashboardLayout role="patient">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Tasks</h2>
          <p className="text-gray-600">Complete your assigned therapeutic activities</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{pendingTasks.length}</div>
              <p className="text-xs text-muted-foreground">
                Tasks to complete
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckSquare className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedTasks.length}</div>
              <p className="text-xs text-muted-foreground">
                Tasks finished
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <Calendar className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((completedTasks.length / tasks.length) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Overall progress
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Tasks</CardTitle>
            <CardDescription>Tasks that need your attention</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading tasks...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No pending tasks. Great work!</p>
                  </div>
                ) : (
                  pendingTasks.map((task) => (
                    <div
                      key={task._id}
                      className={`p-4 rounded-lg border-2 ${
                        isOverdue(task.dueDate) 
                          ? 'border-red-200 bg-red-50 ring-2 ring-red-300' 
                          : 'border-blue-200 bg-blue-50'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-blue-500 flex-shrink-0" />
                              <h3 className="font-semibold text-gray-900 truncate">{task.title}</h3>
                            </div>
                            {isOverdue(task.dueDate) && (
                              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded self-start">
                                Overdue
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-gray-500">
                            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                            <span className="truncate">Assigned by: {task.clinicianId?.name}</span>
                            <span>
                              {getDaysUntilDue(task.dueDate) >= 0 
                                ? `${getDaysUntilDue(task.dueDate)} days left`
                                : `${Math.abs(getDaysUntilDue(task.dueDate))} days overdue`
                              }
                            </span>
                          </div>
                        </div>
                        <Button
                          onClick={() => completeTask(task._id)}
                          size="sm"
                          className="sm:ml-4 sm:flex-shrink-0"
                        >
                          <span className="hidden sm:inline">Mark Complete</span>
                          <span className="sm:hidden">Complete</span>
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Completed Tasks</CardTitle>
              <CardDescription>Tasks you've successfully finished</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {completedTasks.map((task) => (
                  <div
                    key={task._id}
                    className="p-3 bg-green-50 border border-green-200 rounded-lg opacity-75"
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-gray-900 line-through truncate">{task.title}</h3>
                        <p className="text-sm text-gray-600">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          Assigned by: {task.clinicianId?.name}
                        </p>
                      </div>
                      <CheckSquare className="h-5 w-5 text-green-600 flex-shrink-0 ml-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}