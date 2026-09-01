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

## Ecosistema de repos

| Repo | Responsabilidad |
|------|-----------------|
| `punto-venta-cafeteria-BackEnd` | API FastAPI + MySQL |
| `punto-venta-cafeteria` | Frontend POS |
| `Pagina-web-zona2coffe` (este) | Sitio web público |

## Cómo trabajar cambios

Historial **lineal** (estilo fast-forward / rebase). No se hace push directo a `main`.

1. Clonar y usar la rama de trabajo:
   ```bash
   git clone https://github.com/prometeosystem/Pagina-web-zona2coffe.git
   cd Pagina-web-zona2coffe
   git checkout dev-juan
   git pull --ff-only origin dev-juan
   ```
2. Crear una rama de feature desde `dev-juan`:
   ```bash
   git checkout -b feature/nombre-corto
   ```
3. Hacer commits pequeños y claros (evitar secretos: `.env`, tokens).
4. Antes de subir, actualizar con fast-forward only:
   ```bash
   git fetch origin
   git pull --ff-only origin dev-juan
   ```
5. Push de la feature y abrir PR hacia `dev-juan` (integración a `main` con PR `dev-juan` → `main`).
6. Esperar CI verde (GitHub Actions).
7. Merge con **Rebase and merge** (historial lineal).
8. Si `main` avanzó, rebasear antes del PR:
   ```bash
   git fetch origin
   git rebase origin/main
   ```
9. Nunca: push forzado a `main`, ni commits de `node_modules/`, `dist/` o `.env`.

Configuración local recomendada (solo en este repo):

```bash
git config pull.ff only
```

## Notas y siguientes pasos
- Copia tu logo exportado (`logo.png`) y las fotos (ej. `coffee1.jpg`...) a `public/` o `public/assets/`.
- Copia tu logo exportado (`logo.png`) y las fotos (ej. `imagenUno.jpg`...) a `public/assets/`.
- Reemplaza `src/data/menu.json` con tu menú real (o implementa API).
- Puedo añadir: rutas, carrito y formulario de contacto.
