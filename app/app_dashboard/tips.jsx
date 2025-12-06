import React, { useContext, useEffect, useState } from 'react'
import { View, FlatList, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'
import ThemedButton from '../../components/ThemedButton'
import Spacer from '../../components/spacer'
import { TipsContext } from '../../contexts/TipsContext'
import TipCard from '../../components/TipCard'
import CategoryPill from '../../components/CategoryPill'
import { useUser } from '../../hooks/useUser'
import CommentModal from '../../components/CommentModal'

export default function TipsScreen(){
  const { fetchCategories, fetchTips, searchTips, createTip, updateTip, deleteTip, publishTip, rateTip, commentTip, updateComment, deleteComment, browseRankings, createCategory, updateCategory, deleteCategory, fetchComments, fetchUserRatings, removeRating } = useContext(TipsContext)
  const { user } = useUser()

  const [categories, setCategories] = useState([])
  const [tips, setTips] = useState([])
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState('browse')
  const [topTimeRange, setTopTimeRange] = useState('week')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [loading, setLoading] = useState(false)
  const [catTitle, setCatTitle] = useState('')
  const [catDescription, setCatDescription] = useState('')
  const [editingCategory, setEditingCategory] = useState(null)
  const [editingTip, setEditingTip] = useState(null)
  const [tipTitle, setTipTitle] = useState('')
  const [tipBody, setTipBody] = useState('')
  const [tipCategoryId, setTipCategoryId] = useState(null)
  const [tipPublished, setTipPublished] = useState(false)
  const [commentModalVisible, setCommentModalVisible] = useState(false)
  const [commentTarget, setCommentTarget] = useState(null)
  const [commentText, setCommentText] = useState('')
  const [commentEditing, setCommentEditing] = useState(null)
  const [userRatings, setUserRatings] = useState({})

  useEffect(() => {
    load()
  }, [activeTab, selectedCategory])

  async function load(){
    setLoading(true)
    try{
      const cats = await fetchCategories()
      setCategories(cats || [])

      if(activeTab === 'browse'){
        const t = selectedCategory
          ? await searchTips({ text: query, categoryId: selectedCategory.$id, onlyPublished: true })
          : await fetchTips({ limit: 50, onlyPublished: true })
          setTips(t || [])
          // fetch current user's ratings for visible tips
          try{
            const tipIds = (t || []).map(x => x.$id).filter(Boolean)
            if(tipIds.length && fetchUserRatings){
              const ratingsMap = await fetchUserRatings(tipIds)
              setUserRatings(ratingsMap || {})
            }else{
              setUserRatings({})
            }
          }catch(err){ console.warn('Failed fetching user ratings', err); setUserRatings({}) }
      }else if(activeTab === 'mytips'){
            let all = await fetchTips({ limit: 200, onlyPublished: false })
      if(user && all){
        all = all.filter(x => x.userID === user.$id || x.userId === user.$id || x.authorId === user.$id)
      }else{
            all = []
      }

        setTips(all)

      }else if(activeTab === 'categories'){
            setTips([]) // hide tips list
            setEditingTip(null)
      }else if(activeTab === 'top'){
        const ranked = await browseRankings({ timeRange: topTimeRange, limit: 50, top: true })
        // browseRankings now returns annotated tip object
        setTips(ranked || [])
            // also fetch user ratings for top list
            try{
              const tipIds = (ranked || []).map(x => x.$id).filter(Boolean)
              if(tipIds.length && fetchUserRatings){
                const ratingsMap = await fetchUserRatings(tipIds)
                setUserRatings(ratingsMap || {})
              }
            }catch(err){ console.warn('Failed fetching user ratings for top list', err); }
      }
    }catch(err){
      console.error('Tips load error', err)
    }finally{
      setLoading(false)
    }
  }

  // Load top-ranked tips for a specific time range directly
  async function loadTop(range){
    setLoading(true)
    try{
      console.debug('Loading top tips for range', range)
      const ranked = await browseRankings({ timeRange: range, limit: 50, top: true })
      setTips(ranked || [])
      try{
        const tipIds = (ranked || []).map(x => x.$id).filter(Boolean)
        if(tipIds.length && fetchUserRatings){
          const ratingsMap = await fetchUserRatings(tipIds)
          setUserRatings(ratingsMap || {})
        }else{
          setUserRatings({})
        }
      }catch(err){ console.warn('Failed fetching user ratings for top list', err); }
    }catch(err){
      console.error('loadTop failed', err)
    }finally{
      setLoading(false)
    }
  }

  async function onSearch(){
    if(activeTab === 'browse' || activeTab === 'top'){
      const res = await searchTips({ text: query, categoryId: selectedCategory ? selectedCategory.$id : undefined, onlyPublished: activeTab==='browse' })
      setTips(res)
    } else if(activeTab === 'mytips'){
      const res = await searchTips({ text: query, onlyPublished:false })
      if(user) setTips((res || []).filter(x => x.userId === user.$id || x.authorId === user.$id))
      else setTips([])
    }
  }

  async function startCreateTip(){
    setEditingTip(null)
    setTipTitle('')
    setTipBody('')
    setTipCategoryId(null)
    setTipPublished(false)
  }

  async function startEditTip(t){
    setEditingTip(t)
    setTipTitle(t.title || '')
    setTipBody(t.body || t.description || '')
    setTipCategoryId(t.categoryId || t.categoryID || null)
    setTipPublished((t.status||'') === 'published')
  }

  async function saveTip(){
    if(!tipTitle.trim()) return Alert.alert('Validation','Title is required')
    const payload = {
      title: tipTitle.trim(),
      body: tipBody,
      categoryId: tipCategoryId,
      status: tipPublished ? 'published' : 'draft'
    }
    try{
      if(editingTip){
        await updateTip(editingTip.$id, payload)
      }else{
        await createTip(payload)
      }
      await load()
      setEditingTip(null)
      setTipTitle('')
      setTipBody('')
      setTipCategoryId(null)
      setTipPublished(false)
    }catch(err){
      console.error('Tip save error', err)
      Alert.alert('Error', err?.message || 'Unable to save tip')
    }
  }

  async function removeTip(t){
    Alert.alert('Confirm', `Delete tip "${t.title}"?`, [
      { text: 'Cancel', style:'cancel' },
      { text: 'Delete', style:'destructive', onPress: async () => {
        try{
          await deleteTip(t.$id)
          await load()
        }catch(err){
          console.error('Delete tip failed', err)
          Alert.alert('Error', err?.message || 'Unable to delete tip')
        }
      }}
    ])
  }

  function openCommentModal(t, comment = null){
    setCommentTarget(t)
    setCommentEditing(comment)
    setCommentText(comment && (comment.text || comment.comment || '') || '')
    setCommentModalVisible(true)
  }

  async function submitComment(){
    if(!commentTarget) return
    if(!commentText || !commentText.trim()) return Alert.alert('Validation','Please enter a comment')
    try{
      if(commentEditing){
        // editing an existing comment
        await updateComment(commentEditing.$id, commentText.trim())
      }else{
        await commentTip(commentTarget.$id, commentText.trim())
      }
      setCommentModalVisible(false)
      setCommentTarget(null)
      setCommentEditing(null)
      setCommentText('')
      await load()
    }catch(err){
      console.error('Comment failed', err)
      Alert.alert('Error', err?.message || 'Unable to post comment')
    }
  }

  function handleTabPress(tab){
    setActiveTab(tab)
  }

  return (
    <ThemedView style={{ flex:1, padding:12 }}>
      <Spacer />

      {/* Search bar */}
      <View style={{flexDirection:'row', alignItems:'center'}}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder='Search tips...'
          style={{ flex:1, padding:8, borderRadius:10, backgroundColor:'#f2f2f2' }}
        />
        <ThemedButton title='Search' onPress={onSearch} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity onPress={() => handleTabPress('browse')} style={[styles.tab, activeTab==='browse' && styles.tabActive]}>
          <ThemedText>Browse</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleTabPress('mytips')} style={[styles.tab, activeTab==='mytips' && styles.tabActive]}>
          <ThemedText>My Tips</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleTabPress('categories')} style={[styles.tab, activeTab==='categories' && styles.tabActive]}>
          <ThemedText>Categories</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleTabPress('top')} style={[styles.tab, activeTab==='top' && styles.tabActive]}>
          <ThemedText>Top Rated</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Top time-range selector */}
      {activeTab === 'top' && (
        <View style={{ flexDirection:'row', gap:8, marginTop:8 }}>
          {['week','month','all'].map(r => (
            <TouchableOpacity key={r} onPress={async () => { setTopTimeRange(r); await loadTop(r) }} style={[styles.tab, topTimeRange===r && styles.tabActive]}>
              <ThemedText>{r === 'all' ? 'All Time' : r.charAt(0).toUpperCase() + r.slice(1)}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Category pills*/}
      {(activeTab === 'browse' || activeTab === 'top') && (
        <View style={{marginTop:12, flexDirection:'row', paddingBottom:8}}>
          <CategoryPill title='All' selected={!selectedCategory} onPress={()=>setSelectedCategory(null)} />
          {categories.map(c => (
            <CategoryPill
              key={c.$id}
              title={c.title}
              selected={selectedCategory && selectedCategory.$id === c.$id}
              onPress={() => setSelectedCategory(c)}
            />
          ))}
        </View>
      )}

      {/* Tip create/edit form */}
          {(activeTab === 'mytips') && (
        <View style={{padding:12, marginTop:12, borderRadius:8, borderWidth:1, borderColor:'#eee'}}>
          <ThemedText title style={{marginBottom:8}}>{editingTip ? 'Edit Tip' : 'New Tip'}</ThemedText>
          <TextInput value={tipTitle} onChangeText={setTipTitle} placeholder='Title' style={{padding:8, marginBottom:8, backgroundColor:'#fff', borderRadius:6}} />
          <TextInput value={tipBody} onChangeText={setTipBody} placeholder='Body' multiline numberOfLines={4} style={{padding:8, marginBottom:8, backgroundColor:'#fff', borderRadius:6, minHeight:80}} />
          <View style={{flexDirection:'row', alignItems:'center', gap:8}}>
            <TextInput value={tipCategoryId ? categories.find(c=>c.$id===tipCategoryId)?.title : ''} placeholder='Category (tap to select below)' editable={false} style={{flex:1, padding:8, backgroundColor:'#fff', borderRadius:6}} />
            <ThemedButton title={editingTip ? 'Save' : 'Add'} onPress={saveTip} />
            {editingTip && <ThemedButton title='Delete' onPress={() => removeTip(editingTip)} />}
            {/* Publish / Unpublish (immediate action when editing an existing tip) */}
            {editingTip ? (
              <ThemedButton title={tipPublished ? 'Unpublish' : 'Publish'} onPress={async () => {
                try{
                  await publishTip(editingTip.$id, !tipPublished)
                  await load()
                  setTipPublished(prev => !prev)
                }catch(err){
                  console.error('Publish action failed', err)
                  Alert.alert('Error', err?.message || 'Unable to change publish state')
                }
              }} />
            ) : (
              <ThemedButton title={tipPublished ? 'Will Publish' : 'Draft'} onPress={() => setTipPublished(p => !p)} />
            )}
          </View>
          <View style={{marginTop:8, flexDirection:'row', gap:8}}>
            <ThemedText style={{alignSelf:'center'}}>Category:</ThemedText>
            <FlatList horizontal data={categories} keyExtractor={c=>c.$id} renderItem={({item})=> (
              <CategoryPill title={item.title} selected={tipCategoryId===item.$id} onPress={()=>setTipCategoryId(item.$id)} />
            )} />
          </View>
        </View>
      )}

      {/* Categories page */}
      {activeTab === 'categories' && (
        <View>
          {/* Create / Edit form */}
          <View style={{padding:12, borderRadius:8, borderWidth:1, borderColor:'#eee', marginBottom:12}}>
            <ThemedText style={{marginBottom:8}} title>{editingCategory ? 'Edit Category' : 'New Category'}</ThemedText>
            <TextInput
              value={catTitle}
              onChangeText={setCatTitle}
              placeholder='Title'
              style={{ padding:8, borderRadius:8, backgroundColor:'#fff', marginBottom:8 }}
            />
            <TextInput
              value={catDescription}
              onChangeText={setCatDescription}
              placeholder='Description'
              style={{ padding:8, borderRadius:8, backgroundColor:'#fff', marginBottom:8 }}
            />
            <View style={{flexDirection:'row', gap:8}}>
              <ThemedButton
                title={editingCategory ? 'Save' : 'Add'}
                onPress={async () => {
                  if(!catTitle.trim()) return Alert.alert('Validation', 'Category title is required')
                  try{
                    if(editingCategory){
                      await updateCategory(editingCategory.$id, { title: catTitle.trim(), description: catDescription })
                      setEditingCategory(null)
                    }else{
                      await createCategory({ title: catTitle.trim(), description: catDescription })
                    }
                    setCatTitle('')
                    setCatDescription('')
                    await load()
                  }catch(err){
                    console.error('Category save error', err)
                    Alert.alert('Error', err?.message || 'Unable to save category')
                  }
                }}
              />
              {editingCategory && (
                <ThemedButton title='Cancel' onPress={() => { setEditingCategory(null); setCatTitle(''); setCatDescription('') }} />
              )}
            </View>
          </View>

          <FlatList
            data={categories}
            keyExtractor={c => c.$id}
            renderItem={({item}) => {
              const isOwner = user && (item.userID === user.$id || item.userId === user.$id || item.owner === user.$id)
              return (
                <View style={{padding:12, borderRadius:8, borderWidth:1, borderColor:'#eee', marginBottom:8, flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                  <View style={{flex:1, paddingRight:8}}>
                    <ThemedText title>{item.title}</ThemedText>
                    <ThemedText>{item.description}</ThemedText>
                    {!isOwner && <ThemedText style={{fontSize:12, color:'#666'}}>Created by {item.authorName || item.username || item.userID || item.userId || 'someone'}</ThemedText>}
                  </View>
                  {isOwner ? (
                    <View style={{flexDirection:'row', gap:8}}>
                      <ThemedButton title='Edit' onPress={() => { setEditingCategory(item); setCatTitle(item.title || ''); setCatDescription(item.description || '') }} />
                      <ThemedButton title='Delete' onPress={() => {
                        Alert.alert('Confirm', `Delete category "${item.title}"?`, [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Delete', style: 'destructive', onPress: async () => {
                            try{
                              await deleteCategory(item.$id)
                              await load()
                            }catch(err){
                              console.error('Delete category failed', err)
                              Alert.alert('Error', err?.message || 'Unable to delete category')
                            }
                          }}
                        ])
                      }} />
                    </View>
                  ) : null}
                </View>
              )
            }}
          />
        </View>
      )}

      {/* Tips list (browse, mytips, top) */}
      {(activeTab === 'browse' || activeTab === 'mytips' || activeTab === 'top') && (
        <FlatList
          data={tips}
          keyExtractor={i => i.$id}
          renderItem={({item}) => (
            <TipCard
              tip={item}
              currentUserId={user ? user.$id : null}
              categoryTitle={categories.find(c => c.$id === item.categoryId)?.title}
              showRateComment={activeTab === 'browse'}
              fetchComments={fetchComments}
              userRating={userRatings[item.$id] ? userRatings[item.$id].rating : undefined}
              onRate={async (tip, n) => {
                //if user taps same value again, remove rating (toggle off)
                try{
                  const current = userRatings[tip.$id]?.rating
                  if(current === n){
                    // remove
                    setUserRatings(prev => { const copy = { ...prev }; delete copy[tip.$id]; return copy })
                    if(removeRating){
                      await removeRating(tip.$id)
                    }else{
                      // call rateTip with null to indicate removal if supported
                      await rateTip(tip.$id, null)
                    }
                  }else{
                    // set
                    setUserRatings(prev => ({ ...prev, [tip.$id]: { $id: prev[tip.$id]?.$id, rating: n } }))
                    await rateTip(tip.$id, n)
                  }
                }catch(err){
                  console.error('Rate action failed', err)
                  // revert by reloading tips and ratings
                  await load()
                  Alert.alert('Error', err?.message || 'Unable to update rating')
                }
              }}
              onComment={(tip, text) => { openCommentModal(tip) }}
              onEditComment={(comment, tip) => { openCommentModal(tip, comment) }}
              onDeleteComment={(comment, tip) => {
                Alert.alert('Confirm', 'Delete this comment?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: async () => {
                      try{
                        await deleteComment(comment.$id)
                        await load()
                      }catch(err){
                        console.error('Delete comment failed', err)
                        Alert.alert('Error', err?.message || 'Unable to delete comment')
                      }
                  } }
                ])
              }}
              onEdit={(t) => startEditTip(t)}
              onDelete={(t) => removeTip(t)}
              onPublish={async (t) => {
                try{
                  const shouldPublish = (t.status || '') !== 'published'
                  await publishTip(t.$id, shouldPublish)
                  await load()
                }catch(err){
                  console.error('Publish from card failed', err)
                  Alert.alert('Error', err?.message || 'Unable to change publish state')
                }
              }}
              showOwnerActions={activeTab === 'mytips'}
            />
          )}
          ListEmptyComponent={!loading ? <ThemedText style={{padding:16}}>No tips found</ThemedText> : null}
        />
      )}

        <CommentModal visible={commentModalVisible} onClose={() => setCommentModalVisible(false)} initialText={commentText} onSubmit={(text) => { setCommentText(text); submitComment() }} />

    </ThemedView>
  )
}

const styles = StyleSheet.create({
  tabsRow: { flexDirection:'row', marginTop:12, gap:8 },
  tab: { paddingVertical:8, paddingHorizontal:12 },
  tabActive: { borderBottomWidth:2, borderBottomColor:'#000' }
})