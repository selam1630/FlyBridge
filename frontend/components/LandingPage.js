import React, { useRef, useEffect } from 'react'; 
import { View, ScrollView, StatusBar } from 'react-native';
import { useVideoPlayer } from 'expo-video';
import Header from './landingpage components/Header';
import HeroSection from './landingpage components/HeroSection';
import ServicesSection from './landingpage components/ServicesSection';
import AboutSection from './landingpage components/AboutSection';
import Footer from './landingpage components/Footer';
import Statistics from './landingpage components/Statistics';
import COLORS from './theme/colors';

const backgroundVideo = require('../assets/background.mp4');

export default function LandingPage({ navigation }) {
  const scrollRef = useRef(null);
  const servicesRef = useRef(null);
  const aboutRef = useRef(null);

  const player = useVideoPlayer(backgroundVideo, (p) => {
    p.loop = true;
    p.muted = true;
  });

  useEffect(() => {
    const playVideo = async () => {
      try {
        await player.play();
      } catch (error) {
        console.log('Video playback error:', error);
      }
    };
    playVideo();
  }, [player]);

  const scrollTo = (ref) => {
    ref.current?.measureLayout(
      scrollRef.current.getInnerViewNode(),
      (x, y) => scrollRef.current.scrollTo({ y, animated: true })
    );
  };

  const services = [
    {
      title: 'Courier Delivery',
      description: 'Fast, secure delivery for small packages.',
      details: 'Our system ensures every small parcel is tracked in real-time, from pickup to delivery, providing notifications via SMS and email.',
      icon: 'car-outline',
    },
    {
      title: 'Freight & Cargo',
      description: 'Reliable freight for large shipments.',
      details: 'We handle bulk shipments efficiently with specialized cargo management, ensuring safe and timely delivery across all locations.',
      icon: 'cube-outline',
    },
    {
      title: 'Package Tracking',
      description: 'Live updates from sender to receiver.',
      details: 'Track every shipment in real-time with our system, which provides detailed status updates and delivery confirmations.',
      icon: 'eye-outline',
    },
    {
      title: 'Business Solutions',
      description: 'Custom logistics for enterprises.',
      details: 'Optimize your supply chain with bulk shipment management, priority scheduling, and dedicated business support.',
      icon: 'briefcase-outline',
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.BACKGROUND_LIGHT }}>
      <StatusBar barStyle="dark-content" />
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>
        <Header onServicesPress={() => scrollTo(servicesRef)} onAboutPress={() => scrollTo(aboutRef)} />
        <HeroSection player={player} onExplorePress={() => scrollTo(servicesRef)} />
        <View ref={servicesRef}>
          <ServicesSection services={services} />
        </View>
        <View ref={aboutRef}>
          <AboutSection onContactPress={() => navigation.navigate('Contact')} />
        </View>
        <Statistics />
        <Footer />
      </ScrollView>
    </View>
  );
}
