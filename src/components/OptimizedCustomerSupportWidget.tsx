'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import SocialMediaLinks from '@/components/SocialMediaLinks';
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
  HelpCircle,
  Loader2,
  Paperclip,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  UserCheck,
  Timer,
  Shield,
  Globe,
  Headphones
} from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  senderType: 'USER' | 'AGENT' | 'SYSTEM';
  senderName?: string;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
}

interface SupportSession {
  id: string;
  sessionId: string;
  status: 'WAITING' | 'ACTIVE' | 'TRANSFERRED' | 'CLOSED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  assignedAgent?: {
    id: string;
    name: string;
    avatar?: string;
    isOnline?: boolean;
  };
  queuePosition?: number;
  estimatedWaitTime?: number;
}

interface SupportFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
}

interface OptimizedCustomerSupportWidgetProps {
  position?: 'bottom-right' | 'bottom-left';
  primaryColor?: string;
  companyName?: string;
  supportHours?: string;
  contactEmail?: string;
  contactPhone?: string;
  language?: string;
}

const translations = {
  en: {
    support: 'Customer Support',
    startChat: 'Start Live Chat',
    loginRequired: 'Login Required',
    loginMessage: 'Please log in to access live chat support',
    contactForm: 'Contact Form',
    faq: 'FAQ',
    socialMedia: 'Social Media',
    name: 'Name',
    email: 'Email',
    subject: 'Subject',
    message: 'Message',
    priority: 'Priority',
    submit: 'Submit',
    submitting: 'Submitting...',
    sendMessage: 'Send Message',
    typeMessage: 'Type your message...',
    connecting: 'Connecting...',
    waitingForAgent: 'Waiting for an agent...',
    agentAssigned: 'Agent assigned',
    chatEnded: 'Chat ended',
    supportHours: 'Support Hours',
    contactInfo: 'Contact Information',
    alternativeContact: 'Alternative Contact Methods',
    followUs: 'Follow us on social media for updates and support',
  },
  zh: {
    support: '客户支持',
    startChat: '开始在线聊天',
    loginRequired: '需要登录',
    loginMessage: '请登录以访问在线聊天支持',
    contactForm: '联系表单',
    faq: '常见问题',
    socialMedia: '社交媒体',
    name: '姓名',
    email: '邮箱',
    subject: '主题',
    message: '消息',
    priority: '优先级',
    submit: '提交',
    submitting: '提交中...',
    sendMessage: '发送消息',
    typeMessage: '输入您的消息...',
    connecting: '连接中...',
    waitingForAgent: '等待客服代表...',
    agentAssigned: '已分配客服',
    chatEnded: '聊天结束',
    supportHours: '支持时间',
    contactInfo: '联系信息',
    alternativeContact: '其他联系方式',
    followUs: '关注我们的社交媒体获取更新和支持',
  }
};

