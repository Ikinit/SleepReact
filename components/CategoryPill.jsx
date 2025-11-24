import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import ThemedText from './ThemedText';

export default function CategoryPill({ title, selected = false, onPress, style }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.pill, selected ? styles.selected : null, style]}>
      <ThemedText>{title}</ThemedText>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f2f2f2',
    marginRight: 8
  },
  selected: {
    backgroundColor: '#d0e7ff'
  }
})
