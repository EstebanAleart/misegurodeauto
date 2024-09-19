
"use client";
import { Form, Button, Container, Row, Col } from 'react-bootstrap';


export default function ContactForm() {
  return (
    <Container>
      <h1 className="text-primary my-4 ">Formulario de Contacto</h1>
      <Form>
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
              <Form.Control as="select">
                <option>Auto</option>
              </Form.Control>
            </Form.Group>
          </Col>
          <Col sm={12} md={6}>
            <Form.Group controlId="formBrand">
              <Form.Label>Marca</Form.Label>
              <Form.Control type="text" placeholder="Ingresa la marca del vehículo" />
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
