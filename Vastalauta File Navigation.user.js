// ==UserScript==
// @name         Vastalauta File Navigation
// @namespace    http://tampermonkey.net/
// @version      1.7
// @description  Automatically navigate through images and videos with keyboard on an image board
// @author       Anonymous
// @source       https://github.com/Vastanonyymi/vastalauta-userscript/
// @match        https://vastalauta.org/*/*
// @grant        none
// ==/UserScript==


//Vasemmalla ja oikealla nuolinäppäimellä saat kuvat isoksi ja selatuksi langan tiedostot läpi. Yritin tehdä tästä semmosta "avaa kaikki" napin korviketta. 


(function() {
    'use strict';

    // Function to simulate a click event
    function simulateClick(element) {
        const evt = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        element.dispatchEvent(evt);
    }

    // Function to close the current modal
    function closeModal() {
        const modal = document.querySelector('.modal'); // Adjust the selector if necessary
        if (modal) {
            simulateClick(modal);
        }
    }

    // Global variables to keep track of images and current index
    let images = [];
    let currentIndex = -1;
    let isFirstKeyPress = true; // Variable to track if it's the first keypress

    // Function to update the current index based on the clicked image
    function updateIndex(clickedImage) {
        const index = images.indexOf(clickedImage);
        if (index !== -1) {
            currentIndex = index;
        }
    }

    // Function to navigate to the next image
    function nextImage() {
        closeModal(); // Close current modal
        if (isFirstKeyPress) {
            currentIndex = 0;
            isFirstKeyPress = false;
        } else {
            currentIndex = (currentIndex + 1) % images.length; // Loop back to the first image if at the end
        }
        setTimeout(() => simulateClick(images[currentIndex]), 30); // Delay to allow modal to close
    }

    // Function to navigate to the previous image
    function prevImage() {
        closeModal(); // Close current modal
        currentIndex = (currentIndex > 0) ? currentIndex - 1 : images.length - 1;
        setTimeout(() => simulateClick(images[currentIndex]), 30); // Delay to allow modal to close
    }

    // Function to handle arrow key navigation
    function handleArrowKeys(event) {
        if (event.key === 'ArrowRight') {
            nextImage();
        } else if (event.key === 'ArrowLeft') {
            prevImage();
        }
    }

    // Function to initialize image navigation
    function initImageNavigation() {
        images = Array.from(document.querySelectorAll('.post__file'));
        images.forEach(image => {
            image.addEventListener('click', () => updateIndex(image));
        });
        document.addEventListener('keydown', handleArrowKeys);
    }

    // Initialize navigation when the page is fully loaded
    window.addEventListener('load', initImageNavigation);
})();
