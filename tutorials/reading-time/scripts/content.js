async function getPageContent() {
    const documentClone = document.cloneNode(true);
    const article = new Readability(documentClone,{}).parse();
    return article;
}

async function fetchBackendData(article) {
    const url = 'https://lyknvzu9y8.execute-api.eu-west-3.amazonaws.com/new/GenerateText';
    console.log(url);
    try {
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ title: article.title, textContent: article.textContent })
        };

        const response = await fetch(url, requestOptions);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response;
        return data.json();
    } catch (error) {
        console.error('Error fetching backend data:', error);
        throw error;
    }
}

(async () => {
    const article = await getPageContent();
    const text = article.textContent;

    const contentWords = text.split(' ').length;
    const readingTime = Math.ceil((contentWords / 229) * 2) / 2;

    const badge = document.createElement("p");

    // Use the same styling as the publish information in an article's header
    badge.classList.add("text-black", "type--caption");
    badge.textContent = `⏱️ ${readingTime} min read`;

    // Support for API reference docs
    const heading = //document.querySelector('[id*="title"]') || document.querySelector('[class*="title"]') || 
    document.querySelector("h1") ||document.querySelector("h2");
    console.log(heading);
    heading.insertAdjacentElement("afterend", badge);

    // Fetch data from the backend with the article object
    try {
        const backendData = await fetchBackendData(article);
        console.log("Backend data:", backendData.response);

        const summary = document.createElement("p");

    // Use the same styling as the publish information in an article's header
    badge.classList.add("text-black", "type--caption");
    summary.style.fontStyle = "italic";
    summary.textContent = backendData.response;

        badge.insertAdjacentElement("afterend", summary);
    } catch (error) {
        console.error("Error fetching backend data:", error);
    }
})();