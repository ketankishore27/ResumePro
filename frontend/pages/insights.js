import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Box, Typography, LinearProgress, Grid, Paper, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Divider, Button, CircularProgress, Card, CardContent, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Skeleton, Tooltip, Snackbar, Alert, Zoom, Fab, Collapse, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Phone, Email, Check, ContentCopy, KeyboardArrowUp, WorkOutline, CheckCircle, Code } from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useTheme, alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';

ChartJS.register(ArcElement, ChartTooltip, Legend, ChartDataLabels);

// Define motion-wrapped components at module scope to preserve component identity across renders
const MotionPaper = motion.create(Paper);
const MotionCard = motion.create(Card);

import { usePdfText } from '../src/context/PdfTextContext';
import Navigation from '../src/components/Navigation';



// Reveal wrapper using IntersectionObserver + framer-motion spring
const Reveal = ({ children, variant = 'grow', threshold = 0.15, delay = 0 }) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect();
      }
    }, { threshold });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  const getTransition = (stiffness, damping, mass) => ({
    type: 'spring',
    stiffness,
    damping,
    mass,
    delay
  });

  const variants = useMemo(() => {
    switch (variant) {
      case 'fade':
        return {
          hidden: { opacity: 0, y: 12 },
          show: { 
            opacity: 1, 
            y: 0, 
            transition: getTransition(220, 28, 0.6)
          },
        };
      case 'slideUp':
        return {
          hidden: { opacity: 0, y: 40 },
          show: { 
            opacity: 1, 
            y: 0, 
            transition: getTransition(300, 32, 0.5)
          },
        };
      case 'slideLeft':
        return {
          hidden: { opacity: 0, x: 40 },
          show: { 
            opacity: 1, 
            x: 0, 
            transition: getTransition(280, 30, 0.5)
          },
        };
      case 'slideRight':
        return {
          hidden: { opacity: 0, x: -40 },
          show: { 
            opacity: 1, 
            x: 0, 
            transition: getTransition(280, 30, 0.5)
          },
        };
      case 'zoom':
        return {
          hidden: { opacity: 0, scale: 0.85 },
          show: { 
            opacity: 1, 
            scale: 1, 
            transition: getTransition(300, 32, 0.4)
          },
        };
      case 'flip':
        return {
          hidden: { opacity: 0, rotateX: 80 },
          show: { 
            opacity: 1, 
            rotateX: 0, 
            transition: getTransition(260, 26, 0.5)
          },
        };
      default: // 'grow' default case
        return {
          hidden: { opacity: 0, scale: 0.98, y: 8 },
          show: { 
            opacity: 1, 
            scale: 1, 
            y: 0, 
            transition: getTransition(260, 24, 0.6)
          },
        };
    }
  }, [variant, delay]);

  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? 'show' : 'hidden'} variants={variants}>
      {children}
    </motion.div>
  );
};

