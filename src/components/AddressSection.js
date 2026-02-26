import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { API_BASE, getAuthHeaders } from '../utils/api'
import { showToast } from '../utils/toast'
import AddressAutocomplete from './AddressAutocomplete'
import '../styles/modal.css'

const ADDRESS_LABELS = [
  { value: 'Otthon', label: 'Otthon' },
  { value: 'Munkahely', label: 'Munkahely' },
  { value: 'Egyéb', label: 'Egyéb' }
]

const emptyForm = () => ({
  label: 'Otthon',
  addressLine: '',
  city: '',
  zipCode: '',
  isDefault: false
})

export default function AddressSection({ addresses, onUpdate }) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [busyId, setBusyId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    if (!deleteTarget) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [deleteTarget])

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

  const openEdit = (a) => {
    setEditingId(a.id)
    setForm({
      label: a.label,
      addressLine: a.addressLine,
      city: a.city,
      zipCode: a.zipCode,
      isDefault: a.isDefault
    })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.addressLine?.trim() || !form.city?.trim() || !form.zipCode?.trim()) {
      showToast.error('Cím, város és irányítószám kötelező.')
      return
    }
    setBusyId('address')
    try {
      const url = editingId
        ? `${API_BASE}/Profile/addresses/${editingId}`
        : `${API_BASE}/Profile/addresses`
      const method = editingId ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify({
          label: form.label,
          addressLine: form.addressLine.trim(),
          city: form.city.trim(),
          zipCode: form.zipCode.trim(),
          isDefault: form.isDefault
        })
      })
      if (!res.ok) throw new Error('Cím mentése sikertelen')
      showToast.success(editingId ? 'Cím frissítve.' : 'Cím hozzáadva.')
      const data = await loadProfile()
      if (data) onUpdate(data)
      setShowForm(false)
      setForm(emptyForm())
      setEditingId(null)
    } catch (err) {
      console.error(err)
      showToast.error('Cím mentése sikertelen.')
    } finally {
      setBusyId(null)
    }
  }

  const setDefault = async (id) => {
    setBusyId(id)
    try {
      const res = await fetch(`${API_BASE}/Profile/addresses/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ isDefault: true })
      })
      if (!res.ok) throw new Error()
      const data = await loadProfile()
      if (data) onUpdate(data)
      showToast.success('Alapértelmezett cím beállítva.')
    } catch {
      showToast.error('Nem sikerült beállítani.')
    } finally {
      setBusyId(null)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    const id = deleteTarget.id
    setBusyId(id)
    try {
      const res = await fetch(`${API_BASE}/Profile/addresses/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      if (!res.ok) throw new Error()
      const data = await loadProfile()
      if (data) onUpdate(data)
      showToast.success('Cím törölve.')
      if (editingId === id) {
        setShowForm(false)
        setEditingId(null)
        setForm(emptyForm())
      }
    } catch {
      showToast.error('Törlés sikertelen.')
    } finally {
      setBusyId(null)
      setDeleteTarget(null)
    }
  }

  const cancel = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm())
  }

  const isDeletingSelectedAddress = Boolean(deleteTarget && busyId === deleteTarget.id)

  return (
    <div className="profile-section-card">
      <h2>
        <i className="bi bi-geo-alt" aria-hidden="true" />
        Címeim
      </h2>
      <div className="profile-item-list">
        {addresses.map((a) => (
          <div
            key={a.id}
            className={`profile-item-card ${a.isDefault ? 'is-default' : ''}`}
          >
            <div className="profile-item-body">
              <div className="profile-item-label">
                {a.label}
                {a.isDefault && <span className="profile-default-badge">Alapértelmezett</span>}
              </div>
              <div className="profile-item-detail">
                {a.addressLine}, {a.zipCode} {a.city}
              </div>
            </div>
            <div className="profile-item-actions">
              {!a.isDefault && (
                <button
                  type="button"
                  className="profile-btn profile-btn-sm profile-btn-ghost"
                  onClick={() => setDefault(a.id)}
                  disabled={busyId !== null}
                >
                  Alapértelmezett
                </button>
              )}
              <button
                type="button"
                className="profile-btn profile-btn-sm profile-btn-ghost"
                onClick={() => openEdit(a)}
                disabled={busyId !== null}
              >
                <i className="bi bi-pencil" /> Szerkeszt
              </button>
              <button
                type="button"
                className="profile-btn profile-btn-sm profile-btn-ghost"
                onClick={() => setDeleteTarget(a)}
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
              <label>Megnevezés</label>
              <select
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              >
                {ADDRESS_LABELS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="profile-form-group full-width">
              <label>Cím (utca, házszám)</label>
              <AddressAutocomplete
                value={form.addressLine}
                onChange={(value) => setForm((f) => ({ ...f, addressLine: value }))}
                onAddressSelect={(addressData) => setForm((f) => ({
                  ...f,
                  addressLine: addressData.addressLine,
                  city: addressData.city,
                  zipCode: addressData.zipCode
                }))}
                placeholder="Palóczy László utca 3."
                required
              />
            </div>
            <div className="profile-form-group">
              <label>Város</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                placeholder="Miskolc"
                required
              />
            </div>
            <div className="profile-form-group">
              <label>Irányítószám</label>
              <input
                type="text"
                value={form.zipCode}
                onChange={(e) => setForm((f) => ({ ...f, zipCode: e.target.value }))}
                placeholder="3525"
                required
              />
            </div>
            <div className="profile-form-group full-width">
              <label>
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
                />{' '}
                Alapértelmezett cím
              </label>
            </div>
          </div>
          <div className="profile-actions">
            <button
              type="submit"
              className="profile-btn profile-btn-primary"
              disabled={busyId === 'address'}
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
          <i className="bi bi-plus-lg" /> Új cím
        </button>
      )}
      {deleteTarget && createPortal(
        <div
          className="modal-overlay"
          onClick={() => {
            if (!isDeletingSelectedAddress) setDeleteTarget(null)
          }}
        >
          <div className="modal-content modal-content--small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Mentett cím törlése</h2>
              <button
                className="modal-close"
                onClick={() => !isDeletingSelectedAddress && setDeleteTarget(null)}
                aria-label="Bezárás"
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-icon">⚠️</div>
              <p className="modal-text">Biztosan törölni szeretnéd ezt a mentett címet?</p>
              <p className="modal-text">
                <strong>{deleteTarget.label}</strong>
              </p>
              <p className="modal-text">
                {deleteTarget.addressLine}, {deleteTarget.zipCode} {deleteTarget.city}
              </p>
              <p className="modal-question">A művelet nem vonható vissza.</p>
              {isDeletingSelectedAddress && (
                <p className="modal-text" aria-live="polite">
                  Törlés folyamatban... Kérlek várj, frissítjük az adatokat.
                </p>
              )}
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="modal-btn modal-btn-cancel"
                onClick={() => !isDeletingSelectedAddress && setDeleteTarget(null)}
                disabled={isDeletingSelectedAddress}
              >
                Mégse
              </button>
              <button
                type="button"
                className="modal-btn modal-btn-confirm"
                onClick={handleDeleteConfirm}
                disabled={isDeletingSelectedAddress}
              >
                {isDeletingSelectedAddress ? 'Törlés...' : 'Törlés'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
