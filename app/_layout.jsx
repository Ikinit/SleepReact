import { StyleSheet, Text, useColorScheme, View } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'
import { Colors } from "../constants/Colors"
import { StatusBar } from 'expo-status-bar'
import { UserProvider } from '../contexts/UserContext'
import { SleepProvider } from '../contexts/SleepContext'
import { ThemeProvider } from '../contexts/ThemeContext'

const RootLayout = () => {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    
    
    return (
        <ThemeProvider>
        <UserProvider>
            <SleepProvider>
            <StatusBar value="auto"/>
            <Stack screenOptions={{
                headerStyle: { backgroundColor: theme.navBackground },
                headerTintColor: theme.title,
            }}>
                <Stack.Screen name="(auth)" options={{ headerShown: false }}/>
                <Stack.Screen name="(dashboard)" options={{ headerShown: false }}/>

            </Stack>
            </SleepProvider>
        </UserProvider>
        </ThemeProvider>
    )
}

export default RootLayout

const styles = StyleSheet.create({})