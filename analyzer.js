document.getElementById("analyzeBtn").addEventListener("click", function () {
  const text = document.getElementById("textInput").value;

  // Count letters (only a-z and A-Z)
  const letters = (text.match(/[a-zA-Z]/g) || []).length;

  // Count words
  const words = (text.trim().match(/\b\w+\b/g) || []).length;

  // Count spaces
  const spaces = (text.match(/ /g) || []).length;

  // Count newlines
  const newlines = (text.match(/\n/g) || []).length;

  // Count special characters (excluding letters, digits, and whitespace)
  const specialSymbols = (text.match(/[^\w\s]/g) || []).length;

  // Tokenize all words
  const tokens = text.toLowerCase().match(/\b\w+\b/g) || [];

  // Pronouns to count
  const pronounsList = ["i", "you", "he", "she", "it", "we", "they", "me", "him", "her", "us", "them", "my", "your", "his", "its", "our", "their"];
  const pronounCounts = {};

  // Prepositions to count
  const prepositionsList = ["in", "on", "at", "by", "with", "about", "against", "between", "into", "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", "of", "off", "over", "under"];
  const prepositionCounts = {};

  // Indefinite articles
  const articlesList = ["a", "an"];
  const articleCounts = {};

  tokens.forEach(token => {
      if (pronounsList.includes(token)) {
          pronounCounts[token] = (pronounCounts[token] || 0) + 1;
      }

      if (prepositionsList.includes(token)) {
          prepositionCounts[token] = (prepositionCounts[token] || 0) + 1;
      }

      if (articlesList.includes(token)) {
          articleCounts[token] = (articleCounts[token] || 0) + 1;
      }
  });

  // Output Results
  const resultHTML = `
      <div class="result-group">
          <h3>Basic Counts</h3>
          <p><strong>Letters:</strong> ${letters}</p>
          <p><strong>Words:</strong> ${words}</p>
          <p><strong>Spaces:</strong> ${spaces}</p>
          <p><strong>Newlines:</strong> ${newlines}</p>
          <p><strong>Special Symbols:</strong> ${specialSymbols}</p>
      </div>

      <div class="result-group">
          <h3>Pronouns Count</h3>
          <p>${formatCounts(pronounCounts)}</p>
      </div>

      <div class="result-group">
          <h3>Prepositions Count</h3>
          <p>${formatCounts(prepositionCounts)}</p>
      </div>

      <div class="result-group">
          <h3>Indefinite Articles Count</h3>
          <p>${formatCounts(articleCounts)}</p>
      </div>
  `;

  document.getElementById("results").innerHTML = resultHTML;
});

// Helper function to display grouped counts
function formatCounts(counts) {
  if (Object.keys(counts).length === 0) return "None";
  return Object.entries(counts)
      .map(([word, count]) => `${word}: ${count}`)
      .join(", ");
}