export default function OptimizedCustomerSupportWidget({
  position = 'bottom-right',
  primaryColor = '#2563eb',
  companyName = 'B2B Business',
  supportHours = 'Mon-Fri 9AM-6PM EST',
  contactEmail = 'support@b2bbusiness.com',
  contactPhone = '+1 (555) 123-4567',
  language = 'en'
}: OptimizedCustomerSupportWidgetProps) {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentView, setCurrentView] = useState<'chat' | 'contact' | 'faq' | 'social'>('chat');
  const [session_support, setSession_support] = useState<SupportSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [agentTyping, setAgentTyping] = useState(false);
  
  const [formData, setFormData] = useState<SupportFormData>({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    subject: '',
    message: '',
    priority: 'NORMAL'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const t = translations[language as keyof typeof translations] || translations.en;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        name: session.user.name || '',
        email: session.user.email || ''
      }));
    }
  }, [session]);

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };

  const handleStartChat = async () => {
    if (!session) {
      toast.error(t.loginRequired);
      return;
    }

    setIsConnecting(true);
    try {
      // Create support session
      const response = await fetch('/api/support/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          priority: 'NORMAL'
        })
      });

      if (response.ok) {
        const sessionData = await response.json();
        setSession_support(sessionData);
        
        // Add welcome message
        const welcomeMessage: Message = {
          id: Date.now().toString(),
          content: `Hello ${session.user.name}! Welcome to ${companyName} support. An agent will be with you shortly.`,
          messageType: 'SYSTEM',
          senderType: 'SYSTEM',
          timestamp: new Date(),
          status: 'delivered'
        };
        setMessages([welcomeMessage]);
        
        toast.success('Connected to support');
      } else {
        throw new Error('Failed to start chat session');
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Failed to start chat. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !session_support) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      messageType: 'TEXT',
      senderType: 'USER',
      senderName: session?.user?.name || 'You',
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    try {
      const response = await fetch('/api/support/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session_support.sessionId,
          content: newMessage,
          messageType: 'TEXT'
        })
      });

      if (response.ok) {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === message.id 
              ? { ...msg, status: 'sent' }
              : msg
          )
        );
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === message.id 
            ? { ...msg, status: 'failed' }
            : msg
        )
      );
      toast.error('Failed to send message');
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          source: 'support_widget'
        })
      });

      if (response.ok) {
        toast.success('Your message has been sent successfully!');
        setFormData({
          name: session?.user?.name || '',
          email: session?.user?.email || '',
          subject: '',
          message: '',
          priority: 'NORMAL'
        });
      } else {
        throw new Error('Failed to submit form');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqItems = [
    {
      question: 'How can I track my order?',
      answer: 'You can track your order by logging into your account and visiting the Orders section.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, and bank transfers for B2B customers.'
    },
    {
      question: 'How long does shipping take?',
      answer: 'Standard shipping takes 5-7 business days. Express shipping is available for 2-3 days.'
    },
    {
      question: 'Do you offer bulk discounts?',
      answer: 'Yes, we offer competitive bulk pricing for large orders. Contact our sales team for a quote.'
    }
  ];

  if (!isOpen) {
    return (
      <div className={`fixed ${positionClasses[position]} z-50`}>
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          style={{ backgroundColor: primaryColor }}
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      <Card className={`w-96 shadow-2xl border-0 overflow-hidden transition-all duration-300 ${
        isMinimized ? 'h-16' : 'h-[600px]'
      }`}>
        {/* Header */}
        <CardHeader 
          className="p-4 text-white cursor-pointer"
          style={{ backgroundColor: primaryColor }}
          onClick={() => setIsMinimized(!isMinimized)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">{t.support}</CardTitle>
                <CardDescription className="text-white/80 text-sm">
                  {companyName}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 p-1"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMinimized(!isMinimized);
                }}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 p-1"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex-1 overflow-hidden">
            <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as any)} className="h-full">
              <div className="border-b">
                <TabsList className="grid w-full grid-cols-4 rounded-none h-12">
                  <TabsTrigger value="chat" className="text-xs">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Chat
                  </TabsTrigger>
                  <TabsTrigger value="contact" className="text-xs">
                    <Mail className="w-4 h-4 mr-1" />
                    Contact
                  </TabsTrigger>
                  <TabsTrigger value="faq" className="text-xs">
                    <HelpCircle className="w-4 h-4 mr-1" />
                    FAQ
                  </TabsTrigger>
                  <TabsTrigger value="social" className="text-xs">
                    <Globe className="w-4 h-4 mr-1" />
                    Social
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Chat Tab */}
              <TabsContent value="chat" className="h-[480px] flex flex-col m-0">
                {!session ? (
                  <div className="flex-1 flex items-center justify-center p-6">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <UserCheck className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-medium mb-2">{t.loginRequired}</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {t.loginMessage}
                      </p>
                      <Button asChild className="w-full">
                        <a href="/login">Login to Continue</a>
                      </Button>
                    </div>
                  </div>
                ) : !session_support ? (
                  <div className="flex-1 flex items-center justify-center p-6">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <MessageCircle className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-medium mb-2">Welcome, {session.user.name}!</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Connect with our support team for personalized assistance
                      </p>
                      <Button 
                        onClick={handleStartChat}
                        disabled={isConnecting}
                        className="w-full"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {isConnecting ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <MessageCircle className="w-4 h-4 mr-2" />
                        )}
                        {t.startChat}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderType === 'USER' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg text-sm ${
                              message.senderType === 'USER'
                                ? 'bg-blue-600 text-white'
                                : message.senderType === 'SYSTEM'
                                ? 'bg-gray-100 text-gray-700'
                                : 'bg-gray-200 text-gray-800'
                            }`}
                          >
                            <div>{message.content}</div>
                            <div className="text-xs opacity-70 mt-1">
                              {message.timestamp.toLocaleTimeString()}
                              {message.status && message.senderType === 'USER' && (
                                <span className="ml-2">
                                  {message.status === 'sending' && <Timer className="w-3 h-3 inline" />}
                                  {message.status === 'sent' && <CheckCircle className="w-3 h-3 inline" />}
                                  {message.status === 'failed' && <AlertCircle className="w-3 h-3 inline text-red-400" />}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {agentTyping && (
                        <div className="flex justify-start">
                          <div className="bg-gray-200 text-gray-800 p-3 rounded-lg text-sm">
                            <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                            Agent is typing...
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t">
                      <div className="flex space-x-2">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder={t.typeMessage}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          className="flex-1"
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim()}
                          size="sm"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>

              {/* Contact Form Tab */}
              <TabsContent value="contact" className="h-[480px] overflow-y-auto p-4 m-0">
                <form onSubmit={handleSubmitForm} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">{t.name}</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">{t.email}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="subject">{t.subject}</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="message">{t.message}</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={4}
                      required
                    />
                  </div>
                  
                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    {isSubmitting ? t.submitting : t.submit}
                  </Button>
                </form>

                <Separator className="my-6" />
                
                <div className="space-y-4">
                  <h4 className="font-medium">{t.contactInfo}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span>{contactEmail}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span>{contactPhone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>{supportHours}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* FAQ Tab */}
              <TabsContent value="faq" className="h-[480px] overflow-y-auto p-4 m-0">
                <div className="space-y-4">
                  {faqItems.map((item, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">{item.question}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-gray-600">{item.answer}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Social Media Tab */}
              <TabsContent value="social" className="h-[480px] overflow-y-auto p-4 m-0">
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="font-medium mb-2">{t.alternativeContact}</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {t.followUs}
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <SocialMediaLinks 
                      variant="default" 
                      showLabels={true}
                      className="flex-col space-y-3 space-x-0"
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">Quick Contact</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                        <Mail className="w-6 h-6" />
                        <span className="text-xs">Email Support</span>
                      </Button>
                      <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                        <Phone className="w-6 h-6" />
                        <span className="text-xs">Call Us</span>
                      </Button>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h5 className="font-medium text-blue-900 mb-1">Secure Support</h5>
                        <p className="text-sm text-blue-700">
                          All communications are encrypted and secure. Your privacy is our priority.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
