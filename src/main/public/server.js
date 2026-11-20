/**
 * The web server of KweenB (port 5050). It runs as its own process and
 *  - serves the remote interface (the folder webserver);
 *  - lets a satellite ask KweenB to sync with it.
 * Everything that touches the database happens in KweenB itself: this
 * process only passes the question on (see express.ts).
 */

const express = require("express");
const path = require("path");
const cors = require("cors");

const publicFolder = path.join(__dirname, "webserver");
const port = 5050;

// a sync takes seconds; a satellite with very many scenes a bit longer
const SYNC_TIMEOUT_MS = 90000;

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(publicFolder));

/**
 * Questions that are waiting for the answer of KweenB
 */
let lastQuestion = 0;
const waiting = new Map();

process.on("message", (message) => {
  if (!message || message.type !== "satellite-sync-result") return;
  const answer = waiting.get(message.id);
  if (!answer) return;
  waiting.delete(message.id);
  answer(message);
});

/**
 * A satellite holds compositions KweenB does not have yet and asks KweenB
 * to come and get them (and to send back the state of KweenB)
 */
app.post("/api/satellite/sync", (req, res) => {
  if (!process.send) {
    res.status(503).json({ success: false, message: "KweenB is not ready." });
    return;
  }

  // the satellite is whoever asks; it tells the port of its own interface
  const host = String(req.socket.remoteAddress || "").replace(/^::ffff:/, "");
  const satellitePort = Number((req.body && req.body.port) || 80);

  lastQuestion += 1;
  const id = lastQuestion;
  const timer = setTimeout(() => {
    waiting.delete(id);
    res
      .status(504)
      .json({ success: false, message: "KweenB did not answer in time." });
  }, SYNC_TIMEOUT_MS);
  waiting.set(id, (message) => {
    clearTimeout(timer);
    if (message.ok) res.json({ success: true, result: message.result });
    else res.status(500).json({ success: false, message: message.error });
  });
  process.send({ type: "satellite-sync", id, host, port: satellitePort });
});

// every other address shows the remote interface
app.get("*", (req, res) => {
  res.sendFile(path.join(publicFolder, "index.html"));
});

app.listen(port, () => {
  console.log(`KweenB web server running on port ${port}`);
});
