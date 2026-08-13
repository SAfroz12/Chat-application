require("dotenv").config({
  path: require("path").join(__dirname, "../.env"),
});

require("dotenv").config();

const {
  generateSmartReplies,
} = require("./services/mistral.service");

console.log(
  "Mistral key loaded:",
  process.env.MISTRAL_API_KEY ? "YES" : "NO"
);

const test = async () => {
  const suggestions = await generateSmartReplies(
    "Are you coming tomorrow?"
  );

  console.log("AI Suggestions:");
  console.log(suggestions);
};

test();