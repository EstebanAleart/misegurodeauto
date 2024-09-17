"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Container, Row, Col, ListGroup } from 'react-bootstrap';
import fetchingVehicles from './components/fetching/fetchVehicleType';

export default function ContactFormMain() {
  const [brands, setBrands] = useState([]);
  const [type, setType] = useState("");
  const [inputValue, setInputValue] = useState('');
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  console.log(type, "al seleccionar")
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

  const handleVehicleChange = (event) => {
    setType(event.target.value);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    if (value) {
      const filtered = brands.filter(brand =>
        brand.MakeName.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredBrands(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredBrands([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion.MakeName);
    setFilteredBrands([]);
    setShowSuggestions(false);
  };

  return (
    <Container>
      <h1 className="text-primary my-4">Formulario de Contacto</h1>
      <Form className="text-dark fw-bold">
        <Row className="mb-3">
          <Col sm={12} md={6}>
            <Form.Group controlId="formFirstName">
              <Form.Label>Nombre</Form.Label>
              <Form.Control type="text" placeholder="Ingresa tu nombre" />
            </Form.Group>
          </Col>
          <Col sm={12} md={6}>
            <Form.Group controlId="formLastName">
              <Form.Label>Apellido</Form.Label>
              <Form.Control type="text" placeholder="Ingresa tu apellido" />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col sm={12} md={6}>
            <Form.Group controlId="formPhoneNumber">
              <Form.Label>Número de Celular</Form.Label>
              <Form.Control type="tel" placeholder="Ingresa tu número de celular" />
            </Form.Group>
          </Col>
          <Col sm={12} md={6}>
            <Form.Group controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" placeholder="Ingresa tu email" />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col sm={12} md={6}>
            <Form.Group controlId="formProvince">
              <Form.Label>Provincia</Form.Label>
              <Form.Control type="text" placeholder="Ingresa tu provincia" />
            </Form.Group>
          </Col>
          <Col sm={12} md={6}>
            <Form.Group controlId="formCity">
              <Form.Label>Localidad</Form.Label>
              <Form.Control type="text" placeholder="Ingresa tu localidad" />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col sm={12} md={6}>
            <Form.Group controlId="formVehicle">
              <Form.Label>Vehículo</Form.Label>
              <Form.Control as="select" onChange={handleVehicleChange}>
                <option value="">Selecciona tipo de vehículo</option>
                <option value="car">Auto</option>
                <option value="motorcycle">Motocicleta</option>
              </Form.Control>
            </Form.Group>
          </Col>
          <Col sm={12} md={6}>
            <Form.Group controlId="formBrand">
              <Form.Label>Marca</Form.Label>
              <div className="position-relative">
                <Form.Control
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder={type=== "" ? "Debe seleccionar un vehiculo" : "Busca marcas..."}
                />
                {showSuggestions && filteredBrands.length > 0 && (
                  <ListGroup className="position-absolute w-100 mt-1">
                    {filteredBrands.map(brand => (
                      <ListGroup.Item
                        key={brand.MakeId}
                        action
                        onClick={() => handleSuggestionClick(brand)}
                      >
                        {brand.MakeName}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </div>
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col sm={12} md={6}>
            <Form.Group controlId="formModel">
              <Form.Label>Modelo</Form.Label>
              <Form.Control type="text" placeholder="Ingresa el modelo del vehículo" />
            </Form.Group>
          </Col>
          <Col sm={12} md={6}>
            <Form.Group controlId="formYear">
              <Form.Label>Año</Form.Label>
              <Form.Control type="number" placeholder="Ingresa el año del vehículo" />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Form.Group controlId="formMessage">
            <Form.Label>Mensaje</Form.Label>
            <Form.Control as="textarea" rows={3} placeholder="Escribe tu mensaje aquí" />
          </Form.Group>
        </Row>
        <Button variant="primary" type="submit">
          Enviar
        </Button>
      </Form>
    </Container>
  );
}
