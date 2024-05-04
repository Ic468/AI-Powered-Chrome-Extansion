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
            prompt = `Imagine you are an English teacher correcting a student's work. If the following text is in English, please rewrite it to ensure it is grammatically correct, uses refined academic language, and is stylistically polished. If the text is not in English, return a message saying "Non-English text detected. Please select English text.":\n\n${info.selectionText}`;
            break;
        case "improveEnglishCreative":
            prompt = `Imagine you are an English teacher correcting a student's work. If the following text is in English, please rewrite it to ensure it is grammatically correct, uses refined academic language, and is stylistically polished. If the text is not in English, return a message saying "Non-English text detected. Please select English text.":\n\n${info.selectionText}`;
            temperature = 1;
            break;
        case "addCommentsToCode":
            prompt = `If the following text is programming code, please add progammer comments to explain what each part of the code does. If this text is not code, return a message saying "This is not valid code. Please select a valid code snippet.":\n\n${info.selectionText}`;
            temperature = 0.3;
            break;
        case "summarizeSingleParagraph":
            prompt = `Summarize this text in a single paragraph:\n\n${info.selectionText}`;
            break;
        case "aiQuiz":
            prompt = `Generate 10 multiple-choice questions based on the following text. Each question should have 4 options, formatted as: Question: [question text] Options: A) [option 1] B) [option 2] C) [option 3] D) [option 4] Answer: [correct letter].\n\n${info.selectionText}`;
            temperature = 0.9;
            break;
        default:
            console.log("Unknown action");
            return;
    }

    callOpenAI(prompt, temperature, tab.id);
});

async function callOpenAI(prompt, temperature, tabId) {
    const API_KEY = 'sk-proj-g4MaPoLi8qj7Od9bH1AGT3BlbkFJy6anUchggcG5G6AUUHgz';  
    const endpoint = 'https://api.openai.com/v1/chat/completions';

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4",
                messages: [{ "role": "user", "content": prompt }],
                max_tokens: 600,
                temperature: temperature
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const resultMessage = data.choices[0].message.content;

        // Store the result in Chrome's local storage
        chrome.storage.local.set({results: resultMessage}, function() {
            openResultsPage(); // This will open the popup.html in a new tab with the results
        });

    } catch (error) {
        console.error('Failed to fetch AI response:', error);
        chrome.runtime.sendMessage({ action: "updateResult", message: 'Error: ' + error.message });
    }
}

function openResultsPage() {
    chrome.tabs.create({url: chrome.runtime.getURL('popup.html')});
}

