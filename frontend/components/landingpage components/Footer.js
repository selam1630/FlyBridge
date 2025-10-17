import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Image } from 'react-native';
import COLORS from '../theme/colors';
import facebookIcon from '../../assets/facebook.png';
import twitterIcon from '../../assets/twitter.png';
import linkedinIcon from '../../assets/linkedin.png';

export default function Footer() {
  const socialLinks = [
    { icon: facebookIcon, url: 'https://facebook.com' },
    { icon: twitterIcon, url: 'https://twitter.com' },
    { icon: linkedinIcon, url: 'https://linkedin.com' },
  ];

  return (
    <View style={styles.footer}>
      <Text style={styles.brand}>© 2025 FlyBridg</Text>
      <Text style={styles.tagline}>Connecting skies, passengers, and logistics.</Text>

      <View style={styles.linksContainer}>
        <TouchableOpacity><Text style={styles.link}>About Us</Text></TouchableOpacity>
        <TouchableOpacity><Text style={styles.link}>Services</Text></TouchableOpacity>
        <TouchableOpacity><Text style={styles.link}>Contact</Text></TouchableOpacity>
        <TouchableOpacity><Text style={styles.link}>Privacy Policy</Text></TouchableOpacity>
      </View>

      <View style={styles.socialContainer}>
        {socialLinks.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => Linking.openURL(item.url)}
            style={styles.iconWrapper}
          >
            <Image source={item.icon} style={styles.icon} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: COLORS.BACKGROUND_DARK,
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  brand: {
    color: COLORS.ACCENT_GOLD,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 5,
  },
  tagline: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginBottom: 25,
    textAlign: 'center',
  },
  linksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 25,
  },
  link: {
    color: COLORS.TEXT_LIGHT,
    marginHorizontal: 10,
    marginVertical: 5,
    fontSize: 14,
    fontWeight: '500',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginHorizontal: 10,
  },
  icon: {
    width: 28,
    height: 28,
    tintColor: COLORS.ACCENT_GOLD, // optional, tint your icons
  },
});
