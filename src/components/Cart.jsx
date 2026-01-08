import React, { useState } from 'react'
import { useCart } from '../context/CartContext'
import { createPreorden } from '../services/api'
import CheckoutModal from './CheckoutModal'
import Swal from 'sweetalert2'

export default function Cart({ isOpen, onClose }) {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getTotal, getTotalItems } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)
  const [checkoutSuccess, setCheckoutSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)

  const handleCheckoutClick = () => {
    if (cartItems.length === 0) return
    setShowCheckoutModal(true)
  }

  const handleCheckoutConfirm = async (checkoutData, totalFinal) => {
    setIsProcessing(true)
    setError(null)
    setCheckoutSuccess(false)
    setShowCheckoutModal(false)

    try {
      // Preparar los detalles con observaciones si hay comentarios, tipo de leche o tipo de preparación
      const detalles = cartItems.map(item => {
        const observaciones = []
        
        // Agregar tipo de preparación si es bebida fría
        if (item.tipoPreparacion) {
          observaciones.push(`Preparación: ${item.tipoPreparacion === 'heladas' ? 'Heladas' : 'Frapeadas'}`)
        }
        
        // Agregar tipo de leche si es bebida
        if (checkoutData.tipo_leche) {
          if (checkoutData.tipo_leche === 'deslactosada') {
            observaciones.push('Leche deslactosada')
          } else if (checkoutData.tipo_leche === 'almendras') {
            observaciones.push('Leche de almendras')
          }
        }
        
        // Agregar comentarios generales si existen
        if (checkoutData.comentarios) {
          observaciones.push(checkoutData.comentarios)
        }
        
        return {
          id_producto: item.productId,
          cantidad: item.quantity,
          observaciones: observaciones.length > 0 ? observaciones.join(' - ') : null
        }
      })

      // Crear la pre-orden con todos los datos
      const preordenData = {
        nombre_cliente: checkoutData.nombre_cliente,
        tipo_servicio: checkoutData.tipo_servicio,
        comentarios: checkoutData.comentarios,
        tipo_leche: checkoutData.tipo_leche,
        extra_leche: checkoutData.extra_leche
      }

      // Llamar al endpoint con el formato correcto
      const result = await createPreorden(preordenData, detalles)

      // Debug: Log la respuesta del backend para ver qué está retornando
      console.log('Respuesta del backend:', result)

      // El backend retorna: { message, id_preorden, total }
      // Verificar si tiene id_preorden o id (por compatibilidad)
      const idPreorden = result?.id_preorden || result?.id || result?.id_preorden_id
      
      if (result && idPreorden) {
        // Mostrar SweetAlert de éxito
        await Swal.fire({
          icon: 'success',
          title: '¡Pedido Creado Exitosamente!',
          text: 'Favor de pasar a barra a pagar',
          confirmButtonColor: 'var(--matcha-500)',
          confirmButtonText: 'Entendido',
          customClass: {
            popup: 'swal-custom-popup'
          }
        })
        
        // Limpiar el carrito y cerrar
        clearCart()
        onClose()
      } else {
        // Log más detallado del error
        console.error('Respuesta inválida del backend:', {
          result,
          tieneIdPreorden: !!result?.id_preorden,
          tieneId: !!result?.id,
          keys: result ? Object.keys(result) : 'result es null/undefined'
        })
        throw new Error(`No se recibió un ID de pre-orden válido. Respuesta: ${JSON.stringify(result)}`)
      }
    } catch (error) {
      console.error('Error en checkout:', error)
      // Mostrar SweetAlert de error
      await Swal.fire({
        icon: 'error',
        title: 'Error al procesar el pedido',
        text: error.message || 'Por favor intenta de nuevo',
        confirmButtonColor: 'var(--matcha-500)',
        confirmButtonText: 'OK'
      })
      setError(error.message || 'Error al procesar tu pedido. Por favor intenta de nuevo.')
    } finally {
      setIsProcessing(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2
    }).format(price)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="cart-overlay" 
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1040,
          transition: 'opacity 0.3s ease'
        }}
      />
      
      {/* Cart Sidebar */}
      <div 
        className="cart-sidebar"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '100%',
          maxWidth: '420px',
          height: '100vh',
          background: 'var(--bg-light)',
          boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.15)',
          zIndex: 1050,
          display: 'flex',
          flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease'
        }}
      >
        {/* Header */}
        <div 
          className="cart-header"
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid var(--gray-300)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--bg-light)'
          }}
        >
          <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.5rem', color: 'var(--text)' }}>
            Carrito ({getTotalItems()})
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

        {/* Cart Items */}
        <div 
          className="cart-items"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem'
          }}
        >
          {cartItems.length === 0 ? (
            <div 
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'var(--text-light)',
                textAlign: 'center',
                padding: '2rem'
              }}
            >
              <svg width="64" height="64" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.3, marginBottom: '1rem' }}>
                <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" fill="currentColor"/>
              </svg>
              <p style={{ margin: 0, fontSize: '1.125rem' }}>Tu carrito está vacío</p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9375rem' }}>Agrega productos del menú</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="cart-item"
                  style={{
                    background: 'var(--bg)',
                    borderRadius: 'var(--radius)',
                    padding: '1rem',
                    border: '1px solid var(--gray-200)'
                  }}
                >
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div style={{ flex: 1 }}>
                      <h6 style={{ margin: 0, fontWeight: 600, fontSize: '1rem', color: 'var(--text)' }}>
                        {item.name}
                      </h6>
                      <div className="d-flex flex-wrap gap-2" style={{ marginTop: '0.25rem' }}>
                        {item.size && (
                          <span className="badge" style={{ 
                            background: 'var(--matcha-100)', 
                            color: 'var(--matcha-700)',
                            fontSize: '0.75rem'
                          }}>
                            Tamaño: {item.size}
                          </span>
                        )}
                        {item.tipoPreparacion && (
                          <span className="badge" style={{ 
                            background: 'var(--coffee-100)', 
                            color: 'var(--coffee-700)',
                            fontSize: '0.75rem'
                          }}>
                            {item.tipoPreparacion === 'heladas' ? 'Heladas' : 'Frapeadas'}
                          </span>
                        )}
                      </div>
                      <p style={{ 
                        margin: '0.5rem 0 0 0', 
                        fontSize: '0.875rem', 
                        color: 'var(--text-light)' 
                      }}>
                        {item.description}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-light)',
                        cursor: 'pointer',
                        padding: '0.25rem',
                        fontSize: '1.25rem',
                        lineHeight: 1
                      }}
                      onMouseEnter={(e) => e.target.style.color = 'var(--matcha-600)'}
                      onMouseLeave={(e) => e.target.style.color = 'var(--text-light)'}
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="d-flex justify-content-between align-items-center cart-item-footer">
                    <div className="d-flex align-items-center gap-2 cart-quantity-controls">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="cart-quantity-btn"
                        style={{
                          background: 'var(--gray-200)',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          fontSize: '1.125rem',
                          fontWeight: 600
                        }}
                      >
                        −
                      </button>
                      <span className="cart-quantity-value" style={{ minWidth: '2rem', textAlign: 'center', fontWeight: 600 }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="cart-quantity-btn"
                        style={{
                          background: 'var(--gray-200)',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          fontSize: '1.125rem',
                          fontWeight: 600
                        }}
                      >
                        +
                      </button>
                    </div>
                    <strong className="cart-item-price" style={{ fontSize: '1.125rem', color: 'var(--matcha-600)' }}>
                      {formatPrice(item.price * item.quantity)}
                    </strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div 
            className="cart-footer"
            style={{
              padding: '1.5rem',
              borderTop: '1px solid var(--gray-300)',
              background: 'var(--bg-light)'
            }}
          >
            {/* Mensajes de error (los de éxito ahora se muestran con SweetAlert) */}
            {error && (
              <div 
                className="alert alert-danger mb-3"
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius)',
                  background: '#fee2e2',
                  border: '1px solid #fca5a5',
                  color: '#991b1b'
                }}
              >
                ⚠ {error}
              </div>
            )}

            <div className="d-flex justify-content-between align-items-center mb-3">
              <strong style={{ fontSize: '1.25rem', color: 'var(--text)' }}>Total:</strong>
              <strong style={{ fontSize: '1.5rem', color: 'var(--matcha-600)' }}>
                {formatPrice(getTotal())}
              </strong>
            </div>
            
            {/* Mensaje informativo sobre el pago */}
            <div 
              className="cart-info-message"
              style={{
                background: 'linear-gradient(135deg, rgba(45, 90, 39, 0.08) 0%, rgba(45, 90, 39, 0.04) 100%)',
                border: '1.5px solid var(--matcha-200)',
                borderRadius: 'var(--radius)',
                padding: '1.125rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.875rem'
              }}
            >
              <div className="cart-info-icon" style={{
                background: 'var(--matcha-500)',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '1px',
                boxShadow: '0 2px 4px rgba(45, 90, 39, 0.2)'
              }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 1.5C4.41 1.5 1.5 4.41 1.5 8S4.41 14.5 8 14.5 14.5 11.59 14.5 8 11.59 1.5 8 1.5zM8 13C5.24 13 3 10.76 3 8S5.24 3 8 3 13 5.24 13 8 10.76 13 8 13zM8.25 5.5H7.5V8.25L9.625 9.5l.5-.75L8.5 7.5V5.5H8.25z" fill="#fff"/>
                </svg>
              </div>
              <div className="cart-info-content" style={{ flex: 1 }}>
                <p className="cart-info-title" style={{
                  margin: 0,
                  fontSize: '0.9375rem',
                  lineHeight: '1.6',
                  color: 'var(--text)',
                  fontWeight: 600,
                  marginBottom: '0.375rem'
                }}>
                  Tu pedido comenzará a prepararse una vez que completes el pago
                </p>
                <p className="cart-info-text" style={{
                  margin: 0,
                  fontSize: '0.8125rem',
                  lineHeight: '1.5',
                  color: 'var(--text-light)'
                }}>
                  Por favor, acércate a la barra para finalizar tu compra y se comenzará a preparar tu pedido.
                </p>
              </div>
            </div>
            
            <div className="d-flex gap-2 cart-footer-buttons">
              <button
                onClick={clearCart}
                className="btn btn-outline-secondary flex-fill cart-clear-btn"
                style={{ fontSize: '0.9375rem' }}
                disabled={isProcessing}
              >
                Limpiar
              </button>
              <button
                onClick={handleCheckoutClick}
                className="btn btn-reserve flex-fill cart-checkout-btn"
                disabled={isProcessing}
                style={{ 
                  fontSize: '0.9375rem',
                  background: 'var(--matcha-500)',
                  color: '#fff',
                  border: 'none'
                }}
              >
                {isProcessing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Procesando...
                  </>
                ) : (
                  'Finalizar pedido'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Modal de Checkout */}
      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        onConfirm={handleCheckoutConfirm}
        cartItems={cartItems}
      />
    </>
  )
}

