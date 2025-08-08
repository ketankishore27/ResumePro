import React, { useState, useEffect } from 'react';
import { Box, Typography, LinearProgress, Grid, Paper, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Divider, Button, CircularProgress, Card, CardContent } from '@mui/material';
import { Phone, Email } from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);





import { usePdfText } from '../src/context/PdfTextContext';



export default function ResumeInsights() {
  // Access the extracted PDF text, job role, and user name from context
  const { pdfText, jobRole, setPdfText, userName } = usePdfText();
  
  // Debug context values
  console.log('ResumeInsights component loaded');
  console.log('pdfText from context:', pdfText ? `Available (${pdfText.length} chars)` : 'Not available');
  console.log('jobRole from context:', jobRole || 'Not available');
  console.log('userName from context:', userName || 'Not available');
  const [resumeScore, setResumeScore] = useState(null);
  const [loadingScore, setLoadingScore] = useState(false);
  const [scoreError, setScoreError] = useState(null);
  const [newResumeFile, setNewResumeFile] = useState(null);
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

  // Cache state variables
  const [cache, setCache] = useState({});
  const [lastInputHash, setLastInputHash] = useState(null);

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

    // Check if input data has changed
    const currentInputHash = createInputHash(pdfText, jobRole);
    if (currentInputHash === lastInputHash && cache[currentInputHash]) {
      console.log('Input data unchanged, using cached results');
      const cachedData = cache[currentInputHash];
      
      // Restore cached data
      setResumeScore(cachedData.resumeScore);
      setResumeItems(cachedData.resumeItems || []);
      setContactInfo(cachedData.contactInfo);
      setSummaryInfo(cachedData.summaryInfo);
      setCustomScores(cachedData.customScores);
      setOtherComments(cachedData.otherComments);
      setFunctionalConstituent(cachedData.functionalConstituent);
      setTechnicalConstituent(cachedData.technicalConstituent);
      setEducationHistory(cachedData.educationHistory);
      setProjectsInfo(cachedData.projectsInfo);
      setEmploymentHistory(cachedData.employmentHistory || []);
      
      // Set loading states to false
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
      setScoreError(null);
      
      return;
    }

    console.log('Input data changed or no cache available, making API calls');
    setLastInputHash(currentInputHash);
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
    setScoreError(null);
    console.log(pdfText);
    console.log(jobRole);
    
    const scoreRequest = fetch('http://127.0.0.1:8000/scoreResume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeText: pdfText,
        jobRole: jobRole
      }),
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
    
    const contactRequest = fetch('http://127.0.0.1:8000/getContacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeText: pdfText,
        jobRole: jobRole
      }),
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
    
    const summaryRequest = fetch('http://127.0.0.1:8000/getSummaryOverview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeText: pdfText,
        jobRole: jobRole
      }),
    })
      .then(res => res.json())
      .then(data => {
        console.log('Received summary response:', data);
        setSummaryInfo({
          score: data.score || 0,
          color: data.color || 'red',
          label: data.label || 'critical',
          comment: data.comment || 'Summary analysis not available',
          summary: data.summary || []
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
          comment: 'Failed to analyze summary section',
          summary: []
        });
        setLoadingSummary(false);
      });
    
    const customScoresRequest = fetch('http://127.0.0.1:8000/getCustomScores', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeText: pdfText,
        jobRole: jobRole
      }),
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
    
    const otherCommentsRequest = fetch('http://127.0.0.1:8000/getOtherComments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeText: pdfText,
        jobRole: jobRole
      }),
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
    
    const functionalConstituentRequest = fetch('http://127.0.0.1:8000/getFunctionalConstituent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeText: pdfText,
        jobRole: jobRole
      }),
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
    
    const technicalConstituentRequest = fetch('http://127.0.0.1:8000/getTechnicalConstituent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeText: pdfText,
        jobRole: jobRole
      }),
    })
      .then(res => {
        console.log('Technical constituent response status:', res.status);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Received technical constituent response:', data);
        setTechnicalConstituent({
          high: data.high || [],
          medium: data.medium || [],
          low: data.low || []
        });
        setLoadingTechnicalConstituent(false);
      })
      .catch(err => {
        console.error('Failed to fetch technical constituent:', err);
        console.error('Technical constituent API error details:', err.message);
        setTechnicalConstituent({ 
          high: ['Python', 'React', 'Node.js'],
          medium: ['SQL', 'Docker', 'AWS'],
          low: ['PHP', 'jQuery', 'Bootstrap']
        });
        setLoadingTechnicalConstituent(false);
      });
    
    const educationRequest = fetch('http://127.0.0.1:8000/getEducation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeText: pdfText
      }),
    })
      .then(res => {
        console.log('Education response status:', res.status);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Received education response:', data);
        setEducationHistory(Array.isArray(data) ? data : []);
        setLoadingEducation(false);
      })
      .catch(err => {
        console.error('Failed to fetch education history:', err);
        console.error('Education API error details:', err.message);
        // Set some test data for debugging
        setEducationHistory([
          {
            degree: 'M.Tech in Data Science and Engineering',
            institution: 'BITS - Work Integrated',
            start_year: 2021,
            end_year: 2023
          },
          {
            degree: 'B.Tech. in Electronics and Communication',
            institution: 'SRM University, Chennai',
            start_year: 2013,
            end_year: 2017
          }
        ]);
        setLoadingEducation(false);
      });
    
    const projectsRequest = fetch('http://127.0.0.1:8000/getProjects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeText: pdfText,
        jobRole: jobRole
      }),
    })
      .then(res => {
        console.log('Projects response status:', res.status);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Received projects response:', data);
        setProjectsInfo(Array.isArray(data.projects) ? data.projects : []);
        setLoadingProjects(false);
      })
      .catch(err => {
        console.error('Failed to fetch projects:', err);
        console.error('Projects API error details:', err.message);
        // Set some test data for debugging
        setProjectsInfo([
          {
            title: 'E-commerce Web Application',
            description: 'Developed a full-stack e-commerce platform with user authentication, shopping cart, and payment integration.',
            technologies: ['React', 'Node.js', 'MongoDB', 'Express.js', 'Stripe API'],
            duration: '3 months'
          },
          {
            title: 'Data Analytics Dashboard',
            description: 'Created an interactive dashboard for business intelligence with real-time data visualization.',
            technologies: ['Python', 'Flask', 'D3.js', 'PostgreSQL', 'Chart.js'],
            duration: '2 months'
          }
        ]);
        setLoadingProjects(false);
      });
    
    const employmentRequest = fetch('http://127.0.0.1:8000/getCompany', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeText: pdfText
      }),
    })
      .then(res => {
        console.log('Employment response status:', res.status);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Received employment response:', data);
        setEmploymentHistory(Array.isArray(data.employment_history) ? data.employment_history : []);
        setLoadingEmployment(false);
      })
      .catch(err => {
        console.error('Failed to fetch employment history:', err);
        console.error('Employment API error details:', err.message);
        // Set some test data for debugging
        setEmploymentHistory([
          {
            company: 'Deutsche Telekom AG',
            position: 'Senior Software Engineer',
            start_year: 2020,
            end_year: 'Currently Working',
            employment_type: 'Permanent'
          },
          {
            company: 'Tech Solutions Inc',
            position: 'Software Developer',
            start_year: 2018,
            end_year: 2020,
            employment_type: 'Permanent'
          }
        ]);
        setLoadingEmployment(false);
      });
    
    // Log when all requests complete
    Promise.allSettled([scoreRequest, contactRequest, summaryRequest, customScoresRequest, otherCommentsRequest, functionalConstituentRequest, technicalConstituentRequest, educationRequest, projectsRequest, employmentRequest]).then((results) => {
      console.log('All async requests completed:', results);
    });
  }, [pdfText]);

  // Cache results after all data is loaded
  useEffect(() => {
    // Only cache if we have a valid input hash and all loading states are false
    if (lastInputHash && 
        !loadingScore && !loadingContact && !loadingSummary && 
        !loadingCustomScores && !loadingOtherComments && 
        !loadingFunctionalConstituent && !loadingTechnicalConstituent && 
        !loadingEducation && !loadingProjects && !loadingEmployment) {
      
      const cacheData = {
        resumeScore,
        resumeItems,
        contactInfo,
        summaryInfo,
        customScores,
        otherComments,
        functionalConstituent,
        technicalConstituent,
        educationHistory,
        projectsInfo,
        employmentHistory
      };
      
      setCache(prevCache => ({
        ...prevCache,
        [lastInputHash]: cacheData
      }));
      
      console.log('Results cached for input hash:', lastInputHash);
    }
  }, [lastInputHash, loadingScore, loadingContact, loadingSummary, loadingCustomScores, 
      loadingOtherComments, loadingFunctionalConstituent, loadingTechnicalConstituent, 
      loadingEducation, loadingProjects, loadingEmployment, resumeScore, resumeItems, contactInfo, 
      summaryInfo, customScores, otherComments, functionalConstituent, 
      technicalConstituent, educationHistory, projectsInfo, employmentHistory]);

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
      setLoadingTechnicalConstituent(true);
      setLoadingEducation(true);
      setLoadingProjects(true);
      setLoadingEmployment(true);
      setLoadingEmployment(true);
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
        const reuploadScoreRequest = fetch('http://127.0.0.1:8000/scoreResume', {
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
        const reuploadContactRequest = fetch('http://127.0.0.1:8000/getContacts', {
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
        const reuploadSummaryRequest = fetch('http://127.0.0.1:8000/getSummaryOverview', {
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
              comment: data.comment || 'Summary analysis not available',
              summary: data.summary || []
            });
            setLoadingSummary(false);
          })
          .catch(err => {
            console.error('Failed to fetch summary info for re-upload:', err);
            setSummaryInfo({ 
              score: 0,
              color: 'red', 
              label: 'critical',
              comment: 'Failed to analyze summary section',
              summary: []
            });
            setLoadingSummary(false);
          });
        
        // Request 4: Custom Scores for re-upload (async)
        const reuploadCustomScoresRequest = fetch('http://127.0.0.1:8000/getCustomScores', {
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
        const reuploadOtherCommentsRequest = fetch('http://127.0.0.1:8000/getOtherComments', {
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
        const reuploadFunctionalConstituentRequest = fetch('http://127.0.0.1:8000/getFunctionalConstituent', {
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
        
        // Request 7: Technical Constituent for re-upload (async)
        const reuploadTechnicalConstituentRequest = fetch('http://127.0.0.1:8000/getTechnicalConstituent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeText: text, jobRole: jobRole }),
        })
          .then(res => res.json())
          .then(data => {
            console.log('Received re-upload technical constituent response:', data);
            setTechnicalConstituent({
              high: data.high || [],
              medium: data.medium || [],
              low: data.low || []
            });
            setLoadingTechnicalConstituent(false);
          })
          .catch(err => {
            console.error('Failed to fetch technical constituent for re-upload:', err);
            setTechnicalConstituent({ 
              high: [],
              medium: [],
              low: []
            });
            setLoadingTechnicalConstituent(false);
          });
        
        // Request 8: Education History for re-upload (async)
        const reuploadEducationRequest = fetch('http://127.0.0.1:8000/getEducation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeText: text }),
        })
          .then(res => {
            console.log('Education re-upload response status:', res.status);
            if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
          })
          .then(data => {
            console.log('Received re-upload education response:', data);
            setEducationHistory(Array.isArray(data) ? data : []);
            setLoadingEducation(false);
          })
          .catch(err => {
            console.error('Failed to fetch education history for re-upload:', err);
            console.error('Education re-upload API error details:', err.message);
            setEducationHistory([]);
            setLoadingEducation(false);
          });
        
        // Request 9: Projects for re-upload (async)
        const reuploadProjectsRequest = fetch('http://127.0.0.1:8000/getProjects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeText: text, jobRole: jobRole }),
        })
          .then(res => {
            console.log('Projects re-upload response status:', res.status);
            if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
          })
          .then(data => {
            console.log('Received re-upload projects response:', data);
            setProjectsInfo(Array.isArray(data.projects) ? data.projects : []);
            setLoadingProjects(false);
          })
          .catch(err => {
            console.error('Failed to fetch projects for re-upload:', err);
            console.error('Projects re-upload API error details:', err.message);
            setProjectsInfo([]);
            setLoadingProjects(false);
          });
        
        // Request 10: Employment History for re-upload (async)
        const reuploadEmploymentRequest = fetch('http://127.0.0.1:8000/getCompany', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeText: text }),
        })
          .then(res => {
            console.log('Employment re-upload response status:', res.status);
            if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
          })
          .then(data => {
            console.log('Received re-upload employment response:', data);
            setEmploymentHistory(Array.isArray(data.employment_history) ? data.employment_history : []);
            setLoadingEmployment(false);
          })
          .catch(err => {
            console.error('Failed to fetch employment history for re-upload:', err);
            console.error('Employment re-upload API error details:', err.message);
            setEmploymentHistory([]);
            setLoadingEmployment(false);
          });
        
        // Optional: Log when all re-upload requests complete
        Promise.allSettled([reuploadScoreRequest, reuploadContactRequest, reuploadSummaryRequest, reuploadCustomScoresRequest, reuploadOtherCommentsRequest, reuploadFunctionalConstituentRequest, reuploadTechnicalConstituentRequest, reuploadEducationRequest, reuploadProjectsRequest, reuploadEmploymentRequest]).then((results) => {
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
          
          {/* Functional Exposure Section */}
          <Paper sx={{ p: 3, mt: 3 }}>
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
          
          {/* Technical Exposure Section */}
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>Technical Exposure</Typography>
            {loadingTechnicalConstituent ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {/* High Relevance Row */}
                <Grid item xs={12}>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600} color="success.main" gutterBottom>
                      High
                    </Typography>
                    <Box sx={{ minHeight: 60, backgroundColor: 'rgba(76, 175, 80, 0.1)', borderRadius: 1, p: 1, border: '1px solid', borderColor: 'success.main' }}>
                      {technicalConstituent.high && technicalConstituent.high.length > 0 ? (
                        technicalConstituent.high.map((skill, index) => (
                          <Chip 
                            key={index} 
                            label={skill} 
                            size="small" 
                            color="success" 
                            variant="outlined"
                            sx={{ m: 0.5, fontSize: '0.75rem' }}
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
                    <Box sx={{ minHeight: 60, backgroundColor: 'rgba(255, 152, 0, 0.1)', borderRadius: 1, p: 1, border: '1px solid', borderColor: 'warning.main' }}>
                      {technicalConstituent.medium && technicalConstituent.medium.length > 0 ? (
                        technicalConstituent.medium.map((skill, index) => (
                          <Chip 
                            key={index} 
                            label={skill} 
                            size="small" 
                            color="warning" 
                            variant="outlined"
                            sx={{ m: 0.5, fontSize: '0.75rem' }}
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
                    <Box sx={{ minHeight: 60, backgroundColor: 'rgba(244, 67, 54, 0.1)', borderRadius: 1, p: 1, border: '1px solid', borderColor: 'error.main' }}>
                      {technicalConstituent.low && technicalConstituent.low.length > 0 ? (
                        technicalConstituent.low.map((skill, index) => (
                          <Chip 
                            key={index} 
                            label={skill} 
                            size="small" 
                            color="error" 
                            variant="outlined"
                            sx={{ m: 0.5, fontSize: '0.75rem' }}
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
          </Paper>
        </Grid>
        {/* Main Content */}
        <Grid item xs={12} md={9}>
          {/* Summary Section */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={700}>Summary</Typography>
            <Typography variant="body2" sx={{ my: 2 }}>
              AI-powered analysis of your resume summary section and overall presentation.
            </Typography>
            
            {loadingSummary ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={24} />
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
                
                <Typography variant="body2" sx={{ 
                  p: 2, 
                  backgroundColor: 'grey.50', 
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'grey.200'
                }}>
                  {summaryInfo.comment || 'No summary analysis available'}
                </Typography>
              </Box>
            )}
          </Paper>
          
          {/* Projects Section */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={700}>Projects</Typography>
            <Typography variant="body2" sx={{ my: 2 }}>
              AI-powered analysis of your project experience and technical implementations.
            </Typography>
            {loadingProjects ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box>
                {projectsInfo && projectsInfo.length > 0 ? (
                  <Grid container spacing={2}>
                    {projectsInfo.map((project, index) => (
                      <Grid item xs={12} md={6} key={index}>
                        <Card sx={{ 
                          height: '100%', 
                          border: '1px solid', 
                          borderColor: (project.score || 0) >= 80 ? 'success.main' : 
                                     (project.score || 0) >= 60 ? 'warning.main' : 'error.main'
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
                                    <Chip 
                                      key={techIndex}
                                      label={tech}
                                      size="small"
                                      variant="outlined"
                                      sx={{ fontSize: '0.75rem' }}
                                    />
                                  ))}
                                </Box>
                              </Box>
                            )}
                          </CardContent>
                        </Card>
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
          </Paper>
          
          {/* Resume Fixes Section */}
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
          
          {/* Professional Timeline Section */}
          <Paper sx={{ p: 3, mb: 3 }}>  
            <Typography variant="h6" fontWeight={700} gutterBottom>
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
                        .sort((a, b) => a.start_year - b.start_year) // Sort chronologically
                        .map((job, index) => {
                          // Get position colors based on employment type
                          const getPositionColor = (type) => {
                            switch(type) {
                              case 'Permanent': return { main: '#4CAF50', light: '#E8F5E8' };
                              case 'Intern': return { main: '#FF9800', light: '#FFF3E0' };
                              case 'Part Time': return { main: '#2196F3', light: '#E3F2FD' };
                              case 'Contractual': return { main: '#9C27B0', light: '#F3E5F5' };
                              case 'Non Permanent': return { main: '#F44336', light: '#FFEBEE' };
                              default: return { main: '#1976D2', light: '#E3F2FD' };
                            }
                          };
                          
                          const colors = [
                            { main: '#FF9800', bg: '#FFF3E0', text: '#E65100' }, // Orange
                            { main: '#9C27B0', bg: '#F3E5F5', text: '#6A1B9A' }, // Purple
                            { main: '#2196F3', bg: '#E3F2FD', text: '#1565C0' }, // Blue
                            { main: '#4CAF50', bg: '#E8F5E8', text: '#2E7D32' }, // Green
                            { main: '#F44336', bg: '#FFEBEE', text: '#C62828' }  // Red
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
                                {isCurrentJob ? 'Now' : job.start_year}
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
          </Paper>
          
          {/* Education History Section */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
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
                          const yearA = a.start_year ? parseInt(a.start_year) : 0;
                          const yearB = b.start_year ? parseInt(b.start_year) : 0;
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
                                {isOngoing ? 'Now' : (education.end_year || education.start_year)}
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
          </Paper>

          {/* Save Resume Button */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 3 }}>
            <Button 
              variant="contained" 
              size="large"
              disabled={!isAllDataLoaded()}
              sx={{ 
                px: 4, 
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                borderRadius: 2,
                boxShadow: isAllDataLoaded() ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                opacity: isAllDataLoaded() ? 1 : 0.6,
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
                      job_role: jobRole || 'Not provided'
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
                    "getTechnicalConstituent": {
                      high: technicalConstituent.high,
                      medium: technicalConstituent.medium,
                      low: technicalConstituent.low
                    },
                    "getCompany": employmentHistory,
                    "getProjects": projectsInfo
                  };
                  
                  console.log('Accumulated data to send:', accumulatedData);
                  
                  // Send accumulated data to assembleData endpoint
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

        </Grid>
      </Grid>
      </Box>
    </Box>
  );
}
