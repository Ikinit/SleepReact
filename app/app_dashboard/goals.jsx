import React, { useContext, useEffect, useState } from 'react'
import { StyleSheet, View, FlatList, Alert, TouchableOpacity, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'

import Spacer from "../../components/spacer"
import ThemedText from "../../components/ThemedText"
import ThemedView from "../../components/ThemedView"
import ThemedButton from "../../components/ThemedButton"
import ThemedTextInput from "../../components/ThemedTextInput"
import ThemedCard from "../../components/ThemedCard"

import { GoalsContext } from '../../contexts/GoalsContext'

const Goals = () => {
  const { goals, fetchGoals, createGoal, updateGoal, deleteGoal, setGoalStatus, searchGoals } = useContext(GoalsContext)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ title: '', type: 'duration', targetHours: '', rule: '', days: [], startDate: '', endDate: '' })
  const [displayed, setDisplayed] = useState([])
  const [filterStatus, setFilterStatus] = useState(null)
  const [searchRange, setSearchRange] = useState({ startDate: '', endDate: '' })
  const [showStartDatePicker, setShowStartDatePicker] = useState(false)
  const [showEndDatePicker, setShowEndDatePicker] = useState(false)
  const [selectedStartDate, setSelectedStartDate] = useState(new Date())
  const [selectedEndDate, setSelectedEndDate] = useState(new Date())

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    if(!filterStatus && !searchRange.startDate && !searchRange.endDate){
      setDisplayed(goals)
    }
  }, [goals])

  const handleStartDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowStartDatePicker(false)
    }
    if (selectedDate) {
      setSelectedStartDate(selectedDate)
      const formattedDate = selectedDate.toISOString().split('T')[0]
      setForm(f => ({...f, startDate: formattedDate}))
    }
  }

  const handleEndDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowEndDatePicker(false)
    }
    if (selectedDate) {
      setSelectedEndDate(selectedDate)
      const formattedDate = selectedDate.toISOString().split('T')[0]
      setForm(f => ({...f, endDate: formattedDate}))
    }
  }

  async function load(){
    setLoading(true)
    try{
      await fetchGoals()
    }catch(e){
    }finally{
      setLoading(false)
    }
  }

  function resetForm(){
    setForm({ title: '', type: 'duration', targetHours: '', rule: '', days: [], startDate: '', endDate: '' })
    setEditingId(null)
    setShowForm(false)
  }

  async function onSubmit(){
    if(!form.title) return Alert.alert('Validation', 'Title is required')

    try{
      if(editingId){
        await updateGoal(editingId, {
          ...form,
          targetHours: form.type === 'duration' ? Number(form.targetHours) : undefined
        })
      }else{
        await createGoal({
          ...form,
          targetHours: form.type === 'duration' ? Number(form.targetHours) : undefined
        })
      }

      resetForm()
    }catch(error){
      Alert.alert('Error', error.message)
    }
  }

  function onEdit(item){
    setEditingId(item.$id)
    setForm({
      title: item.title || '',
      type: item.type || 'duration',
      targetHours: item.targetHours ? String(item.targetHours) : '',
      rule: item.rule || '',
      days: item.days || [],
      startDate: item.startDate || '',
      endDate: item.endDate || ''
    })
    setShowForm(true)
  }

  function confirmDelete(id){
    Alert.alert('Delete goal', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try{
          await deleteGoal(id)
        }catch(e){
          Alert.alert('Error', e.message)
        }
      }}
    ])
  }

  async function applyFilter(status){
    setFilterStatus(status)
    if(!status){
      setDisplayed(goals)
      return
    }

    try{
      const res = await searchGoals({ status })
      setDisplayed(res)
    }catch(e){
      Alert.alert('Error', e.message)
    }
  }

  async function applyDateRange(){
    const { startDate, endDate } = searchRange
    try{
      const res = await searchGoals({ startDate: startDate || undefined, endDate: endDate || undefined })
      setDisplayed(res)
    }catch(e){
      Alert.alert('Error', e.message)
    }
  }

  function renderItem({ item }){
    return (
      <ThemedCard style={styles.card}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <ThemedText title={true}>{item.title}</ThemedText>
          <ThemedText>{item.status}</ThemedText>
        </View>

        <ThemedText>{item.type === 'duration' ? `Target: ${item.targetHours ?? '-'} hrs` : item.rule}</ThemedText>

        <View style={styles.row}>
          <ThemedButton onPress={() => onEdit(item)} style={styles.smallBtn}><ThemedText> Edit </ThemedText></ThemedButton>
          <ThemedButton onPress={() => setGoalStatus(item.$id, item.status === 'Active' ? 'Completed' : 'Active')} style={styles.smallBtn}><ThemedText>{item.status === 'Active' ? 'Mark Completed' : 'Mark Active'}</ThemedText></ThemedButton>
          <ThemedButton onPress={() => confirmDelete(item.$id)} style={[styles.smallBtn, { backgroundColor: '#b71c1c'}]}><ThemedText> Delete </ThemedText></ThemedButton>
        </View>
      </ThemedCard>
    )
  }

  return (
    <ThemedView style={styles.container}>
      <Spacer />
      <ThemedText title={true} style={styles.heading}>Your Sleep Goals</ThemedText>

      <View style={styles.controls}>
        <ThemedButton onPress={() => { setShowForm(s => !s); if(showForm) resetForm() }}><ThemedText>{showForm ? 'Cancel' : 'New Goal'}</ThemedText></ThemedButton>

        <View style={styles.filterRow}>
          <TouchableOpacity onPress={() => applyFilter(null)}><ThemedText>All</ThemedText></TouchableOpacity>
          <TouchableOpacity onPress={() => applyFilter('Active')}><ThemedText>Active</ThemedText></TouchableOpacity>
          <TouchableOpacity onPress={() => applyFilter('Completed')}><ThemedText>Completed</ThemedText></TouchableOpacity>
          <TouchableOpacity onPress={() => applyFilter('Cancelled')}><ThemedText>Cancelled</ThemedText></TouchableOpacity>
        </View>

        <View style={styles.dateRow}>
          <ThemedTextInput placeholder="start date (YYYY-MM-DD)" value={searchRange.startDate} onChangeText={t => setSearchRange(s => ({...s, startDate: t}))} style={styles.dateInput} />
          <ThemedTextInput placeholder="end date (YYYY-MM-DD)" value={searchRange.endDate} onChangeText={t => setSearchRange(s => ({...s, endDate: t}))} style={styles.dateInput} />
          <ThemedButton onPress={applyDateRange}><ThemedText>Search</ThemedText></ThemedButton>
        </View>
      </View>

      {showForm && (
        <ThemedCard style={styles.form}>
          <ThemedTextInput placeholder="Title" value={form.title} onChangeText={t => setForm(f => ({...f, title: t}))} />
          <View style={styles.typeRow}>
            <TouchableOpacity onPress={() => setForm(f => ({...f, type: 'duration'}))} style={[styles.typeBtn, form.type === 'duration' && styles.typeBtnActive]}>
              <ThemedText>Duration</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setForm(f => ({...f, type: 'text'}))} style={[styles.typeBtn, form.type === 'text' && styles.typeBtnActive]}>
              <ThemedText>Custom</ThemedText>
            </TouchableOpacity>
          </View>

          {form.type === 'duration' && (
            <ThemedTextInput placeholder="Target hours" keyboardType="numeric" value={form.targetHours} onChangeText={t => setForm(f => ({...f, targetHours: t}))} />
          )}

          {form.type === 'text' && (
            <ThemedTextInput placeholder="Rule / note" value={form.rule} onChangeText={t => setForm(f => ({...f, rule: t}))} />
          )}
          
          <ThemedText style={styles.label}>Start Date</ThemedText>
          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => setShowStartDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={18} color="#10549dff" />
            <ThemedText style={styles.dateButtonText}>
              {form.startDate || 'Select Start Date'}
            </ThemedText>
            <Ionicons name="chevron-down" size={18} color="#10549dff" />
          </TouchableOpacity>

          {showStartDatePicker && (
            <DateTimePicker
              value={selectedStartDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleStartDateChange}
            />
          )}
          {Platform.OS === 'ios' && showStartDatePicker && (
            <View style={styles.iosPickerButtons}>
              <TouchableOpacity onPress={() => setShowStartDatePicker(false)}>
                <ThemedText style={styles.iosButton}>Done</ThemedText>
              </TouchableOpacity>
            </View>
          )}

          <ThemedText style={styles.label}>End Date</ThemedText>
          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => setShowEndDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={18} color="#10549dff" />
            <ThemedText style={styles.dateButtonText}>
              {form.endDate || 'Select End Date'}
            </ThemedText>
            <Ionicons name="chevron-down" size={18} color="#10549dff" />
          </TouchableOpacity>

          {showEndDatePicker && (
            <DateTimePicker
              value={selectedEndDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleEndDateChange}
            />
          )}
          {Platform.OS === 'ios' && showEndDatePicker && (
            <View style={styles.iosPickerButtons}>
              <TouchableOpacity onPress={() => setShowEndDatePicker(false)}>
                <ThemedText style={styles.iosButton}>Done</ThemedText>
              </TouchableOpacity>
            </View>
          )}

          <ThemedButton onPress={onSubmit}><ThemedText>{editingId ? 'Save' : 'Create'}</ThemedText></ThemedButton>
        </ThemedCard>
      )}

      <FlatList
        data={displayed}
        keyExtractor={i => i.$id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 12 }}
        ListEmptyComponent={<ThemedText>{loading ? 'Loading...' : 'No goals yet'}</ThemedText>}
      />
    </ThemedView>
  )
}

export default Goals

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch'
  },
  heading: {
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center'
  },
  card: {
    marginVertical: 8,
    padding: 12
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  smallBtn: { padding: 8, marginHorizontal: 4, backgroundColor: '#1976d2' },
  controls: { paddingHorizontal: 12 },
  filterRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 8 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  dateInput: { flex: 1, marginRight: 8 },
  form: { margin: 12, padding: 12 },
  typeRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 },
  typeBtn: { flex: 1, padding: 12, alignItems: 'center', marginHorizontal: 4, borderRadius: 6, backgroundColor: '#e0e0e0' },
  typeBtnActive: { backgroundColor: '#1976d2' },
  label: { fontWeight: '600', fontSize: 14, marginBottom: 6, marginTop: 10 },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10549dff',
    backgroundColor: 'rgba(16, 84, 157, 0.05)',
    marginBottom: 12,
  },
  dateButtonText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  iosPickerButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  iosButton: {
    color: '#10549dff',
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 12,
  },
})