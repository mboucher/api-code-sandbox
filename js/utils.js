/* ************************************************************************
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 * Copyright 2024 Adobe
 * All Rights Reserved.
 *
 * NOTICE: All information contained herein is, and remains
 * the property of Adobe and its suppliers, if any. The intellectual
 * and technical concepts contained herein are proprietary to Adobe
 * and its suppliers and are protected by all applicable intellectual
 * property laws, including trade secret and copyright laws.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe.
************************************************************************* */

/**
 * Convenience function that can be used to generate random seed values.
 * @returns Random seed number between 1 & 999999.
 */
function getRandomSeedValue() {
  const min = 1;
  const max = 999999;
  return Math.random() * (max - min) + min;
}

/**
 * Calls a utility function deployed on adobe.io runtime which fetches an IMS access token on behalf of this client app.
 * Direct call to IMS is not possible when running a web app locally (CORS security).
 * @returns {String} IMS Access Token used to make Firefly API calls.
 */
async function getToken() {
  try {
    const res = await fetch(tokenServiceURL);
    const payload = await res.json();
    return payload['access_token'];
  } catch (e) {
    showAlert(`GET TOKEN ERROR: Error while requesting the API token, ${e}`, 'danger');
  }
}

/**
 * Function that dynamically builds the header needed to execute Firefly API calls
 * @returns {Object} an HTTP header object which includes a generated access token.
 */
async function buildHeader() {
  const accessToken = await getToken();
  const header = {
    "Authorization": `Bearer ${accessToken}`,
    "x-api-key": API_KEY,
    "Content-Type":"application/json"
  };
  return header;
}


/**
 * Global function used to execute HTTP requests to Firefly API. Uses the built-in Fetch javascript library
 * @param {String} endpoint - The API endpoint (e.g. /v2/images/generate for the Text to Image API) 
 * @param {Object} body - The content that will be sent to the API. This can be JSON, or a binary file
 * @param {String} mode - Default = 'reference'. The mode flag is used to mutate the request headers and body based on API requirements.
 *        supported modes: 'reference', 'file', 'base64'
 */
async function httpRequest(endpoint, body, mode='reference') {
    // Getting a handle on the button to disable it while API call is in progress...
    const button = document.getElementById('api-trigger');
    const label = document.getElementById('button-label');
    const value = label.innerText;
    const spinner = `<span id="spinner" class="spinner-border spinner-border-sm" aria-hidden="true"></span>`;

    // Clear results & errors if any are displayed
    document.getElementById('results').innerHTML = '';
    document.getElementById('alert-anchor').innerHTML = '';

    try {
      // Update the button state to let the user know we're busy.
      button.setAttribute('disabled','true');
      label.innerText = 'Working...';
      button.insertAdjacentHTML('afterbegin',spinner);
      
      const header = await buildHeader();
      const requestInfo = {
        method: "POST",
        headers: header
      };

      // Configure the HTTP request based on the API requirements.
      // See: https://firefly-api-beta.redoc.ly/openapi/openapi/operation/v1/images/generations
      let formData = null;
      switch(mode){
        case 'file': 
          formData = new FormData();
          formData.append('image', body);
          requestInfo.headers['Content-Type'] = body.type;
          requestInfo.body = body;
          break;
        case 'reference':
          requestInfo.body = JSON.stringify(body);
          break;
        case 'base64':
          requestInfo.headers['Accept'] = 'application/json+base64';
          requestInfo.headers['x-accept-mimetype'] = 'image/png';
          requestInfo.body = JSON.stringify(body);
          break;
      };

      // Make the call
      const res = await fetch(`${baseURL}${endpoint}`, requestInfo);
      
      // Reset the button to default state
      label.innerText = value;
      button.removeAttribute('disabled');
      document.getElementById('spinner').remove();
      
      // Handle the response 
      const payload = await res.json();
      return payload;
    } catch (e) {
      showAlert(`API REQUEST ERROR: Unable to execute API call, ${e}`, 'danger');
    }
}