// Paper with built-in reveal using framer-motion spring
const RevealPaper = ({ children, variant = 'grow', threshold = 0.15, delay = 0, ...paperProps }) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    // Prevent animation from running on initial render to avoid blinking
    const timer = setTimeout(() => {
      if (!ref.current) return;
      
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          setHasAnimated(true);
          observer.disconnect();
        }
      }, { threshold, rootMargin: '50px' });
      
      observer.observe(ref.current);
      return () => {
        observer.disconnect();
        clearTimeout(timer);
      };
    }, 100); // Small delay to ensure component is fully mounted
    
    return () => clearTimeout(timer);
  }, [threshold]);

  const getTransition = (stiffness, damping, mass) => ({
    type: 'spring',
    stiffness,
    damping,
    mass,
    delay: hasAnimated ? 0 : delay, // Only apply delay on first animation
    restDelta: 0.001, // More precise animation end detection
    restSpeed: 0.001 // More precise animation end detection
  });

  const variants = useMemo(() => {
    switch (variant) {
      case 'fade':
        return {
          hidden: { opacity: 0, y: 12 },
          show: { 
            opacity: 1, 
            y: 0, 
            transition: getTransition(180, 26, 0.6)
          },
        };
      case 'slideUp':
        return {
          hidden: { opacity: 0, y: 20 }, // Reduced distance for smoother animation
          show: { 
            opacity: 1, 
            y: 0, 
            transition: getTransition(200, 28, 0.5)
          },
        };
      case 'slideLeft':
        return {
          hidden: { opacity: 0, x: 20 }, // Reduced distance for smoother animation
          show: { 
            opacity: 1, 
            x: 0, 
            transition: getTransition(200, 26, 0.5)
          },
        };
      case 'slideRight':
        return {
          hidden: { opacity: 0, x: -20 }, // Reduced distance for smoother animation
          show: { 
            opacity: 1, 
            x: 0, 
            transition: getTransition(200, 26, 0.5)
          },
        };
      case 'zoom':
        return {
          hidden: { opacity: 0, scale: 0.95 }, // Less extreme scale for smoother animation
          show: { 
            opacity: 1, 
            scale: 1, 
            transition: getTransition(200, 28, 0.4)
          },
        };
      case 'flip':
        return {
          hidden: { opacity: 0, rotateX: 40 }, // Less extreme rotation for smoother animation
          show: { 
            opacity: 1, 
            rotateX: 0, 
            transition: getTransition(180, 24, 0.5)
          },
        };
      default: // 'grow' default case
        return {
          hidden: { opacity: 0, scale: 0.98, y: 5 }, // Reduced distance for smoother animation
          show: { 
            opacity: 1, 
            scale: 1, 
            y: 0, 
            transition: getTransition(180, 22, 0.6)
          },
        };
    }
  }, [variant, delay, hasAnimated]);

  return (
    <MotionPaper
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      {...paperProps}
    >
      {children}
    </MotionPaper>
  );
};
export default function ResumeInsights() {
  // Access the extracted PDF text, job role, and user name from context
  const { pdfText, jobRole, setPdfText, userName, setUserName, setJobRole } = usePdfText();
  const router = useRouter();
  const theme = useTheme();
  
  // Get email_id from URL parameters
  const emailId = router.query.email_id;
  
  // Also check URL directly for email parameter to handle initial render
  const hasEmailInUrl = typeof window !== 'undefined' && window.location.search.includes('email_id=');
  
  // Debug context values - but show corrected values if email parameter is present
  console.log('ResumeInsights component loaded');
  console.log('Router ready:', router.isReady);
  console.log('Router emailId:', emailId);
  console.log('Router query object:', router.query);
  console.log('Current URL:', typeof window !== 'undefined' ? window.location.href : 'SSR');
  console.log('URL search params:', typeof window !== 'undefined' ? window.location.search : 'SSR');
  console.log('URL has email param:', hasEmailInUrl);
  
  // State declarations - must come before using them in context logic
  const [resumeScore, setResumeScore] = useState(null);
  const [loadingScore, setLoadingScore] = useState(false);
  const [scoreError, setScoreError] = useState(null);
  // newResumeFile state removed - upload & re-scan functionality removed
  const [resumeItems, setResumeItems] = useState([]);
  const [contactInfo, setContactInfo] = useState({ mobile_number: '', email_id: '', color: '', comment: '' });
  const [loadingContact, setLoadingContact] = useState(false);
  const [summaryInfo, setSummaryInfo] = useState({ score: 0, color: 'red', label: 'critical', comment: 'Loading summary analysis...', summary: [] });
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [customScores, setCustomScores] = useState({ searchibility_score: 0, hard_skills_score: 0, soft_skill_score: 0, formatting_score: 0 });
  const [loadingCustomScores, setLoadingCustomScores] = useState(false);
  const [otherComments, setOtherComments] = useState({ 
    headings_feedback: { score: 0, comment: '' }, 
    title_match: { score: 0, comment: '' }, 
    formatting_feedback: { score: 0, comment: '' } 
  });
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
  const [totalExperience, setTotalExperience] = useState(null);
  const [relevantExperience, setRelevantExperience] = useState(null);
  const [experienceError, setExperienceError] = useState(null);

  // Designation state
  const [loadingDesignation, setLoadingDesignation] = useState(false);
  const [designationInfo, setDesignationInfo] = useState({
    current_designation: '',
    previous_designation: ''
  });
  const [designationError, setDesignationError] = useState(null);

  // Location state
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationInfo, setLocationInfo] = useState({
    location: '',
    confidence_score: 0
  });
  const [locationError, setLocationError] = useState(null);

  // Recruiters Overview state
  const [loadingRecruitersOverview, setLoadingRecruitersOverview] = useState(false);
  const [recruitersOverview, setRecruitersOverview] = useState({
    bullets: [],
    relevant_experience: '',
    technical_proficiency: []
  });
  const [recruitersOverviewError, setRecruitersOverviewError] = useState(null);

  // Email input for direct database query
  const [emailInput, setEmailInput] = useState('');
  const [loadingEmailQuery, setLoadingEmailQuery] = useState(false);
  const [isDirectAccess, setIsDirectAccess] = useState(false);
  const [isDatabaseQuery, setIsDatabaseQuery] = useState(false);
  const [isPerformingQuery, setIsPerformingQuery] = useState(false);
  const [shouldClearContext, setShouldClearContext] = useState(false);
  // UI/UX enhancement states
  const [emailTouched, setEmailTouched] = useState(false);
  const [querySuccess, setQuerySuccess] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [copied, setCopied] = useState('');
  const [showFab, setShowFab] = useState(false);
  // Collapse controls
  const [expandSummaryComment, setExpandSummaryComment] = useState(false);
  
  // Dialog state for error messages
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  // SIMPLE LOGIC: If there's an email in the textbox, ignore context completely
  const hasEmailInTextbox = emailInput && emailInput.trim() !== '';
  const shouldIgnoreContext = !!emailId || hasEmailInUrl || hasEmailInTextbox;
  const effectivePdfText = shouldIgnoreContext ? '' : pdfText;
  const effectiveJobRole = shouldIgnoreContext ? '' : jobRole;
  const effectiveUserName = shouldIgnoreContext ? '' : userName;
  
  console.log('Email in URL:', !!emailId || hasEmailInUrl);
  console.log('Email in textbox:', hasEmailInTextbox);
  console.log('Email textbox value:', emailInput);
  console.log('Should ignore context:', shouldIgnoreContext);
  console.log('Effective pdfText:', effectivePdfText ? `Available (${effectivePdfText.length} chars)` : 'Not available');
  console.log('Effective jobRole:', effectiveJobRole || 'Not available');
  console.log('Effective userName:', effectiveUserName || 'Not available');

  // Cache state variables - DISABLED to prevent caching issues
  // const [cache, setCache] = useState({});
  // const [lastInputHash, setLastInputHash] = useState(null);

  // Helper function to check if all data is loaded
  const isAllDataLoaded = () => {
    return !loadingScore && !loadingContact && !loadingSummary && 
           !loadingCustomScores && !loadingOtherComments && 
           !loadingFunctionalConstituent && !loadingTechnicalConstituent && 
           !loadingEducation && !loadingProjects && !loadingEmployment;
  };

  // Helper function to create hash from input data
  const createInputHash = (pdfText, jobRole) => {
    if (!pdfText) return null;
    // Simple hash function for input data
    const input = `${pdfText}_${jobRole || ''}`;
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  };

  // Helper function to reset all states to null/empty
  const resetAllStates = () => {
    console.log('Resetting all states to null/empty');
    
    // Clear all state variables to null/empty
    setResumeScore(null);
    setResumeItems([]);
    setTotalExperience(null);
    setRelevantExperience(null);
    setExperienceError(null);
    setContactInfo({ mobile_number: '', email_id: '', color: '', comment: '' });
    setSummaryInfo({ score: 0, color: 'red', label: 'critical', comment: 'No data available', summary: [] });
    setCustomScores({ searchibility_score: 0, hard_skills_score: 0, soft_skill_score: 0, formatting_score: 0 });
    setOtherComments({ headings_feedback: '', title_match: '', formatting_feedback: '' });
    setFunctionalConstituent({ constituent: {}, industries: [], has_industry_experience: false, has_completed_college: false });
    setTechnicalConstituent({ high: [], medium: [], low: [] });
    setEducationHistory([]);
    setEmploymentHistory([]);
    setProjectsInfo([]);
    setRecruitersOverview({
      bullets: [],
      relevant_experience: '',
      technical_proficiency: []
    });
    setDesignationInfo({
      current_designation: '',
      previous_designation: ''
    });
    setDesignationError(null);
    
    setLocationInfo({
      location: '',
      confidence_score: 0
    });
    
    // Clear context data - IMPORTANT: This must happen for direct access
    if (setUserName) setUserName('');
    if (setPdfText) setPdfText('');
    if (setJobRole) setJobRole('');
    
    // Clear other states
    setIsDatabaseQuery(false);
    setScoreError(null);
    setEmailInput('');
    setRecruitersOverviewError(null);
    
    // Set all loading states to false
    setLoadingScore(false);
    setLoadingContact(false);
    setLoadingSummary(false);
    setLoadingCustomScores(false);
    setLoadingOtherComments(false);
    setLoadingFunctionalConstituent(false);
    setLoadingTechnicalConstituent(false);
    setLoadingEducation(false);
    setLoadingProjects(false);
    setLoadingEmployment(false);
    setLoadingEmailQuery(false);
    setLoadingRecruitersOverview(false);
  };

  // Helper function to determine progress bar color based on score
  const getProgressColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'primary';
    if (score >= 40) return 'warning';
    return 'error';
  };

  // Helper function to get color based on score
  const getColorFromScore = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'primary';
    if (score >= 40) return 'warning';
    return 'error';
  };

  // Helper function to get label based on score
  const getLabelFromScore = (score) => {
    if (score >= 80) return 'Good';
    if (score >= 60) return 'Satisfactory';
    if (score >= 40) return 'Needs Work';
    return 'Critical';
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
            backgroundColor: [alpha(theme.palette.text.disabled, 0.7)],
            borderColor: [theme.palette.text.disabled],
            borderWidth: 1,
          },
        ],
      };
    }

    const labels = Object.keys(constituent);
    const data = Object.values(constituent).map(value => parseInt(value.replace('%', '')));
    
    // Generate colors for each industry
    const colors = [
      alpha(theme.palette.info.main, 0.7),
      alpha(theme.palette.success.main, 0.7),
      alpha(theme.palette.warning.main, 0.7),
      alpha(theme.palette.secondary.main, 0.7),
      alpha(theme.palette.error.main, 0.7),
      alpha(theme.palette.info.light, 0.7),
      alpha(theme.palette.success.light, 0.7),
      alpha(theme.palette.warning.light, 0.7),
      alpha(theme.palette.primary.dark, 0.7),
      alpha(theme.palette.text.secondary, 0.7),
    ];
    
    const borderColors = [
      theme.palette.info.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.secondary.main,
      theme.palette.error.main,
      theme.palette.info.light,
      theme.palette.success.light,
      theme.palette.warning.light,
      theme.palette.primary.dark,
      theme.palette.text.secondary,
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
    animation: { duration: 800, easing: 'easeOutCubic' },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        enabled: false,
        backgroundColor: alpha(theme.palette.background.paper, 0.9),
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 10,
      },
      datalabels: {
        display: true,
        color: theme.palette.text.secondary,
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
        borderColor: theme.palette.divider,
        borderWidth: 1,
        borderRadius: 4,
        backgroundColor: alpha(theme.palette.background.paper, 0.8),
        padding: 4,
      },
    },
  };

  // Function to fetch data from database using email_id
  const fetchDataFromDatabase = async (emailId) => {
    console.log('Fetching data from database for email:', emailId);
    
    // Set database query flag to prevent callAllAPIs from being triggered
    setIsDatabaseQuery(true);
    
    // Set all loading states to true
    setLoadingScore(true);
    setLoadingContact(true);
    setLoadingSummary(true);
    setLoadingCustomScores(true);
    setLoadingOtherComments(true);
    setLoadingFunctionalConstituent(true);
    setLoadingTechnicalConstituent(true);
    setLoadingEducation(true);
    setLoadingProjects(true);
    setLoadingEmployment(true);
    setLoadingRecruitersOverview(true);
    setLoadingDesignation(true);
    setLoadingLocation(true);
    setScoreError(null);
    setLocationError(null);

    // IMPORTANT: Clear all context data BEFORE making the API call
    // This ensures no previous data persists when querying a specific email
    console.log('Clearing all context data before database query');
    setUserName('');
    setPdfText('');
    setJobRole('');

    try {
      const response = await fetch('http://127.0.0.1:8000/extractData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email_id: emailId
        }),
      });

      const data = await response.json();
      console.log('Received data from database:', data);
      
      // Always clear previous data first to prevent stale data display
      resetAllStates();
      
      // Check if the response contains an error message
      if (data.error || data.status === 404 || !response.ok) {
        console.log('Error or no candidate found in database');
        setScoreError(data.error || 'No candidate found with this email ID');
        
        // Show dialog for candidate not found
        setDialogMessage('Relevant Candidate Not Found');
        setOpenDialog(true);
        return;
      }
      
      // Additional check for empty data
      if (!data || !data.name || data.name.trim() === '' || Object.keys(data).length === 0) {
        console.log('No candidate data found in database');
        setScoreError('No candidate found with this email ID');
        setDialogMessage('Relevant Candidate Not Found');
        setOpenDialog(true);
        return;
      }

      // Map database schema to state variables
      if (data.name) setUserName(data.name);
      if (data.job_role) setJobRole(data.job_role);
      if (data.resume_raw_text) setPdfText(data.resume_raw_text);

      // Map score_resume data
      if (data.score_resume) {
        console.log('Raw score_resume from database:', data.score_resume);
        const scoreData = typeof data.score_resume === 'string' ? JSON.parse(data.score_resume) : data.score_resume;
        console.log('Parsed scoreData:', scoreData);
        console.log('Extracted score:', scoreData.score);
        setResumeScore(scoreData.score || 0);
        setResumeItems(scoreData.items || []);
      }

      // Map get_contacts data
      if (data.get_contacts) {
        const contactData = typeof data.get_contacts === 'string' ? JSON.parse(data.get_contacts) : data.get_contacts;
        setContactInfo({
          mobile_number: data.mobile_number || contactData.mobile_number || '',
          email_id: data.email_id || contactData.email_id || '',
          color: contactData.color || 'red',
          comment: contactData.comment || 'Contact information not available'
        });
      }

      // Map get_summary_overview data
      if (data.get_summary_overview) {
        const summaryData = typeof data.get_summary_overview === 'string' ? JSON.parse(data.get_summary_overview) : data.get_summary_overview;
        setSummaryInfo({
          score: summaryData.score || 0,
          color: summaryData.color || 'red',
          label: summaryData.label || 'critical',
          comment: summaryData.comment || 'Summary analysis not available',
          summary: summaryData.summary || []
        });
      }

      // Map get_custom_scores data
      if (data.get_custom_scores) {
        const customScoresData = typeof data.get_custom_scores === 'string' ? JSON.parse(data.get_custom_scores) : data.get_custom_scores;
        setCustomScores({
          searchibility_score: customScoresData.searchibility_score || 0,
          hard_skills_score: customScoresData.hard_skills_score || 0,
          soft_skill_score: customScoresData.soft_skill_score || 0,
          formatting_score: customScoresData.formatting_score || 0
        });
      }

      // Map get_other_comments data
      if (data.get_other_comments) {
        const otherCommentsData = typeof data.get_other_comments === 'string' ? JSON.parse(data.get_other_comments) : data.get_other_comments;
        
        // Handle AspectFeedback objects with score and comment fields
        setOtherComments({
          headings_feedback: {
            score: otherCommentsData.headings_feedback?.score || 0,
            comment: otherCommentsData.headings_feedback?.comment || 'Section headings analysis not available'
          },
          title_match: {
            score: otherCommentsData.title_match?.score || 0,
            comment: otherCommentsData.title_match?.comment || 'Job title match analysis not available'
          },
          formatting_feedback: {
            score: otherCommentsData.formatting_feedback?.score || 0,
            comment: otherCommentsData.formatting_feedback?.comment || 'Data formatting analysis not available'
          }
        });
        
        console.log('Processed AspectFeedback objects:', otherCommentsData);
      }

      // Map get_functional_constituent data
      if (data.get_functional_constituent) {
        const functionalData = typeof data.get_functional_constituent === 'string' ? JSON.parse(data.get_functional_constituent) : data.get_functional_constituent;
        setFunctionalConstituent({
          constituent: functionalData.constituent || {},
          industries: functionalData.industries || [],
          has_industry_experience: functionalData.has_industry_experience || false,
          has_completed_college: functionalData.has_completed_college || false
        });
      }

      // Map get_technical_constituent data
      if (data.get_technical_constituent) {
        const technicalData = typeof data.get_technical_constituent === 'string' ? JSON.parse(data.get_technical_constituent) : data.get_technical_constituent;
        setTechnicalConstituent({
          high: technicalData.high || [],
          medium: technicalData.medium || [],
          low: technicalData.low || []
        });
      }

      // Map get_education data
      if (data.get_education) {
        const educationData = typeof data.get_education === 'string' ? JSON.parse(data.get_education) : data.get_education;
        setEducationHistory(Array.isArray(educationData) ? educationData : []);
      }

      // Map get_projects data
      console.log('DEBUG - get_projects data received:', data.get_projects);
      if (data.get_projects) {
        const projectsData = typeof data.get_projects === 'string' ? JSON.parse(data.get_projects) : data.get_projects;
        console.log('DEBUG - Parsed projects data:', projectsData);
        console.log('DEBUG - Projects array exists:', !!projectsData.projects);
        console.log('DEBUG - Projects is array:', Array.isArray(projectsData.projects));
        console.log('DEBUG - Projects array length:', Array.isArray(projectsData.projects) ? projectsData.projects.length : 'N/A');
        setProjectsInfo(Array.isArray(projectsData.projects) ? projectsData.projects : []);
      } else {
        console.log('DEBUG - get_projects data missing in API response');
        setProjectsInfo([]);
      }

      // Map get_company data
      console.log('DEBUG - get_company data received:', data.get_company);
      if (data.get_company) {
        const employmentData = typeof data.get_company === 'string' ? JSON.parse(data.get_company) : data.get_company;
        console.log('DEBUG - Parsed employment data:', employmentData);
        console.log('DEBUG - Employment history exists:', !!employmentData.employment_history);
        console.log('DEBUG - Employment is array:', Array.isArray(employmentData.employment_history));
        console.log('DEBUG - Employment array length:', Array.isArray(employmentData.employment_history) ? employmentData.employment_history.length : 'N/A');
        setEmploymentHistory(Array.isArray(employmentData.employment_history) ? employmentData.employment_history : []);
      } else {
        console.log('DEBUG - get_company data missing in API response');
        setEmploymentHistory([]);
      }
      
      // Map get_designation data
      console.log('DEBUG - get_designation data received:', data.get_designation);
      console.log('DEBUG - get_recruiters_overview data received:', data.get_recruiters_overview);
      
      // Check both possible field locations for designation data
      // This handles the case where fields might be swapped in the database
      let designationData = null;
      
      // First try the expected field
      if (data.get_designation) {
        designationData = typeof data.get_designation === 'string' ? JSON.parse(data.get_designation) : data.get_designation;
        console.log('DEBUG - Parsed designation data from get_designation:', designationData);
        
        // Verify if this actually contains designation data
        if (!designationData.current_designation && !designationData.previous_designation) {
          console.log('DEBUG - get_designation field does not contain valid designation data');
          designationData = null;
        }
      }
      
      // If not found in the expected field, check if it might be in recruiters_overview due to column swap
      if (!designationData && data.get_recruiters_overview) {
        const potentialDesignationData = typeof data.get_recruiters_overview === 'string' ? 
          JSON.parse(data.get_recruiters_overview) : data.get_recruiters_overview;
        
        console.log('DEBUG - Checking get_recruiters_overview for designation data:', potentialDesignationData);
        
        // Check if this has designation structure
        if (potentialDesignationData.current_designation || potentialDesignationData.previous_designation) {
          console.log('DEBUG - Found designation data in get_recruiters_overview field');
          designationData = potentialDesignationData;
        }
      }
      
      // Set designation info based on what we found
      if (designationData) {
        setDesignationInfo({
          current_designation: designationData.current_designation || '',
          previous_designation: designationData.previous_designation || ''
        });
      } else {
        console.log('DEBUG - Designation data not found in any field');
        setDesignationInfo({
          current_designation: '',
          previous_designation: ''
        });
      }
      setLoadingDesignation(false);
      
      // Map get_location data
      console.log('DEBUG - get_location data received:', data.get_location);
      if (data.get_location) {
        const locationData = typeof data.get_location === 'string' ? JSON.parse(data.get_location) : data.get_location;
        console.log('DEBUG - Parsed location data:', locationData);
        setLocationInfo({
          location: locationData.location || '',
          confidence_score: locationData.confidence_score || 0
        });
      } else {
        console.log('DEBUG - get_location data missing in API response');
        setLocationInfo({
          location: '',
          confidence_score: 0
        });
      }
      
      // Map Years of Experience data (Total and Relevant)
      console.log('DEBUG - getYoe data received:', data.getYoe);
      console.log('DEBUG - getRyoe data received:', data.getRyoe);
      console.log('DEBUG - get_yoe data received:', data.get_yoe);
      console.log('DEBUG - get_ryoe data received:', data.get_ryoe);
      
      // Try all possible field names for experience data
      if (data.get_yoe !== undefined) {
        // Direct field access (preferred method)
        console.log('DEBUG - Using get_yoe directly:', data.get_yoe);
        setTotalExperience(data.get_yoe);
        setRelevantExperience(data.get_ryoe || null);
      } else if (data.getYoe) {
        // Legacy field name format
        const yoeData = typeof data.getYoe === 'string' ? JSON.parse(data.getYoe) : data.getYoe;
        console.log('DEBUG - Parsed YOE data:', yoeData);
        setTotalExperience(yoeData.yoe || null);
        setRelevantExperience(yoeData.ryoe || null);
      } else {
        console.log('DEBUG - YOE data missing in API response');
        setTotalExperience(null);
        setRelevantExperience(null);
      }
      
      // Map getRecruitersOverview data
      console.log('DEBUG - getRecruitersOverview data received:', data.getRecruitersOverview);
      console.log('DEBUG - get_recruiters_overview data received:', data.get_recruiters_overview);
      
      // Try all possible field names for recruiters overview
      if (data.getRecruitersOverview) {
        const recruitersData = typeof data.getRecruitersOverview === 'string' ? JSON.parse(data.getRecruitersOverview) : data.getRecruitersOverview;
        console.log('DEBUG - Parsed Recruiters Overview data:', recruitersData);
        setRecruitersOverview({
          bullets: Array.isArray(recruitersData.bullets) ? recruitersData.bullets : [],
          relevant_experience: recruitersData.relevant_experience || '',
          technical_proficiency: Array.isArray(recruitersData.technical_proficiency) ? recruitersData.technical_proficiency : []
        });
      } else if (data.get_recruiters_overview) {
        const recruitersData = typeof data.get_recruiters_overview === 'string' ? JSON.parse(data.get_recruiters_overview) : data.get_recruiters_overview;
        console.log('DEBUG - Parsed get_recruiters_overview data:', recruitersData);
        setRecruitersOverview({
          bullets: Array.isArray(recruitersData.bullets) ? recruitersData.bullets : [],
          relevant_experience: recruitersData.relevant_experience || '',
          technical_proficiency: Array.isArray(recruitersData.technical_proficiency) ? recruitersData.technical_proficiency : []
        });
      } else {
        console.log('DEBUG - Recruiters Overview data missing in API response');
        setRecruitersOverview({
          bullets: [],
          relevant_experience: '',
          technical_proficiency: []
        });
      }

      // Set all loading states to false
      setLoadingScore(false);
      setLoadingContact(false);
      setLoadingSummary(false);
      setLoadingCustomScores(false);
      setLoadingOtherComments(false);
      setLoadingFunctionalConstituent(false);
      setLoadingTechnicalConstituent(false);
      setLoadingEducation(false);
      setLoadingProjects(false);
      setLoadingEmployment(false);
      setLoadingRecruitersOverview(false);
      setLoadingLocation(false);
      
      // Reset database query flag
      setIsDatabaseQuery(false);

    } catch (error) {
      console.error('Failed to fetch data from database:', error);
      setScoreError('Failed to fetch data from database');
      
      // Set all loading states to false
      setLoadingScore(false);
      setLoadingContact(false);
      setLoadingSummary(false);
      setLoadingCustomScores(false);
      setLoadingOtherComments(false);
      setLoadingFunctionalConstituent(false);
      setLoadingTechnicalConstituent(false);
      setLoadingEducation(false);
      setLoadingProjects(false);
      setLoadingEmployment(false);
      setLoadingRecruitersOverview(false);
      setLoadingLocation(false);
    }
};

