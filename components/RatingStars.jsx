import React from 'react'
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native'

export default function RatingStars({ value = 0, onChange = () => {}, size = 20, disabled = false }){
  const stars = [1,2,3,4,5]

  return (
    <View style={styles.row} accessibilityRole="radiogroup" accessible>
      {stars.map(s => {
        const filled = value >= s
        return (
          <TouchableOpacity
            key={s}
            onPress={() => { if(!disabled) onChange(s) }}
            disabled={disabled}
            accessibilityRole="radio"
            accessibilityState={{ selected: filled }}
            style={styles.touch}
          >
            <Text style={[styles.star, { fontSize: size, color: filled ? '#f5c518' : '#ccc' }]}>{filled ? '★' : '☆'}</Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  touch: { paddingHorizontal: 6, paddingVertical: 4 },
  star: { includeFontPadding: false }
})
