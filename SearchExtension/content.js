let currentPage = 0; // Track the current page
let totalPages = 0; // Total number of pages (websites) to display
let resultsData = []; // Store the search results
let isDarkMode = false; // Track the current mode

// Function to create and display the sidebar
function createSidebar(searchQuery) {
    let sidebar = document.createElement('div');
    sidebar.id = 'search-sidebar';
    sidebar.style.position = 'fixed';
    sidebar.style.top = '0';
    sidebar.style.right = '0';
    sidebar.style.width = '350px';
    sidebar.style.height = '100%';
    sidebar.style.backgroundColor = '#ffffff';
    sidebar.style.borderLeft = '1px solid #ddd';
    sidebar.style.boxShadow = '-2px 0 5px rgba(0,0,0,0.1)';
    sidebar.style.zIndex = '1000';
    sidebar.style.padding = '10px';
    sidebar.style.display = 'flex';
    sidebar.style.flexDirection = 'column';
    sidebar.style.overflow = 'hidden'; // Prevent content from overflowing

    // Resizing handle
    let resizeHandle = document.createElement('div');
    resizeHandle.style.position = 'absolute';
    resizeHandle.style.top = '0';
    resizeHandle.style.left = '-5px';
    resizeHandle.style.width = '10px';
    resizeHandle.style.height = '100%';
    resizeHandle.style.cursor = 'ew-resize';
    resizeHandle.style.zIndex = '1001';
    sidebar.appendChild(resizeHandle);

    // Add resizing functionality
    let isResizing = false;

    resizeHandle.addEventListener('mousedown', function (e) {
        isResizing = true;
        document.addEventListener('mousemove', resizeSidebar);
        document.addEventListener('mouseup', stopResizing);
    });

    function resizeSidebar(e) {
        if (!isResizing) return;
        const newWidth = window.innerWidth - e.clientX;
        sidebar.style.width = `${newWidth}px`;
    }

    function stopResizing() {
        isResizing = false;
        document.removeEventListener('mousemove', resizeSidebar);
        document.removeEventListener('mouseup', stopResizing);
    }

    // Create a container for the toggle button
    let toggleContainer = document.createElement('div');
    toggleContainer.style.display = 'flex';
    toggleContainer.style.justifyContent = 'flex-start';
    toggleContainer.style.marginBottom = '10px';

    // Create the toggle button for light/dark mode
    let toggleButton = document.createElement('button');
    toggleButton.textContent = 'Dark Mode';
    toggleButton.style.padding = '5px 10px';
    toggleButton.style.marginRight = '10px';
    toggleButton.onclick = toggleMode; // Attach the toggle function

    toggleContainer.appendChild(toggleButton);

    // Create a header container
    let headerContainer = document.createElement('div');
    headerContainer.style.display = 'flex';
    headerContainer.style.justifyContent = 'space-between';
    headerContainer.style.alignItems = 'center';
    headerContainer.style.marginBottom = '10px';
    headerContainer.style.borderBottom = '1px solid #ddd';
    headerContainer.style.paddingBottom = '10px';

    // Create a header to display the search query
    let header = document.createElement('div');
    header.style.fontSize = '25px';
    header.style.fontWeight = 'bold';
    header.style.textAlign = 'center';
    header.style.flex = '1';
    header.textContent = searchQuery;

    // Close button to remove the sidebar
    let closeButton = document.createElement('div');
    closeButton.innerHTML = '&times;';
    closeButton.style.fontSize = '25px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.padding = '2px 8px';
    closeButton.style.color = '#000';
    closeButton.style.borderRadius = '50%';
    closeButton.style.transition = 'background-color 0.2s ease';
    closeButton.onmouseover = () => (
        (closeButton.style.backgroundColor = 'red'),
        (closeButton.style.color = '#fff')
    );
    closeButton.onmouseout = () => (
        (closeButton.style.backgroundColor = 'transparent'),
        (closeButton.style.color = '#000')
    );
    closeButton.onclick = () => document.body.removeChild(sidebar);

    headerContainer.appendChild(toggleContainer); // Add the toggle container
    headerContainer.appendChild(header);
    headerContainer.appendChild(closeButton);
    sidebar.appendChild(headerContainer);

    // Add the tabs container here
    let tabsContainer = document.createElement('div');
    tabsContainer.style.display = 'flex';
    tabsContainer.style.borderBottom = '1px solid #ddd';

    // Create the PDF tab
    let pdfTab = document.createElement('div');
    pdfTab.textContent = 'PDF';
    pdfTab.style.padding = '10px';
    pdfTab.style.cursor = 'pointer';
    pdfTab.style.flex = '1';
    pdfTab.style.textAlign = 'center';
    pdfTab.style.borderRight = '1px solid #ddd';
    pdfTab.style.backgroundColor = '#f0f0f0'; // Active tab background
    pdfTab.onclick = () => switchTab('pdf');

    // Create the Summary tab
    let summaryTab = document.createElement('div');
    summaryTab.textContent = 'Summary';
    summaryTab.style.padding = '10px';
    summaryTab.style.cursor = 'pointer';
    summaryTab.style.flex = '1';
    summaryTab.style.textAlign = 'center';
    summaryTab.onclick = () => switchTab('summary');

    tabsContainer.appendChild(pdfTab);
    tabsContainer.appendChild(summaryTab);
    sidebar.appendChild(tabsContainer);

    // Container to display the search results
    let resultsContainer = document.createElement('div');
    resultsContainer.id = 'results';
    resultsContainer.style.flex = '1'; // Allow it to grow and fill available space
    resultsContainer.style.display = 'flex';
    resultsContainer.style.flexDirection = 'column';
    resultsContainer.style.overflow = 'hidden'; // Prevent content from overflowing
    sidebar.appendChild(resultsContainer);

    // Navigation buttons container
    let navContainer = document.createElement('div');
    navContainer.style.display = 'flex';
    navContainer.style.justifyContent = 'space-between';
    navContainer.style.marginTop = '10px';
    sidebar.appendChild(navContainer);

    // Left button
    let leftButton = document.createElement('button');
    leftButton.id = 'left-button';
    leftButton.textContent = '←';
    leftButton.style.padding = '5px 10px';
    leftButton.style.cursor = 'pointer';
    leftButton.onclick = () => changePage(-1);

    // Add hover effect for left button
    leftButton.addEventListener('mouseover', function() {
        if (!leftButton.disabled) {
            leftButton.style.backgroundColor = 'green';
            leftButton.style.color = 'white';
        }
    });
    leftButton.addEventListener('mouseout', function() {
        if (!leftButton.disabled) {
            leftButton.style.backgroundColor = '';
            leftButton.style.color = '';
        }
    });

    navContainer.appendChild(leftButton);

    // Right button
    let rightButton = document.createElement('button');
    rightButton.id = 'right-button';
    rightButton.textContent = '→';
    rightButton.style.padding = '5px 10px';
    rightButton.style.cursor = 'pointer';
    rightButton.onclick = () => changePage(1);

    // Add hover effect for right button
    rightButton.addEventListener('mouseover', function() {
        if (!rightButton.disabled) {
            rightButton.style.backgroundColor = 'red';
            rightButton.style.color = 'white';
        }
    });
    rightButton.addEventListener('mouseout', function() {
        if (!rightButton.disabled) {
            rightButton.style.backgroundColor = '';
            rightButton.style.color = '';
        }
    });

    navContainer.appendChild(rightButton);

    // Matching percentage display
    let matchBox = document.createElement('div');
    matchBox.id = 'match-box';
    matchBox.style.textAlign = 'center';
    matchBox.style.marginTop = '15px';
    matchBox.style.padding = '8px 15px';
    matchBox.style.border = '1px solid #ddd';
    matchBox.style.borderRadius = '8px';
    matchBox.style.fontSize = '14px';
    matchBox.style.fontWeight = 'bold';
    matchBox.style.position = 'absolute';
    matchBox.style.bottom = '10px'; // Position at the bottom of the sidebar
    matchBox.style.left = '50%';
    matchBox.style.transform = 'translateX(-50%)';
    sidebar.appendChild(matchBox);

    document.body.appendChild(sidebar);

    updateButtonStates(); // Initialize button states
}

