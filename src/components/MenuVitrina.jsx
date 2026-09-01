import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getProducts } from '../services/api'

const formatPrice = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n || 0)

export default function MenuVitrina() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const cacheKey = 'zona2_menu_cache'
    const cached = sessionStorage.getItem(cacheKey)
    if (cached) {
      try {
        const { data, ts } = JSON.parse(cached)
        if (Date.now() - ts < 300000) { setProductos(data); setLoading(false); return }
      } catch (_) { /* ignore */ }
    }
    getProducts()
      .then((data) => {
        const activos = (Array.isArray(data) ? data : []).filter((p) => p.activo === 1)
        setProductos(activos)
        sessionStorage.setItem(cacheKey, JSON.stringify({ data: activos, ts: Date.now() }))
      })
      .catch((e) => {
        if (cached) {
          try { setProductos(JSON.parse(cached).data) } catch (_) { setError(e.message) }
        } else {
          setError(e.message)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const porCategoria = productos.reduce((acc, p) => {
    const cat = p.categoria || 'Otros'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(p)
    return acc
  }, {})

  return (
    <div className="menu-vitrina container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="display-5">Menú</h1>
        <Link to="/" className="btn btn-outline-secondary btn-sm">← Inicio</Link>
      </div>
      <p className="text-muted small mb-4"><em>* Los precios pueden cambiar sin previo aviso. Pedidos en el local.</em></p>

      {loading && <p className="text-center py-5">Cargando menú...</p>}
      {error && <p className="text-danger text-center">Error al cargar el menú.</p>}

      {Object.entries(porCategoria).map(([cat, items]) => (
        <section key={cat} className="mb-5">
          <h2 className="h4 text-success border-bottom pb-2 mb-3">{cat}</h2>
          {items.map((p) => (
            <div key={p.id_producto} className="d-flex justify-content-between py-2 border-bottom">
              <div>
                <strong>{p.nombre}</strong>
                {p.descripcion && <p className="text-muted small mb-0">{p.descripcion}</p>}
              </div>
              <span className="text-success fw-semibold ms-3">{formatPrice(p.precio)}</span>
            </div>
          ))}
        </section>
      ))}
    </div>
  )
}
