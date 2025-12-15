import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_LIBRA_API_URL || '';
const CREDENTIALS = {
  username: process.env.NEXT_PUBLIC_LIBRA_USERNAME || '',
  password: process.env.NEXT_PUBLIC_LIBRA_PASSWORD || ''
};
const AGENT_CODE = parseInt(process.env.NEXT_PUBLIC_LIBRA_AGENT_CODE || '1');
const VEHICULO_VALIDAR_PATH = process.env.LIBRA_VEHICULO_VALIDAR_PATH || '/vehiculo/validar';
const COTIZAR_PATH = process.env.LIBRA_COTIZAR_PATH || '/api/quotation/GenerarCotizacion';
const ACTUALIZAR_PATH = process.env.LIBRA_ACTUALIZAR_PATH || '/api/quotation/ActualizarSolicitud';
const POLIZA_CREAR_PATH = process.env.LIBRA_POLIZA_CREAR_PATH || '/api/quotation/GeneraEmi';
const PLANES_COMERCIALES_PATH = process.env.LIBRA_PLANES_COMERCIALES_PATH || '/api/quotation/CommercialProductsByBranchAgentValidityType';
const CONDUCTOS_PATH = process.env.LIBRA_CONDUCTOS_PATH || '/api/quotation/PaymentMethodsPlansByProduct';
const ACCESORIOS_PATH = process.env.LIBRA_ACCESORIOS_PATH || '/api/quotation/AccessoriesList';
const MARCAS_PATH = process.env.LIBRA_MARCAS_PATH || '/api/quotation/BrandList';
const MODELOS_PATH = process.env.LIBRA_MODELOS_PATH || '/api/quotation/ModelList';

console.log('🔧 Configuración API LIBRA:', {
  url: API_BASE_URL ? '[cargada]' : '[falta]',
  username: CREDENTIALS.username ? '[cargado]' : '[falta]',
  agentCode: AGENT_CODE,
  cotizarPath: COTIZAR_PATH,
  actualizarPath: ACTUALIZAR_PATH,
  polizaPath: POLIZA_CREAR_PATH
});

/**
 * Mapea provincia de texto a código LIBRA
 */
const mapearProvincia = (provincia) => {
  const mapeo = {
    'capital-federal': 1,
    'buenos-aires': 2,
    'catamarca': 3,
    'cordoba': 4,
    'corrientes': 5,
    'chaco': 6,
    'chubut': 7,
    'entre-rios': 8,
    'formosa': 9,
    'jujuy': 10,
    'la-pampa': 11,
    'la-rioja': 12,
    'mendoza': 13,
    'misiones': 14,
    'neuquen': 15,
    'rio-negro': 16,
    'salta': 17,
    'san-juan': 18,
    'san-luis': 19,
    'santa-cruz': 20,
    'santa-fe': 21,
    'santiago-del-estero': 22,
    'tierra-del-fuego': 23,
    'tucuman': 24
  };
  return mapeo[provincia?.toLowerCase()] || 1;
};

/**
 * Transforma datos del formulario al formato LIBRA
 */
const transformarDatosLibra = (data, planComercial = 27, conducto = 4) => {
  const hoy = new Date();
  const tresMesesDespues = new Date(hoy);
  tresMesesDespues.setMonth(tresMesesDespues.getMonth() + 3);
  
  return {
    ramo: data.vehiculo.tipo === 'moto' ? 24 : 4, // 4=Auto, 24=Moto
    codTipoAgente: 4, // Productor
    codAgente: AGENT_CODE,
    tomador: parseInt(data.asegurado.documento),
    tipoTomador: "F", // Físico por defecto
    condicionFiscal: 5, // Consumidor Final por defecto
    tipoVigencia: 4, // Trimestral
    vigenciaDesde: hoy.toISOString().split('T')[0],
    vigenciaHasta: tresMesesDespues.toISOString().split('T')[0],
    planComercial: planComercial,
    conducto: conducto,
    periodoFact: 6, // Mensual
    tipoEndo: 2, // Emisión con facturación
    provincia: mapearProvincia(data.asegurado.provincia),
    municipio: 9999, // Sin municipio específico
    codPostal: data.asegurado.codPostal || "1000",
    RiesgosPorRamo: [
      {
        Kilometraje: false,
        AnioVehiculo: parseInt(data.vehiculo.año),
        Origen: "NACIONAL",
        tipo: null,
        Uso: data.vehiculo.uso === 'comercial' ? 2 : 1,
        ClausulaAjuste: 3, // 20% por defecto
        CodIA: data.vehiculo.codIA || 0, // Código Infoauto
        Accesorios: null,
        Respuestas: null
      }
    ],
    recargos: [{ id: 0, type: 0 }],
    descuentos: [{ id: 0, type: 0 }]
  };
};

