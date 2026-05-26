import axios from "axios";

export async function analyzeSentiment(text) {
  const baseURL = process.env.SENTIMENT_API_URL || "http://localhost:8000";

  try {
    const response = await axios.post(
      `${baseURL}/analyze`,
      { text },
      { timeout: 2500 }
    );

    return {
      label: response.data.label || "neutral",
      score: Number(response.data.score || 0),
      sourceAvailable: true
    };
  } catch (error) {
    console.warn("Sentiment service unavailable, falling back to neutral");
    return {
      label: "neutral",
      score: 0,
      sourceAvailable: false
    };
  }
}
