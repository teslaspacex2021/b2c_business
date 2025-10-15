'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MessageCircle,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  
  RefreshCw,
  Settings,
  
  MessageSquare,
  UserCheck,
  
} from 'lucide-react';
import SupportAnalytics from '@/components/admin/SupportAnalytics';
import SupportChatInterface from '@/components/admin/SupportChatInterface';

interface SupportSession {
  id: string;
  sessionId: string;
  status: 'WAITING' | 'ACTIVE' | 'TRANSFERRED' | 'CLOSED' | 'ABANDONED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  subject?: string;
  visitorName?: string;
  visitorEmail?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  customer?: {
    id: string;
    name: string;
    email: string;
    company?: string;
  };
  assignedUser?: {
    id: string;
    name: string;
    email: string;
  };
  startedAt: string;
  lastActivity: string;
  messages: Array<{
    id: string;
    content: string;
    senderType: 'USER' | 'AGENT' | 'SYSTEM';
    createdAt: string;
  }>;
  _count: {
    messages: number;
  };
}

interface SupportStats {
  totalSessions: number;
  activeSessions: number;
  waitingSessions: number;
  closedSessions: number;
  averageResponseTime: number;
  averageResolutionTime: number;
}

const statusConfig = {
  WAITING: { label: 'Waiting', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  ACTIVE: { label: 'Active', color: 'bg-green-100 text-green-800', icon: MessageCircle },
  TRANSFERRED: { label: 'Transferred', color: 'bg-blue-100 text-blue-800', icon: Users },
  CLOSED: { label: 'Closed', color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
  ABANDONED: { label: 'Abandoned', color: 'bg-red-100 text-red-800', icon: AlertCircle },
};

const priorityConfig = {
  LOW: { label: 'Low', color: 'bg-gray-100 text-gray-800' },
  NORMAL: { label: 'Normal', color: 'bg-blue-100 text-blue-800' },
  HIGH: { label: 'High', color: 'bg-orange-100 text-orange-800' },
  URGENT: { label: 'Urgent', color: 'bg-red-100 text-red-800' },
};

export default function SupportManagementPage() {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id || session?.user?.email || '';
  const [sessions, setSessions] = useState<SupportSession[]>([]);
  const [stats, setStats] = useState<SupportStats>({
    totalSessions: 0,
    activeSessions: 0,
    waitingSessions: 0,
    closedSessions: 0,
    averageResponseTime: 0,
    averageResolutionTime: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<SupportSession | null>(null);
  const [chatSession, setChatSession] = useState<SupportSession | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  useEffect(() => {
    loadSessions();
  }, [statusFilter, priorityFilter]);

  useEffect(() => {
    loadStats();
  }, [sessions]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      
      const response = await fetch(`/api/support/sessions?${params.toString()}`);
      if (response.ok) {
        const result = await response.json();
        setSessions(result.data);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Calculate stats from sessions data
      const totalSessions = sessions.length;
      const activeSessions = sessions.filter(s => s.status === 'ACTIVE').length;
      const waitingSessions = sessions.filter(s => s.status === 'WAITING').length;
      const closedSessions = sessions.filter(s => s.status === 'CLOSED').length;
      
      setStats({
        totalSessions,
        activeSessions,
        waitingSessions,
        closedSessions,
        averageResponseTime: 0, // Will be calculated when analytics API is implemented
        averageResolutionTime: 0, // Will be calculated when analytics API is implemented
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleAssignSession = async (sessionId: string, userId: string) => {
    try {
      const response = await fetch(`/api/support/sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignedTo: userId,
          status: 'ACTIVE'
        }),
      });

      if (response.ok) {
        loadSessions();
      }
    } catch (error) {
      console.error('Error assigning session:', error);
    }
  };

  const handleCloseSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/support/sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'CLOSED'
        }),
      });

      if (response.ok) {
        loadSessions();
        setSelectedSession(null);
      }
    } catch (error) {
      console.error('Error closing session:', error);
    }
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = searchTerm === '' || 
      session.visitorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.visitorEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.sessionId.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Support Management</h1>
          <p className="text-gray-600">Manage customer support sessions and conversations</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadSessions}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <MessageCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeSessions}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Waiting</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.waitingSessions}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.closedSessions}</div>
            <p className="text-xs text-muted-foreground">Resolved sessions</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sessions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search sessions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="WAITING">Waiting</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="TRANSFERRED">Transferred</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                    <SelectItem value="ABANDONED">Abandoned</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="NORMAL">Normal</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Sessions List */}
          <Card>
            <CardHeader>
              <CardTitle>Support Sessions</CardTitle>
              <CardDescription>
                {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                </div>
              ) : filteredSessions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No sessions found
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredSessions.map((session) => {
                    const statusInfo = statusConfig[session.status];
                    const priorityInfo = priorityConfig[session.priority];
                    const StatusIcon = statusInfo.icon;
                    
                    return (
                      <div
                        key={session.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedSession(session)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <Badge className={statusInfo.color}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {statusInfo.label}
                              </Badge>
                              <Badge className={priorityInfo.color}>
                                {priorityInfo.label}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                #{session.sessionId.slice(-8)}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm">
                              <div>
                                <span className="font-medium">
                                  {session.visitorName || session.user?.name || session.customer?.name || 'Anonymous'}
                                </span>
                                {session.customer?.company && (
                                  <span className="text-gray-500 ml-2">({session.customer.company})</span>
                                )}
                              </div>
                              
                              {session.assignedUser && (
                                <div className="flex items-center space-x-1">
                                  <UserCheck className="w-4 h-4 text-green-600" />
                                  <span>{session.assignedUser.name}</span>
                                </div>
                              )}
                            </div>
                            
                            {session.subject && (
                              <p className="text-sm text-gray-600 mt-1">{session.subject}</p>
                            )}
                            
                            <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                              <span>Started: {getTimeAgo(session.startedAt)}</span>
                              <span>Last activity: {getTimeAgo(session.lastActivity)}</span>
                              <span>{session._count.messages} messages</span>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                setChatSession(session);
                              }}
                            >
                              <MessageCircle className="w-4 h-4 mr-1" />
                              Chat
                            </Button>
                            
                            {session.status === 'WAITING' && (
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAssignSession(session.id, currentUserId);
                                }}
                              >
                                Take Session
                              </Button>
                            )}
                            
                            {(session.status === 'ACTIVE' || session.status === 'WAITING') && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCloseSession(session.id);
                                }}
                              >
                                Close
                              </Button>
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
        </TabsContent>

        <TabsContent value="analytics">
          <SupportAnalytics />
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Support Settings</CardTitle>
              <CardDescription>Configure support system settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Settings panel coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Session Detail Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Session #{selectedSession.sessionId.slice(-8)}
                </CardTitle>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedSession(null)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="overflow-y-auto">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Session Info</h4>
                    <div className="space-y-1 text-sm">
                      <div>Status: <Badge className={statusConfig[selectedSession.status].color}>
                        {statusConfig[selectedSession.status].label}
                      </Badge></div>
                      <div>Priority: <Badge className={priorityConfig[selectedSession.priority].color}>
                        {priorityConfig[selectedSession.priority].label}
                      </Badge></div>
                      <div>Started: {formatTime(selectedSession.startedAt)}</div>
                      <div>Last Activity: {formatTime(selectedSession.lastActivity)}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Customer Info</h4>
                    <div className="space-y-1 text-sm">
                      <div>Name: {selectedSession.visitorName || selectedSession.user?.name || selectedSession.customer?.name || 'Anonymous'}</div>
                      <div>Email: {selectedSession.visitorEmail || selectedSession.user?.email || selectedSession.customer?.email || 'N/A'}</div>
                      {selectedSession.customer?.company && (
                        <div>Company: {selectedSession.customer.company}</div>
                      )}
                      {selectedSession.assignedUser && (
                        <div>Assigned to: {selectedSession.assignedUser.name}</div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Messages ({selectedSession._count.messages})</h4>
                  <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                    {selectedSession.messages.length === 0 ? (
                      <p className="text-gray-500 text-center">No messages yet</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedSession.messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.senderType === 'USER' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                                message.senderType === 'USER'
                                  ? 'bg-blue-500 text-white'
                                  : message.senderType === 'SYSTEM'
                                  ? 'bg-gray-100 text-gray-600'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              <div>{message.content}</div>
                              <div className="text-xs opacity-70 mt-1">
                                {new Date(message.createdAt).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chat Interface */}
      {chatSession && (
        <SupportChatInterface
          session={chatSession}
          onClose={() => setChatSession(null)}
          onSessionUpdate={() => {
            loadSessions();
            setChatSession(null);
          }}
        />
      )}
    </div>
  );
}
