// ==UserScript==
// @name         Vastalauta Finnish timestamps
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Convert timestamps to Finnish format on Vastalauta
// @author       Anonymous
// @source       https://github.com/Vastanonyymi/vastalauta-userscript/
// @match        https://vastalauta.org/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

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
        const timestamps = document.querySelectorAll('.thread-card__bottom-timestamp, .post__timestamp');
        timestamps.forEach(el => {
            const newTimestamp = convertTimestampFormat(el.textContent);
            if (newTimestamp) {
                el.textContent = newTimestamp;
            }
        });
    }

    function handleDynamicContent() {
        observer.disconnect();
        setTimeout(() => {
            updateTimestamps();
            observer.observe(bodyTarget, observerConfig);
        }, 500);
    }

    const observerConfig = { childList: true, subtree: true };
    const observer = new MutationObserver(mutations => {
        let shouldUpdate = false;
        mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
                shouldUpdate = Array.from(mutation.addedNodes).some(node =>
                    node.nodeType === Node.ELEMENT_NODE && node.querySelector('.thread-card__bottom-timestamp, .post__timestamp'));
            }
        });
        if (shouldUpdate) {
            handleDynamicContent();
        }
    });

    const bodyTarget = document.body;

    // Manage event listeners
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

    // Setup and teardown functions
    const setup = () => {
        updateTimestamps();
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
    window.vastalautaTimestampTeardown = teardown;
})();