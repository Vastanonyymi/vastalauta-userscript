// ==UserScript==
// @name         Vastalauta File Navigation for Mobile
// @namespace    http://tampermonkey.net/
// @version      3.12
// @description  Navigate through images and videos with touch on Vastalauta, and scroll to the thumbnail upon closing a modal. Supports long press for context menu.
// @author       Anonymous
// @source       https://github.com/Vastanonyymi/vastalauta-userscript/
// @match        https://vastalauta.org/*
// @match        https://vastalauta.org/*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    let images = [];
    let currentIndex = -1;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;

    function simulateClick(element) {
        const evt = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        element.dispatchEvent(evt);
    }

    function closeModal() {
        const modal = document.querySelector('.modal');
        if (modal) {
            simulateClick(modal);
        }
    }

    function closeModalAndScroll() {
        closeModal();
        if (currentIndex >= 0 && currentIndex < images.length) {
            const thumbnail = images[currentIndex];
            if (thumbnail) {
                thumbnail.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }

    function nextImage() {
        currentIndex = (currentIndex + 1) % images.length;
        closeModal();
        setTimeout(() => simulateClick(images[currentIndex]), 100);
    }

    function prevImage() {
        currentIndex = (currentIndex > 0) ? currentIndex - 1 : images.length - 1;
        closeModal();
        setTimeout(() => simulateClick(images[currentIndex]), 100);
    }

    function updateImageList() {
        images = Array.from(document.querySelectorAll('.post__file'));
        setupImageClickListeners();
    }

    function setupImageClickListeners() {
        images.forEach((image, index) => {
            image.removeEventListener('click', () => updateIndex(index));
            image.addEventListener('click', () => updateIndex(index));
        });
    }

    function updateIndex(newIndex) {
        currentIndex = newIndex;
    }

    function isModalOpen() {
        return document.querySelector('.modal') !== null;
    }

    function handleTouchStart(event) {
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
        touchStartTime = Date.now();
    }

    function handleTouchEnd(event) {
        if (!isModalOpen()) {
            return; // Allow default behavior (like long press) when no modal is open
        }

        const touchEndX = event.changedTouches[0].clientX;
        const touchEndY = event.changedTouches[0].clientY;
        const touchDuration = Date.now() - touchStartTime;
        const longPressThreshold = 500; // Threshold for long press

        const isTap = touchDuration < longPressThreshold && Math.abs(touchEndX - touchStartX) < 50 && Math.abs(touchEndY - touchStartY) < 50;

        if (isTap) {
            const screenWidth = window.innerWidth;
            const thirdWidth = screenWidth / 3;

            event.preventDefault();
            event.stopPropagation();

            if (touchEndX < thirdWidth) {
                prevImage();
            } else if (touchEndX > screenWidth - thirdWidth) {
                nextImage();
            } else {
                closeModalAndScroll();
            }
        }
    }

    function initTouchNavigation() {
        document.addEventListener('touchstart', handleTouchStart, { passive: false });
        document.addEventListener('touchend', handleTouchEnd, { passive: false });
    }

    // Function to inject custom CSS
    function injectCustomCSS() {
        const style = document.createElement('style');
        style.textContent = `
            .modal .modal__content::after {
                content: ''; // Remove the 'X'
            }
        `;
        document.head.appendChild(style);
    }

    window.addEventListener('load', () => {
        updateImageList();
        initTouchNavigation();
        injectCustomCSS();
    });
})();
