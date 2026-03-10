/**
 * tracker.js
 * Handles: visitor analytics (IP geolocation + Google Analytics backend)
 * Sends visit data to the render.com tracking server.
 */

async function trackVisit() {
    try {
        // 1. Fetch geolocation data
        let locationData = {};
        try {
            const res = await fetch('https://ipapi.co/json/');
            locationData = await res.json();
        } catch (e) {
            console.warn('Could not fetch location data:', e);
        }

        // 2. Build the visit payload
        const visitData = {
            ip: locationData.ip || '',
            country: locationData.country_name || '',
            city: locationData.city || '',
            userAgent: navigator.userAgent,
            page: window.location.pathname
        };

        // 3. POST to the tracking server
        await fetch('https://zahershaat-github-io.onrender.com/track-visit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(visitData)
        });

    } catch (error) {
        console.error('Tracking error:', error);
    }
}

// Run on page load
window.addEventListener('load', trackVisit);
