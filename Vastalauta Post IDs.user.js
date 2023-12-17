// ==UserScript==
// @name         Vastalauta Post IDs
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Show post IDs next to the timestamps on posts
// @author       Anonymous
// @source       https://github.com/Vastanonyymi/vastalauta-userscript/
// @match        https://vastalauta.org/*
// @grant        none
// ==/UserScript==

//Korjattu: urlit joiden perässä oli numero esim /b/123#1234 aiheutti scriptin toimimattomuuden
//Korjattu: kataloginäkymään id:t myös
//Korjattu: memory leak

(function() {
    'use strict';

    function insertPostIDs() {
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

    function handleURLChange() {
        observer.disconnect();
        setTimeout(() => {
            insertPostIDs();
            observer.observe(bodyTarget, observerConfig);
        }, 500);
    }

    const observerConfig = { childList: true, subtree: true };
    const observer = new MutationObserver(mutations => {
        let shouldUpdate = false;
        mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
                shouldUpdate = Array.from(mutation.addedNodes).some(node => 
                    node.nodeType === Node.ELEMENT_NODE && !node.querySelector('.post-id'));
            }
        });
        if (shouldUpdate) {
            handleURLChange();
        }
    });

    const bodyTarget = document.body;

    // Manage event listeners
    const addListeners = () => {
        window.addEventListener('urlchange', handleURLChange);
        window.addEventListener('hashchange', handleURLChange);
        window.addEventListener('load', handleURLChange);
    };

    const removeListeners = () => {
        window.removeEventListener('urlchange', handleURLChange);
        window.removeEventListener('hashchange', handleURLChange);
        window.removeEventListener('load', handleURLChange);
    };

    // Setup and teardown functions
    const setup = () => {
        insertPostIDs();
        observer.observe(bodyTarget, observerConfig);
        addListeners();
    };

    const teardown = () => {
        observer.disconnect();
        removeListeners();
    };

    // Initial execution
    setup();

    // Provide a way to teardown if needed
    window.vastalautaTeardown = teardown;
})();
