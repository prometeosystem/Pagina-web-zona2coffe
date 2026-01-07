import React, { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'

export default function CheckoutModal({ isOpen, onClose, onConfirm, cartItems }) {
  const { getTotal } = useCart()
  const [nombreCliente, setNombreCliente] = useState('')
  const [tipoServicio, setTipoServicio] = useState('comer-aqui') // 'comer-aqui' o 'para-llevar'
  const [comentarios, setComentarios] = useState('')
  const [tipoLeche, setTipoLeche] = useState('entera') // 'entera' o 'deslactosada'
  
  // Detectar si hay bebidas en el carrito
  // Lista más completa de categorías y variantes de bebidas
  const categoriasBebidas = [
    'bebidas calientes',
    'bebidas-calientes',
    'bebidas_calientes',
    'bebidas frías',
    'bebidas frias',
    'bebidas-frías',
    'bebidas-frias',
    'bebidas_frias',
    'shots de energía',
    'shots de energia',
    'shots-energia',
    'shots-de-energia',
    'shots_de_energia',
    'shot-energia',
    'shot-de-energia',
    'shot_de_energia',
    'shot energia',
    'shot de energia',
    'shot de energía',
    'bebidas con proteína',
    'bebidas con proteina',
    'bebidas-proteina',
    'bebidas-con-proteina',
    'bebidas_con_proteina',
    'bebidas fitness',
    'bebidas-fitness',
    'bebidas_fitness',
    'runner_proteina',
    'runner-proteina',
    'runner proteina'
  ]
  
  const tieneBebidas = cartItems.some(item => {
    // Obtener categoría del item (puede venir de originalProduct o directamente del item)
    const categoria = (item.originalProduct?.categoria || 
                      item.originalProduct?.categoria_id || 
                      item.categoria || 
                      '').toLowerCase().trim()
    
    // Si no hay categoría, intentar detectar por el nombre o descripción
    if (!categoria) {
      const nombre = (item.name || item.nombre || '').toLowerCase()
      const descripcion = (item.description || item.desc || item.descripcion || '').toLowerCase()
      
      // Palabras clave que indican que es una bebida
      const palabrasClaveBebidas = [
        'latte', 'cappuccino', 'americano', 'espresso', 'expresso',
        'café', 'cafe', 'coffee', 'matcha', 'chai', 'chocolate',
        'smoothie', 'frappé', 'frappe', 'iced', 'helado', 'frapeado',
        'shot', 'energía', 'energia', 'proteína', 'proteina',
        'leche', 'milk', 'bebida', 'drink', 'té', 'te', 'tonic'
      ]
      
      return palabrasClaveBebidas.some(palabra => 
        nombre.includes(palabra) || descripcion.includes(palabra)
      )
    }
    
    // Verificar si la categoría coincide con alguna categoría de bebidas
    return categoriasBebidas.some(cat => 
      categoria.includes(cat) || cat.includes(categoria)
    )
  })
  
  // Calcular total con extra por leche deslactosada
  const baseTotal = getTotal()
  const extraLeche = tieneBebidas && tipoLeche === 'deslactosada' ? 15 : 0
  const totalFinal = baseTotal + extraLeche
  
  useEffect(() => {
    // Resetear formulario cuando se abre el modal
    if (isOpen) {
      setNombreCliente('')
      setTipoServicio('comer-aqui')
      setComentarios('')
      setTipoLeche('entera')
    }
  }, [isOpen])
  
  const handleSubmit = (e) => {
    e.preventDefault()
    
    const checkoutData = {
      nombre_cliente: nombreCliente.trim() || null,
      tipo_servicio: tipoServicio,
      comentarios: comentarios.trim() || null,
      tipo_leche: tieneBebidas ? tipoLeche : null,
      extra_leche: extraLeche
    }
    
    onConfirm(checkoutData, totalFinal)
  }
  
  if (!isOpen) return null
  
  return (
    <>
      {/* Overlay */}
      <div 
        className="checkout-modal-overlay"
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1060,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}
      >
        {/* Modal */}
        <div 
          className="checkout-modal"
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'var(--bg-light)',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
            zIndex: 1061
          }}
        >
          {/* Header */}
          <div 
            style={{
              padding: '1.5rem',
              borderBottom: '1px solid var(--gray-300)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'sticky',
              top: 0,
              background: 'var(--bg-light)',
              zIndex: 1
            }}
          >
            <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.5rem', color: 'var(--text)' }}>
              Finalizar Pedido
            </h3>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: 'var(--text)',
                padding: '0.25rem 0.5rem',
                borderRadius: 'var(--radius)',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = 'var(--gray-200)'}
              onMouseLeave={(e) => e.target.style.background = 'none'}
            >
              ✕
            </button>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ padding: '1.5rem' }}>
              {/* Nombre del Cliente */}
              <div className="mb-4">
                <label 
                  htmlFor="nombreCliente" 
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 600,
                    color: 'var(--text)',
                    fontSize: '0.9375rem'
                  }}
                >
                  Nombre del Cliente <span style={{color: 'var(--text-light)'}}>(Opcional)</span>
                </label>
                <input
                  type="text"
                  id="nombreCliente"
                  value={nombreCliente}
                  onChange={(e) => setNombreCliente(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--gray-300)',
                    fontSize: '0.9375rem',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--matcha-500)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--gray-300)'}
                />
              </div>
              
              {/* Tipo de Servicio */}
              <div className="mb-4">
                <label 
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 600,
                    color: 'var(--text)',
                    fontSize: '0.9375rem'
                  }}
                >
                  Tipo de Servicio
                </label>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTipoServicio('comer-aqui')}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: 'var(--radius)',
                      border: `2px solid ${tipoServicio === 'comer-aqui' ? 'var(--matcha-500)' : 'var(--gray-300)'}`,
                      background: tipoServicio === 'comer-aqui' ? 'var(--matcha-100)' : 'transparent',
                      color: tipoServicio === 'comer-aqui' ? 'var(--matcha-700)' : 'var(--text)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    Comer Aquí
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoServicio('para-llevar')}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: 'var(--radius)',
                      border: `2px solid ${tipoServicio === 'para-llevar' ? 'var(--matcha-500)' : 'var(--gray-300)'}`,
                      background: tipoServicio === 'para-llevar' ? 'var(--matcha-100)' : 'transparent',
                      color: tipoServicio === 'para-llevar' ? 'var(--matcha-700)' : 'var(--text)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    Para Llevar
                  </button>
                </div>
              </div>
              
              {/* Tipo de Leche (solo si hay bebidas) */}
              {tieneBebidas && (
                <div className="mb-4">
                  <label 
                    style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: 600,
                      color: 'var(--text)',
                      fontSize: '0.9375rem'
                    }}
                  >
                    Tipo de Leche
                  </label>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      onClick={() => setTipoLeche('entera')}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        borderRadius: 'var(--radius)',
                        border: `2px solid ${tipoLeche === 'entera' ? 'var(--matcha-500)' : 'var(--gray-300)'}`,
                        background: tipoLeche === 'entera' ? 'var(--matcha-100)' : 'transparent',
                        color: tipoLeche === 'entera' ? 'var(--matcha-700)' : 'var(--text)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      Entera
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipoLeche('deslactosada')}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        borderRadius: 'var(--radius)',
                        border: `2px solid ${tipoLeche === 'deslactosada' ? 'var(--matcha-500)' : 'var(--gray-300)'}`,
                        background: tipoLeche === 'deslactosada' ? 'var(--matcha-100)' : 'transparent',
                        color: tipoLeche === 'deslactosada' ? 'var(--matcha-700)' : 'var(--text)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      Deslactosada (+$15)
                    </button>
                  </div>
                </div>
              )}
              
              {/* Comentarios */}
              <div className="mb-4">
                <label 
                  htmlFor="comentarios" 
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 600,
                    color: 'var(--text)',
                    fontSize: '0.9375rem'
                  }}
                >
                  Comentarios <span style={{color: 'var(--text-light)'}}>(Opcional)</span>
                </label>
                <textarea
                  id="comentarios"
                  value={comentarios}
                  onChange={(e) => setComentarios(e.target.value)}
                  placeholder="Instrucciones especiales, sin azúcar, etc."
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--gray-300)',
                    fontSize: '0.9375rem',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--matcha-500)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--gray-300)'}
                />
              </div>
              
              {/* Resumen de Total */}
              <div 
                style={{
                  padding: '1rem',
                  background: 'var(--bg)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--gray-200)',
                  marginBottom: '1.5rem'
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span style={{ color: 'var(--text-light)' }}>Subtotal:</span>
                  <span style={{ fontWeight: 600 }}>${baseTotal.toFixed(2)}</span>
                </div>
                {tieneBebidas && tipoLeche === 'deslactosada' && (
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span style={{ color: 'var(--text-light)' }}>Leche Deslactosada:</span>
                    <span style={{ fontWeight: 600 }}>+$15.00</span>
                  </div>
                )}
                <div 
                  className="d-flex justify-content-between align-items-center"
                  style={{
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--gray-300)',
                    marginTop: '0.75rem'
                  }}
                >
                  <strong style={{ fontSize: '1.125rem', color: 'var(--text)' }}>Total:</strong>
                  <strong style={{ fontSize: '1.25rem', color: 'var(--matcha-600)' }}>
                    ${totalFinal.toFixed(2)}
                  </strong>
                </div>
              </div>
              
              {/* Botones */}
              <div className="d-flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-outline-secondary flex-fill"
                  style={{ fontSize: '0.9375rem' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-reserve flex-fill"
                  style={{ 
                    fontSize: '0.9375rem',
                    background: 'var(--matcha-500)',
                    color: '#fff',
                    border: 'none'
                  }}
                >
                  Finalizar Pedido
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}