/**
 * POST /api/libra
 * Proxy para peticiones a API LIBRA
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { action, data } = body;

    console.log('📨 /api/libra request:', {
      action,
      hasData: !!data,
      keys: data ? Object.keys(data) : []
    });

    if (!action) {
      return Response.json(
        { error: 'Action requerida' },
        { status: 400 }
      );
    }

    // Autenticación
    if (action === 'auth') {
      try {
        // Endpoint de autenticación según Swagger LIBRA
        // IMPORTANTE: Usa application/x-www-form-urlencoded (form data)
        const formData = new URLSearchParams({
          grant_type: 'password',
          username: CREDENTIALS.username,
          password: CREDENTIALS.password
        });

        const response = await axios.post(
          `${API_BASE_URL}/token`,
          formData.toString(),
          {
            timeout: 10000,
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );

        console.log('✅ Respuesta de autenticación LIBRA:', {
          hasToken: !!response.data.access_token,
          statusCode: response.status
        });

        return Response.json({
          success: true,
          data: {
            token: response.data.access_token,
            expires_in: response.data.expires_in,
            token_type: response.data.token_type
          }
        });
      } catch (authError) {
        console.error('❌ Error de autenticación LIBRA:', {
          url: `${API_BASE_URL}/token`,
          status: authError.response?.status,
          statusText: authError.response?.statusText,
          error: authError.response?.data,
          message: authError.message
        });
        throw authError;
      }
    }

    // Validación de vehículo
    if (action === 'validarVehiculo') {
      try {
        const token = data?.token;
        
        if (!token) {
          return Response.json(
            { error: 'Token requerido' },
            { status: 401 }
          );
        }

        const url = `${API_BASE_URL}${VEHICULO_VALIDAR_PATH}`;
        console.log('🚗 Validar vehículo →', {
          url,
          marca: data?.marca,
          modelo: data?.modelo,
          año: data?.año,
          patente: data?.patente
        });

        const response = await axios.post(
          url,
          {
            marca: data.marca,
            modelo: data.modelo,
            año: data.año,
            patente: data.patente
          },
          {
            timeout: 10000,
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('✅ Validación vehículo OK:', {
          status: response.status
        });

        return Response.json({
          success: true,
          data: response.data
        });
      } catch (vehError) {
        console.error('❌ Error validar vehículo:', {
          status: vehError.response?.status,
          data: vehError.response?.data,
          message: vehError.message
        });
        const status = vehError.response?.status || 500;
        return Response.json(
          { error: vehError.response?.data || vehError.message },
          { status }
        );
      }
    }

    // Endpoint de prueba - explorar la API
    if (action === 'test') {
      try {
        const token = data?.token;
        const endpoint = data?.endpoint || '/api/quotation/BrandList';
        
        if (!token) {
          return Response.json(
            { error: 'Token requerido' },
            { status: 401 }
          );
        }

        const url = `${API_BASE_URL}${endpoint}`;
        console.log('🧪 TEST →', { url });

        const response = await axios.get(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          params: data.params || {}
        });

        console.log('✅ TEST OK:', { status: response.status });

        return Response.json({
          success: true,
          status: response.status,
          data: response.data
        });
      } catch (error) {
        console.error('❌ TEST ERROR:', {
          url: error.config?.url,
          status: error.response?.status,
          statusText: error.response?.statusText,
          message: error.message,
          data: error.response?.data
        });
        return Response.json(
          { error: error.message, details: error.response?.data },
          { status: error.response?.status || 500 }
        );
      }
    }

    // Probar múltiples endpoints para encontrar el correcto
    // ============================================
    // OBTENER MARCAS DE VEHÍCULOS (GetMakes - POST)
    // ============================================
    if (action === 'marcas') {
      try {
        const token = data?.token;
        
        if (!token) {
          return Response.json(
            { error: 'Token requerido' },
            { status: 401 }
          );
        }

        // Usar POST /api/quotation/GetMakes según Swagger
        const url = `${API_BASE_URL}/api/quotation/GetMakes`;
        console.log('🚗 Obteniendo marcas desde:', url);

        const response = await axios.post(
          url,
          {}, // Body vacío según Swagger
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          }
        );

        console.log('✅ Marcas obtenidas:', response.data?.length || 0);
        console.log('📦 Muestra de marcas:', response.data?.slice(0, 3));

        return Response.json({
          success: true,
          marcas: response.data || []
        });
      } catch (error) {
        console.error('❌ Error al obtener marcas:', error.message);
        return Response.json(
          { 
            error: error.message,
            status: error.response?.status 
          },
          { status: error.response?.status || 500 }
        );
      }
    }

    // ============================================
    // OBTENER MODELOS DE VEHÍCULOS (GetModels - POST)
    // ============================================
    if (action === 'modelos') {
      try {
        const token = data?.token;
        const makeId = data?.makeId || data?.markCode;
        
        if (!token) {
          return Response.json(
            { error: 'Token requerido' },
            { status: 401 }
          );
        }

        if (!makeId) {
          return Response.json(
            { error: 'ID de marca requerido' },
            { status: 400 }
          );
        }

        // Usar POST /api/quotation/GetModels?makeId={makeId} según Swagger
        const url = `${API_BASE_URL}/api/quotation/GetModels?makeId=${makeId}`;
        console.log('🚙 Obteniendo modelos para marca:', makeId);

        const response = await axios.post(
          url,
          {}, // Body vacío según Swagger
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          }
        );

        console.log('✅ Modelos obtenidos:', response.data?.length || 0);
        console.log('📦 Muestra de modelos:', response.data?.slice(0, 3));

        return Response.json({
          success: true,
          modelos: response.data || []
        });
      } catch (error) {
        console.error('❌ Error al obtener modelos:', error.message);
        return Response.json(
          { 
            error: error.message,
            status: error.response?.status 
          },
          { status: error.response?.status || 500 }
        );
      }
    }

    if (action === 'testMarcas') {
      try {
        const token = data?.token;
        
        if (!token) {
          return Response.json(
            { error: 'Token requerido' },
            { status: 401 }
          );
        }

        const endpoints = [
          '/api/quotation/BrandList',
          '/api/quotation/Brands',
          '/api/vehicle/BrandList',
          '/api/vehicle/Brands',
          '/api/Brand/List',
          '/api/Quotation/Brand',
          '/api/quotation/brand',
          '/api/vehicle/brand'
        ];

        const resultados = [];

        for (const endpoint of endpoints) {
          try {
            const url = `${API_BASE_URL}${endpoint}`;
            const response = await axios.get(url, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              params: { prefixId: 4, year: 2025 },
              timeout: 5000
            });

            console.log(`✅ ${endpoint}: SUCCESS (${response.status})`);
            resultados.push({
              endpoint,
              status: response.status,
              success: true,
              dataLength: Array.isArray(response.data) ? response.data.length : Object.keys(response.data).length
            });
          } catch (err) {
            console.log(`❌ ${endpoint}: ${err.response?.status || err.message}`);
            resultados.push({
              endpoint,
              status: err.response?.status,
              success: false,
              error: err.response?.statusText || err.message
            });
          }
        }

        console.log('🧪 RESULTADOS DE PRUEBAS:', JSON.stringify(resultados, null, 2));

        return Response.json({
          success: true,
          resultados
        });
      } catch (error) {
        console.error('❌ Error en testMarcas:', error.message);
        return Response.json(
          { error: error.message },
          { status: 500 }
        );
      }
    }

    // Obtener marcas de vehículos
    if (action === 'marcas') {
      try {
        const token = data?.token;
        const { ramo, anio } = data;
        
        if (!token) {
          return Response.json(
            { error: 'Token requerido' },
            { status: 401 }
          );
        }

        const params = new URLSearchParams({
          prefixId: ramo || 4,
          year: anio || new Date().getFullYear()
        });

        const url = `${API_BASE_URL}${MARCAS_PATH}?${params}`;
        console.log('🚗 Marcas →', { url, ramo, anio });

        const response = await axios.get(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('✅ Marcas OK:', { 
          count: response.data?.length,
          status: response.status,
          data: JSON.stringify(response.data).substring(0, 500)
        });

        return Response.json({
          success: true,
          data: response.data
        });
      } catch (error) {
        console.error('❌ Error marcas:', {
          url: error.config?.url,
          status: error.response?.status,
          statusText: error.response?.statusText,
          message: error.message,
          data: error.response?.data ? JSON.stringify(error.response.data).substring(0, 300) : 'N/A'
        });
        return Response.json(
          { error: error.message, details: error.response?.data },
          { status: error.response?.status || 500 }
        );
      }
    }

    // Obtener modelos de una marca
    if (action === 'modelos') {
      try {
        const token = data?.token;
        const { ramo, codMarca, anio } = data;
        
        if (!token) {
          return Response.json(
            { error: 'Token requerido' },
            { status: 401 }
          );
        }

        if (!codMarca) {
          return Response.json(
            { error: 'codMarca requerido' },
            { status: 400 }
          );
        }

        const params = new URLSearchParams({
          prefixId: ramo || 4,
          brandCode: codMarca,
          year: anio || new Date().getFullYear()
        });

        const url = `${API_BASE_URL}${MODELOS_PATH}?${params}`;
        console.log('🚙 Modelos →', { url, codMarca, anio });

        const response = await axios.get(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('✅ Modelos OK:', { count: response.data?.length });

        return Response.json({
          success: true,
          data: response.data
        });
      } catch (error) {
        console.error('❌ Error modelos:', error.message);
        return Response.json(
          { error: error.message },
          { status: error.response?.status || 500 }
        );
      }
    }

    // Obtener planes comerciales
    if (action === 'planesComerciales') {
      try {
        const token = data?.token;
        const { ramo, tipoVigencia } = data;
        
        if (!token) {
          return Response.json(
            { error: 'Token requerido' },
            { status: 401 }
          );
        }

        const params = new URLSearchParams({
          prefixId: ramo || 4,
          agentTypeId: 4,
          agentId: AGENT_CODE,
          validityTypeId: tipoVigencia || 4
        });

        const url = `${API_BASE_URL}${PLANES_COMERCIALES_PATH}?${params}`;
        console.log('📋 Planes comerciales →', { url });

        const response = await axios.get(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('✅ Planes OK:', { count: response.data?.length });

        return Response.json({
          success: true,
          data: response.data
        });
      } catch (error) {
        console.error('❌ Error planes comerciales:', error.message);
        return Response.json(
          { error: error.message },
          { status: error.response?.status || 500 }
        );
      }
    }

    // Obtener conductos (medios de pago)
    if (action === 'conductos') {
      try {
        const token = data?.token;
        const { planComercial, ramo } = data;
        
        if (!token) {
          return Response.json(
            { error: 'Token requerido' },
            { status: 401 }
          );
        }

        const params = new URLSearchParams({
          productCode: planComercial || 27,
          commercialPrefixId: ramo || 4
        });

        const url = `${API_BASE_URL}${CONDUCTOS_PATH}?${params}`;
        console.log('💳 Conductos →', { url });

        const response = await axios.get(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('✅ Conductos OK:', { count: response.data?.length });

        return Response.json({
          success: true,
          data: response.data
        });
      } catch (error) {
        console.error('❌ Error conductos:', error.message);
        return Response.json(
          { error: error.message },
          { status: error.response?.status || 500 }
        );
      }
    }

    // Obtención de cotización
    if (action === 'cotizar') {
      try {
        const token = data?.token;
        
        if (!token) {
          return Response.json(
            { error: 'Token requerido' },
            { status: 401 }
          );
        }

        const url = `${API_BASE_URL}${COTIZAR_PATH}`;
        console.log('💰 Cotizar →', { url });

        // Transformar datos al formato LIBRA
        const datosLibra = transformarDatosLibra(data);
        console.log('🔄 Datos transformados:', JSON.stringify(datosLibra, null, 2));

        const response = await axios.post(
          url,
          datosLibra,
          {
            timeout: 10000,
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('✅ Cotización OK:', { 
          status: response.status,
          data: JSON.stringify(response.data, null, 2)
        });

        return Response.json({
          success: true,
          data: response.data
        });
      } catch (cotError) {
        console.error('❌ Error cotizando:', {
          status: cotError.response?.status,
          data: cotError.response?.data,
          message: cotError.message
        });
        const status = cotError.response?.status || 500;
        return Response.json(
          { error: cotError.response?.data || cotError.message },
          { status }
        );
      }
    }

    // Actualizar solicitud
    if (action === 'actualizarSolicitud') {
      try {
        const token = data?.token;
        const { id_pv_wkf, ramo, insured, propuesta_riesgo } = data;
        
        if (!token) {
          return Response.json(
            { error: 'Token requerido' },
            { status: 401 }
          );
        }

        if (!id_pv_wkf) {
          return Response.json(
            { error: 'id_pv_wkf requerido' },
            { status: 400 }
          );
        }

        const url = `${API_BASE_URL}${ACTUALIZAR_PATH}`;
        console.log('✏️ Actualizar solicitud →', { url, id_pv_wkf });

        const payload = {
          id_pv_wkf,
          ramo,
          insured,
          propuesta_riesgo
        };

        const response = await axios.post(url, payload, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('✅ Solicitud actualizada:', response.data);

        return Response.json({
          success: true,
          data: response.data
        });
      } catch (error) {
        console.error('❌ Error actualizando solicitud:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        return Response.json(
          { error: error.response?.data || error.message },
          { status: error.response?.status || 500 }
        );
      }
    }

    // Generar emisión de póliza
    if (action === 'generarEmision') {
      try {
        const token = data?.token;
        const { id_pv_wkf, firstpaid } = data;
        
        if (!token) {
          return Response.json(
            { error: 'Token requerido' },
            { status: 401 }
          );
        }

        if (!id_pv_wkf) {
          return Response.json(
            { error: 'id_pv_wkf requerido' },
            { status: 400 }
          );
        }

        const url = `${API_BASE_URL}${POLIZA_CREAR_PATH}`;
        console.log('📄 Generar emisión →', { url, id_pv_wkf });

        const payload = {
          id_pv_wkf,
          firstpaid: firstpaid || false
        };

        const response = await axios.post(url, payload, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('✅ Emisión generada:', response.data);

        return Response.json({
          success: true,
          data: response.data
        });
      } catch (error) {
        console.error('❌ Error generando emisión:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        return Response.json(
          { error: error.response?.data || error.message },
          { status: error.response?.status || 500 }
        );
      }
    }

    // Crear póliza (legacy - deprecado, usar generarEmision)
    if (action === 'crearPoliza') {
      try {
        const token = data?.token;
        
        if (!token) {
          return Response.json(
            { error: 'Token requerido' },
            { status: 401 }
          );
        }

        const url = `${API_BASE_URL}${POLIZA_CREAR_PATH}`;
        console.log('📄 Crear póliza →', { url });

        const response = await axios.post(
          url,
          data.polizaData,
          {
            timeout: 10000,
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('✅ Póliza creada OK:', { status: response.status });

        return Response.json({
          success: true,
          data: response.data
        });
      } catch (polError) {
        console.error('❌ Error creando póliza:', {
          status: polError.response?.status,
          data: polError.response?.data,
          message: polError.message
        });
        const status = polError.response?.status || 500;
        return Response.json(
          { error: polError.response?.data || polError.message },
          { status }
        );
      }
    }

    return Response.json(
      { error: 'Action no válida' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error en proxy LIBRA:', error.message);
    
    // Errores de red
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      return Response.json(
        { error: 'No se pudo conectar con la API LIBRA. Verifica que la URL sea correcta.' },
        { status: 503 }
      );
    }

    // Errores de timeout
    if (error.code === 'ECONNABORTED') {
      return Response.json(
        { error: 'Timeout en la conexión con API LIBRA' },
        { status: 504 }
      );
    }

    // Errores de respuesta HTTP
    if (error.response) {
      return Response.json(
        { error: error.response.data?.message || error.message },
        { status: error.response.status || 500 }
      );
    }

    return Response.json(
      { error: error.message || 'Error desconocido' },
      { status: 500 }
    );
  }
}
