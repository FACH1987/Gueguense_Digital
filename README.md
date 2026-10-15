# Güegüense Digital

Sitio web estático y responsive para Güegüense Digital, desarrollado con HTML, CSS y JavaScript nativos. No requiere base de datos, dependencias ni herramientas de compilación.

## Probar localmente

Abre `index.html` en un navegador, o inicia un servidor local para probar la navegación:

```bash
python -m http.server 8000
```

Luego visita <http://localhost:8000>.

## Formulario de contacto

El formulario valida los campos en el navegador y prepara una consulta en WhatsApp con el nombre, el correo, el servicio seleccionado y el mensaje. La persona usuaria revisa y envía el mensaje directamente en WhatsApp; los datos no se guardan ni se transmiten a un servidor.

## Publicar con GitHub Pages

1. Sube estos archivos a la rama `main` de un repositorio de GitHub.
2. En el repositorio, abre **Settings → Pages**.
3. En **Build and deployment**, selecciona **Deploy from a branch**, la rama `main` y la carpeta `/(root)`, y guarda.

GitHub Pages publicará el sitio estático en la dirección indicada en la configuración de Pages.

## Personalización

- Edita los textos, las secciones y los datos de contacto en `index.html`.
- Ajusta la paleta, la tipografía y el diseño responsive en `styles.css`.
- Actualiza el comportamiento del menú y el formulario en `script.js`.
