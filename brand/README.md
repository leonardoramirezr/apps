# Marca

Propuestas de logo para el sitio «Apps». Ninguna está adoptada todavía: el ícono en uso sigue siendo
`home/src/lib/favicon.svg`.

## Opciones

Las ocho están en `logos/` y son cuadradas, a sangre completa y sin esquinas redondeadas, igual que el
`icon.svg` de una app: la máscara la aplica quien las usa (el inicio y iOS redondean al 22,5 %).

| Archivo              | Idea                                                               | Se lee a 16 px |
| -------------------- | ------------------------------------------------------------------ | -------------- |
| `01-cuadricula.svg`  | Rejilla 3 × 3 de íconos con uno destacado en naranja y rosa.       | Sí, como trama |
| `02-pila.svg`        | Tres íconos apilados en diagonal: una colección de apps.           | Sí             |
| `03-monograma-a.svg` | La «A» de Apps, geométrica, con el vértice y los cortes en ángulo. | Sí             |
| `04-pantalla.svg`    | El propio inicio en miniatura: pantalla, íconos, puntos y dock.    | No, se empasta |
| `05-carpeta.svg`     | Una carpeta de iOS traslúcida con cuatro íconos de colores.        | Apenas         |
| `06-isometrico.svg`  | Tres losas isométricas flotando: capas de apps.                    | Apenas         |
| `07-molinete.svg`    | Cuatro aspas de colores girando alrededor del centro.              | Sí             |
| `08-orbita.svg`      | Un ícono central y otros orbitándolo.                              | Apenas         |

`03` y `07` son las más sólidas como favicon, porque sobreviven al tamaño de la pestaña. `04` y `05`
lucen en grande —la pantalla de inicio, la App Store— pero pierden todo el detalle en chico.

## Cómo adoptar una

```sh
cp brand/logos/03-monograma-a.svg home/src/lib/favicon.svg
```

El favicon actual lleva esquinas redondeadas propias; estas van a sangre y la pestaña del navegador las
muestra cuadradas. Para redondearlas, recorta el dibujo dentro del `<svg>`:

```svg
<clipPath id="mascara"><rect width="1024" height="1024" rx="230" /></clipPath>
<g clip-path="url(#mascara)"><!-- el resto del dibujo --></g>
```

## Convención

Cada archivo antepone su nombre a los `id` de sus degradados (`pila-bg`, `molinete-bg`, …) para que
varios logos puedan convivir insertados en un mismo documento sin pisarse.
