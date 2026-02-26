import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { API_BASE, getAuthHeaders } from '../utils/api'
import { showToast } from '../utils/toast'
import '../styles/modal.css'

const PAYMENT_TYPES = [
  { value: 'card', label: 'Bankkártya' },
  { value: 'cash', label: 'Készpénz' },
  { value: 'szep', label: 'SZÉP kártya' }
]

const emptyForm = () => ({
  type: 'card',
  displayName: '',
  cardNumber: '',
  lastFourDigits: '',
  isDefault: false
})

const getTypeLabel = (type) => PAYMENT_TYPES.find((t) => t.value === type)?.label || type

const formatCardNumber = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
}

const isValidCardNumber = (value) => {
  const cleaned = value.replace(/\D/g, '')

  return /^\d{16}$/.test(cleaned)
}

export default function PaymentMethodSection({ paymentMethods, onUpdate }) {
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

  const openEdit = (p) => {
    setEditingId(p.id)
    setForm({
      type: p.type,
      displayName: p.displayName,
      cardNumber: '',
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

    const cleanedCardNumber = form.cardNumber.replace(/\D/g, '')
    if (form.type === 'card' && cleanedCardNumber && !isValidCardNumber(cleanedCardNumber)) {
      showToast.error('A bankkártyaszám 16 számjegyből álljon.')
      return
    }

    const computedLastFourDigits =
      form.type === 'card'
        ? (cleanedCardNumber ? cleanedCardNumber.slice(-4) : form.lastFourDigits?.trim() || null)
        : null

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
          lastFourDigits: computedLastFourDigits,
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

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    const id = deleteTarget.id
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
      setDeleteTarget(null)
    }
  }

  const cancel = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm())
  }

  const isDeletingSelectedPayment = Boolean(deleteTarget && busyId === deleteTarget.id)

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
                onClick={() => setDeleteTarget(p)}
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
              <div className="profile-form-group full-width">
                <label>Kártyaszám (16 számjegy)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={19}
                  value={formatCardNumber(form.cardNumber)}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 16)
                    setForm((f) => ({ ...f, cardNumber: v }))
                  }}
                  placeholder="1234 5678 9012 3456"
                />
                {form.lastFourDigits && !form.cardNumber && (
                  <small style={{ color: '#6b7280' }}>
                    Jelenlegi mentett kártya: •••• {form.lastFourDigits}. Új kártyaszám csak cseréhez szükséges.
                  </small>
                )}
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
      {deleteTarget && createPortal(
        <div
          className="modal-overlay"
          onClick={() => {
            if (busyId === null) setDeleteTarget(null)
          }}
        >
          <div className="modal-content modal-content--small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Mentett fizetési mód törlése</h2>
              <button
                className="modal-close"
                onClick={() => !isDeletingSelectedPayment && setDeleteTarget(null)}
                aria-label="Bezárás"
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-icon">⚠️</div>
              <p className="modal-text">
                Biztosan törölni szeretnéd ezt a mentett fizetési módot?
              </p>
              <p className="modal-text">
                <strong>{deleteTarget.displayName}</strong>
                {deleteTarget.lastFourDigits && ` •••• ${deleteTarget.lastFourDigits}`}
              </p>
              <p className="modal-question">A művelet nem vonható vissza.</p>
              {isDeletingSelectedPayment && (
                <p className="modal-text" aria-live="polite">
                  Törlés folyamatban... Kérlek várj, frissítjük az adatokat.
                </p>
              )}
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="modal-btn modal-btn-cancel"
                onClick={() => busyId === null && setDeleteTarget(null)}
                disabled={isDeletingSelectedPayment}
              >
                Mégse
              </button>
              <button
                type="button"
                className="modal-btn modal-btn-confirm"
                onClick={handleDeleteConfirm}
                disabled={isDeletingSelectedPayment}
              >
                {isDeletingSelectedPayment ? 'Törlés...' : 'Törlés'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
