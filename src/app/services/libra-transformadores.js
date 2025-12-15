/**
 * TRANSFORMADORES DE DATOS PARA LIBRA API
 * Convierte datos del formulario al formato exacto que espera LIBRA
 */

/**
 * Mapa de provincias: Valor del formulario → Código LIBRA
 * Referencia: Buenos Aires = 24
 */
export const PROVINCIAS_LIBRA = {
  'Buenos Aires': 24,
  'CABA': 2,
  'Catamarca': 3,
  'Córdoba': 5,
  'Corrientes': 6,
  'Entre Ríos': 7,
  'Formosa': 8,
  'Jujuy': 9,
  'La Pampa': 10,
  'La Rioja': 11,
  'Mendoza': 12,
  'Misiones': 13,
  'Neuquén': 14,
  'Río Negro': 15,
  'Salta': 16,
  'San Juan': 17,
  'San Luis': 18,
  'Santa Cruz': 19,
  'Santa Fe': 20,
  'Santiago del Estero': 21,
  'Tierra del Fuego': 22,
  'Tucumán': 23,
};

/**
 * Constantes de LIBRA
 */
export const LIBRA_CONSTANTS = {
  RAMO: 4, // Automotores
  TIPO_VIGENCIA: 4, // Trimestral
  AGENT_TYPE: 4,
  AGENT_CODE: 10674,
  COMMERCIAL_PREFIX_ID: 4,
};

/**
 * Transforma datos del formulario a formato GenerarCotizacion
 * @param {Object} formData - Datos del formulario
 * @returns {Object} Datos formateados para LIBRA GenerarCotizacion
 */
export const transformarParaCotizacion = (formData) => {
  return {
    ramo: LIBRA_CONSTANTS.RAMO,
    planComercial: formData.planComercial,
    conducto: formData.conducto,
    codIA: parseInt(formData.codIA),
    anio: parseInt(formData.anio),
    provincia: PROVINCIAS_LIBRA[formData.provincia] || parseInt(formData.provincia),
    capitales: parseInt(formData.capitales),
    accesorios: formData.accesorios || [],
  };
};

/**
 * Transforma datos del formulario a formato ActualizarSolicitud
 * @param {Object} formData - Datos del formulario
 * @param {number} id_pv_wkf - ID del workflow de la cotización
 * @returns {Object} Datos formateados para LIBRA ActualizarSolicitud
 */
export const transformarParaActualizar = (formData, id_pv_wkf) => {
  return {
    id_pv_wkf,
    nombre: formData.nombre.trim(),
    apellido: formData.apellido.trim(),
    documento: 'DNI',
    numero_documento: formData.numero_documento.trim(),
    dirección: formData.dirección.trim(),
    ciudad: formData.ciudad.trim(),
    provincia: PROVINCIAS_LIBRA[formData.provincia] || parseInt(formData.provincia),
    codePostal: formData.codePostal.trim(),
    email: formData.email.trim(),
    telefono: formData.telefono?.trim() || '',
    medioPago: formData.medioPago,
  };
};

/**
 * Validaciones antes de enviar a LIBRA
 */
export const validacionesLIBRA = {
  /**
   * Valida codIA
   * @param {number|string} codIA - Código InfoAuto
   * @returns {Object} { válido: boolean, mensaje: string }
   */
  validarCodIA: (codIA) => {
    const codigo = parseInt(codIA);
    if (!codigo || codigo === 0) {
      return {
        válido: false,
        mensaje: 'Código InfoAuto requerido (no puede ser 0)',
      };
    }
    if (codigo < 1000000 || codigo > 9999999) {
      return {
        válido: false,
        mensaje: 'Código InfoAuto debe ser numérico de 7 dígitos',
      };
    }
    return { válido: true, mensaje: 'OK' };
  },

  /**
   * Valida datos de asegurado
   * @param {Object} datos - Datos del asegurado
   * @returns {Object} { válido: boolean, errores: string[] }
   */
  validarAsegurado: (datos) => {
    const errores = [];

    if (!datos.nombre?.trim()) errores.push('Nombre requerido');
    if (!datos.apellido?.trim()) errores.push('Apellido requerido');
    if (!datos.numero_documento?.trim()) errores.push('Documento requerido');
    if (!datos.email?.trim()) errores.push('Email requerido');
    if (!datos.dirección?.trim()) errores.push('Dirección requerida');
    if (!datos.ciudad?.trim()) errores.push('Ciudad requerida');
    if (!datos.provincia) errores.push('Provincia requerida');

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (datos.email && !emailRegex.test(datos.email)) {
      errores.push('Email inválido');
    }

    // Validar documento (solo números)
    if (datos.numero_documento && !/^\d+$/.test(datos.numero_documento)) {
      errores.push('Documento debe contener solo números');
    }

    return {
      válido: errores.length === 0,
      errores,
    };
  },

  /**
   * Valida datos de vehículo
   * @param {Object} datos - Datos del vehículo
   * @returns {Object} { válido: boolean, errores: string[] }
   */
  validarVehiculo: (datos) => {
    const errores = [];

    if (!datos.marca?.trim()) errores.push('Marca requerida');
    if (!datos.modelo?.trim()) errores.push('Modelo requerido');
    if (!datos.anio) errores.push('Año requerido');
    if (!datos.provincia) errores.push('Provincia requerida');
    if (!datos.capitales) errores.push('Capital requerido');

    // Validar año
    const anio = parseInt(datos.anio);
    if (anio < 1950 || anio > new Date().getFullYear() + 1) {
      errores.push('Año de vehículo inválido');
    }

    // Validar capital
    const capital = parseInt(datos.capitales);
    if (capital < 10000 || capital > 500000) {
      errores.push('Capital debe estar entre $10.000 y $500.000');
    }

    return {
      válido: errores.length === 0,
      errores,
    };
  },
};

/**
 * Helper para manejo de errores de LIBRA
 * @param {Object} error - Error de axios o LIBRA
 * @returns {string} Mensaje de error legible
 */
export const extraerMensajeError = (error) => {
  // Error de LIBRA en response.data.errors
  if (error.response?.data?.errors) {
    return error.response.data.errors[0]?.mensaje || 'Error en LIBRA';
  }

  // Error HTTP
  if (error.response?.status === 400) {
    return 'Datos inválidos. Verifica los campos requeridos.';
  }
  if (error.response?.status === 401) {
    return 'Sesión expirada. Recarga la página.';
  }
  if (error.response?.status === 500) {
    return 'Error en servidor de LIBRA. Intenta más tarde.';
  }

  // Error genérico
  return error.message || 'Error desconocido';
};

/**
 * Log estructurado para debugging
 * @param {string} paso - Número/nombre del paso
 * @param {Object} datos - Datos enviados
 * @param {string} acción - Descripción de la acción
 */
export const logPaso = (paso, datos, acción = '') => {
  console.group(`📍 PASO ${paso}: ${acción}`);
  console.log('Datos:', datos);
  console.log('Timestamp:', new Date().toISOString());
  console.groupEnd();
};
