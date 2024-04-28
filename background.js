chrome.runtime.onInstalled.addListener(() => {
    const contexts = ["selection"];
    const options = [
      {id: "improveEnglish", title: "Improve English"},
      {id: "improveEnglishCreative", title: "Improve English - Creative"},
      {id: "addCommentsToCode", title: "Add Comments to Code"},
      {id: "summarizeSingleParagraph", title: "Summarize to a Single Paragraph"},
      {id: "aiQuiz", title: "AI Quiz"}
    ];
  
    options.forEach(option => {
      chrome.contextMenus.create({
        id: option.id,
        title: option.title,
        contexts: contexts
      });
    });
  });
  
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    const action = info.menuItemId;
    const text = info.selectionText;
  
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: processText,
      args: [text, action]
    });
  });
  
  function processText(selectedText, action) {
    const API_KEY = 'sk-proj-wwoHzKAY9fZV9pxA2FegT3BlbkFJEVTeX4mjOjLJwdvJInFF';
    const endpoint = 'https://api.openai.com/v1/engines/text-davinci-002/completions';
  
    let prompt = '';
    let temperature = 0.5;
  
    switch (action) {
      case 'improveEnglish':
        prompt = `Please rewrite this text with better English:\n\n${selectedText}`;
        break;
      case 'improveEnglishCreative':
        prompt = `Please rewrite this text with creative, imaginative English:\n\n${selectedText}`;
        temperature = 0.9;
        break;
      case 'addCommentsToCode':
        prompt = `Add detailed comments to this code:\n\n${selectedText}`;
        break;
      case 'summarizeSingleParagraph':
        prompt = `Summarize this text in a single paragraph:\n\n${selectedText}`;
        break;
      case 'aiQuiz':
        prompt = `Create 10 multiple choice questions based on this text:\n\n${selectedText}`;
        temperature = 0.7;
        break;
    }
  
    fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        prompt: prompt,
        max_tokens: 200,
        temperature: temperature
      })
    })
    .then(response => response.json())
    .then(data => {
      console.log(data.choices[0].text);
      alert(data.choices[0].text);
    })
    .catch(error => console.error('Error:', error));
  }