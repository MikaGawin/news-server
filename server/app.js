const express = require("express");
const { getApi } = require("./controllers/api-controllers");
const { getTopics } = require("./controllers/topics-controllers");
const {
  getArticles,
  getArticleById,
  getCommentsByArticleId,
  postCommentToArticleById,
  patchArticleById,
} = require("./controllers/articles-controllers");
const {
  invalidEndpoint,
  invalidQuery,
  internalServerError,
  handleCustomError,
} = require("./errorHandling/errorHandling");

const app = express();

app.use(express.json());

app.get("/api", getApi);
app.get("/api/topics", getTopics);
app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id", getArticleById);
app.patch("/api/articles/:article_id", patchArticleById);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);
app.post("/api/articles/:article_id/comments", postCommentToArticleById);

app.all("*", invalidEndpoint);
app.use(handleCustomError);
app.use(invalidQuery);
app.use(internalServerError);

module.exports = app;
