// Adresse et port du broker MQTT
const brokerUrl = "34.79.210.29.nip.io";
const clientId = "webClient_" + Math.random().toString(16).substr(2, 8);

// Créez un client MQTT pour WebSocket
const client = new Paho.MQTT.Client(brokerUrl, 8084, "/mqtt", clientId); // Port WebSocket 8083

// Gestion de la connexion perdue
client.onConnectionLost = (responseObject) => {
  console.log("Connection lost:", responseObject.errorMessage);
  document.getElementById("status").textContent = "Disconnected";
};

// Gestion des messages reçus
client.onMessageArrived = (message) => {
  console.log("Message received:", message.payloadString);

  const messagesDiv = document.getElementById("messages");

  // Décomposition du message reçu
  const payload = JSON.parse(message.payloadString);
  const topic = message.destinationName;
  const content = payload.msg || "No content"; // Texte du message
  const username = payload.username || "Anonymous"; // Nom d'utilisateur

  console.log("message received on topic:", topic);

  // Formatage de la date et de l'heure
  const timestamp = new Date().toLocaleString();

  // Création de l'élément HTML pour afficher le message
  const newMessage = document.createElement("div");
  newMessage.className = "message";
  newMessage.innerHTML = `
    <span class="timestamp">${timestamp}</span> -
    <span class="username">${username}</span> :
    <span class="content">${content}</span>
  `;

  // Ajoutez le message en haut de la liste
  messagesDiv.insertBefore(newMessage, messagesDiv.firstChild);
};

// Connexion au broker
client.connect({
  mqttVersion: 4,
  onSuccess: () => {
    console.log("Connected to broker");
    document.getElementById("status").textContent = "Connected";

    // Souscription
    client.subscribe("msg/#", {
      onSuccess: () => console.log("Subscribed to topic: msg/#"),
      onFailure: (error) => console.error("Failed to subscribe:", error.errorMessage),
    });
  },
  onFailure: (error) => {
    console.error("Failed to connect:", error.errorMessage);
    document.getElementById("status").textContent = "Failed to Connect";
  },
  useSSL: true, // Connexion sécurisée via wss://,
  keepAliveInterval: 120
});
