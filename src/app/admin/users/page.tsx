import type { Metadata } from 'next';
import UserManagementContent from './UserManagementContent';

export const metadata: Metadata = {
  title: 'User Management - Admin Dashboard',
  description: 'Manage users and permissions for the B2B business platform.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function UsersManagement() {
  return <UserManagementContent />;
}