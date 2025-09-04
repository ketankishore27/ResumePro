import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Grid, Card, CardContent, TextField, Paper,
  FormControl, Select, MenuItem, Divider, CircularProgress, Chip, Checkbox, 
  IconButton, Avatar, InputLabel, Accordion, AccordionSummary, AccordionDetails, Pagination
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import GetAppIcon from '@mui/icons-material/GetApp';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useRouter } from 'next/router';
import Navigation from '../src/components/Navigation';

export default function RelevantCandidates() {
  const router = useRouter();
  const [jobRole, setJobRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [filters, setFilters] = useState({
    keywords: []
  });
  const [keywordInput, setKeywordInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(20);
  const [sortBy, setSortBy] = useState('Apply date');

  const handleSearch = async () => {
    if (!jobRole && !jobDescription) {
      alert('Please select a job role or enter a job description');
      return;
    }

    setLoading(true);
    setSearchPerformed(true);
    
    let candidateData = [];
    
    try {
      // Make API call to filterCandidate endpoint
      const response = await fetch('http://127.0.0.1:8000/filterCandidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wordList: filters.keywords,
          jobRole: jobRole,
          jobDescription: jobDescription
        })
      });
      
      const data = await response.json();
      
      // If we got valid data back, use it
      if (data && Array.isArray(data) && data.length > 0) {
        candidateData = data;
      }
    } catch (error) {
      console.error('Error searching candidates:', error);
    }
    
    // If no data from API, use mock data
    if (candidateData.length === 0) {
      console.log('No data returned from API, using mock data');
      candidateData = [
        {
          id: 1,
          name: 'Ankita Devagn',
          email: 'ankita.devagn@gmail.com',
          phone: '9112345678',
          location: 'Pune',
          experience: '3y 1m',
          salary: '9 Lacs',
          notice: '3m+ notice',
          skills: ['Java Architecture', 'Technical Leadership', 'Technical Architecture', 'Project Management', 'J2EE', 'Java', 'Spring', 'XML'],
          education: 'B.Sc Indian Institute of Technology (IIT), Kanpur 2017',
          current: 'Oracle Database Administrator at TATA TECHNOLOGIES LTD.',
          previous: 'Software Tester at TATA STEEL LIMITED',
          match: 92,
          avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
          comments: 4,
          applyDate: '16 Apr 21',
          status: 'Shortlisted',
          starRating: 4
        },
        {
          id: 2,
          name: 'Rahul Sharma',
          email: 'rahul.sharma@gmail.com',
          phone: '9223456789',
          location: 'Bangalore',
          experience: '4y 3m',
          salary: '12 Lacs',
          notice: '1m notice',
          skills: ['Python', 'Django', 'React', 'AWS', 'Full Stack', 'JavaScript', 'Node.js'],
          education: 'M.Tech Computer Science, IIT Delhi 2019',
          current: 'Full Stack Developer at Infosys',
          previous: 'Web Developer at TCS',
          match: 85,
          avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
          comments: 2,
          applyDate: '14 Apr 21',
          status: 'Pending',
          starRating: 3
        },
        {
          id: 3,
          name: 'Priya Patel',
          email: 'priya.patel@gmail.com',
          phone: '9334567890',
          location: 'Mumbai',
          experience: '2y 6m',
          salary: '8 Lacs',
          notice: 'Immediate',
          skills: ['UI/UX', 'Figma', 'Adobe XD', 'Sketch', 'HTML', 'CSS', 'JavaScript'],
          education: 'B.Des, NID Ahmedabad 2020',
          current: 'UI Designer at Amazon',
          previous: 'Junior Designer at Flipkart',
          match: 78,
          avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
          comments: 1,
          applyDate: '12 Apr 21',
          status: 'Pending',
          starRating: 2
        },
        {
          id: 4,
          name: 'Amit Kumar',
          email: 'amit.kumar@gmail.com',
          phone: '9445678901',
          location: 'Chennai',
          experience: '5y 2m',
          salary: '15 Lacs',
          notice: '2m notice',
          skills: ['DevOps', 'AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Python', 'Linux'],
          education: 'M.Tech, IIT Madras 2018',
          current: 'DevOps Engineer at Microsoft',
          previous: 'System Administrator at Cognizant',
          match: 88,
          avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
          comments: 3,
          applyDate: '10 Apr 21',
          status: 'Shortlisted',
          starRating: 5
        },
        {
          id: 5,
          name: 'Sneha Reddy',
          email: 'sneha.reddy@gmail.com',
          phone: '9556789012',
          location: 'Hyderabad',
          experience: '3y 8m',
          salary: '11 Lacs',
          notice: '1m notice',
          skills: ['Data Science', 'Python', 'Machine Learning', 'SQL', 'Tableau', 'R'],
          education: 'M.Sc Statistics, University of Hyderabad 2019',
          current: 'Data Scientist at Wipro',
          previous: 'Data Analyst at HCL',
          match: 82,
          avatar: 'https://randomuser.me/api/portraits/women/25.jpg',
          comments: 2,
          applyDate: '08 Apr 21',
          status: 'Pending',
          starRating: 3
        }
      ];
      
    }
    
    setCandidates(candidateData);
    setLoading(false);
  };

  const handleCandidateClick = (candidate) => {
    router.push(`/insights?email_id=${candidate.email}`);
  };

  const getMatchColor = (match) => {
    if (match >= 90) return '#4caf50';
    if (match >= 80) return '#ff9800';
    return '#f44336';
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(candidates.map(c => c.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectCandidate = (candidateId) => {
    if (selectedCandidates.includes(candidateId)) {
      setSelectedCandidates(selectedCandidates.filter(id => id !== candidateId));
    } else {
      setSelectedCandidates([...selectedCandidates, candidateId]);
    }
  };

  // Use all candidates without filtering by keywords
  const filteredCandidates = candidates || [];

  const totalResults = filteredCandidates.length || 0;
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;
  const paginatedCandidates = filteredCandidates.length > 0 ? filteredCandidates.slice(startIndex, endIndex) : [];

  return (
    <>
      <Navigation currentPage="Relevant Candidates" />
      
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'transparent' }}>
        {/* Left Sidebar - Filters */}
        <Box sx={(theme) => ({ width: 280, bgcolor: theme.palette.background.paper, borderRight: `1px solid ${theme.palette.divider}`, p: 2 })}>
          {/* Filters Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <FilterListIcon sx={(theme) => ({ mr: 1, color: theme.palette.text.secondary })} />
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              Filters
            </Typography>
          </Box>

          {/* Matching/Not Matching Filter */}

          {/* Keywords Section */}
          <Accordion sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ p: 0, minHeight: 'auto' }}>
              <Typography variant="body2" fontWeight={500}>
                Keywords
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0, pt: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Add keyword and press Enter"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && keywordInput.trim()) {
                    setFilters({
                      ...filters, 
                      keywords: [...filters.keywords, keywordInput.trim()]
                    });
                    setKeywordInput('');
                    e.preventDefault();
                  }
                }}
                InputProps={{
                  startAdornment: <SearchIcon sx={(theme) => ({ mr: 1, color: theme.palette.text.secondary, fontSize: 18 })} />
                }}
              />
              {filters.keywords.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                  {filters.keywords.map((keyword, index) => (
                    <Chip
                      key={index}
                      label={keyword}
                      size="small"
                      onDelete={() => {
                        const newKeywords = [...filters.keywords];
                        newKeywords.splice(index, 1);
                        setFilters({...filters, keywords: newKeywords});
                      }}
                      sx={{ fontSize: '0.75rem' }}
                    />
                  ))}
                </Box>
              )}
            </AccordionDetails>
          </Accordion>

  
          {/* Job Role Filter */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
              Job Role
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                displayEmpty
              >
                <MenuItem value="">Select a job role</MenuItem>
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
          </Box>

          {/* Job Description Filter */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
              Job Description
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              size="small"
              placeholder="Enter job description..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </Box>

          {/* Search Button */}
          <Button
            variant="contained"
            fullWidth
            onClick={handleSearch}
            disabled={loading}
            sx={{ 
              mt: 3,
              textTransform: 'none',
              fontWeight: 500
            }}
            color="primary"
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Refine Search'}
          </Button>
        </Box>

        {/* Right Side - Results */}
        <Box sx={{ flex: 1, p: 3 }}>
          {/* Results Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" color="text.secondary">
              Showing {filteredCandidates ? filteredCandidates.length : 0} result(s)
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Show
              </Typography>
              <Select size="small" value={resultsPerPage} onChange={(e) => setResultsPerPage(e.target.value)}>
                <MenuItem value={20}>20</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
              </Select>
              <Typography variant="body2" color="text.secondary">
                Page {currentPage} of {Math.max(1, Math.ceil(totalResults / resultsPerPage))}
              </Typography>
            </Box>
          </Box>

          {/* Action Buttons */}
          {filteredCandidates && filteredCandidates.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Checkbox 
                size="small" 
                checked={selectAll}
                onChange={handleSelectAll}
              />
              <Typography variant="body2">Select All</Typography>
              <Button size="small" startIcon={<CheckCircleOutlineIcon />} sx={{ textTransform: 'none' }}>
                Shortlist
              </Button>
              <Button size="small" startIcon={<CancelOutlinedIcon />} sx={{ textTransform: 'none' }}>
                Reject
              </Button>
              <Button size="small" startIcon={<EmailOutlinedIcon />} sx={{ textTransform: 'none' }}>
                Email
              </Button>
              <Button size="small" startIcon={<GetAppIcon />} sx={{ textTransform: 'none' }}>
                Download
              </Button>
              <Button size="small" startIcon={<DeleteOutlineIcon />} sx={{ textTransform: 'none' }}>
                Delete
              </Button>
              <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Sort by:
                </Typography>
                <Select size="small" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <MenuItem value="Apply date">Apply date</MenuItem>
                  <MenuItem value="Name">Name</MenuItem>
                  <MenuItem value="Match">Match %</MenuItem>
                </Select>
              </Box>
            </Box>
          )}

          {/* Candidate Cards */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={40} />
            </Box>
          ) : paginatedCandidates && paginatedCandidates.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {paginatedCandidates.map((candidate) => (
                <Card 
                  key={candidate.id}
                  sx={(theme) => ({ 
                    p: 3,
                    border: `1px solid ${theme.palette.divider}`,
                    borderLeft: `4px solid ${theme.palette.primary.main}`,
                    borderRadius: 2,
                    backgroundColor: theme.palette.background.paper,
                    '&:hover': { 
                      boxShadow: theme.palette.mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.6)' : '0 4px 12px rgba(0,0,0,0.1)',
                      transform: 'translateY(-1px)',
                      transition: 'all 0.2s ease-in-out'
                    }
                  })}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    {/* Checkbox */}
                    <Checkbox 
                      size="small" 
                      checked={selectedCandidates.includes(candidate.id)}
                      onChange={() => handleSelectCandidate(candidate.id)}
                      sx={{ mt: 0.5 }}
                    />

                    {/* Main Content */}
                    <Box sx={{ flex: 1 }}>
                      {/* Header Row */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: 'primary.main' }}>
                            {candidate.name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {candidate.experience}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <LocationOnOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {candidate.location}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        {/* Right Side - Avatar and Actions */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                          <Avatar 
                            src={candidate.avatar} 
                            sx={{ width: 60, height: 60 }}
                          />
                          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                            {candidate.phone}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', fontSize: '0.75rem' }}>
                            {candidate.email}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            {candidate.comments} Comments
                          </Typography>
                          <Chip
                            label={candidate.status}
                            size="small"
                            color={candidate.status === 'Shortlisted' ? 'success' : 'default'}
                            sx={{ fontSize: '0.75rem' }}
                          />
                        </Box>
                      </Box>

                      {/* Experience Details */}
                      <Grid container spacing={3} sx={{ mb: 2 }}>
                        <Grid item xs={12} md={4}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Current
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {candidate.current}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Previous
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {candidate.previous}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Education
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {candidate.education}
                          </Typography>
                        </Grid>
                      </Grid>

                      {/* Skills */}
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 1 }}>
                          Key skills
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {candidate.skills.map((skill, index) => (
                            <Chip 
                              key={index} 
                              label={skill} 
                              size="small" 
                              variant="outlined"
                              color="primary"
                              sx={{ fontSize: '0.75rem', height: 24 }}
                            />
                          ))}
                        </Box>
                      </Box>

                      {/* Footer Actions */}
                      <Box sx={(theme) => ({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2, borderTop: `1px solid ${theme.palette.divider}` })}>
                        <Typography variant="body2" color="text.secondary">
                          Applied on: {candidate.applyDate}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleCandidateClick(candidate)}
                            sx={{ 
                              textTransform: 'none',
                              borderRadius: 1,
                              fontWeight: 500
                            }}
                          >
                            View Profile
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            sx={{ 
                              textTransform: 'none',
                              borderRadius: 1,
                              fontWeight: 500
                            }}
                          >
                            Contact
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Card>
              ))}
            </Box>
          ) : searchPerformed ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                No candidates found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search criteria or filters
              </Typography>
            </Box>
          ) : (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                Search for candidates
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enter a job role or description to find relevant candidates
              </Typography>
            </Box>
          )}

          {/* Pagination */}
          {filteredCandidates && filteredCandidates.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={Math.ceil(totalResults / resultsPerPage)} 
                page={currentPage}
                onChange={(e, page) => setCurrentPage(page)}
                color="primary"
              />
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
}

