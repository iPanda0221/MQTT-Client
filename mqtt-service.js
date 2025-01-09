// MQTT Client Configuration
const client = new Paho.Client(
  "broker.hivemq.com",
  8000,
  "clientId-" + Math.random().toString(16).substr(2, 8)
);

client.onConnectionLost = function (responseObject) {
  if (responseObject.errorCode !== 0) {
    console.error("Connection lost: " + responseObject.errorMessage);
  }
};

client.onMessageArrived = function (message) {
  const chatBody = document.getElementById("chatBody");
  const { name, content, time } = JSON.parse(message.payloadString);

  const messageElement = document.createElement("div");
  messageElement.className = "chat-message";
  messageElement.innerHTML = `
        <span><strong>${name}</strong> : ${time}</span>
        <span class="message-content">${content}</span>
    `;
  chatBody.appendChild(messageElement);
  chatBody.scrollTop = chatBody.scrollHeight; // Scroll to the bottom
};

client.connect({
  onSuccess: () => {
    console.log("Connected to MQTT broker");
    client.subscribe("chat/messages");
  },
  onFailure: (error) => {
    console.error("Connection failed: ", error);
  },
});

function sendMessage() {
  const name = document.getElementById("nameInput").value.trim();
  const message = document.getElementById("messageInput").value.trim();
  const currentTime = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (name && message) {
    const messagePayload = JSON.stringify({
      name: name,
      content: message,
      time: currentTime,
    });

    const mqttMessage = new Paho.Message(messagePayload);
    mqttMessage.destinationName = "chat/messages";
    client.send(mqttMessage);

    document.getElementById("messageInput").value = "";
  }
}
