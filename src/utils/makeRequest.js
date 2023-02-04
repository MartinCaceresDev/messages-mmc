import axios from 'axios';

export const makeRequest = async (method, url, path, payload)=>{
  try {
    if (method === 'get'){
      const { data } = await axios.get( url + path );
      return data;
    } else if (method === 'post'){
      await axios.post( url + path, payload );
    } else if (method === 'patch'){
      await axios.patch( url + path, payload)
    } 
  } catch(err){
    console.log(err);
  }
};