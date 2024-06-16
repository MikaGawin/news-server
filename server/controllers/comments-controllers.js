const {
  removeCommentById,
  updateCommentById,
  selectCommentsByArticleId,
  selectCommentCountByArticleId,
  insertCommentToArticleById,
} = require("../models/comments-models");
const {selectArticleById} = require("../models/articles-models")

exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id: articleId } = req.params;
  const queries = req.query;
  const commentsAndArticles = [
    selectCommentsByArticleId(articleId, queries),
    selectCommentCountByArticleId(articleId),
    selectArticleById(articleId),
  ];
  return Promise.all(commentsAndArticles)
    .then(([comments, commentCount]) => {
      res.status(200).send({ comments, commentCount });
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
exports.deleteCommentById = (req, res, next) => {
  const { comment_id: commentId } = req.params;
  removeCommentById(commentId)
    .then(() => {
      res.status(204).send();
    })
    .catch(next);
};

exports.patchCommentById = (req, res, next) => {
  const updatedFields = req.body;
  const { comment_id: commentId } = req.params;
  updateCommentById(commentId, updatedFields)
    .then((comment) => {
      res.status(200).send({ comment });
    })
    .catch(next);
};
