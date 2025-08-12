import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Grid, Card, CardContent, TextField, Paper,
  FormControl, Select, MenuItem, Divider, CircularProgress, Chip, Checkbox, 
  IconButton, Avatar, InputLabel, Accordion, AccordionSummary, AccordionDetails,
  Rating, Pagination
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
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
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
    matching: true,
    notMatching: false,
    keywords: '',
    starRating: 0
  });
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
    
    try {
      // This would be replaced with an actual API call
      // For now, we'll simulate a response with mock data
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock data for demonstration
      const mockCandidates = [
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
      
      setCandidates(mockCandidates);
    } catch (error) {
      console.error('Error searching candidates:', error);
    } finally {
      setLoading(false);
    }
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

  const filteredCandidates = candidates.filter(candidate => {
    if (filters.matching && candidate.match >= 80) return true;
    if (filters.notMatching && candidate.match < 80) return true;
    return false;
  });

  const totalResults = filteredCandidates.length;
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;
  const paginatedCandidates = filteredCandidates.slice(startIndex, endIndex);

  return (
    <>
      <Navigation currentPage="Relevant Candidates" />
      
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8f9fa' }}>
        {/* Left Sidebar - Filters */}
        <Box sx={{ width: 280, bgcolor: 'white', borderRight: '1px solid #e0e0e0', p: 2 }}>
          {/* Filters Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <FilterListIcon sx={{ mr: 1, color: '#666' }} />
            <Typography variant="h6" sx={{ color: '#333', fontWeight: 500 }}>
              Filters
            </Typography>
          </Box>

          {/* Matching/Not Matching Filter */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Checkbox 
                size="small" 
                checked={filters.matching}
                onChange={(e) => setFilters({...filters, matching: e.target.checked})}
              />
              <Typography variant="body2" sx={{ ml: 1 }}>
                Matching
              </Typography>
              <Typography variant="body2" sx={{ ml: 'auto', color: '#666' }}>
                0
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Checkbox 
                size="small" 
                checked={filters.notMatching}
                onChange={(e) => setFilters({...filters, notMatching: e.target.checked})}
              />
              <Typography variant="body2" sx={{ ml: 1 }}>
                Not Matching
              </Typography>
              <Typography variant="body2" sx={{ ml: 'auto', color: '#666' }}>
                {candidates.length}
              </Typography>
            </Box>
          </Box>

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
                placeholder="Search Keywords in results"
                value={filters.keywords}
                onChange={(e) => setFilters({...filters, keywords: e.target.value})}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: '#666', fontSize: 18 }} />
                }}
              />
            </AccordionDetails>
          </Accordion>

          {/* Star Rating Section */}
          <Accordion sx={{ boxShadow: 'none', '&:before': { display: 'none' }, mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ p: 0, minHeight: 'auto' }}>
              <Typography variant="body2" fontWeight={500}>
                Star Rating
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0, pt: 1 }}>
              <Rating
                value={filters.starRating}
                onChange={(e, newValue) => setFilters({...filters, starRating: newValue})}
                emptyIcon={<StarBorderIcon fontSize="inherit" />}
              />
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
              bgcolor: '#1976d2',
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Refine Search'}
          </Button>
        </Box>

        {/* Right Side - Results */}
        <Box sx={{ flex: 1, p: 3 }}>
          {/* Results Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ color: '#666' }}>
              Showing {candidates.length} result(s)
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" sx={{ color: '#666' }}>
                Show
              </Typography>
              <Select size="small" value={resultsPerPage} onChange={(e) => setResultsPerPage(e.target.value)}>
                <MenuItem value={20}>20</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
              </Select>
              <Typography variant="body2" sx={{ color: '#666' }}>
                Page 1 of 1
              </Typography>
            </Box>
          </Box>

          {/* Action Buttons */}
          {candidates.length > 0 && (
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
                <Typography variant="body2" sx={{ color: '#666' }}>
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
          ) : candidates.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {candidates.map((candidate) => (
                <Card 
                  key={candidate.id}
                  sx={{ 
                    p: 3,
                    border: '1px solid #e0e0e0',
                    borderLeft: '4px solid #2196f3',
                    borderRadius: 2,
                    '&:hover': { 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      transform: 'translateY(-1px)',
                      transition: 'all 0.2s ease-in-out'
                    }
                  }}
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
                          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2', mb: 0.5 }}>
                            {candidate.name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <AccessTimeIcon sx={{ fontSize: 16, color: '#666' }} />
                              <Typography variant="body2" color="text.secondary">
                                {candidate.experience}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <AttachMoneyIcon sx={{ fontSize: 16, color: '#666' }} />
                              <Typography variant="body2" color="text.secondary">
                                ₹{candidate.salary}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <LocationOnOutlinedIcon sx={{ fontSize: 16, color: '#666' }} />
                              <Typography variant="body2" color="text.secondary">
                                {candidate.location}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <NotificationsNoneOutlinedIcon sx={{ fontSize: 16, color: '#666' }} />
                              <Typography variant="body2" color="text.secondary">
                                {candidate.notice}
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
                            sx={{ 
                              fontSize: '0.75rem',
                              bgcolor: candidate.status === 'Shortlisted' ? '#e8f5e9' : '#f5f5f5',
                              color: candidate.status === 'Shortlisted' ? '#2e7d32' : '#666'
                            }}
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
                              sx={{ 
                                bgcolor: '#f0f4f8', 
                                color: '#1976d2',
                                fontSize: '0.75rem',
                                height: 24
                              }} 
                            />
                          ))}
                        </Box>
                      </Box>

                      {/* Footer Actions */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2, borderTop: '1px solid #f0f0f0' }}>
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
          {candidates.length > 0 && (
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
