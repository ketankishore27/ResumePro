import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Container, 
  Card, 
  CardContent,
  CircularProgress,
  Divider
} from '@mui/material';
import { usePdfText } from '../src/context/PdfTextContext';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function CoverLetter() {
  const { pdfText, description } = usePdfText();
  const router = useRouter();
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: 'Ketan Kishore',
    role: 'Data Scientist',
    location: 'Bokaro Steel City, Jharkhand',
    phone: '+91 7488391342',
    email: 'ketan.kishore31@gmail.com'
  });

  // Extract user information from resume text
  useEffect(() => {
    if (pdfText) {
      // Extract email
      const emailMatch = pdfText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch) {
        setUserInfo(prev => ({ ...prev, email: emailMatch[0] }));
      }

      // Extract phone number
      const phoneMatch = pdfText.match(/\+?\d{1,4}[-.\s]?\d{10}|\d{10}/);
      if (phoneMatch) {
        setUserInfo(prev => ({ ...prev, phone: phoneMatch[0] }));
      }

      // Extract name (assuming it's near the beginning)
      const lines = pdfText.split('\n');
      const namePattern = /^[A-Z][a-z]+ [A-Z][a-z]+/;
      for (let line of lines.slice(0, 10)) {
        const nameMatch = line.trim().match(namePattern);
        if (nameMatch && !line.includes('@') && !line.includes('+')) {
          setUserInfo(prev => ({ ...prev, name: nameMatch[0] }));
          break;
        }
      }
    }
  }, [pdfText]);

  // Generate cover letter
  useEffect(() => {
    if (pdfText && description) {
      generateCoverLetter();
    }
  }, [pdfText, description]);

  const generateCoverLetter = async () => {
    setLoading(true);
    try {
      // Simulate API call to generate cover letter
      // In real implementation, this would call your backend API
      const response = await fetch('http://127.0.0.1:8000/generateCoverLetter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          resumeText: pdfText, 
          description: description 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCoverLetter(data.coverLetter || generateSampleCoverLetter());
      } else {
        throw new Error('API call failed');
      }
    } catch (error) {
      console.error('Failed to generate cover letter:', error);
      // Fallback to sample cover letter
      setCoverLetter(generateSampleCoverLetter());
    }
    setLoading(false);
  };

  const generateSampleCoverLetter = () => {
    return `Dear Hiring Manager,

I am eager to bring my extensive experience as a Data Scientist to Morgan Stanley, drawn by your commitment to innovation through data and technology. Morgan Stanley's vision of empowering financial services worldwide aligns with my passion for leveraging cutting-edge data engineering solutions to drive impactful outcomes. The opportunity to contribute to your Cloud Business Intelligence team by enhancing infrastructure to support cloud-based analytics excites me greatly.

With over 4 years of experience in Insurance, Banking, and Telecom domains, I have developed expertise in Machine Learning, Deep Learning, and Generative AI. My proficiency in Python, PySpark, and MLOps, combined with hands-on experience in cloud services like AWS and Azure, positions me well for this role.

At T-Systems India, I successfully integrated OpenAI backend to Service Desk chatbots and designed Agentic architecture alongside Retrieval Augmented Generation. I fine-tuned model responses using text embeddings and created APIs for real-time AI model integration. Additionally, I developed predictive models for telecom data and created dashboards for troubleshooting router issues.

My experience at Bajaj Finance involved creating ML models for transactional message classification and developing real-time offer generation pipelines. At Capgemini, I worked on trip optimization algorithms and developed web crawlers for NLP-based insights.

I am excited about the possibility of bringing my technical skills and domain expertise to Morgan Stanley. Thank you for considering my application.

Sincerely,
${userInfo.name}`;
  };

  // Redirect if no data
  useEffect(() => {
    if (!pdfText || !description) {
      router.push('/');
    }
  }, [pdfText, description, router]);

  if (!pdfText || !description) {
    return null;
  }

  return (
    <Box sx={{ background: '#f7faff', minHeight: '100vh', py: 4 }}>
      {/* Header */}
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="body2" color="primary" sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
            Generate as many cover letters as you need
          </Typography>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Typography variant="body2" color="primary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
              🏠 Cover Letter Generator
            </Typography>
          </Link>
          
          {/* Progress indicators */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
            <Box sx={{ 
              width: 32, 
              height: 32, 
              borderRadius: '50%', 
              backgroundColor: 'success.main', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold'
            }}>
              ✓
            </Box>
            <Box sx={{ 
              width: 32, 
              height: 32, 
              borderRadius: '50%', 
              backgroundColor: 'success.main', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold'
            }}>
              ✓
            </Box>
            <Box sx={{ 
              width: 32, 
              height: 32, 
              borderRadius: '50%', 
              backgroundColor: 'success.main', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold'
            }}>
              3
            </Box>
          </Box>

          <Typography variant="h3" fontWeight={700} gutterBottom>
            Free AI Cover Letter Generator
          </Typography>
        </Box>

        {/* Main Content */}
        <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* User Info Card */}
          <Box sx={{ flex: '0 0 300px' }}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  {userInfo.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {userInfo.role}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {userInfo.location}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {userInfo.phone}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {userInfo.email}
                </Typography>
                
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth 
                  sx={{ mt: 2, borderRadius: 2 }}
                >
                  Edit & Download
                </Button>
              </CardContent>
            </Card>
          </Box>

          {/* Cover Letter Content */}
          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3, minHeight: 600 }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <Typography variant="body1" sx={{ lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                    {coverLetter}
                  </Typography>
                </>
              )}
            </Paper>
          </Box>
        </Box>

        {/* Back Button */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Button variant="outlined" color="primary" sx={{ borderRadius: 2 }}>
              Back to Home
            </Button>
          </Link>
        </Box>
      </Container>
    </Box>
  );
}
