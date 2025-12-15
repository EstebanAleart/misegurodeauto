"use client";

import { useState } from 'react';
import { Button, Card, Alert, Form, Spinner } from 'react-bootstrap';
import axios from 'axios';

/**
 * Componente para testear la conexión con API LIBRA
 * Uso: Importar en una ruta temporalmente para debugging
 */
export default function TestLibraAPI() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [testType, setTestType] = useState('auth');

  const testAuth = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post('/api/libra', {
        action: 'auth'
      });

      setResult({
        title: '✅ Autenticación Exitosa',
        data: response.data.data
      });
    } catch (err) {
      setError({
        title: '❌ Error de Autenticación',
        message: err.response?.data?.error || err.message,
        details: err.response?.data
      });
    } finally {
      setLoading(false);
    }
  };

  const testVehiculo = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Primero obtener token
      const authRes = await axios.post('/api/libra', { action: 'auth' });
      const token = authRes.data.data.token;

      // Luego validar vehículo
      const response = await axios.post('/api/libra', {
        action: 'validarVehiculo',
        data: {
          token,
          marca: 'Toyota',
          modelo: 'Corolla',
          año: 2020,
          patente: 'ABC123'
        }
      });

      setResult({
        title: '✅ Vehículo Validado',
        data: response.data.data
      });
    } catch (err) {
      setError({
        title: '❌ Error Validando Vehículo',
        message: err.response?.data?.error || err.message,
        details: err.response?.data
      });
    } finally {
      setLoading(false);
    }
  };

  const testCotizacion = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Obtener token
      const authRes = await axios.post('/api/libra', { action: 'auth' });
      const token = authRes.data.data.token;

      // Obtener cotización
      const response = await axios.post('/api/libra', {
        action: 'cotizar',
        data: {
          token,
          asegurado: {
            nombre: 'Juan',
            apellido: 'García',
            email: 'juan@example.com',
            telefono: '341-6105284',
            documento: '12345678',
            provincia: 'santa-fe'
          },
          vehiculo: {
            tipo: 'auto',
            marca: 'Toyota',
            modelo: 'Corolla',
            año: 2020,
            patente: 'ABC123',
            uso: 'particular'
          },
          cobertura: {
            tipo: 'basica',
            franquicia: 10000
          }
        }
      });

      setResult({
        title: '✅ Cotización Obtenida',
        data: response.data.data
      });
    } catch (err) {
      setError({
        title: '❌ Error Obteniendo Cotización',
        message: err.response?.data?.error || err.message,
        details: err.response?.data
      });
    } finally {
      setLoading(false);
    }
  };

  const runTest = () => {
    if (testType === 'auth') testAuth();
    else if (testType === 'vehiculo') testVehiculo();
    else if (testType === 'cotizacion') testCotizacion();
  };

  return (
    <div className="p-4">
      <h1 className="mb-4">🧪 Test API LIBRA</h1>

      <Card className="mb-4">
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Label>Selecciona Test</Form.Label>
            <Form.Select
              value={testType}
              onChange={(e) => setTestType(e.target.value)}
              disabled={loading}
            >
              <option value="auth">1. Obtener Token (Autenticación)</option>
              <option value="vehiculo">2. Validar Vehículo</option>
              <option value="cotizacion">3. Obtener Cotización (Test Completo)</option>
            </Form.Select>
          </Form.Group>

          <Button
            variant="primary"
            onClick={runTest}
            disabled={loading}
            className="w-100"
          >
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  className="me-2"
                />
                Ejecutando...
              </>
            ) : (
              'Ejecutar Test'
            )}
          </Button>
        </Card.Body>
      </Card>

      {error && (
        <Alert variant="danger">
          <h4>{error.title}</h4>
          <p className="mb-2"><strong>Error:</strong> {error.message}</p>
          {error.details && (
            <pre className="bg-light p-3 rounded" style={{ fontSize: '0.85rem' }}>
              {JSON.stringify(error.details, null, 2)}
            </pre>
          )}
        </Alert>
      )}

      {result && (
        <Alert variant="success">
          <h4>{result.title}</h4>
          <pre className="bg-light p-3 rounded" style={{ fontSize: '0.85rem' }}>
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </Alert>
      )}

      <Card className="mt-4 bg-light">
        <Card.Body>
          <h5>📋 Información de Configuración</h5>
          <ul>
            <li>
              <strong>API URL:</strong>{' '}
              {process.env.NEXT_PUBLIC_LIBRA_API_URL || 'No configurada'}
            </li>
            <li>
              <strong>Usuario:</strong>{' '}
              {process.env.NEXT_PUBLIC_LIBRA_USERNAME || 'No configurado'}
            </li>
            <li>
              <strong>Proxy Endpoint:</strong> /api/libra (Next.js)
            </li>
          </ul>
          <p className="text-muted mb-0">
            💡 Abre DevTools (F12) → Console para ver logs detallados
          </p>
        </Card.Body>
      </Card>
    </div>
  );
}
