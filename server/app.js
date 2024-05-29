const express = require("express");
const { getApi } = require("./controllers/api-controllers");
const { getTopics } = require("./controllers/topics-controllers");
const {
  getArticles,
  getArticleById,
} = require("./controllers/articles-controllers");
const {
  invalidEndpoint,
  invalidQuery,
  internalServerError,
  handleCustomError,
} = require("./errorHandling/errorHandling");

const app = express();

app.get("/api", getApi);
app.get("/api/topics", getTopics);
app.get("/api/articles", getArticles);
app.get("/api/articles/:article_id", getArticleById);

app.all("*", invalidEndpoint);
app.use(invalidQuery);
app.use(handleCustomError);
app.use(internalServerError);

module.exports = app;
