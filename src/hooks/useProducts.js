import { useState, useEffect } from 'react'
import { getProducts, API_BASE_URL } from '../services/api'

/**
 * Hook para obtener productos del backend
 * Transforma los productos del backend al formato esperado por los componentes
 */
export const useProducts = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getProducts()
        
        // Transformar productos del backend al formato esperado
        // El backend ya filtra por activo=1, pero filtramos de nuevo por seguridad
        const transformedProducts = data
          .filter(product => product.activo === 1) // Solo productos activos
          .map(product => {
            // El precio viene como número decimal del backend (ej: 25.50)
            const precio = parseFloat(product.precio || 0)
            
            // Formatear precio para mostrar (sin decimales si es entero, con 2 decimales si no)
            const precioFormateado = precio % 1 === 0 
              ? precio.toFixed(0) 
              : precio.toFixed(2)

            const productId = product.id_producto || product.id
            // El backend puede enviar imagen_url como data URL base64 O solo tipo_imagen
            // Si hay imagen_url (data URL), usarlo directamente
            // Si no hay imagen_url pero hay tipo_imagen, construir URL del endpoint
            let imageUrl = null
            if (product.imagen_url) {
              // Prioridad 1: usar imagen_url del backend (data URL base64)
              imageUrl = product.imagen_url
            } else if (product.tipo_imagen && product.tipo_imagen.trim() !== '') {
              // Prioridad 2: si hay tipo_imagen pero no imagen_url, usar endpoint del backend
              imageUrl = `${API_BASE_URL}/productos/imagen/${productId}`
            }

            return {
              // IDs - compatible con ambos formatos
              id: productId,
              id_producto: productId,
              
              // Nombres
              name: product.nombre || product.name || '',
              nombre: product.nombre || product.name || '',
              
              // Descripciones
              desc: product.descripcion || product.desc || '',
              descripcion: product.descripcion || product.desc || '',
              
              // Precios - mantener ambos formatos
              price: precioFormateado,
              precio: precio,
              
              // Imagen del backend - usar imagen_url (data URL) si existe, sino null
              image: imageUrl,
              imagen: imageUrl,
              image_url: imageUrl,
              url_imagen: imageUrl,
              
              // Tamaños (si el backend los tiene en el futuro)
              size: product.tamaño || product.size || null,
              size2: product.tamaño2 || product.size2 || null,
              price2: product.precio2 ? (typeof product.precio2 === 'string' 
                ? parseFloat(product.precio2.replace('$', '').replace(',', '').trim()).toFixed(2)
                : product.precio2.toFixed(2)) : null,
              
              // Categoría del backend (ej: "Bebidas Calientes", "Alimentos")
              categoria: product.categoria || product.categoria_id || null,
              
              // Estado - el backend retorna activo como 1 o 0
              activo: product.activo === 1 || product.activo === true,
              
              // Tiempo de preparación (opcional)
              tiempo_preparacion: product.tiempo_preparacion || null,
              
              // Producto original completo
              originalProduct: product
            }
          })
        
        setProducts(transformedProducts)
      } catch (err) {
        console.error('Error obteniendo productos:', err)
        setError(err.message || 'Error al cargar los productos')
        // En caso de error, mantener array vacío para que no se rompa la UI
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return { products, loading, error }
}

/**
 * Organiza productos por categoría
 * Si el backend no tiene categorías, retorna todos los productos en una sola categoría
 */
