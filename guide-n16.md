# Guía de Migración a Node 16+

## Problema Principal
Tu proyecto usa **Webpack 3** y **Babel 6**, que no son compatibles con Node 16+. Necesitas actualizar el tooling sin romper Vue 2.5.16 y Vuetify 1.0.18.

## Estrategia de Migración

### Fase 1: Preparación (HACER PRIMERO)
1. **Backup completo del proyecto**
2. **Commit de todo el código actual**
3. **Documentar el estado actual**: `npm ci && npm run build` debe funcionar

### Fase 2: Actualización del Tooling

#### Cambios Principales:
- ✅ **Webpack 3 → 4** (Webpack 5 es muy complejo con Vue 2)
- ✅ **Babel 6 → 7** (necesario para Node 16+)
- ✅ **node-sass → sass** (node-sass está deprecado)
- ✅ **UglifyJsPlugin → TerserPlugin** (UglifyJS no soporta ES6+)
- ✅ **ExtractTextPlugin → MiniCssExtractPlugin**
- ✅ **Actualizar loaders y plugins obsoletos**

#### Versiones de Vue/Vuetify:
- ❌ **NO tocar** Vue 2.5.16
- ❌ **NO tocar** Vuetify 1.0.18
- ✅ Actualizar vue-loader a versión compatible

### Fase 3: Limpieza de Dependencias No Usadas

Dependencias que probablemente NO se usan (verificar antes de eliminar):
- `babel-preset-es2015` (duplicado con babel-preset-env)
- `save` (utilidad innecesaria)
- `vuechart` (verificar si se usa)
- `vue-six-four` (verificar si se usa)
- `vue-static-map` (verificar si se usa)
- `sw-precache-webpack-plugin` (comentado en webpack config)

### Fase 4: Actualización de Webpack Config

Los archivos de webpack necesitan cambios:
1. `webpack.prod.conf.js` - Reemplazar plugins obsoletos
2. `webpack.base.conf.js` - Actualizar loaders
3. `webpack.dev.conf.js` - Actualizar dev server

## Pasos de Ejecución

### 1. Instalar Node 16
\`\`\`bash
nvm install 16
nvm use 16
\`\`\`

### 2. Limpiar instalación actual
\`\`\`bash
rm -rf node_modules package-lock.json
\`\`\`

### 3. Usar el nuevo package.json
Reemplaza tu package.json con el actualizado

### 4. Instalar dependencias
\`\`\`bash
npm install
\`\`\`

### 5. Actualizar archivos de webpack
Usa los archivos webpack actualizados proporcionados

### 6. Probar
\`\`\`bash
npm run dev
npm run build
\`\`\`

## Problemas Comunes

### Error: "Cannot find module 'webpack/lib/...'"
- Solución: Asegúrate de usar Webpack 4 y plugins compatibles

### Error: "node-sass doesn't support Node 16"
- Solución: Ya reemplazado por `sass` (dart-sass)

### Error: "UglifyJsPlugin doesn't support ES6"
- Solución: Ya reemplazado por TerserPlugin

### Warnings de dependencias peer
- Normal durante la migración, verificar que la app funcione

## Rollback Plan

Si algo falla:
\`\`\`bash
git checkout package.json package-lock.json
rm -rf node_modules
nvm use 14
npm ci
\`\`\`

## Notas Importantes

- ⚠️ **npm ci vs npm install**: Con el nuevo package.json, `npm ci` seguirá funcionando una vez que generes el package-lock.json
- ⚠️ **Vulnerabilidades**: Algunas dependencias antiguas tendrán vulnerabilidades. Evalúa el riesgo vs beneficio de actualizarlas
- ⚠️ **Testing**: Prueba TODAS las funcionalidades después de la migración
- ⚠️ **Firebase**: Actualicé firebase a versión más reciente compatible con Node 16

## Próximos Pasos (Futuro)

Una vez estable en Node 16:
1. Considerar migración a Vue 2.7 (última versión de Vue 2, con Composition API)
2. Considerar migración a Vuetify 2.x
3. Eventualmente, planear migración a Vue 3 + Vuetify 3
