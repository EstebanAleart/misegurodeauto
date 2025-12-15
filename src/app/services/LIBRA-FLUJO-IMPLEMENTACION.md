# 🔐 FLUJO COMPLETO LIBRA - GUÍA DE IMPLEMENTACIÓN

## Resumen: 7 Pasos para Emitir una Póliza

```
┌─────────────────────────────────────────────────────────────────┐
│ PASO 0: AUTENTICACIÓN (Token válido 24 horas)                   │
│ POST /token                                                      │
│ ├─ Return: token (Bearer token)                                 │
│ └─ Storage: Cache en localStorage (1 hora para seguridad)       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ PASO 1: OBTENER PLANES COMERCIALES (Seguros disponibles)        │
│ GET /CommercialProductsByBranchAgentValidityType                │
│ ├─ Params: ramo=4, agentCode=[FROM_ENV], tipoVigencia=4        │
│ ├─ Return: Array de planes                                      │
│ │   { code, ProductCode, description, ...}                      │
│ └─ usar: planComercial = planes[0].code                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ PASO 2: OBTENER CONDUCTOS (Medios de pago)                      │
│ GET /PaymentMethodsPlansByProduct                               │
│ ├─ Params: ProductCode, commercialPrefixId=4                    │
│ ├─ Return: Array de conductos                                   │
│ │   { code, description, ...}                                   │
│ └─ usar: conducto = conductos[0].code                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ PASO 3: OBTENER ACCESORIOS (Opcional)                           │
│ GET /AccessoriesList                                            │
│ ├─ Params: ProductCode                                          │
│ └─ Return: Array de accesorios disponibles                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ PASO 4: VALIDAR CÓDIGO INFOAUTO (Código del vehículo)          │
│ ⚠️  NO ES UN ENDPOINT - Es información EXTERNA                  │
│ ├─ Source: Base de datos InfoAuto / Usuario input               │
│ ├─ Ejemplo: Toyota Corolla 2012 = 8840030                       │
│ └─ CRÍTICO: El codIA NO PUEDE SER 0 para GenerarCotizacion     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ PASO 5: GENERAR COTIZACIÓN ⭐ CRÍTICO                           │
│ POST /GenerarCotizacion                                         │
│ ├─ Params:                                                       │
│ │   {                                                            │
│ │     token,                                                     │
│ │     ramo: 4,                                                   │
│ │     planComercial,      // De PASO 1                          │
│ │     conducto,           // De PASO 2                          │
│ │     codIA,              // De PASO 4 (NO PUEDE SER 0)        │
│ │     anio: 2012,                                               │
│ │     provincia: 24,      // Buenos Aires                        │
│ │     capitales: 50000,   // Cobertura Capital                  │
│ │     accesorios: []      // De PASO 3 (opcional)              │
│ │   }                                                            │
│ └─ Return: ⭐ **id_pv_wkf** (GUARDAR EN STATE)                 │
│                                                                  │
│ ✅ Return también incluye:                                       │
│    - prima (prima total)                                        │
│    - primaComercial                                             │
│    - impuestos                                                  │
│    - comisión                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
        ⭐ GUARDAR id_pv_wkf EN ESTADO DEL FORM ⭐
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ PASO 6: ACTUALIZAR SOLICITUD (Datos del asegurado)             │
│ POST /ActualizarSolicitud                                       │
│ ├─ Params:                                                       │
│ │   {                                                            │
│ │     token,                                                     │
│ │     id_pv_wkf,              // ⭐ De PASO 5                   │
│ │     nombre,                                                    │
│ │     apellido,                                                  │
│ │     documento: "DNI",                                          │
│ │     numero_documento,                                          │
│ │     dirección,                                                 │
│ │     ciudad,                                                    │
│ │     provincia: 24,                                             │
│ │     codePostal,                                               │
│ │     email,                                                     │
│ │     medioPago               // Información tarjeta/banco      │
│ │   }                                                            │
│ └─ Return: Confirmación de actualización                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ PASO 7: EMITIR PÓLIZA (Generar número de póliza)               │
│ POST /GeneraEmi                                                 │
│ ├─ Params:                                                       │
│ │   {                                                            │
│ │     token,                                                     │
│ │     id_pv_wkf,              // ⭐ De PASO 5                   │
│ │     firstpaid: true/false   // ¿Primer pago realizado?       │
│ │   }                                                            │
│ └─ Return:                                                       │
│    {                                                             │
│      numeroPóliza,    // ✅ NÚMERO DE PÓLIZA EMITIDO           │
│      vigenciaDesde,                                             │
│      vigenciaHasta,                                             │
│      estado: "EMITIDA",                                         │
│      ...                                                         │
│    }                                                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ✅ PÓLIZA EMITIDA
```

---

## 📝 Implementación en autoCotizador.jsx

### Estado necesario:
```javascript
const [formData, setFormData] = useState({
  // Vehículo
  marca: 'Toyota',
  modelo: 'Corolla',
  anio: 2012,
  provincia: 24,
  capitales: 50000,
  codIA: 8840030,  // ⭐ Usuario ingresa manualmente o tabla

  // Pasos LIBRA
  planComercial: null,
  conducto: null,
  id_pv_wkf: null,  // ⭐ GUARDAR AQUÍ en PASO 5

  // Asegurado (requerido para PASO 6)
  nombre: '',
  apellido: '',
  numero_documento: '',
  dirección: '',
  ciudad: '',
  codePostal: '',
  email: '',
  medioPago: null,

  // Control de flujo
  cotizacionGenerada: false,
  solicitudActualizada: false,
  polizaEmitida: false,
});
```

