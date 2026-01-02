import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import Menu from './components/Menu'
import Gallery from './components/Gallery'
import Footer from './components/Footer'
import MenuPage from './components/MenuPage'
import Cart from './components/Cart'
import { CartProvider } from './context/CartContext'

export default function App(){
  const [showMenuPage, setShowMenuPage] = useState(false)
  const [showCart, setShowCart] = useState(false)

  useEffect(() => {
    // Manejar hash en URL para mostrar menú
    const handleHashChange = () => {
      if (window.location.hash === '#menu') {
        setShowMenuPage(true)
        window.scrollTo(0, 0)
      } else {
        setShowMenuPage(false)
      }
    }

    // Verificar hash inicial
    handleHashChange()

    // Escuchar cambios en el hash
    window.addEventListener('hashchange', handleHashChange)

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [])

  const handleShowMenu = () => {
    setShowMenuPage(true)
    window.location.hash = '#menu'
    window.scrollTo(0, 0)
  }

  const handleCloseMenu = () => {
    setShowMenuPage(false)
    window.location.hash = ''
    window.scrollTo(0, 0)
  }

  const handleShowCart = () => {
    setShowCart(true)
  }

  const handleCloseCart = () => {
    setShowCart(false)
  }

  if (showMenuPage) {
    return (
      <CartProvider>
        <div className="app">
          <Header onMenuClick={handleShowMenu} />
          <main>
            <MenuPage onClose={handleCloseMenu} onCartClick={handleShowCart} isCartOpen={showCart} />
          </main>
          <Footer />
          <Cart isOpen={showCart} onClose={handleCloseCart} />
        </div>
      </CartProvider>
    )
  }

  return (
    <CartProvider>
      <div className="app">
        <Header onMenuClick={handleShowMenu} />
        <main>
          <Hero onMenuClick={handleShowMenu} />
          <section className="container">
            <Menu />
            <Gallery />
          </section>
        </main>
        <Footer />
        <Cart isOpen={showCart} onClose={handleCloseCart} />
      </div>
    </CartProvider>
  )
}
