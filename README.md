# Defensas de Diseño Gráfico 2026

Invitación y programa oficial del CEA Don Bosco “D”, El Prado, La Paz.

Creado por **Lic. Willy Renjifo Mamani — Docente de la Carrera de Diseño Gráfico**.

## Contenido actualizado

- Orden y títulos de la lista final oficial: 15 estudiantes, 14 participaciones.
- Martes 24 de noviembre: apertura 19:00–19:15, cierre a las 21:30.
- Miércoles 25 de noviembre: inicio a las 19:00, cierre a las 21:25.
- Excelencia Académica: socialización de artículos elaborados con la tutoría del Director Ivan Delgado Avila, en color lavanda.
- Jurados y tutores por jornada y modalidad; WhatsApp y ubicación.
- Invitación de audio original y los tres audios explicativos entregados por el organizador.
- Programa completo para imprimir.
- Portada con el título «Defensa de Proyectos Finales» en cursiva dorada con relieve (propuesta 04).
- Selector Claro/Oscuro disponible en la portada y en todo el sitio. Inicia en oscuro y recuerda la elección en el navegador; también la sincroniza entre pestañas.

## Vista local

Requiere Node.js 22 o superior. No requiere paquetes adicionales.

```text
npm run build
npm run dev
```

Abrir http://127.0.0.1:4318

## Sitio público

https://defensas-don-bosco-2026.vercel.app/

Publicado en Vercel, proyecto `defensas-don-bosco-2026`, equipo Renjifo.

## GitHub y Vercel

Repositorio oficial: https://github.com/RenjifoLeonel/defensas-don-bosco-2026

El repositorio está conectado al proyecto existente de Vercel. Los cambios enviados a la rama `main` generan una publicación automática. El proyecto usa `vercel.json`; la carpeta pública es `public` y la compilación es `npm run build`.

La página pública no requiere cuentas de los visitantes. El repositorio puede ser privado. No hay credenciales administrativas en estos archivos. La clave anónima del contador es pública.

## Audios de las modalidades

Los guiones están en `guiones/`. Las duraciones son aproximadas y deben comprobarse en los MP3 generados por ElevenLabs.

Los tres MP3 entregados ya están en `public/assets/`. Para reemplazarlos, actualizar `audioFile` en cada elemento de `modalities` de `public/event-data.json`. Ejemplo: `assets/modalidad-emprendimiento.mp3`. La compilación comprueba que los archivos existan. El sitio muestra el reproductor al disponer del audio y mantiene el texto accesible.

## Contador de visitas

Contador compartido conectado al proyecto Supabase `defensas-don-bosco-2026` (`bwwhdyyicbbinbtcyemm`), creado en la organización Renjifo. El costo informado de creación fue 0 USD mensuales.

La función `visit-counter` está desplegada. Cuenta un identificador aleatorio por sesión del navegador; las recargas y las pestañas que comparten la cookie de sesión no aumentan el total. Si las cookies están bloqueadas, usa la sesión de la pestaña. Si ambos almacenamientos están bloqueados, consulta el total sin incrementarlo. No es un conteo de personas únicas.

La tabla tiene RLS y no admite acceso directo desde el navegador. Las operaciones de registro y lectura solo las ejecuta la función del servidor. El frontend incluye exclusivamente la clave anónima pública, necesaria para el gateway con `verify_jwt=true`. La clave administrativa nunca sale de Supabase. La tabla guarda un identificador aleatorio y la fecha de visita; no guarda nombres ni direcciones IP. Los registros de infraestructura del proveedor son independientes.

Archivos de soporte: `supabase/counter-schema.sql`, `supabase/functions/visit-counter/index.ts`, `public/counter-config.json` y `public/visits.js`. Este contador informativo no implementa protección contra visitantes automatizados que generen sesiones nuevas.

## Apariencia y tipografía

Los estilos de los modos están en `public/theme.css` y la preferencia de color en `public/theme.js`. Si el navegador bloquea el almacenamiento, el botón continúa funcionando durante la visita. El programa para imprimir conserva su presentación sobre papel claro.

La portada usa Lobster Two Bold Italic, alojada con el sitio para no depender de una fuente externa. Fuente: https://github.com/google/fonts/tree/main/ofl/lobstertwo. Su licencia SIL Open Font License se incluye en `public/assets/fonts/OFL-LobsterTwo.txt`.

## Actualizar el programa

Editar `public/event-data.json` y ejecutar `npm run build`. El generador comprueba continuidad, duración, tutoría, 15 estudiantes únicos y los 3 espacios de Excelencia antes de crear el programa imprimible.

El PDF oficial establece nombres, orden, modalidades y títulos; no incluye horas. Las horas corresponden a las duraciones aprobadas por el organizador.
