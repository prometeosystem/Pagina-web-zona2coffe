# Sitio público de Zona 2 Coffee Recovery

HTML estático, sin bundler ni dependencias. Se edita directo:

- `index.html` — la página completa
- `css/style.css` — estilos
- `js/script.js` — interacciones
- `images/` — imágenes y logos

Las librerías externas (Swiper, GSAP, AOS, Font Awesome) se cargan por CDN, así
que no hay `node_modules` ni `npm install`.

## Publicar

`npm run build` copia el sitio a `dist/`, que es la carpeta que sirve nginx. No
compila nada: solo separa lo publicado del resto del repositorio para no exponer
`.git` en la web.

En el servidor:

```
cd /var/www/cafeteria-zona2/production/web
git pull origin main
npm run build
```

Queda publicado en https://prothec.com.mx/zona2/

Las rutas de `index.html` son relativas a propósito (`css/style.css`, no
`/css/style.css`), porque el sitio no vive en la raíz del dominio sino bajo
`/zona2/`.

## Versión anterior

Hasta septiembre de 2026 este sitio era una aplicación React con Vite. Se
reemplazó por esta versión estática; el historial de git conserva aquella.
