import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_LIBRA_API_URL || '';
const CREDENTIALS = {
  username: process.env.NEXT_PUBLIC_LIBRA_USERNAME || '',
  password: process.env.NEXT_PUBLIC_LIBRA_PASSWORD || ''
};
const VEHICULO_VALIDAR_PATH = process.env.LIBRA_VEHICULO_VALIDAR_PATH || '/vehiculo/validar';
const COTIZAR_PATH = process.env.LIBRA_COTIZAR_PATH || '/cotizacion/obtener';
const POLIZA_CREAR_PATH = process.env.LIBRA_POLIZA_CREAR_PATH || '/poliza/crear';

console.log('🔧 Configuración API LIBRA:', {
  url: API_BASE_URL ? '[cargada]' : '[falta]',
  username: CREDENTIALS.username ? '[cargado]' : '[falta]',
  vehiculoPath: VEHICULO_VALIDAR_PATH,
  cotizarPath: COTIZAR_PATH,
  polizaPath: POLIZA_CREAR_PATH
});

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

        const response = await axios.post(
          url,
          {
            asegurado: data.asegurado,
            vehiculo: data.vehiculo,
            cobertura: data.cobertura
          },
          {
            timeout: 10000,
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('✅ Cotización OK:', { status: response.status });

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

    // Crear póliza
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
