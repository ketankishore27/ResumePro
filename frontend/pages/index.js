import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Box, Typography, Button, Grid, Card, CardContent, TextField, Input, Stack,
  LinearProgress, Paper, Chip, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Divider, CircularProgress
} from '@mui/material';
import { Phone, Email } from '@mui/icons-material';
import Image from 'next/image';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { usePdfText } from '../src/context/PdfTextContext';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

export default function Home() {
  const [resumeFile, setResumeFile] = useState(null);
  const [description, setDescription] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [userJobRole, setUserJobRole] = useState('');
  const [showInsights, setShowInsights] = useState(false);
  const [pdfText, setPdfTextLocal] = useState('');
  
  // Insights state variables
  const [resumeScore, setResumeScore] = useState(null);
  const [loadingScore, setLoadingScore] = useState(false);
  const [resumeItems, setResumeItems] = useState([]);
  const [contactInfo, setContactInfo] = useState({ mobile_number: '', email_id: '', color: '', comment: '' });
  const [loadingContact, setLoadingContact] = useState(false);
  const [summaryInfo, setSummaryInfo] = useState({ score: 0, color: 'red', label: 'critical', comment: 'Loading summary analysis...', summary: [] });
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [customScores, setCustomScores] = useState({ searchibility_score: 0, hard_skills_score: 0, soft_skill_score: 0, formatting_score: 0 });
  const [loadingCustomScores, setLoadingCustomScores] = useState(false);
  const [otherComments, setOtherComments] = useState({ headings_feedback: '', title_match: '', formatting_feedback: '' });
  const [loadingOtherComments, setLoadingOtherComments] = useState(false);
  const [functionalConstituent, setFunctionalConstituent] = useState({ constituent: {}, industries: [], has_industry_experience: false, has_completed_college: false });
  const [loadingFunctionalConstituent, setLoadingFunctionalConstituent] = useState(false);
  const [technicalConstituent, setTechnicalConstituent] = useState({ high: [], medium: [], low: [] });
  const [loadingTechnicalConstituent, setLoadingTechnicalConstituent] = useState(false);
  const [educationHistory, setEducationHistory] = useState([]);
  const [loadingEducation, setLoadingEducation] = useState(false);
  const [employmentHistory, setEmploymentHistory] = useState([]);
  const [loadingEmployment, setLoadingEmployment] = useState(false);
  const [projectsInfo, setProjectsInfo] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  
  const { setPdfText, setJobRole: setContextJobRole, setDescription: setContextDescription, userName, setUserName } = usePdfText();
  const router = require('next/router').useRouter ? require('next/router').useRouter() : require('next/router').default.useRouter();
  
  // Helper function to check if all data is loaded
  const isAllDataLoaded = () => {
    return !loadingScore && !loadingContact && !loadingSummary && 
           !loadingCustomScores && !loadingOtherComments && 
           !loadingFunctionalConstituent && !loadingTechnicalConstituent && 
           !loadingEducation && !loadingProjects && !loadingEmployment;
  };

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
      return {
        labels: ['No Data'],
        datasets: [{
          data: [1],
          backgroundColor: ['#e0e0e0'],
          borderColor: ['#bdbdbd'],
          borderWidth: 1,
        }]
      };
    }

    const labels = Object.keys(constituent);
    const data = labels.map(label => {
      const value = constituent[label];
      return typeof value === 'string' ? parseInt(value.replace('%', '')) : value;
    });

    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
    ];

    return {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors.slice(0, labels.length),
        borderColor: colors.slice(0, labels.length).map(color => color + '80'),
        borderWidth: 2,
      }]
    };
  };

  // Get position colors based on employment type
  const getPositionColor = (type) => {
    const colorMap = {
      'Permanent': '#4CAF50',
      'Intern': '#FF9800', 
      'Part Time': '#2196F3',
      'Contractual': '#9C27B0',
      'Non Permanent': '#F44336'
    };
    return colorMap[type] || '#757575';
  };

  // Helper function to validate and map colors for Material-UI components
  const getValidColor = (color) => {
    const validColors = ['default', 'primary', 'secondary', 'error', 'info', 'success', 'warning'];
    
    // Map common color names to valid MUI colors
    const colorMap = {
      'red': 'error',
      'green': 'success',
      'blue': 'primary',
      'orange': 'warning',
      'yellow': 'warning',
      'critical': 'error',
      'good': 'success',
      'excellent': 'success',
      'poor': 'error',
      'average': 'warning'
    };
    
    if (!color) return 'default';
    
    const lowerColor = color.toLowerCase();
    
    // Check if it's already a valid MUI color
    if (validColors.includes(lowerColor)) {
      return lowerColor;
    }
    
    // Check if we have a mapping for this color
    if (colorMap[lowerColor]) {
      return colorMap[lowerColor];
    }
    
    // Default fallback
    return 'default';
  };

  // PDF text extraction logic (without auto-navigation)
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    setResumeFile(file);
  };

  // API call functions
  const callAllAPIs = async (resumeText, jobRole) => {
    try {
      // Set all loading states to true
      setLoadingScore(true);
      setLoadingContact(true);
      setLoadingSummary(true);
      setLoadingCustomScores(true);
      setLoadingOtherComments(true);
      setLoadingFunctionalConstituent(true);
      setLoadingTechnicalConstituent(true);
      setLoadingEducation(true);
      setLoadingEmployment(true);
      setLoadingProjects(true);

      const apiCalls = [
        fetch('http://127.0.0.1:8000/scoreResume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeText, jobRole })
        }),
        fetch('http://127.0.0.1:8000/getContacts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeText })
        }),
        fetch('http://127.0.0.1:8000/getSummaryOverview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeText })
        }),
        fetch('http://127.0.0.1:8000/getCustomScores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeText })
        }),
        fetch('http://127.0.0.1:8000/getOtherComments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeText })
        }),
        fetch('http://127.0.0.1:8000/getFunctionalConstituent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeText })
        }),
        fetch('http://127.0.0.1:8000/getTechnicalConstituent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeText })
        }),
        fetch('http://127.0.0.1:8000/getEducation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeText })
        }),
        fetch('http://127.0.0.1:8000/getCompany', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeText })
        }),
        fetch('http://127.0.0.1:8000/getProjects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeText })
        })
      ];

      const results = await Promise.allSettled(apiCalls);

      // Process scoreResume
      if (results[0].status === 'fulfilled') {
        const scoreData = await results[0].value.json();
        setResumeScore(scoreData.score || 0);
        setResumeItems(scoreData.items || []);
      }
      setLoadingScore(false);

      // Process getContacts
      if (results[1].status === 'fulfilled') {
        const contactData = await results[1].value.json();
        setContactInfo(contactData);
      }
      setLoadingContact(false);

      // Process getSummaryOverview
      if (results[2].status === 'fulfilled') {
        const summaryData = await results[2].value.json();
        setSummaryInfo(summaryData);
      }
      setLoadingSummary(false);

      // Process getCustomScores
      if (results[3].status === 'fulfilled') {
        try {
          const customData = await results[3].value.json();
          console.log('Custom Scores API Response:', customData);
          console.log('Custom Scores API Response Type:', typeof customData);
          console.log('Custom Scores API Response Keys:', Object.keys(customData || {}));
          console.log('Custom Scores Values:', {
            searchibility_score: customData.searchibility_score,
            hard_skills_score: customData.hard_skills_score,
            soft_skill_score: customData.soft_skill_score,
            formatting_score: customData.formatting_score
          });
          setCustomScores(customData);
        } catch (error) {
          console.error('Error processing custom scores data:', error);
          setCustomScores({ searchibility_score: 0, hard_skills_score: 0, soft_skill_score: 0, formatting_score: 0 });
        }
      } else {
        console.error('Custom Scores API call failed:', results[3].reason);
        setCustomScores({ searchibility_score: 0, hard_skills_score: 0, soft_skill_score: 0, formatting_score: 0 });
      }
      setLoadingCustomScores(false);

      // Process getOtherComments
      if (results[4].status === 'fulfilled') {
        const otherData = await results[4].value.json();
        setOtherComments(otherData);
      }
      setLoadingOtherComments(false);

      // Process getFunctionalConstituent
      if (results[5].status === 'fulfilled') {
        const functionalData = await results[5].value.json();
        setFunctionalConstituent(functionalData);
      }
      setLoadingFunctionalConstituent(false);

      // Process getTechnicalConstituent
      if (results[6].status === 'fulfilled') {
        const technicalData = await results[6].value.json();
        setTechnicalConstituent(technicalData);
      }
      setLoadingTechnicalConstituent(false);

      // Process getEducation
      if (results[7].status === 'fulfilled') {
        try {
          const educationData = await results[7].value.json();
          console.log('Education API Response:', educationData);
          console.log('Education API Response Type:', typeof educationData);
          console.log('Education API Response Keys:', Object.keys(educationData || {}));
          
          // Handle different response formats
          if (Array.isArray(educationData)) {
            console.log('Education: Setting as array with length:', educationData.length);
            setEducationHistory(educationData);
          } else if (educationData && educationData.education) {
            console.log('Education: Found nested education property');
            setEducationHistory(Array.isArray(educationData.education) ? educationData.education : [educationData.education]);
          } else if (educationData && educationData.data) {
            console.log('Education: Found nested data property');
            setEducationHistory(Array.isArray(educationData.data) ? educationData.data : [educationData.data]);
          } else if (educationData && typeof educationData === 'object' && Object.keys(educationData).length > 0) {
            console.log('Education: Converting single object to array');
            setEducationHistory([educationData]);
          } else {
            console.log('Education: No valid data found, setting empty array');
            setEducationHistory([]);
          }
        } catch (error) {
          console.error('Error processing education data:', error);
          setEducationHistory([]);
        }
      } else {
        console.error('Education API call failed:', results[7].reason);
        setEducationHistory([]);
      }
      setLoadingEducation(false);

      // Process getCompany
      if (results[8].status === 'fulfilled') {
        try {
          const companyData = await results[8].value.json();
          console.log('Employment API Response:', companyData);
          console.log('Employment API Response Type:', typeof companyData);
          console.log('Employment API Response Keys:', Object.keys(companyData || {}));
          
          // Handle different response formats
          if (Array.isArray(companyData)) {
            console.log('Employment: Setting as array with length:', companyData.length);
            setEmploymentHistory(companyData);
          } else if (companyData && companyData.employment_history) {
            console.log('Employment: Found nested employment_history property');
            setEmploymentHistory(Array.isArray(companyData.employment_history) ? companyData.employment_history : [companyData.employment_history]);
          } else if (companyData && companyData.employment) {
            console.log('Employment: Found nested employment property');
            setEmploymentHistory(Array.isArray(companyData.employment) ? companyData.employment : [companyData.employment]);
          } else if (companyData && companyData.companies) {
            console.log('Employment: Found nested companies property');
            setEmploymentHistory(Array.isArray(companyData.companies) ? companyData.companies : [companyData.companies]);
          } else if (companyData && companyData.data) {
            console.log('Employment: Found nested data property');
            setEmploymentHistory(Array.isArray(companyData.data) ? companyData.data : [companyData.data]);
          } else if (companyData && typeof companyData === 'object' && Object.keys(companyData).length > 0) {
            console.log('Employment: Converting single object to array');
            setEmploymentHistory([companyData]);
          } else {
            console.log('Employment: No valid data found, setting empty array');
            setEmploymentHistory([]);
          }
        } catch (error) {
          console.error('Error processing employment data:', error);
          setEmploymentHistory([]);
        }
      } else {
        console.error('Employment API call failed:', results[8].reason);
        setEmploymentHistory([]);
      }
      setLoadingEmployment(false);

      // Process getProjects
      if (results[9].status === 'fulfilled') {
        try {
          const projectsData = await results[9].value.json();
          console.log('Projects API Response:', projectsData);
          console.log('Projects API Response Type:', typeof projectsData);
          console.log('Projects API Response Keys:', Object.keys(projectsData || {}));
          
          // Handle different response formats
          if (Array.isArray(projectsData)) {
            console.log('Projects: Setting as array with length:', projectsData.length);
            setProjectsInfo(projectsData);
          } else if (projectsData && projectsData.projects) {
            console.log('Projects: Found nested projects property');
            setProjectsInfo(Array.isArray(projectsData.projects) ? projectsData.projects : [projectsData.projects]);
          } else if (projectsData && projectsData.data) {
            console.log('Projects: Found nested data property');
            setProjectsInfo(Array.isArray(projectsData.data) ? projectsData.data : [projectsData.data]);
          } else if (projectsData && typeof projectsData === 'object' && Object.keys(projectsData).length > 0) {
            console.log('Projects: Converting single object to array');
            setProjectsInfo([projectsData]);
          } else {
            console.log('Projects: No valid data found, setting empty array');
            setProjectsInfo([]);
          }
        } catch (error) {
          console.error('Error processing projects data:', error);
          setProjectsInfo([]);
        }
      } else {
        console.error('Projects API call failed:', results[9].reason);
        setProjectsInfo([]);
      }
      setLoadingProjects(false);

    } catch (error) {
      console.error('Error calling APIs:', error);
      // Set all loading states to false on error
      setLoadingScore(false);
      setLoadingContact(false);
      setLoadingSummary(false);
      setLoadingCustomScores(false);
      setLoadingOtherComments(false);
      setLoadingFunctionalConstituent(false);
      setLoadingTechnicalConstituent(false);
      setLoadingEducation(false);
      setLoadingEmployment(false);
      setLoadingProjects(false);
    }
  };

  // Handle submit with both resume and job role
  const handleSubmitInsights = async () => {
    if (!resumeFile) {
      alert('Please select a resume file first.');
      return;
    }
    if (!userJobRole.trim()) {
      alert('Please enter your job role.');
      return;
    }

    if (resumeFile && resumeFile.type === 'application/pdf') {
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
        setPdfTextLocal(text);
        setShowInsights(true);
        // Call all APIs with the extracted text
        await callAllAPIs(text, userJobRole);
      };
      fileReader.readAsArrayBuffer(resumeFile);
    }
  };

  // Handle submit request for cover letter generation
  const handleSubmitRequest = async () => {
    if (!resumeFile) {
      alert('Please select a resume file first.');
      return;
    }
    if (!description.trim()) {
      alert('Please describe your resume needs or questions.');
      return;
    }

    if (resumeFile && resumeFile.type === 'application/pdf') {
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
        setPdfText(text);
        setContextDescription(description);
        router.push('/cover-letter');
      };
      fileReader.readAsArrayBuffer(resumeFile);
    }
  };

  // Helper function to get dynamic colors based on score
  const getScoreColor = (score) => {
    if (score >= 80) return '#4CAF50'; // Green for excellent scores
    if (score >= 60) return '#FF9800'; // Orange for good scores  
    if (score >= 40) return '#FFC107'; // Yellow for average scores
    return '#F44336'; // Red for low scores
  };

  // Function to clear all analysis data and return to landing page
  const handleClearAnalysis = () => {
    // Reset all state variables to initial values
    setShowInsights(false);
    setResumeScore(null);
    setResumeItems([]);
    setContactInfo({});
    setSummaryInfo({});
    setCustomScores({});
    setOtherComments({});
    setFunctionalConstituent({});
    setTechnicalConstituent({});
    setEducationHistory([]);
    setEmploymentHistory([]);
    setProjectsInfo([]);
    setPdfTextLocal('');
    
    // Reset loading states
    setLoadingScore(false);
    setLoadingContact(false);
    setLoadingSummary(false);
    setLoadingCustomScores(false);
    setLoadingOtherComments(false);
    setLoadingFunctionalConstituent(false);
    setLoadingTechnicalConstituent(false);
    setLoadingEducation(false);
    setLoadingEmployment(false);
    setLoadingProjects(false);
    
    // Clear user information from "Enter Your Information" area
    setUserName('');
    setUserJobRole('');
    setResumeFile(null);
    
    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Remove default handleResumeSubmit, let upload trigger navigation

  return (
    <Box sx={{ background: '#f7faff', minHeight: '100vh', pb: 8 }}>
      {/* Navbar-like Header */}
      <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: 0.5 }}>
            Resume<span style={{ color: '#2563eb' }}>Pro</span>
          </Typography>
          <Button 
            variant="outlined" 
            color="primary" 
            sx={{ fontWeight: 600, borderRadius: 2, textTransform: 'none' }}
            onClick={() => router.push('/bulk-import')}
          >
            Bulk Import
          </Button>
        </Box>
        <Button 
          variant="contained" 
          color="success" 
          sx={{ fontWeight: 700, borderRadius: 2 }}
          onClick={() => {
            const requestSection = document.getElementById('resume-requests-section');
            if (requestSection) {
              requestSection.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          Get Feedback
        </Button>
      </Box>

      {/* Hero Section */}
      <Box sx={{ background: '#e7f0ff', borderRadius: 4, mt: 4, mb: 6, mx: 'auto', maxWidth: 1200, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', p: { xs: 3, md: 6 }, gap: { xs: 4, md: 0 } }}>
        <Box sx={{ flex: 1, px: { xs: 0, md: 3 } }}>
          <Typography variant="h3" fontWeight={700} gutterBottom>
            Professional <span style={{ color: '#2563eb' }}>Resume Services</span>
          </Typography>
          <Typography sx={{ color: '#333', fontSize: 18, mb: 2 }}>
            Upload your resume for instant insights, search stored resumes for job fit, and request personalized feedback — all in one place.
          </Typography>
        </Box>
        <Box sx={{ flex: 1, textAlign: 'center' }}>
          <Image
            src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=600&q=80"
            alt="Resume Illustration"
            width={340}
            height={220}
            style={{ borderRadius: 16, objectFit: 'cover' }}
          />
        </Box>
      </Box>

      {/* User Information Section */}
      <Box sx={{ maxWidth: 1200, mx: 'auto', mb: 4, px: 3 }}>
        <Typography variant="h5" fontWeight={700} align="center" gutterBottom sx={{ mb: 3 }}>
          Enter Your Information
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <TextField
              placeholder="Enter your full name"
              variant="outlined"
              fullWidth
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              sx={{ bgcolor: '#fff' }}
              label="Name"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              placeholder="Enter your job role (e.g., Software Engineer)"
              variant="outlined"
              fullWidth
              value={userJobRole}
              onChange={(e) => setUserJobRole(e.target.value)}
              sx={{ bgcolor: '#fff' }}
              label="Job Role"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <input
              accept=".pdf,.doc,.docx,.txt"
              style={{ display: 'none' }}
              id="main-resume-upload"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="main-resume-upload">
              <Button 
                variant="contained" 
                color="primary" 
                component="span" 
                fullWidth
                sx={{ fontWeight: 700, py: 1.5, borderRadius: 2, height: '56px' }}
              >
                {resumeFile ? resumeFile.name : 'Choose PDF or Word File'}
              </Button>
            </label>
          </Grid>
        </Grid>
        
        {/* GET INSIGHTS Button - Centered */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 2 }}>
          <Button 
            variant="contained" 
            color="success" 
            disabled={!resumeFile || !userJobRole.trim()}
            onClick={handleSubmitInsights}
            sx={{ 
              fontWeight: 700, 
              py: 1.5, 
              px: 4,
              borderRadius: 2, 
              height: '56px',
              minWidth: '200px'
            }}
          >
            GET INSIGHTS
          </Button>
        </Box>
      </Box>

      {/* Insights Section - Only show when analysis is triggered */}
      {showInsights && (
        <Box sx={{ maxWidth: 1400, mx: 'auto', px: 3, mt: 4 }}>           
          <Grid container spacing={3}>
            {/* Left Sidebar */}
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 1, mb: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Resume Score
                </Typography>
                {loadingScore ? (
                  <CircularProgress size={24} />
                ) : (
                  <Typography variant="h3" fontWeight={700} color="primary">
                    {resumeScore || 0}%
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Target Role: {userJobRole}
                </Typography>
              </Paper>

              {/* Detailed Scores with Contact Information */}
              <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 1, mb: 3 }}>
                {/* Detailed Scores Section */}
                <Box sx={{ mb: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="body1" fontWeight={600} gutterBottom sx={{ color: '#333' }}>
                        Searchability
                      </Typography>
                      {loadingCustomScores ? (
                        <CircularProgress size={20} />
                      ) : (
                        <Box sx={{ 
                          height: 12, 
                          backgroundColor: '#f0f0f0', 
                          borderRadius: 6, 
                          overflow: 'hidden',
                          mb: 0.5
                        }}>
                          <Box sx={{
                            height: '100%',
                            width: `${customScores.searchibility_score || 0}%`,
                            backgroundColor: getScoreColor(customScores.searchibility_score || 0),
                            borderRadius: 6,
                            transition: 'width 0.3s ease, background-color 0.3s ease'
                          }} />
                        </Box>
                      )}
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body1" fontWeight={600} gutterBottom sx={{ color: '#333' }}>
                        Hard Skills
                      </Typography>
                      {loadingCustomScores ? (
                        <CircularProgress size={20} />
                      ) : (
                        <Box sx={{ 
                          height: 12, 
                          backgroundColor: '#f0f0f0', 
                          borderRadius: 6, 
                          overflow: 'hidden',
                          mb: 0.5
                        }}>
                          <Box sx={{
                            height: '100%',
                            width: `${customScores.hard_skills_score || 0}%`,
                            backgroundColor: getScoreColor(customScores.hard_skills_score || 0),
                            borderRadius: 6,
                            transition: 'width 0.3s ease, background-color 0.3s ease'
                          }} />
                        </Box>
                      )}
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body1" fontWeight={600} gutterBottom sx={{ color: '#333' }}>
                        Soft Skills
                      </Typography>
                      {loadingCustomScores ? (
                        <CircularProgress size={20} />
                      ) : (
                        <Box sx={{ 
                          height: 12, 
                          backgroundColor: '#f0f0f0', 
                          borderRadius: 6, 
                          overflow: 'hidden',
                          mb: 0.5
                        }}>
                          <Box sx={{
                            height: '100%',
                            width: `${customScores.soft_skill_score || 0}%`,
                            backgroundColor: getScoreColor(customScores.soft_skill_score || 0),
                            borderRadius: 6,
                            transition: 'width 0.3s ease, background-color 0.3s ease'
                          }} />
                        </Box>
                      )}
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body1" fontWeight={600} gutterBottom sx={{ color: '#333' }}>
                        Formatting
                      </Typography>
                      {loadingCustomScores ? (
                        <CircularProgress size={20} />
                      ) : (
                        <Box sx={{ 
                          height: 12, 
                          backgroundColor: '#f0f0f0', 
                          borderRadius: 6, 
                          overflow: 'hidden',
                          mb: 0.5
                        }}>
                          <Box sx={{
                            height: '100%',
                            width: `${customScores.formatting_score || 0}%`,
                            backgroundColor: getScoreColor(customScores.formatting_score || 0),
                            borderRadius: 6,
                            transition: 'width 0.3s ease, background-color 0.3s ease'
                          }} />
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                </Box>

                {/* Contact Information Section */}
                <Box sx={{ 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: 2, 
                  p: 2.5,
                  border: '1px solid #e9ecef'
                }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ textAlign: 'center', mb: 2 }}>
                    Contact Information
                  </Typography>
                  {loadingContact ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : (
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Phone sx={{ mr: 2, fontSize: 20, color: '#666' }} />
                        <Box>
                          <Typography variant="body2" fontWeight={600} sx={{ color: '#333' }}>
                            Phone:
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: contactInfo.mobile_number ? 'normal' : 'italic' }}>
                            {contactInfo.mobile_number || 'Not found'}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Email sx={{ mr: 2, fontSize: 20, color: '#666' }} />
                        <Box>
                          <Typography variant="body2" fontWeight={600} sx={{ color: '#333' }}>
                            Email:
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: contactInfo.email_id ? 'normal' : 'italic' }}>
                            {contactInfo.email_id || 'Not found'}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Paper>

              {/* Functional Exposure */}
              <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 1, mb: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Functional Exposure
                </Typography>
                {loadingFunctionalConstituent ? (
                  <CircularProgress size={24} />
                ) : (
                  <Box sx={{ height: 200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Pie 
                      data={createFunctionalData(functionalConstituent.constituent)}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                          },
                        },
                      }}
                    />
                  </Box>
                )}
              </Paper>

              {/* Technical Exposure */}
              <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 1 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Technical Exposure
                </Typography>
                {loadingTechnicalConstituent ? (
                  <CircularProgress size={24} />
                ) : (
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#4CAF50', mb: 1 }}>
                        High
                      </Typography>
                      <Box sx={{ 
                        p: 3, 
                        backgroundColor: '#f1f8e9', 
                        borderRadius: 2, 
                        minHeight: 100,
                        border: '2px solid #4CAF50',
                        mb: 2
                      }}>
                        {technicalConstituent.high.length > 0 ? (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {technicalConstituent.high.map((skill, index) => (
                              <Chip 
                                key={index} 
                                label={skill} 
                                size="small" 
                                variant="outlined"
                                sx={{ 
                                  fontSize: '0.75rem',
                                  borderColor: '#4CAF50',
                                  color: '#2E7D32',
                                  backgroundColor: 'white'
                                }}
                              />
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            No high relevance skills
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#FF9800', mb: 1 }}>
                        Medium
                      </Typography>
                      <Box sx={{ 
                        p: 3, 
                        backgroundColor: '#fff8e1', 
                        borderRadius: 2, 
                        minHeight: 100,
                        border: '2px solid #FF9800',
                        mb: 2
                      }}>
                        {technicalConstituent.medium.length > 0 ? (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {technicalConstituent.medium.map((skill, index) => (
                              <Chip 
                                key={index} 
                                label={skill} 
                                size="small" 
                                variant="outlined"
                                sx={{ 
                                  fontSize: '0.75rem',
                                  borderColor: '#FF9800',
                                  color: '#E65100',
                                  backgroundColor: 'white'
                                }}
                              />
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            No medium relevance skills
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#F44336', mb: 1 }}>
                        Low
                      </Typography>
                      <Box sx={{ 
                        p: 3, 
                        backgroundColor: '#ffebee', 
                        borderRadius: 2, 
                        minHeight: 100,
                        border: '2px solid #F44336'
                      }}>
                        {technicalConstituent.low.length > 0 ? (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {technicalConstituent.low.map((skill, index) => (
                              <Chip 
                                key={index} 
                                label={skill} 
                                size="small" 
                                variant="outlined"
                                sx={{ 
                                  fontSize: '0.75rem',
                                  borderColor: '#F44336',
                                  color: '#C62828',
                                  backgroundColor: 'white'
                                }}
                              />
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            No low relevance skills
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                )}
              </Paper>
            </Grid>

            {/* Main Content */}
            <Grid item xs={12} md={9}>
              {/* Summary Analysis */}
              <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 1, mb: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Summary
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  AI-powered analysis of your resume summary section and overall presentation.
                </Typography>
{loadingSummary ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CircularProgress size={20} />
                    <Typography variant="body2" color="text.secondary">
                      Loading summary analysis...
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    {/* Summary Content Section */}
                    {summaryInfo.summary && Array.isArray(summaryInfo.summary) && summaryInfo.summary.length > 0 && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ color: '#333' }}>
                          Resume Summary
                        </Typography>
                        <Box sx={{ 
                          backgroundColor: '#f8f9fa',
                          p: 3,
                          borderRadius: 2,
                          border: '1px solid #e9ecef',
                          mb: 2
                        }}>
                          {summaryInfo.summary.map((summaryPoint, index) => (
                            <Typography 
                              key={index} 
                              variant="body2" 
                              sx={{ 
                                mb: index < summaryInfo.summary.length - 1 ? 1.5 : 0,
                                lineHeight: 1.6,
                                color: '#333'
                              }}
                            >
                              • {summaryPoint}
                            </Typography>
                          ))}
                        </Box>
                      </Box>
                    )}
                    
                    {/* Summary Quality Section */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Summary Quality:
                      </Typography>
                      <Chip 
                        label={summaryInfo.label || 'Loading...'} 
                        color={getValidColor(summaryInfo.color)}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Score: {summaryInfo.score || 0}/100
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.primary" sx={{ 
                      backgroundColor: '#f5f5f5',
                      p: 2,
                      borderRadius: 1,
                      border: '1px solid #e0e0e0'
                    }}>
                      {summaryInfo.comment || 'Analyzing summary...'}
                    </Typography>
                  </Box>
                )}
              </Paper>

              {/* Projects */}
              <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 1, mb: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Projects
                </Typography>
                {loadingProjects ? (
                  <CircularProgress size={24} />
                ) : (
                  <Grid container spacing={3}>
                    {projectsInfo && projectsInfo.length > 0 ? (
                      projectsInfo.map((project, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <Box sx={{ 
                            p: 3, 
                            border: '1px solid #e0e0e0', 
                            borderRadius: 2, 
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            backgroundColor: '#fff',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                            '&:hover': {
                              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                              transform: 'translateY(-2px)',
                              transition: 'all 0.3s ease'
                            }
                          }}>
                            {/* Project Title */}
                            <Typography variant="h6" fontWeight={600} sx={{ mb: 1.5, color: '#333' }}>
                              {project.title || project.project_name || 'Untitled Project'}
                            </Typography>
                            
                            {/* Project Description */}
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.5, flexGrow: 1 }}>
                              {project.description || project.project_description || 'No description available'}
                            </Typography>
                            
                            {/* Technologies Section */}
                            {project.technologies && (
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" fontWeight={600} sx={{ color: '#666', mb: 1, display: 'block' }}>
                                  Technologies:
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                  {Array.isArray(project.technologies) ? (
                                    project.technologies.map((tech, techIndex) => (
                                      <Chip 
                                        key={techIndex}
                                        label={tech}
                                        size="small"
                                        variant="outlined"
                                        sx={{ 
                                          fontSize: '0.7rem',
                                          height: 24,
                                          borderColor: '#2563eb',
                                          color: '#2563eb',
                                          backgroundColor: '#f0f4ff'
                                        }}
                                      />
                                    ))
                                  ) : (
                                    <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                      {project.technologies || 'Not specified'}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            )}
                            
                            {/* AI Analysis Section */}
                            {project.comment && (
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" fontWeight={600} sx={{ color: '#666', mb: 1, display: 'block' }}>
                                  AI Analysis:
                                </Typography>
                                <Typography variant="body2" sx={{ 
                                  fontSize: '0.8rem',
                                  backgroundColor: '#f8f9fa',
                                  p: 1.5,
                                  borderRadius: 1,
                                  border: '1px solid #e9ecef',
                                  lineHeight: 1.4,
                                  color: '#555'
                                }}>
                                  {project.comment}
                                </Typography>
                              </Box>
                            )}
                            
                            {/* Score and Stage Section */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                              <Chip 
                                label={`Score: ${project.score || project.project_score || 0}%`}
                                size="small"
                                color={(project.score || project.project_score || 0) >= 80 ? 'success' : (project.score || project.project_score || 0) >= 60 ? 'warning' : 'error'}
                                sx={{ fontWeight: 600 }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                Stage: {project.stage || project.project_stage || 'Not specified'}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      ))
                    ) : (
                      <Grid item xs={12}>
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                            No projects found in resume.
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Upload a resume to see project analysis and recommendations.
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                )}
              </Paper>

              {/* Resume Fixes */}
              <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 1, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Typography variant="h6" fontWeight={600}>
                    Resume Fixes
                  </Typography>
                  <Chip 
                    label="IMPORTANT" 
                    size="small" 
                    sx={{ 
                      backgroundColor: '#e0e0e0', 
                      color: '#666', 
                      fontWeight: 600,
                      fontSize: '0.7rem'
                    }} 
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  These are the key fixes and optimization recommended for your resume to improve your chances with recruiters and ATS systems.
                </Typography>
                
                {(loadingScore || loadingOtherComments || loadingContact) ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell sx={{ fontWeight: 600, width: '20%' }}>Check</TableCell>
                          <TableCell sx={{ fontWeight: 600, width: '15%' }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 600, width: '65%' }}>Details</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {/* ATS Tips Row */}
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500 }}>ATS Tips</TableCell>
                          <TableCell>
                            <Chip 
                              label={resumeItems.length > 0 ? "Pending" : "Pending"}
                              size="small"
                              sx={{ 
                                backgroundColor: '#e0e0e0',
                                color: '#666',
                                fontWeight: 600
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            {resumeItems.length > 0 ? (
                              <Box>
                                {resumeItems.map((item, index) => (
                                  <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                                    • {item}
                                  </Typography>
                                ))}
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                Upload a resume to get personalized ATS feedback.
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                        
                        {/* Contact Row */}
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500 }}>Contact</TableCell>
                          <TableCell>
                            <Chip 
                              label={contactInfo.mobile_number && contactInfo.email_id ? "Good" : "Issue"}
                              size="small"
                              sx={{ 
                                backgroundColor: contactInfo.mobile_number && contactInfo.email_id ? '#4caf50' : '#f44336',
                                color: 'white',
                                fontWeight: 600
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {contactInfo.mobile_number && contactInfo.email_id 
                                ? `Contact information found: ${contactInfo.email_id}${contactInfo.mobile_number ? `, ${contactInfo.mobile_number}` : ''}` 
                                : 'Missing or incomplete contact information. Ensure phone number and email are clearly visible.'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        
                        {/* Section Headings Row */}
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500 }}>Section Headings</TableCell>
                          <TableCell>
                            <Chip 
                              label="Good"
                              size="small"
                              sx={{ 
                                backgroundColor: '#4caf50',
                                color: 'white',
                                fontWeight: 600
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {otherComments.headings_feedback || 'Section headings are properly structured and ATS-friendly.'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        
                        {/* Job Title Match Row */}
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500 }}>Job Title Match</TableCell>
                          <TableCell>
                            <Chip 
                              label="Good"
                              size="small"
                              sx={{ 
                                backgroundColor: '#4caf50',
                                color: 'white',
                                fontWeight: 600
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {otherComments.title_match || 'Job titles and experience align well with target roles.'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        
                        {/* Data Formatting Row */}
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500 }}>Data Formatting</TableCell>
                          <TableCell>
                            <Chip 
                              label="Good"
                              size="small"
                              sx={{ 
                                backgroundColor: '#4caf50',
                                color: 'white',
                                fontWeight: 600
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {otherComments.formatting_feedback || 'Resume formatting is clean and ATS-compatible.'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>

              {/* Professional Timeline */}
              <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 1, mb: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Career Growth
                </Typography>
                {loadingEmployment ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Box sx={{ mt: 3 }}>
                    {employmentHistory && employmentHistory.length > 0 ? (
                      <Box sx={{ position: 'relative', padding: '100px 20px' }}>
                        {/* Timeline Line */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '40px',
                            right: '40px',
                            height: '8px',
                            background: 'linear-gradient(90deg, #ff9800, #9c27b0, #2196f3, #4caf50, #f44336)',
                            borderRadius: '4px',
                            zIndex: 1,
                            transform: 'translateY(-50%)'
                          }}
                        />
                        
                        {/* Career Positions */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', height: '300px' }}>
                          {employmentHistory
                            .sort((a, b) => (a.start_year || 0) - (b.start_year || 0)) // Sort chronologically
                            .map((job, index) => {
                              const colors = [
                                { main: '#FF9800', bg: '#FFF3E0', text: '#E65100' }, // Orange
                                { main: '#9C27B0', bg: '#F3E5F5', text: '#6A1B9A' }, // Purple
                                { main: '#2196F3', bg: '#E3F2FD', text: '#1565C0' }, // Blue
                                { main: '#4CAF50', bg: '#E8F5E8', text: '#2E7D32' }, // Green
                                { main: '#F44336', bg: '#FFEBEE', text: '#C62828' }  // Red
                              ];
                              const color = colors[index % colors.length];
                              const isAbove = index % 2 === 0;
                              const isCurrentJob = job.end_year === 'Currently Working' || job.end_year === 'Present';
                              
                              return (
                                <Box
                                  key={index}
                                  sx={{
                                    position: 'relative',
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    height: '100%',
                                    justifyContent: 'center'
                                  }}
                                >
                                  {/* Year Circle - Always on the timeline */}
                                  <Box
                                    sx={{
                                      position: 'absolute',
                                      top: '50%',
                                      left: '50%',
                                      transform: 'translate(-50%, -50%)',
                                      width: '50px',
                                      height: '50px',
                                      borderRadius: '50%',
                                      border: `2px solid white`,
                                      backgroundColor: color.main,
                                      boxShadow: `0 0 0 2px ${color.main}, 0 2px 8px rgba(0,0,0,0.15)`,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontWeight: 'bold',
                                      fontSize: '12px',
                                      color: 'white',
                                      zIndex: 3
                                    }}
                                  >
                                    {isCurrentJob ? 'Now' : (job.start_year || 'N/A')}
                                    {isCurrentJob && (
                                      <Box sx={{
                                        position: 'absolute',
                                        top: -3,
                                        right: -3,
                                        width: 14,
                                        height: 14,
                                        borderRadius: '50%',
                                        backgroundColor: '#4CAF50',
                                        border: '3px solid white'
                                      }} />
                                    )}
                                  </Box>

                                  {/* Position Card - Alternating above/below */}
                                  <Box
                                    sx={{
                                      position: 'absolute',
                                      top: isAbove ? '-70px' : 'auto',
                                      bottom: isAbove ? 'auto' : '-70px',
                                      left: '50%',
                                      transform: 'translateX(-50%)',
                                      minWidth: 160,
                                      maxWidth: 180,
                                      backgroundColor: color.bg,
                                      border: `1px solid ${color.main}`,
                                      borderRadius: 3,
                                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                      zIndex: 2,
                                      padding: 1.5
                                    }}
                                  >
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ 
                                      color: color.text, 
                                      mb: 0.5,
                                      fontSize: '0.8rem',
                                      textAlign: 'center'
                                    }}>
                                      {job.position || job.job_title || 'Position not specified'}
                                    </Typography>
                                    
                                    <Typography variant="body2" color="text.secondary" sx={{ 
                                      mb: 0.5,
                                      fontSize: '0.7rem',
                                      textAlign: 'center',
                                      lineHeight: 1.2
                                    }}>
                                      {job.company || job.company_name || 'Company not specified'}
                                    </Typography>
                                    
                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                                      <Chip 
                                        label={`${job.start_year || 'N/A'} - ${isCurrentJob ? 'Present' : (job.end_year || 'N/A')}`}
                                        size="small"
                                        sx={{ 
                                          backgroundColor: color.main,
                                          color: 'white',
                                          fontSize: '0.65rem',
                                          fontWeight: 'bold'
                                        }}
                                      />
                                      {isCurrentJob && (
                                        <Chip
                                          label="Current"
                                          size="small"
                                          sx={{
                                            backgroundColor: '#4caf50',
                                            color: 'white',
                                            fontSize: '0.65rem',
                                            fontWeight: 'bold'
                                          }}
                                        />
                                      )}
                                    </Box>

                                    {/* Arrow pointing to year circle */}
                                    <Box
                                      sx={{
                                        position: 'absolute',
                                        [isAbove ? 'bottom' : 'top']: '-8px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        width: 0,
                                        height: 0,
                                        borderLeft: '8px solid transparent',
                                        borderRight: '8px solid transparent',
                                        [isAbove ? 'borderTop' : 'borderBottom']: `8px solid ${color.main}`
                                      }}
                                    />
                                  </Box>

                                  {/* Position Type Label */}
                                  <Typography variant="caption" sx={{ 
                                    position: 'absolute',
                                    [isAbove ? 'top' : 'bottom']: '-10px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    color: color.text, 
                                    fontWeight: 600,
                                    fontSize: '0.65rem',
                                    textAlign: 'center',
                                    whiteSpace: 'nowrap'
                                  }}>
                                    {job.employment_type || job.job_type || 'Full-time'}
                                  </Typography>
                                </Box>
                              );
                            })
                          }
                        </Box>
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          No employment history found in resume.
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </Paper>

              {/* Education History */}
              <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 1, mb: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Education Timeline
                </Typography>
                {loadingEducation ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Box sx={{ mt: 3 }}>
                    {educationHistory && educationHistory.length > 0 ? (
                      <Box sx={{ position: 'relative', padding: '100px 20px' }}>
                        {/* Timeline Line */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '40px',
                            right: '40px',
                            height: '8px',
                            background: 'linear-gradient(90deg, #ff9800, #9c27b0, #2196f3, #4caf50, #f44336)',
                            borderRadius: '4px',
                            zIndex: 1,
                            transform: 'translateY(-50%)'
                          }}
                        />

                        {/* Education Items */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', height: '200px' }}>
                          {educationHistory
                            .sort((a, b) => {
                              const yearA = (a.start_year || a.from_year) ? parseInt(a.start_year || a.from_year) : 0;
                              const yearB = (b.start_year || b.from_year) ? parseInt(b.start_year || b.from_year) : 0;
                              return yearA - yearB;
                            })
                            .map((education, index) => {
                              const colors = [
                                { main: '#FF9800', bg: '#FFF3E0', text: '#E65100' }, // Orange
                                { main: '#9C27B0', bg: '#F3E5F5', text: '#6A1B9A' }, // Purple
                                { main: '#2196F3', bg: '#E3F2FD', text: '#1565C0' }, // Blue
                                { main: '#4CAF50', bg: '#E8F5E8', text: '#2E7D32' }, // Green
                                { main: '#F44336', bg: '#FFEBEE', text: '#C62828' }  // Red
                              ];
                              const color = colors[index % colors.length];
                              const isAbove = index % 2 === 0;
                              const currentYear = new Date().getFullYear();
                              const isOngoing = (education.end_year === 'ongoing' || education.to_year === 'ongoing') || 
                                               ((education.end_year || education.to_year) && parseInt(education.end_year || education.to_year) > currentYear);

                              return (
                                <Box
                                  key={index}
                                  sx={{
                                    position: 'relative',
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    height: '100%',
                                    justifyContent: 'center'
                                  }}
                                >
                                  {/* Year Circle - Always on the timeline */}
                                  <Box
                                    sx={{
                                      position: 'absolute',
                                      top: '50%',
                                      left: '50%',
                                      transform: 'translate(-50%, -50%)',
                                      width: '50px',
                                      height: '50px',
                                      borderRadius: '50%',
                                      border: `2px solid white`,
                                      backgroundColor: color.main,
                                      boxShadow: `0 0 0 2px ${color.main}, 0 2px 8px rgba(0,0,0,0.15)`,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontWeight: 'bold',
                                      fontSize: '12px',
                                      color: 'white',
                                      zIndex: 3
                                    }}
                                  >
                                    {isOngoing ? 'Now' : (education.end_year || education.to_year || education.start_year || education.from_year || 'N/A')}
                                    {isOngoing && (
                                      <Box sx={{
                                        position: 'absolute',
                                        top: -3,
                                        right: -3,
                                        width: 14,
                                        height: 14,
                                        borderRadius: '50%',
                                        backgroundColor: '#4CAF50',
                                        border: '3px solid white'
                                      }} />
                                    )}
                                  </Box>

                                  {/* Education Card - Alternating above/below */}
                                  <Box
                                    sx={{
                                      position: 'absolute',
                                      top: isAbove ? '-70px' : 'auto',
                                      bottom: isAbove ? 'auto' : '-70px',
                                      left: '50%',
                                      transform: 'translateX(-50%)',
                                      minWidth: 160,
                                      maxWidth: 180,
                                      backgroundColor: color.bg,
                                      border: `1px solid ${color.main}`,
                                      borderRadius: 3,
                                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                      zIndex: 2,
                                      padding: 1.5
                                    }}
                                  >
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ 
                                      color: color.text, 
                                      mb: 0.5,
                                      fontSize: '0.8rem',
                                      textAlign: 'center'
                                    }}>
                                      {education.degree || education.education_level || education.qualification || 'Degree not specified'}
                                    </Typography>
                                    
                                    <Typography variant="body2" color="text.secondary" sx={{ 
                                      mb: 0.5,
                                      fontSize: '0.7rem',
                                      textAlign: 'center',
                                      lineHeight: 1.2
                                    }}>
                                      {education.institution || education.school || education.university || 'Institution not specified'}
                                    </Typography>
                                    
                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                                      <Chip 
                                        label={`${education.start_year || education.from_year || 'N/A'} - ${isOngoing ? 'Present' : (education.end_year || education.to_year || 'N/A')}`}
                                        size="small"
                                        sx={{ 
                                          backgroundColor: color.main,
                                          color: 'white',
                                          fontSize: '0.65rem',
                                          fontWeight: 'bold'
                                        }}
                                      />
                                      {isOngoing && (
                                        <Chip
                                          label="Current"
                                          size="small"
                                          sx={{
                                            backgroundColor: '#4caf50',
                                            color: 'white',
                                            fontSize: '0.65rem',
                                            fontWeight: 'bold'
                                          }}
                                        />
                                      )}
                                    </Box>

                                    {/* Arrow pointing to year circle */}
                                    <Box
                                      sx={{
                                        position: 'absolute',
                                        [isAbove ? 'bottom' : 'top']: '-8px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        width: 0,
                                        height: 0,
                                        borderLeft: '8px solid transparent',
                                        borderRight: '8px solid transparent',
                                        [isAbove ? 'borderTop' : 'borderBottom']: `8px solid ${color.main}`
                                      }}
                                    />
                                  </Box>
                                </Box>
                              );
                            })
                          }
                        </Box>
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          No education history found in resume.
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
          
          {/* Save Resume Button - Outside Grid for proper centering */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            gap: 2, 
            mt: 4,
            mb: 3,
            width: '100%'
          }}>
            <Button
              variant="outlined"
              color="error"
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 2,
                borderColor: '#f44336',
                color: '#f44336',
                '&:hover': {
                  backgroundColor: '#f44336',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)'
                }
              }}
              onClick={handleClearAnalysis}
            >
              Clear
            </Button>
            
            <Button
              variant="contained"
              color="primary"
              size="large"
              disabled={!isAllDataLoaded()}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 2,
                backgroundColor: isAllDataLoaded() ? 'primary.main' : 'grey.400',
                '&:hover': {
                  boxShadow: isAllDataLoaded() ? '0 6px 16px rgba(0,0,0,0.2)' : 'none'
                },
                '&:disabled': {
                  backgroundColor: 'grey.400',
                  color: 'grey.600'
                }
              }}
              onClick={async () => {
                console.log('Save Resume clicked');
                
                try {
                  // Accumulate all results from the web services
                  const accumulatedData = {
                    "input_data": {
                      name: userName || 'Not provided',
                      resume_text: pdfText || '',
                      job_role: userJobRole || 'Not provided'
                    },
                    "mode": "Manual",
                    "getContacts": {
                      mobile_number: contactInfo.mobile_number,
                      email_id: contactInfo.email_id,
                      color: contactInfo.color,
                      comment: contactInfo.comment
                    },
                    "getCustomScores": {
                      searchibility_score: customScores.searchibility_score,
                      hard_skills_score: customScores.hard_skills_score,
                      soft_skill_score: customScores.soft_skill_score,
                      formatting_score: customScores.formatting_score
                    },
                    "getSummaryOverview": {
                      score: summaryInfo.score,
                      color: summaryInfo.color,
                      label: summaryInfo.label,
                      comment: summaryInfo.comment,
                      summary: summaryInfo.summary
                    },
                    "getFunctionalConstituent": {
                      constituent: functionalConstituent.constituent,
                      industries: functionalConstituent.industries,
                      has_industry_experience: functionalConstituent.has_industry_experience,
                      has_completed_college: functionalConstituent.has_completed_college
                    },
                    "getOtherComments": {
                      headings_feedback: otherComments.headings_feedback,
                      title_match: otherComments.title_match,
                      formatting_feedback: otherComments.formatting_feedback
                    },
                    "getEducation": educationHistory,
                    "scoreResume": {
                      score: resumeScore,
                      items: resumeItems
                    },
                    "getCompany": employmentHistory,
                    "getProjects": projectsInfo,
                    "getTechnicalConstituent": technicalConstituent,
                    "getFunctionalConstituent": functionalConstituent
                  };
                  
                  console.log('Accumulated data for save:', accumulatedData);
                  
                  const response = await fetch('http://127.0.0.1:8000/assembleData', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(accumulatedData)
                  });
                  
                  if (response.ok) {
                    const result = await response.json();
                    console.log('Save Resume response:', result);
                    alert('Resume data saved successfully!');
                  } else {
                    console.error('Failed to save resume data:', response.status);
                    alert('Failed to save resume data. Please try again.');
                  }
                  
                } catch (error) {
                  console.error('Error saving resume data:', error);
                  alert('Error saving resume data. Please try again.');
                }
              }}
            >
              {isAllDataLoaded() ? 'Save Resume' : 'Loading Analysis...'}
            </Button>
          </Box>
        </Box>
      )}

    </Box>
  );
}
