# Chronicles of the Chosen 🎮
### Crónicas de los Elegidos

Juego de plataformas cooperativo multijugador inspirado en Fireboy & Watergirl y Super Mario Bros,
con personajes de Percy Jackson y Harry Potter.

---

## 🚀 Inicio rápido (local)

No necesitas instalar nada. Solo abre con un servidor local:

```bash
# Opción 1 — Python (casi siempre disponible)
python3 -m http.server 8080
# Luego abre: http://localhost:8080

# Opción 2 — Node.js
npx serve .
# Luego abre: http://localhost:3000

# Opción 3 — VS Code + extensión "Live Server"
# Click derecho en index.html → "Open with Live Server"
```

> ⚠️ **Importante:** el juego usa ES Modules (`type="module"`).
> No funciona si abres `index.html` directamente como archivo local (file://).
> Siempre usa un servidor local.

---

## 🌐 Deploy en Netlify

### Primera vez
1. Crea una cuenta en [netlify.com](https://netlify.com)
2. En el dashboard → **"Add new site" → "Import an existing project"**
3. Conecta tu repositorio de GitHub
4. En "Build settings":
   - Build command: *(dejar vacío)*
   - Publish directory: `.`
5. Click **Deploy site**

Tu juego estará en `https://tu-nombre.netlify.app` en ~30 segundos.

### Para cambiar el dominio
En Netlify → Site settings → Domain management → Options → Edit site name.

---

## 🎮 Controles

| Acción      | Jugador 1      | Jugador 2 |
|-------------|----------------|-----------|
| Mover       | ← → ↑          | A D W     |
| Saltar      | ↑              | W         |
| Disparar    | M              | G         |
| Pausa       | P              | P         |
| Menú        | ESC            | ESC       |

**Móvil:** joystick virtual + botón de disparo (automático en pantallas táctiles).

---

## 📁 Estructura del proyecto

```
chronicles-of-the-chosen/
├── index.html              ← Entrada principal
├── netlify.toml            ← Config de deploy
├── README.md
└── src/
    ├── main.js             ← Config de Phaser y escenas
    ├── scenes/
    │   ├── BootScene.js    ← Carga y genera assets
    │   ├── MenuScene.js    ← Menú principal
    │   ├── CharSelectScene.js ← Selección de personaje
    │   ├── GameScene.js    ← Gameplay principal
    │   └── UIScene.js      ← HUD superpuesto
    ├── entities/
    │   ├── Player.js       ← Clase jugador
    │   └── Enemy.js        ← Clase enemigo base
    └── utils/
        └── LevelBuilder.js ← Constructor de niveles
```

---

## 🗺️ Personajes (Fase 1)

| Personaje | Disparo | Habilidad especial |
|---|---|---|
| Percy Jackson | Hielo | x2 velocidad en agua, inmortalidad acuática |
| Annabeth Chase | Aire | Revela pasajes ocultos |
| Grover Underwood | Tierra | Escala paredes, empuja bloques |
| Harry Potter | Fuego | Vuelo breve |
| Hermione Granger | Rayo | Congela tiempo |
| Ron Weasley | Plasma | Escudo + rompe bloques |

---

## 📅 Fases de desarrollo

- [x] **Fase 1** — Motor base: personajes, nivel, enemigos, coleccionables, deploy
- [ ] **Fase 2** — 13 mundos completos, mapa de progresión, pistas crípticas
- [ ] **Fase 3** — Multijugador online (Supabase Realtime), perfiles, progreso guardado
- [ ] **Fase 4** — Easter egg / propuesta secreta 🥚💍

---

## 🔧 Agregar sprites reales

Cuando tengas sprites pixel-art reales, en `BootScene.js` reemplaza las líneas de `_makeCharSprite` con:

```js
this.load.spritesheet('percy', 'assets/sprites/percy.png', { frameWidth: 24, frameHeight: 32 });
```

Y sube los archivos a la carpeta `assets/sprites/`.

---

*Desarrollado con ❤️ usando Phaser 3 + Netlify + Supabase*
