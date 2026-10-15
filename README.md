# Güegüense Digital

Sitio web estático y responsive para Güegüense Digital, desarrollado con HTML, CSS y JavaScript nativos. No requiere herramientas de compilación. La sección de reseñas y “me gusta” usa Supabase para compartir los datos entre visitantes.

## Probar localmente

Abre `index.html` en un navegador, o inicia un servidor local para probar la navegación:

```bash
python -m http.server 8000
```

Luego visita <http://localhost:8000>.

## Formulario de contacto

El formulario valida los campos en el navegador y prepara una consulta en WhatsApp con el nombre, el correo, el servicio seleccionado y el mensaje. La persona usuaria revisa y envía el mensaje directamente en WhatsApp; los datos no se guardan ni se transmiten a un servidor.

## Reseñas y “me gusta”

La sección de reseñas requiere un proyecto de Supabase. Hasta configurar la conexión, muestra un aviso y mantiene deshabilitados el formulario y el botón de “me gusta”.

1. Abre el [SQL Editor del proyecto de Güegüense Digital](https://supabase.com/dashboard/project/ntpbxjssojyoscfgnucb/sql/new) e inicia sesión.
2. Abre **SQL Editor**, pega el contenido de `supabase-setup.sql` y ejecuta la consulta.
3. `supabase-config.js` ya contiene la URL del proyecto y la clave pública **Publishable**. La clave es pública y está diseñada para usarse desde el navegador.
4. Publica el sitio. GitHub Pages sirve los archivos estáticos y Supabase almacena las reseñas y los “me gusta”.

El sitio no habilita la publicación hasta comprobar que Supabase responde correctamente. Si las reseñas muestran un aviso de que el servicio no está disponible, comprueba que se haya ejecutado `supabase-setup.sql` en el proyecto correcto.

Las reseñas se publican inmediatamente y son visibles para cualquier visitante; el formulario no solicita ni almacena correos. El identificador anónimo para los “me gusta” se guarda en el navegador. **Nunca pongas una clave `service_role` o `sb_secret_` en `supabase-config.js` ni en el sitio público.**

La primera versión no incluye moderación ni CAPTCHA. Si el sitio recibe spam, conviene añadirlos antes de ampliar el sistema.

## Publicar con GitHub Pages

1. Sube estos archivos a la rama `main` de un repositorio de GitHub.
2. En el repositorio, abre **Settings → Pages**.
3. En **Build and deployment**, selecciona **Deploy from a branch**, la rama `main` y la carpeta `/(root)`, y guarda.

GitHub Pages publicará el sitio estático en la dirección indicada en la configuración de Pages.

## Personalización

- Edita los textos, las secciones y los datos de contacto en `index.html`.
- Ajusta la paleta, la tipografía y el diseño responsive en `styles.css`.
- Actualiza el comportamiento del menú y el formulario en `script.js`.
