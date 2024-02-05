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
 * Render an image card.
 * @param {Object} result - The JSON result node returned from Firefly
 * @returns An HTML Element that renders the image and the ACP ID of the generated asset as a card (using Bootstrap framework)
 */

function renderImageCard(result, type='url') {
    // Create the HTML DOM elements
    const card = document.createElement('div');
    card.classList.add('card');
    const img = document.createElement('img');
    img.classList.add('card-img-top');
    if(type === 'url') {
        img.setAttribute('src', result.image.presignedUrl);
    } 

    if(type === 'inline') {
        img.setAttribute('src', `data:image/png;base64, ${result.base64}`);
    }
    
    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');
    const cardText = document.createElement('p');
    cardText.classList.add('card-text');

    if(type === 'url') {
        cardText.innerText = `ACP Asset ID: ${result.image.id}`
    } 
    
    if(type === 'inline') {
        cardText.innerText = `Seed: ${result.seed}`
    }
    //cardText.innerText = `ACP Asset ID: ${result.image.id}`;

    // Assembles the hierarchy of HTML DOM Elements.
    cardBody.append(cardText);
    card.append(img);
    card.append(cardBody);
    return card;
}

/**
 * Render the ACP asset ID.
 * @param {Object} result 
 * @returns An HTML Element that will display the asset ID.
 */
function renderReferenceID(result) {
    const display = document.createElement('h1');
    display.classList.add('display-6');
    display.innerText = `Image ID: ${result.id}`;
    return display;
}

/**
 * Renders the resulting image(s) in a grid as a collection of cards (using Bootstrap framework) 
 * @param {Object} results - The result array returned from the Firefly response
 */
function renderResults(results, type) {
    if(results.length > 0) {
        const resultContainer = document.getElementById('results');
        results.map(result => {
            const item = document.createElement('div');
            item.classList.add('col');
            let card = null;
            switch (type) {
                case 'image':
                    card = renderImageCard(result);
                    item.append(card);
                    break;
                case 'base64':
                    card = renderImageCard(result, 'inline');
                    item.append(card);
                    break;
                case 'reference':
                    card = renderReferenceID(result);
                    item.append(card);
            }
            /*
            if(type === 'image') {
                const card = renderImageCard(result);
                item.append(card);
            } else {
                const display = renderReferenceID(result);
                item.append(display);
            }
            */
            
            resultContainer.append(item);
        });
    }
}


/**
 * Displays an alert message. Used to display error messages as needed. Requires a DIV in the page with an id of "alert-anchor".
 * Also logs in the browser developer console for convenience.
 * @param {String} message - The text included in the alert box
 * @param {String} type - Controls the color of the alert box, errors will always be "danger".
 */
function showAlert(message, type) {
    const alertPlaceholder = document.getElementById('alert-anchor');
    const wrapper = document.createElement('div');
    wrapper.innerHTML = [
      `<div class="alert alert-${type} alert-dismissible" role="alert">`,
      `   <div>${message}</div>`,
      '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
      '</div>'
    ].join('');
    alertPlaceholder.append(wrapper);
  }