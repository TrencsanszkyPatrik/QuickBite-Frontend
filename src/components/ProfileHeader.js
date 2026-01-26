import React from 'react'
import { formatDate, getInitials } from '../utils/profileHelpers'

export default function ProfileHeader({ profile }) {
  return (
    <div className="profile-header-card">
      <div className="profile-avatar-wrap">
        {profile.avatarUrl ? (
          <img src={profile.avatarUrl} alt={profile.name} className="profile-avatar" />
        ) : (
          <div className="profile-avatar-initials" aria-hidden="true">
            {getInitials(profile.name)}
          </div>
        )}
      </div>
      <div className="profile-header-info">
        <h1>{profile.name || 'Nincs megadva'}</h1>
        <p className="profile-email">{profile.email}</p>
        <p className="profile-member-since">
          <i className="bi bi-calendar3" aria-hidden="true" />
          Csatlakozott: {formatDate(profile.createdAt)}
        </p>
      </div>
    </div>
  )
}
