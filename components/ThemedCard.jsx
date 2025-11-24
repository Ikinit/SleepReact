import { StyleSheet, View, useColorScheme } from 'react-native'
import { Colors } from '../constants/Colors'
import React from 'react'

const ThemedCard = ( {style, ...props} ) => {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light
    
    return (
        <View 
            style={[{backgroundColor: theme.uibackground,}, styles.card,  style]}
            {...props}
        />
    )
}

export default ThemedCard

const styles = StyleSheet.create({
    card: {
        borderRaduis: 5,
        padding: 20
    }
})