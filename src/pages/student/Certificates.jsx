import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { examAPI, userAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiAward, FiRefreshCw, FiEye, FiDownload } from 'react-icons/fi';
import jsPDF from 'jspdf';

const Certificates = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);

  // Normalize certificate data structure
  const normalizeCertificateData = (certificate) => {
    // Handle score normalization - convert decimal to percentage
    let scoreValue = certificate?.score || certificate?.percentage || certificate?.finalScore || 0;
    
    // Convert decimal to percentage if needed
    if (typeof scoreValue === 'number' && scoreValue < 1) {
      scoreValue = Math.round(scoreValue * 100 * 100) / 100; // Round to 2 decimal places
    } else if (typeof scoreValue === 'string') {
      scoreValue = parseFloat(scoreValue);
      if (scoreValue < 1) {
        scoreValue = Math.round(scoreValue * 100 * 100) / 100;
      }
    }
    
    return {
      id: certificate?.id || certificate?.attemptId || 'N/A',
      examTitle: certificate?.exam?.title || certificate?.examTitle || certificate?.testName || 'Unknown Exam',
      score: scoreValue || 0,
      earnedDate: certificate?.earnedDate || certificate?.completedAt || certificate?.createdAt || certificate?.attemptDate || 'N/A',
      categoryName: certificate?.exam?.examCategory?.name || certificate?.categoryName || certificate?.testCategory || 'Unknown Category'
    };
  };

  // Fetch user certificates
  const {
    data: certificatesData,
    isLoading: certificatesLoading,
    error: certificatesError,
    refetch: refetchCertificates
  } = useQuery({
    queryKey: ['userCertificates', currentPage, limit],
    queryFn: () => userAPI.getUserCertificates({
      page: currentPage,
      limit
    }),
    enabled: !!user?.id,
    refetchInterval: 60000,
  });

  // Fetch passed attempts for certificate generation
  const {
    data: passedAttemptsData,
    isLoading: passedAttemptsLoading,
    error: passedAttemptsError
  } = useQuery({
    queryKey: ['passedAttempts'],
    queryFn: () => examAPI.getUserExamHistory({
      status: 'passed',
      limit: 100
    }),
    enabled: !!user?.id,
    refetchInterval: 60000,
  });

  // Extract and normalize data from API responses
  const certificates = certificatesData?.data?.data?.certificates?.map(normalizeCertificateData) || [];
  const passedAttempts = passedAttemptsData?.data?.data?.attempts?.map(normalizeCertificateData) || [];
  
  // Console log the percentage scores
  console.log('=== CERTIFICATE PERCENTAGE SCORES ===');
  certificates.forEach(cert => {
    console.log(`Certificate: ${cert.examTitle} - Score: ${cert.score}%`);
  });
  
  console.log('=== PASSED ATTEMPTS PERCENTAGE SCORES ===');
  passedAttempts.forEach(attempt => {
    console.log(`Attempt: ${attempt.examTitle} - Score: ${attempt.score}%`);
  });

  // Generate certificate mutation
  const generateCertificateMutation = useMutation({
    mutationFn: (attemptId) => examAPI.generateCertificate(attemptId),
    onSuccess: (data) => {
      toast.success('Certificate generated successfully!');
      queryClient.invalidateQueries(['userCertificates']);
      queryClient.invalidateQueries(['passedAttempts']);
    },
    onError: (error) => {
      console.error('Generate certificate error:', error);
      toast.error(error.response?.data?.message || 'Failed to generate certificate');
    }
  });

  // Auto-generate certificates mutation
  const autoGenerateCertificatesMutation = useMutation({
    mutationFn: () => examAPI.autoGenerateCertificates(),
    onSuccess: (data) => {
      toast.success(data.data?.message || 'Certificates auto-generated successfully!');
      queryClient.invalidateQueries(['userCertificates']);
      queryClient.invalidateQueries(['passedAttempts']);
    },
    onError: (error) => {
      console.error('Auto-generate certificates error:', error);
      toast.error(error.response?.data?.message || 'Failed to auto-generate certificates');
    }
  });

  // Handle view/generate PDF certificate
  const handleViewCertificate = (cert) => {
  const certificate = normalizeCertificateData(cert);
  
  try {
    // Create PDF with modern design
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Solid background color instead of gradient
    doc.setFillColor(248, 250, 252); // Light blue-gray background
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Decorative abstract shapes - using solid colors
    doc.setFillColor(199, 210, 254); // Light indigo
    doc.circle(pageWidth * 0.2, pageHeight * 0.15, 40, 'F');
    doc.circle(pageWidth * 0.8, pageHeight * 0.7, 60, 'F');
    doc.setFillColor(224, 231, 255); // Lighter indigo
    doc.roundedRect(pageWidth * 0.6, pageHeight * 0.1, 80, 40, 10, 10, 'F');

    // Main certificate container with shadow effect
    doc.setDrawColor(224, 231, 255); // Light indigo border
    doc.setFillColor(255, 255, 255); // White background
    doc.roundedRect(20, 20, pageWidth - 40, pageHeight - 40, 5, 5, 'FD');

    // Modern header with accent
    doc.setFillColor(79, 70, 229); // Vibrant indigo
    doc.roundedRect(0, 0, pageWidth, 15, 0, 0, 'F');
    
    // Certificate title with decorative underline
    doc.setFontSize(32);
    doc.setTextColor(55, 65, 81); // Cool gray-700
    doc.setFont('helvetica', 'bold');
    doc.text('CERTIFICATE OF ACHIEVEMENT', pageWidth / 2, 45, { align: 'center' });
    
    // Underline effect
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(2);
    doc.line(pageWidth * 0.3, 50, pageWidth * 0.7, 50);

    // Recipient section
    doc.setFontSize(18);
    doc.setTextColor(100, 116, 139); // Cool gray-500
    doc.setFont('helvetica', 'normal');
    doc.text('This certificate is proudly presented to', pageWidth / 2, 70, { align: 'center' });
    
    // Recipient name with modern typography
    doc.setFontSize(36);
    doc.setTextColor(30, 41, 59); // Cool gray-800
    doc.setFont('helvetica', 'bold');
    doc.text(user?.fullName || 'Valued Participant', pageWidth / 2, 90, { align: 'center' });

    // Achievement details
    doc.setFontSize(16);
    doc.setTextColor(71, 85, 105); // Cool gray-600
    doc.setFont('helvetica', 'normal');
    doc.text(`For outstanding performance in completing the`, pageWidth / 2, 110, { align: 'center' });
    
    doc.setFontSize(20);
    doc.setTextColor(79, 70, 229); // Vibrant indigo
    doc.setFont('helvetica', 'bold');
    doc.text(certificate.examTitle, pageWidth / 2, 125, { align: 'center' });

    // Score and date in modern card style
    doc.setFillColor(240, 244, 253); // Light indigo background
    doc.roundedRect(pageWidth * 0.25, 140, pageWidth * 0.5, 40, 5, 5, 'F');
    
    doc.setFontSize(14);
    doc.setTextColor(71, 85, 105);
    doc.text(`Achieved score: ${certificate.score}%`, pageWidth / 2, 150, { align: 'center' });
    
    const formattedDate = new Date(certificate.earnedDate).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    doc.text(`Completed on: ${formattedDate}`, pageWidth / 2, 165, { align: 'center' });

    // Modern signature section
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    
    // Left signature
    doc.text('________________________', pageWidth * 0.2, 190);
    doc.text('Exam Administrator', pageWidth * 0.2, 195);
    doc.text('ExamCert Pro', pageWidth * 0.2, 200);
    
    // Right signature
    doc.text('________________________', pageWidth * 0.6, 190);
    doc.text('Date of Issue', pageWidth * 0.6, 195);
    doc.text(formattedDate, pageWidth * 0.6, 200);

    // Certificate ID in footer
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text(`Certificate ID: ${certificate.id}`, pageWidth / 2, pageHeight - 20, { align: 'center' });

    // Decorative corner elements
    doc.setDrawColor(199, 210, 254);
    doc.setLineWidth(1);
    // Top-left corner
    doc.line(25, 25, 35, 25);
    doc.line(25, 25, 25, 35);
    // Top-right corner
    doc.line(pageWidth - 25, 25, pageWidth - 35, 25);
    doc.line(pageWidth - 25, 25, pageWidth - 25, 35);
    // Bottom-left corner
    doc.line(25, pageHeight - 25, 35, pageHeight - 25);
    doc.line(25, pageHeight - 25, 25, pageHeight - 35);
    // Bottom-right corner
    doc.line(pageWidth - 25, pageHeight - 25, pageWidth - 35, pageHeight - 25);
    doc.line(pageWidth - 25, pageHeight - 25, pageWidth - 25, pageHeight - 35);

    // Save PDF with modern filename
    const filename = `Cert_${certificate.examTitle.replace(/\s+/g, '_')}_${user?.fullName?.replace(/\s+/g, '_') || 'User'}.pdf`;
    doc.save(filename);
    
    toast.success('Certificate downloaded!', {
      icon: '🎉',
      style: {
        background: '#e0e7ff',
        color: '#4f46e5',
        fontWeight: 'bold',
        borderRadius: '12px',
        border: '2px solid #c7d2fe'
      }
    });
  } catch (error) {
    console.error('Certificate generation error:', error);
    toast.error('Failed to generate certificate', {
      icon: '❌',
      style: {
        background: '#fee2e2',
        color: '#dc2626',
        fontWeight: 'bold'
      }
    });
  }
};

  // Handle generate certificate for a specific attempt
  const handleGenerateCertificate = async (attemptId) => {
    try {
      await generateCertificateMutation.mutateAsync(attemptId);
    } catch (error) {
      console.error('Generate certificate error:', error);
    }
  };

  // Handle auto-generate all certificates
  const handleAutoGenerateAll = async () => {
    try {
      await autoGenerateCertificatesMutation.mutateAsync();
    } catch (error) {
      console.error('Auto-generate all error:', error);
    }
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Calculate total pages
  const totalPages = Math.ceil((certificatesData?.data?.data?.total || 0) / limit);

  // Handle errors
  if (certificatesError || passedAttemptsError) {
    return (
      <div className="error-container">
        <h3>Error loading certificates</h3>
        <p>Failed to load certificate data. Please try again later.</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  const isLoading = certificatesLoading || passedAttemptsLoading;

  return (
    <div>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1565C0, #0D47A1)',
        borderRadius: '24px',
        padding: '40px',
        marginBottom: '40px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>
            My Certificates
          </h1>
          <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '24px' }}>
            View and manage your earned certificates from completed exams
          </p>
          
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <button
              onClick={handleAutoGenerateAll}
              disabled={autoGenerateCertificatesMutation.isPending}
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {autoGenerateCertificatesMutation.isPending ? (
                <>
                  <FiRefreshCw size={16} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FiAward size={16} />
                  Auto-Generate All
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Certificates Grid */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '32px',
        marginBottom: '40px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0'
      }}>
        <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#1E293B', marginBottom: '24px' }}>
          Earned Certificates
        </h3>
        
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                padding: '24px',
                borderRadius: '16px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                height: '200px',
              }}></div>
            ))}
          </div>
        ) : certificates.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
              <FiAward size={48} style={{ color: '#94A3B8' }} />
            </div>
            <h3>No certificates found</h3>
            <p>You haven't earned any certificates yet. Complete exams to earn your first certificate!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {certificates.map((certificate) => (
              <div key={certificate.id} style={{
                padding: '24px',
                borderRadius: '16px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #1565C0, #0D47A1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    color: 'white'
                  }}>
                    <FiAward size={24} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#1E293B', marginBottom: '4px' }}>
                      {certificate.examTitle}
                    </h4>
                    <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
                      {certificate.categoryName}
                    </p>
                  </div>
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#64748B' }}>Score:</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#15803D' }}>
                      {certificate.score}%
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#64748B' }}>Date:</span>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#1E293B' }}>
                      {new Date(certificate.earnedDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', color: '#64748B' }}>Status:</span>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      backgroundColor: '#DCFCE7',
                      color: '#166534',
                      textTransform: 'uppercase'
                    }}>
                      Earned
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => handleViewCertificate(certificate)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #2563EB',
                    borderRadius: '8px',
                    background: 'transparent',
                    color: '#2563EB',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <FiDownload size={14} />
                  Download Certificate
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Certificate Generation Section - Only show for admins */}
      {isAdmin && (
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#1E293B', marginBottom: '24px' }}>
            Generate Certificates
          </h3>
          
          <p style={{ fontSize: '16px', color: '#64748B', marginBottom: '24px' }}>
            Generate certificates for exams you've passed but haven't received certificates for yet.
          </p>
          
          {isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {[1, 2].map(i => (
                <div key={i} style={{
                  padding: '20px',
                  borderRadius: '16px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  height: '180px'
                }}></div>
              ))}
            </div>
          ) : passedAttempts.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                <FiAward size={48} style={{ color: '#94A3B8' }} />
              </div>
              <h3>No passed exams found</h3>
              <p>You need to pass an exam to be eligible for a certificate.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {passedAttempts.map((attempt) => (
                <div key={attempt.id} style={{
                  padding: '20px',
                  borderRadius: '16px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  transition: 'all 0.3s ease'
                }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1E293B', marginBottom: '12px' }}>
                    {attempt.examTitle}
                  </h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px', color: '#64748B' }}>Category:</span>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#15803D' }}>
                        {attempt.categoryName}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px', color: '#64748B' }}>Score:</span>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#15803D' }}>
                        {attempt.score}%
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px', color: '#64748B' }}>Date:</span>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#1E293B' }}>
                        {new Date(attempt.earnedDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleGenerateCertificate(attempt.id)}
                    disabled={generateCertificateMutation.isPending}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #15803D',
                      borderRadius: '8px',
                      background: 'transparent',
                      color: '#15803D',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    {generateCertificateMutation.isPending ? (
                      <>
                        <FiRefreshCw size={14} className="animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FiAward size={14} />
                        Generate Certificate
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          marginTop: '32px'
        }}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              padding: '8px 16px',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              background: currentPage === 1 ? '#F1F5F9' : 'white',
              color: currentPage === 1 ? '#94A3B8' : '#64748B',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            }}
          >
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              style={{
                padding: '8px 16px',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                background: currentPage === page ? '#2563EB' : 'white',
                color: currentPage === page ? 'white' : '#64748B',
                cursor: 'pointer',
              }}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              padding: '8px 16px',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              background: currentPage === totalPages ? '#F1F5F9' : 'white',
              color: currentPage === totalPages ? '#94A3B8' : '#64748B',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Certificates;