import Axios from 'axios';

const Api = {
    getFind: (searchParam) => Axios.get(`/find/${searchParam}`),
};

export default Api;
