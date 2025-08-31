import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Box, Typography, Button, Menu, MenuItem } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const Navigation = ({ currentPage = 'Home', onQueryCandidateClick }) => {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState(null);
  const queryMenuOpen = Boolean(anchorEl);
  
  // Handle dropdown menu open
  const handleQueryMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  // Handle dropdown menu close
  const handleQueryMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Handle dropdown item click
  const handleDropdownItemClick = (path, label) => {
    // First close the dropdown menu
    handleQueryMenuClose();
    
    // Only reset states if explicitly clicking on Query Candidate from another page
    // This preserves context data when navigating from other pages
    if (label === 'Query Candidate' && onQueryCandidateClick && router.pathname !== '/insights') {
      console.log('Query Candidate clicked from another page - resetting states');
      onQueryCandidateClick();
    }
    
    // Navigate to the selected page
    router.push(path);
  };

  const navigationItems = [
    { label: 'Home', path: '/', active: currentPage === 'Home' },
    { label: 'Bulk Import', path: '/bulk-import', active: currentPage === 'Bulk Import' },
    { 
      label: 'Query', 
      active: currentPage === 'Query Candidate' || currentPage === 'Relevant Candidates',
      hasSubmenu: true,
      subItems: [
        { label: 'Query Candidate', path: '/insights', active: currentPage === 'Query Candidate' },
        { label: 'Relevant Candidates', path: '/relevant-candidates', active: currentPage === 'Relevant Candidates' }
      ]
    }
  ];

  return (
    <>
      {/* Main Navigation Bar */}
      <Box sx={{ 
        px: 3, 
        py: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        background: 'linear-gradient(135deg, #1a1a1a 0%, #212121 100%)', 
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        borderBottom: '1px solid #333333'
      }}>
        {/* Left side - Logo and Navigation */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Typography 
              variant="h6" 
              fontWeight={700} 
              sx={{ 
                letterSpacing: 0.5, 
                color: '#ffffff', 
                cursor: 'pointer',
                '&:hover': { color: '#00e676' }
              }}
            >
              Resume<span style={{ color: '#00e676' }}>Pro</span>
            </Typography>
          </Link>
          
          {/* Navigation Items */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {navigationItems.map((item, index) => (
              item.hasSubmenu ? (
                <React.Fragment key={index}>
                  <Button
                    id="query-menu-button"
                    aria-controls={queryMenuOpen ? 'query-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={queryMenuOpen ? 'true' : undefined}
                    variant={item.active ? "contained" : "outlined"}
                    color={item.active ? "primary" : "inherit"}
                    size="small"
                    onClick={handleQueryMenuClick}
                    endIcon={<KeyboardArrowDownIcon fontSize="small" />}
                    sx={{ 
                      fontWeight: item.active ? 700 : 600, 
                      borderRadius: 2, 
                      textTransform: 'none',
                      px: 2,
                      py: 0.5,
                      minWidth: 'auto',
                      ...(item.active ? {
                        backgroundColor: '#00e676',
                        color: '#000000',
                        '&:hover': {
                          backgroundColor: '#00c853'
                        }
                      } : {
                        borderColor: 'transparent',
                        color: '#b0b0b0',
                        '&:hover': {
                          borderColor: '#333333',
                          backgroundColor: '#2a2a2a'
                        }
                      })
                    }}
                  >
                    {item.label}
                  </Button>
                  <Menu
                    id="query-menu"
                    anchorEl={anchorEl}
                    open={queryMenuOpen}
                    onClose={handleQueryMenuClose}
                    MenuListProps={{
                      'aria-labelledby': 'query-menu-button',
                    }}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'left',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'left',
                    }}
                    sx={{
                      '& .MuiPaper-root': {
                        minWidth: '160px',
                        borderRadius: '0.375rem',
                        mt: 0.5,
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      }
                    }}
                  >
                    {item.subItems.map((subItem) => (
                      <MenuItem 
                        key={subItem.path}
                        onClick={() => handleDropdownItemClick(subItem.path, subItem.label)}
                        selected={subItem.active}
                        sx={{
                          py: 1,
                          px: 2,
                          ...(subItem.active ? {
                            backgroundColor: '#00e676 !important',
                            color: '#000000',
                            '&:hover': {
                              backgroundColor: '#00c853 !important'
                            }
                          } : {
                            color: '#b0b0b0',
                            '&:hover': {
                              backgroundColor: '#2a2a2a'
                            }
                          })
                        }}
                      >
                        {subItem.label}
                      </MenuItem>
                    ))}
                  </Menu>
                </React.Fragment>
              ) : (
                <Button
                  key={item.path}
                  component={Link}
                  href={item.path}
                  variant={item.active ? "contained" : "outlined"}
                  color={item.active ? "primary" : "inherit"}
                  size="small"
                  sx={{ 
                    fontWeight: item.active ? 700 : 600, 
                    borderRadius: 2, 
                    textTransform: 'none',
                    px: 2,
                    py: 0.5,
                    minWidth: 'auto',
                    ...(item.active ? {
                      backgroundColor: '#00e676',
                      color: '#000000',
                      '&:hover': {
                        backgroundColor: '#00c853'
                      }
                    } : {
                      borderColor: 'transparent',
                      color: '#b0b0b0',
                      '&:hover': {
                        borderColor: '#333333',
                        backgroundColor: '#2a2a2a'
                      }
                    })
                  }}
                >
                  {item.label}
                </Button>
              )
            ))}
          </Box>
        </Box>

        {/* Right side - Action Button */}
        <Button 
          variant="contained" 
          color="success" 
          sx={{ 
            fontWeight: 700, 
            borderRadius: 2,
            textTransform: 'none',
            px: 3
          }}
          onClick={() => {
            // Future: Add feedback functionality
            console.log('Get Feedback clicked');
          }}
        >
          Get Feedback
        </Button>
      </Box>

    </>
  );
};

export default Navigation;
