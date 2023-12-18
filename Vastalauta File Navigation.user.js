// ==UserScript==
// @name         Vastalauta File Navigation
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Automatically navigate through images and videos with keyboard on an image board
// @author       Anonymous
// @match        https://vastalauta.org/*
// @match        https://vastalauta.org/*/*
// @grant        none
// ==/UserScript==

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
        setTimeout(() => simulateClick(images[currentIndex]), 0); // Delay to allow modal to close
    }

    // Function to navigate to the previous image
    function prevImage() {
        closeModal(); // Close current modal
        currentIndex = (currentIndex > 0) ? currentIndex - 1 : images.length - 1;
        setTimeout(() => simulateClick(images[currentIndex]), 0); // Delay to allow modal to close
    }


    function updateImageList() {
        images = Array.from(document.querySelectorAll('.post__file'));
    }


    function handleArrowKeys(event) {
        if (event.key === 'ArrowRight') {
            nextImage();
        } else if (event.key === 'ArrowLeft') {
            prevImage();
        }
    }

    function handleDocumentClick(event) {
        const image = event.target.closest('.post__file');
        if (image) {
            updateIndex(image);
        }
    }

    function initImageNavigation() {
        updateImageList();
        document.addEventListener('keydown', handleArrowKeys);
    }

    function setupEventDelegation() {
        document.body.addEventListener('click', handleDocumentClick);
    }

    function setupObserver() {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.addedNodes.length) {
                    updateImageList();
                }
            });
        });

        const config = { childList: true, subtree: true };
        observer.observe(document.body, config);
    }

    window.addEventListener('load', () => {
        initImageNavigation();
        setupEventDelegation();
        setupObserver();
    });
})();
