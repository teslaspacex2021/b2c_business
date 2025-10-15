import { Metadata } from 'next';
import PaymentSuccessContent from './PaymentSuccessContent';

export const metadata: Metadata = {
  title: 'Payment Successful | B2B Business',
  description: 'Your payment has been processed successfully',
};

export default function PaymentSuccessPage() {
  return <PaymentSuccessContent />;
}