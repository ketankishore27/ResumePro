import React, { useState, useEffect } from 'react';
import { Box, Typography, LinearProgress, Grid, Paper, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Divider, Button, CircularProgress } from '@mui/material';
import { Phone, Email } from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);



const technicalData = {
  labels: ['Python', 'SQL', 'JavaScript'],
  datasets: [
    {
      label: 'Technical Exposure',
      data: [50, 30, 20],
      backgroundColor: [
        'rgba(76, 175, 80, 0.7)',
        'rgba(255, 152, 0, 0.7)',
        'rgba(244, 67, 54, 0.7)'
      ],
      borderColor: [
        'rgba(76, 175, 80, 1)',
        'rgba(255, 152, 0, 1)',
        'rgba(244, 67, 54, 1)'
      ],
      borderWidth: 1,
    },
  ],
};

import { usePdfText } from '../src/context/PdfTextContext';



export default function ResumeInsights() {
  // Access the extracted PDF text and job role from context
  const { pdfText, jobRole, setPdfText } = usePdfText();
  
  // Debug context values
  console.log('ResumeInsights component loaded');
  console.log('pdfText from context:', pdfText ? `Available (${pdfText.length} chars)` : 'Not available');
  console.log('jobRole from context:', jobRole || 'Not available');
  const [resumeScore, setResumeScore] = useState(null);
  const [loadingScore, setLoadingScore] = useState(false);
  const [scoreError, setScoreError] = useState(null);
  const [newResumeFile, setNewResumeFile] = useState(null);
  const [resumeItems, setResumeItems] = useState([]);
  const [contactInfo, setContactInfo] = useState({ mobile_number: '', email_id: '', color: '', comment: '' });
  const [loadingContact, setLoadingContact] = useState(false);
  const [summaryInfo, setSummaryInfo] = useState({ score: 0, color: 'red', label: 'critical', comment: 'Loading summary analysis...' });
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [customScores, setCustomScores] = useState({ searchibility_score: 0, hard_skills_score: 0, soft_skill_score: 0, formatting_score: 0 });
  const [loadingCustomScores, setLoadingCustomScores] = useState(false);
  const [otherComments, setOtherComments] = useState({ headings_feedback: '', title_match: '', formatting_feedback: '' });
  const [loadingOtherComments, setLoadingOtherComments] = useState(false);
  const [functionalConstituent, setFunctionalConstituent] = useState({ constituent: {}, industries: [], has_industry_experience: false, has_completed_college: false });
  const [loadingFunctionalConstituent, setLoadingFunctionalConstituent] = useState(false);

  // Helper function to determine progress bar color based on score
  const getProgressColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'primary';
    if (score >= 40) return 'warning';
    return 'error';
  };

  // Helper function to transform functional constituent data to pie chart format
  const createFunctionalData = (constituent) => {
    if (!constituent || Object.keys(constituent).length === 0) {
      // Return default data when no data is available
      return {
        labels: ['No Data'],
        datasets: [
          {
            label: 'Functional Exposure',
            data: [100],
            backgroundColor: ['rgba(158, 158, 158, 0.7)'],
            borderColor: ['rgba(158, 158, 158, 1)'],
            borderWidth: 1,
          },
        ],
      };
    }

    const labels = Object.keys(constituent);
    const data = Object.values(constituent).map(value => parseInt(value.replace('%', '')));
    
    // Generate colors for each industry
    const colors = [
      'rgba(33, 150, 243, 0.7)',   // Blue
      'rgba(76, 175, 80, 0.7)',    // Green
      'rgba(255, 193, 7, 0.7)',    // Amber
      'rgba(156, 39, 176, 0.7)',   // Purple
      'rgba(255, 87, 34, 0.7)',    // Deep Orange
      'rgba(0, 188, 212, 0.7)',    // Cyan
      'rgba(139, 195, 74, 0.7)',   // Light Green
      'rgba(255, 152, 0, 0.7)',    // Orange
      'rgba(121, 85, 72, 0.7)',    // Brown
      'rgba(96, 125, 139, 0.7)',   // Blue Grey
    ];
    
    const borderColors = [
      'rgba(33, 150, 243, 1)',
      'rgba(76, 175, 80, 1)',
      'rgba(255, 193, 7, 1)',
      'rgba(156, 39, 176, 1)',
      'rgba(255, 87, 34, 1)',
      'rgba(0, 188, 212, 1)',
      'rgba(139, 195, 74, 1)',
      'rgba(255, 152, 0, 1)',
      'rgba(121, 85, 72, 1)',
      'rgba(96, 125, 139, 1)',
    ];

    return {
      labels,
      datasets: [
        {
          label: 'Functional Exposure',
          data,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: borderColors.slice(0, labels.length),
          borderWidth: 1,
        },
      ],
    };
  };

  // Chart options for displaying data labels on pie chart
  const functionalChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
      datalabels: {
        display: true,
        color: '#666666',
        font: {
          weight: 'bold',
          size: 7,
          family: 'Arial, sans-serif',
        },
        formatter: (value, context) => {
          // Show percentage outside the pie slice
          return value + '%';
        },
        anchor: 'end',
        align: 'start',
        offset: 10,
        borderColor: '#666666',
        borderWidth: 1,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: 4,
      },
    },
  };
  useEffect(() => {
    console.log('useEffect triggered - pdfText:', pdfText ? 'Available' : 'Not available');
    console.log('useEffect triggered - jobRole:', jobRole ? jobRole : 'Not available');
    if (!pdfText) {
      console.log('No pdfText available, skipping API calls');
      return;
    }
    setLoadingScore(true);
    setLoadingContact(true);
    setLoadingSummary(true);
    setLoadingCustomScores(true);
    setLoadingOtherComments(true);
    setLoadingFunctionalConstituent(true);
    setScoreError(null);
    console.log(pdfText);
    console.log(jobRole);
    
    // Send async independent requests
    console.log('Sending async independent requests...');
    
    // Request 1: Resume Scoring (async)
    console.log('Making scoreResume API call...');
    console.log('Resume text length:', pdfText ? pdfText.length : 0);
    console.log('Job role:', jobRole);
    const scoreRequest = fetch('http://127.0.0.1:5000/scoreResume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeText: pdfText, jobRole: jobRole }),
    })
      .then(res => {
        console.log('ScoreResume response status:', res.status);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Received score response:', data);
        setResumeScore(data.score);
        setResumeItems(data.items || []);
        setLoadingScore(false);
      })
      .catch(err => {
        console.error('Failed to fetch score:', err);
        console.error('Score API error details:', err.message);
        setScoreError('Failed to fetch score');
        setLoadingScore(false);
      });
    
    // Request 2: Contact Information (async)
    const contactRequest = fetch('http://127.0.0.1:5000/getContacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeText: pdfText, jobRole: jobRole }),
    })
      .then(res => res.json())
      .then(data => {
        console.log('Received contact response:', data);
        setContactInfo({
          mobile_number: data.mobile_number || '',
          email_id: data.email_id || '',
          color: data.color || 'red',
          comment: data.comment || 'Contact information not available'
        });
        setLoadingContact(false);
      })
      .catch(err => {
        console.error('Failed to fetch contact info:', err);
        console.error('Contact API error details:', err.message);
        setContactInfo({ 
          mobile_number: '', 
          email_id: '', 
          color: 'red', 
          comment: 'Failed to extract contact information' 
        });
        setLoadingContact(false);
      });
    
    // Request 3: Summary Overview (async)
    const summaryRequest = fetch('http://127.0.0.1:5000/getSummaryOverview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeText: pdfText, jobRole: jobRole }),
    })
      .then(res => res.json())
      .then(data => {
        console.log('Received summary response:', data);
        setSummaryInfo({
          score: data.score || 0,
          color: data.color || 'red',
          label: data.label || 'critical',
          comment: data.comment || 'Summary analysis not available'
        });
        setLoadingSummary(false);
      })
      .catch(err => {
        console.error('Failed to fetch summary info:', err);
        console.error('Summary API error details:', err.message);
        setSummaryInfo({ 
          score: 0,
          color: 'red', 
          label: 'critical',
          comment: 'Failed to analyze summary section' 
        });
        setLoadingSummary(false);
      });
    
    // Request 4: Custom Scores (async)
    const customScoresRequest = fetch('http://127.0.0.1:5000/getCustomScores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeText: pdfText, jobRole: jobRole }),
    })
      .then(res => res.json())
      .then(data => {
        console.log('Received custom scores response:', data);
        setCustomScores({
          searchibility_score: data.searchibility_score || 0,
          hard_skills_score: data.hard_skills_score || 0,
          soft_skill_score: data.soft_skill_score || 0,
          formatting_score: data.formatting_score || 0
        });
        setLoadingCustomScores(false);
      })
      .catch(err => {
        console.error('Failed to fetch custom scores:', err);
        console.error('Custom scores API error details:', err.message);
        setCustomScores({ 
          searchibility_score: 0,
          hard_skills_score: 0,
          soft_skill_score: 0,
          formatting_score: 0
        });
        setLoadingCustomScores(false);
      });
    
    // Request 5: Other Comments (async)
    const otherCommentsRequest = fetch('http://127.0.0.1:5000/getOtherComments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeText: pdfText, jobRole: jobRole }),
    })
      .then(res => res.json())
      .then(data => {
        console.log('Received other comments response:', data);
        setOtherComments({
          headings_feedback: data.headings_feedback || 'Section headings analysis not available',
          title_match: data.title_match || 'Job title match analysis not available',
          formatting_feedback: data.formatting_feedback || 'Data formatting analysis not available'
        });
        setLoadingOtherComments(false);
      })
      .catch(err => {
        console.error('Failed to fetch other comments:', err);
        console.error('Other comments API error details:', err.message);
        setOtherComments({ 
          headings_feedback: 'Failed to analyze section headings',
          title_match: 'Failed to analyze job title match',
          formatting_feedback: 'Failed to analyze data formatting'
        });
        setLoadingOtherComments(false);
      });
    
    // Request 6: Functional Constituent (async)
    console.log('Making functional constituent API call...');
    const functionalConstituentRequest = fetch('http://127.0.0.1:5000/getFunctionalConstituent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeText: pdfText, jobRole: jobRole }),
    })
      .then(res => {
        console.log('Functional constituent response status:', res.status);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Received functional constituent response:', data);
        console.log('Constituent data:', data.constituent);
        setFunctionalConstituent({
          constituent: data.constituent || {},
          industries: data.industries || [],
          has_industry_experience: data.has_industry_experience || false,
          has_completed_college: data.has_completed_college || false
        });
        setLoadingFunctionalConstituent(false);
      })
      .catch(err => {
        console.error('Failed to fetch functional constituent:', err);
        console.error('Functional constituent API error details:', err.message);
        // Set some test data for debugging
        setFunctionalConstituent({ 
          constituent: {
            "IT": "60%",
            "Banking": "25%",
            "Consulting": "15%"
          },
          industries: ["IT", "Banking", "Consulting"],
          has_industry_experience: true,
          has_completed_college: true
        });
        setLoadingFunctionalConstituent(false);
      });
    
    // Optional: Log when all requests complete
    Promise.allSettled([scoreRequest, contactRequest, summaryRequest, customScoresRequest, otherCommentsRequest, functionalConstituentRequest]).then((results) => {
      console.log('All async requests completed:', results);
    });
  }, [pdfText]);

  // Note: Both resume scoring and contact information are fetched via async independent requests

  // Handle new resume upload and re-scan
  const handleReupload = async (e) => {
    const file = e.target.files[0];
    setNewResumeFile(file);
    
    if (file && file.type === 'application/pdf') {
      setLoadingScore(true);
      setLoadingContact(true);
      setLoadingSummary(true);
      setLoadingCustomScores(true);
      setLoadingOtherComments(true);
      setLoadingFunctionalConstituent(true);
      setScoreError(null);
      
      const pdfjsLib = await import('pdfjs-dist/build/pdf');
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
      const fileReader = new FileReader();
      
      fileReader.onload = async function () {
        const typedarray = new Uint8Array(this.result);
        const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
        let text = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map(item => item.str).join(' ') + '\n';
        }
        
        // Update the context with new PDF text
        setPdfText(text);
        
        // Send async independent requests for re-upload
        console.log('Sending async independent requests for re-upload...');
        
        // Request 1: Resume Scoring (async)
        const reuploadScoreRequest = fetch('http://127.0.0.1:5000/scoreResume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeText: text, jobRole: jobRole }),
        })
          .then(res => res.json())
          .then(data => {
            console.log('Received re-upload score response:', data);
            setResumeScore(data.score);
            setResumeItems(data.items || []);
            setLoadingScore(false);
          })
          .catch(err => {
            console.error('Failed to fetch score for re-upload:', err);
            setScoreError('Failed to fetch score');
            setLoadingScore(false);
          });
        
        // Request 2: Contact Information (async)
        const reuploadContactRequest = fetch('http://127.0.0.1:5000/getContacts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeText: text, jobRole: jobRole }),
        })
          .then(res => res.json())
          .then(data => {
            console.log('Received re-upload contact response:', data);
            setContactInfo({
              mobile_number: data.mobile_number || '',
              email_id: data.email_id || '',
              color: data.color || 'red',
              comment: data.comment || 'Contact information not available'
            });
            setLoadingContact(false);
          })
          .catch(err => {
            console.error('Failed to fetch contact info for re-upload:', err);
            setContactInfo({ 
              mobile_number: '', 
              email_id: '', 
              color: 'red', 
              comment: 'Failed to extract contact information' 
            });
            setLoadingContact(false);
          });
        
        // Request 3: Summary Overview for re-upload (async)
        const reuploadSummaryRequest = fetch('http://127.0.0.1:5000/getSummaryOverview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeText: text, jobRole: jobRole }),
        })
          .then(res => res.json())
          .then(data => {
            console.log('Received re-upload summary response:', data);
            setSummaryInfo({
              score: data.score || 0,
              color: data.color || 'red',
              label: data.label || 'critical',
              comment: data.comment || 'Summary analysis not available'
            });
            setLoadingSummary(false);
          })
          .catch(err => {
            console.error('Failed to fetch summary info for re-upload:', err);
            setSummaryInfo({ 
              score: 0,
              color: 'red', 
              label: 'critical',
              comment: 'Failed to analyze summary section' 
            });
            setLoadingSummary(false);
          });
        
        // Request 4: Custom Scores for re-upload (async)
        const reuploadCustomScoresRequest = fetch('http://127.0.0.1:5000/getCustomScores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeText: text, jobRole: jobRole }),
        })
          .then(res => res.json())
          .then(data => {
            console.log('Received re-upload custom scores response:', data);
            setCustomScores({
              searchibility_score: data.searchibility_score || 0,
              hard_skills_score: data.hard_skills_score || 0,
              soft_skill_score: data.soft_skill_score || 0,
              formatting_score: data.formatting_score || 0
            });
            setLoadingCustomScores(false);
          })
          .catch(err => {
            console.error('Failed to fetch custom scores for re-upload:', err);
            setCustomScores({ 
              searchibility_score: 0,
              hard_skills_score: 0,
              soft_skill_score: 0,
              formatting_score: 0
            });
            setLoadingCustomScores(false);
          });
        
        // Request 5: Other Comments for re-upload (async)
        const reuploadOtherCommentsRequest = fetch('http://127.0.0.1:5000/getOtherComments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeText: text, jobRole: jobRole }),
        })
          .then(res => res.json())
          .then(data => {
            console.log('Received re-upload other comments response:', data);
            setOtherComments({
              headings_feedback: data.headings_feedback || 'Section headings analysis not available',
              title_match: data.title_match || 'Job title match analysis not available',
              formatting_feedback: data.formatting_feedback || 'Data formatting analysis not available'
            });
            setLoadingOtherComments(false);
          })
          .catch(err => {
            console.error('Failed to fetch other comments for re-upload:', err);
            setOtherComments({ 
              headings_feedback: 'Failed to analyze section headings',
              title_match: 'Failed to analyze job title match',
              formatting_feedback: 'Failed to analyze data formatting'
            });
            setLoadingOtherComments(false);
          });
        
        // Request 6: Functional Constituent for re-upload (async)
        const reuploadFunctionalConstituentRequest = fetch('http://127.0.0.1:5000/getFunctionalConstituent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeText: text, jobRole: jobRole }),
        })
          .then(res => res.json())
          .then(data => {
            console.log('Received re-upload functional constituent response:', data);
            setFunctionalConstituent({
              constituent: data.constituent || {},
              industries: data.industries || [],
              has_industry_experience: data.has_industry_experience || false,
              has_completed_college: data.has_completed_college || false
            });
            setLoadingFunctionalConstituent(false);
          })
          .catch(err => {
            console.error('Failed to fetch functional constituent for re-upload:', err);
            setFunctionalConstituent({ 
              constituent: {},
              industries: [],
              has_industry_experience: false,
              has_completed_college: false
            });
            setLoadingFunctionalConstituent(false);
          });
        
        // Optional: Log when all re-upload requests complete
        Promise.allSettled([reuploadScoreRequest, reuploadContactRequest, reuploadSummaryRequest, reuploadCustomScoresRequest, reuploadOtherCommentsRequest, reuploadFunctionalConstituentRequest]).then((results) => {
          console.log('All re-upload async requests completed:', results);
        });
      };
      
      fileReader.readAsArrayBuffer(file);
    }
  };

  // Create dynamic functional data
  const functionalData = createFunctionalData(functionalConstituent.constituent);
  
  return (
    <Box sx={{ background: '#f7faff', minHeight: '100vh' }}>
      {/* Navigation Bar */}
      <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: 0.5 }}>
          Resume<span style={{ color: '#2563eb' }}>Pro</span> - Insights
        </Typography>
        <Button 
          component={Link} 
          href="/" 
          variant="outlined" 
          color="primary" 
          sx={{ fontWeight: 700, borderRadius: 2 }}
        >
          ← Back to Home
        </Button>
      </Box>
      
      <Box sx={{ p: 4 }}>
      <Grid container spacing={3}>
        {/* Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
            <Typography variant="h4" color="success.main" fontWeight={700}>
              {loadingScore
                ? 'Loading...'
                : scoreError
                  ? scoreError
                  : resumeScore || '--'}
            </Typography>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Resume Score
            </Typography>
            {jobRole && (
              <Typography variant="body2" sx={{ mb: 1, fontStyle: 'italic', color: 'text.secondary' }}>
                Target Role: {jobRole}
              </Typography>
            )}
            <LinearProgress 
              variant="determinate" 
              value={resumeScore ? parseInt(resumeScore.replace('%', '')) : 0} 
              sx={{ height: 10, borderRadius: 5, mb: 3 }} 
              color={
                resumeScore 
                  ? parseInt(resumeScore.replace('%', '')) >= 80 
                    ? 'success' 
                    : parseInt(resumeScore.replace('%', '')) >= 60 
                    ? 'warning' 
                    : 'error'
                  : 'primary'
              } 
            />
            <input
              accept=".pdf,.doc,.docx,.txt"
              style={{ display: 'none' }}
              id="resume-reupload"
              type="file"
              onChange={handleReupload}
            />
            <label htmlFor="resume-reupload">
              <Chip 
                label={newResumeFile ? `Re-scan: ${newResumeFile.name}` : "Upload & re-scan"} 
                color="primary" 
                sx={{ width: '100%', mb: 2, cursor: 'pointer' }} 
                component="span"
                clickable
              />
            </label>
            <Box sx={{ textAlign: 'left', mt: 2 }}>
              <Typography variant="body2" fontWeight={700}>Searchability</Typography>
              <LinearProgress 
                variant="determinate" 
                value={loadingCustomScores ? 0 : customScores.searchibility_score} 
                sx={{ height: 8, borderRadius: 5, mb: 1 }} 
                color={getProgressColor(customScores.searchibility_score)} 
              />
              <Typography variant="body2" fontWeight={700}>Hard Skills</Typography>
              <LinearProgress 
                variant="determinate" 
                value={loadingCustomScores ? 0 : customScores.hard_skills_score} 
                sx={{ height: 8, borderRadius: 5, mb: 1 }} 
                color={getProgressColor(customScores.hard_skills_score)} 
              />
              <Typography variant="body2" fontWeight={700}>Soft Skills</Typography>
              <LinearProgress 
                variant="determinate" 
                value={loadingCustomScores ? 0 : customScores.soft_skill_score} 
                sx={{ height: 8, borderRadius: 5, mb: 1 }} 
                color={getProgressColor(customScores.soft_skill_score)} 
              />
              <Typography variant="body2" fontWeight={700}>Formatting</Typography>
              <LinearProgress 
                variant="determinate" 
                value={loadingCustomScores ? 0 : customScores.formatting_score} 
                sx={{ height: 8, borderRadius: 5, mb: 1 }} 
                color={getProgressColor(customScores.formatting_score)} 
              />
            </Box>
            
            {/* Contact Information Section */}
            <Box sx={{ mt: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 2, backgroundColor: '#fafafa' }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, color: 'text.primary' }}>
                Contact Information
              </Typography>
              
              {loadingContact ? (
                <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                  Extracting contact information...
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {/* Phone Number */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Phone sx={{ fontSize: 18, color: contactInfo.mobile_number ? 'success.main' : 'text.disabled' }} />
                    <Typography variant="body2" sx={{ fontWeight: 500, minWidth: '60px' }}>Phone:</Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: contactInfo.mobile_number ? 'text.primary' : 'text.disabled',
                        fontStyle: contactInfo.mobile_number ? 'normal' : 'italic'
                      }}
                    >
                      {contactInfo.mobile_number || 'Not found'}
                    </Typography>
                  </Box>
                  
                  {/* Email */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <Email sx={{ fontSize: 18, color: contactInfo.email_id ? 'success.main' : 'text.disabled', mt: 0.2 }} />
                    <Typography variant="body2" sx={{ fontWeight: 500, minWidth: '60px', mt: 0.2 }}>Email:</Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: contactInfo.email_id ? 'text.primary' : 'text.disabled',
                        fontStyle: contactInfo.email_id ? 'normal' : 'italic',
                        wordBreak: 'break-all',
                        overflowWrap: 'break-word',
                        flex: 1,
                        lineHeight: 1.4,
                        textAlign: 'left'
                      }}
                    >
                      {contactInfo.email_id || 'Not found'}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
        {/* Main Content */}
        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={700}>Resume Fixes <Chip label="IMPORTANT" size="small" color="default" sx={{ ml: 1 }} /></Typography>
            <Typography variant="body2" sx={{ my: 2 }}>
              These are the key fixes and optimization recommended for your resume to improve your chances with recruiters and ATS systems.
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Check</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Dynamic ATS Tips Section - Single Row */}
                  <TableRow sx={{ '& .MuiTableCell-root': { verticalAlign: 'top' } }}>
                    <TableCell>ATS Tips</TableCell>
                    <TableCell>
                      <Chip 
                        label={resumeItems.length > 0 ? "Suggestions" : (loadingScore ? "Loading" : "Pending")} 
                        color={resumeItems.length > 0 ? "warning" : (loadingScore ? "info" : "default")} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell sx={{ minHeight: '120px', py: 2 }}>
                      {resumeItems.length > 0 ? (
                        <Box component="ul" sx={{ margin: 0, paddingLeft: 2, listStyleType: 'disc' }}>
                          {resumeItems.map((item, index) => (
                            <Box component="li" key={index} sx={{ mb: 1, lineHeight: 1.4 }}>
                              <Typography variant="body2" component="span">
                                {item}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                          {loadingScore ? 'Loading personalized ATS suggestions...' : 'Upload a resume to get personalized ATS feedback.'}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                  
                  {/* Dynamic Contact section */}
                  <TableRow>
                    <TableCell>Contact</TableCell>
                    <TableCell>
                      <Chip 
                        label={loadingContact ? "Loading" : (contactInfo.color === 'green' ? "Good" : "Issue")} 
                        color={loadingContact ? "info" : (contactInfo.color === 'green' ? "success" : "error")} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      {loadingContact ? 'Analyzing contact information...' : contactInfo.comment}
                    </TableCell>
                  </TableRow>
                  
                  {/* Static sections */}
                  <TableRow>
                    <TableCell>Summary</TableCell>
                    <TableCell>
                      <Chip 
                        label={
                          summaryInfo.label === 'good' ? 'Good' : 
                          summaryInfo.label === 'warning' ? 'Warning' : 
                          'Critical'
                        } 
                        color={
                          summaryInfo.color === 'green' ? 'success' : 
                          summaryInfo.color === 'orange' ? 'warning' : 
                          summaryInfo.color === 'red' ? 'error' : 
                          'error'
                        } 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      {loadingSummary ? 'Analyzing summary section...' : summaryInfo.comment}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Section Headings</TableCell>
                    <TableCell><Chip label="Good" color="success" size="small" /></TableCell>
                    <TableCell>
                      {loadingOtherComments ? 'Analyzing section headings...' : otherComments.headings_feedback}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Job Title Match</TableCell>
                    <TableCell><Chip label="Good" color="success" size="small" /></TableCell>
                    <TableCell>
                      {loadingOtherComments ? 'Analyzing job title match...' : otherComments.title_match}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Data Formatting</TableCell>
                    <TableCell><Chip label="Good" color="success" size="small" /></TableCell>
                    <TableCell>
                      {loadingOtherComments ? 'Analyzing data formatting...' : otherComments.formatting_feedback}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>Functional Exposure</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                  {loadingFunctionalConstituent ? (
                    <CircularProgress />
                  ) : (
                    <Pie 
                      data={functionalData} 
                      options={functionalChartOptions}
                      style={{ maxHeight: '180px', maxWidth: '100%' }} 
                    />
                  )}
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>Technical Exposure</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                  <Pie data={technicalData} style={{ maxHeight: '180px', maxWidth: '100%' }} />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      </Box>
    </Box>
  );
}
