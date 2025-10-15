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
  Globe
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
  session: {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    };
  };
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationItems = [
    {
      title: 'Main',
      items: [
        {
          title: 'Dashboard',
          href: '/admin',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: 'Content Management',
      items: [
        {
          title: 'Products',
          href: '/admin/products',
          icon: Package,
        },
        {
          title: 'Blog Posts',
          href: '/admin/blogs',
          icon: FileText,
        },
      ],
    },
    {
      title: 'User Management',
      items: [
        {
          title: 'Users',
          href: '/admin/users',
          icon: Users,
        },
        {
          title: 'Contacts',
          href: '/admin/contacts',
          icon: Bell,
        },
      ],
    },
    {
      title: 'System',
      items: [
        {
          title: 'Settings',
          href: '/admin/settings',
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 bg-background border-r shadow-sm">
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

          {/* User Info & Logout */}
          <div className="absolute bottom-0 w-64 p-6 border-t bg-background">
            <div className="flex items-center space-x-3 mb-4">
              <Avatar className="w-8 h-8">
                <AvatarImage src={session.user.image} />
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
                  <SheetContent side="left" className="w-64 p-0">
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
    </div>
  );
}

