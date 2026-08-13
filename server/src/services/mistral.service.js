const { Mistral } = require("@mistralai/mistralai");

const client = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY,
});

const generateSmartReplies = async (message) => {
  try {
    const response = await client.chat.complete({
      model: "mistral-small-latest",

      messages: [
        {
          role: "system",
          content:
            "Generate exactly 3 short, natural reply suggestions for the user's message. Return ONLY a JSON array of exactly 3 strings. Do not use Markdown or code blocks.",
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    let content = response.choices[0].message.content;

    console.log("Raw Mistral response:", content);

    // Remove Markdown code fences if Mistral adds them
    content = content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const suggestions = JSON.parse(content);

    return suggestions;

  } catch (error) {
    console.error(
      "Mistral API Error:",
      error.message
    );

    return [];
  }
};

module.exports = {
  generateSmartReplies,
};