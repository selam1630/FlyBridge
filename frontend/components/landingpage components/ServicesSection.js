import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform, TouchableOpacity, Animated } from 'react-native';
import * as Animatable from 'react-native-animatable';
import COLORS from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

const ServiceItem = ({ title, description, details, icon, index }) => {
  const scale = useState(new Animated.Value(1))[0];

  const onPressIn = () => Animated.spring(scale, { toValue: 1.05, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  const onMouseEnter = () => {
    if (isWeb) Animated.spring(scale, { toValue: 1.05, useNativeDriver: true }).start();
  };
  const onMouseLeave = () => {
    if (isWeb) Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  };

  const cardStyle = [
    styles.serviceCard,
    isWeb
      ? { background: 'linear-gradient(135deg, #FFB733 0%, #F4F7FB 100%)' }
      : { backgroundColor: COLORS.CARD_BG },
    { transform: [{ scale }] },
  ];

  return (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 200}
      duration={800}
      style={styles.serviceCardWrapper}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <TouchableOpacity
        activeOpacity={0.95}
        style={styles.touchableWrapper}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <Animated.View style={cardStyle}>
          <Animatable.View animation="bounceIn" duration={1200} style={styles.iconWrapper}>
          </Animatable.View>
          <Animatable.Text animation="fadeInUp" delay={300} style={styles.serviceTitle}>
            {title}
          </Animatable.Text>
          <Animatable.Text animation="fadeInUp" delay={400} style={styles.serviceDescription}>
            {description}
          </Animatable.Text>
          <Animatable.Text animation="fadeInUp" delay={500} style={styles.serviceDetails}>
            {details}
          </Animatable.Text>
        </Animated.View>
      </TouchableOpacity>
    </Animatable.View>
  );
};

export default function ServicesSection({ services }) {
  const rows = [];
  for (let i = 0; i < services.length; i += 2) {
    rows.push(services.slice(i, i + 2));
  }

  return (
    <View style={styles.servicesSection}>
      <Text style={styles.sectionTitle}>Our Services</Text>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.servicesRow}>
          {row.map((service, index) => (
            <ServiceItem key={index} index={rowIndex * 2 + index} {...service} />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  servicesSection: {
    paddingVertical: 80,
    paddingHorizontal: 20,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
  },
  sectionTitle: {
    fontSize: isWeb ? 44 : 32,
    fontWeight: '900',
    color: COLORS.TEXT_DARK,
    textAlign: 'center',
    marginBottom: 60,
  },
  servicesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 30,
  },
  serviceCardWrapper: {
    width: isWeb ? '45%' : '100%',
    marginBottom: 20,
  },
  touchableWrapper: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  serviceCard: {
    borderRadius: 24,
    padding: 25,
    alignItems: 'center',
    justifyContent: 'flex-start',
    shadowColor: COLORS.SHADOW_COLOR,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  iconWrapper: {
    backgroundColor: 'rgba(255,187,51,0.2)',
    padding: 20,
    borderRadius: 50,
    marginBottom: 20,
  },
  serviceTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
    color: COLORS.TEXT_DARK,
    textAlign: 'center',
  },
  serviceDescription: {
    fontSize: 16,
    color: COLORS.TEXT_DARK,
    textAlign: 'center',
    marginBottom: 8,
  },
  serviceDetails: {
    fontSize: 14,
    color: COLORS.TEXT_DARK,
    textAlign: 'center',
  },
});
