import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import * as Animatable from 'react-native-animatable';
import COLORS from '../theme/colors';
import VideoCard from './VideoCard';

const isWeb = Platform.OS === 'web';

export default function HeroSection({ player, onExplorePress }) {
  return (
    <View style={styles.heroSection}>
      <View style={styles.heroLeft}>
        <Animatable.Text 
          animation="fadeInDown" 
          delay={200} 
          style={styles.heroTitle}
        >
          Deliver <Text style={{ color: COLORS.ACCENT_GOLD }}>Smarter</Text>, Connect <Text style={{ color: COLORS.ACCENT_GOLD }}>Faster</Text>
        </Animatable.Text>

        <Animatable.Text 
          animation="fadeInUp" 
          delay={400} 
          style={styles.heroSubtitle}
        >
          SwiftLink connects senders and carriers seamlessly, ensuring packages move fast, safely,
          and affordably with <Text style={{ fontWeight: '700' }}>real-time tracking</Text> and full insurance coverage.
        </Animatable.Text>

        <Animatable.View animation="pulse" delay={600} iterationCount="infinite">
          <TouchableOpacity style={styles.quoteBtn} onPress={onExplorePress}>
            <Text style={styles.quoteText}>Explore Services →</Text>
          </TouchableOpacity>
        </Animatable.View>
      </View>

      <Animatable.View animation="fadeInRight" delay={500} style={styles.heroRight}>
        <VideoCard player={player} />
      </Animatable.View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroSection: { 
    backgroundColor: COLORS.BACKGROUND_DARK,
    paddingHorizontal: isWeb ? 60 : 20,
    flexDirection: isWeb ? 'row' : 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 80,
  },
  heroLeft: { flex: 0.6, paddingRight: isWeb ? 40 : 0, marginBottom: isWeb ? 0 : 40 },
  heroRight: { flex: 0.4, alignItems: 'center' },
  heroTitle: { 
    color: COLORS.TEXT_LIGHT, 
    fontSize: isWeb ? 52 : 36, 
    fontWeight: '800', 
    marginBottom: 20,
    lineHeight: isWeb ? 60 : 42,
  },
  heroSubtitle: { 
    color: 'rgba(255,255,255,0.85)', 
    fontSize: isWeb ? 18 : 16, 
    lineHeight: 28, 
    marginBottom: 30 
  },
  quoteBtn: { 
    backgroundColor: COLORS.ACCENT_GOLD, 
    paddingVertical: 15, 
    paddingHorizontal: 25,
    borderRadius: 8, 
    width: 220, 
    alignItems: 'center',
    shadowColor: COLORS.SHADOW_COLOR,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  quoteText: { 
    color: COLORS.BACKGROUND_DARK, 
    fontWeight: 'bold', 
    fontSize: 17 
  },
});