// Function to toggle between light and dark mode
function toggleMode() {
    isDarkMode = !isDarkMode;
    const sidebar = document.getElementById('search-sidebar');
    if (isDarkMode) {
        sidebar.style.backgroundColor = '#333';
        sidebar.style.color = '#fff';
        sidebar.querySelectorAll('button').forEach(button => {
            button.style.backgroundColor = '#444';
            button.style.color = '#fff';
        });
        this.textContent = 'Light Mode';
    } else {
        sidebar.style.backgroundColor = '#ffffff';
        sidebar.style.color = '#000';
        sidebar.querySelectorAll('button').forEach(button => {
            button.style.backgroundColor = '#ffffff';
            button.style.color = '#000';
        });
        this.textContent = 'Dark Mode';
    }
}

// Function to display results in the sidebar
function displayResults(query, results) {
    resultsData = results; // Store results globally
    totalPages = results.length; // Set total pages
    currentPage = 0; // Reset to the first page
    updatePage(); // Display the first result
}

// Function to update the page content based on the current page
function updatePage() {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = ''; // Clear previous results

    if (resultsData.length === 0) return;

    const result = resultsData[currentPage]; // Get current result

    // Create container for the link and content
    const contentDiv = document.createElement('div');
    contentDiv.style.flex = '1'; // Allow it to grow and fill available space
    contentDiv.style.display = 'flex';
    contentDiv.style.flexDirection = 'column';
    contentDiv.style.overflow = 'hidden';

    // Create header link
    const headerLink = document.createElement('h4');
    const link = document.createElement('a');
    link.href = result.url;
    link.target = '_blank';
    link.textContent = result.url;
    headerLink.appendChild(link);

    // Tabs content
    const tabsContent = document.createElement('div');
    tabsContent.id = 'tabs-content';
    tabsContent.style.flex = '1';
    tabsContent.style.overflow = 'auto';

    // PDF content div
    const pdfContent = document.createElement('div');
    pdfContent.id = 'pdf-content';
    pdfContent.style.display = 'block'; // Show by default
    pdfContent.style.height = '100%';

    // Summary content div
    const summaryContent = document.createElement('div');
    summaryContent.id = 'summary-content';
    summaryContent.style.display = 'none'; // Hide by default
    summaryContent.style.height = '100%';
    summaryContent.style.padding = '10px';
    summaryContent.style.overflowY = 'auto';

    // Create iframe for PDF
    const iframe = document.createElement('iframe');
    iframe.src = `http://localhost:5000/download-pdf/${result.pdfPath}`;
    iframe.style.flex = '1'; // Allow iframe to fill available space
    iframe.style.width = '100%';
    iframe.style.border = 'none';
    iframe.style.height = '100%';

    // Call the function to handle PDF clicks
    handlePDFClicks(iframe, result.url, result.highlightedText);

    pdfContent.appendChild(iframe);

    // Populate the summary content
    const summaryText = document.createElement('p');
    summaryText.textContent = result.summary || 'No summary available.';
    summaryContent.appendChild(summaryText);

    tabsContent.appendChild(pdfContent);
    tabsContent.appendChild(summaryContent);

    // Append elements
    contentDiv.appendChild(headerLink);
    contentDiv.appendChild(tabsContent);
    resultsContainer.appendChild(contentDiv);

    // Update match percentage in the match box
    const matchBox = document.getElementById('match-box');
    matchBox.textContent = `Match: ${result.matchPercentage}%`;

    // Change matchBox color based on matchPercentage
    if (result.matchPercentage < 60) {
        matchBox.style.backgroundColor = 'red';
        matchBox.style.color = 'white';
    } else if (result.matchPercentage >= 60 && result.matchPercentage <= 80) {
        matchBox.style.backgroundColor = 'orange';
        matchBox.style.color = 'white';
    } else if (result.matchPercentage > 80) {
        matchBox.style.backgroundColor = 'green';
        matchBox.style.color = 'white';
    }

    updateButtonStates(); // Update button states after updating the content
}

