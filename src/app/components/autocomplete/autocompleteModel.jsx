import React, { useState } from 'react';
import { Form, ListGroup } from 'react-bootstrap';

export default function AutocompleteModel({ models, onModelSelect }) {
  const [inputValue, setInputValue] = useState('');
  const [filteredModels, setFilteredModels] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    if (value) {
      const filtered = models.filter((model) =>
        model.Model_Name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredModels(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredModels([]);
      setShowSuggestions(false);
    }

    // Llamar a la función de selección de modelo con el valor actual del input
    onModelSelect(value);
    
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion.Model_Name);
    setFilteredModels([]);
    setShowSuggestions(false);
    onModelSelect(suggestion.Model_Name);
  };

  return (
    <div className="position-relative">
      <Form.Control
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Buscar modelo..."
      />
      {showSuggestions && (
        <ListGroup className="position-absolute w-100 mt-1">
          {filteredModels.length > 0 ? (
            filteredModels.map((model) => (
              <ListGroup.Item
                key={model.Model_ID}
                action
                onClick={() => handleSuggestionClick(model)}
              >
                {model.Model_Name}
              </ListGroup.Item>
            ))
          ) : (
            <ListGroup.Item 
            disabled
            className="text-muted small p-2 text-center  mb-5 ">
              Puedes ingresar el modelo manualmente.
            </ListGroup.Item>
          )}
        </ListGroup>
      )}
    </div>
  );
}

