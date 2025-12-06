import { Text, StyleSheet } from 'react-native'

import Spacer from "../components/spacer"
import ThemedText from "../components/ThemedText"
import ThemedView from "../components/ThemedView"
import ThemedButton from '../components/ThemedButton'
import { useUser } from '../hooks/useUser'
import { useTheme } from '../contexts/ThemeContext'
import { useRouter } from 'expo-router'

const Profile = () => {
  const { logout, user, authChecked } = useUser()
  const { scheme, toggleScheme, setScheme } = useTheme()
  const router = useRouter()

  if(!authChecked) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    )
  }

  return (
    <ThemedView style={styles.container}>

      <ThemedText title={true} style={styles.heading}>
        {user?.profile?.username || 'Not signed in'}
      </ThemedText>
      <Spacer />

      <ThemedText>Time to start logging sleep...</ThemedText>
      <Spacer />

      <ThemedText style={{ marginBottom: 8 }}>Theme: {scheme}</ThemedText>
      <ThemedButton onPress={() => toggleScheme()}>
        <Text style={{ color: '#f2f2f2'}}>{scheme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}</Text>
      </ThemedButton>

      <ThemedButton onPress={() => router.push('/about')}>
        <Text style={{ color: '#f2f2f2'}}>About</Text>
      </ThemedButton>

      <ThemedButton onPress={async () => {
        try{
          await logout()
          router.replace('/app_auth/login')
        }catch(err){
          console.warn('Logout failed:', err?.message || err)
        }
      }}>
        <Text style={{ color: '#f2f2f2'}}>Logout</Text>
      </ThemedButton>

    </ThemedView>
  )
}

export default Profile

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heading: {
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
  },
})
