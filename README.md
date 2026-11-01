# 🥋 PokerDojo Mobile — Texas Hold'em Trainer

**PokerDojo Mobile** es una aplicación web progresiva (PWA) moderna, mobile-first y gamificada (estilo Duolingo), diseñada para aprender a leer la mesa de poker Texas Hold'em desde el celular, dominar la jerarquía de manos, entender desempates por kicker y tomar decisiones preflop óptimas.

---

## 📱 Características Principales

- **Diseño 100% Mobile-First:** Modo oscuro elegante (`#0f172a`), botones táctiles grandes para el pulgar y sin scroll horizontal.
- **Baraja Oficial de 4 Colores:**
  - ♠ **Picas:** Negro Carbón (`#0f172a`)
  - ♥ **Corazones:** Rojo Fuego (`#dc2626`)
  - ♦ **Diamantes:** Azul Zafiro (`#2563eb`)
  - ♣ **Tréboles:** Verde Esmeralda (`#16a34a`)
- **Efectos Educativos Gamificados:**
  - ✨ **Resplandor Dorado:** Ilumina exactamente las **5 cartas de la combinación ganadora**.
  - 🔥 **Racha de Aciertos:** Contador de victorias seguidas con animación.
  - ⚡ **Puntos XP:** Gana experiencia por cada mano acertada.
  - 🔊 **Audio Sintetizado:** Efectos sonoros y confeti nativo sin dependencias externas pesadas.
  - 💾 **Progreso Guardado:** Guarda tu nivel, racha y lecciones en `localStorage`.

---

## 🥋 Los 4 Modos de Aprendizaje

1. **⚔️ ¿Quién Gana el Pozo? (Comparación de Combinaciones):**
   - 5 comunitarias en el centro vs 2 jugadores.
   - Elige entre *[Gana A]*, *[Empate]* o *[Gana B]*.
   - **30 Lecciones Guiadas Progresivas:**
     - **Nivel 1 (Novato):** Diferencias claras (Pareja vs Doble Pareja, Trío vs Escalera, Color vs Full House).
     - **Nivel 2 (Intermedio):** Desempates por Kicker, Escalera Wheel (A-2-3-4-5) y duelos de color.
     - **Nivel 3 (Avanzado / Trampas):** Manos compartidas en mesa (Split Pot / *Playing the board*), trampas de triple pareja y full houses engañosos.
     - **🎲 Modo Infinito:** Generador combinatorio aleatorio con evaluación matemática exacta de 7 cartas ($\binom{7}{5} = 21$ combinaciones).

2. **👁️ Entrena tu Ojo:**
   - Tus 2 cartas de mano + cartas en mesa.
   - Identifica tu mejor combinación en menos de 3 segundos con 4 opciones rápidas.

3. **🚦 Semáforo Preflop:**
   - Muestra tus 2 cartas iniciales, tu posición en la mesa (UTG, MP, CO, BTN, SB, BB) y tu tamaño de stack en ciegas (BB).
   - Opciones: `[ 🔴 FOLD ]`, `[ 🟡 CALL ]`, `[ 🟢 RAISE ]`.
   - Explicación técnica en 1 línea con lógica GTO / juego tight-aggressive.

4. **📚 Jerarquía Interactiva:**
   - Acordeón de bolsillo con las 10 combinaciones del poker (#1 Escalera Real al #10 Carta Alta).
   - Cartas visuales en 4 colores, probabilidades matemáticas reales y regla mnemotécnica para memorizar.

---

## 🏠 Opción A: Jugar en Casa por Wi-Fi (Servidor Local con Código QR)

Si quieres probarlo inmediatamente en tu teléfono dentro de tu casa:

1. Abre una terminal en esta carpeta y ejecuta:
   ```bash
   python run_mobile_server.py
   ```
2. La consola te mostrará un **Código QR en pantalla** y la dirección IP (por ejemplo `http://192.168.1.121:8080`).
3. Abre la cámara de tu celular, apunta al QR o escribe la dirección en el navegador de tu teléfono conectado al mismo Wi-Fi.

---

## ☁️ Opción B: Subir a la Nube con GitHub Desktop para Jugar Fuera de Casa (Gratis)

Para poder jugarlo en el autobús, metro, calle o gimnasio con tus datos móviles (4G/5G):

### Paso 1: Abrir la carpeta en GitHub Desktop
1. En **GitHub Desktop**, haz clic en el menú superior: **File** -> **Add Local Repository** (o pulsa `Ctrl + O`).
2. En *Local Path*, presiona **Choose...** y selecciona la carpeta:
   `c:\Users\migue\Music\poker_trainer_mobile`
3. Si GitHub Desktop te muestra el mensaje: *"This directory does not appear to be a Git repository. Would you like to create a repository here?"*:
   - Haz clic en el enlace azul **create a repository**.
   - Deja el nombre como `poker_trainer_mobile` y presiona **Create repository**.

### Paso 2: Guardar los Cambios (Commit)
1. En la esquina inferior izquierda de GitHub Desktop, en el cuadro de *Summary*, escribe:
   `Primer lanzamiento PokerDojo Mobile`
2. Presiona el botón azul **Commit to main**.

### Paso 3: Publicar en GitHub
1. En la barra superior de GitHub Desktop, presiona el botón **Publish repository**.
2. **IMPORTANTE:** En la ventana que aparece, **desmarca** la casilla *"Keep this code private"* para que tu repositorio sea público (así GitHub Pages es 100% gratuito).
3. Presiona **Publish repository**.

### Paso 4: Activar GitHub Pages (Web Hosting Gratuito)
1. En GitHub Desktop, ve al menú superior: **Repository** -> **View on GitHub** (se abrirá en tu navegador).
2. En la página web de tu repositorio, haz clic en la pestaña **Settings** (⚙️ con forma de engranaje arriba a la derecha).
3. En el menú lateral izquierdo, haz clic en **Pages**.
4. En la sección **Build and deployment** -> **Branch**:
   - Cambia *None* por **main** (o *master*).
   - Deja la carpeta en **/ (root)**.
   - Presiona el botón **Save**.

### Paso 5: ¡Listo para Jugar en tu Celular!
En aproximadamente 1 o 2 minutos, GitHub generará tu enlace oficial en la nube:
👉 `https://tu-usuario.github.io/poker_trainer_mobile/`

Abre ese enlace en tu celular desde cualquier lugar del mundo y:
- **En iPhone (Safari):** Toca el botón central de *Compartir* (cuadrado con flecha hacia arriba) y selecciona **"Añadir a pantalla de inicio"**.
- **En Android (Chrome):** Toca los tres puntos (⋮) arriba a la derecha y selecciona **"Instalar aplicación"** o **"Añadir a la pantalla de inicio"**.

¡PokerDojo se instalará como una App nativa con su icono de ficha de poker y funcionará incluso sin cobertura de internet gracias a su modo offline!
