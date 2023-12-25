// ==UserScript==
// @name         Vastalauta Combined Userscript
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  A unified script for multiple functionalities on Vastalauta
// @author       Anonymous
// @source       https://github.com/Vastanonyymi/vastalauta-userscript/
// @match        https://vastalauta.org/*
// @grant        GM.openInTab
// @run-at       document-body
// ==/UserScript==

(function() {
    'use strict';

    // Configuration section for toggling features
    const enableFileNavigation = true; // Tiedostojen selaus päälle/pois (true/false)
    const enableFinnishTimestamps = true; // Suomalaiset aikaleimat päälle/pois
    const enableMiddleClickNewTab = true; // Keskinäppäimellä avaus uuteen välilehteen
    const enablePostIDs = true; // Viestien numerointi
    const enableTrackUserPosts = true; // Käyttäjän postausten seuranta

    // Improved event listener management
    const eventListeners = [];

    function addEventListener(target, type, listener, options) {
        target.addEventListener(type, listener, options);
        eventListeners.push({ target, type, listener });
    }

    function removeAllEventListeners() {
        eventListeners.forEach(({ target, type, listener }) => {
            target.removeEventListener(type, listener);
        });
        eventListeners.length = 0;
    }

    // Shared functions and utilities (if any common functions are found)
    let images = [];
    let currentImgIndex = -1;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;

    // Feature: File Navigation
    function simulateClick(element) {
        element.click();
    }

    function closeModal() {
        const modal = document.querySelector('.modal');
        if (modal) {
            simulateClick(modal);
        }
    }

    function closeModalAndScroll() {
        closeModal();
        if (currentImgIndex >= 0 && currentImgIndex < images.length) {
            const thumbnail = images[currentImgIndex];
            if (thumbnail) {
                thumbnail.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }

    function nextImage() {
        currentImgIndex = (currentImgIndex + 1) % images.length;
        closeModal();
        setTimeout(() => simulateClick(images[currentImgIndex]), 100);
    }

    function prevImage() {
        currentImgIndex = (currentImgIndex > 0) ? currentImgIndex - 1 : images.length - 1;
        closeModal();
        setTimeout(() => simulateClick(images[currentImgIndex]), 100);
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
        currentImgIndex = newIndex;
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

    function handleKeyPress(event) {
        if (!isModalOpen()) {
            return; // Only respond to key presses when a modal is open
        }

        if (event.key === 'ArrowRight') {
            nextImage();
        } else if (event.key === 'ArrowLeft') {
            prevImage();
        }
    }

    function initTouchNavigation() {
        document.addEventListener('touchstart', handleTouchStart, { passive: false });
        document.addEventListener('touchend', handleTouchEnd, { passive: false });
    }

    function initKeyboardNavigation() {
        window.addEventListener('keydown', handleKeyPress, false);
    }

    function injectCustomCSS() {
        const style = document.createElement('style');
        style.textContent = `
            .modal .modal__content::after {
                content: ''; // Remove the 'X'
            }
        `;
        document.head.appendChild(style);
    }


    // Feature: Finnish Timestamps

    function isAlreadyFinnishFormat(timestamp) {
        // Finnish format: D.M.YYYY H.MM.SS (without leading zeros in day, month, and hour)
        return /^\d{1,2}\.\d{1,2}\.\d{4} \d{1,2}\.\d{2}\.\d{2}$/.test(timestamp);
    }

    function convertTimestampFormat(timestamp) {
        if (isAlreadyFinnishFormat(timestamp)) {
            return timestamp; // Return original if it's already in Finnish format
        }

        const dateTimeParts = timestamp.split(' ');
        if (dateTimeParts.length !== 2) {
            console.error('Unexpected timestamp format:', timestamp);
            return timestamp;
        }

        const dateParts = dateTimeParts[0].split('-');
        const timeParts = dateTimeParts[1].split(':');
        if (dateParts.length !== 3 || timeParts.length !== 3) {
            console.error('Unexpected date or time parts:', dateParts, timeParts);
            return timestamp;
        }

        // Remove leading zeros for day, month, and hour
        const day = dateParts[2].startsWith('0') ? dateParts[2].substr(1) : dateParts[2];
        const month = dateParts[1].startsWith('0') ? dateParts[1].substr(1) : dateParts[1];
        const hour = timeParts[0].startsWith('0') ? timeParts[0].substr(1) : timeParts[0];

        return `${day}.${month}.${dateParts[0]} ${hour}.${timeParts[1]}.${timeParts[2]}`;
    }





    function updateTimestamps() {
        if (!enableFinnishTimestamps) return; {

            const timestamps = document.querySelectorAll('.thread-card__bottom-timestamp, .post__timestamp');
            timestamps.forEach(el => {
                const newTimestamp = convertTimestampFormat(el.textContent);
                if (newTimestamp) {
                    el.textContent = newTimestamp;
                }
            });

        }
    }

    // Feature: Middle Click Image in a New Tab
    // Function for handling middle click on images
    const handleMiddleClick = (event) => {
        if (event.button === 1) { // Middle mouse button
            const imageContainer = event.target.closest('.js-post-file-expand');
            if (imageContainer) {
                // Check if the clicked element is part of the catalog mode
                const isInCatalogMode = imageContainer.closest('[data-type="catalogue"]');
                if (!isInCatalogMode) {
                    const relativeURL = imageContainer.getAttribute('data-fullsrc');
                    if (relativeURL) {
                        const absoluteURL = new URL(relativeURL, window.location.origin).href;
                        GM.openInTab(absoluteURL, true); // Open the absolute URL in a background tab
                        event.preventDefault();
                    }
                }
            }
        }
    };

    // Feature: Post IDs
    function insertPostIDs() {
        if (!enablePostIDs) return;

        const posts = document.querySelectorAll('.post, .js-post'); // Select both normal and catalog posts

        posts.forEach(post => {
            const postId = post.getAttribute('data-id');
            if (postId && !post.querySelector('.post-id')) {
                const idSpan = document.createElement('span');
                idSpan.textContent = postId;
                idSpan.className = 'post-id';
                idSpan.style.marginRight = 'auto';
                idSpan.style.paddingTop = '6px';

                const menuButton = post.querySelector('.post__menu-button');
                const timestamp = post.querySelector('.post__timestamp');
                if (menuButton) {
                    menuButton.parentNode.insertBefore(idSpan, menuButton);
                } else if (timestamp) {
                    timestamp.insertAdjacentElement('afterend', idSpan);
                }
            }
        });
    }

    // Feature: Track User Posts in Thread
    let currentUserPosts;
    let currentIndex;

    function updateInfoText(infoText, currentIndex, totalPosts) {
        infoText.textContent = `Post ${currentIndex + 1} of ${totalPosts}`;
    }

    function createUserOverlay(username) {
        const overlay = document.createElement('div');
        overlay.className = 'user-overlay';
        overlay.style.backgroundColor = '--bg-light-accent'; // Set background color so text is readable
        overlay.style.padding = '5px'; // Add some padding around the buttons and text
        overlay.style.display = 'flex'; // Use flex layout
        overlay.style.alignItems = 'center'; // Align items in the center
        overlay.style.justifyContent = 'space-between'; // Distribute space evenly

        const infoText = document.createElement('div');
        overlay.appendChild(infoText);

        const prevButton = document.createElement('button');
        prevButton.innerText = 'Previous';
        prevButton.style.color = 'var(--bg-font-dim)';
        prevButton.style.paddingLeft = '8px';
        overlay.appendChild(prevButton);

        const nextButton = document.createElement('button');
        nextButton.innerText = 'Next';
        nextButton.style.color = 'var(--bg-font-dim)';
        nextButton.style.paddingRight = '0';
        overlay.appendChild(nextButton);

        return { overlay, infoText, prevButton, nextButton };
    }

    function navigatePosts(direction, infoText) {
        if (!currentUserPosts || currentUserPosts.length === 0){
            return;
        }
        currentIndex += direction;

        if (currentIndex < 0) {
            currentIndex = currentUserPosts.length - 1;
        } else if (currentIndex >= currentUserPosts.length) {
            currentIndex = 0;
        }

        const newPostElement = currentUserPosts[currentIndex];
        newPostElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

        document.querySelectorAll('.user-overlay').forEach(overlay => overlay.remove());

        const username = newPostElement.getAttribute('data-name');
        const { overlay, infoText: newInfoText, prevButton, nextButton } = createUserOverlay(username);

        prevButton.onclick = (event) => {
            event.stopPropagation(); // Stop event from propagating further
            navigatePosts(-1, newInfoText);
        };

        nextButton.onclick = (event) => {
            event.stopPropagation(); // Stop event from propagating further
            navigatePosts(1, newInfoText);
        };

        updateInfoText(newInfoText, currentIndex, currentUserPosts.length);
        const menuButton = newPostElement.querySelector('.post__menu-button');
        if (menuButton) {
            menuButton.style.marginLeft = '0';
            menuButton.parentNode.insertBefore(overlay, menuButton);
        } else {
            const goToArrow = newPostElement.querySelector('.post__go-arrow');
            if (goToArrow) {
                goToArrow.style.marginLeft = '0';
                goToArrow.parentNode.insertBefore(overlay, goToArrow);
            } else {
                newPostElement.querySelector('.post__header').appendChild(overlay);
            }
        }
    }



    function showUserOverlay(username, postElement) {
        // Select only posts that are not inside a 'sub-thread__post-container'
        currentUserPosts = Array.from(document.querySelectorAll(`.post[data-name="${username}"]:not(.sub-thread__post-container .post)`));
        currentIndex = currentUserPosts.findIndex(post => post === postElement);

        document.querySelectorAll('.user-overlay').forEach(overlay => overlay.remove());

        const { overlay, infoText, prevButton, nextButton } = createUserOverlay(username);

        prevButton.onclick = (event) => {
            event.stopPropagation();
            navigatePosts(-1, infoText);
        };

        nextButton.onclick = (event) => {
            event.stopPropagation();
            navigatePosts(1, infoText);
        };

        updateInfoText(infoText, currentIndex, currentUserPosts.length);

        const menuButton = postElement.querySelector('.post__menu-button');
        if (menuButton) {
            menuButton.style.marginLeft = '0';
            menuButton.parentNode.insertBefore(overlay, menuButton);
        } else {
            const goToArrow = postElement.querySelector('.post__go-arrow');
            if (goToArrow) {
                goToArrow.style.marginLeft = '0';
                goToArrow.parentNode.insertBefore(overlay, goToArrow);
            } else {
                postElement.querySelector('.post__header').appendChild(overlay);
            }
        }
    }

    function handleDocumentClick(event) {
        const usernameElement = event.target.closest('.post__username');
        if (usernameElement) {
            event.preventDefault(); // Prevents default action (e.g., opening a reply box)
            event.stopPropagation();
            const postElement = usernameElement.closest('.post');
            const username = usernameElement.textContent;
            showUserOverlay(username, postElement);
        }
    }


  function handleDynamicContent() {
        observer.disconnect();
        try {
            updateTimestamps();
            insertPostIDs();
        } catch (error) {
            console.error('Error handling dynamic content:', error);
        }
        observer.observe(bodyTarget, observerConfig);
    }

    const observerConfig = { childList: true, subtree: true };
    const observer = new MutationObserver(mutations => {
        let shouldUpdate = false;
        mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
                shouldUpdate = Array.from(mutation.addedNodes).some(node =>
                    node.nodeType === Node.ELEMENT_NODE && (
                        node.querySelector('.thread-card__bottom-timestamp, .post__timestamp') ||
                        !node.querySelector('.post-id')
                    )
                );
            }
        });
        if (shouldUpdate) {
            handleDynamicContent();
        }
    });

    const bodyTarget = document.body;

    function applyCustomStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .post__username {
                cursor: pointer; /* Change cursor to indicate interactivity */
            }
            .user-overlay {
                /* Add any additional styles for user-overlay here */
            }
        `;

        document.head.appendChild(style);
    }

    // Manage event listeners


    function initImageNavigation() {
        if (!enableFileNavigation) return;

        updateImageList();
        initTouchNavigation();
        initKeyboardNavigation();
        injectCustomCSS();
    }

    // Function to set up event listeners for tracking user posts
    const setupTrackUserPosts = () => {
        document.body.addEventListener('click', handleDocumentClick, true);
        // Any other setup required by the Track User Posts feature
    };

    // Function to remove event listeners for tracking user posts
    const teardownTrackUserPosts = () => {
        document.body.removeEventListener('click', handleDocumentClick, true);
        // Any other teardown required by the Track User Posts feature
    };



    window.addEventListener('focus', () => {
        // Run necessary functions or re-initialize the script
        setup();
    });


    const addListeners = () => {
        window.addEventListener('urlchange', handleDynamicContent);
        window.addEventListener('hashchange', handleDynamicContent);
        window.addEventListener('load', handleDynamicContent);
    };

    const removeListeners = () => {
        window.removeEventListener('urlchange', handleDynamicContent);
        window.removeEventListener('hashchange', handleDynamicContent);
        window.removeEventListener('load', handleDynamicContent);
    };

    // Event listener setup for middle click
    const addMiddleClickListener = () => {
        const contentContainer = document.querySelector('body');
        if (contentContainer) {
            contentContainer.addEventListener('mousedown', handleMiddleClick, false);
        }
    }

    const removeMiddleClickListener = () => {
        const contentContainer = document.querySelector('body');
        if (contentContainer) {
            contentContainer.removeEventListener('mousedown', handleMiddleClick, false);
        }
    }

    // Setup and teardown functions
 const setup = () => {
        if (enableMiddleClickNewTab) {
            addEventListener(document.body, 'mousedown', handleMiddleClick, false);
        }
        if (enableTrackUserPosts) {
            addEventListener(document.body, 'click', handleDocumentClick, true);
            applyCustomStyles();
        }
        updateTimestamps();
        insertPostIDs();
        observer.observe(bodyTarget, observerConfig);
        initImageNavigation();
    };

    const teardown = () => {
        removeAllEventListeners();
        observer.disconnect();
    };

    // Reinitialize script on window focus
    window.addEventListener('focus', () => {
        teardown();
        setup();
    });

    setup();

})();
