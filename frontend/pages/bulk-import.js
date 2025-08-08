import * as React from 'react';
import Link from 'next/link';
import {
  Box, Typography, Button, Paper, RadioGroup, FormControlLabel, Radio, 
  FormControl, FormLabel, Divider, Stack
} from '@mui/material';
import { useState } from 'react';
import { useRouter } from 'next/router';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';

export default function BulkImport() {
  const [selectedFormat, setSelectedFormat] = useState('resumes');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const router = useRouter();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileSelect(file);
    }
  };

  const handleFileSelect = (file) => {
    const allowedTypes = ['.csv', '.xlsx'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (allowedTypes.includes(fileExtension) && file.size <= 3 * 1024 * 1024) {
      setSelectedFile(file);
    } else {
      alert('Please select a valid CSV or XLSX file under 3MB');
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFormatChange = (event) => {
    setSelectedFormat(event.target.value);
  };

  const handleNext = () => {
    if (selectedFile) {
      // Process the file and navigate to next step
      console.log('Processing file:', selectedFile.name);
      // Add your file processing logic here
    } else {
      alert('Please select a file to continue');
    }
  };

  return (
    <Box sx={{ background: '#f7faff', minHeight: '100vh' }}>
      {/* Navbar */}
      <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: 0.5, color: 'inherit', cursor: 'pointer' }}>
              Resume<span style={{ color: '#2563eb' }}>Pro</span>
            </Typography>
          </Link>
          <Button 
            variant="outlined" 
            color="primary" 
            sx={{ fontWeight: 600, borderRadius: 2, textTransform: 'none' }}
          >
            Bulk Import
          </Button>
        </Box>
        <Button 
          variant="contained" 
          color="success" 
          sx={{ fontWeight: 700, borderRadius: 2 }}
        >
          Get Feedback
        </Button>
      </Box>

      {/* Breadcrumb */}
      <Box sx={{ px: 3, py: 2, background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
        <Typography variant="body2" color="text.secondary">
          <Link href="/" style={{ color: '#6b7280', textDecoration: 'none' }}>ResumePro</Link>
          {' > '}
          <span style={{ color: '#374151', fontWeight: 500 }}>Bulk Import</span>
        </Typography>
      </Box>

      {/* Main Content */}
      <Box sx={{ px: 3, py: 4, maxWidth: 1200, mx: 'auto' }}>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 4, color: '#374151' }}>
          Bulk Import
        </Typography>

        <Paper sx={{ p: 4, borderRadius: 2, boxShadow: 1 }}>
          {/* File Type Selection */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#374151' }}>
              Select a file to import
            </Typography>
            
            <FormControl component="fieldset">
              <RadioGroup
                row
                value={selectedFormat}
                onChange={handleFormatChange}
                sx={{ gap: 3 }}
              >
                <FormControlLabel 
                  value="resumes" 
                  control={<Radio />} 
                  label="Resumes" 
                  sx={{ '& .MuiFormControlLabel-label': { fontWeight: 500 } }}
                />
              </RadioGroup>
            </FormControl>

            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Allowed Format: <strong>.CSV, .XLSX</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Maximum File Size: <strong>3 MB</strong>
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="text"
                  startIcon={<DownloadIcon />}
                  sx={{ textTransform: 'none', color: '#6b7280' }}
                >
                  Download Sample Format
                </Button>
                <Button
                  variant="text"
                  startIcon={<DownloadIcon />}
                  sx={{ textTransform: 'none', color: '#6b7280' }}
                >
                  Download Instructions
                </Button>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* File Upload Area */}
          <Box
            sx={{
              border: '2px dashed #d1d5db',
              borderRadius: 2,
              p: 6,
              textAlign: 'center',
              backgroundColor: dragActive ? '#f3f4f6' : '#f9fafb',
              borderColor: dragActive ? '#6366f1' : '#d1d5db',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: '#f3f4f6',
                borderColor: '#9ca3af'
              }
            }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input').click()}
          >
            <CloudUploadIcon sx={{ fontSize: 48, color: '#9ca3af', mb: 2 }} />
            
            {selectedFile ? (
              <Box>
                <Typography variant="h6" sx={{ color: '#059669', mb: 1 }}>
                  File Selected: {selectedFile.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Click to select a different file
                </Typography>
              </Box>
            ) : (
              <Box>
                <Typography variant="h6" sx={{ color: '#374151', mb: 1 }}>
                  Drag and drop your file here
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  - OR -
                </Typography>
                <Button
                  variant="text"
                  sx={{ 
                    color: '#6366f1', 
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1rem'
                  }}
                >
                  Choose File
                </Button>
              </Box>
            )}
            
            <input
              id="file-input"
              type="file"
              accept=".csv,.xlsx"
              onChange={handleFileInput}
              style={{ display: 'none' }}
            />
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
            <Button
              variant="outlined"
              onClick={() => router.push('/')}
              sx={{ 
                px: 4, 
                py: 1.5, 
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2
              }}
            >
              BACK
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!selectedFile}
              sx={{ 
                px: 4, 
                py: 1.5, 
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                backgroundColor: selectedFile ? '#6366f1' : '#d1d5db',
                '&:hover': {
                  backgroundColor: selectedFile ? '#4f46e5' : '#d1d5db'
                }
              }}
            >
              NEXT
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
