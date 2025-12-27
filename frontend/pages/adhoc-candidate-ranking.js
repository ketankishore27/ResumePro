import * as React from 'react';
import Link from 'next/link';
import mammoth from 'mammoth';
import {
  Box, Typography, Button, Paper, TextField, 
  FormControl, FormLabel, Divider, Stack, Chip, IconButton,
  LinearProgress, CircularProgress, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Select, MenuItem
} from '@mui/material';
import { useState } from 'react';
import { useRouter } from 'next/router';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import Navigation from '../src/components/Navigation';

export default function AdhocCandidateRanking() {
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [extractedTexts, setExtractedTexts] = useState([]);
  const [processingFiles, setProcessingFiles] = useState(false);
  const [currentProcessing, setCurrentProcessing] = useState(0);
  const [processingFileName, setProcessingFileName] = useState('');
  const [processedResults, setProcessedResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
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
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      handleFileSelect(files);
    }
  };

  const extractPDFText = async (file) => {
    try {
      console.log(`Starting PDF text extraction for: ${file.name}`);
      const pdfjsLib = await import('pdfjs-dist/build/pdf');
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';
      
      const fileReader = new FileReader();
      
      return new Promise((resolve, reject) => {
        fileReader.onload = async function () {
          try {
            const typedarray = new Uint8Array(this.result);
            const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
            let text = '';
            
            console.log(`PDF loaded: ${file.name}, Pages: ${pdf.numPages}`);
            
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const content = await page.getTextContent();
              text += content.items.map(item => item.str).join(' ') + '\n';
            }
            
            console.log(`Text extracted from ${file.name}:`, {
              fileName: file.name,
              textLength: text.length,
              preview: text.substring(0, 200) + '...'
            });
            
            resolve({
              fileName: file.name,
              fileSize: file.size,
              text: text.trim(),
              pageCount: pdf.numPages
            });
          } catch (error) {
            console.error(`Error extracting text from ${file.name}:`, error);
            reject(error);
          }
        };
        
        fileReader.onerror = () => {
          console.error(`Error reading file: ${file.name}`);
          reject(new Error(`Failed to read file: ${file.name}`));
        };
        
        fileReader.readAsArrayBuffer(file);
      });
    } catch (error) {
      console.error(`Error in extractPDFText for ${file.name}:`, error);
      throw error;
    }
  };

  const extractWordText = async (file) => {
    try {
      console.log(`Starting Word document text extraction for: ${file.name}`);
      
      const fileReader = new FileReader();
      
      return new Promise((resolve, reject) => {
        fileReader.onload = async function () {
          try {
            const arrayBuffer = this.result;
            
            const result = await mammoth.extractRawText({ arrayBuffer });
            const text = result.value;
            
            console.log(`Text extracted from ${file.name}:`, {
              fileName: file.name,
              textLength: text.length,
              preview: text.substring(0, 200) + '...'
            });
            
            const estimatedPageCount = Math.max(1, Math.ceil(text.length / (500 * 6)));
            
            resolve({
              fileName: file.name,
              fileSize: file.size,
              text: text.trim(),
              pageCount: estimatedPageCount
            });
          } catch (error) {
            console.error(`Error extracting text from ${file.name}:`, error);
            reject(error);
          }
        };
        
        fileReader.onerror = () => {
          console.error(`Error reading file: ${file.name}`);
          reject(new Error(`Failed to read file: ${file.name}`));
        };
        
        fileReader.readAsArrayBuffer(file);
      });
    } catch (error) {
      console.error(`Error in extractWordText for ${file.name}:`, error);
      throw error;
    }
  };

  const handleFileSelect = async (files) => {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const validFiles = [];
    const invalidFiles = [];
    
    files.forEach(file => {
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      
      if (allowedTypes.includes(fileExtension) && file.size <= 10 * 1024 * 1024) {
        const isAlreadySelected = selectedFiles.some(existingFile => 
          existingFile.name === file.name && existingFile.size === file.size
        );
        
        if (!isAlreadySelected) {
          validFiles.push(file);
        }
      } else {
        invalidFiles.push(file.name);
      }
    });
    
    if (validFiles.length > 0) {
      setShowResults(false);
      setProcessedResults([]);
      
      setSelectedFiles(prev => [...prev, ...validFiles]);
      
      setProcessingFiles(true);
      console.log(`Processing ${validFiles.length} files for text extraction...`);
      
      try {
        const textExtractions = await Promise.all(
          validFiles.map(file => {
            const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
            if (fileExtension === '.pdf') {
              return extractPDFText(file);
            } else if (fileExtension === '.doc' || fileExtension === '.docx') {
              return extractWordText(file);
            }
          })
        );
        
        console.log('All file text extractions completed:', textExtractions);
        setExtractedTexts(prev => [...prev, ...textExtractions]);
        
      } catch (error) {
        console.error('Error during batch file text extraction:', error);
        alert('Error extracting text from some files. Please check the console for details.');
      } finally {
        setProcessingFiles(false);
      }
    }
    
    if (invalidFiles.length > 0) {
      alert(`Invalid files: ${invalidFiles.join(', ')}\nPlease select valid PDF or Word files under 10MB`);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      handleFileSelect(files);
    }
  };

  const handleJobTitleChange = (event) => {
    setJobTitle(event.target.value);
  };

  const handleJobDescriptionChange = (event) => {
    setJobDescription(event.target.value);
  };

  const handleSubmit = async () => {
    if (selectedFiles.length > 0 && extractedTexts.length === selectedFiles.length) {
      console.log('Starting adhoc candidate ranking processing:');
      console.log('Total files to process:', extractedTexts.length);
      console.log('Job Description:', jobDescription);
      
      setProcessingFiles(true);
      setCurrentProcessing(0);
      setProcessingFileName('');
      
      const results = [];
      const errors = [];
      
      try {
        for (let i = 0; i < extractedTexts.length; i++) {
          const resumeData = extractedTexts[i];
          
          setCurrentProcessing(i + 1);
          setProcessingFileName(resumeData.fileName);
          
          console.log(`\n--- Processing Resume ${i + 1}/${extractedTexts.length} ---`);
          console.log(`File: ${resumeData.fileName}`);
          
          const individualResumeData = {
            fileName: resumeData.fileName,
            fileSize: resumeData.fileSize,
            resumeText: resumeData.text,
            pageCount: resumeData.pageCount,
            jobRole: jobTitle,
            jobDescription: jobDescription,
            processIndex: i + 1,
            totalFiles: extractedTexts.length,
            request_type: 'adhoc'
          };
          
          try {
            const response = await fetch('http://127.0.0.1:8000/processBulkImport', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(individualResumeData)
            });
            
            if (response.ok) {
              const result = await response.json();
              console.log(`✓ Successfully processed ${resumeData.fileName}:`, result);
              
              // Extract values from nested final_payload structure
              const contactInfo = result.getContacts || {};
              const inputData = result.input_data || {};
              const scoreInfo = result.scoreResume || {};
              const summaryInfo = result.getSummaryOverview || {};
              
              const safeResult = {
                fileName: resumeData.fileName,
                success: true,
                email_id: contactInfo.email_id || '',
                contact_number: contactInfo.mobile_number || '',
                name: inputData.name || '',
                match_score: scoreInfo.score || 0,
                summary: summaryInfo.comment || '',
                parsed_status: result.parsed_status || 'Successful'
              };
              
              results.push(safeResult);
            } else {
              console.error(`✗ Failed to process ${resumeData.fileName}:`, response.statusText);
              const failedResult = {
                fileName: resumeData.fileName,
                success: false,
                email_id: "",
                contact_number: "",
                name: "",
                match_score: 0,
                summary: "",
                parsed_status: "UnSuccessful",
                error: response.statusText
              };
              results.push(failedResult);
              errors.push({ fileName: resumeData.fileName, error: response.statusText });
            }
            
          } catch (apiError) {
            console.error(`✗ API Error for ${resumeData.fileName}:`, apiError);
            const failedResult = {
              fileName: resumeData.fileName,
              success: false,
              email_id: "",
              contact_number: "",
              name: "",
              match_score: 0,
              summary: "",
              parsed_status: "UnSuccessful",
              error: apiError.message
            };
            results.push(failedResult);
            errors.push({ fileName: resumeData.fileName, error: apiError.message });
          }
          
          if (i < extractedTexts.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
        
        console.log('\n=== ADHOC RANKING COMPLETED ===');
        console.log(`Total files processed: ${extractedTexts.length}`);
        console.log(`Successful: ${results.filter(r => r.success).length}`);
        console.log(`Failed: ${errors.length}`);
        
        const sanitizedResults = results.map(result => ({
          fileName: result.fileName || 'Unknown File',
          success: result.success || false,
          email_id: result.email_id || '',
          contact_number: result.contact_number || '',
          name: result.name || '',
          match_score: result.match_score || 0,
          summary: result.summary || '',
          parsed_status: result.parsed_status || 'UnSuccessful',
          error: result.error || null
        }));
        
        // Sort results by match_score in descending order
        sanitizedResults.sort((a, b) => b.match_score - a.match_score);
        
        console.log('Sanitized and sorted results:', sanitizedResults);
        setProcessedResults(sanitizedResults);
        setShowResults(true);
        
        setSelectedFiles([]);
        setExtractedTexts([]);
        
        if (errors.length === 0) {
          console.log(`Successfully processed all ${results.length} resume files!`);
        } else {
          console.log(`Processed ${results.length - errors.length} files successfully. ${errors.length} files failed.`);
        }
        
      } catch (error) {
        console.error('Error during adhoc ranking processing:', error);
        alert('Error during processing. Please check the console and try again.');
      } finally {
        setProcessingFiles(false);
        setCurrentProcessing(0);
        setProcessingFileName('');
      }
      
    } else if (selectedFiles.length > 0 && processingFiles) {
      alert('Please wait for processing to complete');
    } else if (!jobDescription.trim()) {
      alert('Please enter a job description');
    } else {
      alert('Please select at least one file to continue');
    }
  };

  const removeFile = (indexToRemove) => {
    console.log(`Removing file at index ${indexToRemove}`);
    setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    setExtractedTexts(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const clearAllFiles = () => {
    console.log('Clearing all files and extracted texts');
    setSelectedFiles([]);
    setExtractedTexts([]);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#3b82f6';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Navigation currentPage="Adhoc Candidate Ranking" />

      <Box sx={{ px: 3, py: 4, maxWidth: 1200, mx: 'auto' }}>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 4, color: 'text.primary' }}>
          Adhoc Candidate Ranking
        </Typography>

        <Paper sx={{ p: 4, borderRadius: 2, boxShadow: 1 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: 'text.primary' }}>
              Job Title
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <Select
                value={jobTitle}
                onChange={handleJobTitleChange}
                displayEmpty
                sx={{ 
                  borderRadius: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              >
                <MenuItem value="" disabled>
                  <em>Select a job title</em>
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
                <MenuItem value="Business Intelligence (BI) Developer">Business Intelligence (BI) Developer</MenuItem>
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

            <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: 'text.primary' }}>
              Job Description
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <TextField
                multiline
                rows={6}
                value={jobDescription}
                onChange={handleJobDescriptionChange}
                placeholder="Enter the job description here... Include responsibilities, required skills, qualifications, and any other relevant details."
                sx={{ 
                  borderRadius: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </FormControl>

            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Allowed Formats: <strong>.PDF, .DOC, .DOCX</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Upload candidate resumes to rank them against the job description
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box
            sx={{
              border: '2px dashed',
              borderRadius: 2,
              p: 6,
              textAlign: 'center',
              backgroundColor: dragActive ? 'rgba(42, 42, 42, 0.05)' : 'rgba(33, 33, 33, 0.05)',
              backdropFilter: 'blur(12px)',
              borderColor: dragActive ? 'primary.main' : 'divider',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'rgba(42, 42, 42, 0.05)',
                borderColor: 'divider'
              }
            }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input').click()}
          >
            <CloudUploadIcon sx={{ fontSize: 48, color: '#9ca3af', mb: 2 }} />
            
            <Box>
              <Typography variant="h6" sx={{ color: 'text.primary', mb: 1 }}>
                Drag and drop your files here
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
                Choose Files
              </Button>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Select multiple PDF or Word files (up to 10MB each)
              </Typography>
              {processingFiles && (
                <Typography variant="body2" sx={{ mt: 1, color: '#f59e0b', fontWeight: 500 }}>
                  Extracting text from files...
                </Typography>
              )}
            </Box>
            
            <input
              id="file-input"
              type="file"
              accept=".pdf,.doc,.docx"
              multiple
              onChange={handleFileInput}
              style={{ display: 'none' }}
            />
          </Box>

          {selectedFiles.length > 0 && !showResults && (
            <Box sx={{ mt: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600} sx={{ color: 'text.primary' }}>
                  Selected Files ({selectedFiles.length})
                </Typography>
                <Button
                  variant="text"
                  onClick={clearAllFiles}
                  sx={{ color: '#ef4444', textTransform: 'none', fontWeight: 500 }}
                >
                  Clear All
                </Button>
              </Box>
              
              <Box sx={{ 
                maxHeight: 300, 
                overflowY: 'auto', 
                border: '1px solid', 
                borderColor: 'divider', 
                borderRadius: 2, 
                p: 2,
                backgroundColor: 'rgba(33, 33, 33, 0.05)',
                backdropFilter: 'blur(12px)'
              }}>
                <Stack spacing={1}>
                  {selectedFiles.map((file, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 2,
                        backgroundColor: 'rgba(26, 26, 26, 0.05)',
                        backdropFilter: 'blur(12px)',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                        <AttachFileIcon sx={{ color: '#6b7280', fontSize: 20 }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" fontWeight={500} sx={{ color: 'text.primary' }}>
                            {file.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </Typography>
                          {extractedTexts[index] && (
                            <Typography variant="body2" sx={{ color: '#059669', fontWeight: 500 }}>
                              ✓ Text extracted ({extractedTexts[index].text.length} chars, {extractedTexts[index].pageCount} pages)
                            </Typography>
                          )}
                          {processingFiles && !extractedTexts[index] && (
                            <Typography variant="body2" sx={{ color: '#f59e0b' }}>
                              Extracting text...
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      <IconButton
                        onClick={() => removeFile(index)}
                        sx={{ color: '#ef4444' }}
                        size="small"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Box>
          )}

          {processingFiles && (
            <Box sx={{ 
              mb: 3, 
              mt: 3,
              p: 3, 
              backgroundColor: 'rgba(33, 33, 33, 0.05)',
              backdropFilter: 'blur(12px)', 
              border: '1px solid', 
              borderColor: 'divider', 
              borderRadius: 2 
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CircularProgress size={20} sx={{ mr: 2, color: '#6366f1' }} />
                <Typography variant="h6" fontWeight={600} sx={{ color: 'text.primary' }}>
                  Processing Files...
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    Progress: {currentProcessing} of {selectedFiles.length} files
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500 }}>
                    {selectedFiles.length > 0 ? Math.round((currentProcessing / selectedFiles.length) * 100) : 0}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={selectedFiles.length > 0 ? (currentProcessing / selectedFiles.length) * 100 : 0}
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    backgroundColor: 'divider',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#6366f1',
                      borderRadius: 4
                    }
                  }}
                />
              </Box>
              
              {processingFileName && (
                <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                  Currently processing: {processingFileName}
                </Typography>
              )}
            </Box>
          )}

          {showResults && processedResults.length > 0 && (
            <Box sx={{ mb: 3, mt: 3 }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: 'text.primary' }}>
                Ranking Results ({processedResults.length} candidates) - Sorted by Match Score
              </Typography>
              <TableContainer component={Paper} sx={{ border: '1px solid', borderColor: 'divider', overflowX: 'auto' }}>
                <Table sx={{ tableLayout: 'fixed' }}>
                  <TableHead sx={{ backgroundColor: 'rgba(42, 42, 42, 0.05)', backdropFilter: 'blur(12px)' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, color: 'text.primary', width: '5%' }}>Rank</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.primary', width: '8%' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.primary', width: '10%' }}>Score</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.primary', width: '15%' }}>File Name</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.primary', width: '12%' }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.primary', width: '15%' }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.primary', width: '10%' }}>Contact</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.primary', width: '25%' }}>Summary</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {processedResults.map((result, index) => (
                      <TableRow 
                        key={index} 
                        onClick={() => {
                          if (result.email_id && result.email_id !== '-') {
                            window.open(`/insights?email_id=${encodeURIComponent(result.email_id)}`, '_blank');
                          }
                        }}
                        sx={{ 
                          '&:nth-of-type(odd)': { backgroundColor: 'rgba(30, 30, 30, 0.05)', backdropFilter: 'blur(12px)' },
                          cursor: result.email_id && result.email_id !== '-' ? 'pointer' : 'default',
                          '&:hover': result.email_id && result.email_id !== '-' ? { 
                            backgroundColor: 'rgba(42, 42, 42, 0.1)',
                            backdropFilter: 'blur(12px)',
                            transform: 'scale(1.01)',
                            transition: 'all 0.2s ease-in-out'
                          } : {}
                        }}
                      >
                        <TableCell sx={{ width: '5%', textAlign: 'center', fontWeight: 600, fontSize: '1.1rem' }}>
                          #{index + 1}
                        </TableCell>
                        <TableCell sx={{ width: '8%', textAlign: 'center' }}>
                          {result.parsed_status === 'Successful' ? (
                            <CheckCircleIcon sx={{ color: '#10b981', fontSize: 24 }} />
                          ) : (
                            <CancelIcon sx={{ color: '#ef4444', fontSize: 24 }} />
                          )}
                        </TableCell>
                        <TableCell sx={{ width: '10%', textAlign: 'center' }}>
                          <Chip
                            label={`${result.match_score}%`}
                            sx={{
                              backgroundColor: getScoreColor(result.match_score),
                              color: '#ffffff',
                              fontWeight: 700,
                              fontSize: '0.9rem'
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ width: '15%', wordBreak: 'break-word', verticalAlign: 'top' }}>
                          <Typography variant="body2" fontWeight={500}>
                            {result.fileName}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ width: '12%', wordBreak: 'break-word', verticalAlign: 'top' }}>
                          <Typography variant="body2">
                            {String(result.name || '-')}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ width: '15%', wordBreak: 'break-word', verticalAlign: 'top' }}>
                          <Typography variant="body2">
                            {String(result.email_id || '-')}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ width: '10%', wordBreak: 'break-word', verticalAlign: 'top' }}>
                          <Typography variant="body2">
                            {String(result.contact_number || '-')}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ width: '25%', wordBreak: 'break-word', verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ 
                            whiteSpace: 'pre-wrap',
                            lineHeight: 1.4
                          }}>
                            {String(result.summary || '-')}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4 }}>
            <Button
              variant="outlined"
              onClick={() => {
                setSelectedFiles([]);
                setExtractedTexts([]);
                setProcessedResults([]);
                setShowResults(false);
                setProcessingFiles(false);
                setCurrentProcessing(0);
                setProcessingFileName('');
              }}
              disabled={selectedFiles.length === 0 && processedResults.length === 0}
              sx={{ 
                px: 4, 
                py: 1.5, 
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                color: '#ef4444',
                borderColor: '#ef4444',
                '&:hover': {
                  borderColor: '#dc2626',
                  backgroundColor: '#2a1a1a'
                },
                '&:disabled': {
                  color: '#d1d5db',
                  borderColor: '#d1d5db'
                }
              }}
            >
              CLEAR ALL
            </Button>

            <Box sx={{ display: 'flex', gap: 2 }}>
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
              {!showResults && (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={selectedFiles.length === 0 || processingFiles || extractedTexts.length !== selectedFiles.length || !jobDescription.trim()}
                  sx={{ 
                    px: 4, 
                    py: 1.5, 
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 2,
                    backgroundColor: selectedFiles.length > 0 ? '#6366f1' : '#d1d5db',
                    '&:hover': {
                      backgroundColor: selectedFiles.length > 0 ? '#4f46e5' : '#d1d5db'
                    }
                  }}
                >
                  RANK {selectedFiles.length > 0 ? `${selectedFiles.length} CANDIDATES` : 'CANDIDATES'}
                </Button>
              )}
              {showResults && (
                <Button
                  variant="contained"
                  onClick={() => {
                    setShowResults(false);
                    setProcessedResults([]);
                    setSelectedFiles([]);
                    setExtractedTexts([]);
                  }}
                  sx={{ 
                    px: 4, 
                    py: 1.5, 
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 2,
                    backgroundColor: '#6366f1',
                    '&:hover': {
                      backgroundColor: '#4f46e5'
                    }
                  }}
                >
                  RANK NEW CANDIDATES
                </Button>
              )}
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
