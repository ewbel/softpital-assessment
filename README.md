# softpital-assessment

## Ejercicio 1 - Rate Limiter en Memoria

### Ejecucion
```bash
cd ejercicio_1
node tests/rateLimiter.test.js
```

### Primera iteracion del problema
Utilice un objeto para almacenar timestamps por usuario
lo que nos ayuda a filtrar y saber la cantidad de llamadas
del mismo comparandolo con los lapzos de tiempo que pasamos como param.

### Cambio de estructura de datos
La primer implementacion funcionaba pero tenia un problema,
cada vez que llegaba un request se filtraba todo el array de timestamps
del usuario, lo cual se vuelve ineficiente cuando hay muchos requests acumulados.

Lo cambie a un objeto con `count` y `resetTime` por usuario, asi
en lugar de filtrar el array completo solo verificamos si ya vencio
la ventana y reseteamos o incrementamos el contador segun corresponda.
```javascript
// antes
requests[userId] = requests[userId].filter(
  (timestamp) => now - timestamp < windowMs
);

// despues
if(!requests[userId] || now > requests[userId].resetTime) {
  requests[userId] = { count: 0, resetTime: now + windowMs };
}
```

### Posibles mejoras futuras
- Si un usuario sigue intentando justo cuando vence la ventana
  el `resetTime` se recalcula desde ese momento, lo que podria
  darle un poco mas de tiempo del esperado. Lo ideal seria fijar
  la ventana desde el primer request y no moverla
- Agregar una limpieza periodica de usuarios inactivos para que el objeto
  `requests` no acumule informacion innecesaria en memoria

## Ejercicio 2 - Refactor ClientsTable

### Decisiones tecnicas

El componente `ClientsTable` tenia varios problemas de calidad de codigo
que fui atacando de a poco, en commits pequeños y enfocados, para que
cada cambio fuera facil de revisar y revertir por separado si algo se rompia.

Los ordene de lo mas facil a lo mas complicado:

**Fixes sencillos**
- Borre codigo muerto dentro del `.filter()` de `filteredAndSortedData`, habia
  logica de `statusMatch` y `locationMatch` que jamas se ejecutaba porque
  estaba despues de un `return true`
- Corregi las dependencias vacias `[]` en el `useMemo` de `columns`, esto
  hacia que la columna "Sucursal" nunca se actualizara al cambiar de location
- Elimine `handleNameFilter` y `setGlobalFilter`, los dos declarados pero
  sin usarse en ningun lado

**Refactors internos**
- Movi `ActionMenu` afuera del componente para que no se redeclarara en
  cada render
- Cambie `rawData` de variable mutable con `let` a un `useMemo`, porque
  reasignar variables dentro de un `useEffect` simplemente no funciona en React
- Elimine `equipmentData` como estado, era un `useState` que solo copiaba
  lo que ya tenia `filteredAndSortedData` y generaba un re-render de mas
  en cada cambio de filtro
- Simplifique `dinamicHeight` de funcion a constante `tableHeight`, no tenia
  sentido que fuera funcion si no recibia argumentos y siempre devolvía
  lo mismo

**Extracciones**
- Saque la definicion de columnas a `columns/clientColumns.js` para separar
  el que mostrar del como renderizar la tabla
- Extraje el filtrado y ordenamiento al hook `useClientFilters` en
  `hooks/useClientFilters.js`, asi el componente solo se encarga de
  mostrar datos y nada mas

### Posibles mejoras futuras

- Agregar soporte para filtrar por sucursal en `useClientFilters` usando
  `getLocationName` para traducir el `locationId` antes de comparar
- Escribir tests para `useClientFilters` y `buildClientColumns`, ahora que
  estan aislados es mucho mas facil hacerlo sin tener que montar toda la tabla
- Ver si el plugin `useGlobalFilter` de `react-table` realmente se necesita,
  porque el filtrado ya se hace a mano en el hook

