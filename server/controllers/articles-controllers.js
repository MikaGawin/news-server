const {
  selectArticles,
  selectArticleById,
  selectCommentsByArticleId,
  insertCommentToArticleById,
  updateArticleById,
} = require("../models/articles-models");

exports.getArticles = (req, res, next) => {
  selectArticles()
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch(next);
};

exports.getArticleById = (req, res, next) => {
  const { article_id: articleId } = req.params;
  selectArticleById(articleId)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id: articleId } = req.params;
  const commentsAndArticles = [
    selectCommentsByArticleId(articleId),
    selectArticleById(articleId),
  ];
  return Promise.all(commentsAndArticles)
    .then(([comments]) => {
      res.status(200).send({ comments });
    })
    .catch(next);
};

exports.postCommentToArticleById = (req, res, next) => {
  const newComment = req.body;
  const { article_id: articleId } = req.params;
  insertCommentToArticleById(articleId, newComment)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch(next);
};

exports.patchArticleById = (req, res, next) => {
  const updatedFields = req.body;
  const { article_id: articleId } = req.params;
  updateArticleById(articleId, updatedFields)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};
