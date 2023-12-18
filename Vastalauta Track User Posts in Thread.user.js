// ==UserScript==
// @name         Vastalauta Track User Posts in Thread
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Track and navigate through a specific user's posts in a thread
// @author       Anonymous
// @source       https://github.com/Vastanonyymi/vastalauta-userscript/
// @match        https://vastalauta.org/*
// @match        https://vastalauta.org/*/*
// @grant        none
// @run-at document-idle
// ==/UserScript==


//Tän on tarkotus olla kuin ylilaudan se että kun klikkaat ID:tä, voit hyppiä tietyn tyypin viesteissä edestakas. Tässä vaan pitää klikata nimeä ja ainakin toistaseks grafiikat unohtu
//uus päivitys, paljon parempaa koodia nytten pitäis toimia enemmän kuin 30% ajasta ja paljon tehokkaammin.

(function() {
    'use strict';

    let userOverlay;
    let currentUserPosts;
    let currentIndex;
    let infoText; // To display post count

    function createUserOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'userOverlay';
        overlay.style.position = 'absolute';
        overlay.style.display = 'none';
        overlay.style.zIndex = '10';
        overlay.style.backgroundColor = 'white'; // Set a background color so text is readable
        overlay.style.border = '1px solid black'; // Add border for visibility
        overlay.style.padding = '5px'; // Add some padding around the buttons and text

        infoText = document.createElement('div');
        infoText.id = 'userInfoText';
        infoText.style.color = 'black';
        overlay.appendChild(infoText);

        const prevButton = document.createElement('button');
        prevButton.innerText = 'Previous';
        prevButton.id = 'userOverlayPrevButton';
        overlay.appendChild(prevButton);

        const nextButton = document.createElement('button');
        nextButton.innerText = 'Next';
        nextButton.id = 'userOverlayNextButton';
        overlay.appendChild(nextButton);

        const closeButton = document.createElement('button');
        closeButton.innerText = 'Close';
        closeButton.onclick = function() {
            userOverlay.style.display = 'none';
        };
        overlay.appendChild(closeButton);

        return overlay;
    }

    userOverlay = createUserOverlay();
    document.body.appendChild(userOverlay);

    function positionOverlay(postElement) {
        const rect = postElement.getBoundingClientRect();
        userOverlay.style.top = `${window.scrollY + rect.top}px`;
        userOverlay.style.left = `${window.scrollX + rect.left - userOverlay.offsetWidth - 5}px`; // Adjust '5' to increase spacing if needed
    }

    function showUserOverlay(username, postElement) {
        currentUserPosts = Array.from(document.querySelectorAll(`[data-name="${username}"]`));
        currentIndex = currentUserPosts.findIndex(post => post.contains(postElement));

        infoText.textContent = `Post ${currentIndex + 1} of ${currentUserPosts.length}`;

        const prevButton = document.getElementById('userOverlayPrevButton');
        const nextButton = document.getElementById('userOverlayNextButton');

        prevButton.onclick = function() {
            if (currentIndex > 0) {
                currentIndex--;
            } else {
                currentIndex = currentUserPosts.length - 1; // Wrap around to the last post
            }
            const newPostElement = currentUserPosts[currentIndex];
            newPostElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            positionOverlay(newPostElement);
            infoText.textContent = `Post ${currentIndex + 1} of ${currentUserPosts.length}`;
        };

        nextButton.onclick = function() {
            if (currentIndex < currentUserPosts.length - 1) {
                currentIndex++;
            } else {
                currentIndex = 0; // Wrap around to the first post
            }
            const newPostElement = currentUserPosts[currentIndex];
            newPostElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            positionOverlay(newPostElement);
            infoText.textContent = `Post ${currentIndex + 1} of ${currentUserPosts.length}`;
        };

        userOverlay.style.display = 'block';
        positionOverlay(postElement);
    }


    function handleDocumentClick(event) {
        const username = event.target.closest('.post__username');
        if (username) {
            event.preventDefault(); // Prevents default action (e.g., opening a reply box)
            event.stopPropagation();
            showUserOverlay(username.textContent, username.closest('.post'));
        }
    }

    function setupEventDelegation() {
        // Attach the event listener in the capturing phase
        document.body.addEventListener('click', handleDocumentClick, true);
    }

    function applyCustomStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .post__username {
                cursor: pointer; /* Change cursor to indicate interactivity */
            }
        `;
        document.head.appendChild(style);
    }
    function setup() {
        setupEventDelegation();
        applyCustomStyles();
    }

    function checkAndInitialize() {
        if (!userOverlay) {
            setup();
        }
    }

    document.addEventListener('DOMContentLoaded', setup);

    // MutationObserver to monitor dynamically loaded content
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.addedNodes.length) {
                checkAndInitialize();
            }
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Fail-safe initialization after a delay
    //setTimeout(checkAndInitialize, 5000); // Adjust the delay as needed
})();
