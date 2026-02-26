import { useState } from 'react'
import { API_BASE, getAuthHeaders } from '../utils/api'
import { showToast } from '../utils/toast'

export default function PasswordChangeSection() {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    newPasswordConfirm: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.newPassword.length < 6) {
      showToast.error('Az új jelszónak legalább 6 karakter hosszúnak kell lennie.')
      return
    }

    const hasLowercase = /[a-z]/.test(form.newPassword)
    const hasUppercase = /[A-Z]/.test(form.newPassword)
    const hasNumber = /[0-9]/.test(form.newPassword)
    const hasSpecial = /[^A-Za-z0-9]/.test(form.newPassword)

    if (!hasLowercase || !hasUppercase || !hasNumber || !hasSpecial) {
      showToast.error('Az új jelszónak tartalmaznia kell kis- és nagybetűt, számot és speciális karaktert.')
      return
    }
    if (form.newPassword !== form.newPasswordConfirm) {
      showToast.error('Az új jelszavak nem egyeznek meg.')
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE}/Profile/me/password`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword
        })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        showToast.error(data.message || 'Jelszó megváltoztatása sikertelen.')
        return
      }
      showToast.success('A jelszavad sikeresen megváltozott.')
      setForm({ currentPassword: '', newPassword: '', newPasswordConfirm: '' })
      setShowForm(false)
    } catch (err) {
      console.error(err)
      showToast.error('Jelszó megváltoztatása sikertelen.')
    } finally {
      setIsLoading(false)
    }
  }

  const cancel = () => {
    setShowForm(false)
    setForm({ currentPassword: '', newPassword: '', newPasswordConfirm: '' })
  }

  return (
    <div className="profile-section-card">
      <h2>
        <i className="bi bi-key" aria-hidden="true" />
        Jelszó megváltoztatása
      </h2>
      {showForm ? (
        <form onSubmit={handleSubmit}>
          <div className="profile-form-grid">
            <div className="profile-form-group full-width">
              <label htmlFor="current-password">Jelenlegi jelszó</label>
              <input
                id="current-password"
                type="password"
                value={form.currentPassword}
                onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
            <div className="profile-form-group full-width">
              <label htmlFor="new-password">Új jelszó (min. 6 karakter)</label>
              <input
                id="new-password"
                type="password"
                value={form.newPassword}
                onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            <div className="profile-form-group full-width">
              <label htmlFor="new-password-confirm">Új jelszó még egyszer</label>
              <input
                id="new-password-confirm"
                type="password"
                value={form.newPasswordConfirm}
                onChange={(e) => setForm((f) => ({ ...f, newPasswordConfirm: e.target.value }))}
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
          </div>
          <div className="profile-actions">
            <button
              type="submit"
              className="profile-btn profile-btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Mentés...' : 'Jelszó megváltoztatása'}
            </button>
            <button type="button" className="profile-btn profile-btn-outline" onClick={cancel}>
              Mégse
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          className="profile-btn profile-btn-outline"
          onClick={() => setShowForm(true)}
        >
          <i className="bi bi-key" /> Jelszó megváltoztatása
        </button>
      )}
    </div>
  )
}
