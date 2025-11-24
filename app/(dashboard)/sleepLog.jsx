import { StyleSheet, Text, TouchableWithoutFeedback, Keyboard, TouchableOpacity, View } from 'react-native'
import { useSleep } from '../../hooks/useSleep'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'

import Spacer from "../../components/spacer"
import ThemedText from "../../components/ThemedText"
import ThemedView from "../../components/ThemedView"
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

  const { createSleepLog } = useSleep()
  const router = useRouter()

  const navigateToSleepHistory = () => {
    router.push('/sleepData/sleepHistory')
  }

  const handleSubmit = async () => {
    if (!bedTime.trim() || !wakeTime.trim() || !sleepDuration.trim() || !sleepQuality.trim() || !date.trim()) return
     
    // Validate numeric inputs before sending to backend
    const durationNum = parseInt(sleepDuration)
    const qualityNum = parseInt(sleepQuality)
    
    if (isNaN(durationNum) || isNaN(qualityNum)) {
      console.error('Sleep duration and quality must be valid numbers')
      return
    }
    
    if (qualityNum < 1 || qualityNum > 10) {
      console.error('Sleep quality must be between 1 and 10')
      return
    }

    setLoading(true)

    try {
      const sleepData = {
        bedTime,
        wakeTime,
        sleepDuration: durationNum,
        sleepQuality: qualityNum,
        date
      }

      await createSleepLog(sleepData)

      setBedTime("")
      setWakeTime("")
      setSleepDuration("")
      setSleepQuality("")
      setDate("")

      router.replace('/profile')
    } catch (error) {
      console.error('Error saving sleep log:', error)
    } finally {
      setLoading(false)
    }
  }

  
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ThemedView style={styles.container}>
        
        {}
        <SafeAreaView style={styles.header}>
          <ThemedText title={true} style={styles.heading}>
            Sleep Log
          </ThemedText>
          
          <TouchableOpacity onPress={navigateToSleepHistory} style={styles.historyButton}>
            <Ionicons name="hourglass-outline" size={24} color="#10549dff" />
          </TouchableOpacity>
        </SafeAreaView>

        <Spacer />

        <ThemedTextInput
          style={styles.input}
          placeholder="Bed Time (e.g., 10:30 PM)"
          value={bedTime}
          onChangeText={setBedTime}
        />
        <Spacer />

        <ThemedTextInput
          style={styles.input}
          placeholder="Wake Time (e.g., 6:30 AM)"
          value={wakeTime}
          onChangeText={setWakeTime}
        />
        <Spacer />

        <ThemedTextInput
          style={styles.input}
          placeholder="Sleep Duration (e.g., 8 hours)"
          value={sleepDuration}
          onChangeText={setSleepDuration}
        />
        <Spacer />
        
        <ThemedTextInput
          style={styles.input}
          placeholder="Sleep Quality (e.g., Good, Fair, Poor)"
          value={sleepQuality}
          onChangeText={setSleepQuality}
        />
        <Spacer />

        <ThemedTextInput
          style={styles.input}
          placeholder="Date (e.g., 2023-10-01)"
          value={date}
          onChangeText={setDate}
        />
        <Spacer/>
        
        <ThemedButton onPress={handleSubmit} disabled={loading}>
          <Text style={{ color: '#f2f2f2' }}>
            {loading ? "Logging..." : "Log Sleep"}
          </Text>
        </ThemedButton>

      </ThemedView>
    </TouchableWithoutFeedback>
  )
}

export default Log

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 10,
    position: 'absolute',
    top: 50,
    zIndex: 1,
  },
  heading: {
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
    flex: 1,
  },
  historyButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  input: {
    padding: 20,
    borderRadius: 6,
    alignSelf: "stretch",
    marginHorizontal: 40,
  },
  multiline: {
    padding: 20,
    borderRadius: 6,
    minHeight: 100,
    alignSelf: "stretch",
    marginHorizontal: 40,
  }
})