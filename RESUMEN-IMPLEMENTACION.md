// RESUMEN FINAL DE IMPLEMENTACIÓN - LIBRA API FLOW

// ✅ ARCHIVOS CREADOS/MODIFICADOS:

// 1. src/app/services/libra-api.js
//    ✅ Refactorizado con funciones para cada paso
//    ✅ Token caching (1 hora para seguridad)
//    ✅ Funciones exportadas:
//       - getAuthToken()
//       - obtenerPlanesComerciales(ramo, tipoVigencia)
//       - obtenerConductos(planComercial, ramo)
//       - obtenerAccesorios()
//       - obtenerCotizacion(data)
//       - actualizarSolicitud(solicitudData)
//       - generarEmision(id_pv_wkf, firstpaid)
//       - obtenerMarcas()
//       - obtenerModelos(makeId)
//       - validarVehiculo(vehicleData)

// 2. src/app/services/libra-transformadores.js
//    ✅ NUEVO - Helpers para transformación de datos
//    ✅ Constantes LIBRA (RAMO, VIGENCIA, AGENT_CODE)
//    ✅ Funciones:
//       - transformarParaCotizacion(formData)
//       - transformarParaActualizar(formData, id_pv_wkf)
//       - validacionesLIBRA.validarCodIA()
//       - validacionesLIBRA.validarAsegurado()
//       - validacionesLIBRA.validarVehiculo()
//       - extraerMensajeError()

// 3. src/app/services/LIBRA-FLUJO-IMPLEMENTACION.md
//    ✅ NUEVO - Documentación completa del flujo 7-pasos
//    ✅ Diagrama ASCII del flujo
//    ✅ Ejemplos de implementación en autoCotizador.jsx
//    ✅ Checklist de testing

// 4. src/app/api/libra/route.js
//    ✅ Ya existía con handlers para todos los actions
//    ✅ Handlers:
//       - action: 'auth' → /token
//       - action: 'planesComerciales' → CommercialProductsByBranchAgentValidityType
//       - action: 'conductos' → PaymentMethodsPlansByProduct
//       - action: 'accesorios' → AccessoriesList
//       - action: 'cotizar' → GenerarCotizacion
//       - action: 'actualizarSolicitud' → ActualizarSolicitud
//       - action: 'generarEmision' → GeneraEmi
//       - action: 'marcas' → GetMakes (POST)
//       - action: 'modelos' → GetModels (POST)

// 5. src/app/components/autocomplete/autoCotizador.jsx
//    ✅ Ya tiene:
//       - codIA editable (type="number")
//       - Alert con explicación
//       - handleInputChange correcto
//       - Tabla local de InfoAuto como fallback

// ============================================
// 📋 QUÉ FALTA IMPLEMENTAR EN autoCotizador.jsx
// ============================================

// TODO 1: Agregar estado para id_pv_wkf
//   const [id_pv_wkf, setId_pv_wkf] = useState(null);

// TODO 2: Implementar handleCotizar() completo
//   - Llamar obtenerPlanesComerciales()
//   - Llamar obtenerConductos()
//   - Validar codIA ≠ 0
//   - Llamar obtenerCotizacion()
//   - Guardar id_pv_wkf

// TODO 3: Agregar handleActualizarSolicitud()
//   - Validar datos del asegurado
//   - Llamar actualizarSolicitud(id_pv_wkf, datos)
//   - Mostrar success toast

// TODO 4: Agregar handleEmitirPoliza()
//   - Validar id_pv_wkf existe
//   - Validar solicitud actualizada
//   - Llamar generarEmision(id_pv_wkf)
//   - Mostrar número de póliza

// TODO 5: Agregar UI para pasos 6-7
//   - Después de GenerarCotización: mostrar resumen
//   - Formulario para datos del asegurado
//   - Botón "Actualizar Solicitud"
//   - Botón "Emitir Póliza"
//   - Mostrar resultado final con numeroPóliza

