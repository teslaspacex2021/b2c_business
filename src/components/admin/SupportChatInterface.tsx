'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  Send,
  Phone,
  Mail,
  Building,
  Clock,
  MessageCircle,
  User,
  X,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  senderType: 'USER' | 'AGENT' | 'SYSTEM';
  createdAt: string;
}

interface SupportSession {
  id: string;
  sessionId: string;
  status: 'WAITING' | 'ACTIVE' | 'TRANSFERRED' | 'CLOSED' | 'ABANDONED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  subject?: string;
  visitorName?: string;
  visitorEmail?: string;
  visitorPhone?: string;
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
  messages: Message[];
  _count: {
    messages: number;
  };
}

interface SupportChatInterfaceProps {
  session: SupportSession;
  onClose: () => void;
  onSessionUpdate: () => void;
}

const statusConfig = {
  WAITING: { label: 'Waiting', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  ACTIVE: { label: 'Active', color: 'bg-green-100 text-green-800', icon: MessageCircle },
  TRANSFERRED: { label: 'Transferred', color: 'bg-blue-100 text-blue-800', icon: User },
  CLOSED: { label: 'Closed', color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
  ABANDONED: { label: 'Abandoned', color: 'bg-red-100 text-red-800', icon: AlertCircle },
};

const priorityConfig = {
  LOW: { label: 'Low', color: 'bg-gray-100 text-gray-800' },
  NORMAL: { label: 'Normal', color: 'bg-blue-100 text-blue-800' },
  HIGH: { label: 'High', color: 'bg-orange-100 text-orange-800' },
  URGENT: { label: 'Urgent', color: 'bg-red-100 text-red-800' },
};

export default function SupportChatInterface({ 
  session: initialSession, 
  onClose, 
  onSessionUpdate 
}: SupportChatInterfaceProps) {
  const { data: authSession } = useSession();
  const [session, setSession] = useState<SupportSession>(initialSession);
  const [messages, setMessages] = useState<Message[]>(initialSession.messages || []);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load messages when component mounts
    loadMessages();
    
    // Set up polling for new messages
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [session.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      const response = await fetch(`/api/support/messages?sessionId=${session.id}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setMessages(result.data);
        }
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const response = await fetch('/api/support/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: session.id,
          content: newMessage.trim(),
          messageType: 'TEXT',
          senderType: 'AGENT',
          status: 'SENT'
        }),
      });

      if (response.ok) {
        setNewMessage('');
        await loadMessages();
        
        // Update session status to ACTIVE if it was WAITING
        if (session.status === 'WAITING') {
          await updateSessionStatus('ACTIVE');
        }
        
        toast.success('Message sent successfully');
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const updateSessionStatus = async (status: string) => {
    try {
      const response = await fetch(`/api/support/sessions/${session.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setSession(prev => ({ ...prev, status: status as any }));
        onSessionUpdate();
      }
    } catch (error) {
      console.error('Failed to update session status:', error);
    }
  };

  const assignToMe = async () => {
    if (!authSession?.user?.id) return;
    
    try {
      const response = await fetch(`/api/support/sessions/${session.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          assignedTo: authSession.user.id,
          status: 'ACTIVE'
        }),
      });

      if (response.ok) {
        setSession(prev => ({ 
          ...prev, 
          status: 'ACTIVE',
          assignedUser: {
            id: authSession.user.id!,
            name: authSession.user.name || 'Agent',
            email: authSession.user.email || ''
          }
        }));
        onSessionUpdate();
        toast.success('Session assigned to you');
      }
    } catch (error) {
      console.error('Failed to assign session:', error);
      toast.error('Failed to assign session');
    }
  };

  const closeSession = async () => {
    try {
      await updateSessionStatus('CLOSED');
      toast.success('Session closed');
      onClose();
    } catch (error) {
      console.error('Failed to close session:', error);
      toast.error('Failed to close session');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getCustomerName = () => {
    return session.visitorName || 
           session.user?.name || 
           session.customer?.name || 
           'Anonymous User';
  };

  const getCustomerEmail = () => {
    return session.visitorEmail || 
           session.user?.email || 
           session.customer?.email || 
           'No email provided';
  };

  const statusInfo = statusConfig[session.status];
  const priorityInfo = priorityConfig[session.priority];
  const StatusIcon = statusInfo.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-6xl h-[90vh] flex flex-col">
        <CardHeader className="flex-shrink-0 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5" />
                  <span>Chat - Session #{session.sessionId.slice(-8)}</span>
                </CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={statusInfo.color}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusInfo.label}
                  </Badge>
                  <Badge className={priorityInfo.color}>
                    {priorityInfo.label}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {session.status === 'WAITING' && (
                <Button size="sm" onClick={assignToMe}>
                  Take Session
                </Button>
              )}
              {(session.status === 'ACTIVE' || session.status === 'WAITING') && (
                <Button variant="outline" size="sm" onClick={closeSession}>
                  Close Session
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderType === 'USER' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-2 max-w-[80%] ${
                      message.senderType === 'USER' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}>
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">
                          {message.senderType === 'USER' ? 'U' : 
                           message.senderType === 'AGENT' ? 'A' : 'S'}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`p-3 rounded-lg text-sm ${
                          message.senderType === 'USER'
                            ? 'bg-blue-600 text-white'
                            : message.senderType === 'SYSTEM'
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        <div className="text-xs opacity-70 mt-1">
                          {formatTime(message.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t p-4">
              <div className="flex space-x-2">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 min-h-[60px] max-h-[120px] resize-none"
                  disabled={session.status === 'CLOSED' || isSending}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || session.status === 'CLOSED' || isSending}
                  className="px-4"
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {session.status === 'CLOSED' && (
                <p className="text-sm text-gray-500 mt-2">
                  This session is closed. No new messages can be sent.
                </p>
              )}
            </div>
          </div>

          {/* Customer Info Sidebar */}
          <div className="w-80 border-l bg-gray-50 p-4 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Customer Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="font-medium">{getCustomerName()}</p>
                      <p className="text-sm text-gray-500">Customer</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm">{getCustomerEmail()}</p>
                    </div>
                  </div>

                  {session.visitorPhone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm">{session.visitorPhone}</p>
                      </div>
                    </div>
                  )}

                  {session.customer?.company && (
                    <div className="flex items-center space-x-2">
                      <Building className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm">{session.customer.company}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Session Details</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Started:</span>
                    <p>{new Date(session.startedAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Last Activity:</span>
                    <p>{new Date(session.lastActivity).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Messages:</span>
                    <p>{messages.length}</p>
                  </div>
                  {session.assignedUser && (
                    <div>
                      <span className="text-gray-500">Assigned to:</span>
                      <p>{session.assignedUser.name}</p>
                    </div>
                  )}
                  {session.subject && (
                    <div>
                      <span className="text-gray-500">Subject:</span>
                      <p>{session.subject}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
