import { StyleSheet, Text, TouchableWithoutFeedback, Keyboard, TouchableOpacity, View, ScrollView, Platform } from 'react-native'
import { useSleep } from '../../hooks/useSleep'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../contexts/ThemeContext'
import DateTimePicker from '@react-native-community/datetimepicker'

import Spacer from "../../components/spacer"
import ThemedText from "../../components/ThemedText"
import ThemedView from "../../components/ThemedView"
import ThemedCard from "../../components/ThemedCard"
import ThemedTextInput from '../../components/ThemedTextInput'
import ThemedButton from '../../components/ThemedButton'
import { SafeAreaView } from 'react-native-safe-area-context'

const Log = () => {
  const [bedTime, setBedTime] = useState("")
  const [wakeTime, setWakeTime] = useState("")
  const [sleepDuration, setSleepDuration] = useState("")
  const [sleepQuality, setSleepQuality] = useState("")
  const [date, setDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showBedTimePicker, setShowBedTimePicker] = useState(false)
  const [showWakeTimePicker, setShowWakeTimePicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedBedTime, setSelectedBedTime] = useState(new Date())
  const [selectedWakeTime, setSelectedWakeTime] = useState(new Date())

  const { createSleepLog } = useSleep()
  const router = useRouter()
  const { scheme } = useTheme()
  const isDark = scheme === 'dark'

  const navigateToSleepHistory = () => {
    router.push('/sleepData/sleepHistory')
  }

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false)
    }
    if (selectedDate) {
      setSelectedDate(selectedDate)
      const formattedDate = selectedDate.toISOString().split('T')[0]
      setDate(formattedDate)
      if (errors.date) setErrors({...errors, date: null})
    }
  }

  const handleBedTimeChange = (event, selectedTime) => {
    if (Platform.OS === 'android') {
      setShowBedTimePicker(false)
    }
    if (selectedTime) {
      setSelectedBedTime(selectedTime)
      const hours = String(selectedTime.getHours()).padStart(2, '0')
      const minutes = String(selectedTime.getMinutes()).padStart(2, '0')
      const formattedTime = `${hours}:${minutes}`
      setBedTime(formattedTime)
      if (errors.bedTime) setErrors({...errors, bedTime: null})
    }
  }

  const handleWakeTimeChange = (event, selectedTime) => {
    if (Platform.OS === 'android') {
      setShowWakeTimePicker(false)
    }
    if (selectedTime) {
      setSelectedWakeTime(selectedTime)
      const hours = String(selectedTime.getHours()).padStart(2, '0')
      const minutes = String(selectedTime.getMinutes()).padStart(2, '0')
      const formattedTime = `${hours}:${minutes}`
      setWakeTime(formattedTime)
      if (errors.wakeTime) setErrors({...errors, wakeTime: null})
    }
  }

  const validateInputs = () => {
    const newErrors = {}
    
    if (!bedTime.trim()) newErrors.bedTime = "Bed time is required"
    if (!wakeTime.trim()) newErrors.wakeTime = "Wake time is required"
    if (!date.trim()) newErrors.date = "Date is required"
    
    if (sleepDuration.trim()) {
      const durationNum = parseFloat(sleepDuration)
      if (isNaN(durationNum) || durationNum <= 0 || durationNum > 24) {
        newErrors.sleepDuration = "Duration must be 0-24 hours"
      }
    } else {
      newErrors.sleepDuration = "Duration is required"
    }
    
    if (sleepQuality.trim()) {
      const qualityNum = parseInt(sleepQuality)
      if (isNaN(qualityNum) || qualityNum < 1 || qualityNum > 10) {
        newErrors.sleepQuality = "Quality must be 1-10"
      }
    } else {
      newErrors.sleepQuality = "Quality is required"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateInputs()) return

    setLoading(true)

    try {
      const sleepData = {
        bedTime,
        wakeTime,
        sleepDuration: parseFloat(sleepDuration),
        sleepQuality: parseInt(sleepQuality),
        date
      }

      await createSleepLog(sleepData)

      setBedTime("")
      setWakeTime("")
      setSleepDuration("")
      setSleepQuality("")
      setDate("")

      router.push('/sleepData/sleepHistory')
    } catch (error) {
      console.error('Error saving sleep log:', error)
    } finally {
      setLoading(false)
    }
  }

  
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ThemedView style={styles.container}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <SafeAreaView style={styles.header}>
            <ThemedText style={styles.heading}>
              📋 Log Your Sleep
            </ThemedText>
            
            <TouchableOpacity onPress={navigateToSleepHistory} style={styles.historyButton}>
              <Ionicons name="hourglass-outline" size={24} color="#10549dff" />
            </TouchableOpacity>
          </SafeAreaView>

          <Spacer />

          {/* Date Section */}
          <ThemedCard style={styles.card}>
            <ThemedText style={styles.cardTitle}>📅 Date</ThemedText>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#10549dff" />
              <ThemedText style={styles.dateButtonText}>
                {date || 'Select Date'}
              </ThemedText>
              <Ionicons name="chevron-down" size={20} color="#10549dff" />
            </TouchableOpacity>
            {errors.date && <ThemedText style={styles.error}>{errors.date}</ThemedText>}
          </ThemedCard>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
          {Platform.OS === 'ios' && showDatePicker && (
            <View style={styles.iosPickerButtons}>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <ThemedText style={styles.iosButton}>Done</ThemedText>
              </TouchableOpacity>
            </View>
          )}

          {/* Time Section */}
          <ThemedCard style={styles.card}>
            <ThemedText style={styles.cardTitle}>⏰ Sleep Times</ThemedText>
            
            <ThemedText style={styles.label}>Bed Time</ThemedText>
            <TouchableOpacity 
              style={styles.timeButton}
              onPress={() => setShowBedTimePicker(true)}
            >
              <Ionicons name="time-outline" size={20} color="#10549dff" />
              <ThemedText style={styles.timeButtonText}>
                {bedTime || 'Select Bed Time'}
              </ThemedText>
              <Ionicons name="chevron-down" size={20} color="#10549dff" />
            </TouchableOpacity>
            {errors.bedTime && <ThemedText style={styles.error}>{errors.bedTime}</ThemedText>}
            
            {showBedTimePicker && (
              <DateTimePicker
                value={selectedBedTime}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleBedTimeChange}
              />
            )}
            {Platform.OS === 'ios' && showBedTimePicker && (
              <View style={styles.iosPickerButtons}>
                <TouchableOpacity onPress={() => setShowBedTimePicker(false)}>
                  <ThemedText style={styles.iosButton}>Done</ThemedText>
                </TouchableOpacity>
              </View>
            )}
            
            <ThemedText style={styles.label}>Wake Time</ThemedText>
            <TouchableOpacity 
              style={styles.timeButton}
              onPress={() => setShowWakeTimePicker(true)}
            >
              <Ionicons name="time-outline" size={20} color="#10549dff" />
              <ThemedText style={styles.timeButtonText}>
                {wakeTime || 'Select Wake Time'}
              </ThemedText>
              <Ionicons name="chevron-down" size={20} color="#10549dff" />
            </TouchableOpacity>
            {errors.wakeTime && <ThemedText style={styles.error}>{errors.wakeTime}</ThemedText>}
            
            {showWakeTimePicker && (
              <DateTimePicker
                value={selectedWakeTime}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleWakeTimeChange}
              />
            )}
            {Platform.OS === 'ios' && showWakeTimePicker && (
              <View style={styles.iosPickerButtons}>
                <TouchableOpacity onPress={() => setShowWakeTimePicker(false)}>
                  <ThemedText style={styles.iosButton}>Done</ThemedText>
                </TouchableOpacity>
              </View>
            )}
          </ThemedCard>

          {/* Duration & Quality Section */}
          <ThemedCard style={styles.card}>
            <ThemedText style={styles.cardTitle}>💤 Sleep Metrics</ThemedText>
            
            <ThemedText style={styles.label}>Duration (hours)</ThemedText>
            <ThemedTextInput
              style={styles.input}
              placeholder="e.g., 8 (0-24)"
              value={sleepDuration}
              onChangeText={(text) => {
                setSleepDuration(text)
                if (errors.sleepDuration) setErrors({...errors, sleepDuration: null})
              }}
              keyboardType="decimal-pad"
            />
            {errors.sleepDuration && <ThemedText style={styles.error}>{errors.sleepDuration}</ThemedText>}
            
            <ThemedText style={styles.label}>Quality Rating (1-5)</ThemedText>
            <ThemedTextInput
              style={styles.input}
              placeholder="e.g., 9 (1-10)"
              value={sleepQuality}
              onChangeText={(text) => {
                setSleepQuality(text)
                if (errors.sleepQuality) setErrors({...errors, sleepQuality: null})
              }}
              keyboardType="number-pad"
            />
            {errors.sleepQuality && <ThemedText style={styles.error}>{errors.sleepQuality}</ThemedText>}
          </ThemedCard>

          {/* Submit Button */}
          <ThemedButton 
            onPress={handleSubmit} 
            disabled={loading}
            style={styles.submitButton}
          >
            <Text style={{ color: '#f2f2f2', fontWeight: '600', fontSize: 16 }}>
              {loading ? "Logging..." : "Save Sleep Log"}
            </Text>
          </ThemedButton>
          
          <Spacer />
        </ScrollView>
      </ThemedView>
    </TouchableWithoutFeedback>
  )
}

export default Log

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
    paddingTop: 70,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 12,
    paddingTop: 10,
    position: 'absolute',
    top: 0,
    zIndex: 10,
  },
  heading: {
    fontWeight: "bold",
    fontSize: 22,
    textAlign: "center",
    flex: 1,
  },
  historyButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  card: {
    marginBottom: 10,
  },
  cardTitle: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 8,
  },
  label: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    padding: 10,
    borderRadius: 8,
    alignSelf: "stretch",
  },
  error: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  submitButton: {
    padding: 14,
    marginHorizontal: 0,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10549dff',
    backgroundColor: 'rgba(16, 84, 157, 0.05)',
  },
  dateButtonText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10549dff',
    backgroundColor: 'rgba(16, 84, 157, 0.05)',
    marginBottom: 8,
  },
  timeButtonText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  iosPickerButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  iosButton: {
    color: '#10549dff',
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 12,
  },
})