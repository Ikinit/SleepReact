import { StyleSheet, ScrollView, RefreshControl, View, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useSleep } from '../../hooks/useSleep'
import { useUser } from '../../hooks/useUser'

import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'
import ThemedTextInput from '../../components/ThemedTextInput'
import ThemedButton from '../../components/ThemedButton'
import Spacer from '../../components/spacer'

const SleepHistory = () => {
  const [refreshing, setRefreshing] = useState(false)
  const { sleepData, fetchSleepData } = useSleep()
  const { user } = useUser()
  const { deleteSleepData, updateSleepData } = useSleep()

  useEffect(() => {
    if (user) {
      loadSleepHistory()
    }
  }, [user])
  // editing state for inline edit
  const [editingId, setEditingId] = useState(null)
  const [editingForm, setEditingForm] = useState({ bedTime:'', wakeTime:'', sleepDuration:'', sleepQuality:'' })

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

              {/* If this entry is being edited, show inputs */}
              {editingId === entry.$id ? (
                <View>
                  <ThemedTextInput value={editingForm.bedTime} onChangeText={t => setEditingForm(f => ({...f, bedTime: t}))} placeholder='Bed time' />
                  <ThemedTextInput value={editingForm.wakeTime} onChangeText={t => setEditingForm(f => ({...f, wakeTime: t}))} placeholder='Wake time' />
                  <ThemedTextInput value={String(editingForm.sleepDuration)} onChangeText={t => setEditingForm(f => ({...f, sleepDuration: t}))} placeholder='Duration (hours)' keyboardType='numeric' />
                  <ThemedTextInput value={String(editingForm.sleepQuality)} onChangeText={t => setEditingForm(f => ({...f, sleepQuality: t}))} placeholder='Quality (1-10)' keyboardType='numeric' />
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                    <ThemedButton onPress={async () => {
                      try{
                        const updates = {
                          bedTime: editingForm.bedTime,
                          wakeTime: editingForm.wakeTime,
                          sleepDuration: Number(editingForm.sleepDuration) || 0,
                          sleepQuality: Number(editingForm.sleepQuality) || 0
                        }
                        await updateSleepData(editingId, updates)
                        setEditingId(null)
                        setEditingForm({ bedTime:'', wakeTime:'', sleepDuration:'', sleepQuality:'' })
                        await loadSleepHistory()
                      }catch(err){
                        console.error('Update failed', err)
                        Alert.alert('Error', err?.message || 'Unable to update entry')
                      }
                    }}><ThemedText>Save</ThemedText></ThemedButton>
                    <ThemedButton onPress={() => { setEditingId(null); setEditingForm({ bedTime:'', wakeTime:'', sleepDuration:'', sleepQuality:'' }) }} style={{ marginLeft:8 }}><ThemedText>Cancel</ThemedText></ThemedButton>
                  </View>
                </View>
              ) : (
                <>
                  <ThemedView style={styles.entryRow}>
                    <ThemedText>Bedtime: {formatTime(entry.bedTime)}</ThemedText>
                    <ThemedText>Wake Time: {formatTime(entry.wakeTime)}</ThemedText>
                  </ThemedView>
                  <ThemedView style={styles.entryRow}>
                    <ThemedText>Duration: {entry.sleepDuration}h</ThemedText>
                    <ThemedText>Quality: {entry.sleepQuality}/10</ThemedText>
                  </ThemedView>

                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
                    <ThemedButton onPress={() => {
                      setEditingId(entry.$id)
                      setEditingForm({ bedTime: entry.bedTime || '', wakeTime: entry.wakeTime || '', sleepDuration: entry.sleepDuration || '', sleepQuality: entry.sleepQuality || '' })
                    }}><ThemedText>Edit</ThemedText></ThemedButton>
                    <ThemedButton onPress={() => {
                      Alert.alert('Confirm', 'Delete this sleep entry?', [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Delete', style: 'destructive', onPress: async () => {
                            try{
                              await deleteSleepData(entry.$id)
                              await loadSleepHistory()
                            }catch(err){
                              console.error('Delete failed', err)
                              Alert.alert('Error', err?.message || 'Unable to delete entry')
                            }
                        } }
                      ])
                    }} style={{ marginLeft: 8 }}><ThemedText>Delete</ThemedText></ThemedButton>
                  </View>
                </>
              )}
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
