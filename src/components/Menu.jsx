import React from 'react'
import { useProducts } from '../hooks/useProducts'

export default function Menu(){
  const { products, loading } = useProducts()
  
  // Usar productos del backend únicamente
  const menuItems = (!loading && products.length > 0) 
    ? products.slice(0, 3) // Mostrar primeros 3 productos como promociones
    : []

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
          ) : menuItems.length > 0 ? (
            menuItems.map((item, idx)=> {
              // Solo usar imagen del backend si existe (puede venir como imagen_url base64 o como URL del endpoint)
              const backendImage = item.image || item.imagen || item.image_url || item.url_imagen || null
              const originalPrice = getFormattedPrice(item)
              const discountPrice = getDiscountPrice(item.price || item.precio)
              return (
                <div className="col-sm-6 col-md-4" key={item.id || item.id_producto} data-aos="fade-up" data-aos-delay={idx*80}>
                  <div className="card h-100 shadow-sm">
                    {backendImage && (
                      <img 
                        src={backendImage} 
                        className="card-img-top" 
                        alt={item.name || item.nombre} 
                        style={{height:180,objectFit:'cover'}}
                        onError={(e) => {
                          // Si la imagen falla al cargar, ocultarla completamente
                          e.target.style.display = 'none'
                        }}
                      />
                    )}
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
          ) : (
            <div className="col-12 text-center py-5">
              <p className="text-muted">No hay promociones disponibles en este momento</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
