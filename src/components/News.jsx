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
      if (editingId) {
        // Update existing news
        const { error } = await supabase
          .from('news')
          .update(formData)
          .eq('id', editingId)

        if (error) throw error
        alert('News updated successfully!')
      } else {
        // Add new news
        const { error } = await supabase
          .from('news')
          .insert([formData])

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
    setFormData({
      date: news.date,
      title: news.title,
      description: news.description
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
              type="text"
              placeholder="e.g., 08 Jan 2026"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
            />
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {newsList.map((news) => (
              <div key={news.id} style={{ border: '1px solid #e0e0e0', padding: '15px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'inline-block', background: '#667eea', color: 'white', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', marginBottom: '8px' }}>
                      {news.date}
                    </div>
                    <h4 style={{ margin: '8px 0', color: '#333' }}>{news.title}</h4>
                    <p style={{ margin: 0, color: '#666', lineHeight: '1.6' }}>{news.description}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginLeft: '15px' }}>
                    <button onClick={() => handleEdit(news)} style={{ padding: '6px 12px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '13px' }}>
                      ✏️ Edit
                    </button>
                    <button onClick={() => handleDelete(news.id)} style={{ padding: '6px 12px', background: '#f44336', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '13px' }}>
                      🗑️ Delete
                    </button>
                  </div>
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
