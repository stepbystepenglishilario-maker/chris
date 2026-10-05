# Chris — asistente de tareas

Esta carpeta contiene la interfaz estática de Chris y un flujo de GitHub Actions para publicarla en GitHub Pages.

## Publicar la interfaz

1. Sube el contenido de esta carpeta a la rama `main` del repositorio `stepbystepenglishilario-maker/chris`.
2. En **Settings → Pages**, selecciona **GitHub Actions** como fuente.
3. El flujo `.github/workflows/pages.yml` publicará la interfaz en `https://stepbystepenglishilario-maker.github.io/chris/` al subir los cambios.

La interfaz queda publicada, pero el chat de IA mostrará un aviso hasta que conectemos un backend permitido por tu cuenta escolar. GitHub Pages solo sirve archivos estáticos: no pegues `OPENAI_API_KEY` en este repositorio, en `config.js` ni en JavaScript del navegador. Los secretos de GitHub Actions solo están disponibles durante los flujos de Actions, no cuando alguien visita la página.

Cuando tengamos un backend compatible, su URL pública irá en `config.js` como `window.CHRIS_API_BASE_URL`. La clave se guardará como secreto en ese backend.
