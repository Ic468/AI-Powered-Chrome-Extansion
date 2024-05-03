document.addEventListener('DOMContentLoaded', function () {
    // Fetch the result from storage when the popup loads
    chrome.storage.local.get("results", function (data) {
        const resultsBox = document.getElementById("resultsBox");
        resultsBox.value = data.results || "No results to display.";
        // Dynamically adjust the height of the textarea to fit the content
        resultsBox.style.height = ""; // Reset height to recalculate
        resultsBox.style.height = resultsBox.scrollHeight + "px";
    });
});
document.getElementById("resultsBox").addEventListener('input', function () {
    // Clear storage when the data has been edited or dealt with
    chrome.storage.local.remove("results");
});