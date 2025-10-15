import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Get payment with all related data
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        customer: true,
        quote: {
          include: {
            creator: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    if (payment.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Payment is not completed' },
        { status: 400 }
      );
    }

    // Generate PDF receipt (simplified HTML for now)
    const receiptHtml = generateReceiptHtml(payment);
    
    // In a real implementation, you would use a PDF generation library like puppeteer or jsPDF
    // For now, we'll return the HTML content
    return new NextResponse(receiptHtml, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="receipt-${payment.quote.quoteNumber}.html"`
      }
    });

  } catch (error) {
    console.error('Error generating receipt:', error);
    return NextResponse.json(
      { error: 'Failed to generate receipt' },
      { status: 500 }
    );
  }
}

function generateReceiptHtml(payment: any): string {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Receipt - ${payment.quote.quoteNumber}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                line-height: 1.6;
                color: #333;
            }
            .header {
                text-align: center;
                border-bottom: 2px solid #007bff;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .company-name {
                font-size: 24px;
                font-weight: bold;
                color: #007bff;
                margin-bottom: 5px;
            }
            .receipt-title {
                font-size: 20px;
                color: #666;
            }
            .receipt-info {
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
            }
            .info-section {
                flex: 1;
            }
            .info-section h3 {
                color: #007bff;
                border-bottom: 1px solid #eee;
                padding-bottom: 5px;
                margin-bottom: 10px;
            }
            .payment-details {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .amount {
                font-size: 24px;
                font-weight: bold;
                color: #28a745;
                text-align: center;
                margin: 20px 0;
            }
            .status {
                display: inline-block;
                background: #28a745;
                color: white;
                padding: 5px 15px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: bold;
            }
            .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                color: #666;
                font-size: 14px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
            }
            th, td {
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid #eee;
            }
            th {
                background: #f8f9fa;
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="company-name">B2B Business Platform</div>
            <div class="receipt-title">Payment Receipt</div>
        </div>

        <div class="receipt-info">
            <div class="info-section">
                <h3>Bill To:</h3>
                <p>
                    <strong>${payment.customer.name}</strong><br>
                    ${payment.customer.email}<br>
                    ${payment.customer.company ? payment.customer.company + '<br>' : ''}
                </p>
            </div>
            <div class="info-section">
                <h3>Receipt Details:</h3>
                <p>
                    <strong>Receipt #:</strong> ${payment.id}<br>
                    <strong>Quote #:</strong> ${payment.quote.quoteNumber}<br>
                    <strong>Date:</strong> ${formatDate(payment.paidAt || payment.createdAt)}<br>
                    <strong>Status:</strong> <span class="status">${payment.status}</span>
                </p>
            </div>
        </div>

        <div class="payment-details">
            <h3>Payment Information</h3>
            <table>
                <tr>
                    <th>Description</th>
                    <th>Amount</th>
                </tr>
                <tr>
                    <td>${payment.quote.title}</td>
                    <td>${formatCurrency(payment.amount, payment.currency)}</td>
                </tr>
            </table>
            
            <div class="amount">
                Total Paid: ${formatCurrency(payment.amount, payment.currency)}
            </div>
            
            <p><strong>Payment Method:</strong> ${payment.paymentMethod}</p>
            ${payment.stripePaymentIntentId ? `<p><strong>Transaction ID:</strong> ${payment.stripePaymentIntentId}</p>` : ''}
        </div>

        <div class="footer">
            <p>Thank you for your business!</p>
            <p>This is an official receipt for your payment. Please keep this for your records.</p>
            <p>Generated on ${formatDate(new Date())}</p>
        </div>
    </body>
    </html>
  `;
}
