
import React, { useState } from 'react';
import { Form, ListGroup } from 'react-bootstrap';
import autos from '../utils/carBrands';

export default function AutocompleteBrand  ({ onBrandSelect}) {
    const brands= autos
    const [inputValue, setInputValue] = useState('');
    const [filteredBrands, setFilteredBrands] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);


    

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
    onBrandSelect(suggestion.MakeName);
  };

  return (
    <div className="position-relative">
      <Form.Control
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Buscar marca..."
      />
      {showSuggestions && filteredBrands.length > 0 && (
        <ListGroup className="position-absolute w-100 mt-1 z-3">
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
  );
};


