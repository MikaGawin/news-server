const db = require("../../db/connection");

exports.removeCommentById = (commentId) => {
  const sqlQuery = `
    DELETE FROM comments
    WHERE comment_id = $1`;

  return db.query(sqlQuery, [commentId]).then(({ rowCount }) => {
    if (!rowCount) {
      return Promise.reject({
        msg: "Id not found",
        status: 404,
      });
    }
  });
};

exports.updateCommentById = (commentId, { inc_votes: incrementVotes = 0 }) => {
  const sqlQuery = `
  UPDATE comments
  SET votes = votes + $1
  WHERE comment_id = $2
  RETURNING *`;

  return db.query(sqlQuery, [incrementVotes, commentId]).then(({ rows }) => {
    if (!rows[0]) {
      return Promise.reject({
        status: 404,
        msg: "Comment not found",
      });
    } else {
      return rows[0];
    }
  });
}
