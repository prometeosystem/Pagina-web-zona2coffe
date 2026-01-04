import React, { useState, useEffect } from 'react'

const categories = [
  { id: 'bebidas-calientes', name: 'Bebidas Calientes' },
  { id: 'bebidas-frias', name: 'Bebidas Frías' },
  { id: 'shots-energia', name: 'Shots de Energía' },
  { id: 'bebidas-proteina', name: 'Bebidas con Proteína' },
  { id: 'menu-dulce', name: 'Menú Dulce' },
  { id: 'menu-salado', name: 'Menú Salado' },
  { id: 'ensaladas', name: 'Ensaladas' },
  { id: 'otros', name: 'Otros' }
]

export default function FloatingMenuButton({ isCartOpen }) {
  const [isOpen, setIsOpen] = useState(false)

  // Cerrar el menú si el carrito se abre
  useEffect(() => {
    if (isCartOpen) {
      setIsOpen(false)
    }
  }, [isCartOpen])

  // Ocultar el botón si el carrito está abierto
  if (isCartOpen) {
    return null
  }

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const headerOffset = 100
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
      setIsOpen(false)
    }
  }

  return (
    <>
      <button
        className={`floating-menu-button ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menú de categorías"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12h18M3 6h18M3 18h18"/>
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="floating-menu-overlay" onClick={() => setIsOpen(false)}></div>
          <div className="floating-menu-dropdown">
            <div className="floating-menu-header">
              <h3>Categorías</h3>
              <button 
                className="floating-menu-close"
                onClick={() => setIsOpen(false)}
                aria-label="Cerrar menú"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className="floating-menu-list">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className="floating-menu-item"
                  onClick={() => scrollToSection(category.id)}
                >
                  <span className="floating-menu-bullet"></span>
                  <span className="floating-menu-text">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  )
}

