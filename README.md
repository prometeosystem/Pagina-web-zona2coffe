# Zona 2 - Coffee Recovery (Starter Site)

Proyecto React (Vite) minimal para la cafetería Zona 2. Incluye paleta de colores, componentes y estructura clara para expansión.

## Estructura
- `index.html` - punto de entrada
- `src/main.jsx` - render
- `src/App.jsx` - layout principal
- `src/components/*` - componentes reutilizables
- `src/styles/*` - variables y estilos globales
- `public/` - assets (logo, imágenes)
 - `public/assets/` - imágenes estandarizadas (imagenUno..imagenDiez)

## Paleta (variables CSS)
- `--matcha-50: #f1f5f1` (fondos claros)
- `--matcha-500: #2d5a27` (botón primario)
- `--matcha-600: #23461f` (hover primario)
- `--coffee-500: #6f4e37` (botón secundario)
- `--coffee-600: #5d4037` (hover secundario)
- `--gray-200: #e5e7eb` (bordes suaves)
- `--gray-300: #d1d5db` (bordes inputs)

## Cómo usar
1. Instalar dependencias:

```bash
cd "Pagina web/zona2-site"
npm install
```

2. Ejecutar en modo desarrollo:

```bash
npm run dev
```

3. Abrir `http://localhost:5173` (o la URL que indique Vite).

## Notas y siguientes pasos
- Copia tu logo exportado (`logo.png`) y las fotos (ej. `coffee1.jpg`...) a `public/` o `public/assets/`.
 - Copia tu logo exportado (`logo.png`) y las fotos (ej. `imagenUno.jpg`...) a `public/assets/`.
- Reemplaza `src/data/menu.json` con tu menú real (o implementa API).
- Puedo añadir: rutas, carrito y formulario de contacto.
