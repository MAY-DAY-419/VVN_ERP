import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

function News() {
  const [newsList, setNewsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    date: '',
    title: '',
    description: ''
  })

  // Helper function to format date as DD - MONTH - YEAR
  const formatDateDisplay = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    const month = monthNames[date.getMonth()]
    const year = date.getFullYear()
    return `${day} - ${month} - ${year}`
  }

  // Helper function to convert display format back to date for editing
  const getDateFromDisplay = (displayString) => {
    if (!displayString) return ''
    const parts = displayString.split(' - ')
    if (parts.length !== 3) return displayString
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    const day = parts[0]
    const month = monthNames.indexOf(parts[1]) + 1
    const year = parts[2]
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('date', { ascending: false })

      if (error) throw error
      setNewsList(data || [])
    } catch (error) {
      console.error('Error fetching news:', error)
      alert('Error loading news: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      // Convert date to display format before saving
      const formattedDate = formatDateDisplay(formData.date)
      const dataToSave = {
        ...formData,
        date: formattedDate
      }

      if (editingId) {
        // Update existing news
        const { error } = await supabase
          .from('news')
          .update(dataToSave)
          .eq('id', editingId)

        if (error) throw error
        alert('News updated successfully!')
      } else {
        // Add new news
        const { error } = await supabase
          .from('news')
          .insert([dataToSave])

        if (error) throw error
        alert('News added successfully!')
      }

      setFormData({ date: '', title: '', description: '' })
      setEditingId(null)
      fetchNews()
    } catch (error) {
      console.error('Error saving news:', error)
      alert('Error: ' + error.message)
    }
  }

  const handleEdit = (news) => {
    setEditingId(news.id)
    // Convert display format back to date format for editing
    const dateValue = getDateFromDisplay(news.date)
    setFormData({
      date: dateValue,
      title: news.title,
      description: news.description
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDateChange = (e) => {
    const dateValue = e.target.value
    setFormData({ ...formData, date: dateValue })
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this news item?')) return

    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id)

      if (error) throw error
      alert('News deleted successfully!')
      fetchNews()
    } catch (error) {
      console.error('Error deleting news:', error)
      alert('Error: ' + error.message)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData({ date: '', title: '', description: '' })
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '20px' }}>📢 News Management</h2>

      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '30px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h3>{editingId ? 'Edit News' : 'Add New News'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={handleDateChange}
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
            />
            {formData.date && (
              <div style={{ marginTop: '8px', padding: '8px', background: '#f5f5f5', borderRadius: '4px', fontSize: '14px', color: '#333', fontWeight: '500' }}>
                Display Format: {formatDateDisplay(formData.date)}
              </div>
            )}
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Title</label>
            <input
              type="text"
              placeholder="News title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Description</label>
            <textarea
              placeholder="News description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows="3"
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" style={{ padding: '10px 20px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              {editingId ? '✏️ Update' : '➕ Add'} News
            </button>
            {editingId && (
              <button type="button" onClick={handleCancel} style={{ padding: '10px 20px', background: '#757575', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                ❌ Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginBottom: '15px' }}>All News Items</h3>
        {loading ? (
          <p>Loading...</p>
        ) : newsList.length === 0 ? (
          <p style={{ color: '#666' }}>No news items yet. Add one above!</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
            {newsList.map((news) => (
              <div key={news.id} style={{ border: '1px solid #e0e0e0', padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', height: 'fit-content' }}>
                <div style={{ display: 'inline-block', background: '#667eea', color: 'white', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', marginBottom: '8px', width: 'fit-content' }}>
                  {news.date}
                </div>
                <h4 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '15px', lineHeight: '1.3' }}>{news.title}</h4>
                <p style={{ margin: '0 0 12px 0', color: '#666', fontSize: '13px', lineHeight: '1.5', flex: 1 }}>{news.description}</p>
                <div style={{ display: 'flex', gap: '6px', marginTop: 'auto' }}>
                  <button onClick={() => handleEdit(news)} style={{ flex: 1, padding: '6px 10px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }}>
                    ✏️ Edit
                  </button>
                  <button onClick={() => handleDelete(news.id)} style={{ flex: 1, padding: '6px 10px', background: '#f44336', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }}>
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default News