// Function to handle tab switching
function switchTab(tabName) {
    const pdfTab = document.querySelector('#search-sidebar > div:nth-child(3) > div:nth-child(1)');
    const summaryTab = document.querySelector('#search-sidebar > div:nth-child(3) > div:nth-child(2)');
    const pdfContent = document.getElementById('pdf-content');
    const summaryContent = document.getElementById('summary-content');

    if (tabName === 'pdf') {
        pdfContent.style.display = 'block';
        summaryContent.style.display = 'none';
        pdfTab.style.backgroundColor = '#f0f0f0';
        summaryTab.style.backgroundColor = '#ffffff';
    } else if (tabName === 'summary') {
        pdfContent.style.display = 'none';
        summaryContent.style.display = 'block';
        pdfTab.style.backgroundColor = '#ffffff';
        summaryTab.style.backgroundColor = '#f0f0f0';
    }
}

// Function to handle page change
function changePage(direction) {
    currentPage += direction; // Change page based on direction
    updatePage(); // Update page content
}

// Function to update button states based on the current page
function updateButtonStates() {
    const leftButton = document.getElementById('left-button');
    const rightButton = document.getElementById('right-button');

    if (currentPage === 0) {
        leftButton.disabled = true; // Disable left button on the first page
        leftButton.style.backgroundColor = 'lightgrey';
        leftButton.style.color = 'white';
        leftButton.style.cursor = 'not-allowed';
    } else {
        leftButton.disabled = false;
        leftButton.style.backgroundColor = ''; // Reset background color
        leftButton.style.color = '';
        leftButton.style.cursor = 'pointer';
    }

    if (currentPage === totalPages - 1) {
        rightButton.disabled = true; // Disable right button on the last page
        rightButton.style.backgroundColor = 'lightgrey';
        rightButton.style.color = 'white';
        rightButton.style.cursor = 'not-allowed';
    } else {
        rightButton.disabled = false;
        rightButton.style.backgroundColor = ''; // Reset background color
        rightButton.style.color = '';
        rightButton.style.cursor = 'pointer';
    }
}

// Function to handle PDF clicks
function handlePDFClicks(iframe, url, highlightText) {
    iframe.onload = () => {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        iframeDoc.addEventListener('click', function (e) {
            if (e.target.tagName === 'A' && e.target.href.includes(highlightText)) {
                // If the user clicks on the highlighted text, open the original website at that point
                window.open(url + `#highlight=${highlightText}`, '_blank');
            }
        });
    };
}

// Listen for messages from background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'displayResults') {
        if (!document.getElementById('search-sidebar')) {
            createSidebar(message.query); // Create sidebar if it doesn't exist
        }
        displayResults(message.query, message.results); // Display results in the sidebar
    }
});
