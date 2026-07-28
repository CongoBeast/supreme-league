import React from 'react';

export default function ProfileAvatar({ src, name = 'User', size = 'md', className = '' }) {
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'U';
  const sizeClass = size === 'lg' ? 'avatar-lg' : size === 'sm' ? 'avatar-sm' : '';
  if (src) return <img className={`avatar ${sizeClass} ${className}`} src={src} alt={`${name} profile`} />;
  return <span className={`avatar ${sizeClass} ${className}`} aria-label={`${name} profile placeholder`}>{initials}</span>;
}
