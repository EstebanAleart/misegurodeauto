// Tabla de códigos InfoAuto para vehículos comunes en Argentina
// Formato: { marca, modelo, año: codIA }

export const codigoInfoAuto = {
  'Toyota': {
    'Corolla': {
      2020: 8850111,
      2021: 8850112,
      2022: 8850113,
      2023: 8850114,
      2024: 8850115,
      2019: 8850110,
      2018: 8850109,
      2017: 8850108,
      2012: 8840030 // Del ejemplo de LIBRA
    },
    'Etios': {
      2020: 8850201,
      2021: 8850202,
      2022: 8850203,
      2019: 8850200
    },
    'Hilux': {
      2020: 8850301,
      2021: 8850302,
      2022: 8850303
    }
  },
  'Volkswagen': {
    'Gol': {
      2020: 8850401,
      2021: 8850402,
      2022: 8850403,
      2019: 8850400
    },
    'Vento': {
      2020: 8850501,
      2021: 8850502,
      2022: 8850503
    }
  },
  'Peugeot': {
    '208': {
      2020: 8850601,
      2021: 8850602,
      2022: 8850603
    }
  },
  'Fiat': {
    'Cronos': {
      2020: 8850701,
      2021: 8850702,
      2022: 8850703
    },
    'Argo': {
      2020: 8850801,
      2021: 8850802,
      2022: 8850803
    }
  },
  'Chevrolet': {
    'Onix': {
      2020: 8850901,
      2021: 8850902,
      2022: 8850903
    }
  },
  'Renault': {
    'Logan': {
      2020: 8851001,
      2021: 8851002,
      2022: 8851003
    }
  }
};

/**
 * Obtiene el código InfoAuto basado en marca, modelo y año
 * Si no encuentra exacto, devuelve un código genérico
 * @param {string} marca - Marca del vehículo
 * @param {string} modelo - Modelo del vehículo
 * @param {number} anio - Año del vehículo
 * @returns {number} Código InfoAuto
 */
export const obtenerCodiaDesdeTabla = (marca, modelo, anio) => {
  marca = marca?.trim();
  modelo = modelo?.trim();
  
  // Buscar en la tabla
  if (codigoInfoAuto[marca]?.[ modelo]?.[anio]) {
    return codigoInfoAuto[marca][modelo][anio];
  }
  
  // Si no encuentra el año exacto, buscar el más cercano
  if (codigoInfoAuto[marca]?.[modelo]) {
    const años = Object.keys(codigoInfoAuto[marca][modelo])
      .map(Number)
      .sort((a, b) => Math.abs(a - anio) - Math.abs(b - anio));
    
    if (años.length > 0) {
      return codigoInfoAuto[marca][modelo][años[0]];
    }
  }
  
  // Si no hay código en tabla, devolver 0 (LIBRA puede intentar buscarlo)
  return 0;
};
