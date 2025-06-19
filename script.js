 // Backend API base URL 
// port available 8000 to 8006
// const SERVER_URL = "http://127.0.0.1:8001"; 
// const SERVER_URL = "http://44.242.220.46:8001/";
 const SERVER_URL='https://ollama-proxy.kneotech.cloud';
const modelSelect = document.getElementById("model-select");
const chatBox = document.querySelector(".chat-box");
const chatInput = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");

let selectedModel = null;
let messages = [];

async function fetchModels() {
  try {
    const response = await fetch(`${SERVER_URL}/api/models`);
    const data = await response.json();
    data.models.forEach((model) => {
      const option = document.createElement("option");
      option.value = model.name;
      option.textContent = model.name;
      modelSelect.appendChild(option);
    });
    if (data.models.length > 0) {
      selectedModel = data.models[0].name;
    }
  } catch (error) {
    console.error("Error fetching models:", error);
  }
}

function appendMessage(content, isUser = true) {
  const div = document.createElement("div");
  div.className = `message ${isUser ? "user-message" : "bot-message"}`;
  div.textContent = content;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
  const inputText = chatInput.value.trim();
  if (!inputText || !selectedModel) return;

  appendMessage(inputText, true);
  messages.push({role: "system", content: "You are an 10 year old named Emma,today is 15th June 2025,SUNDAY"},{ role: "user", content: inputText });
  chatInput.value = "";

  try {
    const response = await fetch(`${SERVER_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: selectedModel,
        messages,
        stream: false  // Change to true if you want to use streaming
      })
    });

    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.json();
    const botReply = data.response;
    appendMessage(botReply, false);
    messages.push({ role: "assistant", content: botReply });

  } catch (error) {
    console.error("Error fetching chat:", error);
    appendMessage("⚠️ Error communicating with backend.", false);
  }
}

sendBtn.addEventListener("click", sendMessage);
chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

modelSelect.addEventListener("change", () => {
  selectedModel = modelSelect.value;
  messages = []; // Reset chat history when switching models
  chatBox.innerHTML = ""; // Clear chat display
});

chatInput.addEventListener("input", () => {
  chatInput.style.height = "auto";
  chatInput.style.height = `${chatInput.scrollHeight}px`;
});

fetchModels();
chatInput.addEventListener("input", function() {
  // Reset height to auto to get the correct scrollHeight
  this.style.height = "auto";
  
  // Set new height based on scrollHeight (with max-height constraint handled by CSS)
  this.style.height = (this.scrollHeight) + "px";
});
