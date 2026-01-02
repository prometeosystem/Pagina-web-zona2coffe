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
      // Preparar los detalles con observaciones si hay comentarios o tipo de leche
      const detalles = cartItems.map(item => {
        const observaciones = []
        
        // Agregar tipo de leche si es bebida
        if (checkoutData.tipo_leche && checkoutData.tipo_leche === 'deslactosada') {
          observaciones.push('Leche deslactosada')
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

      // El backend retorna: { message, id_preorden, total }
      if (result && (result.id_preorden || result.id)) {
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
        throw new Error('No se recibió un ID de pre-orden válido')
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
                      {item.size && (
                        <span className="badge" style={{ 
                          background: 'var(--matcha-100)', 
                          color: 'var(--matcha-700)',
                          fontSize: '0.75rem',
                          marginTop: '0.25rem'
                        }}>
                          Tamaño: {item.size}
                        </span>
                      )}
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
                  
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
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
                      <span style={{ minWidth: '2rem', textAlign: 'center', fontWeight: 600 }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
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
                    <strong style={{ fontSize: '1.125rem', color: 'var(--matcha-600)' }}>
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
            <div className="d-flex gap-2">
              <button
                onClick={clearCart}
                className="btn btn-outline-secondary flex-fill"
                style={{ fontSize: '0.9375rem' }}
                disabled={isProcessing}
              >
                Limpiar
              </button>
              <button
                onClick={handleCheckoutClick}
                className="btn btn-reserve flex-fill"
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

