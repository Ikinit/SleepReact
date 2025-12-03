import { View, useColorScheme } from 'react-native'
import { Colors } from '../constants/Colors'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '../contexts/ThemeContext'

const ThemedView = ( {style, safe=false, ...props} ) => {
    const colorSchemeNative = useColorScheme()
    const { scheme } = useTheme()
    const colorScheme = scheme === 'system' ? colorSchemeNative : scheme
    const theme = Colors[colorScheme] ?? Colors.light
    
    if (!safe) 
    return (
        <View 
            style={[{backgroundColor: theme.background}, style]}
            {...props}
        />
    )

    const insets = useSafeAreaInsets();

    return (
        <View 
            style={[{
                backgroundColor: theme.background,
                paddingTop: insets.top,
                paddingBottom: insets.bottom,
            }, 
                style
            ]}
            {...props}
        />
    )

}

export default ThemedView