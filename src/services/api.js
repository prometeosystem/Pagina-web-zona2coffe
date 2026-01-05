// Configuración de la API
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

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
      // Intentar obtener más información del error
      let errorMessage = `Error al obtener los productos: ${response.status} ${response.statusText}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.detail || errorData.message || errorMessage
      } catch (e) {
        // Si no se puede parsear el JSON, usar el mensaje por defecto
        const text = await response.text()
        if (text) {
          errorMessage = `${errorMessage} - ${text}`
        }
      }
      throw new Error(errorMessage)
    }

    return await response.json()
  } catch (error) {
    // Mejorar el mensaje de error para problemas de conexión
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('Error de conexión con el backend:', {
        message: error.message,
        url: `${API_BASE_URL}/productos/ver_productos`,
        suggestion: 'Verifica que el backend esté corriendo en el puerto 8000'
      })
      throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.')
    }
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
 * @param {Object} preordenData - Datos de la pre-orden (nombre_cliente, tipo_servicio, comentarios, tipo_leche, extra_leche)
 * @param {Array} detalles - Detalles de la pre-orden (ya formateados con id_producto, cantidad, observaciones)
 * @returns {Promise<Object>} - Respuesta del servidor con el ID de la pre-orden
 */
export const createPreorden = async (preordenData, detalles) => {
  try {
    // Crear la pre-orden según el schema PreordenCreate
    // El backend calcula el total y obtiene los precios de la BD
    const preordenPayload = {
      nombre_cliente: preordenData.nombre_cliente || null,  // Opcional
      detalles: detalles,  // ✅ Debe ser "detalles" no "items"
      // Campos adicionales que el backend puede usar (si los soporta)
      tipo_servicio: preordenData.tipo_servicio || null,  // 'comer-aqui' o 'para-llevar'
      comentarios: preordenData.comentarios || null,  // Comentarios generales
      tipo_leche: preordenData.tipo_leche || null,  // 'entera' o 'deslactosada'
      extra_leche: preordenData.extra_leche || 0  // Extra por leche deslactosada ($15)
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

