import * as React from 'react';
import Link from 'next/link';
import {
  Box, Typography, Button, Grid, Card, CardContent, TextField, Input, Stack
} from '@mui/material';
import Image from 'next/image';

import { useState } from 'react';

export default function Home() {
  const [resumeFile, setResumeFile] = useState(null);
  const router = require('next/router').useRouter ? require('next/router').useRouter() : require('next/router').default.useRouter();
  const handleResumeSubmit = () => {
    if (resumeFile) {
      router.push('/insights');
    }
  }
  return (
    <Box sx={{ background: '#f7faff', minHeight: '100vh', pb: 8 }}>
      {/* Navbar-like Header */}
      <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: 0.5 }}>
          Resume<span style={{ color: '#2563eb' }}>Pro</span>
        </Typography>
        <Button component={Link} href="/request" variant="contained" color="success" sx={{ fontWeight: 700, borderRadius: 2 }}>
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

      {/* Feature Cards */}
      <Grid container spacing={3} sx={{ maxWidth: 1300, mx: 'auto' }}>
        {/* Resume Insights */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', minHeight: 370, borderRadius: 3, boxShadow: 2, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'stretch' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', height: 1, p: 0 }}>
              <Box sx={{ textAlign: 'center', mb: 2, mt: 2 }}>
                <Image src="/resume_insight_icon.png" alt="Resume Insight Icon" width={70} height={70} style={{ marginBottom: 8 }} />
              </Box>
              <Typography variant="h5" fontWeight={700} align="center" gutterBottom>
                Resume Insights
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center" sx={{ fontStyle: 'italic', mb: 2 }}>
                Use this section to understand what your resume says to the recruiter. Also this section suggests the improvement
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
                <input
                  accept=".pdf,.doc,.docx,.txt"
                  style={{ display: 'none' }}
                  id="resume-upload"
                  type="file"
                  onChange={e => setResumeFile(e.target.files[0])}
                />
                <label htmlFor="resume-upload">
                  <Button variant="outlined" color="success" component="span" sx={{ width: '100%' }}>
                    {resumeFile ? resumeFile.name : 'Choose PDF or Word File'}
                  </Button>
                </label>
              </Box>
              <Box sx={{ flexGrow: 1 }} />
              <Button variant="contained" color="success" sx={{ fontWeight: 700, width: '100%', mb: 2 }} disabled={!resumeFile} onClick={handleResumeSubmit}>
                Submit Resume
              </Button>
            </CardContent>
          </Card>
        </Grid>
        {/* Resume Requests */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', minHeight: 370, borderRadius: 3, boxShadow: 2, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'stretch' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', height: 1, p: 0 }}>
              <Box sx={{ minHeight: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
                <Box sx={{ textAlign: 'center', mb: 2, mt: 2 }}>
                  <Image src="/resume_request_icon.png" alt="Resume Request Icon" width={70} height={70} style={{ marginBottom: 8 }} />
                </Box>
                <Typography variant="h5" fontWeight={700} align="center" gutterBottom>
                  Resume Requests
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ fontStyle: 'italic', mb: 2 }}>
                  Use this section to make adjustments to your resume on your prompt. Its your personal assistant
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
                <input
                  accept=".pdf,.doc,.docx,.txt"
                  style={{ display: 'none' }}
                  id="resume-upload-req"
                  type="file"
                  onChange={e => setResumeFile(e.target.files[0])}
                />
                <label htmlFor="resume-upload-req">
                  <Button variant="outlined" color="success" component="span" sx={{ width: '100%' }}>
                    {resumeFile ? resumeFile.name : 'Choose PDF or Word File'}
                  </Button>
                </label>
              </Box>
              <TextField multiline minRows={5} placeholder="Describe your resume needs or questions..." variant="outlined" fullWidth sx={{ mb: 0, bgcolor: '#f7faff', mt: 1 }} />
              <Box sx={{ flexGrow: 1 }} />
              <Button variant="contained" color="success" sx={{ fontWeight: 700, width: '100%', mb: 2 }}>
                Submit Request
              </Button>
            </CardContent>
          </Card>
        </Grid>
        {/* Resume Query */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', minHeight: 370, borderRadius: 3, boxShadow: 2, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'stretch' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', height: 1, p: 0 }}>
              <Box sx={{ minHeight: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
                <Box sx={{ textAlign: 'center', mb: 2, mt: 2 }}>
                  <Image src="/resume_query_icon.png" alt="Resume Query Icon" width={70} height={70} style={{ marginBottom: 8 }} />
                </Box>
                <Typography variant="h5" fontWeight={700} align="center" gutterBottom>
                  Resume Query
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ fontStyle: 'italic', mb: 2 }}>
                  Use this section to check other resumes for the job profile you are looking for. Also finds right candidates
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
                <input
                  accept=".pdf,.doc,.docx,.txt"
                  style={{ display: 'none' }}
                  id="resume-upload-query"
                  type="file"
                  onChange={e => setResumeFile(e.target.files[0])}
                />
                <label htmlFor="resume-upload-query">
                  <Button variant="outlined" color="success" component="span" sx={{ width: '100%' }}>
                    {resumeFile ? resumeFile.name : 'Choose PDF or Word File'}
                  </Button>
                </label>
              </Box>
              <TextField multiline minRows={5} placeholder="Enter job description here..." variant="outlined" fullWidth sx={{ mb: 2, bgcolor: '#f7faff', mt: 1 }} />
              <Box sx={{ flexGrow: 1 }} />
              <Button variant="contained" color="success" sx={{ fontWeight: 700, width: '100%', mb: 2 }}>
                Search Resumes
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
