// Configuración de la API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

/**
 * Obtiene todos los productos activos del menú
 * @returns {Promise<Array>} - Array de productos
 */
export const getProducts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/productos/ver_productos`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Error al obtener los productos')
    }

    return await response.json()
  } catch (error) {
    console.error('Error obteniendo productos:', error)
    throw error
  }
}

/**
 * Valida si un producto existe en la base de datos
 * @param {number} productId - ID del producto a validar
 * @returns {Promise<boolean>} - true si el producto existe y está disponible
 */
export const validateProduct = async (productId) => {
  try {
    // Obtener todos los productos y verificar si el producto existe
    const products = await getProducts()
    const product = products.find(p => p.id_producto === productId || p.id === productId)
    return product !== undefined && product.activo !== false
  } catch (error) {
    console.error('Error validando producto:', error)
    // Si falla la validación, permitimos agregar el producto para no bloquear la experiencia
    return true
  }
}

/**
 * Crea una pre-orden (pedido público desde la web)
 * @param {Object} preordenData - Datos de la pre-orden (nombre_cliente, observaciones generales)
 * @param {Array} items - Items del carrito
 * @returns {Promise<Object>} - Respuesta del servidor con el ID de la pre-orden
 */
export const createPreorden = async (preordenData, items) => {
  try {
    // Preparar los detalles según el formato que espera el backend
    // El backend espera: detalles con id_producto, cantidad, observaciones (opcional)
    const detalles = items.map(item => ({
      id_producto: item.productId,
      cantidad: item.quantity,
      observaciones: item.observaciones || null  // Observaciones específicas del item (opcional)
    }))

    // Crear la pre-orden según el schema PreordenCreate
    // El backend calcula el total y obtiene los precios de la BD
    const preordenPayload = {
      nombre_cliente: preordenData.nombre_cliente || null,  // Opcional
      detalles: detalles  // ✅ Debe ser "detalles" no "items"
    }

    const response = await fetch(`${API_BASE_URL}/preordenes/crear_preorden`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preordenPayload),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.message || 'Error al crear la pre-orden')
    }

    return await response.json()
  } catch (error) {
    console.error('Error creando pre-orden:', error)
    throw error
  }
}

