import React, { createContext, useContext, useState, useCallback } from 'react'
import { validateProduct } from '../services/api'

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart debe ser usado dentro de CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Agregar producto al carrito con validación en el backend
  const addToCart = useCallback(async (product, selectedSize = null, quantity = 1, tipoPreparacion = null) => {
    setIsLoading(true)
    setError(null)

    try {
      // Validar que el producto existe en la base de datos
      // El producto puede tener id o id_producto dependiendo de si viene del JSON local o del backend
      const productId = product.id || product.id_producto
      const isValid = await validateProduct(productId)
      
      if (!isValid) {
        setError('El producto no está disponible en este momento')
        setIsLoading(false)
        return false
      }

      // Calcular precio según el tamaño seleccionado
      // Usar precio del backend o price del JSON local
      let price = product.precio || product.price
      let size = selectedSize || 'M'
      
      // Si el precio viene como string con "$", limpiarlo
      if (typeof price === 'string') {
        price = price.replace('$', '').replace(',', '').trim()
      }
      
      if (product.size && selectedSize) {
        if (selectedSize === 'M') {
          price = product.precio || product.price
        } else if (selectedSize === 'G' && (product.precio2 || product.price2)) {
          price = product.precio2 || product.price2
        }
      } else if (!selectedSize && product.size) {
        // Si tiene tamaños pero no se seleccionó, usar el primero (M)
        price = product.precio || product.price
      }

      // Limpiar el precio si es string
      if (typeof price === 'string') {
        price = price.replace('$', '').replace(',', '').trim()
      }

      // Crear item del carrito
      const cartItem = {
        id: `${productId}-${size}-${tipoPreparacion || 'default'}-${Date.now()}`,
        productId: productId,
        name: product.nombre || product.name,
        description: product.descripcion || product.desc || '',
        price: parseFloat(price) || 0,
        size: size,
        quantity: quantity,
        tipoPreparacion: tipoPreparacion, // 'heladas' o 'frapeadas' para bebidas frías
        categoria: product.categoria || product.categoria_id || null, // Guardar categoría directamente
        lleva_leche: Boolean(product.lleva_leche === true || product.lleva_leche === 1), // Guardar lleva_leche directamente
        originalProduct: product
      }

      // Verificar si el producto ya está en el carrito (mismo ID, tamaño y tipo de preparación)
      setCartItems(prevItems => {
        const existingItemIndex = prevItems.findIndex(
          item => item.productId === productId && item.size === size && item.tipoPreparacion === tipoPreparacion
        )

        if (existingItemIndex >= 0) {
          // Si ya existe, aumentar la cantidad
          const updatedItems = [...prevItems]
          updatedItems[existingItemIndex].quantity += quantity
          return updatedItems
        } else {
          // Si no existe, agregarlo
          return [...prevItems, cartItem]
        }
      })

      // Opcional: Enviar al backend para guardar en la base de datos
      // await addToCartAPI(cartItem)

      setIsLoading(false)
      return true
    } catch (err) {
      setError(err.message || 'Error al agregar producto al carrito')
      setIsLoading(false)
      return false
    }
  }, [])

  // Remover producto del carrito
  const removeFromCart = useCallback((itemId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId))
  }, [])

  // Actualizar cantidad de un producto
  const updateQuantity = useCallback((itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId)
      return
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    )
  }, [removeFromCart])

  // Limpiar el carrito
  const clearCart = useCallback(() => {
    setCartItems([])
    setError(null)
  }, [])

  // Calcular total del carrito
  const getTotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }, [cartItems])

  // Obtener cantidad total de items
  const getTotalItems = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }, [cartItems])

  const value = {
    cartItems,
    isLoading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotal,
    getTotalItems
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

