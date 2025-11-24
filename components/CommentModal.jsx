import React from 'react'
import { Modal, View, StyleSheet, TextInput } from 'react-native'
import ThemedText from './ThemedText'
import ThemedButton from './ThemedButton'

export default function CommentModal({ visible = false, onClose = () => {}, onSubmit = () => {}, initialText = '' }){
  const [text, setText] = React.useState(initialText)

  React.useEffect(() => {
    // Reset local text whenever initialText or visibility changes
    setText(initialText)
  }, [initialText, visible])

  return (
    <Modal visible={visible} animationType='slide' transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <ThemedText title style={{marginBottom:8}}>Add a comment</ThemedText>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder='Write your comment...'
            multiline
            numberOfLines={4}
            style={styles.input}
          />

          <View style={styles.actionsRow}>
            <ThemedButton title='Cancel' onPress={() => { setText(''); onClose() }} />
            <ThemedButton title='Submit' onPress={() => { onSubmit(text); setText('') }} />
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex:1, backgroundColor:'rgba(0,0,0,0.4)', justifyContent:'center', alignItems:'center' },
  container: { width:'90%', backgroundColor:'#fff', padding:16, borderRadius:8 },
  input: { minHeight:80, borderRadius:6, padding:8, backgroundColor:'#f7f7f7', marginBottom:12 },
  actionsRow: { flexDirection:'row', justifyContent:'space-between' }
})
