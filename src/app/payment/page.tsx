import { Metadata } from 'next';
import PaymentPageContent from './PaymentPageContent';

export const metadata: Metadata = {
  title: 'Payment | B2B Business',
  description: 'Secure payment processing for your order',
};

export default function PaymentPage() {
  return <PaymentPageContent />;
}