import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Box, Typography, Button, Grid, Card, CardContent, TextField, Input, Stack,
  LinearProgress, Paper, Chip, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Divider, CircularProgress, Select, MenuItem, FormControl, Fade,
  Dialog, DialogTitle, DialogContent, DialogActions, Skeleton, List, ListItem,
  ListItemIcon, ListItemText
} from '@mui/material';
import { Phone, Email, WorkOutline, CheckCircle, Code } from '@mui/icons-material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Image from 'next/image';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { usePdfText } from '../src/context/PdfTextContext';
import { useToast } from '../src/context/ToastContext';
import Navigation from '../src/components/Navigation';
import { motion } from 'framer-motion';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

// Motion wrappers
const MotionBox = motion(Box);
const MotionButton = motion(Button);

export default function Home() {
  const [resumeFile, setResumeFile] = useState(null);
  const [description, setDescription] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [userJobRole, setUserJobRole] = useState('');
  const [showInsights, setShowInsights] = useState(false);
  const [pdfText, setPdfTextLocal] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadHint, setUploadHint] = useState('');
  const fileInputRef = useRef(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveDialogMessage, setSaveDialogMessage] = useState('');
  
  // Context values
  const { setPdfText, setJobRole: setContextJobRole, setDescription: setContextDescription, setUserName } = usePdfText();
  const router = require('next/router').useRouter ? require('next/router').useRouter() : require('next/router').default.useRouter();
  const { showToast } = useToast();
  
  // Reset all fields when landing on the index page
  useEffect(() => {
    // Reset local state
    setResumeFile(null);
    setDescription('');
    setJobDescription('');
    setUserJobRole('');
    setShowInsights(false);
    setPdfTextLocal('');
    
    // Reset context values
    setPdfText('');
    setContextJobRole('');
    setContextDescription('');
    setUserName('');
    
    console.log('All fields reset on index page load');
  }, []);
  
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
  const [loadingExperience, setLoadingExperience] = useState(false);
  const [experienceError, setExperienceError] = useState(null);
  
  // Recruiters Overview state variables
  const [recruitersOverview, setRecruitersOverview] = useState({
    bullets: [],
    relevant_experience: '',
    technical_proficiency: []
  });
  const [loadingRecruitersOverview, setLoadingRecruitersOverview] = useState(false);
  const [recruitersOverviewError, setRecruitersOverviewError] = useState(null);
  
  // Accessing userName from context
  const { userName } = usePdfText();
  
  // Helper function to check if all data is loaded
  const isAllDataLoaded = () => {
    return !loadingScore && !loadingContact && !loadingSummary && 
           !loadingCustomScores && !loadingOtherComments && 
           !loadingFunctionalConstituent && !loadingTechnicalConstituent && 
           !loadingEducation && !loadingProjects && !loadingEmployment &&
           !loadingExperience && !loadingRecruitersOverview;
  };

  // Upload validations and micro-interactions
  const maxFileSizeMB = 5; // limit file size to 5MB
  const acceptedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  const validateFile = (file) => {
    if (!file) return false;
    const typeOk = acceptedTypes.includes(file.type) || /\.(pdf|docx?|txt)$/i.test(file.name || '');
    const sizeOk = (file.size || 0) <= maxFileSizeMB * 1024 * 1024;
    if (!typeOk && !sizeOk) {
      setUploadHint(`Unsupported type and file too large (> ${maxFileSizeMB}MB).`);
      return false;
    }
    if (!typeOk) {
      setUploadHint('Unsupported file type. Please upload PDF, DOC, DOCX, or TXT.');
      return false;
    }
    if (!sizeOk) {
      setUploadHint(`File too large. Max size is ${maxFileSizeMB}MB.`);
      return false;
    }
    setUploadHint(`Ready: ${file.name} (${Math.round(file.size / 1024)} KB)`);
    return true;
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
    const file = e.target.files && e.target.files[0];
    if (file && validateFile(file)) {
      setResumeFile(file);
    } else if (file) {
      // keep previous valid file if any
      console.warn('Invalid file dropped/selected');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (file && validateFile(file)) {
      setResumeFile(file);
    }
  };

  // Hover lift style for tiles
  const liftTileSx = {
    transition: 'transform 180ms ease, box-shadow 180ms ease',
    '&:hover': {
      transform: 'translateY(-3px) scale(1.01)',
      boxShadow: 6
    }
  };

  // Function to call all APIs and handle responses progressively
  const callAllAPIs = async (resumeText, jobRole) => {
    try {
      // Clear previous data first
      setResumeScore(null);
      setResumeItems([]);
      setContactInfo({ mobile_number: '', email_id: '', color: '', comment: '' });
      setSummaryInfo({ score: 0, color: 'red', label: 'critical', comment: 'Loading summary analysis...', summary: [] });
      setCustomScores({ searchibility_score: 0, hard_skills_score: 0, soft_skill_score: 0, formatting_score: 0 });
      setOtherComments({ 
        headings_feedback: { score: 0, comment: '' }, 
        title_match: { score: 0, comment: '' }, 
        formatting_feedback: { score: 0, comment: '' } 
      });
      setFunctionalConstituent({ constituent: {}, industries: [], has_industry_experience: false, has_completed_college: false });
      setTechnicalConstituent({ high: [], medium: [], low: [] });
      setEducationHistory([]);
      setEmploymentHistory([]);
      setProjectsInfo([]);
      setTotalExperience(null);
      setRelevantExperience(null);
      setExperienceError(null);
      
      // Reset Recruiters Overview state
      setRecruitersOverview({
        bullets: [],
        relevant_experience: '',
        technical_proficiency: []
      });
      setRecruitersOverviewError(null);
      
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
      setLoadingExperience(true);
      setLoadingRecruitersOverview(true);

      // Define API calls with individual handlers
      const apiCalls = [
        { 
          name: 'scoreResume',
          url: 'http://127.0.0.1:8000/scoreResume',
          body: JSON.stringify({ resumeText, jobRole }),
          promise: null,
          handler: async (response) => {
            const data = await response.json();
            console.log('Score Resume API Response:', data);
            setResumeScore(data.score || 0);
            setResumeItems(data.items || []);
            setLoadingScore(false);
          }
        },
        {
          name: 'getContacts',
          url: 'http://127.0.0.1:8000/getContacts',
          body: JSON.stringify({ resumeText }),
          promise: null,
          handler: async (response) => {
            const data = await response.json();
            console.log('Contacts API Response:', data);
            setContactInfo(data);
            setLoadingContact(false);
          }
        },
        {
          name: 'getSummaryOverview',
          url: 'http://127.0.0.1:8000/getSummaryOverview',
          body: JSON.stringify({ resumeText, jobRole }),
          promise: null,
          handler: async (response) => {
            const data = await response.json();
            console.log('Summary Overview API Response:', data);
            setSummaryInfo(data);
            setLoadingSummary(false);
          }
        },
        {
          name: 'getCustomScores',
          url: 'http://127.0.0.1:8000/getCustomScores',
          body: JSON.stringify({ resumeText, jobRole }),
          promise: null,
          handler: async (response) => {
            const data = await response.json();
            console.log('Custom Scores API Response:', data);
            setCustomScores(data);
            setLoadingCustomScores(false);
          }
        },
        {
          name: 'getOtherComments',
          url: 'http://127.0.0.1:8000/getOtherComments',
          body: JSON.stringify({ resumeText, jobRole }),
          promise: null,
          handler: async (response) => {
            const data = await response.json();
            console.log('Other Comments API Response:', data);
            // Handle the new response structure with AspectFeedback objects
            setOtherComments(data);
            setLoadingOtherComments(false);
          }
        },
        {
          name: 'getFunctionalConstituent',
          url: 'http://127.0.0.1:8000/getFunctionalConstituent',
          body: JSON.stringify({ resumeText, jobRole }),
          promise: null,
          handler: async (response) => {
            const data = await response.json();
            console.log('Functional Constituent API Response:', data);
            setFunctionalConstituent(data);
            setLoadingFunctionalConstituent(false);
          }
        },
        {
          name: 'getTechnicalConstituent',
          url: 'http://127.0.0.1:8000/getTechnicalConstituent',
          body: JSON.stringify({ resumeText, jobRole }),
          promise: null,
          handler: async (response) => {
            const data = await response.json();
            console.log('Technical Constituent API Response:', data);
            setTechnicalConstituent(data);
            setLoadingTechnicalConstituent(false);
          }
        },
        {
          name: 'getEducation',
          url: 'http://127.0.0.1:8000/getEducation',
          body: JSON.stringify({ resumeText }),
          promise: null,
          handler: async (response) => {
            const data = await response.json();
            console.log('Education API Response:', data);
            if (Array.isArray(data)) {
              setEducationHistory(data);
            } else if (data && data.education) {
              setEducationHistory(Array.isArray(data.education) ? data.education : [data.education]);
            } else if (data && data.data) {
              setEducationHistory(Array.isArray(data.data) ? data.data : [data.data]);
            } else if (data && typeof data === 'object' && Object.keys(data).length > 0) {
              setEducationHistory([data]);
            } else {
              setEducationHistory([]);
            }
            setLoadingEducation(false);
          }
        },
        {
          name: 'getCompany',
          url: 'http://127.0.0.1:8000/getCompany',
          body: JSON.stringify({ resumeText }),
          promise: null,
          handler: async (response) => {
            const data = await response.json();
            console.log('Company API Response:', data);
            if (Array.isArray(data)) {
              setEmploymentHistory(data);
            } else if (data && data.employment_history) {
              setEmploymentHistory(Array.isArray(data.employment_history) ? data.employment_history : [data.employment_history]);
            } else if (data && data.data) {
              setEmploymentHistory(Array.isArray(data.data) ? data.data : [data.data]);
            } else if (data && typeof data === 'object' && Object.keys(data).length > 0) {
              setEmploymentHistory([data]);
            } else {
              setEmploymentHistory([]);
            }
            setLoadingEmployment(false);
          }
        },
        {
          name: 'getProjects',
          url: 'http://127.0.0.1:8000/getProjects',
          body: JSON.stringify({ resumeText, jobRole }),
          promise: null,
          handler: async (response) => {
            const data = await response.json();
            console.log('Projects API Response:', data);
            if (Array.isArray(data)) {
              setProjectsInfo(data);
            } else if (data && data.projects) {
              setProjectsInfo(Array.isArray(data.projects) ? data.projects : [data.projects]);
            } else if (data && data.data) {
              setProjectsInfo(Array.isArray(data.data) ? data.data : [data.data]);
            } else if (data && typeof data === 'object' && Object.keys(data).length > 0) {
              setProjectsInfo([data]);
            } else {
              setProjectsInfo([]);
            }
            setLoadingProjects(false);
          }
        },
        {
          name: 'getYoe',
          url: 'http://127.0.0.1:8000/getYoe',
          body: JSON.stringify({ resumeText, jobRole }),
          promise: null,
          handler: async (response) => {
            try {
              const data = await response.json();
              console.log('Experience API Response:', data);
              
              // Ensure data exists and has the expected properties
              if (data && typeof data === 'object') {
                // Handle various data formats (string, number, null, undefined)
                let totalYears = null;
                let relevantYears = null;
                
                // Process total years of experience
                if (data.yoe !== undefined && data.yoe !== null) {
                  totalYears = Number(data.yoe);
                  if (isNaN(totalYears)) totalYears = null;
                }
                
                // Process relevant years of experience
                if (data.ryoe !== undefined && data.ryoe !== null) {
                  relevantYears = Number(data.ryoe);
                  if (isNaN(relevantYears)) relevantYears = null;
                }
                
                console.log('Processed totalYears:', totalYears);
                console.log('Processed relevantYears:', relevantYears);
                
                // Update state with processed values
                setTotalExperience(totalYears);
                setRelevantExperience(relevantYears);
              } else {
                console.error('Invalid data format from getYoe API:', data);
                setExperienceError('Failed to parse experience data');
              }
            } catch (error) {
              console.error('Error processing getYoe response:', error);
              setExperienceError('Error processing experience data');
            } finally {
              setLoadingExperience(false);
            }
          }
        },
        {
          name: 'getRecruitersOverview',
          url: 'http://127.0.0.1:8000/getRecruitersOverview',
          body: JSON.stringify({ resumeText, jobRole }),
          promise: null,
          handler: async (response) => {
            const data = await response.json();
            console.log('Recruiters Overview API Response:', data);
            if (data && typeof data === 'object') {
              setRecruitersOverview({
                bullets: Array.isArray(data.bullets) ? data.bullets : [],
                relevant_experience: data.relevant_experience || '',
                technical_proficiency: Array.isArray(data.technical_proficiency) ? data.technical_proficiency : []
              });
            } else {
              setRecruitersOverview({
                bullets: [],
                relevant_experience: '',
                technical_proficiency: []
              });
            }
            setLoadingRecruitersOverview(false);
          }
        }
      ];

      // Add cache busting parameter to all API calls
      const timestamp = new Date().getTime();
      apiCalls.forEach(call => {
        const url = new URL(call.url);
        url.searchParams.append('_t', timestamp);
        call.promise = fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: call.body
        });
      });
      
      // Process each API call properly with Promise.all
      const processApiCall = async ({ name, promise, handler }) => {
        try {
          console.log(`Starting ${name} API call`);
          const response = await promise;
          if (response.ok) {
            await handler(response);
            console.log(`${name} API call completed successfully`);
          } else {
            console.error(`${name} API call failed:`, response.statusText);
            // Set appropriate loading state to false on error
            switch (name) {
              case 'scoreResume': setLoadingScore(false); break;
              case 'getContacts': setLoadingContact(false); break;
              case 'getSummaryOverview': setLoadingSummary(false); break;
              case 'getCustomScores': setLoadingCustomScores(false); break;
              case 'getOtherComments': setLoadingOtherComments(false); break;
              case 'getFunctionalConstituent': setLoadingFunctionalConstituent(false); break;
              case 'getTechnicalConstituent': setLoadingTechnicalConstituent(false); break;
              case 'getEducation': setLoadingEducation(false); break;
              case 'getCompany': setLoadingEmployment(false); break;
              case 'getProjects': setLoadingProjects(false); break;
              case 'getYoe': setLoadingExperience(false); setExperienceError('Failed to load experience data'); break;
              case 'getRecruitersOverview': setLoadingRecruitersOverview(false); setRecruitersOverviewError('Failed to load recruiters overview data'); break;
            }
          }
        } catch (error) {
          console.error(`Error in ${name} API call:`, error);
          // Set appropriate loading state to false on error
          switch (name) {
            case 'scoreResume': setLoadingScore(false); break;
            case 'getContacts': setLoadingContact(false); break;
            case 'getSummaryOverview': setLoadingSummary(false); break;
            case 'getCustomScores': setLoadingCustomScores(false); break;
            case 'getOtherComments': setLoadingOtherComments(false); break;
            case 'getFunctionalConstituent': setLoadingFunctionalConstituent(false); break;
            case 'getTechnicalConstituent': setLoadingTechnicalConstituent(false); break;
            case 'getEducation': setLoadingEducation(false); break;
            case 'getCompany': setLoadingEmployment(false); break;
            case 'getProjects': setLoadingProjects(false); break;
            case 'getYoe': setLoadingExperience(false); setExperienceError('Failed to load experience data'); break;
            case 'getRecruitersOverview': setLoadingRecruitersOverview(false); setRecruitersOverviewError('Failed to load recruiters overview data'); break;
          }
        }
      };
      
      // Execute all API calls in parallel but handle each one properly
      await Promise.all(apiCalls.map(processApiCall));

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
    setOtherComments({
      headings_feedback: { score: 0, comment: '' },
      title_match: { score: 0, comment: '' },
      formatting_feedback: { score: 0, comment: '' }
    });
    setFunctionalConstituent({});
    setTechnicalConstituent({});
    setEducationHistory([]);
    setEmploymentHistory([]);
    setProjectsInfo([]);
    setPdfTextLocal('');
    setIsDragOver(false);
    setUploadHint('');
    
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
    if (fileInputRef.current) {
      // Clear the native file input so label resets and same file can be re-selected
      fileInputRef.current.value = null;
    }
    
    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Form validity for CTA animation
  const isFormValid = !!(resumeFile && userJobRole.trim());

  // Remove default handleResumeSubmit, let upload trigger navigation

  return (
    <Box sx={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)', minHeight: '100vh', pb: 8 }}>
      <Navigation currentPage="Home" />

      {/* Hero Section */}
      <Box sx={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)', border: '1px solid #333333', borderRadius: 4, mt: 4, mb: 6, mx: 'auto', maxWidth: 1200, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', p: { xs: 3, md: 6 }, gap: { xs: 4, md: 0 } }}>
        <Box sx={{ flex: 1, px: { xs: 0, md: 3 } }}>
          <Typography variant="h3" fontWeight={700} gutterBottom>
            Professional <span style={{ color: '#00e676' }}>Resume Services</span>
          </Typography>
          <Typography sx={{ color: '#b0b0b0', fontSize: 18, mb: 2 }}>
            Upload your resume for instant insights, search stored resumes for job fit, and request personalized feedback — all in one place.
          </Typography>
          {/* Save Success Dialog */}
      <Dialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: 'background.paper',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            minWidth: { xs: 280, sm: 420 }
          }
        }}
      >
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <CheckCircleOutlineIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" fontWeight={700}>
              {saveDialogMessage || 'Resume Data Saved'}
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Your resume data has been saved successfully.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" onClick={() => setSaveDialogOpen(false)}>
            Close
          </Button>
          <Button variant="contained" onClick={() => setSaveDialogOpen(false)}>
            Done
          </Button>
        </DialogActions>
      </Dialog>

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
              sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#212121' } }}
              label="Name"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#212121' } }}>
              <Select
                value={userJobRole}
                onChange={(e) => setUserJobRole(e.target.value)}
                displayEmpty
                variant="outlined"
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1
                  }
                }}
              >
                <MenuItem value="" disabled>
                  <em>Select a job role</em>
                </MenuItem>
                <MenuItem value="Entry-Level / Junior Roles">Entry-Level / Junior Roles</MenuItem>
                <MenuItem value="IT Support Technician">IT Support Technician</MenuItem>
                <MenuItem value="Network Support Engineer">Network Support Engineer</MenuItem>
                <MenuItem value="QA Tester">QA Tester</MenuItem>
                <MenuItem value="IT Intern">IT Intern</MenuItem>
                <MenuItem value="Full Stack Developer">Full Stack Developer</MenuItem>
                <MenuItem value="Frontend Developer">Frontend Developer</MenuItem>
                <MenuItem value="Backend Developer">Backend Developer</MenuItem>
                <MenuItem value="Mobile App Developer (Android / iOS)">Mobile App Developer (Android / iOS)</MenuItem>
                <MenuItem value="DevOps Engineer">DevOps Engineer</MenuItem>
                <MenuItem value="Cloud Engineer">Cloud Engineer</MenuItem>
                <MenuItem value="Site Reliability Engineer (SRE)">Site Reliability Engineer (SRE)</MenuItem>
                <MenuItem value="Network Engineer">Network Engineer</MenuItem>
                <MenuItem value="Cloud Infrastructure Engineer">Cloud Infrastructure Engineer</MenuItem>
                <MenuItem value="IT Infrastructure Manager">IT Infrastructure Manager</MenuItem>
                <MenuItem value="Cybersecurity Analyst">Cybersecurity Analyst</MenuItem>
                <MenuItem value="Data Analyst">Data Analyst</MenuItem>
                <MenuItem value="Business Intelligence (BI) Developer">Business Intelligence (BI) Developer)</MenuItem>
                <MenuItem value="Data Engineer">Data Engineer</MenuItem>
                <MenuItem value="Data Scientist">Data Scientist</MenuItem>
                <MenuItem value="Machine Learning Engineer">Machine Learning Engineer</MenuItem>
                <MenuItem value="AI Engineer">AI Engineer</MenuItem>
                <MenuItem value="Database Administrator (DBA)">Database Administrator (DBA)</MenuItem>
                <MenuItem value="Automation Test Engineer">Automation Test Engineer</MenuItem>
                <MenuItem value="Performance Test Engineer">Performance Test Engineer</MenuItem>
                <MenuItem value="QA Lead / Manager">QA Lead / Manager</MenuItem>
                <MenuItem value="Scrum Master">Scrum Master</MenuItem>
                <MenuItem value="Product Owner">Product Owner</MenuItem>
                <MenuItem value="Product Manager">Product Manager</MenuItem>
                <MenuItem value="Program Manager">Program Manager</MenuItem>
                <MenuItem value="UI/UX Designer">UI/UX Designer</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <MotionBox
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              sx={{
                p: 1,
                borderRadius: 2,
                border: '2px dashed',
                borderColor: isDragOver ? '#00e676' : '#444',
                backgroundColor: isDragOver ? 'rgba(0, 230, 118, 0.06)' : 'transparent',
                transition: 'all 180ms ease',
                boxShadow: isDragOver ? '0 0 0 4px rgba(0, 230, 118, 0.12), 0 8px 24px rgba(0,0,0,0.35)' : 'none'
              }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.995 }}
           >
              <input
                accept=".pdf,.doc,.docx,.txt"
                style={{ display: 'none' }}
                id="main-resume-upload"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <label htmlFor="main-resume-upload">
                <MotionButton 
                  variant="contained" 
                  color="primary" 
                  component="span" 
                  fullWidth
                  sx={{ 
                    bgcolor: '#00e676', 
                    color: '#000000', 
                    fontWeight: 600, 
                    py: 1.5, 
                    borderRadius: 2, 
                    border: 'none', 
                    transition: 'box-shadow 160ms ease, background-color 0.2s ease',
                    boxShadow: isDragOver ? '0 8px 24px rgba(0, 230, 118, 0.35)' : 'none',
                    '&:hover': { 
                      bgcolor: '#00c853', 
                      color: '#000000'
                    } 
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {resumeFile ? resumeFile.name : 'Choose or Drop Resume (PDF/DOC/DOCX/TXT)'}
                </MotionButton>
              </label>

              <Fade in={Boolean(uploadHint)} timeout={200}>
                <Typography variant="caption" sx={{ display: 'block', mt: 1 }} color={uploadHint.startsWith('Ready') ? 'success.main' : 'warning.main'} aria-live="polite">
                  {uploadHint || ' '}
                </Typography>
              </Fade>
            </MotionBox>
          </Grid>
        </Grid>
        
        {/* Actions - Clear + Get Insights (Centered as a group) */}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 3, mb: 2 }}>
          <Button
            variant="outlined"
            color="error"
            onClick={handleClearAnalysis}
            sx={{
              fontWeight: 700,
              py: 1.5,
              px: 3,
              borderRadius: 2,
              height: '56px',
              minWidth: '140px',
            }}
          >
            Clear
          </Button>
          <MotionButton 
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
              minWidth: '200px',
              color: '#000000',
              transition: 'box-shadow 180ms ease, background-color 0.2s ease',
              boxShadow: isFormValid ? '0 8px 24px rgba(76, 175, 80, 0.35)' : 'none',
              '&:hover': {
                color: '#000000',
              },
              '&.Mui-disabled': {
                color: '#666666'
              }
            }}
            animate={{ scale: isFormValid ? 1.02 : 1 }}
            whileHover={isFormValid ? { scale: 1.04 } : {}}
            whileTap={{ scale: 0.98 }}
          >
            GET INSIGHTS
          </MotionButton>
        </Box>
      </Box>

      {/* Insights Section - Only show when analysis is triggered */}
      {showInsights && (
        <Box sx={{ maxWidth: 1400, mx: 'auto', px: 3, mt: 4 }}>           
          <Grid container spacing={3}>
            {/* Left Sidebar */}
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 1, mb: 3, ...liftTileSx }}>
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

              {/* Experience Cards */}
              <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 1, mb: 3, ...liftTileSx }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Total Experience Card */}
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Total Experience
                    </Typography>
                    {loadingExperience ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Skeleton variant="rounded" width={40} height={40} />
                        <Skeleton variant="text" width={100} />
                      </Box>
                    ) : experienceError ? (
                      <Typography variant="body2" color="error">
                        {experienceError}
                      </Typography>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <WorkOutline color={totalExperience !== null && totalExperience !== undefined ? "primary" : "disabled"} sx={{ fontSize: 32 }} />
                        <Typography 
                          variant="h6" 
                          fontWeight={600} 
                          color={totalExperience !== null && totalExperience !== undefined ? "primary.main" : "text.secondary"}
                        >
                          {totalExperience !== null && totalExperience !== undefined ? `${Number(totalExperience).toFixed(1)} years` : "Not available"}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Relevant Experience Card */}
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Relevant Experience
                    </Typography>
                    {loadingExperience ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Skeleton variant="rounded" width={40} height={40} />
                        <Skeleton variant="text" width={100} />
                      </Box>
                    ) : experienceError ? (
                      <Typography variant="body2" color="error">
                        {experienceError}
                      </Typography>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <WorkOutline color={relevantExperience !== null && relevantExperience !== undefined ? "success" : "disabled"} sx={{ fontSize: 32 }} />
                        <Typography 
                          variant="h6" 
                          fontWeight={600} 
                          color={relevantExperience !== null && relevantExperience !== undefined ? "success.main" : "text.secondary"}
                        >
                          {relevantExperience !== null && relevantExperience !== undefined ? `${Number(relevantExperience).toFixed(1)} years` : "Not available"}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Paper>


              {/* Detailed Scores with Contact Information */}
              <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 1, mb: 3, ...liftTileSx }}>
                {/* Detailed Scores Section */}
                <Box sx={{ mb: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="body1" fontWeight={600} gutterBottom sx={{ color: '#ffffff' }}>
                        Searchability
                      </Typography>
                      {loadingCustomScores ? (
                        <CircularProgress size={20} />
                      ) : (
                        <Box sx={{ 
                          height: 12, 
                          backgroundColor: '#333333', 
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
                      <Typography variant="body1" fontWeight={600} gutterBottom sx={{ color: '#ffffff' }}>
                        Hard Skills
                      </Typography>
                      {loadingCustomScores ? (
                        <CircularProgress size={20} />
                      ) : (
                        <Box sx={{ 
                          height: 12, 
                          backgroundColor: '#333333', 
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
                      <Typography variant="body1" fontWeight={600} gutterBottom sx={{ color: '#ffffff' }}>
                        Soft Skills
                      </Typography>
                      {loadingCustomScores ? (
                        <CircularProgress size={20} />
                      ) : (
                        <Box sx={{ 
                          height: 12, 
                          backgroundColor: '#333333', 
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
                      <Typography variant="body1" fontWeight={600} gutterBottom sx={{ color: '#ffffff' }}>
                        Formatting
                      </Typography>
                      {loadingCustomScores ? (
                        <CircularProgress size={20} />
                      ) : (
                        <Box sx={{ 
                          height: 12, 
                          backgroundColor: '#333333', 
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
                  backgroundColor: '#212121', 
                  borderRadius: 2, 
                  p: 2.5,
                  border: '1px solid #333333'
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
                          <Typography variant="body2" fontWeight={600} sx={{ color: '#ffffff' }}>
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
                          <Typography variant="body2" fontWeight={600} sx={{ color: '#ffffff' }}>
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
              <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 1, mb: 3, ...liftTileSx }}>
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
              <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 1, ...liftTileSx }}>
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
                        backgroundColor: 'rgba(76, 175, 80, 0.1)', 
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
                        backgroundColor: 'rgba(255, 152, 0, 0.1)', 
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
                        backgroundColor: 'rgba(244, 67, 54, 0.1)', 
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

              {/* Recruiters Overview Section */}
              <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 1, mb: 3, ...liftTileSx }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Recruiters Overview
                </Typography>
                
                {loadingRecruitersOverview ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Skeleton variant="text" width="80%" height={30} />
                    <Box sx={{ pl: 2 }}>
                      <Skeleton variant="text" width="90%" />
                      <Skeleton variant="text" width="75%" />
                      <Skeleton variant="text" width="85%" />
                    </Box>
                    <Skeleton variant="text" width="60%" height={30} />
                    <Box sx={{ pl: 2 }}>
                      <Skeleton variant="text" width="70%" />
                      <Skeleton variant="text" width="80%" />
                    </Box>
                  </Box>
                ) : recruitersOverviewError ? (
                  <Typography variant="body2" color="error">
                    {recruitersOverviewError}
                  </Typography>
                ) : recruitersOverview.bullets.length === 0 && 
                   !recruitersOverview.relevant_experience && 
                   recruitersOverview.technical_proficiency.length === 0 ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      No recruiter overview data available
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Relevant Experience Summary */}
                    {recruitersOverview.relevant_experience && (
                      <Typography variant="body1">
                        {recruitersOverview.relevant_experience}
                      </Typography>
                    )}
                    
                    {/* Recruiter-friendly Bullet Points */}
                    {recruitersOverview.bullets && recruitersOverview.bullets.length > 0 && (
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                          Key Highlights
                        </Typography>
                        <List dense>
                          {recruitersOverview.bullets.map((bullet, index) => (
                            <ListItem key={index} sx={{ py: 0.5 }}>
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <Code color="primary" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary={bullet} />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                    
                    {/* Technical Proficiencies */}
                    {recruitersOverview.technical_proficiency && recruitersOverview.technical_proficiency.length > 0 && (
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                          Technical Proficiencies
                        </Typography>
                        <List dense>
                          {recruitersOverview.technical_proficiency.map((tech, index) => (
                            <ListItem key={index} sx={{ py: 0.5 }}>
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <Code color="primary" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary={tech} />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Main Content */}
            <Grid item xs={12} md={9}>
              {/* Summary Analysis */}
              <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 1, mb: 3, ...liftTileSx }}>
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
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ color: '#ffffff' }}>
                          Resume Summary
                        </Typography>
                        <Box sx={{ 
                          backgroundColor: '#212121',
                          p: 3,
                          borderRadius: 2,
                          border: '1px solid #333333',
                          mb: 2
                        }}>
                          {summaryInfo.summary.map((summaryPoint, index) => (
                            <Typography 
                              key={index} 
                              variant="body2" 
                              sx={{ 
                                mb: index < summaryInfo.summary.length - 1 ? 1.5 : 0,
                                lineHeight: 1.6,
                                color: '#ffffff'
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
                      backgroundColor: '#2a2a2a',
                      p: 2,
                      borderRadius: 1,
                      border: '1px solid #333333'
                    }}>
                      {summaryInfo.comment || 'Analyzing summary...'}
                    </Typography>
                  </Box>
                )}
              </Paper>

              {/* Projects */}
              <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 1, mb: 3, ...liftTileSx }}>
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
                            backgroundColor: '#1a1a1a',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                            '&:hover': {
                              boxShadow: '0 12px 40px rgba(0, 230, 118, 0.15)',
                              transform: 'translateY(-2px)',
                              transition: 'all 0.3s ease'
                            }
                          }}>
                            {/* Project Title */}
                            <Typography variant="h6" fontWeight={600} sx={{ mb: 1.5, color: '#ffffff' }}>
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
                                          backgroundColor: 'rgba(33, 150, 243, 0.1)'
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
              <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 1, mb: 3, ...liftTileSx }}>
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
                        <TableRow sx={{ backgroundColor: '#2a2a2a' }}>
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
                            {otherComments.headings_feedback ? (
                              <Chip 
                                label={`${otherComments.headings_feedback.score}/100`}
                                size="small"
                                sx={{ 
                                  backgroundColor: otherComments.headings_feedback.score >= 80 ? '#4caf50' : 
                                                 otherComments.headings_feedback.score >= 60 ? '#ff9800' : '#f44336',
                                  color: 'white',
                                  fontWeight: 600
                                }}
                              />
                            ) : (
                              <Chip 
                                label="Good"
                                size="small"
                                sx={{ 
                                  backgroundColor: '#4caf50',
                                  color: 'white',
                                  fontWeight: 600
                                }}
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {otherComments.headings_feedback ? otherComments.headings_feedback.comment : 'Section headings are properly structured and ATS-friendly.'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        
                        {/* Job Title Match Row */}
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500 }}>Job Title Match</TableCell>
                          <TableCell>
                            {otherComments.title_match ? (
                              <Chip 
                                label={`${otherComments.title_match.score}/100`}
                                size="small"
                                sx={{ 
                                  backgroundColor: otherComments.title_match.score >= 80 ? '#4caf50' : 
                                                 otherComments.title_match.score >= 60 ? '#ff9800' : '#f44336',
                                  color: 'white',
                                  fontWeight: 600
                                }}
                              />
                            ) : (
                              <Chip 
                                label="Good"
                                size="small"
                                sx={{ 
                                  backgroundColor: '#4caf50',
                                  color: 'white',
                                  fontWeight: 600
                                }}
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {otherComments.title_match ? otherComments.title_match.comment : 'Job titles and experience align well with target roles.'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        
                        {/* Data Formatting Row */}
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500 }}>Data Formatting</TableCell>
                          <TableCell>
                            {otherComments.formatting_feedback ? (
                              <Chip 
                                label={`${otherComments.formatting_feedback.score}/100`}
                                size="small"
                                sx={{ 
                                  backgroundColor: otherComments.formatting_feedback.score >= 80 ? '#4caf50' : 
                                                 otherComments.formatting_feedback.score >= 60 ? '#ff9800' : '#f44336',
                                  color: 'white',
                                  fontWeight: 600
                                }}
                              />
                            ) : (
                              <Chip 
                                label="Good"
                                size="small"
                                sx={{ 
                                  backgroundColor: '#4caf50',
                                  color: 'white',
                                  fontWeight: 600
                                }}
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {otherComments.formatting_feedback ? otherComments.formatting_feedback.comment : 'Resume formatting is clean and ATS-compatible.'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>

              {/* Professional Timeline */}
              <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 1, mb: 3, ...liftTileSx }}>
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
              <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 1, mb: 3, ...liftTileSx }}>
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
                      headings_feedback: {
                        score: otherComments.headings_feedback?.score || 0,
                        comment: otherComments.headings_feedback?.comment || ''
                      },
                      title_match: {
                        score: otherComments.title_match?.score || 0,
                        comment: otherComments.title_match?.comment || ''
                      },
                      formatting_feedback: {
                        score: otherComments.formatting_feedback?.score || 0,
                        comment: otherComments.formatting_feedback?.comment || ''
                      }
                    },
                    "getEducation": educationHistory,
                    "scoreResume": {
                      score: resumeScore,
                      items: resumeItems
                    },
                    "getCompany": employmentHistory,
                    "getProjects": projectsInfo,
                    "getTechnicalConstituent": technicalConstituent,
                    "getFunctionalConstituent": functionalConstituent,
                    "getYoe": totalExperience,
                    "getRyoe": relevantExperience,
                    "getRecruitersOverview": recruitersOverview
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
                    
                    if (result.response === "Failed") {
                      console.error('Backend reported failure saving resume data');
                      showToast('Failed to save resume data. Database error occurred.', 'error', null);
                    } else {
                      setSaveDialogMessage('Resume Data Saved');
                      setSaveDialogOpen(true);
                    }
                  } else {
                    console.error('Failed to save resume data:', response.status);
                    showToast('Failed to save resume data. Please try again.', 'error', null);
                  }
                  
                } catch (error) {
                  console.error('Error saving resume data:', error);
                  showToast('Error saving resume data. Please try again.', 'error', null);
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
