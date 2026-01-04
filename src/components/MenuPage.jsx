import React, { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { useProductsByCategory } from '../hooks/useProducts'
import FloatingCartButton from './FloatingCartButton'
import FloatingMenuButton from './FloatingMenuButton'
import fullMenuData from '../data/fullMenu.json' // Fallback si falla la carga del backend

// Array de imágenes disponibles para usar como placeholders
const PLACEHOLDER_IMAGES = [
  '/assets/imagenUno.jpg', '/assets/imagenDos.jpg', '/assets/imagenTres.jpg', 
  '/assets/imagenCuatro.jpg', '/assets/imagenCinco.jpg', '/assets/imagenSeis.jpg',
  '/assets/imagenSiete.jpg', '/assets/imagenOcho.jpg', '/assets/imagenNueve.jpg', 
  '/assets/imagenDiez.jpg'
]

// Componente para renderizar un item del menú
const MenuItemCard = ({ item, imageIndex }) => {
  // Usar imagen del backend si existe, sino usar imagen por defecto
  const productId = item.id || item.id_producto || 0
  const backendImage = item.image || item.imagen || item.image_url || item.url_imagen || null
  const placeholderImg = backendImage || PLACEHOLDER_IMAGES[(productId + imageIndex) % PLACEHOLDER_IMAGES.length]
  const { addToCart } = useCart()
  const [selectedSize, setSelectedSize] = useState(null)
  const [showSizeSelector, setShowSizeSelector] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)

  const handleAddToCart = async () => {
    // Si ya está procesando, no hacer nada
    if (addingToCart) return

    // Si el producto tiene tamaños, mostrar selector
    if (item.size && !selectedSize) {
      setShowSizeSelector(true)
      return
    }

    // Si el precio es "00.00" o 0, no permitir agregar
    const precio = parseFloat(item.price || item.precio || 0)
    if (precio === 0 || item.price === "00.00") {
      alert('Por favor consulta el precio antes de agregar este producto')
      return
    }

    setAddingToCart(true)
    try {
      const success = await addToCart(item, selectedSize || null, 1)
      
      if (success) {
        setShowSizeSelector(false)
        setSelectedSize(null)
        // Mostrar feedback visual
        const button = document.querySelector(`[data-item-id="${item.id || item.id_producto}"]`)
        if (button) {
          button.classList.add('added-to-cart')
          setTimeout(() => {
            button.classList.remove('added-to-cart')
          }, 1000)
        }
      }
    } catch (error) {
      console.error('Error agregando al carrito:', error)
    } finally {
      setAddingToCart(false)
    }
  }

  const handleSizeSelect = (size) => {
    setSelectedSize(size)
    setShowSizeSelector(false)
    handleAddToCart()
  }
  
  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (showImageModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [showImageModal])
  
  return (
    <div className="col-12 col-md-6 col-lg-4">
      <div className="card h-100 shadow-sm border-0 menu-page-card">
        <div className="menu-item-image-wrapper" style={{cursor: 'pointer'}} onClick={() => setShowImageModal(true)}>
          <img 
            src={placeholderImg} 
            className="card-img-top menu-item-image" 
            alt={item.name || item.nombre}
            onError={(e) => {
              // Si la imagen falla, mostrar placeholder SVG
              e.target.style.display = 'none'
              const placeholder = e.target.nextElementSibling
              if (placeholder) placeholder.style.display = 'flex'
            }}
          />
          <div className="menu-item-placeholder" style={{display: 'none'}}>
            <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="100" height="100" fill="#f1f5f1"/>
              <path d="M50 35L40 45H45V65H55V45H60L50 35Z" fill="#2d5a27" opacity="0.3"/>
              <circle cx="50" cy="50" r="20" stroke="#2d5a27" strokeWidth="2" fill="none" opacity="0.3"/>
            </svg>
          </div>
        </div>
        
        {/* Modal de imagen */}
        {showImageModal && (
          <div 
            className="menu-image-modal-overlay"
            onClick={(e) => {
              if (e.target.classList.contains('menu-image-modal-overlay')) {
                setShowImageModal(false)
              }
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.9)',
              zIndex: 1100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}
          >
            <div 
              className="menu-image-modal-content"
              style={{
                position: 'relative',
                maxWidth: '90vw',
                maxHeight: '90vh',
                width: 'auto',
                height: 'auto'
              }}
            >
              <button
                onClick={() => setShowImageModal(false)}
                style={{
                  position: 'absolute',
                  top: '-40px',
                  right: '0',
                  background: 'rgba(255, 255, 255, 0.9)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  color: '#333',
                  fontWeight: 'bold',
                  zIndex: 1101,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#fff'
                  e.target.style.transform = 'scale(1.1)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.9)'
                  e.target.style.transform = 'scale(1)'
                }}
              >
                ✕
              </button>
              <img 
                src={placeholderImg} 
                alt={item.name || item.nombre}
                style={{
                  maxWidth: '100%',
                  maxHeight: '90vh',
                  width: 'auto',
                  height: 'auto',
                  borderRadius: '8px',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
                  objectFit: 'contain'
                }}
              />
            </div>
          </div>
        )}
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h5 className="card-title mb-0" style={{fontWeight: 700, color: 'var(--text)', fontSize: '1.25rem'}}>{item.name || item.nombre}</h5>
          </div>
          <p className="text-muted small mb-3" style={{minHeight: '48px', lineHeight: '1.6'}}>{item.desc || item.descripcion}</p>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div>
              {item.size || item.tamaño ? (
                <>
                  <span className="badge menu-price-badge me-2">{item.size || item.tamaño} ${item.price || item.precio?.toFixed(2)}</span>
                  {item.size2 && <span className="badge menu-price-badge">{item.size2} ${item.price2 || item.precio2?.toFixed(2)}</span>}
                </>
              ) : (
                <span className="badge menu-price-badge">
                  {item.price === "00.00" || parseFloat(item.price || item.precio || 0) === 0 ? "Consultar precio" : `$${item.price || item.precio?.toFixed(2)}`}
                </span>
              )}
            </div>
          </div>
          
          {/* Botón agregar al carrito */}
          {item.price !== "00.00" && (
            <div className="position-relative">
              {showSizeSelector && item.size ? (
                <div className="size-selector d-flex gap-2">
                  <button
                    className="btn btn-sm btn-outline-primary flex-fill"
                    onClick={() => handleSizeSelect('M')}
                    disabled={addingToCart}
                  >
                    {item.size} ${item.price}
                  </button>
                  {item.size2 && (
                    <button
                      className="btn btn-sm btn-outline-primary flex-fill"
                      onClick={() => handleSizeSelect('G')}
                      disabled={addingToCart}
                    >
                      {item.size2} ${item.price2}
                    </button>
                  )}
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setShowSizeSelector(false)}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  data-item-id={item.id || item.id_producto}
                  className="btn btn-add-to-cart w-100"
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                >
                  {addingToCart ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Agregando...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: '8px'}}>
                        <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" fill="currentColor"/>
                      </svg>
                      Agregar al carrito
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function MenuPage({ onClose, onCartClick, isCartOpen }){
  const { productsByCategory, loading, error } = useProductsByCategory()
  
  // Usar productos del backend si están disponibles y hay productos, sino usar fallback del JSON
  const hasBackendProducts = !loading && !error && Object.values(productsByCategory).some(cat => cat.length > 0)
  const menuData = hasBackendProducts ? productsByCategory : fullMenuData

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
    }
  }

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

  return (
    <div className="menu-page">
      <div className="container py-5">
        {/* Header sin botón volver */}
        <div className="text-center mb-5">
          <h1 className="display-4 menu-page-title" style={{fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 800, marginBottom: '1rem', background: 'linear-gradient(135deg, var(--matcha-600), var(--coffee-600))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>
            Menú Completo
          </h1>
          <p className="lead text-muted" style={{fontSize: '1.125rem'}}>Descubre nuestra variedad de sabores</p>
        </div>

        {/* Botones de navegación rápida */}
        <div className="menu-categories-nav mb-5" data-aos="fade-up">
          <div className="menu-categories-wrapper">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => scrollToSection(category.id)}
                className="btn menu-category-btn"
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Bebidas Calientes */}
        <section id="bebidas-calientes" className="mb-5 menu-section" data-aos="fade-up">
          <div className="section-header-wrapper mb-4">
            <h2 className="menu-section-title">
              Bebidas Calientes
            </h2>
          </div>
          <div className="row g-4">
            {loading ? (
              <div className="col-12 text-center py-5">
                <div className="spinner-border" style={{color: 'var(--matcha-600)'}} role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
              </div>
            ) : menuData.bebidasCalientes && menuData.bebidasCalientes.length > 0 ? (
              menuData.bebidasCalientes.map((item, idx) => (
                <MenuItemCard key={item.id || item.id_producto} item={item} imageIndex={idx} />
              ))
            ) : (
              !loading && <div className="col-12 text-center text-muted py-3">No hay productos disponibles</div>
            )}
          </div>
        </section>

        {/* Bebidas Frías */}
        <section id="bebidas-frias" className="mb-5 menu-section" data-aos="fade-up">
          <div className="section-header-wrapper mb-4">
            <h2 className="menu-section-title">
              Bebidas Frías
            </h2>
          </div>
          <div className="row g-4">
            {menuData.bebidasFrias && menuData.bebidasFrias.length > 0 ? (
              menuData.bebidasFrias.map((item, idx) => (
                <MenuItemCard key={item.id || item.id_producto} item={item} imageIndex={idx + 10} />
              ))
            ) : null}
          </div>
        </section>

        {/* Shots de Energía */}
        <section id="shots-energia" className="mb-5 menu-section" data-aos="fade-up">
          <div className="section-header-wrapper mb-4">
            <h2 className="menu-section-title">
              Empieza y termina tu entrenamiento con un shot de energía
            </h2>
          </div>
          <div className="row g-4">
            {menuData.shotsEnergia && menuData.shotsEnergia.length > 0 ? (
              menuData.shotsEnergia.map((item, idx) => (
                <MenuItemCard key={item.id || item.id_producto} item={item} imageIndex={idx + 20} />
              ))
            ) : null}
          </div>
        </section>

        {/* Bebidas con Proteína */}
        <section id="bebidas-proteina" className="mb-5 menu-section" data-aos="fade-up">
          <div className="section-header-wrapper mb-4">
            <h2 className="menu-section-title">
              Elige tu bebida con scoop de proteína ó creatina
            </h2>
          </div>
          <div className="row g-4">
            {menuData.bebidasProteina && menuData.bebidasProteina.length > 0 ? (
              menuData.bebidasProteina.map((item, idx) => (
                <MenuItemCard key={item.id || item.id_producto} item={item} imageIndex={idx + 30} />
              ))
            ) : null}
          </div>
        </section>

        {/* Menú Dulce */}
        <section id="menu-dulce" className="mb-5 menu-section" data-aos="fade-up">
          <div className="section-header-wrapper mb-4">
            <h2 className="menu-section-title">
              Menú Dulce
            </h2>
          </div>
          <p className="text-muted mb-4 small fst-italic" style={{paddingLeft: '1rem', borderLeft: '3px solid var(--matcha-300)'}}>
            SANDOS JAPONESES DE PAN BLANCO SIN ORILLAS, RELLENOS DE CREMA PASTELERA Y TOPPINGS DE TU GUSTO
          </p>
          <div className="row g-4">
            {menuData.menuDulce && menuData.menuDulce.length > 0 ? (
              menuData.menuDulce.map((item, idx) => (
                <MenuItemCard key={item.id || item.id_producto} item={item} imageIndex={idx + 40} />
              ))
            ) : null}
          </div>
        </section>

        {/* Menú Salado */}
        <section id="menu-salado" className="mb-5 menu-section" data-aos="fade-up">
          <div className="section-header-wrapper mb-4">
            <h2 className="menu-section-title">
              Menú Salado
            </h2>
          </div>
          <p className="text-muted mb-4 small fst-italic" style={{paddingLeft: '1rem', borderLeft: '3px solid var(--matcha-300)'}}>
            SANDOS JAPONESES DE PAN BLANCO SIN ORILLAS, RELLENOS DE MAYONESA, LECHUGA Y TOPPINGS DE TU GUSTO
          </p>
          <div className="row g-4">
            {menuData.menuSalado && menuData.menuSalado.length > 0 ? (
              menuData.menuSalado.map((item, idx) => (
                <MenuItemCard key={item.id || item.id_producto} item={item} imageIndex={idx + 50} />
              ))
            ) : null}
          </div>
        </section>

        {/* Ensaladas */}
        <section id="ensaladas" className="mb-5 menu-section" data-aos="fade-up">
          <div className="section-header-wrapper mb-4">
            <h2 className="menu-section-title">
              Ensaladas
            </h2>
          </div>
          <p className="text-muted mb-4 small fst-italic" style={{paddingLeft: '1rem', borderLeft: '3px solid var(--matcha-300)'}}>
            Bowl a base de lechuga italiana, espinaca, zanahoria, betabel y topping a elegir.
          </p>
          <div className="row g-4">
            {menuData.ensaladas && menuData.ensaladas.length > 0 ? (
              menuData.ensaladas.map((item, idx) => (
                <MenuItemCard key={item.id || item.id_producto} item={item} imageIndex={idx + 60} />
              ))
            ) : null}
          </div>
        </section>

        {/* Otros */}
        <section id="otros" className="mb-5 menu-section" data-aos="fade-up">
          <div className="section-header-wrapper mb-4">
            <h2 className="menu-section-title">
              Otros
            </h2>
          </div>
          <div className="row g-4">
            {menuData.otros && menuData.otros.length > 0 ? (
              menuData.otros.map((item, idx) => (
                <MenuItemCard key={item.id || item.id_producto} item={item} imageIndex={idx + 70} />
              ))
            ) : null}
          </div>
        </section>
      </div>
      {/* Botón flotante del carrito */}
      <FloatingCartButton onClick={onCartClick} isCartOpen={isCartOpen} />
      {/* Botón flotante del menú de categorías */}
      <FloatingMenuButton isCartOpen={isCartOpen} />
    </div>
  )
}
