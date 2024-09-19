"use client"

import axios from 'axios';
import {  useState } from 'react';

// Componente para filtrar municipios por provincia
export default async function fetchMunicipios({ provinciaId }) {
  const [municipios, setMunicipios] = useState([]);

 
  
    try {
      const response = await axios.get('https://infra.datos.gob.ar/catalog/modernizacion/dataset/7/distribution/7.4/download/municipios.json');
      
     
      const municipiosFiltrados = response.data.municipios.filter(municipio => Number(municipio.provincia.id) === Number(provinciaId));
      
     
      setMunicipios(municipiosFiltrados);
      if (municipios.length) return municipios
    } catch (error) {
      console.error('Error al obtener los municipios:', error);
    }
}
