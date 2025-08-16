import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { FiUsers, FiFileText, FiHelpCircle, FiBarChart2, FiDownload, FiTrendingUp, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const Reports = () => {
  const { user: currentUser } = useAuth();
  const [reportType, setReportType] = useState('overview');
  const [dateRange, setDateRange] = useState('30d');
  const [exportFormat, setExportFormat] = useState('pdf');
  const [includeCharts, setIncludeCharts] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [useCustomDateRange, setUseCustomDateRange] = useState(false);
  const [includeRawData, setIncludeRawData] = useState(false);

  // Fetch comprehensive analytics data
  const { data: analyticsData, isLoading: analyticsLoading, error: analyticsError } = useQuery({
    queryKey: ['admin-analytics-comprehensive'],
    queryFn: async () => {
      try {
        const results = await Promise.allSettled([
          adminAPI.getDashboardStats(),
          adminAPI.getUserAnalytics(),
          adminAPI.getExamAnalytics(),
          adminAPI.getQuestionAnalytics()
        ]);
        
        const [dashboardResult, userResult, examResult, questionResult] = results;
        
        console.log('🔍 API Results:', results);
        
        const dashboardStats = dashboardResult.status === 'fulfilled' ? dashboardResult.value : null;
        const userAnalytics = userResult.status === 'fulfilled' ? userResult.value : null;
        const examAnalytics = examResult.status === 'fulfilled' ? examResult.value : null;
        const questionAnalytics = questionResult.status === 'fulfilled' ? questionResult.value : null;
        
        console.log('🔍 Dashboard Stats:', dashboardStats);
        console.log('🔍 User Analytics:', userAnalytics);
        console.log('🔍 Exam Analytics:', examAnalytics);
        console.log('🔍 Question Analytics:', questionAnalytics);
        
        // Log the actual data structure we're extracting
        console.log('📊 Extracted Dashboard:', dashboardStats?.data?.data);
        console.log('📊 Extracted Users:', userAnalytics?.data?.data);
        console.log('📊 Extracted Exams:', examAnalytics?.data?.data);
        console.log('📊 Extracted Questions:', questionAnalytics?.data?.data);
        
        return {
          dashboard: dashboardStats?.data?.data || dashboardStats?.data,
          users: userAnalytics?.data?.data || userAnalytics?.data,
          exams: examAnalytics?.data?.data || examAnalytics?.data,
          questions: questionAnalytics?.data?.data || questionAnalytics?.data
        };
      } catch (error) {
        console.error('❌ Analytics API Error:', error);
        throw error;
      }
    },
    refetchInterval: 60000
  });

  // Export report mutation
  const exportReportMutation = useMutation({
    mutationFn: (exportData) => adminAPI.exportData(exportData),
    onSuccess: (data) => {
      toast.success('Report exported successfully!');
      // Handle file download
      if (data?.data?.downloadUrl) {
        const link = document.createElement('a');
        link.href = data.data.downloadUrl;
        link.download = `report-${reportType}-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to export report');
    }
  });

  // Client-side export functions
  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Add title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`, pageWidth / 2, 20, { align: 'center' });
    
    // Add date range
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date Range: ${dateRange}`, pageWidth / 2, 30, { align: 'center' });
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 40, { align: 'center' });
    
    let yPosition = 60;
    
    // Add overview stats
    if (reportType === 'overview') {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Overview Statistics', 20, yPosition);
      yPosition += 20;
      
      const overviewData = [
        ['Metric', 'Value'],
        ['Total Users', stats.totalUsers || 0],
        ['Total Exams', stats.totalExams || 0],
        ['Total Questions', stats.totalQuestions || 0],
        ['Total Attempts', stats.totalAttempts || 0]
      ];
      
      autoTable(doc, {
        startY: yPosition,
        head: [overviewData[0]],
        body: overviewData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [66, 139, 202] }
      });
      
      yPosition = doc.lastAutoTable.finalY + 20;
      
      // Add performance summary
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Performance Summary', 20, yPosition);
      yPosition += 20;
      
      const performanceData = [
        ['Metric', 'Value'],
        ['Average Score', `${Math.round(normalizedExamStats.averageScore ?? 0)}%`],
        ['Pass Rate', `${Math.round(normalizedExamStats.passRate ?? 0)}%`],
        ['Avg Completion Time', `${normalizedExamStats.averageCompletionTime ?? 0} min`],
        ['Abandonment Rate', `${Math.round(normalizedExamStats.abandonmentRate ?? 0)}%`]
      ];
      
      autoTable(doc, {
        startY: yPosition,
        head: [performanceData[0]],
        body: performanceData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [66, 139, 202] }
      });
    }
    
    // Add user report data
    if (reportType === 'users') {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('User Demographics', 20, yPosition);
      yPosition += 20;
      
      const userData = [
        ['Metric', 'Value'],
        ['Active Users', userStats.activeUsers || 0],
        ['New Users', userStats.newUsers || 0],
        ['Verified Users', userStats.verifiedUsers || 0]
      ];
      
      autoTable(doc, {
        startY: yPosition,
        head: [userData[0]],
        body: userData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [66, 139, 202] }
      });
      
      yPosition = doc.lastAutoTable.finalY + 20;
      
      // Add user roles if available
      if (userStats.usersByRole && userStats.usersByRole.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Users by Role', 20, yPosition);
        yPosition += 15;
        
        const roleData = [['Role', 'Count']];
        userStats.usersByRole.forEach(role => {
          roleData.push([role.role, role.count]);
        });
        
        autoTable(doc, {
          startY: yPosition,
          head: [roleData[0]],
          body: roleData.slice(1),
          theme: 'grid',
          headStyles: { fillColor: [66, 139, 202] }
        });
      }
    }
    
    // Add exam report data
    if (reportType === 'exams') {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Exam Performance Analysis', 20, yPosition);
      yPosition += 20;
      
      const examData = [
        ['Metric', 'Value'],
        ['Total Exams', examStats.totalExams || 0],
        ['Active Exams', examStats.activeExams || 0],
        ['Completed Exams', examStats.completedExams || 0],
        ['Average Score', `${examStats.averageScore || 0}%`]
      ];
      
      autoTable(doc, {
        startY: yPosition,
        head: [examData[0]],
        body: examData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [66, 139, 202] }
      });
    }
    
    // Add question report data
    if (reportType === 'questions') {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Question Bank Analysis', 20, yPosition);
      yPosition += 20;
      
      const questionData = [
        ['Metric', 'Value'],
        ['Total Questions', questionStats.totalQuestions || 0],
        ['Active Questions', questionStats.activeQuestions || 0],
        ['Average Difficulty', questionStats.averageDifficulty || 'Medium']
      ];
      
      autoTable(doc, {
        startY: yPosition,
        head: [questionData[0]],
        body: questionData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [66, 139, 202] }
      });
    }
    
    // Save the PDF
    const fileName = `report-${reportType}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    toast.success('PDF exported successfully!');
  };

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    // Define styles for different elements
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4472C4" } },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } }
      }
    };

    const subHeaderStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "70AD47" } },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } }
      }
    };

    const dataHeaderStyle = {
      font: { bold: true, color: { rgb: "000000" } },
      fill: { fgColor: { rgb: "D9E1F2" } },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } }
      }
    };

    const dataCellStyle = {
      border: {
        top: { style: "thin", color: { rgb: "D0D0D0" } },
        bottom: { style: "thin", color: { rgb: "D0D0D0" } },
        left: { style: "thin", color: { rgb: "D0D0D0" } },
        right: { style: "thin", color: { rgb: "D0D0D0" } }
      },
      alignment: { vertical: "center" }
    };

    const titleStyle = {
      font: { bold: true, size: 16, color: { rgb: "000000" } },
      alignment: { horizontal: "center", vertical: "center" }
    };

    const metricStyle = {
      font: { bold: true, color: { rgb: "000000" } },
      fill: { fgColor: { rgb: "F2F2F2" } },
      border: {
        top: { style: "thin", color: { rgb: "D0D0D0" } },
        bottom: { style: "thin", color: { rgb: "D0D0D0" } },
        left: { style: "thin", color: { rgb: "D0D0D0" } },
        right: { style: "thin", color: { rgb: "D0D0D0" } }
      }
    };

    const valueStyle = {
      font: { color: { rgb: "000000" } },
      fill: { fgColor: { rgb: "FFFFFF" } },
      border: {
        top: { style: "thin", color: { rgb: "D0D0D0" } },
        bottom: { style: "thin", color: { rgb: "D0D0D0" } },
        left: { style: "thin", color: { rgb: "D0D0D0" } },
        right: { style: "thin", color: { rgb: "D0D0D0" } }
      }
    };

    // Create overview sheet with styling
    const overviewData = [
      [{ v: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`, s: titleStyle }],
      [{ v: `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, s: { font: { italic: true, color: { rgb: "666666" } } } }],
      [{ v: `Date Range: ${getActualDateRange()}`, s: { font: { italic: true, color: { rgb: "666666" } } } }],
      [], // Empty row
      [{ v: 'Overview Statistics', s: subHeaderStyle }],
      [],
      [{ v: 'Metric', s: dataHeaderStyle }, { v: 'Value', s: dataHeaderStyle }],
      [{ v: 'Total Users', s: metricStyle }, { v: stats.totalUsers || 0, s: valueStyle }],
      [{ v: 'Total Exams', s: metricStyle }, { v: stats.totalExams || 0, s: valueStyle }],
      [{ v: 'Total Questions', s: metricStyle }, { v: stats.totalQuestions || 0, s: valueStyle }],
      [{ v: 'Total Attempts', s: metricStyle }, { v: stats.totalAttempts || 0, s: valueStyle }],
      [], // Empty row
      [{ v: 'Performance Summary', s: subHeaderStyle }],
      [],
      [{ v: 'Metric', s: dataHeaderStyle }, { v: 'Value', s: dataHeaderStyle }],
      [{ v: 'Average Score', s: metricStyle }, { v: `${Math.round(normalizedExamStats.averageScore ?? 0)}%`, s: valueStyle }],
      [{ v: 'Pass Rate', s: metricStyle }, { v: `${Math.round(normalizedExamStats.passRate ?? 0)}%`, s: valueStyle }],
      [{ v: 'Avg Completion Time', s: metricStyle }, { v: `${normalizedExamStats.averageCompletionTime ?? 0} min`, s: valueStyle }],
      [{ v: 'Abandonment Rate', s: metricStyle }, { v: `${Math.round(normalizedExamStats.abandonmentRate ?? 0)}%`, s: valueStyle }]
    ];
    
    const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);
    
    // Set column widths
    overviewSheet['!cols'] = [
      { width: 25 },
      { width: 15 }
    ];
    
    // Apply styles to specific cells
    overviewSheet['!rows'] = [
      { hpt: 30 }, // Title row height
      { hpt: 20 }, // Subtitle row height
      { hpt: 20 }, // Date range row height
      { hpt: 10 }, // Empty row height
      { hpt: 25 }, // Section header row height
      { hpt: 10 }, // Empty row height
      { hpt: 25 }, // Data header row height
      { hpt: 22 }, // Data row height
      { hpt: 22 }, // Data row height
      { hpt: 22 }, // Data row height
      { hpt: 22 }, // Data row height
      { hpt: 10 }, // Empty row height
      { hpt: 25 }, // Section header row height
      { hpt: 10 }, // Empty row height
      { hpt: 25 }, // Data header row height
      { hpt: 22 }, // Data row height
      { hpt: 22 }, // Data row height
      { hpt: 22 }, // Data row height
      { hpt: 22 }  // Data row height
    ];
    
    XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Overview');
    
    // Create specific report sheet with styling
    let reportData = [];
    let sheetName = '';
    
    if (reportType === 'users') {
      sheetName = 'User Report';
      reportData = [
        [{ v: 'User Demographics', s: titleStyle }],
        [],
        [{ v: 'Metric', s: dataHeaderStyle }, { v: 'Value', s: dataHeaderStyle }],
        [{ v: 'Active Users', s: metricStyle }, { v: userStats.activeUsers || 0, s: valueStyle }],
        [{ v: 'New Users', s: metricStyle }, { v: userStats.newUsers || 0, s: valueStyle }],
        [{ v: 'Verified Users', s: metricStyle }, { v: userStats.verifiedUsers || 0, s: valueStyle }]
      ];
      
      if (userStats.usersByRole && userStats.usersByRole.length > 0) {
        reportData.push([], [{ v: 'Users by Role', s: subHeaderStyle }], []);
        reportData.push([{ v: 'Role', s: dataHeaderStyle }, { v: 'Count', s: dataHeaderStyle }]);
        userStats.usersByRole.forEach(role => {
          reportData.push([{ v: role.role, s: metricStyle }, { v: role.count, s: valueStyle }]);
        });
      }
    } else if (reportType === 'exams') {
      sheetName = 'Exam Report';
      reportData = [
        [{ v: 'Exam Performance Analysis', s: titleStyle }],
        [],
        [{ v: 'Metric', s: dataHeaderStyle }, { v: 'Value', s: dataHeaderStyle }],
        [{ v: 'Total Exams', s: metricStyle }, { v: examStats.totalExams || 0, s: valueStyle }],
        [{ v: 'Active Exams', s: metricStyle }, { v: examStats.activeExams || 0, s: valueStyle }],
        [{ v: 'Completed Exams', s: metricStyle }, { v: examStats.completedExams || 0, s: valueStyle }],
        [{ v: 'Average Score', s: metricStyle }, { v: `${examStats.averageScore || 0}%`, s: valueStyle }]
      ];
      
      if (examStats.recentAttempts && examStats.recentAttempts.length > 0) {
        reportData.push([], [{ v: 'Recent Exam Attempts', s: subHeaderStyle }], []);
        reportData.push([
          { v: 'Exam Title', s: dataHeaderStyle }, 
          { v: 'User Name', s: dataHeaderStyle }, 
          { v: 'Score', s: dataHeaderStyle }, 
          { v: 'Completed Date', s: dataHeaderStyle }
        ]);
        examStats.recentAttempts.slice(0, 10).forEach(attempt => {
          reportData.push([
            { v: attempt.examTitle || 'N/A', s: metricStyle },
            { v: attempt.userName || 'N/A', s: metricStyle },
            { v: `${attempt.score || 0}%`, s: valueStyle },
            { v: new Date(attempt.completedAt).toLocaleDateString(), s: valueStyle }
          ]);
        });
      }
    } else if (reportType === 'questions') {
      sheetName = 'Question Report';
      reportData = [
        [{ v: 'Question Bank Analysis', s: titleStyle }],
        [],
        [{ v: 'Metric', s: dataHeaderStyle }, { v: 'Value', s: dataHeaderStyle }],
        [{ v: 'Total Questions', s: metricStyle }, { v: questionStats.totalQuestions || 0, s: valueStyle }],
        [{ v: 'Active Questions', s: metricStyle }, { v: questionStats.activeQuestions || 0, s: valueStyle }],
        [{ v: 'Average Difficulty', s: metricStyle }, { v: questionStats.averageDifficulty || 'Medium', s: valueStyle }]
      ];
      
      if (questionStats.questionsByType && questionStats.questionsByType.length > 0) {
        reportData.push([], [{ v: 'Questions by Type', s: subHeaderStyle }], []);
        reportData.push([{ v: 'Type', s: dataHeaderStyle }, { v: 'Count', s: dataHeaderStyle }]);
        questionStats.questionsByType.forEach(type => {
          reportData.push([{ v: type.type, s: metricStyle }, { v: type.count, s: valueStyle }]);
        });
      }
    }
    
    if (reportData.length > 0) {
      const reportSheet = XLSX.utils.aoa_to_sheet(reportData);
      
      // Set column widths for report sheet
      if (reportType === 'exams' && examStats.recentAttempts && examStats.recentAttempts.length > 0) {
        reportSheet['!cols'] = [
          { width: 30 }, // Exam Title
          { width: 20 }, // User Name
          { width: 12 }, // Score
          { width: 15 }  // Date
        ];
      } else {
        reportSheet['!cols'] = [
          { width: 25 },
          { width: 15 }
        ];
      }
      
      XLSX.utils.book_append_sheet(workbook, reportSheet, sheetName);
    }
    
    // Add detailed data sheet if raw data is requested
    if (includeRawData) {
      const rawDataSheet = XLSX.utils.aoa_to_sheet([
        [{ v: 'Raw Data Export', s: titleStyle }],
        [],
        [{ v: 'This sheet contains the raw data used to generate the report', s: { font: { italic: true, color: { rgb: "666666" } } } }],
        [],
        [{ v: 'Report Type', s: dataHeaderStyle }, { v: reportType, s: valueStyle }],
        [{ v: 'Date Range', s: dataHeaderStyle }, { v: getActualDateRange(), s: valueStyle }],
        [{ v: 'Generated', s: dataHeaderStyle }, { v: new Date().toISOString(), s: valueStyle }]
      ]);
      
      rawDataSheet['!cols'] = [
        { width: 20 },
        { width: 40 }
      ];
      
      XLSX.utils.book_append_sheet(workbook, rawDataSheet, 'Raw Data');
    }
    
    // Add metadata sheet with styling
    const metadataData = [
      [{ v: 'Report Metadata', s: titleStyle }],
      [],
      [{ v: 'Property', s: dataHeaderStyle }, { v: 'Value', s: dataHeaderStyle }],
      [{ v: 'Report Type', s: metricStyle }, { v: reportType, s: valueStyle }],
      [{ v: 'Date Range', s: metricStyle }, { v: getActualDateRange(), s: valueStyle }],
      [{ v: 'Generated Date', s: metricStyle }, { v: new Date().toLocaleDateString(), s: valueStyle }],
      [{ v: 'Generated Time', s: metricStyle }, { v: new Date().toLocaleTimeString(), s: valueStyle }],
      [{ v: 'Export Format', s: metricStyle }, { v: 'Excel (.xlsx)', s: valueStyle }],
      [{ v: 'Include Charts', s: metricStyle }, { v: includeCharts ? 'Yes' : 'No', s: valueStyle }],
      [{ v: 'Include Raw Data', s: metricStyle }, { v: includeRawData ? 'Yes' : 'No', s: valueStyle }]
    ];
    
    const metadataSheet = XLSX.utils.aoa_to_sheet(metadataData);
    
    metadataSheet['!cols'] = [
      { width: 20 },
      { width: 30 }
    ];
    
    XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Metadata');
    
    // Save the Excel file
    const fileName = `report-${reportType}-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    toast.success('Excel file exported successfully!');
  };

  const exportToCSV = () => {
    let csvContent = '';
    
    // Add header
    csvContent += `Report Type,${reportType}\n`;
    csvContent += `Date Range,${dateRange}\n`;
    csvContent += `Generated Date,${new Date().toLocaleDateString()}\n`;
    csvContent += `Generated Time,${new Date().toLocaleTimeString()}\n\n`;
    
    // Add overview data
    csvContent += 'Overview Statistics\n';
    csvContent += 'Metric,Value\n';
    csvContent += `Total Users,${stats.totalUsers || 0}\n`;
    csvContent += `Total Exams,${stats.totalExams || 0}\n`;
    csvContent += `Total Questions,${stats.totalQuestions || 0}\n`;
    csvContent += `Total Attempts,${stats.totalAttempts || 0}\n\n`;
    
    // Add performance summary
    csvContent += 'Performance Summary\n';
    csvContent += 'Metric,Value\n';
    csvContent += `Average Score,${Math.round(normalizedExamStats.averageScore ?? 0)}%\n`;
    csvContent += `Pass Rate,${Math.round(normalizedExamStats.passRate ?? 0)}%\n`;
    csvContent += `Avg Completion Time,${normalizedExamStats.averageCompletionTime ?? 0} min\n`;
    csvContent += `Abandonment Rate,${Math.round(normalizedExamStats.abandonmentRate ?? 0)}%\n\n`;
    
    // Add specific report data
    if (reportType === 'users') {
      csvContent += 'User Demographics\n';
      csvContent += 'Metric,Value\n';
      csvContent += `Active Users,${userStats.activeUsers || 0}\n`;
      csvContent += `New Users,${userStats.newUsers || 0}\n`;
      csvContent += `Verified Users,${userStats.verifiedUsers || 0}\n\n`;
      
      if (userStats.usersByRole && userStats.usersByRole.length > 0) {
        csvContent += 'Users by Role\n';
        csvContent += 'Role,Count\n';
        userStats.usersByRole.forEach(role => {
          csvContent += `${role.role},${role.count}\n`;
        });
        csvContent += '\n';
      }
    } else if (reportType === 'exams') {
      csvContent += 'Exam Performance Analysis\n';
      csvContent += 'Metric,Value\n';
      csvContent += `Total Exams,${examStats.totalExams || 0}\n`;
      csvContent += `Active Exams,${examStats.activeExams || 0}\n`;
      csvContent += `Completed Exams,${examStats.completedExams || 0}\n`;
      csvContent += `Average Score,${examStats.averageScore || 0}%\n\n`;
      
      if (examStats.recentAttempts && examStats.recentAttempts.length > 0) {
        csvContent += 'Recent Exam Attempts\n';
        csvContent += 'Exam Title,User Name,Score,Completed Date\n';
        examStats.recentAttempts.slice(0, 10).forEach(attempt => {
          csvContent += `${attempt.examTitle || 'N/A'},${attempt.userName || 'N/A'},${attempt.score || 0}%,${new Date(attempt.completedAt).toLocaleDateString()}\n`;
        });
        csvContent += '\n';
      }
    } else if (reportType === 'questions') {
      csvContent += 'Question Bank Analysis\n';
      csvContent += 'Metric,Value\n';
      csvContent += `Total Questions,${questionStats.totalQuestions || 0}\n`;
      csvContent += `Active Questions,${questionStats.activeQuestions || 0}\n`;
      csvContent += `Average Difficulty,${questionStats.averageDifficulty || 'Medium'}\n\n`;
      
      if (questionStats.questionsByType && questionStats.questionsByType.length > 0) {
        csvContent += 'Questions by Type\n';
        csvContent += 'Type,Count\n';
        questionStats.questionsByType.forEach(type => {
          csvContent += `${type.type},${type.count}\n`;
        });
        csvContent += '\n';
      }
    }
    
    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const fileName = `report-${reportType}-${new Date().toISOString().split('T')[0]}.csv`;
    saveAs(blob, fileName);
    toast.success('CSV file exported successfully!');
  };

  const handleExportReport = () => {
    // Use client-side export based on selected format
    switch (exportFormat) {
      case 'pdf':
        exportToPDF();
        break;
      case 'excel':
        exportToExcel();
        break;
      case 'csv':
        exportToCSV();
        break;
      default:
        // Fallback to backend export if needed
        exportReportMutation.mutate({
          reportType,
          dateRange,
          format: exportFormat,
          includeCharts: true
        });
    }
  };

  const data = analyticsData || {};
  const stats = data.dashboard?.overview || data.dashboard || {};
  const userStats = data.users || {};
  const examStats = data.exams || {};
  const questionStats = data.questions || {};

  // Normalize exam stats to expected keys to ensure Performance Summary displays
  const normalizeExamStats = (raw) => {
    if (!raw || typeof raw !== 'object') return {};

    // Flatten nested objects (one level deep is enough for our use)
    const flattenObject = (obj, parentKey = '', result = {}) => {
      Object.entries(obj).forEach(([key, value]) => {
        const newKey = parentKey ? `${parentKey}.${key}` : key;
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          flattenObject(value, newKey, result);
        } else {
          result[newKey] = value;
        }
      });
      return result;
    };

    const flat = flattenObject(raw);

    const getFirstValue = (candidates) => {
      for (const key of candidates) {
        if (flat[key] !== undefined) return flat[key];
      }
      return undefined;
    };

    const toNumber = (v) => {
      if (v === undefined || v === null) return undefined;
      const num = typeof v === 'string' ? parseFloat(v) : v;
      return Number.isFinite(num) ? num : undefined;
    };

    const toPercent = (v) => {
      const num = toNumber(v);
      if (num === undefined) return undefined;
      return num <= 1 ? num * 100 : num;
    };

    const averageScoreRaw = getFirstValue([
      'averageScore', 'average_score', 'avgScore', 'avg_score',
      'performance.averageScore', 'performance.avgScore',
      'summary.averageScore', 'summary.avgScore',
      'performanceSummary.averageScore', 'performanceSummary.avgScore',
      'averageScorePercent', 'average_score_percent', 'averageScorePercentage', 'avg_score_percentage'
    ]);

    const passRateRaw = getFirstValue([
      'passRate', 'pass_rate', 'passRatePercent', 'pass_rate_percent', 'passRatePercentage',
      'performance.passRate', 'summary.passRate', 'performanceSummary.passRate'
    ]);

    const avgTimeRaw = getFirstValue([
      'averageCompletionTime', 'avgCompletionTime', 'average_completion_time', 'avg_completion_time',
      'performance.averageCompletionTime', 'summary.averageCompletionTime', 'performanceSummary.averageCompletionTime',
      'avgCompletionMinutes', 'averageCompletionMinutes', 'avg_time_minutes'
    ]);

    const abandonmentRaw = getFirstValue([
      'abandonmentRate', 'abandon_rate', 'abandonment_rate', 'dropoutRate', 'dropout_rate',
      'performance.abandonmentRate', 'summary.abandonmentRate', 'performanceSummary.abandonmentRate'
    ]);

    // If time looks like seconds, convert to minutes
    let averageCompletionTime = toNumber(avgTimeRaw);
    if (averageCompletionTime !== undefined && averageCompletionTime > 180) {
      averageCompletionTime = Math.round(averageCompletionTime / 60);
    }

    return {
      averageScore: toPercent(averageScoreRaw),
      passRate: toPercent(passRateRaw),
      averageCompletionTime,
      abandonmentRate: toPercent(abandonmentRaw)
    };
  };

  const normalizedExamStats = normalizeExamStats(examStats);

  console.log('📊 Final parsed data:', { data, stats, userStats, examStats, questionStats, normalizedExamStats });

  if (analyticsLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '24px', color: 'var(--secondary-600)' }}>Loading reports...</div>
      </div>
    );
  }

  if (analyticsError) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '24px', color: 'var(--danger-600)' }}>Error loading reports</div>
        <div style={{ fontSize: '16px', color: 'var(--secondary-600)', marginTop: '8px' }}>
          {analyticsError.message}
        </div>
        <button 
          onClick={() => window.location.reload()} 
          style={{ marginTop: '16px', padding: '8px 16px', backgroundColor: 'var(--primary-600)', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Retry
        </button>
      </div>
    );
  }

  const renderOverviewReport = () => (
    <div>
      <div className="dashboard-grid" style={{ marginBottom: '32px' }}>
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div className="dashboard-card-title">Total Users</div>
            <div className="dashboard-card-icon primary">
              <FiUsers size={24} />
            </div>
          </div>
          <div className="dashboard-card-value">{stats.totalUsers || 0}</div>
          <div className="dashboard-card-description">
            {userStats.newUsers || 0} new users this period
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div className="dashboard-card-title">Total Exams</div>
            <div className="dashboard-card-icon success">
              <FiFileText size={24} />
            </div>
          </div>
          <div className="dashboard-card-value">{stats.totalExams || 0}</div>
          <div className="dashboard-card-description">
            {examStats.activeExams || 0} active exams
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div className="dashboard-card-title">Total Questions</div>
            <div className="dashboard-card-icon warning">
              <FiHelpCircle size={24} />
            </div>
          </div>
          <div className="dashboard-card-value">{stats.totalQuestions || 0}</div>
          <div className="dashboard-card-description">
            {questionStats.activeQuestions || 0} active questions
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div className="dashboard-card-title">Total Attempts</div>
            <div className="dashboard-card-icon danger">
              <FiBarChart2 size={24} />
            </div>
          </div>
          <div className="dashboard-card-value">{stats.totalAttempts || 0}</div>
          <div className="dashboard-card-description">
            {examStats.recentAttempts || 0} recent attempts
          </div>
        </div>
      </div>

      <div className="chart-container">
        <div className="chart-header">
          <h3 className="chart-title">Performance Summary</h3>
        </div>
        <div className="chart-content">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <div style={{ textAlign: 'center', padding: '24px', background: 'white', borderRadius: '12px', border: '1px solid var(--secondary-200)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                <FiTrendingUp size={32} style={{ color: 'var(--primary-600)' }} />
              </div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--primary-600)', marginBottom: '8px' }}>
                {Math.round(normalizedExamStats.averageScore ?? 0)}%
              </div>
              <div style={{ fontSize: '16px', color: 'var(--secondary-600)', fontWeight: '500' }}>Average Score</div>
            </div>
            <div style={{ textAlign: 'center', padding: '24px', background: 'white', borderRadius: '12px', border: '1px solid var(--secondary-200)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                <FiCheckCircle size={32} style={{ color: 'var(--success-600)' }} />
              </div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--success-600)', marginBottom: '8px' }}>
                {Math.round(normalizedExamStats.passRate ?? 0)}%
              </div>
              <div style={{ fontSize: '16px', color: 'var(--secondary-600)', fontWeight: '500' }}>Pass Rate</div>
            </div>
            <div style={{ textAlign: 'center', padding: '24px', background: 'white', borderRadius: '12px', border: '1px solid var(--secondary-200)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                <FiClock size={32} style={{ color: 'var(--warning-600)' }} />
              </div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--warning-600)', marginBottom: '8px' }}>
                {normalizedExamStats.averageCompletionTime ?? 0} min
              </div>
              <div style={{ fontSize: '16px', color: 'var(--secondary-600)', fontWeight: '500' }}>Avg Completion Time</div>
            </div>
            <div style={{ textAlign: 'center', padding: '24px', background: 'white', borderRadius: '12px', border: '1px solid var(--secondary-200)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                <FiXCircle size={32} style={{ color: 'var(--danger-600)' }} />
              </div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--danger-600)', marginBottom: '8px' }}>
                {Math.round(normalizedExamStats.abandonmentRate ?? 0)}%
              </div>
              <div style={{ fontSize: '16px', color: 'var(--secondary-600)', fontWeight: '500' }}>Abandonment Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUserReport = () => (
    <div>
      <div className="chart-container">
        <div className="chart-header">
          <h3 className="chart-title">User Demographics</h3>
        </div>
        <div className="chart-content">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div style={{ background: 'white', borderRadius: '8px', padding: '16px', border: '1px solid var(--secondary-200)' }}>
              <h4 style={{ marginBottom: '12px', color: 'var(--secondary-900)' }}>User Roles</h4>
              {userStats.usersByRole?.map((role, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--secondary-700)' }}>{role.role}</span>
                  <span style={{ fontWeight: '600', color: 'var(--primary-600)' }}>{role.count}</span>
                </div>
              )) || (
                <div style={{ color: 'var(--secondary-600)', textAlign: 'center', padding: '20px' }}>
                  No role data available
                </div>
              )}
            </div>
            <div style={{ background: 'white', borderRadius: '8px', padding: '16px', border: '1px solid var(--secondary-200)' }}>
              <h4 style={{ marginBottom: '12px', color: 'var(--secondary-900)' }}>User Status</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--secondary-700)' }}>Active Users</span>
                <span style={{ fontWeight: '600', color: 'var(--success-600)' }}>{userStats.activeUsers || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--secondary-700)' }}>New Users</span>
                <span style={{ fontWeight: '600', color: 'var(--primary-600)' }}>{userStats.newUsers || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--secondary-700)' }}>Verified Users</span>
                <span style={{ fontWeight: '600', color: 'var(--info-600)' }}>{userStats.verifiedUsers || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderExamReport = () => (
    <div>
      <div className="chart-container">
        <div className="chart-header">
          <h3 className="chart-title">Exam Performance Analysis</h3>
        </div>
        <div className="chart-content">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            <div style={{ background: 'white', borderRadius: '8px', padding: '16px', border: '1px solid var(--secondary-200)' }}>
              <h4 style={{ marginBottom: '12px', color: 'var(--secondary-900)' }}>Exam Statistics</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--secondary-700)' }}>Total Exams</span>
                <span style={{ fontWeight: '600', color: 'var(--primary-600)' }}>{examStats.totalExams || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--secondary-700)' }}>Active Exams</span>
                <span style={{ fontWeight: '600', color: 'var(--success-600)' }}>{examStats.activeExams || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--secondary-700)' }}>Completed Exams</span>
                <span style={{ fontWeight: '600', color: 'var(--info-600)' }}>{examStats.completedExams || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--secondary-700)' }}>Average Score</span>
                <span style={{ fontWeight: '600', color: 'var(--warning-600)' }}>{examStats.averageScore || 0}%</span>
              </div>
            </div>
            <div style={{ background: 'white', borderRadius: '8px', padding: '16px', border: '1px solid var(--secondary-200)' }}>
              <h4 style={{ marginBottom: '12px', color: 'var(--secondary-900)' }}>Recent Exam Attempts</h4>
              {examStats.recentAttempts ? (
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {examStats.recentAttempts.slice(0, 5).map((attempt, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '4px 0',
                      borderBottom: index < 4 ? '1px solid var(--secondary-200)' : 'none'
                    }}>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: '500' }}>{attempt.examTitle}</div>
                        <div style={{ fontSize: '10px', color: 'var(--secondary-600)' }}>{attempt.userName}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary-600)' }}>{attempt.score}%</div>
                        <div style={{ fontSize: '10px', color: 'var(--secondary-600)' }}>
                          {new Date(attempt.completedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: 'var(--secondary-600)', textAlign: 'center', padding: '20px' }}>
                  No recent attempts
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderQuestionReport = () => (
    <div>
      <div className="chart-container">
        <div className="chart-header">
          <h3 className="chart-title">Question Bank Analysis</h3>
        </div>
        <div className="chart-content">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div style={{ background: 'white', borderRadius: '8px', padding: '16px', border: '1px solid var(--secondary-200)' }}>
              <h4 style={{ marginBottom: '12px', color: 'var(--secondary-900)' }}>Question Statistics</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--secondary-700)' }}>Total Questions</span>
                <span style={{ fontWeight: '600', color: 'var(--primary-600)' }}>{questionStats.totalQuestions || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--secondary-700)' }}>Active Questions</span>
                <span style={{ fontWeight: '600', color: 'var(--success-600)' }}>{questionStats.activeQuestions || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--secondary-700)' }}>Average Difficulty</span>
                <span style={{ fontWeight: '600', color: 'var(--warning-600)' }}>{questionStats.averageDifficulty || 'Medium'}</span>
              </div>
            </div>
            <div style={{ background: 'white', borderRadius: '8px', padding: '16px', border: '1px solid var(--secondary-200)' }}>
              <h4 style={{ marginBottom: '12px', color: 'var(--secondary-900)' }}>Question Types</h4>
              {questionStats.questionsByType?.map((type, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--secondary-700)' }}>{type.type}</span>
                  <span style={{ fontWeight: '600', color: 'var(--primary-600)' }}>{type.count}</span>
                </div>
              )) || (
                <div style={{ color: 'var(--secondary-600)', textAlign: 'center', padding: '20px' }}>
                  No type data available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReportContent = () => {
    switch (reportType) {
      case 'overview':
        return renderOverviewReport();
      case 'users':
        return renderUserReport();
      case 'exams':
        return renderExamReport();
      case 'questions':
        return renderQuestionReport();
      default:
        return renderOverviewReport();
    }
  };

  const getExportFormatDescription = (format) => {
    switch (format) {
      case 'pdf':
        return 'Download as PDF document';
      case 'excel':
        return 'Download as Excel (.xlsx) file';
      case 'csv':
        return 'Download as CSV file';
      default:
        return 'Export report';
    }
  };

  const getActualDateRange = () => {
    if (dateRange === 'custom' && customDateRange.start && customDateRange.end) {
      return `${customDateRange.start} to ${customDateRange.end}`;
    }
    
    const now = new Date();
    switch (dateRange) {
      case '7d':
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return `${sevenDaysAgo.toISOString().split('T')[0]} to ${now.toISOString().split('T')[0]}`;
      case '30d':
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return `${thirtyDaysAgo.toISOString().split('T')[0]} to ${now.toISOString().split('T')[0]}`;
      case '90d':
        const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        return `${ninetyDaysAgo.toISOString().split('T')[0]} to ${now.toISOString().split('T')[0]}`;
      case '1y':
        const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        return `${oneYearAgo.toISOString().split('T')[0]} to ${now.toISOString().split('T')[0]}`;
      default:
        return dateRange;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="data-table-container">
        <div className="data-table-header">
          <h2 className="data-table-title">Reports & Analytics</h2>
          <div className="data-table-actions">
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--secondary-300)',
                borderRadius: '6px',
                marginRight: '12px'
              }}
            >
              <option value="overview">Overview Report</option>
              <option value="users">User Report</option>
              <option value="exams">Exam Report</option>
              <option value="questions">Question Report</option>
            </select>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--secondary-300)',
                borderRadius: '6px',
                marginRight: '12px'
              }}
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
            
            {/* Custom Date Range Inputs */}
            {dateRange === 'custom' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '12px' }}>
                <input
                  type="date"
                  value={customDateRange.start}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                  style={{
                    padding: '6px 8px',
                    border: '1px solid var(--secondary-300)',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                  placeholder="Start Date"
                />
                <span style={{ color: 'var(--secondary-600)', fontSize: '12px' }}>to</span>
                <input
                  type="date"
                  value={customDateRange.end}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                  style={{
                    padding: '6px 8px',
                    border: '1px solid var(--secondary-300)',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                  placeholder="End Date"
                />
              </div>
            )}
            
            {/* Enhanced Export Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '12px' }}>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid var(--secondary-300)',
                  borderRadius: '6px',
                  minWidth: '120px'
                }}
                title={getExportFormatDescription(exportFormat)}
              >
                <option value="pdf">📄 PDF</option>
                <option value="excel">📊 Excel</option>
                <option value="csv">📋 CSV</option>
              </select>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--secondary-700)' }}>
                <input
                  type="checkbox"
                  checked={includeCharts}
                  onChange={(e) => setIncludeCharts(e.target.checked)}
                  style={{ margin: 0 }}
                />
                Include Charts
              </label>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--secondary-700)' }}>
                <input
                  type="checkbox"
                  checked={includeRawData}
                  onChange={(e) => setIncludeRawData(e.target.checked)}
                  style={{ margin: 0 }}
                />
                Include Raw Data
              </label>
              
              <button 
                className="btn btn-primary"
                onClick={handleExportReport}
                disabled={exportReportMutation.isLoading}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  minWidth: '140px',
                  justifyContent: 'center'
                }}
                title={`Export ${reportType} report as ${exportFormat.toUpperCase()}`}
              >
                <FiDownload size={16} />
                {exportReportMutation.isLoading ? 'Exporting...' : `Export ${exportFormat.toUpperCase()}`}
              </button>
            </div>
          </div>
        </div>
        
        {/* Export Preview */}
        <div style={{ 
          background: 'var(--primary-50)', 
          border: '1px solid var(--primary-200)', 
          borderRadius: '8px', 
          padding: '16px', 
          marginTop: '16px',
          fontSize: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <FiDownload size={16} style={{ color: 'var(--primary-600)' }} />
            <strong style={{ color: 'var(--primary-700)' }}>Export Preview</strong>
          </div>
          <div style={{ color: 'var(--primary-600)' }}>
            <strong>Format:</strong> {exportFormat.toUpperCase()} • 
            <strong>Report:</strong> {reportType.charAt(0).toUpperCase() + reportType.slice(1)} • 
            <strong>Period:</strong> {getActualDateRange()} • 
            <strong>Charts:</strong> {includeCharts ? 'Included' : 'Not included'} • 
            <strong>Raw Data:</strong> {includeRawData ? 'Included' : 'Not included'}
          </div>
          <div style={{ color: 'var(--primary-600)', fontSize: '12px', marginTop: '4px' }}>
            {getExportFormatDescription(exportFormat)}
          </div>
        </div>
        
        {/* Export Statistics */}
        <div style={{ 
          background: 'var(--secondary-50)', 
          border: '1px solid var(--secondary-200)', 
          borderRadius: '8px', 
          padding: '16px', 
          marginTop: '12px',
          fontSize: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <FiBarChart2 size={16} style={{ color: 'var(--secondary-600)' }} />
            <strong style={{ color: 'var(--secondary-700)' }}>Data Summary</strong>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary-600)' }}>
                {stats.totalUsers || 0}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--secondary-600)' }}>Users</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--success-600)' }}>
                {stats.totalExams || 0}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--secondary-600)' }}>Exams</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--warning-600)' }}>
                {stats.totalQuestions || 0}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--secondary-600)' }}>Questions</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--danger-600)' }}>
                {stats.totalAttempts || 0}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--secondary-600)' }}>Attempts</div>
            </div>
          </div>
          <div style={{ 
            marginTop: '12px', 
            paddingTop: '12px', 
            borderTop: '1px solid var(--secondary-200)', 
            fontSize: '12px', 
            color: 'var(--secondary-600)',
            textAlign: 'center'
          }}>
            Export will include {reportType === 'overview' ? 'all data' : `${reportType} specific data`} for the selected period
          </div>
        </div>
      </div>

      {/* Report Content */}
      {renderReportContent()}

      {/* Report Summary */}
      <div className="chart-container" style={{ marginTop: '32px' }}>
        <div className="chart-header">
          <h3 className="chart-title">Report Summary</h3>
        </div>
        <div className="chart-content">
          <div style={{ background: 'white', borderRadius: '8px', padding: '16px', border: '1px solid var(--secondary-200)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <div style={{ textAlign: 'center', padding: '20px', background: 'white', borderRadius: '12px', border: '1px solid var(--secondary-200)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                  <FiUsers size={28} style={{ color: 'var(--primary-600)' }} />
                </div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary-600)', marginBottom: '8px' }}>
                  {stats.totalUsers || 0}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--secondary-600)', fontWeight: '500' }}>Total Users</div>
              </div>
              <div style={{ textAlign: 'center', padding: '20px', background: 'white', borderRadius: '12px', border: '1px solid var(--secondary-200)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                  <FiFileText size={28} style={{ color: 'var(--success-600)' }} />
                </div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--success-600)', marginBottom: '8px' }}>
                  {stats.totalExams || 0}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--secondary-600)', fontWeight: '500' }}>Total Exams</div>
              </div>
              <div style={{ textAlign: 'center', padding: '20px', background: 'white', borderRadius: '12px', border: '1px solid var(--secondary-200)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                  <FiHelpCircle size={28} style={{ color: 'var(--warning-600)' }} />
                </div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--warning-600)', marginBottom: '8px' }}>
                  {stats.totalQuestions || 0}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--secondary-600)', fontWeight: '500' }}>Total Questions</div>
              </div>
              <div style={{ textAlign: 'center', padding: '20px', background: 'white', borderRadius: '12px', border: '1px solid var(--secondary-200)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                  <FiBarChart2 size={28} style={{ color: 'var(--danger-600)' }} />
                </div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--danger-600)', marginBottom: '8px' }}>
                  {stats.totalAttempts || 0}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--secondary-600)', fontWeight: '500' }}>Total Attempts</div>
              </div>
            </div>
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--secondary-200)', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', color: 'var(--secondary-600)' }}>
                Report generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports; 