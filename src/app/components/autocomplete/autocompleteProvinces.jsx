import Provincias from "../utils/provincias";

import React, { useState } from 'react';
import { Form, ListGroup } from 'react-bootstrap';

export default function AutocompleteProvinces() {
  const [inputValue, setInputValue] = useState('');
  const [filteredProv, setFilteredProv] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    if (value) {
      const filtered = Provincias.filter((prov) =>
       prov.nombre.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredProv(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredProv([]);
      setShowSuggestions(false);
    }


  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion.nombre);
    setFilteredProv([]);
    setShowSuggestions(false);
    
  };

  return (
    <div className="position-relative">
      <Form.Control
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Buscar marcas..."
      />
      {showSuggestions && filteredProv.length > 0 && (
        <ListGroup className="position-absolute w-100 mt-1">
          {filteredProv.map(prov => (
            <ListGroup.Item
              key={prov.id}
              action
              onClick={() => handleSuggestionClick(prov)}
            >
              {prov.nombre}
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </div>
  );
}
