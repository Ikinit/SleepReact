import { StyleSheet, Alert } from 'react-native'
import React from 'react'
import { useUser } from '../../hooks/useUser'
import { useRouter } from 'expo-router'

import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'
import ThemedButton from '../../components/ThemedButton'
import Spacer from '../../components/spacer'

const Dashboard = () => {
  const { user, logout } = useUser()
  const router = useRouter()

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await logout()
              router.replace('/')
            } catch (error) {
              console.error('Error during logout:', error)
              Alert.alert("Error", "Failed to logout")
            }
          }
        }
      ]
    )
  }

  const navigateToSleepLog = () => {
    router.push('/sleepLog')
  }

  const navigateToStatistics = () => {
    router.push('/statistics')
  }

  const navigateToSleepHistory = () => {
    router.push('/sleepData/sleepHistory')
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText title={true} style={styles.title}>
        Menu
      </ThemedText>
      
      <ThemedView style={styles.userInfo}>
        <ThemedText style={styles.welcomeText}>
          Welcome back!
        </ThemedText>
        <ThemedText style={styles.emailText}>
          {user?.email}
        </ThemedText>
      </ThemedView>

      <Spacer height={30} />

      <ThemedView style={styles.menuSection}>
        <ThemedText style={styles.sectionTitle}>Quick Actions</ThemedText>
        
        <ThemedButton onPress={navigateToSleepLog} style={styles.menuButton}>
          <ThemedText style={styles.buttonText}>📝 Log Sleep</ThemedText>
        </ThemedButton>

        <ThemedButton onPress={navigateToSleepHistory} style={styles.menuButton}>
          <ThemedText style={styles.buttonText}>📚 View History</ThemedText>
        </ThemedButton>

        <ThemedButton onPress={navigateToStatistics} style={styles.menuButton}>
          <ThemedText style={styles.buttonText}>📊 Statistics</ThemedText>
        </ThemedButton>
      </ThemedView>

      <Spacer height={30} />

      <ThemedView style={styles.menuSection}>
        <ThemedText style={styles.sectionTitle}>Account</ThemedText>
        
        <ThemedButton onPress={handleLogout} style={[styles.menuButton, styles.logoutButton]}>
          <ThemedText style={[styles.buttonText, styles.logoutText]}>🚪 Logout</ThemedText>
        </ThemedButton>
      </ThemedView>
    </ThemedView>
  )
}

export default Dashboard

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  userInfo: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
  },
  emailText: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 5,
  },
  menuSection: {
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  menuButton: {
    marginVertical: 8,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  buttonText: {
    fontSize: 16,
    textAlign: 'center',
  },
  logoutButton: {
    borderColor: '#ff6b6b',
    backgroundColor: '#fff5f5',
  },
  logoutText: {
    color: '#ff6b6b',
  },
})
