import React, { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/global.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'aos/dist/aos.css'
import 'animate.css/animate.min.css'
import AOS from 'aos'

function Root(){
  useEffect(()=>{
    AOS.init({duration:700,once:true,mirror:false})
  },[])

  return <App />
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)
