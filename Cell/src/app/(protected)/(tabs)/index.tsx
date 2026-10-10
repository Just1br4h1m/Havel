import React, {useCallback, useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { Link } from "expo-router";
import ProgressTraker from '../components/ProgressTraker';
import { BloodGroup } from '../../enums/BloodGroup';
import { Gender } from '../../enums/Gender';
import { HaemoglobinGenotype } from '../../enums/HaemoglobinGenotype';
import Counter from '../components/Counter';
import api from '../../utils/api';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';

const InfoRow = ({ label, value }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || 'N/A'}</Text>
    </View>
);

const HealthCard = ({ icon, iconColor, title, description, onPress }) => (
    <TouchableOpacity
        style={styles.healthCard}
        activeOpacity={0.8}
        onPress={onPress}
    >
      <View style={[styles.healthIcon, { backgroundColor: `${iconColor}15` }]}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>

      <View style={styles.healthCardContent}>
        <Text style={styles.healthCardTitle}>{title}</Text>
        <Text style={styles.healthCardDescription}>{description}</Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
);

const formatGenderLabel = (label: string): string => {
  return label.replace(/([a-z])([A-Z])/g, '$1 $2');
};

export default function Index() {
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    gender: 'NotSet',
    telephone: '',
    dateOfBirth: null,
  });
  
  const [medicalData, setMedicalData] = useState({
    patientNumber: '',
    hospitalNumber: '',
    bloodGroup: 'OPositive',
    genotype: 'Aa',
    isWheeled: false,
    isPregnant: false,
  })
  
  const GenderLabels: Record<Gender, string> = {
    [Gender.NotSet]: 'Not Set',
    [Gender.Male]: 'Male',
    [Gender.Female]: 'Female',
    [Gender.NonBinary]: 'Non Binary',
  }
  
  const BloodGroupLabels: Record<BloodGroup, string> = {
    [BloodGroup.OPositive]: 'O+',
    [BloodGroup.ONegative]: 'O-',
    [BloodGroup.APositive]: 'A+',
    [BloodGroup.ANegative]: 'A-',
    [BloodGroup.BPositive]: 'B+',
    [BloodGroup.BNegative]: 'B-',
    [BloodGroup.AbPositive]: 'AB+',
    [BloodGroup.AbNegative]: 'AB-',
  }
  
  const GenotypeLabels: Record<HaemoglobinGenotype, string> = {
    [HaemoglobinGenotype.Aa]: 'AA',
    [HaemoglobinGenotype.Ac]: 'AC',
    [HaemoglobinGenotype.Aa]: 'AA',
    [HaemoglobinGenotype.Ss]: 'SS'
  }
  
  const booleanLabels: Record<boolean, string> = {
    true: 'Yes',
    false: 'No',
  }
  
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const fetchUserData = useCallback(async() => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) {
        Alert.alert('Error', 'Session expired. Please log in again');
        router.push('/login');
        return;
      }

      const decoded: any = jwtDecode(token);
      const userId =
          decoded[
              'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
              ];

      // Perform requests using the decoded userId
      const [medicalRes, userRes] = await Promise.all([
        api.get('/user/retrieve-medical', {
          headers: {
            'Content-Type': 'application/json',
            userId: `${userId}`,
          },
        }),
        api.get('/user/retrieve-user', {
          headers: {
            'Content-Type': 'application/json',
            userId: `${userId}`,
          },
        }),
      ]);

      setUserData(userRes.data);
      setMedicalData(medicalRes.data);
    } catch (error) {
      console.error('Something went wrong', error);
      Alert.alert('Error', 'Sorry, something went wrong fetching your data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
      useCallback(() => {
        fetchUserData();
      }, [fetchUserData])
  );

  if (loading) {
    return (
        <View style={[styles.background, styles.center]}>
          <ActivityIndicator size="large" color="#0B1D5B" />
        </View>
    );
  }

  return (
      <View style={styles.background}>
        <SafeAreaView style={styles.container}>
          <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>Good morning</Text>
                <Text style={styles.title}>{userData.firstName || 'User'}</Text>
              </View>

              <TouchableOpacity
                  style={styles.avatar}
                  onPress={() => router.push('/profile')}
                  activeOpacity={0.8}
              >
                <Text style={styles.avatarText}>
                  {userData.firstName ? userData.firstName[0].toUpperCase() : 'U'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Crisis-Free Counter */}
            <View style={styles.counterContainer}>
              <Text style={styles.sectionTitle}>Crisis-Free Tracker</Text>
              <Counter />
            </View>

            
            {/* Personal Information */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Personal Information</Text>
                <TouchableOpacity
                    onPress={() => router.push('/edit-profile')}
                    activeOpacity={0.7}
                >
                  <Link style={styles.editButton} href='/edit-user'>Edit</Link>
                </TouchableOpacity>
              </View>

              <View style={styles.card}>
                <InfoRow label="Hospital Number" value={medicalData.hospitalNumber} />
                <InfoRow label="Patient Number" value={medicalData.patientNumber} />
                <InfoRow label="First Name" value={userData.firstName} />
                <InfoRow label="Last Name" value={userData.lastName} />
                <InfoRow label="Gender" value={GenderLabels[userData.gender]} />
                <InfoRow label="Date of Birth" value={userData.dateOfBirth} />
              </View>
            </View>

            {/* Medical Information */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Medical Information</Text>
                <TouchableOpacity
                    onPress={() => router.push('/medical-records')}
                    activeOpacity={0.7}
                >
                  <Link style={styles.viewButton} href='/edit-medical'>Edit</Link>
                </TouchableOpacity>
              </View>

              <View style={styles.card}>
                <InfoRow label="Blood Group" value={BloodGroupLabels[medicalData.bloodGroup]} />
                <InfoRow label="Genotype" value={[GenotypeLabels[medicalData.genotype]]} />
                <InfoRow label="Wheelchair" value={booleanLabels[medicalData.isWheeled]} />
                <InfoRow label="Pregnant" value={booleanLabels[medicalData.isPregnant]} />
              </View>
            </View>

            {/* Health Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Health Information</Text>
              <View style={styles.healthGrid}>
                <HealthCard
                    icon="medical-outline"
                    iconColor="#2563EB"
                    title="Medication"
                    description="View your medications"
                    onPress={() => router.push('/medications')}
                />
                <HealthCard
                    icon="warning-outline"
                    iconColor="#DC2626"
                    title="Allergies"
                    description="View known allergies"
                    onPress={() => router.push('/allergies')}
                />
              </View>
            </View>

            {/* Emergency */}
            <TouchableOpacity
                style={styles.emergencyCard}
                activeOpacity={0.85}
                onPress={() => router.push('/emergency')}
            >
              <View style={styles.emergencyIcon}>
                <Ionicons name="medical" size={24} color="#DC2626" />
              </View>

              <View style={styles.emergencyContent}>
                <Text style={styles.emergencyTitle}>Emergency Information</Text>
                <Text style={styles.emergencyDescription}>
                  Quickly access important medical information.
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color="#DC2626" />
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </View>
  );
}

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 40,
    gap: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 4,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#111827',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0B1D5B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  counterContainer: {
    marginTop: 2,
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  editButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0B1D5B',
  },
  viewButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0B1D5B',
  },
  card: {
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoRow: {
    minHeight: 42,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  healthGrid: {
    gap: 10,
  },
  healthCard: {
    minHeight: 78,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  healthIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  healthCardContent: {
    flex: 1,
  },
  healthCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 3,
  },
  healthCardDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  emergencyCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emergencyIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyContent: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#991B1B',
    marginBottom: 3,
  },
  emergencyDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: '#B91C1C',
  },
});