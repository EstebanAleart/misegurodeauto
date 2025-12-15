"use client";
import { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert, Spinner, Card } from 'react-bootstrap';
import { obtenerCotizacion } from '../../services/libra-api';
import { obtenerCodiaDesdeTabla } from '../../utils/codigoInfoAuto';
import './autoCotizador.css';

export default function AutoCotizador() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [cotizacion, setCotizacion] = useState(null);

  const [formData, setFormData] = useState({
    // Datos personales
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    documento: '',
    provincia: '',
    codPostal: '',
    
    // Datos del vehículo
    tipoVehiculo: 'auto', // auto, moto, camioneta, etc.
    marca: 'Toyota',
    modelo: 'Corolla',
    año: '2012',
    patente: '',
    uso: 'particular', // particular, comercial, etc.
    codIA: '8840030', // Código InfoAuto - ejemplo de LIBRA
    
    // Cobertura
    cobertura: 'basica', // basica, extendida, premium
    franquicia: '10000'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  // Sugerir CodIA cuando cambian marca, modelo o año (pero permitir edición manual)
  useEffect(() => {
    if (formData.marca && formData.modelo && formData.año) {
      const codIA = obtenerCodiaDesdeTabla(formData.marca, formData.modelo, parseInt(formData.año));
      // Solo actualizar si encontró un código válido (diferente de 0)
      if (codIA !== 0) {
        setFormData(prev => ({
          ...prev,
          codIA: String(codIA)
        }));
      }
      // Si es 0, dejar el campo para que el usuario lo complete manualmente
    }
  }, [formData.marca, formData.modelo, formData.año]);



  const validarFormulario = () => {
    const camposRequeridos = [
      'nombre',
      'apellido',
      'email',
      'telefono',
      'documento',
      'provincia',
      'codPostal',
      'marca',
      'modelo',
      'año',
      'patente'
    ];

    const faltantes = camposRequeridos.filter(campo => !formData[campo]);
    
    if (faltantes.length > 0) {
      setError(`Campos requeridos faltantes: ${faltantes.join(', ')}`);
      return false;
    }

    // Validar año
    const año = parseInt(formData.año);
    const añoActual = new Date().getFullYear();
    if (año < 1990 || año > añoActual) {
      setError(`El año debe estar entre 1990 y ${añoActual}`);
      return false;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Email inválido');
      return false;
    }

    return true;
  };

  const handleCotizar = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    setLoading(true);
    setError(null);
    setCotizacion(null);

    try {
      // Preparar datos para cotización (incluye validación de vehículo)
      const cotizacionData = {
        // Asegurado
        asegurado: {
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          telefono: formData.telefono,
          documento: formData.documento,
          provincia: formData.provincia,
          codPostal: formData.codPostal
        },
        
        // Vehículo
        vehiculo: {
          tipo: formData.tipoVehiculo,
          marca: formData.marca,
          modelo: formData.modelo,
          año: parseInt(formData.año),
          patente: formData.patente.toUpperCase(),
          uso: formData.uso,
          codIA: formData.codIA ? parseInt(formData.codIA) : 0
        },
        
        // Cobertura
        cobertura: {
          tipo: formData.cobertura,
          franquicia: parseInt(formData.franquicia)
        }
      };

      // Obtener cotización (la API valida el vehículo internamente)
      const resultado = await obtenerCotizacion(cotizacionData);
      
      setCotizacion(resultado);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
      
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al obtener cotización');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLimpiar = () => {
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      documento: '',
      provincia: '',
      tipoVehiculo: 'auto',
      marca: '',
      modelo: '',
      año: '',
      patente: '',
      uso: 'particular',
      cobertura: 'basica',
      franquicia: '10000'
    });
    setCotizacion(null);
    setError(null);
    setSuccess(false);
  };

  return (
    <Container className="auto-cotizador py-5">
      <Row className="mb-4">
        <Col>
          <h1 className="text-center mb-3">Auto Cotizador LIBRA</h1>
          <p className="text-center text-muted">
            Obtén una cotización instant en menos de 2 minutos
          </p>
        </Col>
      </Row>

      {error && (
        <Row className="mb-3">
          <Col>
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              <Alert.Heading>Error</Alert.Heading>
              <p>{error}</p>
            </Alert>
          </Col>
        </Row>
      )}

      {success && (
        <Row className="mb-3">
          <Col>
            <Alert variant="success" onClose={() => setSuccess(false)} dismissible>
              ✓ Cotización obtenida correctamente
            </Alert>
          </Col>
        </Row>
      )}

      <Row>
        <Col lg={8}>
          <Card className="shadow-sm">
            <Card.Body>
              <Form onSubmit={handleCotizar}>
                {/* DATOS PERSONALES */}
                <h5 className="mb-3 mt-0">Datos Personales</h5>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Nombre *</Form.Label>
                      <Form.Control
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        placeholder="Juan"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Apellido *</Form.Label>
                      <Form.Control
                        type="text"
                        name="apellido"
                        value={formData.apellido}
                        onChange={handleInputChange}
                        placeholder="García"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Email *</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="tu@email.com"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Teléfono *</Form.Label>
                      <Form.Control
                        type="tel"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleInputChange}
                        placeholder="341-6105284"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Documento *</Form.Label>
                      <Form.Control
                        type="text"
                        name="documento"
                        value={formData.documento}
                        onChange={handleInputChange}
                        placeholder="12345678"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Código Postal *</Form.Label>
                      <Form.Control
                        type="text"
                        name="codPostal"
                        value={formData.codPostal}
                        onChange={handleInputChange}
                        placeholder="2000"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Provincia *</Form.Label>
                      <Form.Select
                        name="provincia"
                        value={formData.provincia}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Seleccionar provincia</option>
                        <option value="capital-federal">Capital Federal</option>
                        <option value="buenos-aires">Buenos Aires</option>
                        <option value="santa-fe">Santa Fe</option>
                        <option value="cordoba">Córdoba</option>
                        <option value="mendoza">Mendoza</option>
                        <option value="entre-rios">Entre Ríos</option>
                        <option value="misiones">Misiones</option>
                        <option value="corrientes">Corrientes</option>
                        <option value="formosa">Formosa</option>
                        <option value="chaco">Chaco</option>
                        <option value="santiago-del-estero">Santiago del Estero</option>
                        <option value="tucuman">Tucumán</option>
                        <option value="salta">Salta</option>
                        <option value="jujuy">Jujuy</option>
                        <option value="catamarca">Catamarca</option>
                        <option value="la-rioja">La Rioja</option>
                        <option value="san-juan">San Juan</option>
                        <option value="san-luis">San Luis</option>
                        <option value="la-pampa">La Pampa</option>
                        <option value="neuquen">Neuquén</option>
                        <option value="rio-negro">Río Negro</option>
                        <option value="chubut">Chubut</option>
                        <option value="santa-cruz">Santa Cruz</option>
                        <option value="tierra-del-fuego">Tierra del Fuego</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <hr className="my-4" />

                {/* DATOS DEL VEHÍCULO */}
                <h5 className="mb-3">Datos del Vehículo</h5>
                
                <Alert variant="info" className="mb-3">
                  <Alert.Heading className="h6">
                    ℹ️ Sobre el Código InfoAuto
                  </Alert.Heading>
                  <small>
                    El código InfoAuto identifica cada vehículo en el mercado argentino. 
                    <strong> Si no lo conoces</strong>, puedes:
                    <ul className="mb-0 mt-2">
                      <li>Consultarlo en el sitio web de InfoAuto</li>
                      <li>Revisar la documentación de tu vehículo</li>
                      <li>Ejemplos: Toyota Corolla 2012 = <code>8840030</code></li>
                    </ul>
                  </small>
                </Alert>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Tipo de Vehículo *</Form.Label>
                      <Form.Select
                        name="tipoVehiculo"
                        value={formData.tipoVehiculo}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="auto">Auto</option>
                        <option value="moto">Moto</option>
                        <option value="camioneta">Camioneta</option>
                        <option value="camion">Camión</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Uso del Vehículo *</Form.Label>
                      <Form.Select
                        name="uso"
                        value={formData.uso}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="particular">Particular</option>
                        <option value="comercial">Comercial</option>
                        <option value="transporte">Transporte</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Marca *</Form.Label>
                      <Form.Control
                        type="text"
                        name="marca"
                        value={formData.marca}
                        onChange={handleInputChange}
                        placeholder="Toyota"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Modelo *</Form.Label>
                      <Form.Control
                        type="text"
                        name="modelo"
                        value={formData.modelo}
                        onChange={handleInputChange}
                        placeholder="Corolla"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Año *</Form.Label>
                      <Form.Control
                        type="number"
                        name="año"
                        value={formData.año}
                        onChange={handleInputChange}
                        placeholder={new Date().getFullYear()}
                        min="1990"
                        max={new Date().getFullYear()}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Patente *</Form.Label>
                      <Form.Control
                        type="text"
                        name="patente"
                        value={formData.patente}
                        onChange={handleInputChange}
                        placeholder="AB123CD"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Código InfoAuto *</Form.Label>
                      <Form.Control
                        type="number"
                        name="codIA"
                        value={formData.codIA}
                        onChange={handleInputChange}
                        placeholder="Ej: 8840030"
                        required
                      />
                      <Form.Text className="text-muted">
                        {formData.codIA && formData.codIA !== '0' 
                          ? '✓ Código ingresado' 
                          : '⚠️ Ingresa el código InfoAuto del vehículo'}
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Uso del Vehículo *</Form.Label>
                      <Form.Select
                        name="uso"
                        value={formData.uso}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="particular">Particular</option>
                        <option value="comercial">Comercial</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <hr className="my-4" />

                {/* COBERTURA */}
                <h5 className="mb-3">Opciones de Cobertura</h5>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Tipo de Cobertura *</Form.Label>
                      <Form.Select
                        name="cobertura"
                        value={formData.cobertura}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="basica">Básica (RC)</option>
                        <option value="extendida">Extendida (RC + Cristales)</option>
                        <option value="premium">Premium (Todo Riesgo)</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Franquicia *</Form.Label>
                      <Form.Select
                        name="franquicia"
                        value={formData.franquicia}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="5000">$ 5.000</option>
                        <option value="10000">$ 10.000</option>
                        <option value="15000">$ 15.000</option>
                        <option value="20000">$ 20.000</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex gap-2 mt-4">
                  <Button
                    variant="primary"
                    size="lg"
                    type="submit"
                    disabled={loading}
                    className="flex-grow-1"
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Obteniendo cotización...
                      </>
                    ) : (
                      'Obtener Cotización'
                    )}
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    type="button"
                    onClick={handleLimpiar}
                    disabled={loading}
                  >
                    Limpiar
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* RESULTADO DE COTIZACIÓN */}
        {cotizacion && (
          <Col lg={4}>
            <Card className="shadow-sm sticky-top" style={{ top: '20px' }}>
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">Resultado de Cotización</h5>
              </Card.Header>
              <Card.Body>
                <div className="cotizacion-resultado">
                  <div className="mb-3">
                    <small className="text-muted">Vehículo</small>
                    <p className="mb-0 fw-bold">
                      {cotizacion.vehiculo?.año} {cotizacion.vehiculo?.marca} {cotizacion.vehiculo?.modelo}
                    </p>
                  </div>

                  <div className="mb-3">
                    <small className="text-muted">Cobertura</small>
                    <p className="mb-0 fw-bold">{cotizacion.cobertura?.tipo}</p>
                  </div>

                  <hr />

                  <div className="mb-3 text-center">
                    <small className="text-muted">Prima Mensual</small>
                    <h3 className="mb-0 text-primary">
                      {cotizacion.prima ? `$${cotizacion.prima.toLocaleString('es-AR')}` : 'N/A'}
                    </h3>
                  </div>

                  <div className="mb-3">
                    <small className="text-muted">Prima Anual</small>
                    <p className="mb-0 fw-bold">
                      {cotizacion.primaAnual ? `$${cotizacion.primaAnual.toLocaleString('es-AR')}` : 'N/A'}
                    </p>
                  </div>

                  <div className="mb-3">
                    <small className="text-muted">Franquicia</small>
                    <p className="mb-0 fw-bold">
                      ${cotizacion.cobertura?.franquicia?.toLocaleString('es-AR')}
                    </p>
                  </div>

                  {cotizacion.vigencia && (
                    <div className="mb-3">
                      <small className="text-muted">Vigencia</small>
                      <p className="mb-0 fw-bold">{cotizacion.vigencia}</p>
                    </div>
                  )}

                  <hr />

                  <Button variant="success" className="w-100">
                    Contratar Póliza
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>
    </Container>
  );
}
