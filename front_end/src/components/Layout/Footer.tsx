import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton } from '@mui/material';
import { Instagram, Email, Phone } from '@mui/icons-material';

interface TeamMember {
  name: string;
  instagram: string;
  phone: string;
  email: string;
}

const Footer: React.FC = () => {
  const teamMembers: TeamMember[] = [
    {
      name: 'ARYAN RAJESH GADAM',
      instagram: 'https://www.instagram.com/_aryan_rajesh__/?__pwa=1',
      phone: '+91 9704563437',
      email: '123cs0020@iiitk.ac.in',
    },
    {
      name: 'TAGORE JAGATA',
      instagram: 'https://www.instagram.com/tagore_22/?__pwa=1',
      phone: '+91 9154711711',
      email: '123cs0042@iiitk.ac.in',
    },
    {
      name: 'ROVAN MULLANGI',
      instagram: 'https://www.instagram.com/rovan_rex/?__pwa=1',
      phone: '+91 7013395550',
      email: '123cs0036@iiitk.ac.in',
    },
    {
      name: 'VENKATA SAI NADIGATLA',
      instagram: 'https://www.instagram.com/sai_nadigatla_/?__pwa=1',
      phone: '+91 7799660946',
      email: '123CS0041@iiitk.ac.in',
    },
  ];

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#1f2937',
        color: 'white',
        mt: 'auto',
        py: 6,
        px: 2,
      }}
    >
      <Container maxWidth="lg">
        {/* Team Members Section */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            textAlign="center"
            gutterBottom
            sx={{ fontWeight: 700, mb: 4 }}
          >
            Our Team
          </Typography>
          <Grid container spacing={4}>
            {teamMembers.map((member, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box
                  sx={{
                    textAlign: 'center',
                    p: 3,
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 2,
                    transition: 'transform 0.2s, background-color 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, mb: 2, fontSize: '1rem' }}
                  >
                    {member.name}
                  </Typography>

                  {/* Contact Icons */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
                    <IconButton
                      component="a"
                      href={member.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: 'white',
                        '&:hover': { color: '#E4405F' },
                      }}
                      aria-label="Instagram"
                    >
                      <Instagram />
                    </IconButton>
                    <IconButton
                      component="a"
                      href={`mailto:${member.email}`}
                      sx={{
                        color: 'white',
                        '&:hover': { color: '#EA4335' },
                      }}
                      aria-label="Email"
                    >
                      <Email />
                    </IconButton>
                    <IconButton
                      component="a"
                      href={`tel:${member.phone.replace(/\s/g, '')}`}
                      sx={{
                        color: 'white',
                        '&:hover': { color: '#25D366' },
                      }}
                      aria-label="Phone"
                    >
                      <Phone />
                    </IconButton>
                  </Box>

                  {/* Contact Details */}
                  <Typography
                    variant="body2"
                    sx={{ mb: 0.5, fontSize: '0.85rem', color: '#d1d5db' }}
                  >
                    {member.phone}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontSize: '0.85rem', color: '#d1d5db', wordBreak: 'break-word' }}
                  >
                    {member.email}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Footer Bottom */}
        <Box
          sx={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            pt: 4,
            mt: 4,
            textAlign: 'center',
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            Arts Blood Foundation
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: '#9ca3af' }}>
            Blood Bank Management System
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, color: '#9ca3af' }}>
            Indian Institute of Information Technology, Design and Manufacturing, Kurnool (IIITDM Kurnool)
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280', mt: 2 }}>
            © {new Date().getFullYear()} Arts Blood Foundation. All rights reserved.
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280', mt: 1 }}>
            Saving Lives, One Donation at a Time
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
