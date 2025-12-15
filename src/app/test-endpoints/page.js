'use client';

import { useEffect, useState } from 'react';
import { testMarcas, testEndpoint } from '../services/libra-api';

export default function TestEndpoints() {
  const [resultados, setResultados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    ejecutarPruebas();
  }, []);

  const ejecutarPruebas = async () => {
    try {
      setLoading(true);
      console.log('🧪 Iniciando pruebas de endpoints...');
      const res = await testMarcas();
      setResultados(res);
      console.log('✅ Pruebas completadas:', res);
    } catch (err) {
      setError(err.message);
      console.error('❌ Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🧪 Test de Endpoints LIBRA</h1>
      
      {loading && <p>⏳ Ejecutando pruebas...</p>}
      
      {error && (
        <div style={{ color: 'red', border: '1px solid red', padding: '10px', marginTop: '10px' }}>
          ❌ Error: {error}
        </div>
      )}
      
      {resultados && (
        <div style={{ marginTop: '20px' }}>
          <h2>📊 Resultados:</h2>
          {resultados.map((r, idx) => (
            <div
              key={idx}
              style={{
                border: `1px solid ${r.success ? 'green' : 'red'}`,
                padding: '10px',
                margin: '5px 0',
                backgroundColor: r.success ? '#e8f5e9' : '#ffebee'
              }}
            >
              <strong>{r.endpoint}</strong>
              {' - '}
              {r.success ? (
                <span style={{ color: 'green' }}>
                  ✅ SUCCESS ({r.status}) - {r.dataLength} items
                </span>
              ) : (
                <span style={{ color: 'red' }}>
                  ❌ {r.status || 'ERROR'} - {r.error}
                </span>
              )}
            </div>
          ))}
          
          {resultados.some(r => r.success) && (
            <div style={{ backgroundColor: '#fff3e0', padding: '10px', marginTop: '20px', border: '1px solid orange' }}>
              <h3>✅ Endpoint(s) funcional(es) encontrado(s)</h3>
              {resultados.filter(r => r.success).map((r, idx) => (
                <p key={idx}>Usar: <code>{r.endpoint}</code></p>
              ))}
            </div>
          )}
        </div>
      )}
      
      <button
        onClick={ejecutarPruebas}
        style={{
          padding: '10px 20px',
          marginTop: '20px',
          cursor: 'pointer',
          backgroundColor: '#1976d2',
          color: 'white',
          border: 'none',
          borderRadius: '4px'
        }}
      >
        🔄 Ejecutar de nuevo
      </button>
    </div>
  );
}
