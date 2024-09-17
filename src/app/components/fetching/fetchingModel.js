import axios from "axios";

export default async function fetchingModels(model) {
    console.log(model, "se esta pasando?")
    try {
        const response = await axios.get(`https://vpic.nhtsa.dot.gov/api/vehicles/getmodelsformake/${model}?format=json`);
        
        return response;
    } catch (error) {
        console.error('Error fetching vehicle brands:', error);
        return { data: { Results: [] } };  // Retorna un objeto vacío en caso de error
    }
}