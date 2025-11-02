import React, { useState, useEffect } from 'react'

export function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [form, setForm] = useState({ name: '', email: '' })
  const [avatar, setAvatar] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        if (!token) throw new Error('No token found')

        const res = await fetch('http://localhost:8000/api/profile', {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        })

        if (!res.ok) {
          throw new Error(`Profile fetch failed: ${res.status}`)
        }

        const data = await res.json()
        setUser(data)
        setForm({ name: data.name, email: data.email })
      } catch (err) {
        console.error('❌ Profile fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  const token = localStorage.getItem('auth_token')
  if (!token) return alert('You must be logged in')

  const formData = new FormData()
  formData.append('name', form.name)
  formData.append('email', form.email)
  if (avatar) formData.append('avatar', avatar)

  // 👇 important line to make Laravel treat it as PUT
  formData.append('_method', 'PUT')

  try {
    const res = await fetch('http://localhost:8000/api/profile', {
      method: 'POST', // Laravel sees _method=PUT
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('Update error:', data)
      throw new Error(data.message || 'Profile update failed')
    }

    setUser(data.user)
    alert('✅ Profile updated successfully!')
  } catch (err) {
    console.error('❌ Profile update error:', err)
    alert('Failed to update profile.')
  }
}


  if (loading) return <div className="text-center mt-10">Loading...</div>
  if (!user) return <div className="text-center mt-10 text-red-500">Not logged in</div>

  return (
    <div className="max-w-md mx-auto bg-white p-6 shadow rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block font-medium">Name</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium">Email</label>
          <input
            type="email"
            className="w-full border p-2 rounded"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium">Profile Picture</label>
          {user.avatar && (
            <img
              src={user.avatar}
              alt="Avatar"
              className="h-24 w-24 rounded-full mb-2 object-cover"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={e => setAvatar(e.target.files?.[0] || null)}
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Save Changes
        </button>
      </form>
    </div>
  )
}
