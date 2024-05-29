const express = require("express");
const { getApi } = require("./controllers/api-controllers");
const { getTopics } = require("./controllers/topics-controllers");
const { getArticleById } = require("./controllers/articles-controllers");
const {
  invalidQuery,
  internalServerError,
  handleCustomError,
} = require("./errorHandling/errorHandling");

const app = express();

app.get("/api", getApi);
app.get("/api/topics", getTopics);
app.get("/api/articles/:article_id", getArticleById);

app.use(invalidQuery);
app.use(handleCustomError);
app.use(internalServerError);

module.exports = app;
