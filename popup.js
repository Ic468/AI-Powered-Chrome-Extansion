document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.local.get("results", function (data) {
        document.getElementById("resultsBox").value = data.results || "No results to display.";
    });
});