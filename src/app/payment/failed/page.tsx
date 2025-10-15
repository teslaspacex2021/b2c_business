import { Metadata } from 'next';
import PaymentFailedContent from './PaymentFailedContent';

export const metadata: Metadata = {
  title: 'Payment Failed | B2B Business',
  description: 'Your payment could not be processed',
};

export default function PaymentFailedPage() {
  return <PaymentFailedContent />;
}