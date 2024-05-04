document.addEventListener('DOMContentLoaded', function () {
    // Fetch the result from storage when the popup loads
    chrome.storage.local.get("results", function (data) {
        const resultsBox = document.getElementById("resultsBox");
        const quizContainer = document.getElementById("quizContainer");

        if (data.results && data.results.includes("Question:") && data.results.includes("Options:")) {
            // This is quiz data
            resultsBox.style.display = "none";  // Hide the textarea
            quizContainer.style.display = "block";  // Show the quiz container
            renderQuiz(data.results, quizContainer);
        } else {
            // Regular text output
            quizContainer.style.display = "none";  // Hide the quiz container
            resultsBox.style.display = "block";  // Show the textarea
            resultsBox.value = data.results || "No results to display.";
            resultsBox.style.height = "";  // Reset height to recalculate
            resultsBox.style.height = resultsBox.scrollHeight + "px";
        }
    });
});

function renderQuiz(quizData, container) {
    container.innerHTML = '';  // Clear previous content
    const questions = quizData.split('Question:').slice(1);  // Ignore the first empty split

    questions.forEach((fullQuestion, index) => {
        const parts = fullQuestion.split('Options:');
        let questionText = parts[0].trim().replace(/^\d+\)/, ""); // Remove any leading "number)" from the question
        const answerParts = parts[1].split('Answer: ');
        const optionsText = answerParts[0].trim();
        const correctAnswer = answerParts[1].trim().split(')')[0];  // Extracts the letter from the answer'
        
        const options = optionsText.match(/([A-D])\) [^A-D)]+/g) || [];  // Matches 'A) Option' through 'D) Option'

        // Ensure there are always four options
        if (options.length != 4) {
            console.error(`Question ${index + 1} does not have 4 options. It has ${options.length} options.`);
            return; // Optionally skip this question or handle it differently
        }

        const questionHTML = `<div><b>${index + 1}. ${questionText}</b></div><ul>`;
        const optionsHTML = options.map(option => {
            const optionLetter = option[0];  // 'A', 'B', 'C', or 'D'
            const optionText = option.substring(3).trim();  // Skip 'A) '
            return `<li><button class="option" data-correct="${optionLetter === correctAnswer}">${optionText}</button></li>`;
        }).join('');

        container.innerHTML += questionHTML + optionsHTML + '</ul>';
    });

    document.querySelectorAll('#quizContainer .option').forEach(button => {
        button.addEventListener('click', function() {
            const allButtons = this.parentNode.querySelectorAll('button');
            allButtons.forEach(btn => {
                btn.style.backgroundColor = '';  // Reset background
                btn.style.fontWeight = '';  // Reset bold style
                btn.style.color = '';  // Reset text color
            });
            if (this.dataset.correct === 'true') {
                this.style.backgroundColor = 'green';
                this.style.fontWeight = 'bold';
                this.style.color = 'white';  // Ensures text is visible on green background
            } else {
                this.style.backgroundColor = 'red';
                this.style.color = 'white';
                setTimeout(() => {
                    this.style.backgroundColor = '#f0f0f0'; // Revert to grey after 2 seconds
                    this.style.color = '';  // Revert text color to default
                }, 2000);  // 2000 milliseconds = 2 seconds
            }
        });
    });
}