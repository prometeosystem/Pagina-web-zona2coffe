import React from 'react'

export default function Footer(){
  return (
    <footer className="site-footer py-4" data-aos="fade-up">
      <div className="container d-flex justify-content-between align-items-center">
        <small className="text-muted">Zona 2 &copy; {new Date().getFullYear()} · Coffee Recovery</small>
        <div>
          <a href="https://prothec.vercel.app/" target="_blank" rel="noopener noreferrer" className="underline">Desarrollado por Prothec</a>
        </div>
      </div>
    </footer>
  )
}
