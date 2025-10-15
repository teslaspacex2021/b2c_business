import type { Metadata } from 'next';
import ContactManagementContent from './ContactManagementContent';

export const metadata: Metadata = {
  title: 'Contact Management - Admin Dashboard',
  description: 'Manage contact form submissions and inquiries.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ContactsManagement() {
  return <ContactManagementContent />;
}
