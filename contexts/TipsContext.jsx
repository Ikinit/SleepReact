import React, { createContext, useState } from 'react'
import { databases, account } from '../lib/appwrite'
import { ID, Permission, Role, Query } from 'react-native-appwrite'
import { useUser } from '../hooks/useUser'

const DATABASE_ID = '68ced0fb00362096eee7'
const COLLECTION_CATEGORIES = 'tip_category'
const COLLECTION_TIPS = 'sleep_tips'
const COLLECTION_TIP_RATINGS = 'ratings'
const COLLECTION_TIP_COMMENTS = 'comments'

export const TipsContext = createContext()

export function TipsProvider({ children }){
	const [categories, setCategories] = useState([])
	const [tips, setTips] = useState([])
	const { user } = useUser()

	async function _logAuthState(context){
		try{
			const s = await account.get()
			console.warn(`Auth state (${context}):`, s && s.$id ? { userId: s.$id } : 'no session')
			return s
		}catch(e){
			console.warn(`Auth state (${context}) failed:`, e?.message || e)
			return null
		}
	}

	// ------------------ Category functions ------------------
	// Fetch categories ordered by creation time (desc)
	async function fetchCategories({ limit = 100 } = {}){
		try{
			const queries = [ Query.limit(limit), Query.orderDesc('$createdAt') ]
			const res = await databases.listDocuments(DATABASE_ID, COLLECTION_CATEGORIES, queries)
			setCategories(res.documents || [])
			return res.documents || []
		}catch(error){
			if(error?.code === 401 || error?.code === 403 || /not authorized|unauthorized/i.test(error?.message || '')){
				console.error('fetchCategories unauthorized:', error?.message || error)
				await _logAuthState('fetchCategories')
				return []
			}
			console.error('fetchCategories error:', error)
			throw error
		}
	}
	// Create category; require auth
	async function createCategory({ title, description = '' } = {}){
		if(!user) throw new Error('Authentication required to create a category')
		const payload = { title, description, userID: user.$id }

		try{
			const doc = await databases.createDocument(
				DATABASE_ID,
				COLLECTION_CATEGORIES,
				ID.unique(),
				payload,
				user ? [
					Permission.read(Role.any()), //pubic read
					Permission.update(Role.user(user.$id)), //owner update
					Permission.delete(Role.user(user.$id)) // owner delete
				] : [ Permission.read(Role.any()) ]
			)

			setCategories(prev => [doc, ...prev])
			return doc
		}catch(error){
			console.error('createCategory error:', error)
			throw error
		}
	}

	async function updateCategory(id, updates){
		try{
			const updated = await databases.updateDocument(DATABASE_ID, COLLECTION_CATEGORIES, id, updates)
			setCategories(prev => prev.map(c => c.$id === id ? updated : c))
			return updated
		}catch(error){
			console.error('updateCategory error:', error)
			throw error
		}
	}

	async function deleteCategory(id){
		try{
			await databases.deleteDocument(DATABASE_ID, COLLECTION_CATEGORIES, id)
			setCategories(prev => prev.filter(c => c.$id !== id))
			return true
		}catch(error){
			console.error('deleteCategory error:', error)
			throw error
		}
	}

	// ------------------ Tip functions ------------------
	async function fetchTips({ limit = 100, onlyPublished = true, categoryId, orderDesc = true } = {}){
		try{
			const queries = [ Query.limit(limit) ]
			if(orderDesc) queries.push(Query.orderDesc('$createdAt'))
			if(onlyPublished) queries.push(Query.equal('status','published'))
			if(categoryId) queries.push(Query.equal('categoryId', categoryId))

			const res = await databases.listDocuments(DATABASE_ID, COLLECTION_TIPS, queries)
			setTips(res.documents || [])
			return res.documents || []
		}catch(error){
			if(error?.code === 401 || error?.code === 403 || /not authorized|unauthorized/i.test(error?.message || '')){
				console.error('fetchTips unauthorized:', error?.message || error)
				await _logAuthState('fetchTips')
				return []
			}
			console.error('fetchTips error:', error)
			throw error
		}
	}
	// Normalize tags -> comma string and ensure default status
	function _normalizeTipPayload(payload){
		const p = { ...payload }
		if(p.tags && Array.isArray(p.tags)){
			try{ p.tags = p.tags.join(',') }catch(_){ p.tags = JSON.stringify(p.tags) }
		}
		if(!p.status) p.status = 'draft'
		if(user && !p.userID) p.userID = user.$id
		return p
	}

	async function createTip(data){
		if(!data) throw new Error('Missing tip data')
		const payload = _normalizeTipPayload(data)
		if(user && !payload.userID) payload.userID = user.$id
		if(payload.userId) delete payload.userId

		try{
			const serverUser = await account.get().catch(()=>null)
			if(serverUser && user && serverUser.$id !== user.$id){
				console.warn('createTip: mismatch between client user and server session')
			}
			// Attach sensible default permissions: public read, owner update/delete
			const doc = await databases.createDocument(
				DATABASE_ID,
				COLLECTION_TIPS,
				ID.unique(),
				payload,
				user ? [ Permission.read(Role.any()), Permission.update(Role.user(user.$id)), Permission.delete(Role.user(user.$id)) ] : [ Permission.read(Role.any()) ]
			)

			setTips(prev => [doc, ...prev])
			return doc
		}catch(error){
			console.error('createTip error:', error)
			if(error?.code === 401 || error?.code === 403 || /not authorized|unauthorized/i.test(error?.message || '')){
				throw new Error('Tip creation unauthorized. Check session and collection create permissions.')
			}
			throw error
		}
	}

	async function updateTip(id, updates){
		try{
			const payload = _normalizeTipPayload(updates)
			const updated = await databases.updateDocument(DATABASE_ID, COLLECTION_TIPS, id, payload)
			setTips(prev => prev.map(t => t.$id === id ? updated : t))
			return updated
		}catch(error){
			console.error('updateTip error:', error)
			throw error
		}
	}

	async function deleteTip(id){
		try{
			await databases.deleteDocument(DATABASE_ID, COLLECTION_TIPS, id)
			setTips(prev => prev.filter(t => t.$id !== id))
			return true
		}catch(error){
			console.error('deleteTip error:', error)
			throw error
		}
	}

	async function publishTip(id, publish = true){
		try{
			const status = publish ? 'published' : 'draft'
			const payload = { status }
			if(publish) payload.publishedAt = new Date().toISOString()
			const updated = await updateTip(id, payload)
			return updated
		}catch(error){
			console.error('publishTip error:', error)
			throw error
		}
	}

	// ------------------ Ratings & Comments ------------------
	async function rateTip(tipId, rating){
		if(!user) throw new Error('Authentication required to rate')
		if(typeof rating !== 'number' || rating < 1 || rating > 5) throw new Error('Rating must be 1..5')

		try{
			// Try to create a per-user rating record (preferred)
			const payload = { tipID: tipId, userID: user.$id, rating }
			const doc = await databases.createDocument(DATABASE_ID, COLLECTION_TIP_RATINGS, ID.unique(), payload, [ Permission.read(Role.any()), Permission.update(Role.user(user.$id)), Permission.delete(Role.user(user.$id)) ])
			return doc
		}catch(err){
			console.warn('rateTip: rating collection create failed, falling back to aggregate update', err?.message || err)
			try{
				const tip = await databases.getDocument(DATABASE_ID, COLLECTION_TIPS, tipId)
				const ratingCount = Number(tip.ratingCount || 0)
				const ratingSum = Number(tip.ratingSum || 0)
				const updated = await databases.updateDocument(DATABASE_ID, COLLECTION_TIPS, tipId, {
					ratingCount: ratingCount + 1,
					ratingSum: ratingSum + rating,
					averageRating: ((ratingSum + rating) / (ratingCount + 1)).toFixed(2)
				})
				return updated
			}catch(fbErr){
				console.error('rateTip fallback failed:', fbErr)
				throw new Error('Unable to record rating. Create a ratings collection for per-user ratings.')
			}
		}
	}

	async function removeRating(tipId){
		if(!user) throw new Error('Authentication required to remove rating')
		try{
			const q = [ Query.equal('tipID', tipId), Query.equal('userID', user.$id), Query.limit(50) ]
			const res = await databases.listDocuments(DATABASE_ID, COLLECTION_TIP_RATINGS, q)
			const docs = res.documents || []
			for(const d of docs){
				await databases.deleteDocument(DATABASE_ID, COLLECTION_TIP_RATINGS, d.$id)
			}
			if(docs.length) return true

			const tip = await databases.getDocument(DATABASE_ID, COLLECTION_TIPS, tipId)
			if(tip && (tip.ratingCount || tip.ratingSum)){
				const ratingCount = Number(tip.ratingCount || 0)
				const ratingSum = Number(tip.ratingSum || 0)
				const newCount = Math.max(0, ratingCount - 1)
				const newSum = Math.max(0, ratingSum - (tip.averageRating ? Number(tip.averageRating) : 0))
				await databases.updateDocument(DATABASE_ID, COLLECTION_TIPS, tipId, {
					ratingCount: newCount,
					ratingSum: newSum,
					averageRating: newCount === 0 ? 0 : (newSum / newCount).toFixed(2)
				})
				return true
			}

			return false
		}catch(error){
			console.error('removeRating error:', error)
			throw error
		}
	}

	async function commentTip(tipId, text){
		if(!user) throw new Error('Authentication required to comment')
		if(!text || typeof text !== 'string') throw new Error('Comment text required')

		try{
			const payload = { tipID: tipId, userID: user.$id, text }
			const doc = await databases.createDocument(DATABASE_ID, COLLECTION_TIP_COMMENTS, ID.unique(), payload, [ Permission.read(Role.any()), Permission.update(Role.user(user.$id)), Permission.delete(Role.user(user.$id)) ])
			try{
				const tip = await databases.getDocument(DATABASE_ID, COLLECTION_TIPS, tipId)
				const count = Number(tip.commentsCount || 0)
				await databases.updateDocument(DATABASE_ID, COLLECTION_TIPS, tipId, { commentsCount: count + 1 })
			}catch(_){/* ignore */}
			return doc
		}catch(error){
			console.error('commentTip error:', error)
			throw error
		}
	}

	async function fetchComments(tipId, { limit = 100 } = {}){
		const candidates = ['tipID', 'tipId', 'tip_id', 'tip']
		for(const field of candidates){
			try{
				const q = [ Query.equal(field, tipId), Query.orderDesc('$createdAt'), Query.limit(limit) ]
				const res = await databases.listDocuments(DATABASE_ID, COLLECTION_TIP_COMMENTS, q)
				const docs = res.documents || []
				if(docs.length){
					console.debug(`fetchComments: found ${docs.length} comments using field '${field}'`)
					return docs
				}
			}catch(error){
				console.warn(`fetchComments: query by ${field} failed:`, error?.message || error)
			}
		}
		try{
			const qAll = [ Query.limit(limit), Query.orderDesc('$createdAt') ]
			// Final fallback: scan recent comments and filter client-side
			const resAll = await databases.listDocuments(DATABASE_ID, COLLECTION_TIP_COMMENTS, qAll)
			const allDocs = resAll.documents || []
			const filtered = allDocs.filter(d => candidates.some(f => d[f] === tipId))
			if(filtered.length){
				console.debug(`fetchComments: fallback matched ${filtered.length} comments by scanning recent documents`)
				return filtered
			}
		}catch(error){
			console.warn('fetchComments fallback scan failed:', error?.message || error)
		}
		return []
	}

	// ------------------ Search & Rankings ------------------
	async function searchTips({ text, categoryId, onlyPublished = true, limit = 200 } = {}){
		try{
			const queries = [ Query.limit(limit) ]
			if(onlyPublished) queries.push(Query.equal('status','published'))
			if(categoryId) queries.push(Query.equal('categoryId', categoryId))
			queries.push(Query.orderDesc('$createdAt'))

			const res = await databases.listDocuments(DATABASE_ID, COLLECTION_TIPS, queries)
			let docs = res.documents || []

			if(text){
				const q = text.toLowerCase().trim()
				docs = docs.filter(d => {
					const title = (d.title || '').toLowerCase()
					const body = (d.body || d.description || '').toLowerCase()
					return title.includes(q) || body.includes(q)
				})
			}

			return docs
		}catch(error){
			console.error('searchTips error:', error)
			throw error
		}
	}

	async function browseRankings({ timeRange = 'all', limit = 10, top = true } = {}){
		try{
			let candidates = await fetchTips({ limit: 500, onlyPublished: true })

			if(timeRange === 'week' || timeRange === 'month'){
				const now = Date.now()
				const ms = timeRange === 'week' ? 7 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000
				const threshold = now - ms
				candidates = candidates.filter(t => {
					const created = t.$createdAt ? Date.parse(t.$createdAt) : null
					return created && created >= threshold
				})
			}

			const annotated = await Promise.all(candidates.map(async t => {
				let avg = null
				if(t.ratingCount && t.ratingSum){
					avg = Number(t.ratingSum) / Number(t.ratingCount)
				}else{
					try{
						const r = await databases.listDocuments(DATABASE_ID, COLLECTION_TIP_RATINGS, [ Query.equal('tipId', t.$id), Query.limit(1000) ])
						const docs = r.documents || []
						if(docs.length){
							const sum = docs.reduce((s,x) => s + Number(x.rating || 0), 0)
							avg = sum / docs.length
						}
					}catch(_){ }
				}
				return { tip: t, averageRating: avg || 0 }
			}))

			annotated.sort((a,b) => {
				if(top) return b.averageRating - a.averageRating
				return a.averageRating - b.averageRating
			})

			return annotated.slice(0, limit)
		}catch(error){
			console.error('browseRankings error:', error)
			throw error
		}
	}

	return (
		<TipsContext.Provider value={{
			categories,
			tips,
			fetchCategories,
			createCategory,
			updateCategory,
			deleteCategory,
			fetchTips,
			createTip,
			updateTip,
			deleteTip,
			publishTip,
			searchTips,
			rateTip,
			removeRating,
			commentTip,
			fetchComments,
			browseRankings
		}}>
			{children}
		</TipsContext.Provider>
	)
}

export default TipsProvider
