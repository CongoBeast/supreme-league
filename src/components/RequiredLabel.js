import React from 'react';

export default function RequiredLabel({ children }) {
  return (
    <>
      {children}
      <span className="text-danger ms-1" aria-hidden="true">*</span>
      <span className="visually-hidden"> required</span>
    </>
  );
}
