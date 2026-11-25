# MateAventura 3D — Videojuego Educativo Indie estilo Nintendo

Aplicación web educativa interactiva tipo **Duolingo + Indie Nintendo 3D** diseñada para el aprendizaje lúdico de matemáticas básicas (sumas y restas) en 4 niveles progresivos con retroalimentación visual 3D, efectos de sonido sintetizados mediante Web Audio API y un sistema de recompensas.

## Niveles del Juego

1. **Nivel 1 — Batalla de Superhéroes**: Resuelve sumas y restas básicas para lanzar rayos de energía contra el *Dr. Glitcheo* (3 aciertos para vencer).
2. **Nivel 2 — Carrera Matemática**: Conduce un kart por una autopista de 3 carriles y cruza por el portal con el resultado correcto usando teclado (`←` / `→`), botones en pantalla o haciendo clic directamente en el carril 3D.
3. **Nivel 3 — Plataformas tipo Mario (Conteo activo y evolución)**: Presiona `Espacio` o el botón **¡SALTAR!** la cantidad exacta que indica la operación del bloque misterioso, con contador en tiempo real sobre el personaje 3D, para evolucionar con capa y corona real.
4. **Nivel 4 — Reflexión con el Búho Mentor**: Novela visual interactiva en un claro del bosque 3D donde el Búho Sabio resume tus logros, realiza 2 preguntas metacognitivas (selección rápida + texto libre) y entrega un certificado y medalla imprimibles.

## Características Técnicas

- **Motor 3D**: Three.js con escenarios diorama low-poly, iluminación hemisférica + sombras suaves, partículas 3D y modelos personalizados.
- **Audio Sintetizado**: Web Audio API (`src/audio/soundEngine.ts`) sin archivos externos (saltos, aciertos, ataques, turbo, errores, evolución, fanfarria y búho).
- **Rejugabilidad**: Generación aleatoria progresiva de operaciones (`src/utils/mathGenerator.ts`) en cada partida.
- **Accesibilidad**: Controles completos mediante teclado y clics/toques en pantalla.

## Ejecutar en Local

```bash
npm install
npm run dev
```

## Compilar Producción

```bash
npm run typecheck
npm run build
```
