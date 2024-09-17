"use client";
import { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, ListGroup } from 'react-bootstrap';
import fetchingVehicles from './components/fetching/fetchVehicleType';
import AutocompleteBrand from './components/autocomplete/autocompleteBrand';
import fetchingModels from './components/fetching/fetchingModel';
import AutocompleteModel from './components/autocomplete/autocompleteModel';
import AutocompleteProvinces from './components/autocomplete/autocompleteProvinces';



export default function ContactFormMain() {
  const [brands, setBrands] = useState([]);
  const [type, setType] = useState("");
  const [selectedBrand,setSelectedBrand]=useState(undefined);
  const [selectedModel,setSelectedModel]=useState(undefined);
  const [models, setModels]= useState([])

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    celular: '',
    email: '',
    provincia: '',
    localidad: '',
    tipoVehiculo:  '',
    marca:  '',
    modelo:   '',
    año: '',
    usoVehiculo: '',
    mensaje: '',
  });

  const handleChange = (e) => {

    setFormData({
      ...formData,

      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validar que los campos obligatorios no estén vacíos
    const {
      nombre,
      apellido,
      celular,
      email,
      provincia,
      localidad,
      tipoVehiculo,
      marca:selectedBrand,
      modelo:selectedModel,
      año,
      usoVehiculo
    } = formData;

    

    // Construir el mensaje de WhatsApp
    const mensaje = `Nombre: ${nombre}\nApellido: ${apellido}\nCelular: ${celular}\nEmail: ${email}\nProvincia: ${provincia}\nLocalidad: ${localidad}\nTipo de Vehículo: ${tipoVehiculo}\nMarca: ${marca}\nModelo: ${modelo}\nAño: ${año}\nUso del Vehículo: ${usoVehiculo}\nMensaje: ${formData.mensaje || "Sin mensaje"}`;

    console.log(mensaje)
    // Redirigir a WhatsApp
    const whatsappURL = `https://wa.me/3412285850?text=${encodeURIComponent(mensaje)}`;
    window.open(whatsappURL, '_blank');
  };


  
  useEffect(() => {
    const fetchBrands = async () => {
      if (type) {
        try {
          const response = await fetchingVehicles(type);
          if (response.data.Results) {
            setBrands(response.data.Results);
          }
        } catch (error) {
          console.error('Error fetching vehicle brands:', error);
        }
      }
    };

    fetchBrands();
  }, [type]);

  useEffect(() => {
    const fetchModels = async () => {
      
      if (selectedBrand) {
        try {
          
          const response = await fetchingModels(selectedBrand);
          if (response.data.Results) {
            setModels(response.data.Results);
          }
        } catch (error) {
          console.error('Error fetching vehicle Models:', error);
        }
      }
    };

    fetchModels()
  }, [selectedBrand]);
  useEffect(() => {

  }, []);

  const handleVehicleChange = (event) => {
    setType(event.target.value);
  };
  const handleBrandChange = (brand) => {
    setSelectedBrand(brand);
  };

  const handleModelChange = (model) => {
    setSelectedModel(model);
  };

  
  
  return (
    <Container>
      <h1 className="text-primary my-4">Formulario de Contacto</h1>
      <Form className="text-dark fw-bold" onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col sm={12} md={6} className="mb-3">
            <Form.Group controlId="nombre">
              <Form.Label>Nombre</Form.Label>
              <Form.Control type="text" placeholder="Ingresa tu nombre" onChange={handleChange} required />
            </Form.Group>
          </Col>
          <Col sm={12} md={6}>
            <Form.Group controlId="apellido">
              <Form.Label>Apellido</Form.Label>
              <Form.Control type="text" placeholder="Ingresa tu apellido" onChange={handleChange} required />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col sm={12} md={6} className="mb-3">
            <Form.Group controlId="celular">
              <Form.Label>Número de Celular</Form.Label>
              <Form.Control type="number" placeholder="Ingresa tu número de celular" onChange={handleChange} required />
            </Form.Group>
          </Col>
          <Col sm={12} md={6}>
            <Form.Group controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" placeholder="Ingresa tu email" onChange={handleChange} required />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col sm={12} md={6} className="mb-3">
            <Form.Group controlId="provincia">
              <Form.Label>Provincia</Form.Label>
              <AutocompleteProvinces onChange={(e) => { handleChange(e) }} required />
            </Form.Group>
          </Col>
          <Col sm={12} md={6}>
            <Form.Group controlId="localidad">
              <Form.Label>Localidad</Form.Label>
              <Form.Control type="text" placeholder="Ingresa tu localidad" onChange={handleChange} required />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col sm={12} md={6} className="mb-3">
            <Form.Group controlId="tipoVehiculo">
              <Form.Label>Vehículo</Form.Label>
              <Form.Control as="select" onChange={(e) => { handleChange(e); setType(e.target.value); }} required>
                <option value="">Selecciona tipo de vehículo</option>
                <option value="car">Auto</option>
              </Form.Control>
            </Form.Group>
          </Col>
          <Col sm={12} md={6}>
            <Form.Group controlId="marca">
              <Form.Label>Marca</Form.Label>
              <AutocompleteBrand brands={brands} onBrandSelect={handleBrandChange} onChange={(e) => { handleChange(e); }} />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-5">
          <Col sm={12} md={6} className="mb-3">
            <Form.Group controlId="año">
              <Form.Label>Año</Form.Label>
              <Form.Control type="number" placeholder="Ingresa el año del vehículo" onChange={handleChange} required />
            </Form.Group>
          </Col>
          <Col sm={12} md={6}>
            <Form.Group controlId="modelo">
              <Form.Label>Modelo</Form.Label>
              <AutocompleteModel models={models} onModelSelect={handleModelChange} onChange={(e) => { handleChange(e); }} />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col sm={12} md={6} className="mb-3">
            <Form.Group controlId="usoVehiculo">
              <Form.Label>Uso del vehículo</Form.Label>
              <Form.Control as="select" onChange={handleChange} required>
                <option value="">Selecciona tipo de uso</option>
                <option value="personal">Personal</option>
                <option value="comercial">Comercial</option>
              </Form.Control>
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Form.Group controlId="mensaje">
            <Form.Label>Mensaje</Form.Label>
            <Form.Control as="textarea" rows={3} placeholder="Escribe tu mensaje aquí" onChange={handleChange} />
          </Form.Group>
        </Row>
        <Button variant="primary" type="submit">
          Enviar
        </Button>
      </Form>
    </Container>
  );
}
