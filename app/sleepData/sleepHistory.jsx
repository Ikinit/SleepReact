import { StyleSheet, ScrollView, RefreshControl } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useSleep } from '../../hooks/useSleep'
import { useUser } from '../../hooks/useUser'

import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'
import Spacer from '../../components/spacer'

const SleepHistory = () => {
  const [refreshing, setRefreshing] = useState(false)
  const { sleepData, fetchSleepData } = useSleep()
  const { user } = useUser()

  useEffect(() => {
    if (user) {
      loadSleepHistory()
    }
  }, [user])

  const loadSleepHistory = async () => {
    try {
      await fetchSleepData()
    } catch (error) {
      console.error('Error loading sleep history:', error)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadSleepHistory()
    setRefreshing(false)
  }

  const formatTime = (timeString) => {
    return timeString || 'N/A'
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText title={true} style={styles.title}>
        Sleep History
      </ThemedText>
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {sleepData && sleepData.length > 0 ? (
          sleepData.map((entry, index) => (
            <ThemedView key={entry.$id || index} style={styles.entryCard}>
              <ThemedText style={styles.date}>{entry.date}</ThemedText>
              <ThemedView style={styles.entryRow}>
                <ThemedText>Bedtime: {formatTime(entry.bedTime)}</ThemedText>
                <ThemedText>Wake Time: {formatTime(entry.wakeTime)}</ThemedText>
              </ThemedView>
              <ThemedView style={styles.entryRow}>
                <ThemedText>Duration: {entry.sleepDuration}h</ThemedText>
                <ThemedText>Quality: {entry.sleepQuality}/10</ThemedText>
              </ThemedView>
              <Spacer height={10} />
            </ThemedView>
          ))
        ) : (
          <ThemedView style={styles.emptyState}>
            <ThemedText style={styles.emptyText}>
              No sleep entries yet. Start logging your sleep!
            </ThemedText>
          </ThemedView>
        )}
      </ScrollView>
    </ThemedView>
  )
}

export default SleepHistory

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
  scrollView: {
    flex: 1,
  },
  entryCard: {
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  date: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  entryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
})
