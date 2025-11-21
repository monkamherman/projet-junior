import { Avatar, Box, Grid, Typography, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import React from 'react';

const teamMembers = [
  {
    name: 'Herman Mounchili',
    role: 'Président Fondateur',
    bio: "Expert en NTIC avec plus de 10 ans d'expérience dans le développement et la formation.",
    image: '/img3.jpg',
  },
  {
    name: 'Amina Ousmanou',
    role: 'Directrice des Programmes',
    bio: 'Spécialiste en développement communautaire et gestion de projets éducatifs.',
    image: '/img1.jpg',
  },
  {
    name: 'Ibrahim Djoulde',
    role: 'Responsable Formation',
    bio: 'Formateur certifié en développement web et mobile, passionné par le partage du savoir.',
    image: '/img3.jpg',
  },
  {
    name: 'Fatimé Abba',
    role: 'Chargée de Communication',
    bio: 'Experte en communication digitale et gestion des réseaux sociaux.',
    image: '/img1.jpg',
  },
];

const TeamSection: React.FC = () => {
  const theme = useTheme();

  const fadeIn = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.6,
      },
    }),
  };

  return (
    <Box sx={{ mt: 8, mb: 8 }}>
      <Typography
        variant="h3"
        component="h2"
        align="center"
        sx={{
          fontWeight: 700,
          mb: 6,
          background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Notre Équipe
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {teamMembers.map((member, index) => (
          <Grid item xs={12} sm={6} md={3} key={member.name}>
            <motion.div
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={index}
              style={{ height: '100%' }}
            >
              <Box
                sx={{
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: 4,
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  transition:
                    'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.1)',
                  },
                }}
              >
                <Avatar
                  src={member.image}
                  alt={member.name}
                  sx={{
                    width: 150,
                    height: 150,
                    mb: 3,
                    border: `4px solid ${theme.palette.primary.main}`,
                    '&:hover': {
                      transform: 'scale(1.05)',
                      transition: 'transform 0.3s ease-in-out',
                    },
                  }}
                />
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{ fontWeight: 700, mb: 1 }}
                >
                  {member.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="primary"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {member.role}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {member.bio}
                </Typography>

                <Box sx={{ mt: 'auto', pt: 2, display: 'flex', gap: 2 }}>
                  <a href="#" aria-label={`LinkedIn de ${member.name}`}>
                    <Box
                      component="span"
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(0, 119, 181, 0.1)',
                        color: '#0077B5',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: '#0077B5',
                          color: 'white',
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      <i className="fab fa-linkedin-in"></i>
                    </Box>
                  </a>
                  <a href="#" aria-label={`Twitter de ${member.name}`}>
                    <Box
                      component="span"
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(29, 161, 242, 0.1)',
                        color: '#1DA1F2',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: '#1DA1F2',
                          color: 'white',
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      <i className="fab fa-twitter"></i>
                    </Box>
                  </a>
                </Box>
              </Box>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default TeamSection;
