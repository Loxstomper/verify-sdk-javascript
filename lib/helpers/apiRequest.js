import VerifyError from '../errors/VerifyError';
import {AppConfig} from '../config';
let XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

/**
 *
 * @param {object} request object containing request type, url paths to make a valid api request
 *  Returns promise resolve json payload || reject error message
 */


let HTTP_ERROR = AppConfig.HTTP_ERROR;
let apiRequest = function(request, accessToken) {
  return new Promise((resolve, reject) => {
    let err;
    let httpRequest = new XMLHttpRequest();
    if (!httpRequest) {
      return reject(new VerifyError(HTTP_ERROR, 'Unable to make a valid HttpRequest'));
    }

    httpRequest.onreadystatechange = handleResponse;
    // httpRequest.onerror = handleError;
    httpRequest.open(request.method, request.url, true);
    if (request.accept) {
      httpRequest.setRequestHeader('Accept', `${request.accept}, text/html`);
    } else {
      httpRequest.setRequestHeader('Accept', 'application/json');
    }

    httpRequest.setRequestHeader('Content-Type', request.contentType || 'application/json');

    if (accessToken && accessToken !== null){
      httpRequest.setRequestHeader('Authorization', `Bearer ${accessToken}`);
    }
    httpRequest.setRequestHeader('Cache-Control', 'no-cache');
    httpRequest.withCredentials = true;

    if (request.data) {
      let data = request.data;
      if (typeof data === 'object' || typeof data === 'boolean') {
        data = JSON.stringify(data);
      }
      httpRequest.send(data);
    } else {
      httpRequest.send(null);
    }

    function handleResponse() {
      if (httpRequest.readyState === 4) {
        if (httpRequest.status >= 200 && httpRequest.status < 300) {
          if (httpRequest.status === 204) {
            return resolve(httpRequest);
          }
          try {
            return resolve(JSON.parse(httpRequest.responseText));
          } catch (error) {
            return resolve(httpRequest.responseText);
          }
        } else if (httpRequest.status >= 400 && httpRequest.status < 500) {
            try {
              err = new VerifyError(HTTP_ERROR, JSON.parse(httpRequest.responseText), httpRequest.status);
            } catch (error) {
              err = new VerifyError(HTTP_ERROR, httpRequest.responseText, httpRequest.status);
            }
            return reject(err);
        } else {
          // handleError();
          return reject(`Error: ${httpRequest.status} ${httpRequest.statusText}`);
        }
      }
    }

    // function handleError(){
    //   if (httpRequest.status === 0 ){
    //     return reject(httpRequest.responseText);
    //   }
    // }
  });
};

module.exports = apiRequest;