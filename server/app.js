const express = require("express");
const { getApi } = require("./controllers/api-controllers");
const { getTopics, postTopic } = require("./controllers/topics-controllers");
const {
  getArticles,
  postArticle,
  getArticleById,
  patchArticleById,
} = require("./controllers/articles-controllers");
const {
  invalidEndpoint,
  invalidQuery,
  internalServerError,
  handleCustomError,
} = require("./errorHandling/errorHandling");
const {
  getCommentsByArticleId,
  postCommentToArticleById,
  deleteCommentById,
  patchCommentById,
} = require("./controllers/comments-controllers");
const {
  getUsers,
  getUserByUsername,
} = require("./controllers/users-controllers");

const app = express();

app.use(express.json());

app.route("/api").get(getApi);

app.route("/api/topics").get(getTopics).post(postTopic);

app.route("/api/users").get(getUsers);

app.route("/api/users/:username").get(getUserByUsername);

app.route("/api/articles").get(getArticles).post(postArticle);

app
  .route("/api/articles/:article_id")
  .get(getArticleById)
  .patch(patchArticleById);

app
  .route("/api/articles/:article_id/comments")
  .get(getCommentsByArticleId)
  .post(postCommentToArticleById);

app
  .route("/api/comments/:comment_id")
  .delete(deleteCommentById)
  .patch(patchCommentById);

app.all("*", invalidEndpoint);

app.use(handleCustomError);
app.use(invalidQuery);
app.use(internalServerError);

module.exports = app;
