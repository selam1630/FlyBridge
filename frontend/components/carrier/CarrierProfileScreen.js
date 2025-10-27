import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Platform,
  StatusBar,
  ScrollView,
  Dimensions,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import DashboardHeader from '../dashboardheader';

const screenWidth = Dimensions.get('window').width;
const contentPadding = 20;
const cardSpacing = 15;

const SidebarLink = ({ text, isActive, onPress }) => (
  <TouchableOpacity
    style={[
      styles.sidebarLink,
      isActive && styles.activeSidebarLink,
    ]}
    onPress={onPress}
  >
    <Text style={[styles.sidebarText, isActive && styles.activeSidebarText]}>
      {text}
    </Text>
  </TouchableOpacity>
);

const COLORS = {
  BACKGROUND_LIGHT: '#F7F8FC',
  BACKGROUND_DARK: '#2D4B46',
  ACCENT_GOLD: '#FFB733',
  TEXT_DARK: '#333',
  TEXT_LIGHT: '#FFF',
  CARD_BG: '#FFF',
  SUCCESS: '#4CAF50',
  ERROR: '#FF4D4D',
  SHADOW: 'rgba(0,0,0,0.05)',
};

export default function CarrierProfileScreen() {
  const navigation = useNavigation();
  const { token, user } = useContext(AuthContext);

  const [profile, setProfile] = useState({ fullName: '', phone: '', email: '', points: 0 });
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [newDepartureDate, setNewDepartureDate] = useState(new Date());
  const [activeMenu, setActiveMenu] = useState('SETTINGS');

  const BASE_URL = 'https://flybridge-1.onrender.com'

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/carrier/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setProfile({
          fullName: data.carrier.fullName,
          phone: data.carrier.phone,
          email: data.carrier.email,
          points: data.carrier.points,
        });
        setFlights(data.carrier.flights || []);
      } else {
        Alert.alert('Error', data.message || 'Failed to fetch profile');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Network error while fetching profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchProfile();
  }, [token]);

  const handleUpdateProfile = async () => {
    try {
      setUpdatingProfile(true);
      const res = await fetch(`${BASE_URL}/api/carrier/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fullName: profile.fullName, phone: profile.phone }),
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data.carrier);
        Alert.alert('✅ Success', 'Profile updated successfully');
      } else {
        Alert.alert('Error', data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Network error while updating profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleDeleteFlight = async (flightId) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this flight?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            const res = await fetch(`${BASE_URL}/api/carrier/profile/flight/${flightId}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) {
              setFlights(flights.filter(f => f.id !== flightId));
              Alert.alert('🗑️ Deleted', 'Flight removed successfully');
            } else {
              Alert.alert('Error', data.message || 'Failed to delete flight');
            }
          } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Network error while deleting flight');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const handleUpdateFlightDate = async () => {
    if (!selectedFlight) return;
    try {
      const res = await fetch(`${BASE_URL}/api/carrier/profile/flight/${selectedFlight.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ departureDate: newDepartureDate.toISOString() }),
      });
      const data = await res.json();
      if (res.ok) {
        setFlights(flights.map(f => (f.id === selectedFlight.id ? data.updatedFlight : f)));
        setDatePickerVisible(false);
        setSelectedFlight(null);
        Alert.alert('✅ Success', 'Flight updated successfully');
      } else {
        Alert.alert('Error', data.message || 'Failed to update flight');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Network error while updating flight');
    }
  };

  const renderFlight = ({ item }) => (
    <View style={styles.flightCard}>
      <Text style={styles.flightRoute}>
        {item.from} → {item.to}
      </Text>
      <Text style={styles.flightDetailText}>Departure: {new Date(item.departureDate).toLocaleString()}</Text>
      <Text style={styles.flightDetailText}>Available KG: {item.availableKg}</Text>
      <View style={styles.flightActions}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: COLORS.ACCENT_GOLD }]}
          onPress={() => {
            setSelectedFlight(item);
            setNewDepartureDate(new Date(item.departureDate));
            setDatePickerVisible(true);
          }}
        >
          <Text style={styles.btnText}>Update Date</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: COLORS.ERROR }]}
          onPress={() => handleDeleteFlight(item.id)}
        >
          <Text style={styles.btnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const ProfileCard = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>My Profile Details</Text>
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor="#999"
        value={profile.fullName}
        onChangeText={text => setProfile({ ...profile, fullName: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone"
        placeholderTextColor="#999"
        value={profile.phone}
        onChangeText={text => setProfile({ ...profile, phone: text })}
      />
      <Text style={styles.profileInfoText}>Email: {profile.email}</Text>
      <Text style={styles.profileInfoText}>Points: {profile.points} ⭐</Text>
      <TouchableOpacity style={styles.updateBtn} onPress={handleUpdateProfile} disabled={updatingProfile}>
        <Text style={styles.updateBtnText}>{updatingProfile ? 'Updating...' : 'Update Profile'}</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading)
    return (
      <ActivityIndicator
        size="large"
        style={{ flex: 1, backgroundColor: COLORS.BACKGROUND_LIGHT }}
        color={COLORS.ACCENT_GOLD}
      />
    );

  return (
    <LinearGradient colors={[COLORS.BACKGROUND_LIGHT, COLORS.BACKGROUND_LIGHT]} style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <DashboardHeader />
      <View style={styles.mainWrapper}>
        <View style={styles.sidebar}>
          <View style={styles.profileContainer}>
            <View style={styles.profileImagePlaceholder} />
            <Text style={styles.profileName}>{user?.fullName || 'Carrier'}</Text>
            <Text style={styles.profileEmail}>{user?.email || '---'}</Text>
          </View>
          <SidebarLink text="DASHBOARD" isActive={activeMenu === 'DASHBOARD'} onPress={() => navigation.navigate('CarrierDashboard')} />
          <TouchableOpacity
            onPress={() => navigation.navigate('SupportChat', { userId: '68eb15ad2961325b5b181310' })}
            style={styles.helpButton}
          >
            <Text style={styles.helpButtonText}>HELP</Text>
          </TouchableOpacity>
          <SidebarLink text="SETTINGS" isActive={activeMenu === 'SETTINGS'} onPress={() => setActiveMenu('SETTINGS')} />
          <Text style={styles.sidebarPoints}>🏆 Points: {profile.points}</Text>
          <View style={{ flex: 1 }} />
          <View style={styles.activeUsersContainer}>
            <Text style={styles.activeUsersTitle}>ACTIVE USERS</Text>
            <View style={styles.activeUsersPlaceholder} />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.mainGridRow}>
            <View style={styles.leftColumn}>
              <ProfileCard />
            </View>
          </View>

          <Text style={styles.subtitle}>Manage Your Flights</Text>
          {flights.length === 0 ? (
            <Text style={{ color: '#888', marginTop: 10 }}>No flights posted yet.</Text>
          ) : (
            <FlatList
              data={flights}
              keyExtractor={item => item.id}
              renderItem={renderFlight}
              scrollEnabled={false}
              style={{ width: '100%', marginTop: cardSpacing }}
            />
          )}

          {datePickerVisible && (
            <DateTimePicker
              value={newDepartureDate}
              mode="datetime"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, date) => {
                setDatePickerVisible(false);
                if (date) {
                  setNewDepartureDate(date);
                  handleUpdateFlightDate();
                }
              }}
            />
          )}
        </ScrollView>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND_LIGHT },
  mainWrapper: { flexDirection: 'row', flex: 1 },
  sidebar: {
    width: 180,
    backgroundColor: COLORS.BACKGROUND_DARK,
    paddingTop: 50,
    paddingHorizontal: 15,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 40,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  profileImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: COLORS.ACCENT_GOLD,
  },
  sidebarPoints: {
    color: '#FFD700',
    fontSize: 12,
    marginTop: 5,
    fontWeight: 'bold',
  },
  profileName: {
    color: COLORS.TEXT_LIGHT,
    fontSize: 14,
    fontWeight: 'bold',
  },
  profileEmail: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
  },
  sidebarLink: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 8,
  },
  activeSidebarLink: {
    backgroundColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  sidebarText: {
    color: COLORS.TEXT_LIGHT,
    fontWeight: '600',
    fontSize: 13,
  },
  activeSidebarText: {
    color: COLORS.BACKGROUND_DARK,
    fontWeight: 'bold',
  },
  helpButton: {
    backgroundColor: "transparent",
    padding: 2,
    borderRadius: 8,
    marginTop: 10,
  },
  helpButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 13,
  },
  activeUsersContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  activeUsersTitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
    marginBottom: 5,
  },
  activeUsersPlaceholder: {
    width: '100%',
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
  },
  content: {
    flexGrow: 1,
    padding: contentPadding,
  },
  card: {
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
    width: '100%',
  },
  cardTitle: {
    color: COLORS.BACKGROUND_DARK,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  mainGridRow: {
    flexDirection: 'row',
    marginBottom: cardSpacing,
    width: '100%',
  },
  leftColumn: {
    flex: 1,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    color: COLORS.TEXT_DARK,
    width: '100%',
    borderWidth: 1,
    borderColor: '#eee',
  },
  profileInfoText: {
    color: COLORS.TEXT_DARK,
    fontSize: 14,
    marginBottom: 8,
  },
  updateBtn: {
    backgroundColor: COLORS.ACCENT_GOLD,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: COLORS.ACCENT_GOLD,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  updateBtnText: {
    color: COLORS.BACKGROUND_DARK,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.BACKGROUND_DARK,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  flightCard: {
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    width: '100%',
    borderLeftWidth: 5,
    borderLeftColor: COLORS.SUCCESS,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  flightRoute: {
    color: COLORS.BACKGROUND_DARK,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  flightDetailText: {
    color: '#888',
    fontSize: 12,
    marginBottom: 2,
  },
  flightActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  btn: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 10,
  },
  btnText: {
    color: COLORS.TEXT_LIGHT,
    fontWeight: 'bold',
    fontSize: 12,
  },
});
