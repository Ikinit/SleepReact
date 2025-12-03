import { Tabs, useRouter } from "expo-router"
import { useColorScheme, Pressable } from "react-native"
import { Colors } from "../../constants/Colors"
import { Ionicons } from '@expo/vector-icons';
import React from 'react'
import UserOnly from "../../components/auth/UserOnly";
import GoalsProvider from "../../contexts/GoalsContext";
import TipsProvider from "../../contexts/TipsContext";

const DashboardLayout = () => {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    const router = useRouter()

    return (
    <UserOnly>
        <TipsProvider>
        <GoalsProvider>
        <Tabs
            screenOptions={{
                headerShown: false, 
                tabBarStyle: {
                    backgroundColor: theme.navBackground,
                    paddingTop: 10,
                    height: 90,
            },
            tabBarActiveTintColor: theme.iconColorFocused,
            tabBarInactiveTintColor: theme.iconColor,
            }}
        >
            <Tabs.Screen
                name="dashboard"
                options={({ navigation }) => ({
                    title: 'Menu',
                    headerShown: true,
                    headerStyle: { backgroundColor: theme.navBackground },
                    headerTitleStyle: { color: theme.text },
                    tabBarIcon: ({ focused}) => (
                        <Ionicons
                            size={30}
                            name={focused ? 'menu' : 'menu-outline'}
                            color={focused ? theme.iconColorFocused : theme.iconColor}
                        />
                    ),
                    headerRight: () => (
                        <Pressable style={{ paddingRight: 12 }} onPress={() => router.push('/profile')}>
                            <Ionicons name='person-outline' size={24} color={theme.iconColor} />
                        </Pressable>
                    )
                })}
            />

            <Tabs.Screen 
                name="sleepLog" 
                options={{title: 'Sleep Log', tabBarIcon: ({ focused}) => (
                    <Ionicons
                        size={30}
                        name={focused ? 'bed' : 'bed-outline'}
                        color={focused ? theme.iconColorFocused : theme.iconColor}
                    />
                )}}
            />
            <Tabs.Screen 
                name="statistics" 
                options={{title: 'Statistics', tabBarIcon: ({ focused}) => (
                    <Ionicons
                        size={30}
                        name={focused ? 'bar-chart' : 'bar-chart-outline'}
                        color={focused ? theme.iconColorFocused : theme.iconColor}
                    />
                )}}
            />

            <Tabs.Screen
                name="goals"
                options={{title: 'Goals', tabBarIcon: ({ focused}) => (
                    <Ionicons
                        size={30}
                        name={focused ? 'trophy' : 'trophy-outline'}
                        color={focused ? theme.iconColorFocused : theme.iconColor}
                    />
                )}}
            />

            <Tabs.Screen
                name="tips"
                options={{title: 'Tips', tabBarIcon: ({ focused}) => (
                    <Ionicons
                        size={30}
                        name={focused ? 'bulb' : 'bulb-outline'}
                        color={focused ? theme.iconColorFocused : theme.iconColor}
                    />
                )}}
            />
            
        </Tabs>
        </GoalsProvider>
    </TipsProvider>
    </UserOnly>
  )
}

export default DashboardLayout