import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Box, Typography, Button } from '@mui/material';

const Navigation = ({ currentPage = 'Home', onQueryCandidateClick }) => {
  const router = useRouter();

  const navigationItems = [
    { label: 'Home', path: '/', active: currentPage === 'Home' },
    { label: 'Bulk Import', path: '/bulk-import', active: currentPage === 'Bulk Import' },
    { label: 'Query Candidate', path: '/insights', active: currentPage === 'Query Candidate' }
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
        background: '#fff', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        borderBottom: '1px solid #e5e7eb'
      }}>
        {/* Left side - Logo and Navigation */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Typography 
              variant="h6" 
              fontWeight={700} 
              sx={{ 
                letterSpacing: 0.5, 
                color: 'inherit', 
                cursor: 'pointer',
                '&:hover': { color: '#2563eb' }
              }}
            >
              Resume<span style={{ color: '#2563eb' }}>Pro</span>
            </Typography>
          </Link>
          
          {/* Navigation Items */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {navigationItems.map((item) => (
              <Button
                key={item.path}
                component={Link}
                href={item.path}
                variant={item.active ? "contained" : "outlined"}
                color={item.active ? "primary" : "inherit"}
                size="small"
                onClick={item.label === 'Query Candidate' && onQueryCandidateClick ? () => {
                  console.log('Query Candidate clicked - resetting states');
                  onQueryCandidateClick();
                } : undefined}
                sx={{ 
                  fontWeight: item.active ? 700 : 600, 
                  borderRadius: 2, 
                  textTransform: 'none',
                  px: 2,
                  py: 0.5,
                  minWidth: 'auto',
                  ...(item.active ? {
                    backgroundColor: '#2563eb',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#1d4ed8'
                    }
                  } : {
                    borderColor: 'transparent',
                    color: '#6b7280',
                    '&:hover': {
                      borderColor: '#d1d5db',
                      backgroundColor: '#f9fafb'
                    }
                  })
                }}
              >
                {item.label}
              </Button>
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

      {/* Breadcrumb */}
      <Box sx={{ 
        px: 3, 
        py: 1.5, 
        background: '#f8fafc', 
        borderBottom: '1px solid #e5e7eb' 
      }}>
        <Typography variant="body2" color="text.secondary">
          <Link href="/" style={{ color: '#6b7280', textDecoration: 'none' }}>
            ResumePro
          </Link>
          {currentPage !== 'Home' && (
            <>
              {' > '}
              <span style={{ color: '#374151', fontWeight: 500 }}>{currentPage}</span>
            </>
          )}
        </Typography>
      </Box>
    </>
  );
};

export default Navigation;
