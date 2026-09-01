import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Hero from './components/Hero'
import Gallery from './components/Gallery'
import Footer from './components/Footer'
import MenuVitrina from './components/MenuVitrina'

function HomePage({ onMenuClick }) {
  return (
    <>
      <Header onMenuClick={onMenuClick} />
      <main>
        <Hero onMenuClick={onMenuClick} />
        <section className="container">
          <Gallery />
        </section>
      </main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<HomePage onMenuClick={() => window.location.href = '/menu'} />} />
          <Route path="/menu" element={
            <>
              <Header />
              <main><MenuVitrina /></main>
              <Footer />
            </>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
