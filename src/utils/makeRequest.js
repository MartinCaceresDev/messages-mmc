import axios from 'axios';

export const makeRequest = async (method, url, path, payload)=>{
  if (method === 'get'){
    try {
      const { data } = await axios.get( url + path );
      return data;
    } catch(err){
      console.log(err);
    }
  } else if (method === 'post'){
    try {
      await axios.post( url + path, payload );
    } catch(err){
      console.log(err);
    }
  } else if (method === 'patch'){
    try {
      await axios.patch( url + path, payload)
    } catch(err){
      console.log(err);
    }
  }
};