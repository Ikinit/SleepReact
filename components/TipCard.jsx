import React, { useState } from 'react'
import { View, StyleSheet, ActivityIndicator } from 'react-native'
import ThemedText from './ThemedText'
import ThemedButton from './ThemedButton'
import CategoryPill from './CategoryPill'

export default function TipCard({ tip = {}, categoryTitle, onRate, onComment, onEdit, onDelete, onPublish, currentUserId, showOwnerActions = false, showRateComment = true, fetchComments }){
  const isOwner = currentUserId && (tip.userID === currentUserId || tip.userId === currentUserId || tip.authorId === currentUserId)
  const title = tip.title || ''
  const body = tip.body || tip.description || ''
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState([])
  const [loadingComments, setLoadingComments] = useState(false)

  return (
    <View style={styles.card}>
      <CategoryPill title={categoryTitle || tip.categoryId} />
      <ThemedText title={true} style={styles.title}>{title}</ThemedText>
      <ThemedText style={styles.body}>{body}</ThemedText>

      <View style={styles.actionsRow}>
        {showRateComment && (
          <>
            {/* Quick rate/comment actions - these call parent callbacks passed from screen */}
            <ThemedButton title='Rate' onPress={() => onRate && onRate(tip, 5)} />
            <ThemedButton title='Comment' onPress={() => onComment && onComment(tip, 'Nice tip!')} />
          </>
        )}
        {isOwner && showOwnerActions && onPublish && (
          <ThemedButton title={tip.status === 'published' ? 'Unpublish' : 'Publish'} onPress={() => onPublish && onPublish(tip)} />
        )}
        {isOwner && showOwnerActions && onEdit && <ThemedButton title='Edit' onPress={() => onEdit && onEdit(tip)} />}
        {isOwner && showOwnerActions && onDelete && <ThemedButton title='Delete' onPress={() => onDelete && onDelete(tip)} />}
      </View>

      {/* Comments toggle & list - only render in browse (controlled by showRateComment) */}
      {showRateComment && (
        <View style={{ marginTop: 8 }}>
          <ThemedButton
            title={`Comments (${tip.commentsCount || 0})`}
            onPress={async () => {
              const opening = !showComments
              setShowComments(opening)
              if(opening && fetchComments){
                setLoadingComments(true)
                try{
                  const docs = await fetchComments(tip.$id)
                  console.debug('TipCard: fetched comments', docs && docs.length)
                  setComments(docs || [])
                }catch(err){
                  console.error('Load comments failed', err)
                }finally{
                  setLoadingComments(false)
                }
              }
            }}
          />

          {loadingComments && <ActivityIndicator style={{marginTop:8}} />}

          {showComments && !loadingComments && (
            <View style={{marginTop:8}}>
              {comments.length === 0 ? (
                <ThemedText style={{color:'#666'}}>No comments yet</ThemedText>
              ) : (
                comments.map(c => {
                  const commentText = c.text || c.comment || c.body || c.message || ''
                  const author = c.userID || c.userId || c.author || 'user'
                  const createdRaw = c.$createdAt || c.createdAt || c.created_at || null
                  let created = ''
                  try{ created = createdRaw ? new Date(createdRaw).toLocaleString() : '' }catch(_){ created = String(createdRaw) }
                  return (
                    <View key={c.$id} style={{ paddingVertical:6, borderTopWidth:1, borderTopColor:'#f0f0f0' }}>
                      <ThemedText style={{ fontSize:12, color:'#666' }}>{author}</ThemedText>
                      <ThemedText>{commentText}</ThemedText>
                      {created ? <ThemedText style={{ fontSize:11, color:'#999' }}>{created}</ThemedText> : null}
                    </View>
                  )
                })
              )}
            </View>
          )}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: { padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#eee', backgroundColor: '#fff', marginBottom: 12 },
  title: { fontSize: 16, marginTop: 8 },
  body: { marginTop: 8, color: '#666' },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }
})
