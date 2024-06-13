const {
  removeCommentById,
  updateCommentById,
} = require("../models/comments-models");

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
