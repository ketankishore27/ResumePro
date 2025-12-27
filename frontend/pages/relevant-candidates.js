import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Grid, Card, CardContent, TextField, Paper,
  FormControl, Select, MenuItem, Divider, CircularProgress, Chip, Checkbox, 
  IconButton, Avatar, InputLabel, Accordion, AccordionSummary, AccordionDetails, Pagination
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import SortIcon from '@mui/icons-material/Sort';
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
  const [jobName, setJobName] = useState('');
  const [jobId, setJobId] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(true);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [filters, setFilters] = useState({
    keywords: [],
    minExperience: '',
    maxExperience: ''
  });
  const [keywordInput, setKeywordInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(20);
  const [sortKeys, setSortKeys] = useState([{ key: 'Newest First', direction: 'desc' }]);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [statusCounts, setStatusCounts] = useState({
    sourced: 0,
    applied: 0,
    aptitude: 0,
    interview: 0,
    offer: 0,
    hire: 0
  });
  const [recentResumesEnabled, setRecentResumesEnabled] = useState(false);
  const [recentResumesCount, setRecentResumesCount] = useState(10);

  // Load all candidates on mount
  useEffect(() => {
    loadAllCandidates();
  }, []);

  const loadAllCandidates = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('http://127.0.0.1:8000/getAllCandidates', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (data && Array.isArray(data) && data.length > 0) {
        // Transform database data to frontend format
        const transformedCandidates = data.map((candidate, index) => ({
          id: index + 1,
          name: candidate.name || 'Unknown',
          jobRole: candidate.job_role || 'Not Specified',
          email_id: candidate.email_id || '',
          mobile_number: candidate.mobile_number || 'N/A',
          experience: formatExperience(candidate.get_yoe),
          relevantExperience: formatExperience(candidate.get_ryoe),
          location: candidate.get_location?.location || 'Not Specified',
          skills: extractSkills(candidate.get_technical_constituent),
          technologies: extractTechnologies(candidate.get_projects),
          education: extractEducation(candidate.get_education),
          current: extractCurrentJob(candidate.get_company),
          previous: extractPreviousJob(candidate.get_company),
          summary: candidate.get_summary_overview?.comment || '',
          resumeScore: candidate.score_resume?.score || 0,
          designation: candidate.get_designation?.current_designation || '',
          addedDate: candidate.created_at ? new Date(candidate.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          status: 'Sourced',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name || 'User')}&background=random`
        }));
        
        // Sort by resume score in descending order
        const sortedCandidates = transformedCandidates.sort((a, b) => b.resumeScore - a.resumeScore);
        console.log('Candidates sorted by resume score (descending):', sortedCandidates.map(c => ({name: c.name, score: c.resumeScore})));
        
        setCandidates(sortedCandidates);
        
        // Update status counts (for now all are sourced)
        setStatusCounts({
          sourced: transformedCandidates.length,
          applied: 0,
          aptitude: 0,
          interview: 0,
          offer: 0,
          hire: 0
        });
      } else {
        console.log('No candidates found in database');
        setCandidates([]);
      }
    } catch (error) {
      console.error('Error loading candidates:', error);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions to extract data from JSON fields
  const formatExperience = (yoe) => {
    if (!yoe) return '0y';
    const years = Math.floor(yoe);
    const months = Math.round((yoe - years) * 12);
    return months > 0 ? `${years}y ${months}m` : `${years}y`;
  };

  const extractSkills = (techConstituent) => {
    if (!techConstituent) return [];
    const skills = [];
    if (techConstituent.high) skills.push(...techConstituent.high);
    if (techConstituent.medium) skills.push(...techConstituent.medium.slice(0, 3));
    return skills.slice(0, 8);
  };

  const extractTechnologies = (projects) => {
    if (!projects || !projects.projects || !Array.isArray(projects.projects)) return [];
    
    // Collect all technologies from all projects
    const allTechnologies = [];
    projects.projects.forEach(project => {
      if (project.technologies && Array.isArray(project.technologies)) {
        allTechnologies.push(...project.technologies);
      }
    });
    
    // Deduplicate technologies using Set
    const uniqueTechnologies = [...new Set(allTechnologies)];
    
    return uniqueTechnologies;
  };

  const extractEducation = (education) => {
    if (!education || !Array.isArray(education) || education.length === 0) return [];
    
    // Sort by end_year descending (most recent first)
    const sortedEducation = [...education].sort((a, b) => {
      const yearA = a.end_year === 'ongoing' ? 9999 : parseInt(a.end_year) || 0;
      const yearB = b.end_year === 'ongoing' ? 9999 : parseInt(b.end_year) || 0;
      return yearB - yearA;
    });
    
    // Get the first two (most recent)
    const recentTwo = sortedEducation.slice(0, 2);
    return recentTwo.map(edu => `${edu.degree || ''} ${edu.institution || ''} (${edu.end_year || 'Ongoing'})`.trim());
  };

  const extractCurrentJob = (company) => {
    if (!company || !company.employment_history || company.employment_history.length === 0) return 'Not Specified';
    
    // Sort by end_year descending (most recent first)
    const sortedJobs = [...company.employment_history].sort((a, b) => {
      const yearA = a.end_year === 'Currently Working' ? 9999 : parseInt(a.end_year) || 0;
      const yearB = b.end_year === 'Currently Working' ? 9999 : parseInt(b.end_year) || 0;
      return yearB - yearA;
    });
    
    const latest = sortedJobs[0];
    return `${latest.position || ''} at ${latest.company || ''}`.trim();
  };

  const extractPreviousJob = (company) => {
    if (!company || !company.employment_history || company.employment_history.length < 2) return 'Not Specified';
    
    // Sort by end_year descending (most recent first)
    const sortedJobs = [...company.employment_history].sort((a, b) => {
      const yearA = a.end_year === 'Currently Working' ? 9999 : parseInt(a.end_year) || 0;
      const yearB = b.end_year === 'Currently Working' ? 9999 : parseInt(b.end_year) || 0;
      return yearB - yearA;
    });
    
    const previous = sortedJobs[1];
    return `${previous.position || ''} at ${previous.company || ''}`.trim();
  };

  const handleSearch = async () => {
    // Check if any filters are applied
    const hasFilters = jobRole || jobDescription || jobName || jobId || 
                       filters.keywords.length > 0 || filters.minExperience || filters.maxExperience || 
                       (recentResumesEnabled && recentResumesCount);
    
    // If no filters are set, load all candidates (same as initial page load)
    if (!hasFilters) {
      await loadAllCandidates();
      return;
    }

    setLoading(true);
    setSearchPerformed(true);
    
    let candidateData = [];
    
    try {
      // Format experience filter for backend
      let experienceFilter = null;
      if (filters.minExperience && filters.maxExperience) {
        experienceFilter = `> ${filters.minExperience} and <= ${filters.maxExperience} Years`;
      } else if (filters.minExperience) {
        experienceFilter = `> ${filters.minExperience} and <= 100 Years`;
      } else if (filters.maxExperience) {
        experienceFilter = `> 0 and <= ${filters.maxExperience} Years`;
      }
      
      // Prepare request payload
      const requestPayload = {
        wordList: filters.keywords,
        jobRole: jobRole,
        jobName: jobName,
        jobId: jobId,
        jobDescription: jobDescription,
        experienceFilter: experienceFilter,
        recentResumeCount: recentResumesEnabled ? recentResumesCount : null
      };
      
      console.log('Sending filter request:', {
        recentResumeCount: requestPayload.recentResumeCount,
        experienceFilter: requestPayload.experienceFilter
      });
      
      // Make API call to filterCandidate endpoint
      const response = await fetch('http://127.0.0.1:8000/filterCandidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload)
      });
      
      const data = await response.json();
      
      // If we got valid data back, transform it
      if (data && Array.isArray(data) && data.length > 0) {
        // Transform database data to frontend format (same as loadAllCandidates)
        candidateData = data.map((candidate, index) => ({
          id: index + 1,
          name: candidate.name || 'Unknown',
          jobRole: candidate.job_role || 'Not Specified',
          email_id: candidate.email_id || '',
          mobile_number: candidate.mobile_number || 'N/A',
          experience: formatExperience(candidate.get_yoe),
          relevantExperience: formatExperience(candidate.get_ryoe),
          location: candidate.get_location?.location || 'Not Specified',
          skills: extractSkills(candidate.get_technical_constituent),
          technologies: extractTechnologies(candidate.get_projects),
          education: extractEducation(candidate.get_education),
          current: extractCurrentJob(candidate.get_company),
          previous: extractPreviousJob(candidate.get_company),
          summary: candidate.get_summary_overview?.comment || '',
          resumeScore: candidate.score_resume?.score || 0,
          designation: candidate.get_designation?.current_designation || '',
          addedDate: candidate.created_at ? new Date(candidate.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          status: 'Sourced',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name || 'User')}&background=random`
        }));
        
        // Sort by resume score in descending order
        candidateData = candidateData.sort((a, b) => b.resumeScore - a.resumeScore);
        console.log('Filtered candidates sorted by resume score (descending):', candidateData.map(c => ({name: c.name, score: c.resumeScore})));
      }
    } catch (error) {
      console.error('Error searching candidates:', error);
    }
    
    // Set candidates from API response (empty array if no data)
    setCandidates(candidateData);
    
    // Update status counts
    setStatusCounts({
      sourced: candidateData.length,
      applied: 0,
      aptitude: 0,
      interview: 0,
      offer: 0,
      hire: 0
    });
    
    setLoading(false);
  };

  const handleCandidateClick = (candidate) => {
    router.push(`/insights?email_id=${candidate.email_id}`);
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

  // Helper function to parse experience string like "3y 1m" to months
  const parseExperience = (expString) => {
    if (!expString) return 0;
    
    const years = expString.match(/(\d+)y/);
    const months = expString.match(/(\d+)m/);
    
    const totalMonths = (years ? parseInt(years[1]) * 12 : 0) + (months ? parseInt(months[1]) : 0);
    return totalMonths;
  };

  // Filter candidates based on experience
  const filterByExperience = (candidate) => {
    const expMonths = parseExperience(candidate.experience);
    const expYears = expMonths / 12;
    
    const minExp = filters.minExperience ? parseFloat(filters.minExperience) : null;
    const maxExp = filters.maxExperience ? parseFloat(filters.maxExperience) : null;
    
    // If both filters are empty, show all
    if (!minExp && !maxExp) return true;
    
    // If only min is set
    if (minExp && !maxExp) return expYears >= minExp;
    
    // If only max is set
    if (!minExp && maxExp) return expYears <= maxExp;
    
    // If both are set
    return expYears >= minExp && expYears <= maxExp;
  };

  // Apply all filters
  let filteredCandidates = candidates ? candidates.filter(filterByExperience) : [];

  // Multi-level sorting function
  const getComparatorForKey = (key, direction) => {
    const multiplier = direction === 'asc' ? -1 : 1;
    
    switch (key) {
      case 'Newest First':
      case 'Oldest First':
      case 'Date Added':
        return (a, b) => {
          const dateA = new Date(a.addedDate);
          const dateB = new Date(b.addedDate);
          return (dateB - dateA) * multiplier;
        };
      
      case 'Name':
        return (a, b) => {
          const nameA = (a.name || '').toLowerCase();
          const nameB = (b.name || '').toLowerCase();
          return nameA.localeCompare(nameB) * multiplier;
        };
      
      case 'Experience':
        return (a, b) => {
          const expA = parseExperience(a.experience);
          const expB = parseExperience(b.experience);
          return (expB - expA) * multiplier;
        };
      
      case 'Resume Score':
        return (a, b) => {
          const scoreA = a.resumeScore || 0;
          const scoreB = b.resumeScore || 0;
          return (scoreB - scoreA) * multiplier;
        };
      
      case 'Location':
        return (a, b) => {
          const locA = (a.location || '').toLowerCase();
          const locB = (b.location || '').toLowerCase();
          return locA.localeCompare(locB) * multiplier;
        };
      
      default:
        return () => 0;
    }
  };

  // Apply multi-level sorting
  const sortCandidates = (candidatesToSort) => {
    if (sortKeys.length === 0) return candidatesToSort;
    
    return [...candidatesToSort].sort((a, b) => {
      // Apply each sort key in order until a non-zero comparison is found
      for (const sortKey of sortKeys) {
        const comparator = getComparatorForKey(sortKey.key, sortKey.direction);
        const result = comparator(a, b);
        if (result !== 0) return result;
      }
      return 0;
    });
  };

  filteredCandidates = sortCandidates(filteredCandidates);

  // Helper functions for sort management
  const addSortKey = () => {
    setSortKeys([...sortKeys, { key: 'Name', direction: 'desc' }]);
  };

  const removeSortKey = (index) => {
    const newSortKeys = sortKeys.filter((_, i) => i !== index);
    setSortKeys(newSortKeys.length > 0 ? newSortKeys : [{ key: 'Newest First', direction: 'desc' }]);
  };

  const updateSortKey = (index, field, value) => {
    const newSortKeys = [...sortKeys];
    newSortKeys[index][field] = value;
    setSortKeys(newSortKeys);
  };

  const moveSortKey = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sortKeys.length) return;
    
    const newSortKeys = [...sortKeys];
    [newSortKeys[index], newSortKeys[newIndex]] = [newSortKeys[newIndex], newSortKeys[index]];
    setSortKeys(newSortKeys);
  };

  const totalResults = filteredCandidates.length || 0;
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;
  const paginatedCandidates = filteredCandidates.length > 0 ? filteredCandidates.slice(startIndex, endIndex) : [];

  return (
    <>
      <Navigation currentPage="Relevant Candidates" />
      
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'transparent' }}>
        {/* Left Sidebar - Filters */}
        <Box sx={(theme) => ({ width: 280, bgcolor: 'rgba(26, 26, 26, 0.05)', backdropFilter: 'blur(12px)', borderRight: `1px solid ${theme.palette.divider}`, p: 2 })}>
          {/* Filters Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <FilterListIcon sx={(theme) => ({ mr: 1, color: theme.palette.text.secondary })} />
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              Filters
            </Typography>
          </Box>

          {/* Recent Resumes Filter */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Checkbox
                size="small"
                checked={recentResumesEnabled}
                onChange={(e) => setRecentResumesEnabled(e.target.checked)}
              />
              <Typography variant="body2" fontWeight={500}>
                Recent Resumes
              </Typography>
            </Box>
            <TextField
              fullWidth
              size="small"
              type="text"
              value={recentResumesCount}
              onChange={(e) => {
                const value = e.target.value;
                // Only allow positive integers - reject any non-numeric characters
                if (value === '') {
                  setRecentResumesCount('');
                } else if (/^\d+$/.test(value)) {
                  const numValue = parseInt(value, 10);
                  if (numValue > 0) {
                    setRecentResumesCount(numValue);
                  }
                }
                // If value doesn't match the pattern, don't update state (ignore the input)
              }}
              onKeyPress={(e) => {
                // Prevent any non-numeric key press
                if (!/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              disabled={!recentResumesEnabled}
              placeholder="Enter count"
              inputMode="numeric"
              sx={{
                '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                  display: 'none',
                },
                '& input[type=number]': {
                  MozAppearance: 'textfield',
                },
              }}
            />
          </Box>

          <Divider sx={{ mb: 2 }} />

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

          {/* Experience Filter */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
              Experience (Years)
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <FormControl fullWidth size="small">
                <Select
                  value={filters.minExperience}
                  onChange={(e) => {
                    const newMin = e.target.value;
                    // If new min is greater than or equal to current max, reset max
                    if (newMin && filters.maxExperience && parseInt(newMin) >= parseInt(filters.maxExperience)) {
                      setFilters({...filters, minExperience: newMin, maxExperience: ''});
                    } else {
                      setFilters({...filters, minExperience: newMin});
                    }
                  }}
                  displayEmpty
                >
                  <MenuItem value="">Min</MenuItem>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((year) => (
                    <MenuItem key={year} value={year.toString()}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="body2" color="text.secondary">-</Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={filters.maxExperience}
                  onChange={(e) => setFilters({...filters, maxExperience: e.target.value})}
                  displayEmpty
                >
                  <MenuItem value="">Max</MenuItem>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
                    .filter((year) => !filters.minExperience || year > parseInt(filters.minExperience))
                    .map((year) => (
                      <MenuItem key={year} value={year.toString()}>
                        {year}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Job Name Filter */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
              Job Name
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Enter job name..."
              value={jobName}
              onChange={(e) => setJobName(e.target.value)}
            />
          </Box>

          {/* Job Id Filter */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
              Job Id
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Enter job ID..."
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
            />
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
          {/* Status Badges */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Chip label={`All Candidates`} color="default" sx={{ fontWeight: 600 }} />
            <Chip label={`${statusCounts.sourced} Sourced`} sx={{ bgcolor: '#9e9e9e', color: 'white', fontWeight: 500 }} />
            <Chip label={`${statusCounts.applied} Applied`} sx={{ bgcolor: '#2196f3', color: 'white', fontWeight: 500 }} />
            <Chip label={`${statusCounts.aptitude} Aptitude`} sx={{ bgcolor: '#00bcd4', color: 'white', fontWeight: 500 }} />
            <Chip label={`${statusCounts.interview} Interview`} sx={{ bgcolor: '#ff9800', color: 'white', fontWeight: 500 }} />
            <Chip label={`${statusCounts.offer} Offer`} sx={{ bgcolor: '#ff5722', color: 'white', fontWeight: 500 }} />
            <Chip label={`${statusCounts.hire} Hire`} sx={{ bgcolor: '#4caf50', color: 'white', fontWeight: 500 }} />
          </Box>

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
                <Button 
                  size="small" 
                  startIcon={<SortIcon />}
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  sx={{ textTransform: 'none' }}
                  variant="outlined"
                >
                  Multi-Sort ({sortKeys.length})
                </Button>
              </Box>
            </Box>
          )}

          {/* Multi-Sort Menu */}
          {showSortMenu && (
            <Paper 
              elevation={3} 
              sx={(theme) => ({ 
                p: 2,
                backgroundColor: 'rgba(26, 26, 26, 0.05)',
                backdropFilter: 'blur(12px)', 
                mb: 3, 
                border: `1px solid ${theme.palette.divider}`
              })}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Multi-Level Sorting
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={addSortKey}
                  variant="outlined"
                  sx={{ textTransform: 'none' }}
                >
                  Add Sort Key
                </Button>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Sort priority: Top to bottom. Candidates are sorted by the first key, then by the second key for ties, and so on.
              </Typography>

              {sortKeys.map((sortKey, index) => (
                <Box 
                  key={index}
                  sx={(theme) => ({ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2, 
                    mb: 2,
                    p: 2,
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    borderRadius: 1,
                    border: `1px solid ${theme.palette.divider}`
                  })}
                >
                  <Chip 
                    label={`#${index + 1}`} 
                    size="small" 
                    color="primary"
                    sx={{ minWidth: 40 }}
                  />
                  
                  <FormControl size="small" sx={{ minWidth: 180 }}>
                    <Select
                      value={sortKey.key}
                      onChange={(e) => updateSortKey(index, 'key', e.target.value)}
                    >
                      <MenuItem value="Date Added">Date Added</MenuItem>
                      <MenuItem value="Name">Name</MenuItem>
                      <MenuItem value="Experience">Experience</MenuItem>
                      <MenuItem value="Resume Score">Resume Score</MenuItem>
                      <MenuItem value="Location">Location</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <Select
                      value={sortKey.direction}
                      onChange={(e) => updateSortKey(index, 'direction', e.target.value)}
                    >
                      <MenuItem value="desc">High to Low</MenuItem>
                      <MenuItem value="asc">Low to High</MenuItem>
                    </Select>
                  </FormControl>

                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      onClick={() => moveSortKey(index, 'up')}
                      disabled={index === 0}
                      title="Move up"
                    >
                      <ExpandMoreIcon sx={{ transform: 'rotate(180deg)' }} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => moveSortKey(index, 'down')}
                      disabled={index === sortKeys.length - 1}
                      title="Move down"
                    >
                      <ExpandMoreIcon />
                    </IconButton>
                  </Box>

                  <IconButton
                    size="small"
                    onClick={() => removeSortKey(index)}
                    disabled={sortKeys.length === 1}
                    color="error"
                    title="Remove sort key"
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
              ))}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary">
                  Active sort keys: {sortKeys.length}
                </Typography>
                <Button
                  size="small"
                  onClick={() => setShowSortMenu(false)}
                  variant="contained"
                  sx={{ textTransform: 'none' }}
                >
                  Apply & Close
                </Button>
              </Box>
            </Paper>
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
                    backgroundColor: 'rgba(26, 26, 26, 0.05)',
                    backdropFilter: 'blur(12px)',
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
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <Avatar 
                              src={candidate.avatar} 
                              sx={{ width: 50, height: 50 }}
                            />
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0, color: 'primary.main', cursor: 'pointer' }}
                                onClick={() => handleCandidateClick(candidate)}>
                                {candidate.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                {candidate.jobRole}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1, flexWrap: 'wrap' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                              {candidate.experience} Exp
                            </Typography>
                            <Typography variant="body2" sx={{ fontSize: 16, color: 'text.secondary' }}>•</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Typography variant="body2" color="text.secondary">
                                📞 {candidate.mobile_number}
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ fontSize: 16, color: 'text.secondary' }}>•</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <LocationOnOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {candidate.location}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        {/* Right Side - Date, Resume Score, and Status */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            Added: {candidate.addedDate}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            {/* Resume Score Badge */}
                            <Chip
                              label={`Score: ${candidate.resumeScore}/100`}
                              size="small"
                              sx={{ 
                                bgcolor: candidate.resumeScore >= 80 ? '#4caf50' : 
                                         candidate.resumeScore >= 60 ? '#2196f3' : 
                                         candidate.resumeScore >= 40 ? '#ff9800' : '#f44336',
                                color: 'white', 
                                fontWeight: 600,
                                fontSize: '0.75rem'
                              }}
                            />
                            <Chip
                              label={candidate.status}
                              size="small"
                              sx={{ 
                                bgcolor: '#9e9e9e', 
                                color: 'white', 
                                fontWeight: 500,
                                fontSize: '0.75rem'
                              }}
                            />
                          </Box>
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
                          {Array.isArray(candidate.education) && candidate.education.length > 0 ? (
                            <Box component="ul" sx={{ mt: 0.5, pl: 2, mb: 0 }}>
                              {candidate.education.map((edu, index) => (
                                <Typography key={index} component="li" variant="body2" sx={{ fontSize: '0.875rem' }}>
                                  {edu}
                                </Typography>
                              ))}
                            </Box>
                          ) : (
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              Not Specified
                            </Typography>
                          )}
                        </Grid>
                      </Grid>

                      {/* Technologies */}
                      {candidate.technologies && candidate.technologies.length > 0 && (
                        <Accordion 
                          sx={{ 
                            mb: 2, 
                            boxShadow: 'none',
                            '&:before': { display: 'none' },
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: '8px !important',
                            overflow: 'hidden'
                          }}
                        >
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            sx={{ 
                              minHeight: 40,
                              '&.Mui-expanded': { minHeight: 40 },
                              '& .MuiAccordionSummary-content': { margin: '8px 0' }
                            }}
                          >
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                              Technologies ({candidate.technologies.length})
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails sx={{ pt: 0, pb: 2 }}>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {candidate.technologies.map((tech, index) => (
                                <Chip 
                                  key={index} 
                                  label={tech} 
                                  size="small" 
                                  variant="outlined"
                                  color="secondary"
                                  sx={{ fontSize: '0.75rem', height: 24 }}
                                />
                              ))}
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                      )}

                      {/* Footer Actions */}
                      <Box sx={(theme) => ({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2, borderTop: `1px solid ${theme.palette.divider}` })}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            ✉️ {candidate.email_id}
                          </Typography>
                        </Box>
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

