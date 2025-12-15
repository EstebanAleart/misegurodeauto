# 🚗 LIBRA API - Endpoints de Vehículos ENCONTRADOS

## ✅ Documentación Oficial Verificada

Revisando el Swagger completo de LIBRA UAT, se encontraron los siguientes endpoints **que SÍ existen**:

### 1. **Obtener Marcas por Año**
```
GET /api/quotation/MarksByYear
Query Parameters:
  - Year (integer): Año del vehículo
```

**Response Structure:**
```json
[
  {
    "markCode": "string",
    "description": "string"
  }
]
```

### 2. **Obtener Modelos por Marca y Año**
```
GET /api/quotation/ModelsByMarkYear
Query Parameters:
  - MarkCode (integer): Código de la marca
  - Year (integer): Año del vehículo
```

**Response Structure:**
```json
[
  {
    "modelCode": "string",
    "description": "string",
    "year": "string",
    "price": double,
    "descriptionType": "string",
    "originDescription": "string"
  }
]
```

### 3. **Endpoints Alternativos (también disponibles)**
```
POST /api/quotation/GetMakes
POST /api/quotation/GetModels?makeId={makeId}
```

## 🔧 Implementación Actualizada

### Backend (route.js)

```javascript
// Endpoint para marcas
if (action === 'marcas') {
  const año = data?.año || new Date().getFullYear();
  const url = `${API_BASE_URL}/api/quotation/MarksByYear?Year=${año}`;
  // ... hace GET request
}

// Endpoint para modelos
if (action === 'modelos') {
  const markCode = data?.markCode;
  const año = data?.año || new Date().getFullYear();
  const url = `${API_BASE_URL}/api/quotation/ModelsByMarkYear?MarkCode=${markCode}&Year=${año}`;
  // ... hace GET request
}
```

### Frontend (libra-api.js)

```javascript
export const obtenerMarcas = async (año) => {
  const token = await getAuthToken();
  const response = await axios.post(PROXY_BASE_URL, {
    action: 'marcas',
    data: { token, año: año || new Date().getFullYear() }
  });
  return response.data.marcas || [];
};

export const obtenerModelos = async (markCode, año) => {
  const token = await getAuthToken();
  const response = await axios.post(PROXY_BASE_URL, {
    action: 'modelos',
    data: { token, markCode, año: año || new Date().getFullYear() }
  });
  return response.data.modelos || [];
};
```

## 🧪 Pruebas

### 1. **Página de Test Creada**
```
URL: http://localhost:3000/test-vehiculos
```

Esta página permite:
- ✅ Seleccionar un año
- ✅ Cargar marcas disponibles para ese año
- ✅ Seleccionar una marca
- ✅ Ver todos los modelos de esa marca con precios

### 2. **Flujo de Uso**

```javascript
// 1. Obtener marcas del año 2024
const marcas = await obtenerMarcas(2024);
// Retorna: [{ markCode: "1", description: "Toyota" }, ...]

// 2. Obtener modelos de Toyota para 2024
const modelos = await obtenerModelos("1", 2024);
// Retorna: [{ modelCode: "8840030", description: "Corolla", year: "2024", price: 25000 }, ...]
```

## 📝 Cambios Realizados

### Archivos Modificados:

1. **`.env.local`**
   - ✅ Actualizado `LIBRA_MARCAS_PATH=/api/quotation/MarksByYear`
   - ✅ Actualizado `LIBRA_MODELOS_PATH=/api/quotation/ModelsByMarkYear`

2. **`src/app/api/libra/route.js`**
   - ✅ Agregado handler para `action === 'marcas'`
   - ✅ Agregado handler para `action === 'modelos'`
   - ✅ Usa parámetros correctos según Swagger

3. **`src/app/services/libra-api.js`**
   - ✅ Actualizado `obtenerMarcas(año)`
   - ✅ Actualizado `obtenerModelos(markCode, año)`
   - ✅ Retorna estructura correcta del API

4. **`src/app/test-vehiculos/page.js`** (NUEVO)
   - ✅ Componente de prueba interactivo
   - ✅ Muestra marcas y modelos en tiempo real

## 🎯 Próximos Pasos

### Para el Formulario de Cotización:

1. **Reemplazar inputs de texto con selects dinámicos:**
   ```jsx
   // En autoCotizador.jsx
   const [marcas, setMarcas] = useState([]);
   const [modelos, setModelos] = useState([]);

   useEffect(() => {
     if (formData.año) {
       obtenerMarcas(formData.año).then(setMarcas);
     }
   }, [formData.año]);

   useEffect(() => {
     if (formData.marca && formData.año) {
       obtenerModelos(formData.marca, formData.año).then(setModelos);
     }
   }, [formData.marca, formData.año]);
   ```

2. **Usar `modelCode` como InfoAuto code:**
   - El `modelCode` del endpoint de modelos parece ser el código InfoAuto
   - Ejemplo: Toyota Corolla 2012 retorna `modelCode: "8840030"`

3. **Eliminar tabla fallback:**
   - Una vez validado que funciona, eliminar `src/app/utils/codigoInfoAuto.js`

## 📊 Estructura de Datos Esperada

### Marcas:
```javascript
{
  "markCode": "1",      // Código único de la marca
  "description": "Toyota"  // Nombre de la marca
}
```

### Modelos:
```javascript
{
  "modelCode": "8840030",        // Código InfoAuto
  "description": "Corolla",      // Nombre del modelo
  "year": "2012",                // Año
  "price": 15000.00,             // Precio de referencia
  "descriptionType": "Sedan",    // Tipo de vehículo
  "originDescription": "Nacional" // Origen
}
```

## ✨ Conclusión

Los endpoints de vehículos **SÍ EXISTEN** en la API de LIBRA. El problema anterior fue que:
1. ❌ Se buscaron rutas incorrectas (`/api/quotation/BrandList`)
2. ✅ Los endpoints reales son: `MarksByYear` y `ModelsByMarkYear`
3. ✅ Requieren parámetro `Year` obligatorio
4. ✅ Requieren autenticación Bearer token

**Estado:** ✅ Implementado y listo para probar
