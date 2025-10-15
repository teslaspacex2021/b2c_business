'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import AdminSupportWidget from '@/components/admin/AdminSupportWidget';
import type { Session } from 'next-auth';
import '@/app/globals.css';
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  Users, 
  Settings, 
  Menu, 
  ExternalLink,
  LogOut,
  Bell,
  Search,
  Globe,
  Folder,
  FileIcon,
  Share2,
  BarChart3,
  Mail,
  Image,
  MessageCircle
} from 'lucide-react';


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminLayoutWrapper>
      {children}
    </AdminLayoutWrapper>
  );
}

function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading
    if (!session) {
      router.push('/admin-login');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect to login
  }

  return (
    <AdminLayoutContent session={session}>
      {children}
    </AdminLayoutContent>
  );
}

function AdminLayoutContent({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationItems = [
    {
      title: 'Overview',
      items: [
        {
          title: 'Dashboard',
          href: '/admin',
          icon: LayoutDashboard,
        },
        {
          title: 'Analytics',
          href: '/admin/analytics',
          icon: BarChart3,
        },
      ],
    },
    {
      title: 'Content',
      items: [
        {
          title: 'Products',
          href: '/admin/products',
          icon: Package,
        },
        {
          title: 'Categories',
          href: '/admin/categories',
          icon: Folder,
        },
        {
          title: 'Blog Posts',
          href: '/admin/blogs',
          icon: FileText,
        },
        {
          title: 'Custom Pages',
          href: '/admin/pages',
          icon: FileIcon,
        },
        {
          title: 'Media',
          href: '/admin/media',
          icon: Image,
        },
      ],
    },
    {
      title: 'Customer Relations',
      items: [
        {
          title: 'Customers',
          href: '/admin/customers',
          icon: Users,
        },
        {
          title: 'Contact Inquiries',
          href: '/admin/contacts',
          icon: Mail,
        },
        {
          title: 'Quote Requests',
          href: '/admin/quotes',
          icon: FileText,
        },
        {
          title: 'Support Chat',
          href: '/admin/support',
          icon: MessageCircle,
        },
      ],
    },
    {
      title: 'System Configuration',
      items: [
        {
          title: 'Site Settings',
          href: '/admin/site-config',
          icon: Globe,
        },
        {
          title: 'Payment Setup',
          href: '/admin/payments/settings',
          icon: Settings,
        },
        {
          title: 'Social Media',
          href: '/admin/social-media',
          icon: Share2,
        },
        {
          title: 'Admin Users',
          href: '/admin/users',
          icon: Users,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex">
        {/* Spacer for fixed sidebar */}
        <div className="hidden lg:block w-60 flex-shrink-0"></div>
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-60 bg-background border-r shadow-sm fixed h-screen overflow-y-auto">
          <div className="p-4">
            <Link href="/admin" className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                <Globe className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-primary">Admin Panel</span>
            </Link>
          </div>
          
          <nav className="px-3 space-y-1 pb-32">
            {navigationItems.map((section, sectionIndex) => (
              <div key={section.title}>
                <div className="px-2 py-1.5">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {section.title}
                  </h3>
                </div>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center px-2 py-1.5 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <Icon className="w-4 h-4 mr-2.5" />
                      {item.title}
                    </Link>
                  );
                })}
                {sectionIndex < navigationItems.length - 1 && (
                  <Separator className="my-3" />
                )}
              </div>
            ))}
          </nav>

          {/* User Info & Logout */}
          <div className="fixed bottom-0 w-60 p-4 border-t bg-background z-10">
            <div className="flex items-center space-x-3 mb-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={session.user.image || undefined} />
                <AvatarFallback>
                  {session.user.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {session.user.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {session.user.email}
                </p>
                <Badge variant="secondary" className="text-xs mt-1">
                  {session.user.role || 'admin'}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/admin-login' })}
              className="w-full justify-start"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-background border-b shadow-sm">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-x-4">
                {/* Mobile menu button */}
                <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="lg:hidden">
                      <Menu className="w-5 h-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-60 p-0">
                    <div className="p-6">
                      <Link href="/admin" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                          <Globe className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold text-primary">Admin Panel</span>
                      </Link>
                    </div>
                    <nav className="px-4 space-y-2">
                      {navigationItems.map((section, sectionIndex) => (
                        <div key={section.title}>
                          <div className="px-2 py-2">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              {section.title}
                            </h3>
                          </div>
                          {section.items.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                                onClick={() => setSidebarOpen(false)}
                              >
                                <Icon className="w-4 h-4 mr-3" />
                                {item.title}
                              </Link>
                            );
                          })}
                          {sectionIndex < navigationItems.length - 1 && (
                            <Separator className="my-4" />
                          )}
                        </div>
                      ))}
                    </nav>
                  </SheetContent>
                </Sheet>
                
                <h1 className="text-2xl font-semibold text-foreground">
                  Admin Dashboard
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm">
                  <Search className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-4 h-4" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                    3
                  </Badge>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/" target="_blank">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Site
                  </Link>
                </Button>
              </div>
            </div>
          </header>
          
          {/* Content */}
          <div className="flex-1 p-6">
            {children}
          </div>
        </main>
      </div>
      
      {/* Admin Support Widget */}
      <AdminSupportWidget 
        position="bottom-right"
        currentUserId={session.user.id || session.user.email || 'admin'}
        currentUserName={session.user.name || 'Admin User'}
        currentUserAvatar={session.user.image || undefined}
      />
    </div>
  );
}

