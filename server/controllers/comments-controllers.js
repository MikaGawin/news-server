const { removeCommentById } = require("../models/comments-models");

exports.deleteCommentById = (req, res, next) => {
  const { comment_id: commentId } = req.params;
  removeCommentById(commentId)
    .then(() => {
      res.status(204).send();
    })
    .catch(next);
};
