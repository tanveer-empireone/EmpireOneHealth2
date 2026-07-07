'use client';

import { useState, useRef, useEffect } from 'react';

export default function EditableElement({ children, initialStyles = {} }) {
  const [isEditing, setIsEditing] = useState(false);
  const [styles, setStyles] = useState(initialStyles);
  const elementRef = useRef(null);

  const handleStyleChange = (property, value) => {
    setStyles(prev => ({ ...prev, [property]: value }));
    if (elementRef.current) {
      elementRef.current.style[property] = value;
    }
  };

  return (
    <div
      ref={elementRef}
      onDoubleClick={() => setIsEditing(true)}
      style={{
        ...styles,
        outline: isEditing ? '2px dashed #007bff' : 'none',
        position: 'relative',
        cursor: isEditing ? 'text' : 'pointer',
        padding: isEditing ? '4px' : '0'
      }}
    >
      {children}
      {isEditing && (
        <div style={{
          position: 'absolute',
          top: '-40px',
          left: 0,
          background: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '4px 8px',
          display: 'flex',
          gap: '4px',
          zIndex: 1000,
          minWidth: '300px'
        }}>
          {/* Color Picker */}
          <input
            type="color"
            defaultValue="#000000"
            onChange={(e) => handleStyleChange('color', e.target.value)}
            title="Text Color"
            style={{ width: '30px', cursor: 'pointer' }}
          />
          
          {/* Font Size */}
          <input
            type="number"
            min="8"
            max="72"
            defaultValue="16"
            onChange={(e) => handleStyleChange('fontSize', `${e.target.value}px`)}
            style={{ width: '50px' }}
            placeholder="Size"
          />
          
          {/* Background Color */}
          <input
            type="color"
            defaultValue="#ffffff"
            onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
            title="Background Color"
            style={{ width: '30px', cursor: 'pointer' }}
          />

          {/* Font Weight */}
          <select onChange={(e) => handleStyleChange('fontWeight', e.target.value)} style={{ width: '70px' }}>
            <option value="normal">Normal</option>
            <option value="bold">Bold</option>
            <option value="lighter">Light</option>
          </select>

          {/* Close Button */}
          <button
            onClick={() => setIsEditing(false)}
            style={{
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              padding: '2px 8px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
