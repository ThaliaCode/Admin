# Análisis de Dependencias a Limpiar

## Dependencias Removidas en el nuevo package.json

### 1. `babel-preset-es2015` ❌
- **Razón**: Duplicado y obsoleto. `@babel/preset-env` lo reemplaza completamente
- **Impacto**: Ninguno, ya cubierto por @babel/preset-env

### 2. `save` ❌
- **Razón**: Utilidad innecesaria, no se usa en el código
- **Impacto**: Ninguno

### 3. `babel-preset-stage-2` ❌
- **Razón**: Obsoleto en Babel 7. Las features se incluyen individualmente
- **Impacto**: Ninguno, @babel/preset-env maneja esto

### 4. `babel-plugin-transform-runtime` ❌
- **Razón**: No se usa en la configuración actual
- **Impacto**: Ninguno visible

## Dependencias a Verificar Manualmente

Estas dependencias están en el package.json pero debes verificar si realmente se usan en tu código:

### `vue-six-four` (1.1.1)
\`\`\`bash
# Buscar en tu código:
grep -r "vue-six-four" src/
grep -r "VueSixFour" src/
\`\`\`
Si no aparece, puedes removerla.

### `vuechart` (^18.10.21)
\`\`\`bash
# Buscar en tu código:
grep -r "vuechart" src/
grep -r "VueChart" src/
\`\`\`
Si usas `vue-google-charts` en su lugar, puedes remover esta.

### `vue-static-map` (3.0.2)
\`\`\`bash
# Buscar en tu código:
grep -r "vue-static-map" src/
grep -r "StaticMap" src/
\`\`\`
Si usas `vue2-google-maps` en su lugar, puedes remover esta.

### `vue-full-calendar` (2.5.2)
\`\`\`bash
# Buscar en tu código:
grep -r "vue-full-calendar" src/
grep -r "FullCalendar" src/
\`\`\`
Verifica si realmente usas el calendario.

## Dependencias Actualizadas

### Actualizaciones de Seguridad:
- `axios`: 0.19.2 → 0.21.4 (vulnerabilidades críticas)
- `moment`: 2.20.1 → 2.29.4 (vulnerabilidades + mejoras)
- `firebase`: 8.9.1 → 9.23.0 (compatible con Node 16)
- `xlsx`: 0.15.3 → 0.18.5 (mejoras de seguridad)

### Actualizaciones de Tooling:
- `webpack`: 3.12.0 → 4.46.0 (necesario para Node 16)
- `babel-core`: 6.x → @babel/core 7.x (necesario para Node 16)
- `node-sass`: REMOVIDO → `sass` (dart-sass, compatible con Node 16)

## Comando para Limpiar Dependencias No Usadas

Después de verificar manualmente, puedes remover las que no uses:

\`\`\`bash
npm uninstall vue-six-four vuechart vue-static-map vue-full-calendar
\`\`\`

## Notas Importantes

1. **jQuery**: Mantenido porque probablemente lo usan plugins legacy
2. **moment**: Actualizado pero considera migrar a `date-fns` en el futuro (más ligero)
3. **Quill**: Mantenido para el editor WYSIWYG
4. **Vuelidate**: Mantenido para validación de formularios
