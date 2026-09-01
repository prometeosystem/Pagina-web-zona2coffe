import React from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import Header from './components/Header'
import Hero from './components/Hero'
import Gallery from './components/Gallery'
import Footer from './components/Footer'
import MenuVitrina from './components/MenuVitrina'

const routerBasename = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') || '/'

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

function AppRoutes() {
  const navigate = useNavigate()
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<HomePage onMenuClick={() => navigate('/menu')} />} />
          <Route path="/menu" element={
            <>
              <Header />
              <main><MenuVitrina /></main>
              <Footer />
            </>
          } />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter basename={routerBasename === '/' ? undefined : routerBasename}>
      <AppRoutes />
    </BrowserRouter>
  )
}
