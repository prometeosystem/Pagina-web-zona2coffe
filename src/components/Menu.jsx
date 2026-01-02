import React from 'react'
import { useProducts } from '../hooks/useProducts'
import menuDataFallback from '../data/menu.json'

export default function Menu({items=[]}){
  const { products, loading } = useProducts()
  
  // Usar productos del backend si están disponibles, sino usar items prop o fallback
  const menuItems = items.length > 0 
    ? items 
    : (!loading && products.length > 0) 
      ? products.slice(0, 3) // Mostrar primeros 3 productos como promociones
      : menuDataFallback

  // Función para calcular precio con descuento (20% de descuento)
  const getDiscountPrice = (price) => {
    // Manejar tanto formato string como numérico
    let numericPrice
    if (typeof price === 'string') {
      numericPrice = parseFloat(price.replace('$', '').replace(',', '').trim())
    } else {
      numericPrice = parseFloat(price || 0)
    }
    const discountPrice = numericPrice * 0.8
    return `$${discountPrice.toFixed(0)}`
  }
  
  // Función para obtener el precio formateado
  const getFormattedPrice = (item) => {
    if (typeof item.price === 'string') {
      return item.price
    }
    if (typeof item.precio === 'number') {
      return `$${item.precio.toFixed(2)}`
    }
    return item.price || `$${parseFloat(item.precio || 0).toFixed(2)}`
  }

  return (
    <section id="promociones" className="menu py-5">
      <div className="container">
        <h3 className="mb-5" data-aos="fade-up" style={{fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, textAlign: 'center', letterSpacing: '-0.02em'}}>Promociones</h3>
        <div className="row g-3">
          {loading ? (
            <div className="col-12 text-center py-5">
              <div className="spinner-border text-matcha-600" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : (
            menuItems.map((item, idx)=> {
              const images = [
                '/assets/imagenUno.jpg','/assets/imagenDos.jpg','/assets/imagenTres.jpg','/assets/imagenCuatro.jpg','/assets/imagenCinco.jpg',
                '/assets/imagenSeis.jpg','/assets/imagenSiete.jpg','/assets/imagenOcho.jpg','/assets/imagenNueve.jpg','/assets/imagenDiez.jpg'
              ]
              const img = item.image || images[idx % images.length]
              const originalPrice = getFormattedPrice(item)
              const discountPrice = getDiscountPrice(item.price || item.precio)
              return (
                <div className="col-sm-6 col-md-4" key={item.id || item.id_producto} data-aos="fade-up" data-aos-delay={idx*80}>
                  <div className="card h-100 shadow-sm">
                    <img src={img} className="card-img-top" alt={item.name || item.nombre} style={{height:180,objectFit:'cover'}} />
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title">{item.name || item.nombre}</h5>
                      <p className="card-text text-muted small">{item.desc || item.descripcion}</p>
                      <div className="mt-auto d-flex align-items-center gap-2">
                        <span className="text-decoration-line-through text-muted" style={{fontSize: '0.9rem'}}>{originalPrice}</span>
                        <strong className="text-dark" style={{fontSize: '1.2rem', color: 'var(--matcha-600)'}}>{discountPrice}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </section>
  )
}
