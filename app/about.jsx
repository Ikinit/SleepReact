import { ScrollView, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import ThemedView from '../components/ThemedView'
import ThemedText from '../components/ThemedText'
import ThemedButton from '../components/ThemedButton'
import { Text } from 'react-native'
import Spacer from '../components/spacer'

const About = () => {
  const router = useRouter()

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText title={true} style={styles.heading}>
          About the Sleep Tracker App
        </ThemedText>
        <Spacer />

        <ThemedText style={styles.sectionTitle}>What is Sleep Tracker?</ThemedText>
        <ThemedText style={styles.description}>
          Sleep Tracker is a comprehensive sleep monitoring and analysis application designed to help you understand and improve your sleep patterns. Track your sleep habits, set goals, and receive personalized tips to optimize your rest.
        </ThemedText>
        <Spacer />

        <ThemedText style={styles.sectionTitle}>Key Features</ThemedText>
        
        <ThemedText style={styles.featureTitle}>📊 Sleep Logging</ThemedText>
        <ThemedText style={styles.description}>
          Record your sleep sessions with precise start and end times. Track sleep duration and rate the quality of your sleep on a scale of 1-10.
        </ThemedText>

        <ThemedText style={styles.featureTitle}>🎯 Goal Setting</ThemedText>
        <ThemedText style={styles.description}>
          Set personalized sleep goals including target duration, consistent bedtime schedules, and quality targets. Monitor your progress toward achieving better sleep habits.
        </ThemedText>

        <ThemedText style={styles.featureTitle}>💡 Sleep Tips</ThemedText>
        <ThemedText style={styles.description}>
          Access sleep tips from other users across multiple categories.
        </ThemedText>

        <ThemedText style={styles.featureTitle}>📈 Sleep Statistics</ThemedText>
        <ThemedText style={styles.description}>
            This feature is coming soon!
        </ThemedText>
        <Spacer />

        <ThemedText style={styles.sectionTitle}>How It Works</ThemedText>
        
        <ThemedText style={styles.stepTitle}>1. Create an Account</ThemedText>
        <ThemedText style={styles.description}>
          Sign up with your email to create a personalized sleep tracking account. Your data is securely stored and only accessible to you.
        </ThemedText>

        <ThemedText style={styles.stepTitle}>2. Log Your Sleep</ThemedText>
        <ThemedText style={styles.description}>
          Record each night's sleep by entering when you went to bed and woke up. Add a quality rating about your sleep experience.
        </ThemedText>

        <ThemedText style={styles.stepTitle}>3. Set Goals</ThemedText>
        <ThemedText style={styles.description}>
          Define sleep goals that work for your lifestyle. Whether you want 8 hours per night or consistent sleep schedules, set realistic targets to work towards.
        </ThemedText>

        <ThemedText style={styles.stepTitle}>4. Learn and Improve</ThemedText>
        <ThemedText style={styles.description}>
          Browse sleep tips from other users across multiple categories. Rate and comment on tips to help personalize your experience.
        </ThemedText>
        <Spacer />

        <ThemedText style={styles.sectionTitle}>Technology Stack</ThemedText>
        <ThemedText style={styles.description}>
          Sleep Tracker is built with React Native and Expo, providing a seamless experience across Android devices(IOS is not supported yet). Your data is securely managed through Appwrite's robust backend infrastructure.
        </ThemedText>
        <Spacer />

        <ThemedText style={styles.sectionTitle}>Your Privacy</ThemedText>
        <ThemedText style={styles.description}>
          We take your privacy seriously. Your sleep data is encrypted and securely stored. You maintain complete control over your information and can export or delete your data at any time through your profile settings.
        </ThemedText>
        <Spacer />

        <ThemedButton onPress={() => router.back()}>
          <Text style={{ color: '#f2f2f2' }}>Back to Profile</Text>
        </ThemedButton>
        <Spacer />
      </ScrollView>
    </ThemedView>
  )
}

export default About

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 8,
  },
})
