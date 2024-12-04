const express = require('express');
const bodyParser = require('body-parser');
const mqtt = require('mqtt');
const cors = require('cors');

// Configuration du broker MQTT
const mqttUrl = 'mqtt://34.79.210.29:1883';

// Initialisation de l'application Express
const app = express();
const PORT = 80;

// Middleware pour parser les requêtes JSON

app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
      res.set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
      });
      return res.status(204).end(); // Répond aux requêtes OPTIONS immédiatement
    }
    next();
  });

app.use(bodyParser.json());

// Route HTTP POST /v1/broker
app.post('/v1/broker', (req, res) => {
  const { username, msg } = req.body;
  const apiKey = req.headers['x-api-key'];
  const extraMsg = req.headers['x-msg']; // usefull for the JavaScript test in Apigee X

  // Validation des données
  if (!username || !msg || !apiKey) {
    return res.status(400).json({ error: 'Missing username, msg, or apiKey' });
  }

  console.log(`Received request: (json)username=${username}, (json)msg=${msg}, (header)apiKey=${apiKey}`);

  let tailMsg = (!extraMsg) ?  "" : "[ " + extraMsg + " ]";

  console.log(`tail message:${tailMsg}`);

  // Configuration des options MQTT
  const mqttOptions = {
    clientId: apiKey,
    username: username,
  };

  // Connexion au broker MQTT
  const client = mqtt.connect(mqttUrl, mqttOptions);

  client.on('connect', () => {
    console.log('Connected to MQTT broker');

    const topic = `msg/${apiKey}`; // Topic basé sur l'apiKey

    let publishedMessage = {
        username: username,
        msg: msg + tailMsg
    };

    // Publication du message en retain
    client.publish(topic, JSON.stringify(publishedMessage), { retain: true },(err) => {
      if (err) {
        console.error('Failed to publish message:', err);
        res.set({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
          });
        res.status(500).json({ error: 'Failed to publish message to broker' });
      } else {
        console.log(`Message published to topic ${topic}: ${msg}`);
        res.set({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
          });
        res.status(200).json({ success: true, topic });
      }

      // Déconnexion du client après publication
      client.end();
    });
  });

  client.on('error', (err) => {
    console.error('MQTT connection error:', err);
    res.status(500).json({ error: 'MQTT connection error' });
  });
});

app.get('/', (req, res) => {

    console.log("Received health check request on / ");

    const responseJson = {
      message: "Broker API is running",
      status: "OK",
      version: "1.0.0"
    };
  
    res.status(200).json(responseJson);
  });
  
// Démarrage du serveur HTTP
app.listen(PORT, () => {
  console.log(`HTTP server is running on port ${PORT}`);
});