// FAB visibility on scroll
useEffect(() => {
  const onScroll = () => {
    if (typeof window !== 'undefined') {
      setShowFab(window.scrollY > 400);
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }
  }, []);

  const isValidEmail = (email) => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email);

  const handleCopy = (text) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard && text) {
      navigator.clipboard.writeText(text);
      setCopied(text);
      setSnackbar({ open: true, message: 'Copied to clipboard', severity: 'success' });
      setTimeout(() => setCopied(''), 1200);
    }
  };

  // Helper function to safely parse score values
  const parseScoreValue = (score) => {
    if (!score) return 0;
    if (typeof score === 'number') return score;
    if (typeof score === 'string') {
      return parseInt(score.replace('%', ''));
    }
    return 0;
  };

  // Force clear context on component mount to prevent persistence
  useEffect(() => {
    console.log('Component mounted - Force clearing all context data to prevent caching');
    
    // Check if this is direct access (no email parameter)
    const urlParams = new URLSearchParams(window.location.search);
    const hasEmailParam = urlParams.get('email_id');
    
    // IMPORTANT: Always reset context values on component mount
    // This prevents userName from persisting when accessing the page directly
    if (setUserName) setUserName('');
    if (setPdfText) setPdfText('');
    if (setJobRole) setJobRole('');
    
    if (!hasEmailParam) {
      console.log('DIRECT ACCESS DETECTED - Resetting all states');
      setIsDirectAccess(true);
      resetAllStates(); // Reset all states for direct access
    } else {
      console.log('EMAIL PARAMETER DETECTED - Will load fresh data from API');
      setIsDirectAccess(false);
    }
  }, []); // Run only on mount

  // Watch for isPerformingQuery changes and clear context immediately
  useEffect(() => {
    if (isPerformingQuery) {
      console.log('Query state changed to true - Immediately clearing context');
      setUserName('');
      setPdfText('');
      setJobRole('');
    }
  }, [isPerformingQuery]);

  useEffect(() => {
    console.log('useEffect triggered - emailId:', emailId || 'Not available');
    console.log('useEffect triggered - effective pdfText:', effectivePdfText ? `Available (${effectivePdfText.length} chars)` : 'Not available');
    console.log('useEffect triggered - effective jobRole:', effectiveJobRole ? effectiveJobRole : 'Not available');
    console.log('useEffect triggered - effective userName:', effectiveUserName || 'Not available');
    console.log('useEffect triggered - loadingEmailQuery:', loadingEmailQuery);
    
    // If we have an email_id from URL, fetch data from database
    if (emailId) {
      console.log('Email ID found in URL, fetching data from database');
      setIsDirectAccess(false); // Reset direct access flag when we have data
      fetchDataFromDatabase(emailId); // Context clearing now happens inside fetchDataFromDatabase
      return;
    }
    
    // If accessing directly without any data, clear all data
    if (!emailId && !effectivePdfText) {
      console.log('Direct access without data detected, clearing all data');
      setIsDirectAccess(true);
      
      // Clear all state variables to null/empty
      resetAllStates(); // Use the existing resetAllStates function for consistency
      
      // Double-check that userName is cleared
      if (setUserName) setUserName('');
      return;
    }
    
    // Otherwise, use the existing logic for new resume analysis
    if (!effectivePdfText) {
      console.log('No effective pdfText available, skipping API calls');
      return;
    }

    // Skip API calls if this is a database query
    if (isDatabaseQuery) {
      console.log('Database query in progress, skipping callAllAPIs');
      return;
    }
    
    // Skip API calls if we're in the middle of an email query
    if (loadingEmailQuery) {
      console.log('Email query in progress, skipping callAllAPIs');
      return;
    }

    // CACHING DISABLED - Always make fresh API calls
    console.log('Making fresh API calls (caching disabled)');
    
    // callAllAPIs function has been removed
    console.log('API call functionality has been removed');
  }, [pdfText, emailId, loadingEmailQuery]);

  // callAllAPIs function has been removed

  // CACHING DISABLED - Removed caching useEffect to prevent errors

  // Note: Both resume scoring and contact information are fetched via async independent requests

  // handleReupload function removed - upload & re-scan functionality removed

  // Handle email input query
  const handleEmailQuery = async () => {
    setEmailTouched(true);
    if (!emailInput.trim() || !isValidEmail(emailInput.trim())) {
      setSnackbar({ open: true, message: 'Please enter a valid email address', severity: 'error' });
      return;
    }

    console.log('Query button pressed for email:', emailInput.trim());
  
    // Clear context immediately
    console.log('Clearing context data');
    setUserName('');
    setPdfText('');
    setJobRole('');
  
    // Clear all states
    console.log('Clearing all states');
    resetAllStates();
  
    setLoadingEmailQuery(true);
  
    // Wait 1 second as requested
    console.log('Waiting 1 second before API request');
    await new Promise(resolve => setTimeout(resolve, 1000));
  
    // Make API request
    console.log('Making API request to /extractData with email:', emailInput.trim());
  
    try {
      await fetchDataFromDatabase(emailInput.trim());
      setLoadingEmailQuery(false);
      setQuerySuccess(true);
      setSnackbar({ open: true, message: 'Candidate data loaded successfully', severity: 'success' });
      setTimeout(() => setQuerySuccess(false), 1200);
    } catch (error) {
      console.error('Failed to query database:', error);
      resetAllStates();
      setLoadingEmailQuery(false);
      setDialogMessage('Failed to fetch data for the provided email ID. Please check if the email exists in the database.');
      setOpenDialog(true);
    }  
  };

  // Create dynamic functional data
  const functionalData = createFunctionalData(functionalConstituent.constituent);
  
  return (
    <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh' }}>
      <Navigation currentPage="Query Candidate" onQueryCandidateClick={resetAllStates} />
      
      {/* Email Query Section - Hidden when redirected from bulk-import */}
      {!emailId && (
        <Box sx={{ p: 4, pb: 2 }}>
          <RevealPaper variant="slideUp" sx={{ p: 3, mb: 3, backgroundColor: 'background.paper' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Query Candidate Database
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
              Enter an email ID to retrieve candidate information from the database
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                fullWidth
                label="Email ID"
                placeholder="Enter candidate email (e.g., john.doe@example.com)"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                variant="outlined"
                size="medium"
                disabled={loadingEmailQuery}
                error={emailTouched && !!emailInput && !isValidEmail(emailInput)}
                helperText={emailTouched && !!emailInput && !isValidEmail(emailInput) ? 'Enter a valid email address' : ' '}
                onBlur={() => setEmailTouched(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleEmailQuery();
                  }
                }}
                sx={{ maxWidth: 400, '& .MuiFormHelperText-root': { transition: 'color 200ms ease' } }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleEmailQuery}
                disabled={loadingEmailQuery || !emailInput.trim() || (emailTouched && !isValidEmail(emailInput))}
                sx={{ 
                  minWidth: 120,
                  height: 56,
                  fontWeight: 600,
                  textTransform: 'none'
                }}
              >
                {loadingEmailQuery ? (
                  <CircularProgress size={20} color="inherit" />
                ) : querySuccess ? (
                  <Zoom in={querySuccess}>
                    <Check fontSize="small" />
                  </Zoom>
                ) : (
                  'Query Database'
                )}
              </Button>
            </Box>
          </RevealPaper>
        </Box>
      )}
      
      <Box sx={{ p: 4, pt: 0 }}>
      <Grid container spacing={3}>
        {/* Sidebar */}
        <Grid item xs={12} md={3}>
          <RevealPaper 
            variant="slideLeft"
            threshold={0.1}
            delay={0}
            sx={{ 
              p: 3, 
              mb: 3, 
              textAlign: 'center',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-4px)'
              } 
            }}>
            {/* Candidate Name Section - Always show when we have actual data */}
            {(emailId || (pdfText && pdfText.trim() !== '') || (userName && userName.trim() !== '')) && (
              <Box sx={{ mb: 3, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h5" fontWeight={700} sx={{ mb: 1, color: 'primary.main' }}>
                  {userName || 'Candidate Name'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Profile Analysis
                </Typography>
              </Box>
            )}
            
            {loadingScore ? (
              <Skeleton variant="text" width={80} height={48} sx={{ mx: 'auto' }} />
            ) : (
              <Typography variant="h4" color="success.main" fontWeight={700}>
                {scoreError ? scoreError : resumeScore || '--'}
              </Typography>
            )}
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Resume Score
            </Typography>
            {jobRole && (
              <Typography variant="body2" sx={{ mb: 1, fontStyle: 'italic', color: 'text.secondary' }}>
                Target Role: {jobRole || 'Not specified'}
              </Typography>
            )}
            {loadingScore ? (
              <Skeleton variant="rectangular" height={10} sx={{ borderRadius: 1, mb: 3 }} />
            ) : (
              <LinearProgress 
                variant="determinate" 
                value={parseScoreValue(resumeScore)} 
                sx={{ height: 10, borderRadius: 5, mb: 3 }} 
                color={
                  parseScoreValue(resumeScore) >= 80 
                    ? 'success' 
                    : parseScoreValue(resumeScore) >= 60 
                    ? 'warning' 
                    : 'error'
                } 
              />
            )}
            {/* Upload & re-scan button removed */}
            {/* Experience Cards */}
            <Box sx={{ 
              mt: 3, 
              mb: 3, 
              p: 2, 
              border: '1px solid', 
              borderColor: 'divider', 
              borderRadius: 2, 
              backgroundColor: 'surface.main',
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: 2,
                borderColor: 'primary.light'
              }
            }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, color: 'text.primary' }}>
                Experience Overview
              </Typography>
              
              {loadingEmployment ? (
                <>
                  <Skeleton variant="text" width={120} />
                  <Skeleton variant="text" width={200} />
                </>
              ) : experienceError ? (
                <Typography variant="body2" color="error">
                  {experienceError}
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {/* Total Experience */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WorkOutline sx={{ fontSize: 18, color: totalExperience ? 'primary.main' : 'text.disabled' }} />
                    <Typography variant="body2" sx={{ fontWeight: 500, minWidth: '120px' }}>Total Experience:</Typography>
                    <Chip
                      label={totalExperience ? `${totalExperience} years` : 'Not available'}
                      size="small"
                      color={totalExperience ? 'primary' : 'default'}
                      sx={{ fontSize: '0.75rem' }}
                    />
                  </Box>
                  
                  {/* Relevant Experience */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WorkOutline sx={{ fontSize: 18, color: relevantExperience ? 'success.main' : 'text.disabled' }} />
                    <Typography variant="body2" sx={{ fontWeight: 500, minWidth: '120px' }}>Relevant Experience:</Typography>
                    <Chip
                      label={relevantExperience ? `${relevantExperience} years` : 'Not available'}
                      size="small"
                      color={relevantExperience ? 'success' : 'default'}
                      sx={{ fontSize: '0.75rem' }}
                    />
                  </Box>
                </Box>
              )}
            </Box>
            
            <Box sx={{ textAlign: 'left', mt: 2 }}>
              <Typography variant="body2" fontWeight={700}>Searchability</Typography>
              {loadingCustomScores ? <Skeleton variant="rectangular" height={8} sx={{ borderRadius: 1, mb: 1 }} /> : (
                <LinearProgress 
                  variant="determinate" 
                  value={customScores.searchibility_score} 
                  sx={{ height: 8, borderRadius: 5, mb: 1 }} 
                  color={getProgressColor(customScores.searchibility_score)} 
                />
              )}
              <Typography variant="body2" fontWeight={700}>Hard Skills</Typography>
              {loadingCustomScores ? <Skeleton variant="rectangular" height={8} sx={{ borderRadius: 1, mb: 1 }} /> : (
                <LinearProgress 
                  variant="determinate" 
                  value={customScores.hard_skills_score} 
                  sx={{ height: 8, borderRadius: 5, mb: 1 }} 
                  color={getProgressColor(customScores.hard_skills_score)} 
                />
              )}
              <Typography variant="body2" fontWeight={700}>Soft Skills</Typography>
              {loadingCustomScores ? <Skeleton variant="rectangular" height={8} sx={{ borderRadius: 1, mb: 1 }} /> : (
                <LinearProgress 
                  variant="determinate" 
                  value={customScores.soft_skill_score} 
                  sx={{ height: 8, borderRadius: 5, mb: 1 }} 
                  color={getProgressColor(customScores.soft_skill_score)} 
                />
              )}
              <Typography variant="body2" fontWeight={700}>Formatting</Typography>
              {loadingCustomScores ? <Skeleton variant="rectangular" height={8} sx={{ borderRadius: 1, mb: 1 }} /> : (
                <LinearProgress 
                  variant="determinate" 
                  value={customScores.formatting_score} 
                  sx={{ height: 8, borderRadius: 5, mb: 1 }} 
                  color={getProgressColor(customScores.formatting_score)} 
                />
              )}
            </Box>
            
            {/* Contact Information Section */}
            <Box sx={{ 
              mt: 3, 
              p: 2, 
              border: '1px solid', 
              borderColor: 'divider', 
              borderRadius: 2, 
              backgroundColor: 'surface.main',
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: 2,
                borderColor: 'primary.light'
              }
            }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, color: 'text.primary' }}>
                Contact Information
              </Typography>
              
              {loadingContact ? (
                <>
                  <Skeleton variant="text" width={120} />
                  <Skeleton variant="text" width={200} />
                </>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {/* Phone Number */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Phone sx={{ fontSize: 18, color: contactInfo.mobile_number ? 'success.main' : 'text.disabled' }} />
                    <Typography variant="body2" sx={{ fontWeight: 500, minWidth: '60px' }}>Phone:</Typography>
                    <Tooltip title={copied === (contactInfo.mobile_number || 'Not found') ? 'Copied!' : (contactInfo.mobile_number ? 'Click to copy' : '')}>
                      <span>
                        <Chip
                          icon={contactInfo.mobile_number ? <ContentCopy fontSize="small" /> : undefined}
                          label={contactInfo.mobile_number || 'Not found'}
                          size="small"
                          onClick={() => contactInfo.mobile_number && handleCopy(contactInfo.mobile_number)}
                          clickable={!!contactInfo.mobile_number}
                          sx={{
                            fontSize: '0.75rem',
                            cursor: contactInfo.mobile_number ? 'pointer' : 'default'
                          }}
                        />
                      </span>
                    </Tooltip>
                  </Box>
                  
                  {/* Email */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <Email sx={{ fontSize: 18, color: contactInfo.email_id ? 'success.main' : 'text.disabled', mt: 0.2 }} />
                    <Typography variant="body2" sx={{ fontWeight: 500, minWidth: '60px', mt: 0.2 }}>Email:</Typography>
                    <Tooltip title={copied === (contactInfo.email_id || 'Not found') ? 'Copied!' : (contactInfo.email_id ? 'Click to copy' : '')}>
                      <span style={{ flex: 1 }}>
                        <Chip
                          icon={contactInfo.email_id ? <ContentCopy fontSize="small" /> : undefined}
                          label={contactInfo.email_id || 'Not found'}
                          size="small"
                          onClick={() => contactInfo.email_id && handleCopy(contactInfo.email_id)}
                          clickable={!!contactInfo.email_id}
                          sx={{
                            fontSize: '0.75rem',
                            maxWidth: '100%',
                            '& .MuiChip-label': { whiteSpace: 'normal', textOverflow: 'clip' }
                          }}
                        />
                      </span>
                    </Tooltip>
                  </Box>
                </Box>
              )}
            </Box>
          </RevealPaper>
          
          {/* Designation Section */}
          <RevealPaper 
            variant="slideRight" 
            threshold={0.1}
            delay={0.1}
            sx={{ p: 3, mt: 3, position: 'relative', zIndex: 2, bgcolor: '#1e1e1e', color: 'white' }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>Designation</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              {loadingDesignation ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 100 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : designationError ? (
                <Typography color="error">{designationError}</Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ color: '#aaaaaa', mb: 0.5 }}>Current Designation:</Typography>
                    <Typography variant="h6" fontWeight={500}>
                      {designationInfo.current_designation || 'Not specified'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ color: '#aaaaaa', mb: 0.5 }}>Previous Designation:</Typography>
                    <Typography variant="h6" fontWeight={500}>
                      {designationInfo.previous_designation || 'Not specified'}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </RevealPaper>
          
          {/* Location Section */}
          <RevealPaper 
            variant="slideRight" 
            threshold={0.1}
            delay={0.2}
            sx={{ p: 3, mt: 3, position: 'relative', zIndex: 2, bgcolor: '#1e1e1e', color: 'white' }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>Location</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              {loadingLocation ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 100 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : locationError ? (
                <Typography color="error">{locationError}</Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                  <Typography variant="h6" fontWeight={500} sx={{ mb: 2 }}>
                    {locationInfo.location || 'Location not detected'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ mr: 2, color: '#aaaaaa' }}>
                      Confidence Score:
                    </Typography>
                    <Box 
                      sx={{ 
                        display: 'inline-flex',
                        bgcolor: locationInfo.confidence_score >= 80 ? '#8AE9A1' : 
                                locationInfo.confidence_score >= 60 ? '#63B3ED' : 
                                locationInfo.confidence_score >= 40 ? '#F6AD55' : '#F56565',
                        color: '#000000',
                        borderRadius: '20px',
                        px: 2,
                        py: 0.5,
                        fontWeight: 600
                      }}
                    >
                      {locationInfo.confidence_score}%
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          </RevealPaper>
          
          {/* Functional Exposure Section */}
          <RevealPaper 
            variant="zoom" 
            threshold={0.1}
            delay={0.3}
            sx={{ 
              p: 3, 
              mt: 3, 
              position: 'relative', 
              zIndex: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-4px)'
              }
            }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>Functional Exposure</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
              {loadingFunctionalConstituent ? (
                <CircularProgress size={24} />
              ) : (
                <Pie 
                  data={functionalData} 
                  options={functionalChartOptions}
                  style={{ maxHeight: '180px', maxWidth: '100%' }} 
                />
              )}
            </Box>
          </RevealPaper>
          
          {/* Technical Exposure Section */}
          <RevealPaper 
            variant="zoom" 
            threshold={0.1}
            delay={0.4}
            sx={{ 
              p: 3, 
              mt: 3, 
              position: 'relative', 
              zIndex: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-4px)'
              }
            }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Technical Exposure</Typography>
            {loadingTechnicalConstituent ? (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                    <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 1 }} />
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Skeleton variant="text" width={100} />
                  <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 1 }} />
                </Grid>
                <Grid item xs={12}>
                  <Skeleton variant="text" width={70} />
                  <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 1 }} />
                </Grid>
              </Grid>
            ) : (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {/* High Relevance Row */}
                <Grid item xs={12}>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600} color="success.main" gutterBottom>
                      High
                    </Typography>
                    <Box sx={(theme) => ({ 
                      minHeight: 60, 
                      backgroundColor: alpha(theme.palette.success.main, 0.1), 
                      borderRadius: 1, 
                      p: 1, 
                      border: '1px solid', 
                      borderColor: theme.palette.success.main,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.success.main, 0.2),
                        boxShadow: `0 0 8px ${alpha(theme.palette.success.main, 0.4)}`
                      }
                    })}>
                      {technicalConstituent.high && technicalConstituent.high.length > 0 ? (
                        technicalConstituent.high.map((skill, index) => (
                          <Chip
                            key={index}
                            label={skill}
                            size="small"
                            color="success"
                            variant="outlined"
                            sx={{ 
                              m: 0.5, 
                              fontSize: '0.75rem',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.success.main, 0.1),
                                transform: 'scale(1.05)'
                              }
                            }}
                          />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ pt: 1 }}>
                          No high relevance skills
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>
                
                {/* Medium Relevance Row */}
                <Grid item xs={12}>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600} color="warning.main" gutterBottom>
                      Medium
                    </Typography>
                    <Box sx={(theme) => ({ 
                      minHeight: 60, 
                      backgroundColor: alpha(theme.palette.warning.main, 0.1), 
                      borderRadius: 1, 
                      p: 1, 
                      border: '1px solid', 
                      borderColor: theme.palette.warning.main,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.warning.main, 0.2),
                        boxShadow: `0 0 8px ${alpha(theme.palette.warning.main, 0.4)}`
                      }
                    })}>
                      {technicalConstituent.medium && technicalConstituent.medium.length > 0 ? (
                        technicalConstituent.medium.map((skill, index) => (
                          <Chip
                            key={index}
                            label={skill}
                            size="small"
                            color="warning"
                            variant="outlined"
                            sx={{ 
                              m: 0.5, 
                              fontSize: '0.75rem',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.warning.main, 0.1),
                                transform: 'scale(1.05)'
                              }
                            }}
                          />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ pt: 1 }}>
                          No medium relevance skills
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>
                
                {/* Low Relevance Row */}
                <Grid item xs={12}>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600} color="error.main" gutterBottom>
                      Low
                    </Typography>
                    <Box sx={(theme) => ({ 
                      minHeight: 60, 
                      backgroundColor: alpha(theme.palette.error.main, 0.1), 
                      borderRadius: 1, 
                      p: 1, 
                      border: '1px solid', 
                      borderColor: theme.palette.error.main,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.error.main, 0.2),
                        boxShadow: `0 0 8px ${alpha(theme.palette.error.main, 0.4)}`
                      }
                    })}>
                      {technicalConstituent.low && technicalConstituent.low.length > 0 ? (
                        technicalConstituent.low.map((skill, index) => (
                          <Chip
                            key={index}
                            label={skill}
                            size="small"
                            color="error"
                            variant="outlined"
                            sx={{ 
                              m: 0.5, 
                              fontSize: '0.75rem',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.error.main, 0.1),
                                transform: 'scale(1.05)'
                              }
                            }}
                          />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ pt: 1 }}>
                          No low relevance skills
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            )}
          </RevealPaper>
        </Grid>
        {/* Main Content */}
        <Grid item xs={12} md={9}>
          {/* Summary Section */}
          <RevealPaper 
            variant="slideUp" 
            threshold={0.1}
            sx={{ 
              p: 3, 
              mb: 3,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-4px)'
              }
            }}>
            <Typography variant="h6" fontWeight={700}>Summary</Typography>
            <Typography variant="body2" sx={{ my: 2 }}>
              AI-powered analysis of your resume summary section and overall presentation.
            </Typography>
            
            {loadingSummary ? (
              <Box sx={{ mt: 2 }}>
                <Skeleton variant="text" width={160} />
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="90%" />
                <Skeleton variant="text" width="75%" />
              </Box>
            ) : (
              <Box sx={{ mt: 2 }}>
                {/* Summary Points Section */}
                {summaryInfo.summary && summaryInfo.summary.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                      Extracted Summary:
                    </Typography>
                    <Box component="ul" sx={{ 
                      margin: 0, 
                      paddingLeft: 3, 
                      listStyleType: 'disc'
                    }}>
                      {summaryInfo.summary.map((point, index) => (
                        <Box component="li" key={index} sx={{ mb: 1, lineHeight: 1.5 }}>
                          <Typography variant="body2" component="span">
                            {point}
                          </Typography>
                        </Box>
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
                    label={summaryInfo.label || 'N/A'} 
                    size="small" 
                    color={summaryInfo.color === 'green' ? 'success' : 
                           summaryInfo.color === 'blue' ? 'primary' : 
                           summaryInfo.color === 'orange' ? 'warning' : 'error'}
                    sx={{ textTransform: 'capitalize' }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Score: {summaryInfo.score || 0}/100
                  </Typography>
                </Box>
                
                <Box>
                  <Collapse in={expandSummaryComment || !(summaryInfo.comment && summaryInfo.comment.length > 180)} collapsedSize={64}>
                    <Typography variant="body2" sx={{ 
                      p: 2, 
                      backgroundColor: 'surface.light', 
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      color: 'text.primary',
                      fontWeight: 700,
                      fontStyle: 'italic'
                    }}>
                      {summaryInfo.comment || 'No summary analysis available'}
                    </Typography>
                  </Collapse>
                  {summaryInfo.comment && summaryInfo.comment.length > 180 && (
                    <Button size="small" onClick={() => setExpandSummaryComment((v) => !v)} sx={{ mt: 1, textTransform: 'none' }}>
                      {expandSummaryComment ? 'Show less' : 'Show more'}
                    </Button>
                  )}
                </Box>
              </Box>
            )}
          </RevealPaper>
          
          {/* Projects Section */}
          <RevealPaper 
            variant="zoom" 
            threshold={0.1}
            delay={0.1}
            sx={{ 
              p: 3, 
              mb: 3,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-4px)'
              }
            }}>
            <Typography variant="h6" fontWeight={700}>Projects</Typography>
            <Typography variant="body2" sx={{ my: 2 }}>
              AI-powered analysis of your project experience and technical implementations.
            </Typography>
            {loadingProjects ? (
              <Reveal variant="fade" threshold={0.1} delay={0.05}>
                <Grid container spacing={2}>
                  {[0,1,2,3].map((i) => (
                    <Reveal variant="fade" threshold={0.1} delay={i * 0.05} key={i}>
                      <Grid item xs={12} md={6}>
                        <Card>
                          <CardContent>
                            <Skeleton variant="text" width="60%" />
                            <Skeleton variant="text" width={120} />
                            <Skeleton variant="text" width="90%" />
                            <Skeleton variant="text" width="85%" />
                            <Skeleton variant="rectangular" height={24} width="50%" sx={{ mt: 1, borderRadius: 1 }} />
                          </CardContent>
                        </Card>
                      </Grid>
                    </Reveal>
                  ))}
                </Grid>
              </Reveal>
            ) : (
              <Box>
                {projectsInfo && projectsInfo.length > 0 ? (
                  <Grid container spacing={2}>
                    {projectsInfo.map((project, index) => (
                      <Grid item xs={12} md={6} key={index}>
                        <Reveal variant="fade" threshold={0.1} delay={index * 0.05}>
                          <MotionCard 
                            whileHover={{ 
                              y: -8,
                              boxShadow: '0 10px 20px rgba(0,0,0,0.15)'
                            }}
                            transition={{ type: 'spring', stiffness: 300 }}
                            sx={{ 
                              height: '100%', 
                              border: '1px solid', 
                              borderColor: (project.score || 0) >= 80 ? 'success.main' : 
                                        (project.score || 0) >= 60 ? 'warning.main' : 'error.main',
                              transition: 'all 0.3s ease'
                            }}>
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                <Typography variant="subtitle1" fontWeight={600} sx={{ flex: 1 }}>
                                  {project.title || `Project ${index + 1}`}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                  <Chip 
                                    label={`${project.score || 0}%`}
                                    size="small"
                                    color={(project.score || 0) >= 80 ? 'success' : 
                                          (project.score || 0) >= 60 ? 'warning' : 'error'}
                                    sx={{ fontWeight: 600 }}
                                  />
                                  <Chip 
                                    label={project.stage || 'Unknown'}
                                    size="small"
                                    variant="outlined"
                                    color={project.stage === 'Production' ? 'primary' : 'default'}
                                  />
                                </Box>
                              </Box>
                              
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {project.description || 'No description available'}
                              </Typography>
                              
                              {project.comment && (
                                <Box sx={{ mb: 2 }}>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                                    AI Analysis:
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                    {project.comment}
                                  </Typography>
                                </Box>
                              )}
                              
                              {project.technologies && project.technologies.length > 0 && (
                                <Box>
                                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontWeight: 600 }}>
                                    Technologies:
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {project.technologies.map((tech, techIndex) => (
                                      <Tooltip key={techIndex} title={copied === tech ? 'Copied!' : 'Click to copy'}>
                                        <span>
                                          <Chip 
                                            label={tech}
                                            size="small"
                                            variant="outlined"
                                            onClick={() => handleCopy(tech)}
                                            clickable
                                            icon={<ContentCopy fontSize="small" />}
                                            sx={{ 
                                              fontSize: '0.75rem',
                                              transition: 'all 0.2s ease',
                                              '&:hover': {
                                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                                transform: 'scale(1.05)'
                                              }
                                            }}
                                          />
                                        </span>
                                      </Tooltip>
                                    ))}
                                  </Box>
                                </Box>
                              )}
                            </CardContent>
                          </MotionCard>
                        </Reveal>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                    No projects found in your resume. Consider adding project details to showcase your technical experience.
                  </Typography>
                )}
              </Box>
            )}
          </RevealPaper>

          {/* Recruiters Overview Section */}
          <RevealPaper 
            variant="slideLeft" 
            threshold={0.1}
            delay={0.15}
            sx={{ 
              p: 3, 
              mb: 3,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-4px)'
              }
            }}>
            <Typography variant="h6" fontWeight={700}>Recruiters Overview</Typography>
            <Typography variant="body2" sx={{ my: 2 }}>
              AI-powered analysis of your resume from a recruiter's perspective.
            </Typography>
            
            {loadingRecruitersOverview ? (
              <Box sx={{ mt: 2 }}>
                <Skeleton variant="text" width={160} />
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="90%" />
                <Skeleton variant="text" width="75%" />
              </Box>
            ) : recruitersOverviewError ? (
              <Alert severity="error" sx={{ mt: 2 }}>
                {recruitersOverviewError}
              </Alert>
            ) : (
              <Box sx={{ mt: 2 }}>
                {/* Relevant Experience Summary */}
                {recruitersOverview.relevant_experience && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                      Relevant Experience:
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      p: 2, 
                      backgroundColor: 'surface.light', 
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      fontWeight: 500
                    }}>
                      {recruitersOverview.relevant_experience}
                    </Typography>
                  </Box>
                )}
                
                {/* Bullet Points */}
                {recruitersOverview.bullets && recruitersOverview.bullets.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                      Key Highlights:
                    </Typography>
                    <List dense disablePadding>
                      {recruitersOverview.bullets.map((bullet, index) => (
                        <ListItem key={index} sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 28 }}>
                            <Code fontSize="small" color="primary" />
                          </ListItemIcon>
                          <ListItemText primary={bullet} primaryTypographyProps={{ variant: 'body2' }} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
                
                {/* Technical Proficiency */}
                {recruitersOverview.technical_proficiency && recruitersOverview.technical_proficiency.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                      Technical Proficiency:
                    </Typography>
                    <List dense disablePadding>
                      {recruitersOverview.technical_proficiency.map((item, index) => (
                        <ListItem key={index} sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 28 }}>
                            <Code fontSize="small" color="primary" />
                          </ListItemIcon>
                          <ListItemText primary={item} primaryTypographyProps={{ variant: 'body2' }} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
                
                {(!recruitersOverview || 
                  (!recruitersOverview.bullets?.length && 
                   !recruitersOverview.relevant_experience && 
                   !recruitersOverview.technical_proficiency?.length)) && (
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      No recruiter overview data available
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </RevealPaper>
          
          {/* Resume Fixes Section */}
          <RevealPaper 
            variant="slideUp" 
            threshold={0.1}
            delay={0.2}
            sx={{ 
              p: 3, 
              mb: 3,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-4px)'
              }
            }}>
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
                    <TableCell>Section Headings</TableCell>
                    <TableCell>
                      {loadingOtherComments ? (
                        <CircularProgress size={20} />
                      ) : (
                        <Chip 
                          label={getLabelFromScore(otherComments.headings_feedback.score)}
                          color={getColorFromScore(otherComments.headings_feedback.score)}
                          size="small" 
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {loadingOtherComments ? 'Analyzing section headings...' : (
                        <>
                          <Typography variant="body2" component="span">
                            Score: {otherComments.headings_feedback.score}/100
                          </Typography>
                          <Typography variant="body2" component="p" sx={{ mt: 1 }}>
                            {otherComments.headings_feedback.comment}
                          </Typography>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Job Title Match</TableCell>
                    <TableCell>
                      {loadingOtherComments ? (
                        <CircularProgress size={20} />
                      ) : (
                        <Chip 
                          label={getLabelFromScore(otherComments.title_match.score)}
                          color={getColorFromScore(otherComments.title_match.score)}
                          size="small" 
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {loadingOtherComments ? 'Analyzing job title match...' : (
                        <>
                          <Typography variant="body2" component="span">
                            Score: {otherComments.title_match.score}/100
                          </Typography>
                          <Typography variant="body2" component="p" sx={{ mt: 1 }}>
                            {otherComments.title_match.comment}
                          </Typography>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Data Formatting</TableCell>
                    <TableCell>
                      {loadingOtherComments ? (
                        <CircularProgress size={20} />
                      ) : (
                        <Chip 
                          label={getLabelFromScore(otherComments.formatting_feedback.score)}
                          color={getColorFromScore(otherComments.formatting_feedback.score)}
                          size="small" 
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {loadingOtherComments ? 'Analyzing data formatting...' : (
                        <>
                          <Typography variant="body2" component="span">
                            Score: {otherComments.formatting_feedback.score}/100
                          </Typography>
                          <Typography variant="body2" component="p" sx={{ mt: 1 }}>
                            {otherComments.formatting_feedback.comment}
                          </Typography>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </RevealPaper>
          
          {/* Professional Timeline Section */}
          <RevealPaper 
            variant="flip" 
            threshold={0.1}
            delay={0.1}
            sx={{ 
              p: 3, 
              mb: 3,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-4px)'
              }
            }}>  
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Career Growth
            </Typography>
            {loadingEmployment ? (
              <Box sx={{ py: 4 }}>
                <Skeleton variant="rectangular" height={8} sx={{ borderRadius: 1, mb: 3 }} />
                <Grid container spacing={2}>
                  {[0,1,2].map((i) => (
                    <Grid item xs={4} key={i}>
                      <Skeleton variant="circular" width={50} height={50} sx={{ mx: 'auto', mb: 1 }} />
                      <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
                    </Grid>
                  ))}
                </Grid>
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
                        background: `linear-gradient(90deg, ${theme.palette.warning.main}, ${theme.palette.secondary.main}, ${theme.palette.info.main}, ${theme.palette.success.main}, ${theme.palette.error.main})`,
                        borderRadius: '4px',
                        zIndex: 1,
                        transform: 'translateY(-50%)'
                      }}
                    />
                    
                    {/* Career Positions */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', height: '300px' }}>
                      {employmentHistory
                        .sort((a, b) => a.start_year - b.start_year) // Sort chronologically
                        .map((job, index) => {
                          // Get position colors based on employment type
                          const getPositionColor = (type) => {
                            switch(type) {
                              case 'Permanent': return { main: theme.palette.success.main, light: alpha(theme.palette.success.main, 0.12) };
                              case 'Intern': return { main: theme.palette.warning.main, light: alpha(theme.palette.warning.main, 0.12) };
                              case 'Part Time': return { main: theme.palette.info.main, light: alpha(theme.palette.info.main, 0.12) };
                              case 'Contractual': return { main: theme.palette.secondary.main, light: alpha(theme.palette.secondary.main, 0.12) };
                              case 'Non Permanent': return { main: theme.palette.error.main, light: alpha(theme.palette.error.main, 0.12) };
                              default: return { main: theme.palette.primary.main, light: alpha(theme.palette.primary.main, 0.12) };
                            }
                          };
                          
                          const colors = [
                            { main: theme.palette.warning.main, bg: alpha(theme.palette.warning.main, 0.15), text: theme.palette.warning.dark },
                            { main: theme.palette.secondary.main, bg: alpha(theme.palette.secondary.main, 0.15), text: theme.palette.secondary.dark },
                            { main: theme.palette.info.main, bg: alpha(theme.palette.info.main, 0.15), text: theme.palette.info.dark },
                            { main: theme.palette.success.main, bg: alpha(theme.palette.success.main, 0.15), text: theme.palette.success.dark },
                            { main: theme.palette.error.main, bg: alpha(theme.palette.error.main, 0.15), text: theme.palette.error.dark }
                          ];
                          const color = colors[index % colors.length];
                          const isAbove = index % 2 === 0;
                          const isCurrentJob = job.end_year === 'Currently Working';
                          
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
                                  border: '2px solid',
                                  borderColor: 'common.white',
                                  backgroundColor: color.main,
                                  boxShadow: `0 0 0 2px ${color.main}, 0 2px 8px ${alpha(theme.palette.common.black, 0.15)}`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 'bold',
                                  fontSize: '12px',
                                  color: 'common.white',
                                  zIndex: 3
                                }}
                              >
                                {isCurrentJob ? 'Now' : job.start_year}
                                {isCurrentJob && (
                                  <Box sx={{
                                    position: 'absolute',
                                    top: -3,
                                    right: -3,
                                    width: 14,
                                    height: 14,
                                    borderRadius: '50%',
                                    backgroundColor: 'success.main',
                                    border: '3px solid',
                                    borderColor: 'common.white'
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
                                  boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.15)}`,
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
                                  {job.position}
                                </Typography>
                                
                                <Typography variant="body2" color="text.secondary" sx={{ 
                                  mb: 0.5,
                                  fontSize: '0.7rem',
                                  textAlign: 'center',
                                  lineHeight: 1.2
                                }}>
                                  {job.company}
                                </Typography>
                                
                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                                  <Chip 
                                    label={`${job.start_year} - ${isCurrentJob ? 'Present' : job.end_year}`}
                                    size="small"
                                    sx={{ 
                                      backgroundColor: color.main,
                                      color: 'common.white',
                                      fontSize: '0.65rem',
                                      fontWeight: 'bold'
                                    }}
                                  />
                                  {isCurrentJob && (
                                    <Chip
                                      label="Current"
                                      size="small"
                                      sx={{
                                        backgroundColor: 'success.main',
                                        color: 'common.white',
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
                                {job.employment_type}
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
                      No employment history found
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </RevealPaper>
          
          {/* Education History Section */}
          <RevealPaper 
            variant="slideUp" 
            threshold={0.1}
            delay={0.25}
            sx={{ 
              p: 3, 
              mb: 3,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-4px)'
              }
            }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Education Timeline
            </Typography>
            {loadingEducation ? (
              <Box sx={{ py: 4 }}>
                <Skeleton variant="rectangular" height={8} sx={{ borderRadius: 1, mb: 3 }} />
                <Grid container spacing={2}>
                  {[0,1,2,3].map((i) => (
                    <Grid item xs={3} key={i}>
                      <Skeleton variant="circular" width={50} height={50} sx={{ mx: 'auto', mb: 1 }} />
                      <Skeleton variant="rectangular" height={70} sx={{ borderRadius: 2 }} />
                    </Grid>
                  ))}
                </Grid>
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
                        background: `linear-gradient(90deg, ${theme.palette.warning.main}, ${theme.palette.secondary.main}, ${theme.palette.info.main}, ${theme.palette.success.main}, ${theme.palette.error.main})`,
                        borderRadius: '4px',
                        zIndex: 1,
                        transform: 'translateY(-50%)'
                      }}
                    />

                    {/* Education Items */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', height: '200px' }}>
                      {educationHistory
                        .sort((a, b) => {
                          const yearA = a.start_year ? parseInt(a.start_year) : 0;
                          const yearB = b.start_year ? parseInt(b.start_year) : 0;
                          return yearA - yearB;
                        })
                        .map((education, index) => {
                          const colors = [
                            { main: theme.palette.warning.main, bg: alpha(theme.palette.warning.main, 0.12), text: theme.palette.warning.dark }, // Orange
                            { main: theme.palette.secondary.main, bg: alpha(theme.palette.secondary.main, 0.12), text: theme.palette.secondary.dark }, // Purple
                            { main: theme.palette.info.main, bg: alpha(theme.palette.info.main, 0.12), text: theme.palette.info.dark }, // Blue
                            { main: theme.palette.success.main, bg: alpha(theme.palette.success.main, 0.12), text: theme.palette.success.dark }, // Green
                            { main: theme.palette.error.main, bg: alpha(theme.palette.error.main, 0.12), text: theme.palette.error.dark }  // Red
                          ];
                          const color = colors[index % colors.length];
                          const isAbove = index % 2 === 0;
                          const currentYear = new Date().getFullYear();
                          const isOngoing = education.end_year === 'ongoing' || (education.end_year && parseInt(education.end_year) > currentYear);

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
                                  border: '2px solid',
                                  borderColor: 'common.white',
                                  backgroundColor: color.main,
                                  boxShadow: `0 0 0 2px ${color.main}, 0 2px 8px ${alpha(theme.palette.common.black, 0.15)}`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 'bold',
                                  fontSize: '12px',
                                  color: 'common.white',
                                  zIndex: 3
                                }}
                              >
                                {isOngoing ? 'Now' : (education.end_year || education.start_year)}
                                {isOngoing && (
                                  <Box sx={{
                                    position: 'absolute',
                                    top: -3,
                                    right: -3,
                                    width: 14,
                                    height: 14,
                                    borderRadius: '50%',
                                    backgroundColor: 'success.main',
                                    border: '3px solid',
                                    borderColor: 'common.white'
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
                                  boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.15)}`,
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
                                  {education.degree}
                                </Typography>
                                
                                <Typography variant="body2" color="text.secondary" sx={{ 
                                  mb: 0.5,
                                  fontSize: '0.7rem',
                                  textAlign: 'center',
                                  lineHeight: 1.2
                                }}>
                                  {education.institution}
                                </Typography>
                                
                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                                  <Chip 
                                    label={`${education.start_year} - ${isOngoing ? 'Present' : education.end_year}`}
                                    size="small"
                                    sx={{ 
                                      backgroundColor: color.main,
                                      color: 'common.white',
                                      fontSize: '0.65rem',
                                      fontWeight: 'bold'
                                    }}
                                  />
                                  {isOngoing && (
                                    <Chip
                                      label="Current"
                                      size="small"
                                      sx={{
                                        backgroundColor: 'success.main',
                                        color: 'common.white',
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

                              {/* Education Type Label */}
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
                                {education.degree.toLowerCase().includes('phd') || education.degree.toLowerCase().includes('doctorate') ? 'Doctorate' :
                                 education.degree.toLowerCase().includes('master') || education.degree.toLowerCase().includes('m.') ? 'Post Graduation' :
                                 education.degree.toLowerCase().includes('bachelor') || education.degree.toLowerCase().includes('b.') ? 'Graduation' :
                                 education.degree.toLowerCase().includes('diploma') ? 'Diploma' : 'Education'}
                              </Typography>
                            </Box>
                          );
                        })
                      }
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No education history found in the resume
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </RevealPaper>

        </Grid>
      </Grid>
      </Box>

      {/* Back-to-top FAB */}
      <Zoom in={showFab}>
        <Fab
          color="primary"
          size="medium"
          onClick={() => typeof window !== 'undefined' && window.scrollTo({ top: 0, behavior: 'smooth' })}
          sx={{ position: 'fixed', bottom: 24, right: 24, boxShadow: 6 }}
          aria-label="back to top"
        >
          <KeyboardArrowUp />
        </Fab>
      </Zoom>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity || 'success'}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Error Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Notification"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {dialogMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary" autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
