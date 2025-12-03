import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import ThemedText from './ThemedText';
import { Colors } from '../constants/Colors';
import { useTheme } from '../contexts/ThemeContext'

function ThemedButton({ style, title, children, onPress, ...rest }) {
    const content = children ?? (title ? title : null);
    const { scheme } = useTheme()
    const bg = Colors.primary
    // If needed, a per-theme button color could be used here. Keep primary for now.
    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            style={({ pressed }) => [styles.btn, pressed && styles.pressed, style]}
            {...rest}
        >
            {content ? <ThemedText style={styles.text}>{content}</ThemedText> : null}
        </Pressable>
    );
}
const styles = StyleSheet.create({
    btn: {
        backgroundColor: Colors.primary,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 6,
        marginVertical: 10,
    },
    pressed: {
        opacity: 0.5,

    }
    ,
    text: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: '600'
    }
})

export default ThemedButton