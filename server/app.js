const express = require("express");
const { getApi } = require("./controllers/api-controllers");
const { internalServerError } = require("./errorHandling/errorHandling");
const { getTopics } = require("./controllers/topics-controllers");

const app = express();

app.get("/api", getApi);

app.get("/api/topics", getTopics);

app.use(internalServerError);

module.exports = app;
