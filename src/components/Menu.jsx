import React from 'react'

export default function Menu({items=[]}){
  // Función para calcular precio con descuento (20% de descuento)
  const getDiscountPrice = (price) => {
    const numericPrice = parseFloat(price.replace('$', ''))
    const discountPrice = numericPrice * 0.8
    return `$${discountPrice.toFixed(0)}`
  }

  return (
    <section id="promociones" className="menu py-5">
      <div className="container">
        <h3 className="mb-5" data-aos="fade-up" style={{fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, textAlign: 'center', letterSpacing: '-0.02em'}}>Promociones</h3>
        <div className="row g-3">
          {items.map((item, idx)=> {
            const images = [
              '/assets/imagenUno.jpg','/assets/imagenDos.jpg','/assets/imagenTres.jpg','/assets/imagenCuatro.jpg','/assets/imagenCinco.jpg',
              '/assets/imagenSeis.jpg','/assets/imagenSiete.jpg','/assets/imagenOcho.jpg','/assets/imagenNueve.jpg','/assets/imagenDiez.jpg'
            ]
            const img = item.image || images[idx % images.length]
            const discountPrice = getDiscountPrice(item.price)
            return (
              <div className="col-sm-6 col-md-4" key={item.id} data-aos="fade-up" data-aos-delay={idx*80}>
                <div className="card h-100 shadow-sm">
                  <img src={img} className="card-img-top" alt={item.name} style={{height:180,objectFit:'cover'}} />
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{item.name}</h5>
                    <p className="card-text text-muted small">{item.desc}</p>
                    <div className="mt-auto d-flex align-items-center gap-2">
                      <span className="text-decoration-line-through text-muted" style={{fontSize: '0.9rem'}}>{item.price}</span>
                      <strong className="text-dark" style={{fontSize: '1.2rem', color: 'var(--matcha-600)'}}>{discountPrice}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
