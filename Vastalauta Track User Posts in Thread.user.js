// ==UserScript==
// @name         Vastalauta Track User Posts in Thread
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Track and navigate through a specific user's posts in a thread
// @author       Anonymous
// @source       https://github.com/Vastanonyymi/vastalauta-userscript/
// @match        https://vastalauta.org/*/*
// @grant        none
// ==/UserScript==


//Tän on tarkotus olla kuin ylilaudan se että kun klikkaat ID:tä, voit hyppiä tietyn tyypin viesteissä edestakas. Tässä vaan pitää klikata nimeä ja ainakin toistaseks grafiikat unohtu


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

        infoText.textContent = `Post ${currentIndex + 1} of ${currentUserPosts.length}`; // Display post count

        const prevButton = document.getElementById('userOverlayPrevButton');
        const nextButton = document.getElementById('userOverlayNextButton');

        prevButton.onclick = function() {
            if (currentIndex > 0) {
                currentIndex--;
                const newPostElement = currentUserPosts[currentIndex];
                newPostElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                positionOverlay(newPostElement);
                infoText.textContent = `Post ${currentIndex + 1} of ${currentUserPosts.length}`; // Update post count
            }
        };

        nextButton.onclick = function() {
            if (currentIndex < currentUserPosts.length - 1) {
                currentIndex++;
                const newPostElement = currentUserPosts[currentIndex];
                newPostElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                positionOverlay(newPostElement);
                infoText.textContent = `Post ${currentIndex + 1} of ${currentUserPosts.length}`; // Update post count
            }
        };

        userOverlay.style.display = 'block';
        positionOverlay(postElement); // Position overlay when shown
    }

    function attachEventListeners() {
        const usernames = document.querySelectorAll('.post__username');
        usernames.forEach(username => {
            username.style.cursor = 'pointer';
            username.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                showUserOverlay(username.textContent, username.closest('.post'));
            });
        });
    }

    window.addEventListener('load', attachEventListeners);
})();
