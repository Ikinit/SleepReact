import { Text, useColorScheme } from 'react-native'
import { Colors } from '../constants/Colors'
import React from 'react'
import { useTheme } from '../contexts/ThemeContext'

const ThemedText = ({ style, title = false, ...props }) => {
    const colorSchemeNative = useColorScheme()
    const { scheme } = useTheme()
    const colorScheme = scheme === 'system' ? colorSchemeNative : scheme
    const theme = Colors[colorScheme] ?? Colors.light

    const textColor = title ? theme.title : theme.text

    return (
        <Text
            style={[{ color: textColor }, style]}
            {...props}
        />    
    )
}

export default ThemedText