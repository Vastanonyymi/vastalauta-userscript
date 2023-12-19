// ==UserScript==
// @name         Vastalauta middle click image in a new tab
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Open full-size images and videos in a new tab on middle click on Vastalauta
// @author       Anonymous
// @source       https://github.com/Vastanonyymi/vastalauta-userscript/
// @match        https://vastalauta.org/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Function to handle the middle click
    const handleMiddleClick = (event) => {
        // Check if the middle mouse button was clicked
        if (event.button === 1) {
            const imageContainer = event.target.closest('.js-post-file-expand');
            if (imageContainer) {
                const fullImageURL = imageContainer.getAttribute('data-fullsrc');
                if (fullImageURL) {
                    // Open the full-size image in a new tab
                    window.open(fullImageURL, '_blank');
                    event.preventDefault();
                }
            }
        }
    };

    // Add event listener to a common parent element
    const contentContainer = document.querySelector('body');
    if (contentContainer) {
        contentContainer.addEventListener('mousedown', handleMiddleClick, false);
    }
})();