const APIURL = "http://localhost:3000/api/gemini"; 

const chatArea = document.getElementById("chatArea");
const input = document.getElementById("text-input");
const themeToggleBtn = document.getElementById("theme-toggle");

let soundOn = true;

function fetchResults() {
  const userInput = input.value.trim();
  if (!userInput) return;

  appendMessage("user", userInput);
  input.value = "";
  document.getElementsByClassName("header")[0].style.display = "none";

  fetchApiResponse(userInput);
}

async function fetchApiResponse(userMessage) {
  const loadingEl = appendLoadingMessage();

  try {
    const res = await fetch(APIURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage }),
    });

    const data = await res.json();
    const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, something went wrong!";

    loadingEl.remove();
    await typeMessage(responseText);

    if (soundOn) playSound();
  } catch (error) {
    loadingEl.remove();
    appendMessage("Gemini", "⚠️ Failed to fetch response. Try again.");
    console.error("Fetch error:", error);
  }
}

function appendMessage(sender, text) {
  const msg = document.createElement("div");
  msg.className = `message ${sender}`;

  const p = document.createElement("p");
  p.textContent = text;
  msg.appendChild(p);

  const timeStamp = document.createElement("div");
  timeStamp.className = "timestamp";
  timeStamp.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  msg.appendChild(timeStamp);

  if (sender === "Gemini") {
    const copyBtn = document.createElement("button");
    copyBtn.className = "copy-btn";
    copyBtn.textContent = "Copy";
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(text);
      copyBtn.textContent = "Copied!";
      setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
    };
    msg.appendChild(copyBtn);
  }

  chatArea.appendChild(msg);
  chatArea.scrollTop = chatArea.scrollHeight;

  return msg;
}

function appendLoadingMessage() {
  const loadingMsg = document.createElement("div");
  loadingMsg.className = "message Gemini";
  loadingMsg.innerHTML = `<p>Typing<span class="dots">...</span></p>`;
  chatArea.appendChild(loadingMsg);
  chatArea.scrollTop = chatArea.scrollHeight;
  return loadingMsg;
}

function typeMessage(text) {
  return new Promise((resolve) => {
    const msg = document.createElement("div");
    msg.className = "message Gemini";

    const p = document.createElement("p");
    msg.appendChild(p);

    const timeStamp = document.createElement("div");
    timeStamp.className = "timestamp";
    timeStamp.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    msg.appendChild(timeStamp);

    const copyBtn = document.createElement("button");
    copyBtn.className = "copy-btn";
    copyBtn.textContent = "Copy";
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(p.textContent);
      copyBtn.textContent = "Copied!";
      setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
    };
    msg.appendChild(copyBtn);

    chatArea.appendChild(msg);
    chatArea.scrollTop = chatArea.scrollHeight;

    let i = 0;
    const speed = 15;
    function type() {
      if (i < text.length) {
        p.textContent += text.charAt(i);
        i++;
        chatArea.scrollTop = chatArea.scrollHeight;
        setTimeout(type, speed);
      } else {
        resolve();
      }
    }
    type();
  });
}

// Theme toggle
function toggle() {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  themeToggleBtn.textContent = isDark ? "☀️" : "🌙";
}

// Sound toggle helper
function toggleSound() {
  soundOn = !soundOn;
}

// Simple beep sound
function playSound() {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.1);
}

// Press Enter to send
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    fetchResults();
  }
});

function clearChat() {
  chatArea.innerHTML = "";
  localStorage.removeItem("chatHistory");
}

