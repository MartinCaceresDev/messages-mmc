import axios from 'axios';
import { urlServer } from '../utils';

export const makeRequest = async (method, path, payload)=>{
  try {
    if (method === 'get'){
      const { data } = await axios.get( urlServer + path );
      return data;
    } else if (method === 'post'){
      await axios.post( urlServer + path, payload );
    } else if (method === 'patch'){
      await axios.patch( urlServer + path, payload)
    } 
  } catch(err){
    console.log(err);
  }
};