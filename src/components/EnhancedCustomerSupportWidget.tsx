'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import SocialMediaLinks from '@/components/SocialMediaLinks';
import { useProduct } from '@/contexts/ProductContext';
import {
  MessageCircle,
  X,
  Send,
  Phone,
  Mail,
  Clock,
  Minimize2,
  Maximize2,
  HelpCircle,
  Loader2,
  Users,
  Globe,
  LogIn,
  MessageSquare,
  Headphones,
  Star,
  Package,
} from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
  type?: 'text' | 'system';
  senderName?: string;
  senderAvatar?: string;
}

interface SupportFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
}

interface ProductInfo {
  id: string;
  title: string;
  price?: number | string;
  image?: string;
  url?: string;
}

interface EnhancedCustomerSupportWidgetProps {
  position?: 'bottom-right' | 'bottom-left';
  primaryColor?: string;
  supportHours?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export default function EnhancedCustomerSupportWidget({
  position = 'bottom-right',
  primaryColor = '#2563eb',
  supportHours = 'Mon-Fri 9AM-6PM EST',
  contactEmail = 'support@b2bbusiness.com',
  contactPhone = '+1 (555) 123-4567'
}: EnhancedCustomerSupportWidgetProps) {
  const { data: session } = useSession();
  const { currentProduct } = useProduct();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentView, setCurrentView] = useState<'chat' | 'contact' | 'faq' | 'social'>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [formData, setFormData] = useState<SupportFormData>({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    subject: '',
    message: '',
    priority: 'NORMAL'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // 当打开聊天且用户已登录时，尝试加载现有会话
  useEffect(() => {
    if (isOpen && currentView === 'chat' && session?.user && !currentSessionId) {
      // 可以在这里检查是否有现有的活跃会话
      // 暂时先不自动创建会话，等用户发送第一条消息时再创建
    }
  }, [isOpen, currentView, session, currentSessionId]);

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };

  // 创建支持会话
  const createSupportSession = async () => {
    if (!session?.user) return null;

    setIsConnecting(true);
    try {
      const response = await fetch('/api/support/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          visitorName: session.user.name,
          visitorEmail: session.user.email,
          source: 'website',
          priority: 'NORMAL'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setCurrentSessionId(result.data.id);
        return result.data.id;
      }
    } catch (error) {
      console.error('Failed to create support session:', error);
      toast.error('Failed to connect to support. Please try again.');
    } finally {
      setIsConnecting(false);
    }
    return null;
  };


  // 发送消息到后端
  const sendMessageToBackend = async (content: string, sessionId: string) => {
    try {
      const response = await fetch('/api/support/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          content,
          messageType: 'TEXT',
          senderType: 'USER',
          status: 'SENT'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message. Please try again.');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !session) return;

    // 如果没有会话，先创建一个
    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = await createSupportSession();
      if (!sessionId) return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date(),
      senderName: session.user.name || 'You',
      senderAvatar: (session.user as any)?.image || undefined
    };

    // 立即显示用户消息
    setMessages(prev => [...prev, userMessage]);
    const messageContent = newMessage;
    setNewMessage('');

    // 发送消息到后端
    await sendMessageToBackend(messageContent, sessionId);
  };

  const handleSendProductInfo = async () => {
    if (!currentProduct || !session) return;

    // 如果没有会话，先创建一个
    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = await createSupportSession();
      if (!sessionId) return;
    }

    const formatPrice = (price?: number | string) => {
      if (!price) return 'Contact for Price';
      return `$${parseFloat(price.toString()).toFixed(2)}`;
    };

    const productMessageContent = `I'm interested in this product:

🏷️ **${currentProduct.title}**
💰 Price: ${formatPrice(currentProduct.price)}
🔗 Product Link: ${currentProduct.url || `${window.location.origin}/product/${currentProduct.id}`}

Could you please provide more information about this product?`;

    const productMessage: Message = {
      id: Date.now().toString(),
      text: productMessageContent,
      sender: 'user',
      timestamp: new Date(),
      senderName: session.user.name || 'You',
      senderAvatar: (session.user as any)?.image || undefined
    };

    // 立即显示产品消息
    setMessages(prev => [...prev, productMessage]);

    // 发送消息到后端
    await sendMessageToBackend(productMessageContent, sessionId);
  };

  const handleSubmitContactForm = async () => {
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          source: 'enhanced_support_widget'
        }),
      });

      if (response.ok) {
                        toast.success('Your message has been sent successfully! We&apos;ll get back to you soon.');
        setFormData({
          name: session?.user?.name || '',
          email: session?.user?.email || '',
          subject: '',
          message: '',
          priority: 'NORMAL'
        });
        setCurrentView('chat');
      } else {
        toast.error('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqItems = [
    {
      question: "What are your business hours?",
      answer: supportHours
    },
    {
      question: "How can I get a quote for products?",
      answer: "You can request a quote by clicking the 'Get Quote' button on any product page, or contact us directly with your requirements."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept major credit cards, wire transfers, letters of credit, and other internationally recognized payment methods for B2B transactions."
    },
    {
      question: "Do you ship internationally?",
      answer: "Yes, we ship worldwide. Shipping costs and delivery times vary by location and order size."
    },
    {
      question: "How can I track my order?",
      answer: "Once your order is processed, you'll receive a tracking number via email. You can also contact our support team for order updates."
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 30-day return policy for most products. Items must be in original condition. Contact us for specific return instructions."
    }
  ];

  const quickActions = [
    { 
      label: 'Request Quote', 
      action: () => window.location.href = '/quote',
      icon: MessageSquare
    },
    { 
      label: 'View Products', 
      action: () => window.location.href = '/product',
      icon: Globe
    },
    { 
      label: 'Contact Sales', 
      action: () => setCurrentView('contact'),
      icon: Phone
    },
    { 
      label: 'FAQ', 
      action: () => setCurrentView('faq'),
      icon: HelpCircle
    }
  ];

  // Login required view
  const LoginRequiredView = () => (
    <div className="p-6 text-center space-y-4">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
        <LogIn className="w-8 h-8 text-blue-600" />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Login Required</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Please log in to access our live chat support and get personalized assistance.
        </p>
      </div>
      <div className="space-y-2">
        <Button 
          onClick={() => window.location.href = '/login'} 
          className="w-full"
          style={{ backgroundColor: primaryColor }}
        >
          <LogIn className="w-4 h-4 mr-2" />
          Login to Chat
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setCurrentView('contact')} 
          className="w-full"
        >
          <Mail className="w-4 h-4 mr-2" />
          Send Message Instead
        </Button>
      </div>
      <div className="pt-4 border-t">
        <p className="text-xs text-muted-foreground mb-2">Or reach us directly:</p>
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-center space-x-2">
            <Mail className="w-3 h-3" />
            <span>{contactEmail}</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Phone className="w-3 h-3" />
            <span>{contactPhone}</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isOpen) {
    return (
      <div className={`fixed ${positionClasses[position]} z-50`}>
        <div className="relative">
              <Button
                onClick={() => setIsOpen(true)}
            className="rounded-full w-16 h-16 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                style={{ backgroundColor: primaryColor }}
              >
            <MessageCircle className="w-7 h-7" />
              </Button>
          {/* Online indicator */}
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      <Card className={`w-96 shadow-2xl transition-all duration-300 ${isMinimized ? 'h-14' : 'h-[600px]'} border-0`}>
        {/* Header */}
        <CardHeader 
          className="p-4 border-b" 
          style={{ backgroundColor: primaryColor }}
        >
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <MessageCircle className="w-6 h-6" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border border-white"></div>
            </div>
              <div>
                <CardTitle className="text-base">Customer Support</CardTitle>
              <CardDescription className="text-xs text-white/80">
                  {session ? `Welcome, ${session.user.name}` : 'We&apos;re here to help'}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-white/20 w-8 h-8 p-0"
            >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 w-8 h-8 p-0"
            >
                <X className="w-4 h-4" />
            </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-full">
            {/* Navigation Tabs */}
            <div className="flex border-b bg-muted/30">
                  <Button
                variant={currentView === 'chat' ? 'default' : 'ghost'}
                    size="sm"
                onClick={() => setCurrentView('chat')}
                className="flex-1 rounded-none text-xs h-10"
              >
                <MessageCircle className="w-3 h-3 mr-1" />
                Chat
                  </Button>
              <Button
                variant={currentView === 'contact' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView('contact')}
                className="flex-1 rounded-none text-xs h-10"
              >
                <Mail className="w-3 h-3 mr-1" />
                Contact
              </Button>
              <Button
                variant={currentView === 'faq' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView('faq')}
                className="flex-1 rounded-none text-xs h-10"
              >
                <HelpCircle className="w-3 h-3 mr-1" />
                FAQ
              </Button>
              <Button
                variant={currentView === 'social' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView('social')}
                className="flex-1 rounded-none text-xs h-10"
              >
                <Users className="w-3 h-3 mr-1" />
                Social
              </Button>
              </div>
              
            {/* Content Area */}
            <div className="flex-1 overflow-hidden">
              {currentView === 'chat' && (
                <div className="flex flex-col h-full">
                  {!session ? (
                    <LoginRequiredView />
                  ) : (
                    <>
                      {/* Connection Status */}
                      {isConnecting && (
                        <div className="px-4 py-2 bg-blue-50 border-b">
                          <div className="flex items-center gap-2 text-sm text-blue-600">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Connecting to support...
                          </div>
                        </div>
                      )}

                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {messages.length === 0 && !isConnecting && (
                          <div className="text-center py-8">
                            <Headphones className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                            <h3 className="font-semibold mb-2">Start a conversation</h3>
                            <p className="text-sm text-muted-foreground">
                              Our support team is ready to help you with any questions.
                            </p>
                            {currentSessionId && (
                              <div className="mt-2 text-xs text-green-600">
                                ✓ Connected to support
                              </div>
                            )}
                          </div>
                        )}
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`flex items-start space-x-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={message.senderAvatar} />
                                <AvatarFallback className="text-xs">
                                  {message.senderName?.charAt(0) || (message.sender === 'user' ? 'U' : 'S')}
                                </AvatarFallback>
                              </Avatar>
                              <div
                                className={`p-3 rounded-lg text-sm ${
                                  message.sender === 'user'
                                    ? 'bg-blue-600 text-white'
                                    : message.type === 'system'
                                    ? 'bg-muted text-muted-foreground'
                                    : 'bg-muted'
                                }`}
                              >
                                {message.text}
                                <div className="text-xs opacity-70 mt-1">
                                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                                </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Quick Actions */}
                      <div className="p-3 border-t bg-muted/30">
                        <div className="grid grid-cols-2 gap-2">
                          {quickActions.map((action, index) => {
                            const Icon = action.icon;
                            return (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                onClick={action.action}
                                className="text-xs h-8 justify-start"
                              >
                                <Icon className="w-3 h-3 mr-1" />
                                {action.label}
                              </Button>
                            );
                          })}
                          </div>
                        </div>

                      {/* Product Card */}
                      {currentProduct && (
                        <div className="p-3 border-t bg-muted/30">
                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                              {currentProduct.image ? (
                                <img 
                                  src={currentProduct.image} 
                                  alt={currentProduct.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="w-6 h-6 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">{currentProduct.title}</h4>
                              <p className="text-xs text-muted-foreground">
                                {currentProduct.price ? `$${parseFloat(currentProduct.price.toString()).toFixed(2)}` : 'Contact for Price'}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleSendProductInfo}
                              className="px-2 py-1 h-8 text-xs"
                              disabled={!session}
                            >
                              <Package className="w-3 h-3 mr-1" />
                              Send
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Message Input */}
                      <div className="p-4 border-t">
                        <div className="flex space-x-2">
                          <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="text-sm"
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          />
                          <Button 
                            size="sm"
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim()}
                            className="px-3"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                          </div>
                    </>
                  )}
                </div>
              )}

              {currentView === 'contact' && (
                <div className="p-4 space-y-4 overflow-y-auto h-full">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm">Name *</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="text-sm h-9"
                        placeholder="Your name"
                      />
                    </div>

                    <div>
                      <Label className="text-sm">Email *</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="text-sm h-9"
                        placeholder="your@email.com"
                      />
                    </div>

                    <div>
                      <Label className="text-sm">Subject *</Label>
                      <Input
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="text-sm h-9"
                        placeholder="How can we help?"
                      />
                    </div>

                    <div>
                      <Label className="text-sm">Priority</Label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                        className="w-full h-9 px-3 text-sm border rounded-md"
                      >
                        <option value="LOW">Low</option>
                        <option value="NORMAL">Normal</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                      </select>
                    </div>

                    <div>
                      <Label className="text-sm">Message *</Label>
                      <Textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="text-sm"
                        rows={4}
                        placeholder="Describe your inquiry..."
                      />
                    </div>

                    <Button 
                      onClick={handleSubmitContactForm}
                      disabled={isSubmitting}
                      className="w-full text-sm h-9"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        'Send Message'
                      )}
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Contact Information</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{supportHours}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>{contactEmail}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>{contactPhone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentView === 'faq' && (
                <div className="p-4 space-y-3 overflow-y-auto h-full">
                  <div className="mb-4">
                    <h3 className="font-semibold text-sm mb-2">Frequently Asked Questions</h3>
                    <p className="text-xs text-muted-foreground">
                      Find quick answers to common questions
                    </p>
                  </div>
                    {faqItems.map((item, index) => (
                    <div key={index} className="border-b pb-3">
                      <h4 className="text-sm font-medium mb-2 flex items-start">
                        <HelpCircle className="w-4 h-4 mr-2 mt-0.5 text-blue-500" />
                          {item.question}
                        </h4>
                      <p className="text-xs text-muted-foreground ml-6">{item.answer}</p>
                      </div>
                    ))}
                  <div className="pt-4 text-center">
                    <p className="text-xs text-muted-foreground mb-2">
                      Can't find what you're looking for?
                    </p>
                      <Button 
                        variant="outline"
                        size="sm"
                      onClick={() => setCurrentView('contact')}
                      className="text-xs"
                      >
                      Contact Support
                      </Button>
                  </div>
                </div>
              )}

              {currentView === 'social' && (
                <div className="p-4 space-y-4 overflow-y-auto h-full">
                  <div className="text-center">
                    <h3 className="font-semibold text-sm mb-2">Connect With Us</h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      Follow us on social media for updates and support
                    </p>
                    </div>

                  <div className="flex justify-center">
                    <SocialMediaLinks 
                      variant="default" 
                      showLabels={false}
                      className="justify-center"
                    />
                    </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Why Follow Us?</h4>
                    <div className="space-y-2">
                      <div className="flex items-start space-x-2">
                        <Star className="w-4 h-4 text-yellow-500 mt-0.5" />
                    <div>
                          <p className="text-sm font-medium">Latest Updates</p>
                          <p className="text-xs text-muted-foreground">
                            Get notified about new products and features
                          </p>
                          </div>
                          </div>
                      <div className="flex items-start space-x-2">
                        <MessageSquare className="w-4 h-4 text-blue-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Quick Support</p>
                          <p className="text-xs text-muted-foreground">
                            Get help through social media channels
                          </p>
                          </div>
                          </div>
                      <div className="flex items-start space-x-2">
                        <Users className="w-4 h-4 text-green-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Community</p>
                          <p className="text-xs text-muted-foreground">
                            Join our community of business partners
                          </p>
                      </div>
                    </div>
                      </div>
                    </div>

                  <div className="pt-4 text-center">
                              <Button
                                variant="outline"
                                size="sm"
                      onClick={() => setCurrentView('contact')}
                      className="text-xs"
                              >
                      <Mail className="w-3 h-3 mr-1" />
                      Contact Support
                              </Button>
                        </div>
                      </div>
                    )}
                  </div>
            </CardContent>
        )}
      </Card>
    </div>
  );
}