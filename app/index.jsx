import { StyleSheet, Text, View, Image } from 'react-native'
import { Link } from 'expo-router'
import Logo from '../assets/logo.png'
import ThemedView from '../components/ThemedView'
import Spacer from '../components/spacer'
import ThemedText from '../components/ThemedText'

const Home = () => {
  return (
    <ThemedView style={styles.container}>

      <ThemedText style={styles.title}>Welcome to the Sleep Tracker</ThemedText>

      <Spacer height={10} />
      <ThemedText>This is the main content area.</ThemedText>
      <Spacer />

      <Link href="/app_auth/login" style={styles.link}>
        <><ThemedText>Login Page</ThemedText></>
      </Link>

      <Link href="/app_auth/register" style={styles.link}>
        <><ThemedText>Register Page</ThemedText></>
      </Link>

    </ThemedView>
  )
}

export default Home

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 24,
    justifyContent: 'center',
  },
  img: {
    marginVertical: 20,
  },
  link: {
    marginVertical: 10,
    borderBottomWidth: 1,
  }
})