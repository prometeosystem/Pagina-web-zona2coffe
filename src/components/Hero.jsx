import React, { useEffect, useState, useRef } from 'react'

const SLIDES = [
  '/assets/imagenOcho.jpg',
  '/assets/imagenDiez.jpg',
  '/assets/imagenUno.jpg'
]

export default function Hero({ onMenuClick }){
  const [index, setIndex] = useState(0)
  const mounted = useRef(true)

  useEffect(()=>{
    mounted.current = true
    const id = setInterval(()=>{
      if(!mounted.current) return
      setIndex(i=> (i+1) % SLIDES.length)
    }, 15000)
    return ()=>{ mounted.current = false; clearInterval(id) }
  },[])

  const handleMenuClick = (e) => {
    e.preventDefault()
    if (onMenuClick) {
      onMenuClick()
    } else {
      window.location.hash = '#menu'
    }
  }

  return (
    <section className="hero">
      <div className="container">
        <div className="row align-items-stretch g-0 hero-row">
          <div className="col-lg-6 d-flex flex-column justify-content-center left-col" data-aos="fade-right">
            <h2 className="display-5">Bienvenido a Zona 2</h2>
            <p className="lead text-muted">Especialistas en recuperar tu energía con el mejor café, postres caseros y un ambiente único.</p>
            <div className="mt-4 d-flex gap-2">
              <a href="#menu" className="btn btn-lg btn-reserve" onClick={handleMenuClick}>Ver Menú</a>
              <a href="#nosotros" className="btn btn-lg menu-pill">Nosotros</a>
            </div>
          </div>
          <div className="col-lg-6 d-flex align-items-stretch right-col" data-aos="zoom-in">
          </div>
        </div>
      </div>
      <div className="hero-media">
        {SLIDES.map((src, i)=> (
          <div key={i} className={`slide ${i===index? 'active':''}`} style={{backgroundImage:`url(${src})`}} aria-hidden={i!==index}></div>
        ))}
      </div>
    </section>
  )
}
