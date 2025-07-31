import React, { useState, useEffect } from 'react';
import { Box, Typography, LinearProgress, Grid, Paper, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Divider } from '@mui/material';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const functionalData = {
  labels: ['Management', 'Operations', 'Sales'],
  datasets: [
    {
      label: 'Functional Exposure',
      data: [40, 35, 25],
      backgroundColor: [
        'rgba(33, 150, 243, 0.7)',
        'rgba(76, 175, 80, 0.7)',
        'rgba(255, 193, 7, 0.7)'
      ],
      borderColor: [
        'rgba(33, 150, 243, 1)',
        'rgba(76, 175, 80, 1)',
        'rgba(255, 193, 7, 1)'
      ],
      borderWidth: 1,
    },
  ],
};

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
  // Access the extracted PDF text from context
  const { pdfText } = usePdfText();
  const [resumeScore, setResumeScore] = useState(null);
  const [loadingScore, setLoadingScore] = useState(false);
  const [scoreError, setScoreError] = useState(null);
  useEffect(() => {
    if (!pdfText) return;
    setLoadingScore(true);
    setScoreError(null);
    fetch('http://127.0.0.1:5000/scoreResume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeText: pdfText }),
    })
      .then(res => res.json())
      .then(data => {
        setResumeScore(data.score);
        setLoadingScore(false);
      })
      .catch(err => {
        console.error('Failed to fetch score:', err);
        setScoreError('Failed to fetch score');
        setLoadingScore(false);
      });
  }, [pdfText]);
  // You can now process pdfText as needed below (do not display it directly)
  
  return (
    <Box sx={{ background: '#f7faff', minHeight: '100vh', p: 4 }}>
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
            <LinearProgress variant="determinate" value={91} sx={{ height: 10, borderRadius: 5, mb: 3 }} color="success" />
            <Chip label="Upload & re-scan" color="primary" sx={{ width: '100%', mb: 2 }} />
            <Box sx={{ textAlign: 'left', mt: 2 }}>
              <Typography variant="body2" fontWeight={700}>Searchability</Typography>
              <LinearProgress variant="determinate" value={80} sx={{ height: 8, borderRadius: 5, mb: 1 }} color="primary" />
              <Typography variant="body2" fontWeight={700}>Hard Skills</Typography>
              <LinearProgress variant="determinate" value={75} sx={{ height: 8, borderRadius: 5, mb: 1 }} color="info" />
              <Typography variant="body2" fontWeight={700}>Soft Skills</Typography>
              <LinearProgress variant="determinate" value={90} sx={{ height: 8, borderRadius: 5, mb: 1 }} color="success" />
              <Typography variant="body2" fontWeight={700}>Recruiter Tips</Typography>
              <LinearProgress variant="determinate" value={70} sx={{ height: 8, borderRadius: 5, mb: 1 }} color="warning" />
              <Typography variant="body2" fontWeight={700}>Formatting</Typography>
              <LinearProgress variant="determinate" value={95} sx={{ height: 8, borderRadius: 5, mb: 1 }} color="secondary" />
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
                  <TableRow>
                    <TableCell>ATS Tip</TableCell>
                    <TableCell><Chip label="Missing" color="error" size="small" /></TableCell>
                    <TableCell>Add a job title & company name and web address on the top of your resume. ATS-specific tips.</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Contact</TableCell>
                    <TableCell><Chip label="Good" color="success" size="small" /></TableCell>
                    <TableCell>You provided your email. Recruiters use your email to contact you for job matches. You provided your phone number.</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Summary</TableCell>
                    <TableCell><Chip label="Good" color="success" size="small" /></TableCell>
                    <TableCell>We found a summary section on your resume. Good job! The summary provides a quick overview of the candidate's qualifications, helping recruiters quickly assess fit for the position.</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Section Headings</TableCell>
                    <TableCell><Chip label="Good" color="success" size="small" /></TableCell>
                    <TableCell>You have proper section titles like "Work History" or "Professional Experience" or ATS-recognizable work sections.</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Job Title Match</TableCell>
                    <TableCell><Chip label="Warning" color="warning" size="small" /></TableCell>
                    <TableCell>The Business Systems Analyst, DevOps job title provided in the job description was not found in your resume. We recommend having your most recent job title match the recruiter search by job title. If you haven't held this position before, include it as part of your summary or skills section.</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Data Formatting</TableCell>
                    <TableCell><Chip label="Good" color="success" size="small" /></TableCell>
                    <TableCell>The dates in your work experience section are properly formatted/standardized.</TableCell>
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
                  <Pie data={functionalData} style={{ maxHeight: '180px', maxWidth: '100%' }} />
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
  );
}
