'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  MessageCircle,
  X,
  Send,
  Phone,
  Mail,
  Clock,
  User,
  Minimize2,
  Maximize2,
  Users,
  Loader2,
  Paperclip,
  Image as ImageIcon,
  File,
  Star,
  CheckCircle,
  AlertCircle,
  Settings,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Copy,
  Download,
  RefreshCw,
  UserCheck,
  Timer,
  Bell,
  BellOff,
  Headphones,
  MessageSquare,
  Archive,
  MoreHorizontal,
  Search,
  Filter,
  Zap,
  Bot,
  ExternalLink
} from 'lucide-react';

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
    avatar?: string;
    isOnline?: boolean;
  };
  queuePosition?: number;
  estimatedWaitTime?: number;
  startedAt: Date;
  lastActivity: Date;
  messageCount: number;
  unreadCount: number;
  metadata?: {
    userAgent?: string;
    location?: string;
    currentPage?: string;
  };
}

interface Message {
  id: string;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  senderType: 'USER' | 'AGENT' | 'SYSTEM';
  senderName?: string;
  timestamp: Date;
  attachments?: Array<{
    type: string;
    url: string;
    name: string;
    size?: number;
  }>;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

interface QuickReply {
  id: string;
  title: string;
  content: string;
  category?: string;
}

interface AdminSupportWidgetProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  currentUserId?: string;
  currentUserName?: string;
  currentUserAvatar?: string;
}

