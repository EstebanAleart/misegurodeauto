'use client';

import { useState } from 'react';
import { obtenerMarcas, obtenerModelos } from '../services/libra-api';

export default function TestVehiculos() {
  const [marcas, setMarcas] = useState([]);
  const [marcaSeleccionada, setMarcaSeleccionada] = useState('');
  const [modelos, setModelos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cargarMarcas = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('🔍 Cargando marcas...');
      const data = await obtenerMarcas();
      console.log('✅ Marcas recibidas:', data);
      setMarcas(data);
      setModelos([]);
      setMarcaSeleccionada('');
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cargarModelos = async (makeId) => {
    if (!makeId) return;
    
    setLoading(true);
    setError('');
    try {
      console.log('🔍 Cargando modelos para marca ID:', makeId);
      const data = await obtenerModelos(makeId);
      console.log('✅ Modelos recibidos:', data);
      setModelos(data);
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarcaChange = (e) => {
    const value = e.target.value;
    setMarcaSeleccionada(value);
    if (value) {
      cargarModelos(value);
    } else {
      setModelos([]);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">🚗 Test de Marcas y Modelos LIBRA</h1>

      {error && (
        <div className="alert alert-danger" role="alert">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">1. Cargar Marcas</h5>
          <button
            className="btn btn-primary"
            onClick={cargarMarcas}
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Cargar Marcas de LIBRA'}
          </button>
        </div>
      </div>

      {marcas.length > 0 && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">2. Seleccionar Marca ({marcas.length} disponibles)</h5>
            <select
              className="form-select"
              value={marcaSeleccionada}
              onChange={handleMarcaChange}
              disabled={loading}
            >
              <option value="">-- Seleccionar marca --</option>
              {marcas.map((marca) => (
                <option key={marca.id} value={marca.id}>
                  {marca.description}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {modelos.length > 0 && (
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">3. Modelos ({modelos.length} disponibles)</h5>
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Descripción</th>
                    <th>Datos Adicionales</th>
                  </tr>
                </thead>
                <tbody>
                  {modelos.map((modelo, idx) => (
                    <tr key={modelo.id || idx}>
                      <td>{modelo.id}</td>
                      <td>{modelo.description}</td>
                      <td>
                        <pre className="mb-0" style={{fontSize: '0.8rem'}}>
                          {JSON.stringify(modelo.data, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center mt-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      )}
    </div>
  );
}
