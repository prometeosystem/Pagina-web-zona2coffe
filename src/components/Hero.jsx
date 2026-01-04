import React, { useEffect, useState, useRef, useCallback } from 'react'

const SLIDES = [
  '/assets/imagenUno.jpg',
  '/assets/imagenDos.jpg',
  '/assets/imagenTres.jpg',
  '/assets/imagenCuatro.jpg',
  '/assets/imagenCinco.jpg'
]

export default function Hero({ onMenuClick }){
  const [index, setIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const mounted = useRef(true)

  const triggerTransition = useCallback(() => {
    setIsTransitioning(true)
    setTimeout(() => {
      setIsTransitioning(false)
    }, 600) // Duración de la animación
  }, [])

  const handleNext = useCallback(() => {
    triggerTransition()
    setIndex((prev) => (prev + 1) % SLIDES.length)
  }, [triggerTransition])

  const handlePrev = useCallback(() => {
    triggerTransition()
    setIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)
  }, [triggerTransition])

  const handleMenuClick = (e) => {
    e.preventDefault()
    if (onMenuClick) {
      onMenuClick()
    } else {
      window.location.hash = '#menu'
    }
  }

  useEffect(()=>{
    mounted.current = true
    const id = setInterval(()=>{
      if(!mounted.current) return
      handleNext()
    }, 5000)
    return ()=>{ mounted.current = false; clearInterval(id) }
  }, [handleNext])

  // Calcular índices para mostrar 3 imágenes (anterior, actual, siguiente)
  const getImageIndex = (offset) => {
    return (index + offset + SLIDES.length) % SLIDES.length
  }

  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content-wrapper">
          <div className="hero-text-section" data-aos="fade-down">
            <h1 className="hero-title">
              <span className="hero-title-small">Bienvenido a</span>
              <span className="hero-title-main">Zona 2</span>
            </h1>
            <p className="hero-description">Especialistas en recuperar tu energía con el mejor café, postres caseros y un ambiente único.</p>
            <div className="hero-buttons">
              <a href="#menu" className="btn btn-lg menu-category-btn" onClick={handleMenuClick}>Ver Menú</a>
              <a href="#nosotros" className="btn btn-lg menu-category-btn">Nosotros</a>
            </div>
          </div>
        </div>
      </div>
      
      <div className="hero-carousel-wrapper" data-aos="fade-up" data-aos-delay="200">
        <div className="hero-carousel">
          <button className="carousel-nav carousel-prev" onClick={handlePrev} aria-label="Imagen anterior" data-aos="fade-right" data-aos-delay="400">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          
          <div className={`carousel-images ${isTransitioning ? 'transitioning' : ''}`}>
            <div className="carousel-image carousel-image-left active" data-aos="fade-right" data-aos-delay="300">
              <img src={SLIDES[getImageIndex(-1)]} alt="Imagen anterior" key={`left-${getImageIndex(-1)}-${index}`} />
            </div>
            <div className="carousel-image carousel-image-center active" data-aos="zoom-in" data-aos-delay="400">
              <img src={SLIDES[getImageIndex(0)]} alt="Imagen principal" key={`center-${getImageIndex(0)}-${index}`} />
            </div>
            <div className="carousel-image carousel-image-right active" data-aos="fade-left" data-aos-delay="300">
              <img src={SLIDES[getImageIndex(1)]} alt="Imagen siguiente" key={`right-${getImageIndex(1)}-${index}`} />
            </div>
          </div>
          
          <button className="carousel-nav carousel-next" onClick={handleNext} aria-label="Imagen siguiente" data-aos="fade-left" data-aos-delay="400">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}