// ============================================
// 🚀 PRÓXIMOS PASOS
// ============================================

/*
PASO 1: Importar en autoCotizador.jsx
================================================
import {
  obtenerPlanesComerciales,
  obtenerConductos,
  obtenerCotizacion,
  actualizarSolicitud,
  generarEmision,
} from '@/app/services/libra-api';

import {
  transformarParaCotizacion,
  transformarParaActualizar,
  validacionesLIBRA,
  extraerMensajeError,
} from '@/app/services/libra-transformadores';


PASO 2: Agregar estado para flujo
================================================
const [id_pv_wkf, setId_pv_wkf] = useState(null);
const [cotizacionGenerada, setCotizacionGenerada] = useState(false);
const [solicitudActualizada, setSolicitudActualizada] = useState(false);
const [polizaEmitida, setPolizaEmitida] = useState(false);
const [numeroPóliza, setNumeroPóliza] = useState(null);
const [resumenCotizacion, setResumenCotizacion] = useState(null);


PASO 3: Implementar handleCotizar() (CRÍTICO)
================================================
const handleCotizar = async () => {
  try {
    // Validar codIA
    const validCodIA = validacionesLIBRA.validarCodIA(formData.codIA);
    if (!validCodIA.válido) {
      toast.error(validCodIA.mensaje);
      return;
    }

    // PASO 1: Planes comerciales
    console.log('📍 PASO 1: Obteniendo planes comerciales...');
    const planes = await obtenerPlanesComerciales(4, 4);
    if (!planes || planes.length === 0) {
      throw new Error('No hay planes comerciales disponibles');
    }
    const planComercial = planes[0].code;
    console.log('✅ Plan seleccionado:', planComercial);

    // PASO 2: Conductos
    console.log('📍 PASO 2: Obteniendo conductos...');
    const conductos = await obtenerConductos(planes[0].ProductCode, 4);
    if (!conductos || conductos.length === 0) {
      throw new Error('No hay conductos disponibles');
    }
    const conducto = conductos[0].code;
    console.log('✅ Conducto seleccionado:', conducto);

    // PASO 5: Generar cotización
    console.log('📍 PASO 5: Generando cotización...');
    const datosTransformados = transformarParaCotizacion({
      ...formData,
      planComercial,
      conducto
    });

    const cotizacion = await obtenerCotizacion(datosTransformados);
    
    // ⭐ GUARDAR id_pv_wkf
    const { id_pv_wkf: nuevoId, prima, primaComercial, impuestos } = cotizacion;
    console.log('⭐ id_pv_wkf obtenido:', nuevoId);

    setId_pv_wkf(nuevoId);
    setResumenCotizacion({ prima, primaComercial, impuestos });
    setCotizacionGenerada(true);

    toast.success('✅ Cotización generada. Completa tus datos para emitir.');

  } catch (error) {
    console.error('Error en cotización:', error);
    toast.error('Error: ' + extraerMensajeError(error));
  }
};


PASO 4: Implementar handleActualizarSolicitud() (CRÍTICO)
================================================
const handleActualizarSolicitud = async () => {
  try {
    if (!id_pv_wkf) {
      throw new Error('Primero genera una cotización');
    }

    // Validar datos
    const validacion = validacionesLIBRA.validarAsegurado(formData);
    if (!validacion.válido) {
      toast.error(validacion.errores[0]);
      return;
    }

    console.log('📍 PASO 6: Actualizando solicitud...');
    const datosTransformados = transformarParaActualizar(formData, id_pv_wkf);

    const resultado = await actualizarSolicitud(datosTransformados);
    console.log('✅ Solicitud actualizada');

    setSolicitudActualizada(true);
    toast.success('✅ Datos guardados. Procede a emitir póliza.');

  } catch (error) {
    console.error('Error actualizando solicitud:', error);
    toast.error('Error: ' + extraerMensajeError(error));
  }
};


PASO 5: Implementar handleEmitirPoliza() (CRÍTICO)
================================================
const handleEmitirPoliza = async () => {
  try {
    if (!id_pv_wkf) {
      throw new Error('Primero genera una cotización');
    }
    if (!solicitudActualizada) {
      throw new Error('Primero actualiza tus datos');
    }

    console.log('📍 PASO 7: Emitiendo póliza...');
    const emision = await generarEmision(id_pv_wkf, true);
    console.log('✅ Póliza emitida:', emision.numeroPóliza);

    setPolizaEmitida(true);
    setNumeroPóliza(emision.numeroPóliza);
    toast.success('🎉 ¡Póliza #' + emision.numeroPóliza + ' emitida exitosamente!');

  } catch (error) {
    console.error('Error emitiendo póliza:', error);
    toast.error('Error: ' + extraerMensajeError(error));
  }
};


PASO 6: Actualizar UI para mostrar pasos
================================================
Después de que cotizacionGenerada sea true:

{cotizacionGenerada && !polizaEmitida && (
  <>
    {/* Mostrar resumen de cotización */}
    <Alert variant="info">
      <h5>📊 Resumen de Cotización</h5>
      <p>Prima Total: ${resumenCotizacion?.prima}</p>
      <p>Prima Comercial: ${resumenCotizacion?.primaComercial}</p>
      <p>Impuestos: ${resumenCotizacion?.impuestos}</p>
    </Alert>

    {/* Formulario datos del asegurado */}
    <div className="mt-4">
      <h5>📝 Datos del Asegurado</h5>
      {/* inputs para nombre, apellido, doc, email, etc */}
    </div>

    {/* Botones */}
    <Button
      onClick={handleActualizarSolicitud}
      disabled={solicitudActualizada}
      className="mt-3 me-2"
    >
      {solicitudActualizada ? '✅ Datos Guardados' : '💾 Guardar Datos'}
    </Button>

    <Button
      onClick={handleEmitirPoliza}
      disabled={!solicitudActualizada}
      className="mt-3"
    >
      🚀 Emitir Póliza
    </Button>
  </>
)}

