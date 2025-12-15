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
 * Obtener cotización de seguro
 * @param {Object} cotizacionData - Datos para cotizar
 * @returns {Promise<Object>} Resultado de la cotización
 */
export const obtenerCotizacion = async (cotizacionData) => {
  try {
    const token = await getAuthToken();

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
    return response.data.data;
  } catch (error) {
    console.error('Error obteniendo cotización:', error.response?.status, error.response?.data || error.message);
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
          polizaData
        }
      }
    );

    console.log('✅ Póliza creada exitosamente');
    return response.data.data;
  } catch (error) {
    console.error('Error creando póliza:', error.response?.data?.error || error.message);
    throw error;
  }
};
