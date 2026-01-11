import React, { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'

// Opciones de extras disponibles
const extrasOpciones = [
  { id: 'tocino', nombre: 'Tocino', precio: 20 },
  { id: 'huevo', nombre: 'Huevo', precio: 20 },
  { id: 'jamon', nombre: 'Jamón', precio: 20 },
  { id: 'chorizo', nombre: 'Chorizo', precio: 20 }
]

export default function CheckoutModal({ isOpen, onClose, onConfirm, cartItems }) {
  const { getTotal } = useCart()
  const [nombreCliente, setNombreCliente] = useState('')
  const [tipoServicio, setTipoServicio] = useState('comer-aqui') // 'comer-aqui' o 'para-llevar'
  const [comentarios, setComentarios] = useState('')
  
  // Calcular extras y tipo de leche por item individualmente
  const calcularExtraLeche = () => {
    let total = 0
    cartItems.forEach(item => {
      // Extra por leche deslactosada o de almendras ($15 por producto con leche)
      if (item.tipoLeche && (item.tipoLeche === 'deslactosada' || item.tipoLeche === 'almendras')) {
        total += 15 * item.quantity
      }
    })
    return total
  }
  
  // Calcular extra por extras seleccionados por item
  const calcularExtraExtras = () => {
    let total = 0
    cartItems.forEach(item => {
      // Extra por extras ($20 por cada extra, multiplicado por cantidad)
      if (item.extras && item.extras.length > 0) {
        total += item.extras.length * 20 * item.quantity
      }
    })
    return total
  }
  
  // Calcular total con extra por leche deslactosada y extras
  const baseTotal = getTotal()
  const extraLeche = calcularExtraLeche()
  const extraExtras = calcularExtraExtras()
  const totalFinal = baseTotal + extraLeche + extraExtras
  
  useEffect(() => {
    // Resetear formulario cuando se abre el modal
    if (isOpen) {
      setNombreCliente('')
      setTipoServicio('comer-aqui')
      setComentarios('')
    }
  }, [isOpen])
  
  // Función para obtener el nombre del tipo de leche
  const getNombreTipoLeche = (tipoLeche) => {
    if (tipoLeche === 'deslactosada') return 'Deslactosada'
    if (tipoLeche === 'almendras') return 'Almendras'
    return 'Entera'
  }
  
  // Función para obtener nombres de extras
  const getNombresExtras = (extrasIds) => {
    if (!extrasIds || extrasIds.length === 0) return []
    return extrasIds.map(id => {
      const extra = extrasOpciones.find(e => e.id === id)
      return extra ? extra.nombre : id
    })
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    
    const checkoutData = {
      nombre_cliente: nombreCliente.trim() || null,
      tipo_servicio: tipoServicio,
      comentarios: comentarios.trim() || null,
      tipo_leche: null, // Ya no se usa globalmente, está en cada item
      extra_leche: extraLeche > 0 ? extraLeche : 0,
      extras: [], // Ya no se usa globalmente, está en cada item
      extra_extras: extraExtras > 0 ? extraExtras : 0
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
              
              {/* Resumen de productos con sus opciones */}
              <div className="mb-4">
                <label 
                  style={{
                    display: 'block',
                    marginBottom: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--text)',
                    fontSize: '0.9375rem'
                  }}
                >
                  Resumen del Pedido
                </label>
                <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--gray-300)', borderRadius: 'var(--radius)', padding: '0.75rem' }}>
                  {cartItems.map((item, index) => (
                    <div key={item.id || index} style={{ marginBottom: index < cartItems.length - 1 ? '0.75rem' : 0, paddingBottom: index < cartItems.length - 1 ? '0.75rem' : 0, borderBottom: index < cartItems.length - 1 ? '1px solid var(--gray-200)' : 'none' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                        {item.name} {item.size && `(${item.size})`} x{item.quantity}
                      </div>
                      {(item.tipoPreparacion || item.tipoLeche || (item.extras && item.extras.length > 0) || item.tipoProteina) && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginLeft: '0.5rem' }}>
                          {item.tipoPreparacion && (
                            <div>• Preparación: {item.tipoPreparacion === 'heladas' ? 'Frío' : 'Frapeadas'}</div>
                          )}
                          {item.tipoLeche && item.tipoLeche !== 'entera' && (
                            <div>• Leche: {getNombreTipoLeche(item.tipoLeche)} (+$15)</div>
                          )}
                          {item.extras && item.extras.length > 0 && (
                            <div>• Extras: {getNombresExtras(item.extras).join(', ')} (+${item.extras.length * 20} c/u)</div>
                          )}
                          {item.tipoProteina && (
                            <div>• Scoop: {item.tipoProteina === 'proteina' ? 'Proteína' : 'Creatina'}</div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
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
                {extraLeche > 0 && (
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span style={{ color: 'var(--text-light)' }}>
                      Extra por leche especial:
                    </span>
                    <span style={{ fontWeight: 600 }}>+${extraLeche.toFixed(2)}</span>
                  </div>
                )}
                {extraExtras > 0 && (
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span style={{ color: 'var(--text-light)' }}>
                      Extras:
                    </span>
                    <span style={{ fontWeight: 600 }}>+${extraExtras.toFixed(2)}</span>
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




