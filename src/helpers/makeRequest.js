import axios from 'axios';
import { urlServer } from '../utils';

/**
 * 
 * @param {String} method - (String) Request method.
 * @param {String} path - (String) Path for request.
 * @param {{}} payload - (Object) (optional) The body needed for the request.
 * @returns {{}[]} If GET method is used it returns an array, otherwise it makes request and returns nothing.
 */

export const makeRequest = async (method, path, payload=null)=>{
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