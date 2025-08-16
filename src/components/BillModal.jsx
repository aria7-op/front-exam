import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { billingAPI, paymentAPI } from '../services/api';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import { 
  FiPrinter, 
  FiDownload, 
  FiX, 
  FiCalendar, 
  FiDollarSign, 
  FiBook, 
  FiTag, 
  FiClock, 
  FiAward,
  FiCheckCircle,
  FiClock as FiPendingClock,
  FiHome,
  FiMail,
  FiUser,
  FiFileText
} from 'react-icons/fi';

const BillModal = ({ bill, onClose, onPrint }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();
  if (!bill) return null;

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePrint = async () => {
    try {
      setIsProcessing(true);
      
      const response = await paymentAPI.processPaymentOnPrint(bill.booking.id);
      
      if (response.data?.success) {
        if (response.data.data?.bill) {
          Object.assign(bill, response.data.data.bill);
        } else {
          bill.status = 'PAID';
          bill.payment = {
            method: 'CASH',
            paidAt: new Date().toISOString()
          };
        }
      }
      
      window.print();
      
      queryClient.invalidateQueries(['user-bookings']);
      queryClient.invalidateQueries(['admin-bookings']);
      
      const message = response.data?.message || 'Payment processed and bill printed successfully!';
      toast.success(message);
      
      if (onPrint) onPrint();
    } catch (error) {
      console.error('❌ Payment processing error:', error);
      toast.error('Failed to process payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const generatePDF = () => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  // Colors
  const primaryColor = [40, 53, 147];
  const secondaryColor = [25, 118, 210];
  const successColor = [46, 125, 50];
  const warningColor = [237, 108, 2];
  const lightGray = [240, 240, 240];
  const darkGray = [100, 100, 100];

  // Set default font
  doc.setFont('helvetica', 'normal');
  
  // Add header with gradient
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 30, 'F');
  
  // Logo and title
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text('MockExam Pro', 105, 20, { align: 'center' });
  
  // Invoice header section
  doc.setFontSize(16);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('EXAM FEE INVOICE', 105, 45, { align: 'center' });
  
  // Add decorative line
  doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setLineWidth(0.5);
  doc.line(50, 48, 160, 48);

  // Invoice details in two columns
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  
  // Left column
  doc.text(`Invoice #: ${bill.billNumber}`, 20, 60);
  doc.text(`Issued: ${formatDate(bill.billDate)}`, 20, 65);
  doc.text(`Due: ${formatDate(bill.dueDate)}`, 20, 70);
  
  // Right column
  doc.text(`Status:`, 150, 60);
  if (bill.status === 'PAID') {
    doc.setTextColor(successColor[0], successColor[1], successColor[2]);
    doc.text('PAID', 170, 60, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    doc.text(`Paid on: ${formatDate(bill.payment.paidAt)}`, 150, 65);
    doc.text(`Method: ${bill.payment.method}`, 150, 70);
  } else {
    doc.setTextColor(warningColor[0], warningColor[1], warningColor[2]);
    doc.text('PENDING', 170, 60, { align: 'right' });
    doc.setTextColor(0, 0, 0);
  }

  // Client and exam details section
  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('CLIENT DETAILS', 20, 85);
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(bill.customer.name, 20, 90);
  doc.text(bill.customer.email, 20, 95);
  if (bill.customer.phone) doc.text(bill.customer.phone, 20, 100);

  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('EXAM DETAILS', 120, 85);
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(bill.exam.title, 120, 90);
  doc.text(`Category: ${bill.exam.category}`, 120, 95);
  doc.text(`Duration: ${bill.exam.duration} minutes`, 120, 100);
  doc.text(`Total Marks: ${bill.exam.totalMarks}`, 120, 105);

  // Items table
  const startY = 120;
  let currentY = startY;

  // Table header
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.rect(20, currentY, 170, 8, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Description', 25, currentY + 6);
  doc.text('Amount', 165, currentY + 6, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  currentY += 8;

  // Table row with subtle border
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.2);
  doc.line(20, currentY + 4, 190, currentY + 4);
  
  doc.text(`${bill.exam.title} - Exam Fee`, 25, currentY + 6);
  doc.text(formatCurrency(bill.amount.subtotal, bill.amount.currency), 165, currentY + 6, { align: 'right' });
  currentY += 8;

  if (bill.amount.tax > 0) {
    doc.line(20, currentY + 4, 190, currentY + 4);
    doc.text('Tax', 25, currentY + 6);
    doc.text(formatCurrency(bill.amount.tax, bill.amount.currency), 165, currentY + 6, { align: 'right' });
    currentY += 8;
  }
// Subtle highlighted total row
doc.setFillColor(245, 248, 255); // Very light blue background
doc.rect(20, currentY, 170, 10, 'F');

doc.setDrawColor(220, 220, 220);
doc.setLineWidth(0.3);
doc.rect(20, currentY, 170, 10); // Border around total

doc.setFont('helvetica', 'bold');
doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
doc.text('TOTAL DUE', 25, currentY + 7);
doc.text(formatCurrency(bill.amount.total, bill.amount.currency), 165, currentY + 7, { align: 'right' });

doc.setFont('helvetica', 'normal');
currentY += 15;

  // Payment instructions if pending
  if (bill.status !== 'PAID') {
    doc.setFontSize(11);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('PAYMENT INSTRUCTIONS', 20, currentY);
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    
    currentY += 7;
    doc.text('Please make payment to:', 20, currentY);
    currentY += 5;
    doc.text('Account Name: MockExam Pro Inc.', 25, currentY);
    currentY += 5;
    doc.text('Account Number: 1234 5678 9012', 25, currentY);
    currentY += 5;
    doc.text('Bank: International Bank', 25, currentY);
    currentY += 5;
    doc.text('Reference: ' + bill.billNumber, 25, currentY);
    currentY += 10;
  }

  // Terms and conditions
  doc.setFontSize(8);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text('Terms & Conditions:', 20, currentY);
  currentY += 5;
  doc.text('1. Payment is due within 15 days of invoice date.', 25, currentY);
  currentY += 5;
  doc.text('2. Late payments may be subject to fees.', 25, currentY);
  currentY += 5;
  doc.text('3. All amounts are in ' + bill.amount.currency + '.', 25, currentY);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text('Thank you for choosing MockExam Pro!', 105, 280, { align: 'center' });
  doc.text('For support contact: support@mockexampro.com | Phone: +1 (555) 123-4567', 105, 285, { align: 'center' });
  doc.text('© ' + new Date().getFullYear() + ' MockExam Pro. All rights reserved.', 105, 290, { align: 'center' });

  // Add page border
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.rect(10, 10, 190, 277);

  return doc;
};

  const handleDownload = async () => {
    try {
      const doc = generatePDF();
      doc.save(`invoice_${bill.billNumber}.pdf`);
      toast.success('Bill downloaded successfully!');
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      toast.error('Failed to download bill');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(112, 96, 96, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <style>
        {`
          @media print {
            .no-print {
              display: none !important;
            }
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        `}
      </style>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '32px',
        width: '800px',
        maxWidth: '90vw',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        {/* Header */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FiFileText size={24} className="text-secondary-900" />
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: 'var(--secondary-900)' }}>
              Invoice
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              className="btn btn-secondary"
              onClick={handlePrint}
              disabled={isProcessing}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <FiPrinter size={18} />
              {isProcessing ? 'Processing...' : 'Print'}
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleDownload}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <FiDownload size={18} />
              Download
            </button>
            <button 
              className="btn btn-outline"
              onClick={onClose}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <FiX size={18} />
              Close
            </button>
          </div>
        </div>

        {/* Bill Content */}
        <div style={{ border: '1px solid var(--secondary-200)', borderRadius: '8px', padding: '24px' }}>
          {/* Bill Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <FiHome size={20} className="text-secondary-600" />
                <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--secondary-900)' }}>
                  Mock Exam System
                </h3>
              </div>
              <p style={{ color: 'var(--secondary-600)', marginBottom: '4px' }}>
                123 Education Street
              </p>
              <p style={{ color: 'var(--secondary-600)', marginBottom: '4px' }}>
                Learning City, LC 12345
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--secondary-600)' }}>
                <FiMail size={16} />
                <span>contact@mockexam.com</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--secondary-900)', marginBottom: '8px' }}>
                INVOICE
              </div>
              <div style={{ color: 'var(--secondary-600)', marginBottom: '4px' }}>
                Bill #: {bill.billNumber}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end', color: 'var(--secondary-600)', marginBottom: '4px' }}>
                <FiCalendar size={14} />
                <span>Date: {formatDate(bill.billDate)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end', color: 'var(--secondary-600)' }}>
                <FiCalendar size={14} />
                <span>Due: {formatDate(bill.dueDate)}</span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div style={{ marginBottom: '32px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--secondary-900)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiUser size={18} />
              <span>Bill To:</span>
            </h4>
            <div style={{ color: 'var(--secondary-700)' }}>
              <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                {bill.customer.name}
              </div>
              <div style={{ marginBottom: '4px' }}>
                {bill.customer.email}
              </div>
            </div>
          </div>

          {/* Exam Details */}
          <div style={{ marginBottom: '32px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--secondary-900)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiBook size={18} />
              <span>Exam Details:</span>
            </h4>
            <div style={{ 
              border: '1px solid var(--secondary-200)', 
              borderRadius: '6px', 
              padding: '16px',
              backgroundColor: 'var(--secondary-50)'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '14px', color: 'var(--secondary-600)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiFileText size={14} />
                    <span>Exam Title</span>
                  </div>
                  <div style={{ fontWeight: '500', color: 'var(--secondary-900)' }}>
                    {bill.exam.title}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '14px', color: 'var(--secondary-600)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiTag size={14} />
                    <span>Category</span>
                  </div>
                  <div style={{ fontWeight: '500', color: 'var(--secondary-900)' }}>
                    {bill.exam.category}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '14px', color: 'var(--secondary-600)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiClock size={14} />
                    <span>Duration</span>
                  </div>
                  <div style={{ fontWeight: '500', color: 'var(--secondary-900)' }}>
                    {bill.exam.duration} minutes
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '14px', color: 'var(--secondary-600)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiAward size={14} />
                    <span>Total Marks</span>
                  </div>
                  <div style={{ fontWeight: '500', color: 'var(--secondary-900)' }}>
                    {bill.exam.totalMarks}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Amount Details */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ 
              border: '1px solid var(--secondary-200)', 
              borderRadius: '6px', 
              overflow: 'hidden'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--secondary-50)' }}>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid var(--secondary-200)' }}>
                      Description
                    </th>
                    <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid var(--secondary-200)' }}>
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '12px', borderBottom: '1px solid var(--secondary-200)' }}>
                      {bill.exam.title} - Exam Fee
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid var(--secondary-200)' }}>
                      {formatCurrency(bill.amount.subtotal, bill.amount.currency)}
                    </td>
                  </tr>
                  {bill.amount.tax > 0 && (
                    <tr>
                      <td style={{ padding: '12px', borderBottom: '1px solid var(--secondary-200)' }}>
                        Tax
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid var(--secondary-200)' }}>
                        {formatCurrency(bill.amount.tax, bill.amount.currency)}
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr style={{ backgroundColor: 'var(--primary-50)' }}>
                    <td style={{ padding: '12px', fontWeight: '600', color: 'var(--primary-900)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiDollarSign size={16} />
                        <span>Total</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: 'var(--primary-900)' }}>
                      {formatCurrency(bill.amount.total, bill.amount.currency)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Payment Status */}
          <div style={{ 
            padding: '16px', 
            borderRadius: '6px', 
            backgroundColor: bill.status === 'PAID' ? 'var(--success-50)' : 'var(--warning-50)',
            border: `1px solid ${bill.status === 'PAID' ? 'var(--success-200)' : 'var(--warning-200)'}`,
            marginBottom: '24px'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              color: bill.status === 'PAID' ? 'var(--success-700)' : 'var(--warning-700)'
            }}>
              {bill.status === 'PAID' ? (
                <FiCheckCircle size={20} />
              ) : (
                <FiPendingClock size={20} />
              )}
              <span style={{ fontWeight: '500' }}>
                Status: {bill.status === 'PAID' ? 'PAID' : 'PENDING PAYMENT'}
              </span>
            </div>
            {bill.payment && (
              <div style={{ marginTop: '8px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Payment Method: {bill.payment.method}</span>
                {bill.payment.paidAt && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiCalendar size={14} />
                    <span>Paid on: {formatDate(bill.payment.paidAt)}</span>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ 
            borderTop: '1px solid var(--secondary-200)', 
            paddingTop: '16px',
            textAlign: 'center',
            color: 'var(--secondary-600)',
            fontSize: '14px'
          }}>
            <p>Thank you for choosing Mock Exam System!</p>
            <p>For any questions, please contact us at support@mockexam.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillModal;