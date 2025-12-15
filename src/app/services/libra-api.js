// API LIBRA Service - Autenticación y Cotización
import axios from 'axios';

const PROXY_BASE_URL = '/api/libra';

let authToken = null;
let tokenExpiry = null;

/**
 * Obtener token de autenticación
 */
export const getAuthToken = async () => {
  try {
    // Si tenemos token válido, devolverlo
    if (authToken && tokenExpiry && new Date() < tokenExpiry) {
      return authToken;
    }

    const response = await axios.post(PROXY_BASE_URL, {
      action: 'auth'
    });

    if (response.data && response.data.data && response.data.data.token) {
      authToken = response.data.data.token;
      // Usar expires_in de la respuesta o default 1 hora
      const expiresIn = response.data.data.expires_in || 3600;
      tokenExpiry = new Date(Date.now() + (expiresIn * 1000));
      console.log('✅ Token LIBRA obtenido exitosamente');
      return authToken;
    }
    
    throw new Error('No token received from API');
  } catch (error) {
    console.error('Error obteniendo token LIBRA:', error.response?.data?.error || error.message);
    throw error;
  }
};

/**
 * PASO 1: Obtener Planes Comerciales
 * Necesario para saber qué planComercial usar en la cotización
 * @param {number} ramo - Código de ramo (4=auto, 24=moto)
 * @param {number} tipoVigencia - Tipo de vigencia (4=trimestral, 5=mensual)
 * @returns {Promise<Object>} Planes comerciales disponibles
 */
export const obtenerPlanesComerciales = async (ramo = 4, tipoVigencia = 4) => {
  try {
    const token = await getAuthToken();

    const response = await axios.post(
      PROXY_BASE_URL,
      {
        action: 'planesComerciales',
        data: {
          token,
          ramo,
          tipoVigencia
        }
      }
    );

    console.log('✅ Planes comerciales obtenidos:', response.data.planes?.length || 0);
    return response.data.planes || [];
  } catch (error) {
    console.error('❌ Error obteniendo planes comerciales:', error.message);
    throw error;
  }
};

/**
 * PASO 2: Obtener Conductos de Pago
 * Define qué medios de pago están disponibles
 * @param {number} productCode - Código de producto (del paso 1)
 * @param {number} commercialPrefixId - Código de ramo (4=auto)
 * @returns {Promise<Object>} Conductos disponibles
 */
export const obtenerConductos = async (productCode, commercialPrefixId = 4) => {
  try {
    const token = await getAuthToken();

    const response = await axios.post(
      PROXY_BASE_URL,
      {
        action: 'conductos',
        data: {
          token,
          productCode,
          commercialPrefixId
        }
      }
    );

    console.log('✅ Conductos obtenidos:', response.data.conductos?.length || 0);
    return response.data.conductos || [];
  } catch (error) {
    console.error('❌ Error obteniendo conductos:', error.message);
    throw error;
  }
};

/**
 * PASO 3: Obtener Accesorios (opcional)
 * Lista de accesorios posibles para el vehículo
 * @returns {Promise<Array>} Lista de accesorios
 */
export const obtenerAccesorios = async () => {
  try {
    const token = await getAuthToken();

    const response = await axios.post(
      PROXY_BASE_URL,
      {
        action: 'accesorios',
        data: {
          token
        }
      }
    );

    console.log('✅ Accesorios obtenidos:', response.data.accesorios?.length || 0);
    return response.data.accesorios || [];
  } catch (error) {
    console.error('❌ Error obteniendo accesorios:', error.message);
    throw error;
  }
};

/**
 * PASO 5: Generar Cotización
 * Endpoint principal para crear una cotización
 * @param {Object} cotizacionData - Datos para cotizar (ver estructura en LIBRA docs)
 * @returns {Promise<Object>} Resultado con id_pv_wkf (IMPORTANTE para pasos siguientes)
 */
