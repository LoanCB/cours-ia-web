const path = require("path");
const fs = require("fs");
const express = require("express");
const app = express();
const port = 3002;
const csvWriter = require("csv-writer").createObjectCsvWriter;
const csvParser = require("csv-parser");
const cors = require("cors");

// Middleware pour parser le JSON dans les requêtes
app.use(express.json());

// Middleware pour autoriser les requêtes cross-origin
app.use(cors());

// Route POST pour sauvegarder les données en CSV
app.post("/suites/all", async (req, res) => {
  const suites = req.body;
  const csvFilePath = path.join(__dirname, "data", "data.csv");

  const writer = csvWriter({
    path: csvFilePath,
    header: [
      { id: "id", title: "id" },
      { id: "nbRooms", title: "nbRooms" },
      { id: "surface", title: "surface" },
      { id: "nbWindows", title: "nbWindows" },
      { id: "price", title: "price" },
    ],
    fieldDelimiter: ";",
  });

  try {
    // Écrire les données dans le fichier CSV
    await writer.writeRecords(suites);

    // Retourner le JSON envoyé en réponse
    res.json(suites);
  } catch (err) {
    console.error("Error writing CSV file:", err);
    res.status(500).json({ error: "Failed to save CSV file" });
  }
});

// Route POST pour sauvegarder une seule suite en CSV
app.post("/suites", async (req, res) => {
  const newSuite = req.body;
  const csvFilePath = path.join(__dirname, "data", "data.csv");

  // Lire les données existantes du fichier CSV
  const existingSuites = [];
  fs.createReadStream(csvFilePath)
    .pipe(csvParser({ separator: ";" }))
    .on("data", (row) => {
      existingSuites.push(row);
    })
    .on("end", async () => {
      // Trouver le dernier ID existant
      let lastId = 0;
      existingSuites.forEach((suite) => {
        const suiteId = parseInt(suite.id);
        if (suiteId > lastId) {
          lastId = suiteId;
        }
      });

      // Générer un nouvel ID si l'ID n'est pas spécifié dans le body
      if (!newSuite.id) {
        newSuite.id = (lastId + 1).toString();
      }

      // Vérifier si l'ID existe déjà dans les données existantes
      const existingIds = existingSuites.map((suite) => suite.id);
      if (existingIds.includes(newSuite.ID)) {
        res.status(400).json({ error: "ID already exists" });
        return;
      }

      // Ajouter le nouvel appartement aux données existantes
      existingSuites.push(newSuite);

      const writer = csvWriter({
        path: csvFilePath,
        header: [
          { id: "id", title: "id" },
          { id: "nbRooms", title: "nbRooms" },
          { id: "surface", title: "surface" },
          { id: "nbWindows", title: "nbWindows" },
          { id: "price", title: "price" },
        ],
        fieldDelimiter: ";",
      });

      try {
        // Écrire les données mises à jour dans le fichier CSV
        await writer.writeRecords(existingSuites);

        // Retourner le JSON du nouvel appartement en réponse
        res.json(newSuite);
      } catch (err) {
        console.error("Error writing CSV file:", err);
        res.status(500).json({ error: "Failed to save CSV file" });
      }
    });
});

// Route GET pour récupérer toutes les suites en json
app.get("/suites", (req, res) => {
  const csvFilePath = path.join(__dirname, "data", "data.csv");

  const suites = [];
  fs.createReadStream(csvFilePath)
    .pipe(csvParser({ separator: ";" }))
    .on("data", (row) => {
      suites.push(row);
    })
    .on("end", () => {
      res.json(suites);
    });
});

// Route GET pour récupérer une seule suite en json
app.get("/suites/:id", (req, res) => {
  const id = req.params.id;
  const csvFilePath = path.join(__dirname, "data", "data.csv");

  let suite = null;
  fs.createReadStream(csvFilePath)
    .pipe(csvParser({ separator: ";" }))
    .on("data", (row) => {
      if (row.id === id) {
        suite = row;
      }
    })
    .on("end", () => {
      if (suite) {
        res.json(suite);
      } else {
        res.status(404).json({ error: "Suite not found" });
      }
    });
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