{polizaEmitida && (
  <Alert variant="success">
    <h5>✅ ¡Póliza Emitida!</h5>
    <p>Número de Póliza: <strong>{numeroPóliza}</strong></p>
  </Alert>
)}
*/

// ============================================
// ⚠️ RECORDATORIOS CRÍTICOS
// ============================================

// 1. id_pv_wkf DEBE guardarse en estado
//    Sin este valor NO se pueden hacer PASOS 6 y 7

// 2. codIA NO PUEDE SER 0
//    Si usuario no ingresa y tabla devuelve 0, el PASO 5 fallará

// 3. Orden estricto de pasos
//    No se puede saltar PASO 6 (actualizar) para ir a PASO 7 (emitir)

// 4. Token válido 24 horas
//    Pero lo cachamos 1 hora por seguridad
//    libra-api.js maneja esto automáticamente

// 5. Errores de LIBRA vienen en response.data
//    Usar extraerMensajeError() para parsearlos

// ============================================
// 🧪 TESTING
// ============================================

// Prueba manual de flujo:
// 1. Ingresa: Toyota Corolla 2012, codIA=8840030
// 2. Click "Cotizar"
//    - Verifica console.log de cada PASO
//    - Verifica id_pv_wkf se extrae correctamente
// 3. Llena datos: nombre, doc, email, etc
// 4. Click "Guardar Datos"
//    - Verifica actualizarSolicitud se llamó
// 5. Click "Emitir Póliza"
//    - Verifica numeroPóliza aparece en Alert

// Problemas comunes:
// - codIA = 0 → Error: "Código InfoAuto requerido"
// - Sin id_pv_wkf → Error: "Primero genera una cotización"
// - Token expirado → auto-renueva (manejado en libra-api.js)
