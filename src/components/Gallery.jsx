import React, { useEffect, useRef } from 'react'

// Gallery items: type can be 'image' or 'video'. Add or remove items as needed.
const ITEMS = [
  {type: 'image', src: '/assets/imagenUno.jpg', alt: 'Imagen 1'},
  {type: 'image', src: '/assets/imagenDos.jpg', alt: 'Imagen 2'},
  {type: 'image', src: '/assets/imagenTres.jpg', alt: 'Imagen 3'},
  {type: 'image', src: '/assets/imagenOcho.jpg', alt: 'Imagen 4'},
  {type: 'image', src: '/assets/imagenDiez.jpg', alt: 'Imagen 5'}
]

export default function Gallery(){
  // Map address to show marker (C. Ceres 109, Delicias, 62330 Cuernavaca, Mor.)
  const MAP_ADDRESS = 'C. Ceres 109, Delicias, 62330 Cuernavaca, Mor.'
  const carouselRef = useRef(null)

  useEffect(()=>{
    // Ensure bootstrap JS is available on window
    const bs = window.bootstrap
    if(!bs) return
    const el = carouselRef.current
    if(!el) return
    // initialize carousel programmatically to ensure interval is applied
    const carousel = new bs.Carousel(el, { interval: 20000, ride: 'carousel', pause: false })
    return ()=>{
      try{ carousel.dispose() }catch(e){}
    }
  }, [])

  return (
    <>
      <section id="nosotros" className="gallery py-5">
        <div className="container">
          <h3 className="mb-5" data-aos="fade-up" style={{fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, textAlign: 'center', letterSpacing: '-0.02em'}}>Nosotros</h3>

          <div className="row g-5 align-items-center">
            <div className="col-12 col-lg-6">
              {/* Bootstrap carousel that cycles every 20s (20000 ms) */}
              <div id="galleryCarousel" ref={el => carouselRef.current = el} className="carousel slide" data-bs-ride="carousel" data-bs-interval="20000">
                <div className="carousel-inner">
                  {ITEMS.map((it, i)=> (
                    <div key={i} className={`carousel-item ${i===0? 'active':''}`} data-bs-interval="20000">
                      <img src={it.src} className="d-block w-100 gallery-img" alt={it.alt} />
                    </div>
                  ))}
                </div>

                <button className="carousel-control-prev" type="button" data-bs-target="#galleryCarousel" data-bs-slide="prev">
                  <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                  <span className="visually-hidden">Previous</span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#galleryCarousel" data-bs-slide="next">
                  <span className="carousel-control-next-icon" aria-hidden="true"></span>
                  <span className="visually-hidden">Next</span>
                </button>
              </div>
            </div>

            <div className="col-12 col-lg-6" data-aos="fade-left">
              <div className="px-4 py-3">
                <h4 style={{fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text)', letterSpacing: '-0.02em'}}>Sobre nosotros</h4>
                <p style={{color: 'var(--text-light)', lineHeight: '1.8', marginBottom: '1.5rem', fontSize: '1.125rem', textAlign: 'justify'}}>
                  Zona 2 no es solo café.
                </p>
                <p style={{color: 'var(--text-light)', lineHeight: '1.8', marginBottom: '1.5rem', fontSize: '1.125rem', textAlign: 'justify'}}>
                  Es un espacio creado para recuperar energía, optimizar el rendimiento y volver al ritmo que te mueve.
                </p>
                <p style={{color: 'var(--text-light)', lineHeight: '1.8', marginBottom: '1.5rem', fontSize: '1.125rem', textAlign: 'justify'}}>
                  En el running, la zona 2 es donde el cuerpo aprende a sostener, recuperar y construir energía. Ese principio es el que vive aquí. Creemos en los rituales que suman: café bien preparado, comida que nutre y un entorno que te permite bajar el ritmo para volver más fuerte.
                </p>
                <p style={{color: 'var(--text-light)', lineHeight: '1.8', marginBottom: '1.5rem', fontSize: '1.125rem', textAlign: 'justify'}}>
                  Nuestra cocina y bebidas están pensadas para acompañar el esfuerzo: opciones que te inyectan energía, te ayudan a reponer lo gastado y favorecen la recuperación, ya sea antes, durante o después del entrenamiento —o de un día intenso.
                </p>
                <p style={{color: 'var(--text-light)', lineHeight: '1.8', marginBottom: '1.5rem', fontSize: '1.125rem', textAlign: 'justify'}}>
                  Zona 2 es comunidad, constancia y equilibrio.
                </p>
                <p style={{color: 'var(--text-light)', lineHeight: '1.8', marginBottom: 0, fontSize: '1.125rem', textAlign: 'justify'}}>
                  El punto donde el cuerpo se recupera, la mente se ordena y el movimiento continúa.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-5 bg-light">
        <div className="container">
          <h3 className="mb-5" data-aos="fade-up" style={{fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, textAlign: 'center', letterSpacing: '-0.02em'}}>Testimonios</h3>
          <div className="row g-4">
            {[
              {name:'Ana Torres', text:'Excelente café y atención. Volveré pronto.'},
              {name:'Carlos Méndez', text:'Los postres son espectaculares, ambiente muy agradable.'},
              {name:'Lucía Ramos', text:'Recomendado para trabajar y relajarse.'}
            ].map((t,i)=> (
              <div className="col-12 col-md-4" key={i} data-aos="fade-up" data-aos-delay={i*80}>
                <div className="card h-100 shadow-sm">
                  <div className="card-body d-flex flex-column">
                    <p className="mb-4 flex-grow-1">“{t.text}”</p>
                    <div className="d-flex align-items-center">
                      <div className="me-3 rounded-circle bg-secondary" style={{width:48,height:48}}></div>
                      <div>
                        <strong>{t.name}</strong>
                        <div className="text-muted small">Cliente</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map section: replace MAP_COORDS with las coordenadas reales cuando las proveas */}
      <section id="location" className="py-5">
        <div className="container">
          <h3 className="mb-5" data-aos="fade-up" style={{fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, textAlign: 'center', letterSpacing: '-0.02em'}}>Ubicación</h3>
          <div className="ratio ratio-16x9 rounded shadow-sm overflow-hidden">
            <iframe
              title="mapa-ubicacion"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(MAP_ADDRESS)}&z=16&output=embed`}
              style={{border:0}}
              allowFullScreen
              loading="lazy"
            />
          </div>
          
        </div>
      </section>
    </>
  )
}
