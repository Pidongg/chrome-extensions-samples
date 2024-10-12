async function getPageContent() {
    const documentClone = document.cloneNode(true);
    const article = new Readability(documentClone, {}).parse();
    return article;
}

function getStorageValue(key) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(key, function(result) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(result[key]);
            }
        });
    });
}

async function getValue(s) {
    try {
        const longer = await getStorageValue(s);
        return longer != null ? longer : false;
    } catch (error) {
        console.error('Error retrieving value from storage:', error);
        return false;
    }
}

async function fetchBackendData(article) {
    const url = 'https://lyknvzu9y8.execute-api.eu-west-3.amazonaws.com/new/GenerateText';
    console.log(url);
    try {
        let longer = await getValue('longer');
        let bullet = await getValue('bullet');
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ title: article.title, textContent: article.textContent, longer: longer, bullet: bullet })
        };
        const response = await fetch(url, requestOptions);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching backend data:', error);
        throw error;
    }
}

(async () => {
    if (window.location.href.startsWith("https://www.google.com/search?q=")) {
        return; // Exit the script if the condition is met
    }
    chrome.storage.local.get('active', async function(result) {
        let x = result.active;
        if (x == null || x) {
            const article = await getPageContent();
            const text = article.textContent;

            const contentWords = text.split(' ').length;
            const readingTime = Math.ceil((contentWords / 229) * 2) / 2;

            // Support for API reference docs
            const heading = document.querySelector("h1") || document.querySelector("h2");
            const container = document.createElement("div");
            container.classList.add("container");
            container.style.display = "flex";
            container.style.flexDirection = "column";
            container.style.alignItems = "flex-start"; // Adjust alignment as needed

            // Fetch data from the backend with the article object
            try {
                const backendData = await fetchBackendData(article);
                console.log("Backend data:", backendData.response);

                const summary = document.createElement("pre");

                // Use the same styling as the publish information in an article's header
                summary.classList.add("text-black", "type--caption");
                summary.style.fontSize = "16px";
                summary.style.fontStyle = "italic";
                summary.style.whiteSpace = "pre-wrap"; // Ensure text wraps like in a <p> tag
                summary.style.wordWrap = "break-word"; // Ensure long words break to the next line
                summary.style.width = "100%"; // Ensure it takes the full width
                summary.innerHTML = backendData.response.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>'); // Use innerHTML instead of textContent
                summary.classList.add("summary-text");

                // Get the color of the heading and apply it to the summary text and badge
                const headingColor = window.getComputedStyle(heading, null).getPropertyValue('color');
                summary.style.color = headingColor;

                // Create the reading time badge
                const badge = document.createElement("p");
                badge.classList.add("text-black", "type--caption");
                badge.textContent = `⏱️ ${readingTime} min read`;
                badge.style.color = headingColor;

                // Create the copy button with an emoji
                const copyButton = document.createElement("button");
                copyButton.innerHTML = '📋';
                copyButton.classList.add("copy-button");
                copyButton.title = "Copy"; // Tooltip text
                copyButton.style.outline = "none"; // Remove the default focus style
                copyButton.style.border = "none"; // Remove the default button border
                copyButton.style.padding = "0px"; // Smaller button area
                copyButton.style.marginRight = "30px"; // Add some space to the right

                copyButton.addEventListener("click", async () => {
                    await navigator.clipboard.writeText(summary.textContent);
                    showCopyNotification();
                });

                // Create a container for the summary, badge, and copy button
                const summaryCopyContainer = document.createElement("div");
                summaryCopyContainer.classList.add("summary-copy-container");
                summaryCopyContainer.style.display = "flex";
                summaryCopyContainer.style.flexDirection = "column";
                summaryCopyContainer.style.alignItems = "flex-start"; // Align items vertically
                summaryCopyContainer.style.width = "100%";
                summaryCopyContainer.style.marginTop = "0px"; // Ensure no space between badge and summaryCopyContainer
                summaryCopyContainer.appendChild(badge);
                summaryCopyContainer.appendChild(copyButton);
                summaryCopyContainer.appendChild(summary);

                // Insert the container before the heading
                heading.parentNode.insertBefore(container, heading);

                // Move the heading and summary-copy container into the container
                container.appendChild(heading);
                container.appendChild(summaryCopyContainer);

                // Add CSS styles directly within the JavaScript
                const style = document.createElement('style');
                style.textContent = `
                    .summary-text {
                        display: inline; /* Ensure the summary text is inline */
                        color: inherit; /* Inherit color from parent */
                        width: 100%; /* Ensure it takes the full width */
                    }
                    .copy-button {
                        visibility: hidden;
                        background-color: transparent;
                        transition: background-color 0.3s ease;
                        white-space: nowrap; /* Ensure the button wraps the text content */
                        align-self: flex-end; /* Align to the right */
                    }
                    .container:hover .copy-button {
                        visibility: visible;
                    }
                    .copy-button.copied {
                        background-color: #d3d3d3; /* Lighter grey color */
                    }
                    .summary-copy-container {
                        display: flex;
                        flex-direction: column;
                        align-items: flex-start; /* Align summary text to the left */
                    }
                `;
                document.head.appendChild(style);

                // Function to show the copy notification
                function showCopyNotification() {
                    copyButton.classList.add('copied');
                    setTimeout(() => {
                        copyButton.classList.remove('copied');
                    }, 1000); // Change color for 1 second
                }
            } catch (error) {
                console.error("Error fetching backend data:", error);
            }
        }
    });
})();