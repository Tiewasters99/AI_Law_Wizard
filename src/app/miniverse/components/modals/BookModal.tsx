"use client";

import React from 'react';
import { useMiniverseStore } from '../../data/store';

const BookModal: React.FC = () => {
  const { isBookModalOpen, closeBookModal } = useMiniverseStore();

  if (!isBookModalOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}
      onClick={() => closeBookModal()}
    >
      <div 
        style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          maxWidth: '400px',
          textAlign: 'center',
          fontFamily: 'Arial, sans-serif'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ margin: '0 0 1rem 0', color: '#333' }}>
          📖 Book Clicked!
        </h2>
        <p style={{ margin: '0 0 1.5rem 0', color: '#666', fontSize: '16px' }}>
          You clicked on the book. This could contain legal documents, case studies, or reference materials.
        </p>
        <button
          onClick={() => closeBookModal()}
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default BookModal;