export const useProductsByCategory = () => {
  const { products, loading, error } = useProducts()
  
  const organizeByCategory = (products) => {
    // Mapeo de categorías del backend a las categorías del frontend
    // El backend retorna categorías como "Bebidas Calientes", "Alimentos", etc.
    const categoryMap = {
      // Bebidas Calientes
      'bebidas calientes': 'bebidasCalientes',
      'bebidas-calientes': 'bebidasCalientes',
      'bebidas_calientes': 'bebidasCalientes',
      
      // Bebidas Frías
      'bebidas frías': 'bebidasFrias',
      'bebidas frias': 'bebidasFrias',
      'bebidas-frías': 'bebidasFrias',
      'bebidas-frias': 'bebidasFrias',
      'bebidas_frias': 'bebidasFrias',
      
      // Shots de Energía
      'shots de energía': 'shotsEnergia',
      'shots de energia': 'shotsEnergia',
      'shots-energia': 'shotsEnergia',
      'shots-de-energia': 'shotsEnergia',
      'shots_de_energia': 'shotsEnergia',
      
      // Bebidas con Proteína
      'bebidas con proteína': 'bebidasProteina',
      'bebidas con proteina': 'bebidasProteina',
      'bebidas-proteina': 'bebidasProteina',
      'bebidas-con-proteina': 'bebidasProteina',
      'bebidas_con_proteina': 'bebidasProteina',
      'bebidas fitness': 'bebidasProteina',
      'bebidas-fitness': 'bebidasProteina',
      'bebidas_fitness': 'bebidasProteina',
      
      // Menú Dulce
      'menú dulce': 'menuDulce',
      'menu dulce': 'menuDulce',
      'menú-dulce': 'menuDulce',
      'menu-dulce': 'menuDulce',
      'menu_dulce': 'menuDulce',
      
      // Menú Salado
      'menú salado': 'menuSalado',
      'menu salado': 'menuSalado',
      'menú-salado': 'menuSalado',
      'menu-salado': 'menuSalado',
      'menu_salado': 'menuSalado',
      
      // Ensaladas
      'ensaladas': 'ensaladas',
      
      // Otros (Alimentos, Postres, etc.)
      'alimentos': 'menuSalado', // Mapear Alimentos a Menú Salado
      'postres': 'menuDulce', // Mapear Postres a Menú Dulce
      'otros': 'otros'
    }

    const organized = {
      bebidasCalientes: [],
      bebidasFrias: [],
      shotsEnergia: [],
      bebidasProteina: [],
      menuDulce: [],
      menuSalado: [],
      ensaladas: [],
      otros: []
    }

    // Si no hay productos, retornar estructura vacía
    if (products.length === 0) {
      return organized
    }

    products.forEach(product => {
      // Normalizar la categoría: convertir a minúsculas y quitar espacios extra
      let categoria = product.categoria?.toLowerCase().trim() || product.categoria_id?.toLowerCase().trim() || ''
      
      // Lógica especial para "Bebidas Fitness": diferenciar entre shots de energía y bebidas con proteína
      if (categoria === 'bebidas fitness') {
        const descripcion = (product.descripcion || product.desc || '').toLowerCase()
        const nombre = (product.nombre || product.name || '').toLowerCase()
        
        // Si la descripción contiene "scoop" o el nombre contiene palabras clave de proteína
        // entonces es una bebida con proteína, de lo contrario es un shot de energía
        if (descripcion.includes('scoop') || descripcion.includes('proteína') || descripcion.includes('proteina')) {
          categoria = 'bebidas con proteina' // Mapear a bebidas con proteína
        } else {
          categoria = 'shots de energia' // Mapear a shots de energía
        }
      }
      
      const mappedCategory = categoryMap[categoria] || 'otros'
      
      if (organized[mappedCategory]) {
        organized[mappedCategory].push(product)
      } else {
        organized.otros.push(product)
      }
    })
    
    // Si todos los productos fueron a "otros" y hay muchos, podría ser que no hay categorías
    // En ese caso, distribuir entre las categorías principales
    if (organized.otros.length === products.length && products.length > 0) {
      // Distribuir productos entre categorías si no tienen categoría asignada
      const categories = ['bebidasCalientes', 'bebidasFrias', 'shotsEnergia', 'bebidasProteina', 'menuDulce', 'menuSalado', 'ensaladas']
      products.forEach((product, index) => {
        const categoryIndex = index % categories.length
        organized[categories[categoryIndex]].push(product)
      })
      organized.otros = []
    }

    return organized
  }

  const productsByCategory = organizeByCategory(products)

  return { productsByCategory, loading, error, allProducts: products }
}

