import React from 'react'

export default function Header({ onMenuClick }){
  const handleMenuClick = (e) => {
    e.preventDefault()
    if (onMenuClick) {
      onMenuClick()
    } else {
      window.location.hash = '#menu'
    }
  }

  return (
    <header className="site-header" data-aos="fade-down">
      <nav className="navbar navbar-expand-lg navbar-light">
        <div className="container">
          <a className="navbar-brand d-flex align-items-center" href="#" onClick={(e) => { e.preventDefault(); window.location.hash = ''; window.location.reload() }}>
            <div style={{width:110,height:110,overflow:'hidden',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',marginRight:12,background:'transparent'}}>
              <img src="/assets/logo.jpeg" alt="Zona 2" className="site-logo" style={{height:90,objectFit:'contain'}} onError={(e)=>{e.currentTarget.style.display='none'}} />
            </div>
          </a>

          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto align-items-center">
              <li className="nav-item me-2">
                <a className="nav-link header-btn" href="#" onClick={(e) => { e.preventDefault(); window.location.hash = ''; window.location.reload() }}>Inicio</a>
              </li>
              <li className="nav-item me-2">
                <a className="nav-link header-btn menu-pill" href="#menu" onClick={handleMenuClick}>Menú</a>
              </li>
              <li className="nav-item me-2">
                <a className="nav-link header-btn" href="#nosotros">Nosotros</a>
              </li>
              <li className="nav-item me-2">
                <a className="nav-link header-btn" href="#ubicacion">Ubicación</a>
              </li>
              <li className="nav-item me-2">
                <a 
                  className="header-btn btn-reserve" 
                  href="https://wa.me/527771616222?text=Hola%2C%20me%20interesa%20hacer%20una%20reservaci%C3%B3n" 
                  target="_blank" 
                  rel="noopener noreferrer"
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
