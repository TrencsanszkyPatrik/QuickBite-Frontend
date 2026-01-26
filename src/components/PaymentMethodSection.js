import { useState } from 'react'
import { API_BASE, getAuthHeaders } from '../utils/api'
import { showToast } from '../utils/toast'

const PAYMENT_TYPES = [
  { value: 'card', label: 'Bankkártya' },
  { value: 'cash', label: 'Készpénz' },
  { value: 'szep', label: 'SZÉP kártya' }
]

const emptyForm = () => ({
  type: 'card',
  displayName: '',
  lastFourDigits: '',
  isDefault: false
})

const getTypeLabel = (type) => PAYMENT_TYPES.find((t) => t.value === type)?.label || type

export default function PaymentMethodSection({ paymentMethods, onUpdate }) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [busyId, setBusyId] = useState(null)

  const loadProfile = async () => {
    const res = await fetch(`${API_BASE}/Profile/me`, { headers: getAuthHeaders() })
    if (!res.ok) throw new Error('Profil betöltése sikertelen')
    return res.json()
  }

  const openAdd = () => {
    setEditingId(null)
    setForm(emptyForm())
    setShowForm(true)
  }

  const openEdit = (p) => {
    setEditingId(p.id)
    setForm({
      type: p.type,
      displayName: p.displayName,
      lastFourDigits: p.lastFourDigits || '',
      isDefault: p.isDefault
    })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const displayName = form.displayName?.trim()
    if (!displayName) {
      showToast.error('Megjelenített név kötelező.')
      return
    }
    setBusyId('payment')
    try {
      const url = editingId
        ? `${API_BASE}/Profile/payment-methods/${editingId}`
        : `${API_BASE}/Profile/payment-methods`
      const method = editingId ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify({
          type: form.type,
          displayName,
          lastFourDigits: form.lastFourDigits?.trim() || null,
          isDefault: form.isDefault
        })
      })
      if (!res.ok) throw new Error('Mentés sikertelen')
      showToast.success(editingId ? 'Fizetési mód frissítve.' : 'Fizetési mód hozzáadva.')
      const data = await loadProfile()
      if (data) onUpdate(data)
      setShowForm(false)
      setForm(emptyForm())
      setEditingId(null)
    } catch (err) {
      console.error(err)
      showToast.error('Fizetési mód mentése sikertelen.')
    } finally {
      setBusyId(null)
    }
  }

  const setDefault = async (id) => {
    setBusyId(id)
    try {
      const res = await fetch(`${API_BASE}/Profile/payment-methods/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ isDefault: true })
      })
      if (!res.ok) throw new Error()
      const data = await loadProfile()
      if (data) onUpdate(data)
      showToast.success('Alapértelmezett fizetési mód beállítva.')
    } catch {
      showToast.error('Nem sikerült beállítani.')
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Biztosan törölni szeretnéd ezt a fizetési módot?')) return
    setBusyId(id)
    try {
      const res = await fetch(`${API_BASE}/Profile/payment-methods/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      if (!res.ok) throw new Error()
      const data = await loadProfile()
      if (data) onUpdate(data)
      showToast.success('Fizetési mód törölve.')
      if (editingId === id) {
        setShowForm(false)
        setEditingId(null)
        setForm(emptyForm())
      }
    } catch {
      showToast.error('Törlés sikertelen.')
    } finally {
      setBusyId(null)
    }
  }

  const cancel = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm())
  }

  return (
    <div className="profile-section-card">
      <h2>
        <i className="bi bi-credit-card" aria-hidden="true" />
        Fizetési módok
      </h2>
      <div className="profile-item-list">
        {paymentMethods.map((p) => (
          <div
            key={p.id}
            className={`profile-item-card ${p.isDefault ? 'is-default' : ''}`}
          >
            <div className="profile-item-body">
              <div className="profile-item-label">
                {p.type === 'card' && <i className="bi bi-credit-card-2-front" />}
                {p.type === 'cash' && <i className="bi bi-cash-stack" />}
                {p.type === 'szep' && <i className="bi bi-wallet2" />}
                {getTypeLabel(p.type)}
                {p.isDefault && <span className="profile-default-badge">Alapértelmezett</span>}
              </div>
              <div className="profile-item-detail">
                {p.displayName}
                {p.lastFourDigits && ` •••• ${p.lastFourDigits}`}
              </div>
            </div>
            <div className="profile-item-actions">
              {!p.isDefault && (
                <button
                  type="button"
                  className="profile-btn profile-btn-sm profile-btn-ghost"
                  onClick={() => setDefault(p.id)}
                  disabled={busyId !== null}
                >
                  Alapértelmezett
                </button>
              )}
              <button
                type="button"
                className="profile-btn profile-btn-sm profile-btn-ghost"
                onClick={() => openEdit(p)}
                disabled={busyId !== null}
              >
                <i className="bi bi-pencil" /> Szerkeszt
              </button>
              <button
                type="button"
                className="profile-btn profile-btn-sm profile-btn-ghost"
                onClick={() => handleDelete(p.id)}
                disabled={busyId !== null}
              >
                <i className="bi bi-trash" /> Törlés
              </button>
            </div>
          </div>
        ))}
      </div>
      {showForm ? (
        <form className="profile-add-form" onSubmit={handleSubmit}>
          <div className="profile-form-grid">
            <div className="profile-form-group">
              <label>Típus</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              >
                {PAYMENT_TYPES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="profile-form-group full-width">
              <label>Megjelenített név (pl. Bankkártya **** 1234)</label>
              <input
                type="text"
                value={form.displayName}
                onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                placeholder="Bankkártya **** 1234"
                required
              />
            </div>
            {form.type === 'card' && (
              <div className="profile-form-group">
                <label>Utolsó 4 számjegy (opcionális)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={form.lastFourDigits}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 4)
                    setForm((f) => ({ ...f, lastFourDigits: v }))
                  }}
                  placeholder="1234"
                />
              </div>
            )}
            <div className="profile-form-group full-width">
              <label>
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
                />{' '}
                Alapértelmezett fizetési mód
              </label>
            </div>
          </div>
          <div className="profile-actions">
            <button
              type="submit"
              className="profile-btn profile-btn-primary"
              disabled={busyId === 'payment'}
            >
              {editingId ? 'Mentem' : 'Hozzáadom'}
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
          onClick={openAdd}
          style={{ marginTop: '0.75rem' }}
        >
          <i className="bi bi-plus-lg" /> Új fizetési mód
        </button>
      )}
    </div>
  )
}
