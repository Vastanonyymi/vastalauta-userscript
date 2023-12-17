// ==UserScript==
// @name         Vastalauta Post IDs
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Show post IDs next to the timestamps on posts
// @author       Anonymous
// @source       https://github.com/Vastanonyymi/vastalauta-userscript/
// @match        https://vastalauta.org/*
// @grant        none
// ==/UserScript==

//Korjattu: urlit joiden perässä oli numero esim /b/123#1234 aiheutti scriptin toimimattomuuden
//Korjattu: kataloginäkymään id:t myös

(function() {
    'use strict';

    function insertPostIDs() {
        const posts = document.querySelectorAll('.post, .js-post'); // Select both normal and catalog posts

        posts.forEach(post => {
            const postId = post.getAttribute('data-id');
            if (postId) {
                // Check if post ID span is already there to avoid duplicates
                if (post.querySelector('.post-id')) return;

                const idSpan = document.createElement('span');
                idSpan.textContent = postId;
                idSpan.className = 'post-id';
                idSpan.style.marginRight = 'auto'; // Add space between ID and the menu button for catalog view
                //idSpan.style.position = 'static';
                idSpan.style.paddingTop = '6px';
                // Determine where to insert the ID span
                const menuButton = post.querySelector('.post__menu-button');
                const timestamp = post.querySelector('.post__timestamp');
                menuButton.style.position = 'static';
                if (menuButton) { // Catalog view
                    menuButton.parentNode.insertBefore(idSpan, menuButton);
                } else if (timestamp) { // Normal view
                    timestamp.insertAdjacentElement('afterend', idSpan);
                }
            }
        });
    }

    function handleURLChange() {
        observer.disconnect(); // Disconnect observer during updates to avoid infinite loops
        setTimeout(() => {
            insertPostIDs();
            observer.observe(bodyTarget, observerConfig); // Reconnect observer after updates
        }, 500);
    }

    const observerConfig = { childList: true, subtree: true };
    const observer = new MutationObserver(mutations => {
        let shouldUpdate = false;
        mutations.forEach(mutation => {
            if (mutation.type === 'childList' && mutation.addedNodes.length) {
                mutation.addedNodes.forEach(node => {
                    if (!node.querySelector('.post-id')) {
                        shouldUpdate = true;
                    }
                });
            }
        });
        if (shouldUpdate) {
            handleURLChange();
        }
    });

    const bodyTarget = document.body;

    if ('onurlchange' in window) {
        window.addEventListener('urlchange', handleURLChange);
    } else {
        window.addEventListener('hashchange', handleURLChange);
        window.addEventListener('load', handleURLChange);
    }

    // Initial execution and observer setup
    insertPostIDs();
    observer.observe(bodyTarget, observerConfig);
})();
