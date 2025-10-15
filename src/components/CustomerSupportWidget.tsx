'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  Loader2
} from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
  type?: 'text' | 'system';
}

interface SupportFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
}

interface CustomerSupportWidgetProps {
  position?: 'bottom-right' | 'bottom-left';
  primaryColor?: string;
  companyName?: string;
  supportHours?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export default function CustomerSupportWidget({
  position = 'bottom-right',
  primaryColor = '#2563eb',
  companyName = 'B2B Business',
  supportHours = 'Mon-Fri 9AM-6PM EST',
  contactEmail = 'support@b2bbusiness.com',
  contactPhone = '+1 (555) 123-4567'
}: CustomerSupportWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentView, setCurrentView] = useState<'chat' | 'contact' | 'faq'>('chat');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hello! Welcome to ${companyName}. How can we help you today?`,
      sender: 'support',
      timestamp: new Date(),
      type: 'system'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [formData, setFormData] = useState<SupportFormData>({
    name: '',
    email: '',
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

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    // 模拟自动回复
    setTimeout(() => {
      const autoReply: Message = {
        id: (Date.now() + 1).toString(),
        text: "Thank you for your message! Our support team will get back to you shortly. For immediate assistance, please use our contact form or call us directly.",
        sender: 'support',
        timestamp: new Date(),
        type: 'system'
      };
      setMessages(prev => [...prev, autoReply]);
      setIsTyping(false);
    }, 2000);
  };

  const handleSubmitContactForm = async () => {
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      alert('Please fill in all required fields');
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
          source: 'support_widget'
        }),
      });

      if (response.ok) {
        alert('Your message has been sent successfully! We\'ll get back to you soon.');
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          priority: 'NORMAL'
        });
        setCurrentView('chat');
      } else {
        alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
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
      answer: "We accept wire transfers, letters of credit, and other internationally recognized payment methods for B2B transactions."
    },
    {
      question: "Do you ship internationally?",
      answer: "Yes, we ship worldwide. Shipping costs and delivery times vary by location and order size."
    },
    {
      question: "How can I track my order?",
      answer: "Once your order is processed, you'll receive a tracking number via email. You can also contact our support team for order updates."
    }
  ];

  const quickActions = [
    { label: 'Request Quote', action: () => window.location.href = '/product' },
    { label: 'View Products', action: () => window.location.href = '/product' },
    { label: 'Contact Sales', action: () => setCurrentView('contact') },
    { label: 'FAQ', action: () => setCurrentView('faq') }
  ];

  if (!isOpen) {
    return (
      <div className={`fixed ${positionClasses[position]} z-50`}>
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300"
          style={{ backgroundColor: primaryColor }}
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      <Card className={`w-80 h-96 shadow-xl transition-all duration-300 ${isMinimized ? 'h-12' : 'h-96'}`}>
        {/* Header */}
        <CardHeader className="p-3 border-b" style={{ backgroundColor: primaryColor }}>
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <div>
                <CardTitle className="text-sm">Customer Support</CardTitle>
                <CardDescription className="text-xs text-white/80">
                  We're here to help
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-1">
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
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-full">
            {/* Navigation Tabs */}
            <div className="flex border-b">
              <Button
                variant={currentView === 'chat' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView('chat')}
                className="flex-1 rounded-none text-xs"
              >
                <MessageCircle className="w-3 h-3 mr-1" />
                Chat
              </Button>
              <Button
                variant={currentView === 'contact' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView('contact')}
                className="flex-1 rounded-none text-xs"
              >
                <Mail className="w-3 h-3 mr-1" />
                Contact
              </Button>
              <Button
                variant={currentView === 'faq' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView('faq')}
                className="flex-1 rounded-none text-xs"
              >
                <HelpCircle className="w-3 h-3 mr-1" />
                FAQ
              </Button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden">
              {currentView === 'chat' && (
                <div className="flex flex-col h-full">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-2 rounded-lg text-xs ${
                            message.sender === 'user'
                              ? 'bg-blue-600 text-white'
                              : message.type === 'system'
                              ? 'bg-gray-100 text-gray-700'
                              : 'bg-gray-200 text-gray-800'
                          }`}
                        >
                          {message.text}
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-gray-200 text-gray-800 p-2 rounded-lg text-xs">
                          <Loader2 className="w-3 h-3 animate-spin" />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Quick Actions */}
                  <div className="p-2 border-t">
                    <div className="grid grid-cols-2 gap-1 mb-2">
                      {quickActions.map((action, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={action.action}
                          className="text-xs h-6"
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="p-3 border-t">
                    <div className="flex space-x-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="text-xs"
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                      <Button size="sm" onClick={handleSendMessage} className="px-2">
                        <Send className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {currentView === 'contact' && (
                <div className="p-3 space-y-3 overflow-y-auto h-full">
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs">Name *</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="text-xs h-7"
                        placeholder="Your name"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Email *</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="text-xs h-7"
                        placeholder="your@email.com"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Subject *</Label>
                      <Input
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="text-xs h-7"
                        placeholder="How can we help?"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Message *</Label>
                      <Textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="text-xs"
                        rows={3}
                        placeholder="Describe your inquiry..."
                      />
                    </div>

                    <Button
                      onClick={handleSubmitContactForm}
                      disabled={isSubmitting}
                      className="w-full text-xs h-7"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        'Send Message'
                      )}
                    </Button>
                  </div>

                  <div className="border-t pt-2 space-y-2">
                    <div className="text-xs text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3 h-3" />
                        <span>{supportHours}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Mail className="w-3 h-3" />
                        <span>{contactEmail}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Phone className="w-3 h-3" />
                        <span>{contactPhone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentView === 'faq' && (
                <div className="p-3 space-y-2 overflow-y-auto h-full">
                  {faqItems.map((item, index) => (
                    <div key={index} className="border-b pb-2">
                      <h4 className="text-xs font-medium mb-1">{item.question}</h4>
                      <p className="text-xs text-gray-600">{item.answer}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