export default function AdminSupportWidget({
  position = 'bottom-right',
  currentUserId = 'admin-user',
  currentUserName = 'Admin User',
  currentUserAvatar
}: AdminSupportWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentView, setCurrentView] = useState<'sessions' | 'chat' | 'settings'>('sessions');
  const [sessions, setSessions] = useState<SupportSession[]>([]);
  const [activeSession, setActiveSession] = useState<SupportSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoAssign, setAutoAssign] = useState(true);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [totalUnread, setTotalUnread] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const audioRef = useRef<HTMLAudioElement>();

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4'
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 初始化音频
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/sounds/notification.mp3');
      audioRef.current.volume = 0.5;
    }
  }, []);

  // 播放通知音
  const playNotificationSound = () => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.play().catch(() => {
        // 忽略自动播放被阻止的错误
      });
    }
  };

  // 加载会话列表
  const loadSessions = useCallback(async () => {
    try {
      const response = await fetch('/api/support/sessions?adminView=true');
      if (response.ok) {
        const result = await response.json();
        const sessionData = result.data.map((session: any) => ({
          ...session,
          startedAt: new Date(session.startedAt),
          lastActivity: new Date(session.lastActivity)
        }));
        setSessions(sessionData);
        
        // 计算未读消息总数
        const unreadTotal = sessionData.reduce((total: number, session: SupportSession) => 
          total + (session.unreadCount || 0), 0);
        setTotalUnread(unreadTotal);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  }, []);

  // 加载快捷回复
  const loadQuickReplies = useCallback(async () => {
    try {
      const response = await fetch('/api/support/quick-replies');
      if (response.ok) {
        const result = await response.json();
        setQuickReplies(result.data || []);
      }
    } catch (error) {
      console.error('Error loading quick replies:', error);
    }
  }, []);

  // 组件挂载时加载数据
  useEffect(() => {
    loadSessions();
    loadQuickReplies();
    
    // 定期刷新会话列表
    const interval = setInterval(loadSessions, 30000); // 30秒刷新一次
    return () => clearInterval(interval);
  }, [loadSessions, loadQuickReplies]);

  // 加载消息
  const loadMessages = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/support/messages?sessionId=${sessionId}`);
      if (response.ok) {
        const result = await response.json();
        setMessages(result.data.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.createdAt)
        })));
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  // 选择会话
  const selectSession = async (session: SupportSession) => {
    setActiveSession(session);
    setCurrentView('chat');
    await loadMessages(session.id);
    
    // 标记消息为已读
    if (session.unreadCount > 0) {
      try {
        await fetch(`/api/support/sessions/${session.id}/read`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        loadSessions(); // 刷新会话列表
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    }
  };

  // 发送消息
  const handleSendMessage = async (messageContent?: string) => {
    const content = messageContent || newMessage.trim();
    if (!content || !activeSession) return;

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      content,
      messageType: 'TEXT',
      senderType: 'AGENT',
      senderName: currentUserName,
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
    setShowQuickReplies(false);

    try {
      const response = await fetch('/api/support/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: activeSession.id,
          content,
          messageType: 'TEXT',
          senderType: 'AGENT',
          senderId: currentUserId,
          senderName: currentUserName
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setMessages(prev => prev.map(msg => 
          msg.id === tempMessage.id ? {
            ...result.data,
            timestamp: new Date(result.data.createdAt)
          } : msg
        ));
        
        // 刷新会话列表
        loadSessions();
      } else {
        setMessages(prev => prev.map(msg => 
          msg.id === tempMessage.id ? { ...msg, status: 'failed' } : msg
        ));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === tempMessage.id ? { ...msg, status: 'failed' } : msg
      ));
    }
  };

  // 接管会话
  const takeSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/support/sessions/${sessionId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignedTo: currentUserId
        }),
      });

      if (response.ok) {
        loadSessions();
        // 如果是当前活动会话，重新加载
        if (activeSession?.id === sessionId) {
          const updatedSession = sessions.find(s => s.id === sessionId);
          if (updatedSession) {
            setActiveSession({
              ...updatedSession,
              assignedUser: {
                id: currentUserId,
                name: currentUserName,
                isOnline: true
              }
            });
          }
        }
      }
    } catch (error) {
      console.error('Error taking session:', error);
    }
  };

  // 关闭会话
  const closeSession = async (sessionId: string) => {
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
        if (activeSession?.id === sessionId) {
          setActiveSession(null);
          setCurrentView('sessions');
        }
      }
    } catch (error) {
      console.error('Error closing session:', error);
    }
  };

  // 过滤会话
  const filteredSessions = sessions.filter(session => {
    const matchesSearch = !searchTerm || 
      session.visitorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.visitorEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || session.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  // 获取优先级颜色
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'NORMAL': return 'bg-blue-500';
      case 'LOW': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'WAITING': return 'bg-yellow-500';
      case 'ACTIVE': return 'bg-green-500';
      case 'TRANSFERRED': return 'bg-blue-500';
      case 'CLOSED': return 'bg-gray-500';
      case 'ABANDONED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (!isOpen) {
    return (
      <div className={`fixed ${positionClasses[position]} z-50`}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setIsOpen(true)}
                className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300 relative bg-blue-600 hover:bg-blue-700"
              >
                <Headphones className="w-6 h-6" />
                {totalUnread > 0 && (
                  <Badge className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                    {totalUnread > 99 ? '99+' : totalUnread}
                  </Badge>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>客服管理 ({totalUnread} 条未读)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      <Card className={`w-96 shadow-xl transition-all duration-300 ${isMinimized ? 'h-12' : 'h-[600px]'}`}>
        {/* Header */}
        <CardHeader className="pb-2 px-4 py-3 flex flex-row items-center justify-between space-y-0 bg-blue-600 text-white">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Headphones className="w-4 h-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium">客服管理</CardTitle>
              <CardDescription className="text-xs text-white/80">
                {activeSession ? (
                  <span>{activeSession.visitorName || activeSession.visitorEmail || '访客'}</span>
                ) : (
                  <span>{sessions.length} 个会话 · {totalUnread} 条未读</span>
                )}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="text-white hover:bg-white/20 w-6 h-6 p-0"
              title={soundEnabled ? '声音开启' : '声音关闭'}
            >
              {soundEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className="text-white hover:bg-white/20 w-6 h-6 p-0"
              title={notificationsEnabled ? '通知开启' : '通知关闭'}
            >
              {notificationsEnabled ? <Bell className="w-3 h-3" /> : <BellOff className="w-3 h-3" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-white/20 w-6 h-6 p-0"
            >
              {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 w-6 h-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <>
            {/* Navigation */}
            <div className="px-4 py-2 border-b">
              <Tabs value={currentView} onValueChange={(value: any) => setCurrentView(value)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="sessions" className="text-xs">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    会话列表
                  </TabsTrigger>
                  <TabsTrigger value="chat" disabled={!activeSession} className="text-xs">
                    <MessageCircle className="w-3 h-3 mr-1" />
                    聊天
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="text-xs">
                    <Settings className="w-3 h-3 mr-1" />
                    设置
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <CardContent className="p-0 flex-1 overflow-hidden">
              {/* 会话列表视图 */}
              {currentView === 'sessions' && (
                <div className="h-[500px] flex flex-col">
                  {/* 搜索和筛选 */}
                  <div className="p-4 border-b space-y-2">
                    <div className="flex space-x-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="搜索会话..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-8 h-9"
                        />
                      </div>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-24 h-9">
                          <Filter className="w-4 h-4" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全部</SelectItem>
                          <SelectItem value="WAITING">等待中</SelectItem>
                          <SelectItem value="ACTIVE">进行中</SelectItem>
                          <SelectItem value="CLOSED">已关闭</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>{filteredSessions.length} 个会话</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={loadSessions}
                        className="h-6 px-2"
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        刷新
                      </Button>
                    </div>
                  </div>

                  {/* 会话列表 */}
                  <div className="flex-1 overflow-y-auto">
                    {filteredSessions.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                          <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">暂无会话</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1 p-2">
                        {filteredSessions.map((session) => (
                          <div
                            key={session.id}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50 ${
                              activeSession?.id === session.id ? 'bg-blue-50 border-blue-200' : ''
                            }`}
                            onClick={() => selectSession(session)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3 flex-1">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback className="text-xs">
                                    {session.visitorName?.[0] || session.visitorEmail?.[0] || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2">
                                    <h4 className="text-sm font-medium truncate">
                                      {session.visitorName || session.visitorEmail || '匿名访客'}
                                    </h4>
                                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(session.priority)}`} />
                                  </div>
                                  <p className="text-xs text-gray-600 truncate">
                                    {session.subject || '无主题'}
                                  </p>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <Badge variant="outline" className={`text-xs ${getStatusColor(session.status)} text-white border-0`}>
                                      {session.status === 'WAITING' && '等待中'}
                                      {session.status === 'ACTIVE' && '进行中'}
                                      {session.status === 'CLOSED' && '已关闭'}
                                      {session.status === 'TRANSFERRED' && '已转接'}
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                      {session.messageCount} 条消息
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end space-y-1">
                                <span className="text-xs text-gray-500">
                                  {session.lastActivity.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {session.unreadCount > 0 && (
                                  <Badge className="w-5 h-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                                    {session.unreadCount}
                                  </Badge>
                                )}
                                {session.status === 'WAITING' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      takeSession(session.id);
                                    }}
                                    className="h-6 px-2 text-xs"
                                  >
                                    接管
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 聊天视图 */}
              {currentView === 'chat' && activeSession && (
                <div className="h-[500px] flex flex-col">
                  {/* 聊天头部 */}
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentView('sessions')}
                          className="p-1"
                        >
                          ←
                        </Button>
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">
                            {activeSession.visitorName?.[0] || activeSession.visitorEmail?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="text-sm font-medium">
                            {activeSession.visitorName || activeSession.visitorEmail || '匿名访客'}
                          </h4>
                          <p className="text-xs text-gray-600">
                            {activeSession.status === 'ACTIVE' ? '在线' : '离线'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowQuickReplies(!showQuickReplies)}
                          className="p-1"
                          title="快捷回复"
                        >
                          <Zap className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => closeSession(activeSession.id)}
                          className="p-1 text-red-600"
                          title="关闭会话"
                        >
                          <Archive className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* 消息列表 */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderType === 'AGENT' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                            message.senderType === 'AGENT'
                              ? 'bg-blue-500 text-white'
                              : message.senderType === 'SYSTEM'
                              ? 'bg-gray-100 text-gray-600 text-xs'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          {message.senderType !== 'AGENT' && message.senderName && (
                            <div className="text-xs font-medium mb-1">{message.senderName}</div>
                          )}
                          <div>{message.content}</div>
                          <div className="flex items-center justify-between text-xs opacity-70 mt-1">
                            <span>
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {message.senderType === 'AGENT' && message.status && (
                              <span className="ml-2">
                                {message.status === 'sending' && <Loader2 className="w-3 h-3 animate-spin" />}
                                {message.status === 'sent' && <CheckCircle className="w-3 h-3" />}
                                {message.status === 'delivered' && <Eye className="w-3 h-3" />}
                                {message.status === 'failed' && <AlertCircle className="w-3 h-3 text-red-400" />}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* 快捷回复 */}
                  {showQuickReplies && quickReplies.length > 0 && (
                    <div className="px-4 py-2 border-t bg-gray-50">
                      <div className="text-xs text-gray-600 mb-2">快捷回复:</div>
                      <div className="grid grid-cols-2 gap-1">
                        {quickReplies.slice(0, 6).map((reply) => (
                          <Button
                            key={reply.id}
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendMessage(reply.content)}
                            className="text-xs h-8 justify-start"
                          >
                            {reply.title}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 输入区域 */}
                  <div className="p-4 border-t">
                    <div className="flex space-x-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="输入回复消息..."
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="flex-1"
                      />
                      <Button 
                        onClick={() => handleSendMessage()}
                        disabled={!newMessage.trim()}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* 设置视图 */}
              {currentView === 'settings' && (
                <div className="h-[500px] overflow-y-auto p-4">
                  <div className="space-y-6">
                    {/* 通知设置 */}
                    <div>
                      <h3 className="text-sm font-medium mb-3">通知设置</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">声音通知</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSoundEnabled(!soundEnabled)}
                          >
                            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">桌面通知</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                          >
                            {notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* 工作设置 */}
                    <div>
                      <h3 className="text-sm font-medium mb-3">工作设置</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">自动接管新会话</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAutoAssign(!autoAssign)}
                          >
                            {autoAssign ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* 当前用户信息 */}
                    <div>
                      <h3 className="text-sm font-medium mb-3">当前用户</h3>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={currentUserAvatar} />
                          <AvatarFallback>{currentUserName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">{currentUserName}</div>
                          <div className="text-xs text-gray-600">客服代表</div>
                        </div>
                      </div>
                    </div>

                    {/* 统计信息 */}
                    <div>
                      <h3 className="text-sm font-medium mb-3">今日统计</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="text-lg font-bold text-blue-600">{sessions.length}</div>
                          <div className="text-xs text-gray-600">总会话数</div>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="text-lg font-bold text-green-600">
                            {sessions.filter(s => s.status === 'CLOSED').length}
                          </div>
                          <div className="text-xs text-gray-600">已完成</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
