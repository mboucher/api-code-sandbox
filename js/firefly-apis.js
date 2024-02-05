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
 * Call the Text to Image API.
 * Uses the text entered in the HTML page as the prompt.
 * All other settings are hard-coded below to keep it simple.
 * 
 * NOTE: 
 */
function textToImage() {
    // Get the prompt from the HTML page.
    const prompt = document.getElementById('prompt').value;
    if(prompt === '' || prompt === undefined) {
      showAlert('PROMPT ERROR: You must provide a prompt', 'danger');
    } else {
      const body = {
        "prompt": prompt,
        "size": "1024x1024",
        "n": 1,
        "seeds": [
          1
        ],
        "contentClass": null,
        "styles": [
          "concept art",
          "splattering"
        ]
      };

      const mode = 'base64';
      httpRequest('/v1/images/generations', body, mode).then( payload => {
        console.log(payload);
        if(payload.images) {
          const results = payload.images;
          renderResults(results, mode);
        } else {
          showAlert(`TEXT TO IMAGE ERROR - ${payload['error_code']}: ${payload['message']}`, 'danger');
        }
      });
    }
}

/**
 * Generative Match 
 */
function generativeMatch() {
  const assetID = document.getElementById('imageId').value;
  const prompt = document.getElementById('prompt').value;

  if(assetID === undefined || prompt === undefined) {
    showAlert('GENERATIVE MATCH ERROR: You must provide an asset ID and a prompt!', 'danger');
  } else {
     const body ={
      "prompt": prompt,
      "negativePrompt": "Flowers, people.",
      "contentClass": "photo",
      "n": 2,
      "seeds": [
        getRandomSeedValue(),
        getRandomSeedValue()
      ],
      "size": {
        "width": 2048,
        "height": 2048
      },
      "photoSettings": {
        "aperture": 1.2,
        "shutterSpeed": 0.0005,
        "fieldOfView": 14
      },
      "styles": {
        "presets": [],
        "referenceImage": {
          "id": assetID
        },
        "strength": 60
      },
      "visualIntensity": 6,
      "locale": "en-US"
    };

    httpRequest('/v2/images/generate', body, 'reference').then( payload => {
      console.log(payload);
      if(payload.outputs) {
        const results = payload.outputs;
        renderResults(results, 'image');
      } else {
        showAlert(`GENERATIVE MATCH ERROR - ${payload['error_code']}: ${payload['message']}`, 'danger');
      }
    });

  }
}


/**
 * Call the Generative Expand API.
 * Uses the image id as the baseline image
 * Uses the text entered in the HTML page as the prompt to generate the fill for expansion.
 * All other settings are hard-coded below to keep it simple.
 */
function generativeExpand() {
  const assetID = document.getElementById('imageId').value;
  const prompt = document.getElementById('prompt').value;

  if(assetID === undefined || prompt === undefined) {
    showAlert('GENERATIVE EXPAND ERROR: You must provide an asset ID and a prompt!', 'danger');
  } else {
     const body = {
      "prompt": prompt,
      "n": 1,
      "image": {
          "id": assetID
      },
      "size": {
          "width": 1792,
          "height": 1024
      }
    };

    httpRequest('/v1/images/expand', body, 'reference').then( payload => {
      console.log(payload);
      if(payload.images) {
        const results = payload.images;
        renderResults(results, 'image');
      } else {
        showAlert(`GENERATIVE EXPAND ERROR - ${payload['error_code']}: ${payload['message']}`, 'danger');
      }
    });

  }
}

/**
 * Call the Generative Expand API.
 * Uses the mask id to reference an uploaded file which contains the mask (how to create mask-> https://www.youtube.com/watch?v=Ni4dJs3kthA)
 * Uses the image id as the baseline image
 * Uses the text entered in the HTML page as the prompt to create the fill.
 * All other settings are hard-coded below to keep it simple.
 */

function generativeFill() {
  const maskID = document.getElementById('maskId').value;
  const assetID = document.getElementById('imageId').value;
  const prompt = document.getElementById('prompt').value;

  if(maskID === undefined || assetID === undefined || prompt === undefined) {
    showAlert('GENERATIVE FILL ERROR: You must provide a mask ID, asset ID and a prompt!', 'danger');
  } else {
    const body = {
      "prompt": prompt,
      "n": 1,
      "size": {
      "width": 1792,
      "height": 1024
      },
      "image": {
          "id": assetID
      },
      "mask":{
          "id": maskID
      }
    };

    httpRequest('/v1/images/fill', body, 'reference').then( payload => {
      console.log(payload);
      if(payload.images) {
        const results = payload.images;
        renderResults(results, 'image');
      } else {
        showAlert(`GENERATIVE FILL ERROR - ${payload['error_code']}: ${payload['message']}`, 'danger');
      }
      
    }).catch(e => {
      showAlert(`GENERATIVE FILL ERROR: ${e}`, 'danger');
    });

  }
}

/**
 * Call the Upload Image API.
 * This will upload the file to ACP and return an ID. 
 * Copy this ID when you need to include an image reference for other API calls (e.g. Generative Fill, Text to Image)
 */
function handleFileUpload() {
  const file = document.getElementById("formFile").files[0];
  if(file === undefined) {
    showAlert('FILE UPLOAD ERROR: select a file to upload', 'danger');
  } else {
    httpRequest('/v2/storage/image',file, 'file').then(payload => {
      const results = payload.images;
      renderResults(results, 'reference');
      console.log(payload);
    });
  }

}