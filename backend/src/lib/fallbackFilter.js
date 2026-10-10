const TOXIC_WORDS = [
  "madarchod", "behenchod", "bhenchod", "chutiya",
  "chutia", "gaand", "lodu", "gandu", "bkl", "bsdk",
  "harami", "kamina", "stupid", "idiot", "moron", "dumb"
];

function check(text) {
  const normalized = text.toLowerCase().replace(/[^a-z]/g, "");
  const matched = TOXIC_WORDS.filter(word => normalized.includes(word));
  
  return {
    blocked: matched.length > 0,
    reasons: matched,
    message: matched.length > 0 ? "Message contains inappropriate content" : null
  };
}

function suggest(text) {
  return "Please rephrase your message in a more respectful way.";
}

function analyzeFallback(text) {
  const result = check(text);
  return {
    isToxic: result.blocked,
    reasons: result.reasons,
    sanitized: result.blocked ? suggest(text) : text
  };
}

module.exports = { analyzeFallback, check, suggest };
