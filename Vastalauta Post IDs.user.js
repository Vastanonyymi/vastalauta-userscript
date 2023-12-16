// ==UserScript==
// @name         Vastalauta Post IDs
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Show post IDs next to the timestamps on posts
// @author       Anonymous
// @match        https://vastalauta.org/*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function insertPostIDs() {
        const posts = document.querySelectorAll('.post');

        posts.forEach(post => {
            const postId = post.getAttribute('data-id');
            const timestamp = post.querySelector('.post__timestamp');

            // Check if the ID is already displayed to avoid duplicates
            if (!timestamp.nextSibling || timestamp.nextSibling.className !== 'post-id') {
                const idSpan = document.createElement('span');
                idSpan.textContent = `${postId}`;
                idSpan.className = 'post-id'; // Add a class for potential styling via CSS
                idSpan.style.cssText = `
                    padding-top: 6px;
                    margin-left: 0px; // Adjust spacing as needed
                    font-size: inherit; // Match font size with the timestamp

                `;

                timestamp.insertAdjacentElement('afterend', idSpan);
            }
        });
    }

    // Run the function when the page loads and also when new posts are dynamically added if needed
    window.addEventListener('load', insertPostIDs);
})();