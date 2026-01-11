import React, { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { useProductsByCategory } from '../hooks/useProducts'
import FloatingCartButton from './FloatingCartButton'
import FloatingMenuButton from './FloatingMenuButton'

// Función para extraer el nombre base del producto (sin tamaño)
const getBaseName = (name) => {
  if (!name) return ''
  // Remover patrones como " (M)", " (G)", " (S)", etc.
  return name.replace(/\s*\([MGS]\)\s*$/i, '').trim()
}

// Función para extraer el tamaño del nombre del producto
const getSizeFromName = (name) => {
  if (!name) return null
  const match = name.match(/\(([MGS])\)$/i)
  return match ? match[1].toUpperCase() : null
}

// Función para agrupar productos por nombre base
const groupProductsByName = (products) => {
  const grouped = new Map()
  
  products.forEach(product => {
    const baseName = getBaseName(product.name || product.nombre)
    const sizeFromName = getSizeFromName(product.name || product.nombre)
    
    // Verificar si el producto tiene tamaños en campos separados (size, size2)
    const hasSizeFields = product.size || product.size2 || product.tamaño || product.tamaño2
    
    if (!grouped.has(baseName)) {
      grouped.set(baseName, {
        baseName: baseName,
        sizes: {},
        description: product.desc || product.descripcion || '',
        image: product.image || product.imagen || product.image_url || product.url_imagen || null,
        categoria: product.categoria || null,
        id: product.id || product.id_producto || 0
      })
    }
    
    const group = grouped.get(baseName)
    
    // PRIORIDAD 1: Si el producto tiene tamaños en campos separados (size, size2)
    // Esto es para productos que vienen del JSON local o backend con ambos tamaños en un solo objeto
    if (hasSizeFields && !sizeFromName) {
      // Agregar tamaño M si existe
      if (product.size || product.tamaño) {
        const price = typeof product.price === 'string' 
          ? parseFloat(product.price.replace('$', '').replace(',', '').trim()) 
          : parseFloat(product.price || product.precio || 0)
        const sizeLabel = (product.size || product.tamaño).toUpperCase()
        if (price > 0) {
          group.sizes[sizeLabel] = {
            id: product.id || product.id_producto || 0,
            price: price,
            priceFormatted: price % 1 === 0 ? price.toFixed(0) : price.toFixed(2),
            originalProduct: product
          }
        }
      }
      
      // Agregar tamaño G si existe
      if (product.size2 || product.tamaño2) {
        const price2 = typeof product.price2 === 'string'
          ? parseFloat(product.price2.replace('$', '').replace(',', '').trim())
          : parseFloat(product.price2 || product.precio2 || 0)
        const size2Label = (product.size2 || product.tamaño2).toUpperCase()
        if (price2 > 0) {
          group.sizes[size2Label] = {
            id: product.id || product.id_producto || 0,
            price: price2,
            priceFormatted: price2 % 1 === 0 ? price2.toFixed(0) : price2.toFixed(2),
            originalProduct: product
          }
        }
      }
    } else if (sizeFromName) {
      // PRIORIDAD 2: Si el producto tiene tamaño en el nombre (ej: "Americano (M)")
      // Esto agrupa productos que vienen como entradas separadas del backend
      const price = typeof product.price === 'string'
        ? parseFloat(product.price.replace('$', '').replace(',', '').trim())
        : parseFloat(product.price || product.precio || 0)
      if (price > 0) {
        group.sizes[sizeFromName] = {
          id: product.id || product.id_producto || 0,
          price: price,
          priceFormatted: price % 1 === 0 ? price.toFixed(0) : price.toFixed(2),
          originalProduct: product
        }
      }
    } else {
      // PRIORIDAD 3: Si no tiene tamaño, usar como producto único
      const price = typeof product.price === 'string'
        ? parseFloat(product.price.replace('$', '').replace(',', '').trim())
        : parseFloat(product.price || product.precio || 0)
      if (Object.keys(group.sizes).length === 0 && price > 0) {
        // Si no hay tamaños, usar este como único producto
        group.sizes['UNICO'] = {
          id: product.id || product.id_producto || 0,
          price: price,
          priceFormatted: price % 1 === 0 ? price.toFixed(0) : price.toFixed(2),
          originalProduct: product
        }
      }
    }
    
    // Actualizar imagen si esta tiene una y la anterior no
    if (!group.image && (product.image || product.imagen || product.image_url || product.url_imagen)) {
      group.image = product.image || product.imagen || product.image_url || product.url_imagen
    }
    
    // Actualizar descripción si la nueva es más completa
    if (!group.description && (product.desc || product.descripcion)) {
      group.description = product.desc || product.descripcion
    }
  })
  
  return Array.from(grouped.values())
}

// Componente para renderizar un item del menú (ahora agrupado)
const MenuItemCard = ({ item, imageIndex, expandedImageId, onImageExpand }) => {
  // item ahora es un objeto agrupado con baseName, sizes, description, image
  const productId = item.id || 0
  const backendImage = item.image
  const { addToCart } = useCart()
  const [imageError, setImageError] = useState(false)
  const [selectedSize, setSelectedSize] = useState(null)
  const [addingToCart, setAddingToCart] = useState(false)
  const [tipoPreparacion, setTipoPreparacion] = useState(null) // 'heladas' o 'frapeadas'
  const [precioUnicoSeleccionado, setPrecioUnicoSeleccionado] = useState(false) // Para productos con un solo precio
  const [tipoLeche, setTipoLeche] = useState('entera') // 'entera', 'deslactosada', 'almendras'
  const [extrasSeleccionados, setExtrasSeleccionados] = useState([]) // Array de IDs de extras
  const [tipoProteina, setTipoProteina] = useState(null) // 'proteina' o 'creatina'
  
  // Obtener los tamaños disponibles, ordenados (M primero, luego G) - DEBE IR ANTES DE USAR sizes
  const sizes = Object.keys(item.sizes || {}).sort((a, b) => {
    const order = { 'M': 1, 'G': 2, 'S': 0, 'UNICO': 3 }
    return (order[a] || 99) - (order[b] || 99)
  })
  const hasMultipleSizes = sizes.length > 1 && sizes[0] !== 'UNICO'
  
  // Obtener el producto original del primer tamaño para verificar propiedades
  const originalProduct = sizes.length > 0 && item.sizes && item.sizes[sizes[0]] 
    ? item.sizes[sizes[0]].originalProduct 
    : null
  
  // Verificar si el producto lleva leche
  const llevaLeche = originalProduct && (
    Boolean(originalProduct.lleva_leche === true || originalProduct.lleva_leche === 1) ||
    Boolean(originalProduct.lleva_leche === "1")
  )
  
  // Verificar si el producto lleva extras
  const llevaExtras = originalProduct && (
    Boolean(originalProduct.lleva_extras === true || originalProduct.lleva_extras === 1) ||
    Boolean(originalProduct.lleva_extras === "1")
  )
  
  // Verificar si el producto lleva proteína
  const llevaProteina = originalProduct && (
    Boolean(originalProduct.lleva_proteina === true || originalProduct.lleva_proteina === 1) ||
    Boolean(originalProduct.lleva_proteina === "1") ||
    originalProduct.categoria === 'runner_proteina' ||
    originalProduct.categoria === 'Bebidas Fitness'
  )
  
  // Opciones de extras disponibles
  const extrasOpciones = [
    { id: 'tocino', nombre: 'Tocino', precio: 20 },
    { id: 'huevo', nombre: 'Huevo', precio: 20 },
    { id: 'jamon', nombre: 'Jamón', precio: 20 },
    { id: 'chorizo', nombre: 'Chorizo', precio: 20 }
  ]
  
  const imageExpanded = expandedImageId === productId
  
  // Verificar si es bebida fría
  const esBebidaFria = () => {
    const categoria = item.categoria || ''
    const categoriaLower = categoria.toLowerCase()
    return categoriaLower.includes('bebidas frías') || 
           categoriaLower.includes('bebidas frias') || 
           categoriaLower.includes('bebidas-frias') ||
           categoriaLower.includes('bebidas_frias')
  }
  
  const isBebidaFria = esBebidaFria()
  
  // Verificar si es un smoothie (no debe mostrar opciones de preparación)
  const esSmoothie = () => {
    const nombre = item.baseName || ''
    const nombreLower = nombre.toLowerCase()
    return nombreLower.includes('smoothie') && (nombreLower.includes('mango') || nombreLower.includes('fresa'))
  }
  const isSmoothie = esSmoothie()
  
  // Si solo hay un tamaño y no es UNICO, seleccionarlo automáticamente (solo si NO es bebida fría)
  // Para bebidas frías con un solo precio, el usuario debe seleccionar el precio manualmente
  useEffect(() => {
    if (!hasMultipleSizes && sizes.length === 1 && sizes[0] !== 'UNICO' && !selectedSize && !isBebidaFria) {
      setSelectedSize(sizes[0])
    }
  }, [sizes, hasMultipleSizes, selectedSize, isBebidaFria])
  
  const handleSizeSelect = (size) => {
    if (hasMultipleSizes) {
      const newSize = selectedSize === size ? null : size
      setSelectedSize(newSize)
      // Resetear tipo de preparación cuando se cambia el tamaño
      if (isBebidaFria && newSize !== selectedSize) {
        setTipoPreparacion(null)
      }
    }
  }
  
  const handlePrecioUnicoSelect = () => {
    setPrecioUnicoSeleccionado(true)
    // Si es bebida fría, resetear tipo de preparación al seleccionar precio
    if (isBebidaFria) {
      setTipoPreparacion(null)
    }
  }
  
  const handleAddToCart = async () => {
    // Si no hay tamaño seleccionado y hay múltiples tamaños, no hacer nada
    if (hasMultipleSizes && !selectedSize) {
      return
    }

    // Si no hay múltiples tamaños y no se ha seleccionado el precio único, no hacer nada
    if (!hasMultipleSizes && !precioUnicoSeleccionado) {
      return
    }

    // Si es bebida fría (pero no smoothie) y no se ha seleccionado tipo de preparación, no hacer nada
    if (isBebidaFria && !isSmoothie && !tipoPreparacion) {
      alert('Por favor selecciona si quieres la bebida Fría o Frapeada')
      return
    }
    
    // Si el producto lleva leche y no se ha seleccionado tipo de leche, usar 'entera' por defecto (no validar, solo usar)
    const tipoLecheFinal = llevaLeche ? tipoLeche : null
    
    // Si el producto lleva extras, usar los extras seleccionados (si no hay ninguno, usar array vacío)
    const extrasFinal = llevaExtras ? extrasSeleccionados : []
    
    // Si el producto lleva proteína, usar el tipo seleccionado
    const tipoProteinaFinal = llevaProteina ? tipoProteina : null

    // Si ya está procesando, no hacer nada
    if (addingToCart) return

    // Usar el tamaño seleccionado o el único disponible (solo si está seleccionado)
    const sizeToUse = hasMultipleSizes 
      ? selectedSize 
      : (precioUnicoSeleccionado && sizes.length === 1 ? sizes[0] : null)
    if (!sizeToUse) return

    const sizeData = item.sizes[sizeToUse]
    if (!sizeData) return

    // Si el precio es "00.00" o 0, no permitir agregar
    if (sizeData.price === 0 || sizeData.priceFormatted === "00.00") {
      alert('Por favor consulta el precio antes de agregar este producto')
      return
    }

    setAddingToCart(true)
    try {
      const success = await addToCart(
        sizeData.originalProduct, 
        sizeToUse === 'UNICO' ? null : sizeToUse, 
        1,
        (isBebidaFria && !isSmoothie) ? tipoPreparacion : null,
        tipoLecheFinal,
        extrasFinal,
        tipoProteinaFinal
      )
      
      if (success) {
        // Limpiar las selecciones después de agregar
        if (isBebidaFria) {
          setTipoPreparacion(null)
        }
        if (!hasMultipleSizes) {
          setPrecioUnicoSeleccionado(false)
        }
        if (llevaLeche) {
          setTipoLeche('entera') // Resetear a entera por defecto
        }
        if (llevaExtras) {
          setExtrasSeleccionados([]) // Limpiar extras
        }
        if (llevaProteina) {
          setTipoProteina(null) // Limpiar tipo de proteína
        }
        // No limpiar la selección de tamaño para permitir agregar más del mismo tamaño
        // Mostrar feedback visual
        const button = document.querySelector(`[data-item-id="${productId}"]`)
        if (button) {
          button.classList.add('added-to-cart')
          setTimeout(() => {
            button.classList.remove('added-to-cart')
          }, 1000)
        }
      }
    } catch (error) {
      console.error('Error agregando al carrito:', error)
    } finally {
      setAddingToCart(false)
    }
  }
  
  const handleExtraToggle = (extraId) => {
    if (extrasSeleccionados.includes(extraId)) {
      setExtrasSeleccionados(extrasSeleccionados.filter(id => id !== extraId))
    } else {
      setExtrasSeleccionados([...extrasSeleccionados, extraId])
    }
  }
  
  return (
    <div className="col-12 col-md-6 col-lg-4">
        <div 
          className="card h-100 shadow-sm border-0 menu-page-card"
          style={{position: 'relative'}}
          onClick={(e) => {
            // Si se hace click fuera de la imagen (en la card pero no en la imagen), cerrar
            if (imageExpanded && !e.target.closest('.menu-item-image-wrapper')) {
              onImageExpand(null)
            }
          }}
        >
          {backendImage && !imageError && (
            <div 
              className={`menu-item-image-wrapper ${imageExpanded ? 'menu-image-expanded-overlay' : ''}`}
              style={{cursor: 'pointer'}}
              onClick={(e) => {
                e.stopPropagation()
                onImageExpand(imageExpanded ? null : productId)
              }}
            >
              <img 
                src={backendImage} 
                className={`card-img-top menu-item-image ${imageExpanded ? 'menu-image-expanded' : ''}`}
                alt={item.name || item.nombre}
                onError={() => {
                  // Si la imagen falla al cargar, marcarla como error para ocultarla
                  setImageError(true)
                }}
              />
            </div>
          )}
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h5 className="card-title mb-0" style={{fontWeight: 700, color: 'var(--text)', fontSize: '1.25rem'}}>{item.baseName}</h5>
          </div>
          <p className="text-muted small mb-3" style={{minHeight: '48px', lineHeight: '1.6'}}>{item.description}</p>
          
          {/* Mostrar precios de ambos tamaños como opciones seleccionables */}
          {hasMultipleSizes ? (
            <div className="mb-3">
              <p className="small text-muted mb-2" style={{fontWeight: 500}}>Selecciona el tamaño:</p>
              <div className="d-flex gap-2 flex-wrap">
                {sizes.map(size => {
                  const sizeData = item.sizes[size]
                  if (!sizeData || sizeData.price === 0) return null
                  const isSelected = selectedSize === size
                  return (
                    <button
                      key={size}
                      type="button"
                      className="btn"
                      style={{
                        flex: '1 1 auto',
                        minWidth: '80px',
                        height: '48px',
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: 'white',
                        backgroundColor: '#146C43',
                        border: 'none',
                        transition: 'all 0.2s',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleSizeSelect(size)}
                    >
                      <div>
                        <div style={{fontSize: '0.75rem', opacity: 0.9}}>{size}</div>
                        <div style={{fontSize: '1rem', fontWeight: 700}}>
                          ${sizeData.priceFormatted || sizeData.price}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            // Si solo hay un tamaño, mostrar el precio como botón con el mismo estilo y alineación
            <div className="mb-3">
              <p className="small text-muted mb-2" style={{fontWeight: 500, visibility: 'hidden'}}>Selecciona el tamaño:</p>
              <div className="d-flex gap-2 flex-wrap">
                {sizes.map(size => {
                  const sizeData = item.sizes[size]
                  if (!sizeData || sizeData.price === 0) return null
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={handlePrecioUnicoSelect}
                      className="btn"
                      style={{
                        height: '48px',
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: 'white',
                        backgroundColor: precioUnicoSeleccionado ? '#0d5a2f' : '#146C43',
                        border: precioUnicoSeleccionado ? '2px solid #0a4a26' : 'none',
                        padding: '0.5rem 1rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      ${sizeData.priceFormatted || sizeData.price}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
          
          {/* Selector de tipo de preparación para bebidas frías (solo se muestra cuando hay un tamaño/precio seleccionado, excepto para smoothies) */}
          {isBebidaFria && !isSmoothie && (
            (hasMultipleSizes && selectedSize) || 
            (!hasMultipleSizes && precioUnicoSeleccionado)
          ) && (
            <div className="mb-3">
              <p className="small text-muted mb-2" style={{fontWeight: 500}}>Tipo de preparación:</p>
              <div className="d-flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setTipoPreparacion('heladas')}
                  className={`btn ${tipoPreparacion === 'heladas' ? 'btn-success' : 'btn-outline-success'}`}
                  style={{
                    flex: '1 1 auto',
                    minWidth: '100px',
                    fontSize: '0.9rem',
                    fontWeight: tipoPreparacion === 'heladas' ? 600 : 400,
                    transition: 'all 0.2s',
                    borderWidth: tipoPreparacion === 'heladas' ? '2px' : '1px'
                  }}
                >
                  Frío
                </button>
                <button
                  type="button"
                  onClick={() => setTipoPreparacion('frapeadas')}
                  className={`btn ${tipoPreparacion === 'frapeadas' ? 'btn-success' : 'btn-outline-success'}`}
                  style={{
                    flex: '1 1 auto',
                    minWidth: '100px',
                    fontSize: '0.9rem',
                    fontWeight: tipoPreparacion === 'frapeadas' ? 600 : 400,
                    transition: 'all 0.2s',
                    borderWidth: tipoPreparacion === 'frapeadas' ? '2px' : '1px'
                  }}
                >
                  Frapeadas
                </button>
              </div>
            </div>
          )}
          
          {/* Selector de tipo de leche (solo se muestra si el producto lleva leche y hay un tamaño/precio seleccionado) */}
          {llevaLeche && (
            (hasMultipleSizes && selectedSize) || 
            (!hasMultipleSizes && precioUnicoSeleccionado)
          ) && (
            <div className="mb-3">
              <p className="small text-muted mb-2" style={{fontWeight: 500}}>Tipo de leche:</p>
              <div className="d-flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setTipoLeche('entera')}
                  className={`btn ${tipoLeche === 'entera' ? 'btn-success' : 'btn-outline-success'}`}
                  style={{
                    flex: '1 1 auto',
                    minWidth: '90px',
                    fontSize: '0.875rem',
                    fontWeight: tipoLeche === 'entera' ? 600 : 400,
                    transition: 'all 0.2s',
                    borderWidth: tipoLeche === 'entera' ? '2px' : '1px',
                    padding: '0.5rem 0.75rem'
                  }}
                >
                  Entera
                </button>
                <button
                  type="button"
                  onClick={() => setTipoLeche('deslactosada')}
                  className={`btn ${tipoLeche === 'deslactosada' ? 'btn-success' : 'btn-outline-success'}`}
                  style={{
                    flex: '1 1 auto',
                    minWidth: '90px',
                    fontSize: '0.875rem',
                    fontWeight: tipoLeche === 'deslactosada' ? 600 : 400,
                    transition: 'all 0.2s',
                    borderWidth: tipoLeche === 'deslactosada' ? '2px' : '1px',
                    padding: '0.5rem 0.75rem'
                  }}
                >
                  Deslactosada (+$15)
                </button>
                <button
                  type="button"
                  onClick={() => setTipoLeche('almendras')}
                  className={`btn ${tipoLeche === 'almendras' ? 'btn-success' : 'btn-outline-success'}`}
                  style={{
                    flex: '1 1 auto',
                    minWidth: '90px',
                    fontSize: '0.875rem',
                    fontWeight: tipoLeche === 'almendras' ? 600 : 400,
                    transition: 'all 0.2s',
                    borderWidth: tipoLeche === 'almendras' ? '2px' : '1px',
                    padding: '0.5rem 0.75rem'
                  }}
                >
                  Almendras (+$15)
                </button>
              </div>
            </div>
          )}
          
          {/* Selector de extras (solo se muestra si el producto lleva extras y hay un tamaño/precio seleccionado) */}
          {llevaExtras && (
            (hasMultipleSizes && selectedSize) || 
            (!hasMultipleSizes && precioUnicoSeleccionado)
          ) && (
            <div className="mb-3">
              <p className="small text-muted mb-2" style={{fontWeight: 500}}>Extras (+$20 c/u):</p>
              <div className="d-flex gap-2 flex-wrap">
                {extrasOpciones.map(extra => (
                  <button
                    key={extra.id}
                    type="button"
                    onClick={() => handleExtraToggle(extra.id)}
                    className={`btn ${extrasSeleccionados.includes(extra.id) ? 'btn-success' : 'btn-outline-success'}`}
                    style={{
                      flex: '1 1 calc(50% - 0.5rem)',
                      minWidth: '100px',
                      fontSize: '0.875rem',
                      fontWeight: extrasSeleccionados.includes(extra.id) ? 600 : 400,
                      transition: 'all 0.2s',
                      borderWidth: extrasSeleccionados.includes(extra.id) ? '2px' : '1px',
                      padding: '0.5rem 0.75rem'
                    }}
                  >
                    {extra.nombre}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Selector de Proteína/Creatina (solo se muestra si el producto lleva proteína y hay un tamaño/precio seleccionado) */}
          {llevaProteina && (
            (hasMultipleSizes && selectedSize) || 
            (!hasMultipleSizes && precioUnicoSeleccionado)
          ) && (
            <div className="mb-3">
              <p className="small text-muted mb-2" style={{fontWeight: 500}}>Scoop:</p>
              <div className="d-flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setTipoProteina('proteina')}
                  className={`btn ${tipoProteina === 'proteina' ? 'btn-success' : 'btn-outline-success'}`}
                  style={{
                    flex: '1 1 calc(50% - 0.5rem)',
                    minWidth: '100px',
                    fontSize: '0.875rem',
                    fontWeight: tipoProteina === 'proteina' ? 600 : 400,
                    transition: 'all 0.2s',
                    borderWidth: tipoProteina === 'proteina' ? '2px' : '1px',
                    padding: '0.5rem 0.75rem'
                  }}
                >
                  Proteína
                </button>
                <button
                  type="button"
                  onClick={() => setTipoProteina('creatina')}
                  className={`btn ${tipoProteina === 'creatina' ? 'btn-success' : 'btn-outline-success'}`}
                  style={{
                    flex: '1 1 calc(50% - 0.5rem)',
                    minWidth: '100px',
                    fontSize: '0.875rem',
                    fontWeight: tipoProteina === 'creatina' ? 600 : 400,
                    transition: 'all 0.2s',
                    borderWidth: tipoProteina === 'creatina' ? '2px' : '1px',
                    padding: '0.5rem 0.75rem'
                  }}
                >
                  Creatina
                </button>
              </div>
            </div>
          )}
          
          {/* Botón único de agregar al carrito */}
          <button
            data-item-id={productId}
            className={`btn btn-add-to-cart w-100 ${selectedSize || !hasMultipleSizes ? 'btn-success' : 'btn-secondary'}`}
            onClick={handleAddToCart}
            disabled={addingToCart || (hasMultipleSizes && !selectedSize) || (!hasMultipleSizes && !precioUnicoSeleccionado) || (isBebidaFria && !isSmoothie && !tipoPreparacion) || (llevaProteina && !tipoProteina)}
            style={{
              transition: 'all 0.2s',
              opacity: (hasMultipleSizes && !selectedSize) || (!hasMultipleSizes && !precioUnicoSeleccionado) || (isBebidaFria && !isSmoothie && !tipoPreparacion) || (llevaProteina && !tipoProteina) ? 0.5 : 1,
              cursor: (hasMultipleSizes && !selectedSize) || (!hasMultipleSizes && !precioUnicoSeleccionado) || (isBebidaFria && !isSmoothie && !tipoPreparacion) || (llevaProteina && !tipoProteina) ? 'not-allowed' : 'pointer'
            }}
          >
            {addingToCart ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Agregando...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: '8px'}}>
                  <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" fill="currentColor"/>
                </svg>
                {hasMultipleSizes && !selectedSize 
                  ? 'Selecciona un tamaño' 
                  : !hasMultipleSizes && !precioUnicoSeleccionado
                  ? 'Selecciona el precio'
                  : isBebidaFria && !isSmoothie && !tipoPreparacion
                  ? 'Selecciona tipo de preparación'
                  : `Agregar ${selectedSize && hasMultipleSizes ? `(${selectedSize})` : ''} al carrito`}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MenuPage({ onClose, onCartClick, isCartOpen }){
  const { productsByCategory, loading, error } = useProductsByCategory()
  const [expandedImageId, setExpandedImageId] = useState(null)
  
  // Usar solo productos del backend
  const menuData = productsByCategory

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
            {loading ? (
              <div className="col-12 text-center py-5">
                <div className="spinner-border" style={{color: 'var(--matcha-600)'}} role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
              </div>
            ) : menuData.bebidasCalientes && menuData.bebidasCalientes.length > 0 ? (
              groupProductsByName(menuData.bebidasCalientes).map((item, idx) => (
                <MenuItemCard key={`${item.baseName}-${idx}`} item={item} imageIndex={idx} expandedImageId={expandedImageId} onImageExpand={setExpandedImageId} />
              ))
            ) : (
              !loading && <div className="col-12 text-center text-muted py-3">No hay productos disponibles</div>
            )}
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
            {menuData.bebidasFrias && menuData.bebidasFrias.length > 0 ? (
              groupProductsByName(menuData.bebidasFrias).map((item, idx) => (
                <MenuItemCard key={`${item.baseName}-${idx + 10}`} item={item} imageIndex={idx + 10} expandedImageId={expandedImageId} onImageExpand={setExpandedImageId} />
              ))
            ) : null}
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
            {menuData.shotsEnergia && menuData.shotsEnergia.length > 0 ? (
              groupProductsByName(menuData.shotsEnergia).map((item, idx) => (
                <MenuItemCard key={`${item.baseName}-${idx + 20}`} item={item} imageIndex={idx + 20} expandedImageId={expandedImageId} onImageExpand={setExpandedImageId} />
              ))
            ) : null}
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
            {menuData.bebidasProteina && menuData.bebidasProteina.length > 0 ? (
              groupProductsByName(menuData.bebidasProteina).map((item, idx) => (
                <MenuItemCard key={`${item.baseName}-${idx + 30}`} item={item} imageIndex={idx + 30} expandedImageId={expandedImageId} onImageExpand={setExpandedImageId} />
              ))
            ) : null}
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
            {menuData.menuDulce && menuData.menuDulce.length > 0 ? (
              groupProductsByName(menuData.menuDulce).map((item, idx) => (
                <MenuItemCard key={`${item.baseName}-${idx + 40}`} item={item} imageIndex={idx + 40} expandedImageId={expandedImageId} onImageExpand={setExpandedImageId} />
              ))
            ) : null}
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
            {menuData.menuSalado && menuData.menuSalado.length > 0 ? (
              groupProductsByName(menuData.menuSalado).map((item, idx) => (
                <MenuItemCard key={`${item.baseName}-${idx + 50}`} item={item} imageIndex={idx + 50} expandedImageId={expandedImageId} onImageExpand={setExpandedImageId} />
              ))
            ) : null}
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
            {menuData.ensaladas && menuData.ensaladas.length > 0 ? (
              groupProductsByName(menuData.ensaladas).map((item, idx) => (
                <MenuItemCard key={`${item.baseName}-${idx + 60}`} item={item} imageIndex={idx + 60} expandedImageId={expandedImageId} onImageExpand={setExpandedImageId} />
              ))
            ) : null}
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
            {menuData.otros && menuData.otros.length > 0 ? (
              groupProductsByName(menuData.otros).map((item, idx) => (
                <MenuItemCard key={`${item.baseName}-${idx + 70}`} item={item} imageIndex={idx + 70} expandedImageId={expandedImageId} onImageExpand={setExpandedImageId} />
              ))
            ) : null}
          </div>
        </section>
      </div>
      {/* Botón flotante del carrito */}
      <FloatingCartButton onClick={onCartClick} isCartOpen={isCartOpen} />
      {/* Botón flotante del menú de categorías */}
      <FloatingMenuButton isCartOpen={isCartOpen} />
    </div>
  )
}
