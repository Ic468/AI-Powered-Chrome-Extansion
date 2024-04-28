// When the extension is installed or updated, this listener is triggered
chrome.runtime.onInstalled.addListener(() => {
    const context = "selection";
    const menuItems = [
        {id: "improveEnglish", title: "Improve English"},
        {id: "improveEnglishCreative", title: "Improve English - Creative"},
        {id: "addCommentsToCode", title: "Add Comments to Code"},
        {id: "summarizeSingleParagraph", title: "Summarize to a Single Paragraph"},
        {id: "aiQuiz", title: "AI Quiz"}
    ];

    // Loop through each menu item and create it in the context menu
    menuItems.forEach(item => {
        chrome.contextMenus.create({
            id: item.id,
            title: item.title,
            contexts: [context]
        });
    });
});

// Listener for when a context menu item is clicked
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (!info.selectionText) {
        console.log("No text selected.");
        return;
    }

    let prompt = "";
    let temperature = 0.5;  // Default temperature

    // Determine which menu item was clicked and set the appropriate prompt and temperature
    switch (info.menuItemId) {
        case "improveEnglish":
            prompt = `Please rewrite this text in refined English:\n\n${info.selectionText}`;
            break;
        case "improveEnglishCreative":
            prompt = `Please rewrite this text in a creative and engaging manner:\n\n${info.selectionText}`;
            temperature = 0.9;
            break;
        case "addCommentsToCode":
            prompt = `Please add comments to this code explaining what each part does:\n\n${info.selectionText}`;
            break;
        case "summarizeSingleParagraph":
            prompt = `Summarize this text in a single paragraph:\n\n${info.selectionText}`;
            break;
        case "aiQuiz":
            prompt = `Create 10 multiple choice questions based on this text, with 4 options each, and mark the correct answer:\n\n${info.selectionText}`;
            temperature = 0.7;
            break;
        default:
            console.log("Unknown action");
            return;
    }

    callOpenAI(prompt, temperature, tab.id);
});

function callOpenAI(prompt, temperature, tabId) {
    const API_KEY = 'sk-proj-PXWAJnhpEA1EDHL9euhuT3BlbkFJMjDmn9Ai8gtPLACc4p3T';  
    const endpoint = 'https://api.openai.com/v1/engines/davinci/completions';

    fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            prompt: prompt,
            max_tokens: 150,
            temperature: temperature
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.choices && data.choices.length > 0 && data.choices[0].text.trim() !== '') {
            chrome.storage.local.set({results: data.choices[0].text}, function() {
                console.log('Results saved.');
                showNotification("AI Response", data.choices[0].text);
            });
        } else {
            throw new Error('No valid response in data');
        }
    })
    .catch(error => {
        console.error('Error with the OpenAI API:', error);
        showNotification("AI Response", "Failed to get a valid response from the API.");
    });
}

function showNotification(title, message) {
    chrome.notifications.create('', {
        type: 'basic',
        title: title,
        iconUrl: './notification_icon.png',
        message: message,
        priority: 2
    });
}

