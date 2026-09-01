import React, { useState, useRef, useEffect } from 'react'

const LazyImage = ({
  src,
  alt,
  className = '',
  placeholder = '',
  threshold = 0.1,
  rootMargin = '50px',
  style = {},
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef(null)
  const observerRef = useRef(null)

  useEffect(() => {
    // Si no hay src, no hay nada que observar
    if (!src) return

    // Si ya está cargada o en vista, no necesitamos observer
    if (isLoaded || isInView) return

    // Crear el observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting) {
          setIsInView(true)
          // Una vez que está en vista, desconectar el observer
          if (observerRef.current) {
            observerRef.current.disconnect()
          }
        }
      },
      {
        threshold,
        rootMargin
      }
    )

    // Observar la imagen
    if (imgRef.current) {
      observerRef.current.observe(imgRef.current)
    }

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [src, isLoaded, isInView, threshold, rootMargin])

  const handleLoad = () => {
    setIsLoaded(true)
    if (onLoad) onLoad()
  }

  const handleError = () => {
    setHasError(true)
    if (onError) onError()
  }

  return (
    <div
      ref={imgRef}
      className={`lazy-image-container ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        ...style
      }}
      onClick={props.onClick}
      {...props}
    >
      {/* Placeholder mientras no está en vista */}
      {!isInView && !isLoaded && (
        <div
          className="lazy-image-placeholder"
          style={{
            width: '100%',
            height: '200px', // Altura por defecto, se puede ajustar
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'loading 1.5s infinite ease-in-out',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
            fontSize: '0.875rem'
          }}
        >
          {placeholder || 'Cargando imagen...'}
        </div>
      )}

      {/* Imagen real - solo se renderiza cuando está en vista */}
      {isInView && src && !hasError && (
        <img
          src={src}
          alt={alt}
          className={`lazy-image ${isLoaded ? 'loaded' : 'loading'}`}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            width: '100%',
            height: 'auto',
            display: isLoaded ? 'block' : 'none',
            transition: 'opacity 0.3s ease-in-out',
            opacity: isLoaded ? 1 : 0
          }}
        />
      )}

      {/* Imagen de error */}
      {hasError && (
        <div
          className="lazy-image-error"
          style={{
            width: '100%',
            height: '200px',
            background: '#f8f9fa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6c757d',
            fontSize: '0.875rem',
            border: '1px solid #dee2e6',
            borderRadius: '0.25rem'
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '0.5rem', opacity: 0.5 }}>
              <path d="M21 3H3C1.9 3 1 3.9 1 5V19C1 20.1 1.9 21 3 21H21C22.1 21 23 20.1 23 19V5C23 3.9 22.1 3 21 3ZM21 19H3V5H21V19ZM14 17V15H10V17H14ZM14 13V7H10V13H14Z" fill="currentColor"/>
            </svg>
            <p style={{ margin: 0 }}>Imagen no disponible</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default LazyImage