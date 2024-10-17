"use client";
import { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import fetchingVehicles from './components/fetching/fetchVehicleType';
import AutocompleteBrand from './components/autocomplete/autocompleteBrand';
import fetchingModels from './components/fetching/fetchingModel';
import AutocompleteModel from './components/autocomplete/autocompleteModel';
import AutocompleteProvinces from './components/autocomplete/autocompleteProvinces';
import IconWhatsapp from './components/icon/iconWhatsapp';
// import IconMail from './components/icon/iconMail';

export default function ContactFormMain() {
  const [brands, setBrands] = useState([]);
  const [type, setType] = useState("");
  const [selectedBrand, setSelectedBrand] = useState(undefined);
  const [selectedModel, setSelectedModel] = useState(undefined);
  const [models, setModels] = useState([]);
  const [selectedprov, setSelectedprov]= useState(undefined)


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
    // Añadir selectedBrand y selectedModel a formData
    const formWithBrandModel = {
      ...formData,
      marca: selectedBrand || '',
      modelo: selectedModel || '',
      provincia:selectedprov || "",
    };
    
    const {
      nombre,
      apellido,
      celular,
      email,
      provincia,
      localidad,
      tipoVehiculo,
      marca,
      modelo,
      año,
      usoVehiculo,
      mensaje
    } = formWithBrandModel;
    
    

    // Construir el mensaje de WhatsApp
    const whatsappMessage = `Hola mi nombre completo es ${nombre} ${apellido}\nMis datos de contacto son:\nCelular: ${celular}\nEmail: ${email}\nResido en la Provincia: ${provincia}, Localidad: ${localidad}\nQuisiera cotizar un seguro para mi vehiculo:\nTipo de Vehículo: ${tipoVehiculo === "car" ? "auto" : ""}\nMarca: ${marca}\nModelo: ${modelo}\nAño: ${año}\nUso del Vehículo: ${usoVehiculo}\nMensaje: ${mensaje || "Sin mensaje"}`;

   

    // Redirigir a WhatsApp
    const whatsappURL = `https://wa.me/+543416105284?text=${encodeURIComponent(whatsappMessage)}`;
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

    fetchModels();
  }, [selectedBrand]);

  const handleVehicleChange = (event) => {
    setType(event.target.value);
  };

  const handleBrandChange = (brand) => {
    setSelectedBrand(brand);
  };

  const handleModelChange = (model) => {
    setSelectedModel(model);
  };

  const handleProvChange =(prov)=>{
    setSelectedprov(prov)
  }

  return (
    <Container>
      {/* <h1 className="text-primary my-4">Formulario de Contacto</h1> */}
      <h1 className="text-primary my-4 ">     </h1>
      <Form className="text-dark fw-bold mt-5" onSubmit={handleSubmit}>
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
              <AutocompleteProvinces onProvSelect={handleProvChange} required />
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
              <AutocompleteBrand brands={brands} onBrandSelect={handleBrandChange} />
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
              <AutocompleteModel models={models} onModelSelect={handleModelChange} />
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
        <Row className="mb-5">
        {/* <Col sm={12} md={6} className='mt-3'> 
        <Button variant="primary" type="submit" >
          Enviar mail <IconMail size="30px"/>
        </Button>
        </Col> */}
        <Col sm={12} md={6} className='mt-3'> 
        <Button variant='btn btn-success' type="submit">
          Enviar WhatsApp <IconWhatsapp size="30"/>
        </Button>
        </Col>
        </Row>
      </Form>
    </Container>
  );
}
