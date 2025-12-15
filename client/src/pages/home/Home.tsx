// import SEO from '@/components/ui/SEO'
import StatsSection from '@/components/home/StatsSection';
import TeamSection from '@/components/home/TeamSection';
import React from 'react';
import AboutSection from './AboutSection';
import Hero from './Hero';
import ServicesSection from './ServicesSection';

const Home: React.FC = () => {
  return (
    <>
      {/* Seo compoments */}
      {/* <SEO
                title='Welcome to iPhone Store Cameroon - Your Trusted Apple Partner'
                description='Explore the latest iPhones and accessories at unbeatable prices. Enjoy a seamless shopping experience on our modern e-commerce platform.'
            /> */}

      <Hero />

      <AboutSection />

      <StatsSection />

      <TeamSection />

      <ServicesSection />
    </>
  );
};

export default Home;
