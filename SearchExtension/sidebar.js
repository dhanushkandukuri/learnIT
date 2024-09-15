// Listen for messages from background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "displayResults") {
        displayResults(message.results);
    }
});

// Function to display results in the sidebar
function displayResults(results) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = ""; // Clear previous results

    results.forEach(result => {
        const resultDiv = document.createElement('div');
        resultDiv.className = 'result';
        resultDiv.innerHTML = `
            <h4><a href="${result.url}" target="_blank">${result.url}</a></h4>
            <p class="match">Match: ${result.matchPercentage}%</p>
        `;
        resultsContainer.appendChild(resultDiv);
    });
}