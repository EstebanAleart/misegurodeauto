import axios from "axios";

export default async function fetchingVehicles(type) {
 
    try {
        const response = await axios.get(`https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/${type}?format=json`);
        
        return response;
    } catch (error) {
        console.error('Error fetching vehicle brands:', error);
        return { data: { Results: [] } };  // Retorna un objeto vacío en caso de error
    }
}