export const obtenerCotizacion = async (cotizacionData) => {
  try {
    const token = await getAuthToken();

    console.log('📨 Enviando cotización con datos:', {
      ramo: cotizacionData.ramo,
      planComercial: cotizacionData.planComercial,
      conducto: cotizacionData.conducto,
      codIA: cotizacionData.RiesgosPorRamo?.[0]?.CodIA
    });

    const response = await axios.post(
      PROXY_BASE_URL,
      {
        action: 'cotizar',
        data: {
          token,
          ...cotizacionData
        }
      }
    );

    console.log('✅ Cotización obtenida exitosamente');
    console.log('📌 ID de Workflow:', response.data.id_pv_wkf);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error obteniendo cotización:', error.response?.status, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Validar datos de vehículo
 * @param {Object} vehicleData - Datos del vehículo
 * @returns {Promise<Object>} Validación del vehículo
 */
export const validarVehiculo = async (vehicleData) => {
  try {
    const token = await getAuthToken();

    const response = await axios.post(
      PROXY_BASE_URL,
      {
        action: 'validarVehiculo',
        data: {
          token,
          ...vehicleData
        }
      }
    );

    console.log('✅ Vehículo validado exitosamente');
    return response.data.data;
  } catch (error) {
    console.error('Error validando vehículo:', error.response?.status, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Crear póliza desde cotización
 * @param {Object} polizaData - Datos para crear la póliza
 * @returns {Promise<Object>} Datos de la póliza creada
 */
export const crearPoliza = async (polizaData) => {
  try {
    const token = await getAuthToken();

    const response = await axios.post(
      PROXY_BASE_URL,
      {
        action: 'crearPoliza',
        data: {
          token,
          ...polizaData
        }
      }
    );

    console.log('✅ Póliza creada exitosamente');
    return response.data.data;
  } catch (error) {
    console.error('Error creando póliza:', error.response?.status, error.response?.data || error.message);
    throw error;
  }
};



/**
 * Probar endpoint de la API
 * @param {string} endpoint - Endpoint a probar
 * @param {object} params - Parámetros opcionales
 * @returns {Promise<Object>} Respuesta del endpoint
 */
export const testEndpoint = async (endpoint, params = {}) => {
  try {
    const token = await getAuthToken();

    const response = await axios.post(
      PROXY_BASE_URL,
      {
        action: 'test',
        data: {
          token,
          endpoint,
          params
        }
      }
    );

    console.log('✅ Test endpoint OK');
    return response.data.data;
  } catch (error) {
    console.error('Error testing endpoint:', error.message);
    throw error;
  }
};

/**
 * Ejecutar pruebas de endpoints de marcas
 * @returns {Promise<Array>} Resultados de las pruebas
 */
export const testMarcas = async () => {
  try {
    const token = await getAuthToken();

    const response = await axios.post(
      PROXY_BASE_URL,
      {
        action: 'testMarcas',
        data: {
          token
        }
      }
    );

    console.log('✅ Test marcas completado');
    return response.data.resultados;
  } catch (error) {
    console.error('Error testing marcas:', error.message);
    throw error;
  }
};

/**
 * Obtener marcas de vehículos disponibles
 * @param {number} ramo - Código de ramo (4=auto, 24=moto)
 * @param {number} anio - Año del vehículo
 * @returns {Promise<Array>} Lista de marcas
 */
/**
 * Obtener marcas de vehículos
 * @returns {Promise<Array>} Lista de marcas con structure: { id, description, data }
 */
export const obtenerMarcas = async () => {
  try {
    const token = await getAuthToken();

    const response = await axios.post(
      PROXY_BASE_URL,
      {
        action: 'marcas',
        data: {
          token
        }
      }
    );

    console.log('✅ Marcas obtenidas:', response.data.marcas?.length || 0);
    return response.data.marcas || [];
  } catch (error) {
    console.error('❌ Error obteniendo marcas:', error.message);
    throw error;
  }
};

/**
 * Obtener modelos de una marca específica
 * @param {string|number} makeId - ID de la marca
 * @returns {Promise<Array>} Lista de modelos con structure: { id, description, data }
 */
export const obtenerModelos = async (makeId) => {
  try {
    const token = await getAuthToken();

    if (!makeId) {
      throw new Error('ID de marca requerido');
    }

    const response = await axios.post(
      PROXY_BASE_URL,
      {
        action: 'modelos',
        data: {
          token,
          makeId
        }
      }
    );

    console.log('✅ Modelos obtenidos:', response.data.modelos?.length || 0);
    return response.data.modelos || [];
  } catch (error) {
    console.error('❌ Error obteniendo modelos:', error.message);
    throw error;
  }
};



/**
 * PASO 6: Actualizar Solicitud
 * Carga datos personales, documento, dirección, email del asegurado
 * OBLIGATORIO antes de emitir la póliza
 * @param {Object} solicitudData - Datos de la solicitud (incluye id_pv_wkf)
 * @returns {Promise<Object>} Resultado de la actualización
 */
export const actualizarSolicitud = async (solicitudData) => {
  try {
    const token = await getAuthToken();

    console.log('📨 Actualizando solicitud para id_pv_wkf:', solicitudData.id_pv_wkf);

    const response = await axios.post(
      PROXY_BASE_URL,
      {
        action: 'actualizarSolicitud',
        data: {
          token,
          ...solicitudData
        }
      }
    );

    console.log('✅ Solicitud actualizada correctamente');
    return response.data;
  } catch (error) {
    console.error('❌ Error actualizando solicitud:', error.message);
    throw error;
  }
};

/**
 * PASO 7: Generar Emisión (Emitir Póliza)
 * Último paso: convierte la cotización en póliza
 * @param {number} id_pv_wkf - ID del workflow de la cotización (obtenido en paso 5)
 * @param {boolean} firstpaid - Si el primer pago está realizado
 * @returns {Promise<Object>} Datos de la emisión (número de póliza, etc)
 */
export const generarEmision = async (id_pv_wkf, firstpaid = false) => {
  try {
    const token = await getAuthToken();

    console.log('📨 Emitiendo póliza para id_pv_wkf:', id_pv_wkf);

    const response = await axios.post(
      PROXY_BASE_URL,
      {
        action: 'generarEmision',
        data: {
          token,
          id_pv_wkf,
          firstpaid
        }
      }
    );

    console.log('✅ Emisión generada');
    return response.data.data;
  } catch (error) {
    console.error('Error generando emisión:', error.message);
    throw error;
  }
};
