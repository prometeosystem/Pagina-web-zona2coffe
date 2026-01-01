import React from 'react'
import fullMenuData from '../data/fullMenu.json'

// Array de imágenes disponibles para usar como placeholders
const PLACEHOLDER_IMAGES = [
  '/assets/imagenUno.jpg', '/assets/imagenDos.jpg', '/assets/imagenTres.jpg', 
  '/assets/imagenCuatro.jpg', '/assets/imagenCinco.jpg', '/assets/imagenSeis.jpg',
  '/assets/imagenSiete.jpg', '/assets/imagenOcho.jpg', '/assets/imagenNueve.jpg', 
  '/assets/imagenDiez.jpg'
]

// Componente para renderizar un item del menú
const MenuItemCard = ({ item, imageIndex }) => {
  const placeholderImg = PLACEHOLDER_IMAGES[(item.id + imageIndex) % PLACEHOLDER_IMAGES.length]
  
  return (
    <div className="col-12 col-md-6 col-lg-4">
      <div className="card h-100 shadow-sm border-0 menu-page-card">
        <div className="menu-item-image-wrapper">
          <img 
            src={placeholderImg} 
            className="card-img-top menu-item-image" 
            alt={item.name}
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
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h5 className="card-title mb-0" style={{fontWeight: 700, color: 'var(--text)', fontSize: '1.25rem'}}>{item.name}</h5>
          </div>
          <p className="text-muted small mb-3" style={{minHeight: '48px', lineHeight: '1.6'}}>{item.desc}</p>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              {item.size ? (
                <>
                  <span className="badge menu-price-badge me-2">{item.size} ${item.price}</span>
                  <span className="badge menu-price-badge">{item.size2} ${item.price2}</span>
                </>
              ) : (
                <span className="badge menu-price-badge">
                  {item.price === "00.00" ? "Consultar precio" : `$${item.price}`}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MenuPage({ onClose }){
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
            {fullMenuData.bebidasCalientes.map((item, idx) => (
              <MenuItemCard key={item.id} item={item} imageIndex={idx} />
            ))}
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
            {fullMenuData.bebidasFrias.map((item, idx) => (
              <MenuItemCard key={item.id} item={item} imageIndex={idx + 10} />
            ))}
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
            {fullMenuData.shotsEnergia.map((item, idx) => (
              <MenuItemCard key={item.id} item={item} imageIndex={idx + 20} />
            ))}
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
            {fullMenuData.bebidasProteina.map((item, idx) => (
              <MenuItemCard key={item.id} item={item} imageIndex={idx + 30} />
            ))}
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
            {fullMenuData.menuDulce.map((item, idx) => (
              <MenuItemCard key={item.id} item={item} imageIndex={idx + 40} />
            ))}
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
            {fullMenuData.menuSalado.map((item, idx) => (
              <MenuItemCard key={item.id} item={item} imageIndex={idx + 50} />
            ))}
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
            {fullMenuData.ensaladas.map((item, idx) => (
              <MenuItemCard key={item.id} item={item} imageIndex={idx + 60} />
            ))}
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
            {fullMenuData.otros.map((item, idx) => (
              <MenuItemCard key={item.id} item={item} imageIndex={idx + 70} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
