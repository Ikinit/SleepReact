import { Keyboard, StyleSheet, Text, TouchableWithoutFeedback } from 'react-native'
import { Link } from 'expo-router'
import { Colors } from "../../constants/Colors"
import React, { useState } from 'react'

import ThemedText from '../../components/ThemedText'
import Spacer from '../../components/spacer'
import ThemedView from '../../components/ThemedView'
import ThemedButton from '../../components/ThemedButton'
import ThemedTextInput from '../../components/ThemedTextInput'
import { useUser } from '../../hooks/useUser'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [ error, setError ] = useState(null)

    const { login } = useUser()

    const handleSubmit = async () => {
        setError(null)

        try{
            await login(email, password)
        }catch(error){
            setError(error.message)
        }
    }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <ThemedView style={styles.container}>

        <Spacer />
        <ThemedText title={true} style={styles.title}>
            Login Page
        </ThemedText>

        <ThemedTextInput 
            style={{ width: '80%' , marginBottom: 20 }}
            placeholder="Email"
            keyboardType="email-address"
            onChangeText={setEmail}
            value={email}
        />
        <ThemedTextInput 
            style={{ width: '80%' , marginBottom: 20 }}
            placeholder="Password"
            secureTextEntry={true}
            onChangeText={setPassword}
            value={password}
        />

        <ThemedButton onPress={handleSubmit}>
            <Text style={{ color: '#f2f2f2'}}>Login</Text>
        </ThemedButton>

        <Spacer/>
        {error && <Text style={styles.error}>{error}</Text>}

        <Spacer height={100} />
        
        <Link href="/app_auth/register">
            <ThemedText style={{ textAlign: 'center'}}>
                Register instead
            </ThemedText>
        </Link>

    </ThemedView>
    </TouchableWithoutFeedback>
  )
}

export default Login

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        textAlign: 'center',
        fontSize: 24,
        marginBottom: 20
    },     
    text: {
        textAlign: 'center',
        justifyContent: 'center',
        fontSize: 18,
        marginBottom: 30
    },
    btn: {
        backgroundColor: Colors.primary,
        padding: 15,
        borderRadius: 5,
    },
    pressed: {
        opacity: 0.8,
    },
    error: {
        color: Colors.warning,
        padding: 10,
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        borderColor: Colors.warning,
        borderWidth: 1,
        borderRadius: 5,
        marginHorizontal: 10,
    }

})