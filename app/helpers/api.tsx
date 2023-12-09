import Axios from 'axios';

const Api = {
    getFind: (searchParam) => Axios.get(`/find/${searchParam}`),

    getDrives: () => Axios.get('/drives'),
    getExecute: (driveLetter) => Axios.get(`/execute/${driveLetter}`),
        
};

export default Api;
