import React from 'react'

export default function Header({ onMenuClick }){
  const MAP_ADDRESS = 'C. Ceres 109, Delicias, 62330 Cuernavaca, Mor.'
  
  // Función para cerrar el menú hamburguesa
  const closeNavbar = () => {
    const navbarCollapse = document.getElementById('navbarNav')
    if (navbarCollapse) {
      // Remover la clase 'show' directamente
      navbarCollapse.classList.remove('show')
      
      // Cerrar usando Bootstrap si está disponible
      if (window.bootstrap) {
        const bsCollapse = window.bootstrap.Collapse.getInstance(navbarCollapse)
        if (bsCollapse && !bsCollapse._isTransitioning) {
          bsCollapse.hide()
        }
      }
      
      // Actualizar el botón del toggler
      const toggler = document.querySelector('.navbar-toggler')
      if (toggler) {
        toggler.setAttribute('aria-expanded', 'false')
        toggler.classList.add('collapsed')
      }
    }
  }
  
  const handleMenuClick = (e) => {
    e.preventDefault()
    closeNavbar()
    if (onMenuClick) {
      onMenuClick()
    } else {
      window.location.hash = '#menu'
    }
  }

  const handleLocationClick = (e) => {
    e.preventDefault()
    closeNavbar()
    
    // Detectar si es iOS (iPhone, iPad, iPod)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
    
    if (isIOS) {
      // Abrir Apple Maps en iOS
      const appleMapsUrl = `http://maps.apple.com/?q=${encodeURIComponent(MAP_ADDRESS)}`
      window.open(appleMapsUrl, '_blank')
    } else {
      // Abrir Google Maps en otros dispositivos
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(MAP_ADDRESS)}`
      window.open(googleMapsUrl, '_blank')
    }
  }

  const handleInicioClick = (e) => {
    e.preventDefault()
    closeNavbar()
    window.location.hash = ''
    window.location.reload()
  }

  const handleNosotrosClick = (e) => {
    e.preventDefault()
    closeNavbar()
    // Scroll suave a la sección nosotros
    const element = document.getElementById('nosotros')
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

  return (
    <header className="site-header" data-aos="fade-down">
      <nav className="navbar navbar-expand-lg navbar-light">
        <div className="container">
          <a className="navbar-brand d-flex align-items-center" href="#" onClick={(e) => { e.preventDefault(); closeNavbar(); window.location.hash = ''; window.location.reload() }}>
            <div className="navbar-brand-wrapper">
              <img src="/assets/logo.jpeg" alt="Zona 2" className="site-logo" onError={(e)=>{e.currentTarget.style.display='none'}} />
            </div>
          </a>

          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto align-items-center">
              <li className="nav-item me-2">
                <a className="nav-link header-btn" href="#" onClick={handleInicioClick}>Inicio</a>
              </li>
              <li className="nav-item me-2">
                <a className="nav-link header-btn menu-pill" href="#menu" onClick={handleMenuClick}>Menú</a>
              </li>
              
              <li className="nav-item me-2">
                <a className="nav-link header-btn" href="#ubicacion" onClick={handleLocationClick}>Ubicación</a>
              </li>
              <li className="nav-item me-2">
                <a 
                  className="header-btn btn-reserve" 
                  href="https://wa.me/527771616222?text=Hola%2C%20me%20interesa%20hacer%20una%20reservaci%C3%B3n" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={closeNavbar}
                >
                  Reservar
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  )
}
