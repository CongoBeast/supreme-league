import React, { useEffect, useState } from 'react';

export default function ProfileAvatar({
  src,
  name = 'User',
  size = 'md',
  className = '',
  onImageError,
}) {
  const [failed, setFailed] = useState(false);
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'U';
  const sizeClass = size === 'lg' ? 'avatar-lg' : size === 'sm' ? 'avatar-sm' : '';

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (src && !failed) {
    return (
      <img
        className={`avatar ${sizeClass} ${className}`}
        src={src}
        alt={`${name} profile`}
        loading="lazy"
        decoding="async"
        onError={() => {
          setFailed(true);
          onImageError?.();
        }}
      />
    );
  }

  return (
    <span
      className={`avatar ${sizeClass} ${className}`}
      aria-label={`${name} profile placeholder`}
    >
      {initials}
    </span>
  );
}
