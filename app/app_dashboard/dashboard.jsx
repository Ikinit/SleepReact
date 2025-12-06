import { StyleSheet, Alert, Pressable } from 'react-native'
import React from 'react'
import { useUser } from '../../hooks/useUser'
import { useRouter } from 'expo-router'

import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'
import Spacer from '../../components/spacer'
import ThemedCard from '../../components/ThemedCard'

const Dashboard = () => {
  const { user, logout } = useUser()
  const router = useRouter()

  const navigateToSleepLog = () => {
    router.push('/app_dashboard/sleepLog')
  }

  const navigateToStatistics = () => {
    router.push('/app_dashboard/statistics')
  }

  const navigateToSleepHistory = () => {
    router.push('/app_dashboard/sleepData/sleepHistory')
  }

  const navigateToGoals = () => {
    router.push('/app_dashboard/goals')
  }

  const navigateToTips = () => {
    router.push('/app_dashboard/tips')
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.userInfo}>
        <ThemedText style={styles.welcomeText}>
          Hello, {user?.profile?.username}!
        </ThemedText>
        <ThemedText style={styles.emailText}>
          How did you sleep last night?
        </ThemedText>
      </ThemedView>

      <Spacer height={30} />

      <ThemedView style={styles.menuSection}>
        <ThemedText style={styles.sectionTitle}>Quick Actions</ThemedText>

        <ThemedView style={styles.menuGrid}>
          <Pressable onPress={navigateToSleepLog} style={({pressed})=>[styles.menuItem, pressed && styles.pressedItem]}>
            <ThemedCard style={styles.cardInner}>
              <ThemedText style={styles.icon}>📝</ThemedText>
              <ThemedText style={styles.menuLabel}>Log Sleep</ThemedText>
            </ThemedCard>
          </Pressable>

          <Pressable onPress={navigateToSleepHistory} style={({pressed})=>[styles.menuItem, pressed && styles.pressedItem]}>
            <ThemedCard style={styles.cardInner}>
              <ThemedText style={styles.icon}>📚</ThemedText>
              <ThemedText style={styles.menuLabel}>History</ThemedText>
            </ThemedCard>
          </Pressable>

          <Pressable onPress={navigateToStatistics} style={({pressed})=>[styles.menuItem, pressed && styles.pressedItem]}>
            <ThemedCard style={styles.cardInner}>
              <ThemedText style={styles.icon}>📊</ThemedText>
              <ThemedText style={styles.menuLabel}>Statistics</ThemedText>
            </ThemedCard>
          </Pressable>

          <Pressable onPress={navigateToGoals} style={({pressed})=>[styles.menuItem, pressed && styles.pressedItem]}>
            <ThemedCard style={styles.cardInner}>
              <ThemedText style={styles.icon}>🎯</ThemedText>
              <ThemedText style={styles.menuLabel}>Goals</ThemedText>
            </ThemedCard>
          </Pressable>

          <Pressable onPress={navigateToTips} style={({pressed})=>[styles.menuItem, pressed && styles.pressedItem]}>
            <ThemedCard style={styles.cardInner}>
              <ThemedText style={styles.icon}>💡</ThemedText>
              <ThemedText style={styles.menuLabel}>Sleep Tips</ThemedText>
            </ThemedCard>
          </Pressable>

        </ThemedView>
      </ThemedView>

      <Spacer height={30} />

     
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
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  pressedItem: {
    opacity: 0.85,
  },
  cardInner: {
    paddingVertical: 18,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    elevation: 2,
  },
  icon: {
    fontSize: 28,
    marginBottom: 8,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
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
