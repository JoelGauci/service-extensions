document.getElementById("submitButton").addEventListener("click", function () {
    // Récupérer les valeurs des champs
    const username = document.getElementById("username").value.trim();
    const apiKey = document.getElementById("apiKey").value.trim();
    const msgToSend = document.getElementById("msgToSend").value;

    // Réinitialiser les erreurs
    document.getElementById("usernameError").textContent = "";
    document.getElementById("apiKeyError").textContent = "";
    document.getElementById("msgToSendError").textContent = "";

    // Vérifier que tous les champs sont renseignés
    let hasError = false;
    if (!username) {
      document.getElementById("usernameError").textContent = "Username is required.";
      hasError = true;
    }
    if (!apiKey) {
      document.getElementById("apiKeyError").textContent = "API Key is required.";
      hasError = true;
    }
    if (!msgToSend) {
      document.getElementById("msgToSendError").textContent = "Message is required.";
      hasError = true;
    }

    if (hasError) {
      return; // Ne pas envoyer si des erreurs existent
    }

    // Créer le contenu JSON
    const payload = {
      username: username,
      msg: msgToSend
    };

    // Envoyer les données avec fetch
    fetch("https://34-95-84-14.nip.io/v1/message", {
    //fetch("http://127.0.0.1:80/v1/broker", { // for internal tests only
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey
      },
      body: JSON.stringify(payload)
    })
    .then(response => {
      if (response.status !== 200) {
        console.log('line 49'); //added by samy
        console.log('samy log response ', response); // added by samy
        console.log('samy log response ', response.status); // added by samy

        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      //document.getElementById("result").textContent = "Message sent successfully!";
      document.getElementById("msgToSend").value = "";
      console.log("Response:", data);
    })
    .catch(error => {
      document.getElementById("result").textContent = "Failed to send message.";
      console.error("Error:", error);
    });
  });