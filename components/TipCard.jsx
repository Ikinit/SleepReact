import React, { useState } from 'react'
import { View, StyleSheet, ActivityIndicator } from 'react-native'
import ThemedText from './ThemedText'
import ThemedButton from './ThemedButton'
import CategoryPill from './CategoryPill'
import RatingStars from './RatingStars'

export default function TipCard({ tip = {}, categoryTitle, onRate, onComment, onEdit, onDelete, onPublish, currentUserId, showOwnerActions = false, showRateComment = true, fetchComments, onEditComment, onDeleteComment, userRating = 0 }){
  const isOwner = currentUserId && (tip.userID === currentUserId || tip.userId === currentUserId || tip.authorId === currentUserId)
  const title = tip.title || ''
  const body = tip.body || tip.description || ''
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState([])
  const [loadingComments, setLoadingComments] = useState(false)

  return (
    <View style={styles.card}>
      <CategoryPill title={categoryTitle || tip.title} />
      <ThemedText title={true} style={styles.title}>{title}</ThemedText>
      {/* Display average rating and count when available */}
      {(tip.averageRating !== undefined) ? (
        <ThemedText style={{ fontSize:12, color:'#444', marginTop:4 }}>Avg: {Number(tip.averageRating).toFixed(2)} • {tip.ratingCount || 0} votes</ThemedText>
      ) : null}
      <ThemedText style={styles.body}>{body}</ThemedText>

      <View style={styles.actionsRow}>
        {showRateComment && (
              <>
                <RatingStars
                  value={userRating || (tip.averageRating ? Math.round(Number(tip.averageRating)) : 0)}
                  onChange={(n) => onRate && onRate(tip, n)}
                />
                <ThemedButton title='Comment' onPress={() => onComment && onComment(tip, 'Nice tip!')} />
              </>
        )}
        {isOwner && showOwnerActions && onPublish && (
          <ThemedButton title={tip.status === 'published' ? 'Unpublish' : 'Publish'} onPress={() => onPublish && onPublish(tip)} />
        )}
        {isOwner && showOwnerActions && onEdit && <ThemedButton title='Edit' onPress={() => onEdit && onEdit(tip)} />}
        {isOwner && showOwnerActions && onDelete && <ThemedButton title='Delete' onPress={() => onDelete && onDelete(tip)} />}
      </View>

      {/* Comments toggle & list - only render in browse*/}
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
                  const author = c.authorName || c.username || c.userID || c.userId || c.author || 'user'
                  const createdRaw = c.$createdAt || c.createdAt || c.created_at || null
                  let created = ''
                  try{ created = createdRaw ? new Date(createdRaw).toLocaleString() : '' }catch(_){ created = String(createdRaw) }
                  // Determine ownership by comparing the stored user id field
                  const isCommentOwner = currentUserId && ((c.userID && c.userID === currentUserId) || (c.userId && c.userId === currentUserId) || (c.authorId && c.authorId === currentUserId))
                  return (
                    <View key={c.$id} style={{ paddingVertical:6, borderTopWidth:1, borderTopColor:'#f0f0f0' }}>
                      <ThemedText style={{ fontSize:12, color:'#666' }}>{author}</ThemedText>
                      <ThemedText>{commentText}</ThemedText>
                      {created ? <ThemedText style={{ fontSize:11, color:'#999' }}>{created}</ThemedText> : null}
                      {isCommentOwner && (
                        <View style={{ flexDirection:'row', gap:8, marginTop:6 }}>
                          <ThemedButton title='Edit' onPress={() => onEditComment && onEditComment(c, tip)} />
                          <ThemedButton title='Delete' onPress={() => onDeleteComment && onDeleteComment(c, tip)} />
                        </View>
                      )}
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
