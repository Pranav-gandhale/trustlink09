import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyDbZVXJH4sqbFlrZZV26rZ7eiFhw2CSad8");

async function run() {
  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyDbZVXJH4sqbFlrZZV26rZ7eiFhw2CSad8");
    const data = await response.json();
    console.log("Models:", data.models?.map(m => m.name));
  } catch (error) {
    console.error("Error:", error.message);
  }
}

run();