### Flujo en handleCotizar():
```javascript
const handleCotizar = async () => {
  try {
    // PASO 1: Obtener planes
    console.log('📍 PASO 1: Obteniendo planes...');
    const planes = await obtenerPlanesComerciales(4, 4);
    const planComercial = planes[0].code;
    console.log('✅ Plan seleccionado:', planComercial);

    // PASO 2: Obtener conductos
    console.log('📍 PASO 2: Obteniendo conductos...');
    const conductos = await obtenerConductos(planes[0].ProductCode, 4);
    const conducto = conductos[0].code;
    console.log('✅ Conducto seleccionado:', conducto);

    // PASO 3: Accesorios (opcional)
    // const accesorios = await obtenerAccesorios();

    // PASO 4: Validar codIA (en UI, usuario confirma)
    if (!formData.codIA || formData.codIA === 0) {
      throw new Error('Código InfoAuto requerido');
    }
    console.log('✅ Código InfoAuto validado:', formData.codIA);

    // PASO 5: GENERAR COTIZACIÓN ⭐
    console.log('📍 PASO 5: Generando cotización...');
    const cotizacion = await obtenerCotizacion({
      token: null,  // Se obtiene internamente
      ramo: 4,
      planComercial,
      conducto,
      codIA: formData.codIA,
      anio: formData.anio,
      provincia: formData.provincia,
      capitales: formData.capitales,
      accesorios: []
    });

    // ⭐ GUARDAR id_pv_wkf
    const { id_pv_wkf, prima, primaComercial } = cotizacion;
    console.log('⭐ id_pv_wkf obtenido:', id_pv_wkf);

    setFormData(prev => ({
      ...prev,
      planComercial,
      conducto,
      id_pv_wkf,  // ⭐ CRÍTICO
      cotizacionGenerada: true,
      resumenCotizacion: {
        prima,
        primaComercial,
        // otros datos...
      }
    }));

    toast.success('✅ Cotización generada. Ahora completa tus datos.');

  } catch (error) {
    toast.error('Error en cotización: ' + error.message);
  }
};
```

### Flujo en handleActualizarSolicitud():
```javascript
const handleActualizarSolicitud = async () => {
  try {
    if (!formData.id_pv_wkf) {
      throw new Error('Primero genera una cotización');
    }

    console.log('📍 PASO 6: Actualizando solicitud...');
    
    const resultado = await actualizarSolicitud({
      id_pv_wkf: formData.id_pv_wkf,  // ⭐ De PASO 5
      nombre: formData.nombre,
      apellido: formData.apellido,
      documento: 'DNI',
      numero_documento: formData.numero_documento,
      dirección: formData.dirección,
      ciudad: formData.ciudad,
      provincia: formData.provincia,
      codePostal: formData.codePostal,
      email: formData.email,
      medioPago: formData.medioPago
    });

    console.log('✅ Solicitud actualizada');
    setFormData(prev => ({
      ...prev,
      solicitudActualizada: true
    }));

    toast.success('✅ Datos actualizados. Procede a emitir póliza.');

  } catch (error) {
    toast.error('Error actualizando solicitud: ' + error.message);
  }
};
```

### Flujo en handleEmitirPoliza():
```javascript
const handleEmitirPoliza = async () => {
  try {
    if (!formData.id_pv_wkf) {
      throw new Error('Primero genera una cotización');
    }
    if (!formData.solicitudActualizada) {
      throw new Error('Primero actualiza los datos del asegurado');
    }

    console.log('📍 PASO 7: Emitiendo póliza...');
    
    const emision = await generarEmision(
      formData.id_pv_wkf,  // ⭐ De PASO 5
      true  // firstpaid
    );

    console.log('✅ Póliza emitida:', emision.numeroPóliza);
    
    setFormData(prev => ({
      ...prev,
      polizaEmitida: true,
      numeroPóliza: emision.numeroPóliza,
      vigenciaDesde: emision.vigenciaDesde,
      vigenciaHasta: emision.vigenciaHasta
    }));

    toast.success('✅ ¡Póliza #' + emision.numeroPóliza + ' emitida!');

  } catch (error) {
    toast.error('Error emitiendo póliza: ' + error.message);
  }
};
```

---

## ⚠️ PUNTOS CRÍTICOS

1. **codIA NO PUEDE SER 0**
   - Si no está en tabla, usuario DEBE ingresarlo manualmente
   - Validar antes de PASO 5

2. **id_pv_wkf ES OBLIGATORIO**
   - Obtenido en PASO 5 (GenerarCotización)
   - Requerido en PASO 6 y PASO 7
   - Debe guardarse en estado

3. **Orden estricto**
   - No se puede emitir sin actualizar solicitud
   - No se puede actualizar sin cotización

4. **Token válido 24 horas**
   - Almacenar en localStorage con timestamp
   - Renovar si expira

5. **Transformación de datos**
   - Provincia: 24 = Buenos Aires
   - AgentCode: [FROM .env.local]
   - Ramo: 4 = Automotores
   - TipoVigencia: 4 = Trimestral

---

## 🧪 Testing Checklist

- [ ] PASO 1: obtenerPlanesComerciales retorna array
- [ ] PASO 2: obtenerConductos retorna array
- [ ] PASO 4: codIA ≠ 0 y ≠ null
- [ ] PASO 5: generarCotización retorna id_pv_wkf
- [ ] PASO 6: actualizarSolicitud con id_pv_wkf válido
- [ ] PASO 7: generarEmision retorna numeroPóliza
- [ ] Estado fluye correctamente entre pasos
- [ ] Errores se manejan apropiadamente

---

## 📞 Información de Contacto LIBRA

Base URL: https://uat.libraseguros.com.ar/Sise3GBELibraCoreUatWebApi
Username: (en .env.local)
Password: (en .env.local)
Agent Code: (en .env.local)
