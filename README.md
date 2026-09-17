# apps

Colección de web apps estáticas que se publican juntas en GitHub Pages. La página de inicio imita la pantalla de inicio de un iPhone: cada app es un ícono.

- Inicio: https://leonardoramirezr.github.io/apps/
- WillChat: https://leonardoramirezr.github.io/apps/willchat/

## Estructura

```
.
├── home/                    # Pantalla de inicio (SvelteKit + Svelte 5)
├── apps/
│   └── willchat/            # Una carpeta por app
│       ├── app.json         # Manifiesto: { "name": "WillChat" }
│       ├── icon.svg         # Ícono de la app
│       └── …
├── brand/logos/             # Propuestas de logo del sitio (fuera del build)
├── scripts/
│   ├── build.mjs            # Construye el inicio y todas las apps en dist/
│   └── preview.mjs          # Sirve dist/ igual que GitHub Pages
└── .github/workflows/deploy.yml
```

## Contrato de una app

Cada carpeta dentro de `apps/` es una app y se publica en `<BASE_PATH>/<carpeta>/`. El inicio las descubre al compilar, así que no hay que registrarlas en otro lado.

| Archivo        | Qué debe contener                                                                                        |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| `app.json`     | `{ "name": "Nombre visible" }`                                                                           |
| `icon.svg`     | Ícono cuadrado, a sangre completa y sin esquinas redondeadas: el inicio aplica la máscara.               |
| `package.json` | Un script `build` que genere `build/index.html` usando la variable de entorno `BASE_PATH` como ruta base. |

Además:

- El nombre de la carpeta es parte de la URL: solo minúsculas, dígitos y guiones.
- Todo se renderiza en el cliente; ninguna app necesita backend propio.
- Todas las apps comparten el origen `leonardoramirezr.github.io`, y por lo tanto `localStorage` e IndexedDB. Usa un prefijo propio en las claves (p. ej. `willchat:`).

Para una app nueva con SvelteKit, parte de `pnpm dlx sv create apps/<carpeta> --template minimal --types ts --add sveltekit-adapter="adapter:static"` y copia de `apps/willchat` dos detalles: `paths.base` leído de `BASE_PATH` en `vite.config.ts`, y `ssr = false` + `prerender = true` en `src/routes/+layout.ts`.

## Desarrollo

Requiere Node 24+ y pnpm.

```sh
pnpm install
pnpm --filter willchat dev     # una app
pnpm --filter home dev         # el inicio
pnpm check                     # svelte-check en todos los proyectos
```

Para probar el sitio completo como queda publicado:

```sh
BASE_PATH=/apps pnpm build
BASE_PATH=/apps pnpm preview   # http://localhost:4173/apps/
```

## Deploy

Cada push a `main` compila y publica el sitio con GitHub Actions. La ruta base (`/apps`) la da GitHub Pages automáticamente.

Solo la primera vez: en el repositorio, **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Inicio

Además de las apps publicadas, la pantalla de inicio trae dos íconos propios:

- **Recargar**: recarga el sitio, útil cuando corre a pantalla completa y sin controles del navegador.
- **Ajustes**: cambia el fondo de pantalla. La foto elegida se reduce a 1600 px, se reencoda como JPEG y se guarda en el `localStorage` del navegador con la clave `home:wallpaper`. Sin foto se usa el degradado por omisión, que vuelve al tocar «Quitar».

## WillChat

Chat al estilo ChatGPT para crear y editar imágenes con la API de OpenAI y tu propia API key.

- La API key se guarda en el `localStorage` del navegador y solo se envía a `api.openai.com`.
- Los modelos de texto y de imagen se eligen tocando el título. La lista sale de `/v1/models`, y también se puede escribir cualquier ID.
- Las fotos se reducen a 2048 px y se envían como `input_image`. En cada turno se manda la conversación completa, incluidas las imágenes generadas antes, para que el modelo pueda seguir editándolas.
- Las solicitudes usan `background: true` y se consultan cada 2 s. Generar una imagen puede tardar más de un minuto y Safari en iOS corta las solicitudes que pasan 60 s sin respuesta; así, además, la respuesta se recupera si recargas o cambias de app.
- La conversación actual se guarda en IndexedDB.
