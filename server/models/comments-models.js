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
};
exports.selectCommentsByArticleId = (articleId, { limit = 10, p }) => {
  const queryParams = [articleId];
  let sqlQuery = `
  SELECT comment_id, votes, body, article_id, created_at, author, users.avatar_url AS author_avatar
  FROM comments AS c
  LEFT JOIN users
  on c.author = users.username
  WHERE
  article_id = $1
  ORDER BY created_at DESC`;

  let queryNum = 2;
  sqlQuery += `
    LIMIT $${queryNum}
  `;
  queryParams.push(limit);
  queryNum++;

  if (!!p) {
    const pageOffset = (p - 1) * limit;
    sqlQuery += `OFFSET $${queryNum}`;
    queryParams.push(pageOffset);
    queryNum++;
  }

  return db.query(sqlQuery, queryParams).then(({ rows }) => {
    return rows;
  });
};
exports.selectCommentCountByArticleId = (articleId) => {
  const sqlQuery = `
    SELECT COUNT(comment_id) :: INT
    FROM comments
    WHERE
    article_id = $1;`;

  return db.query(sqlQuery, [articleId]).then(({ rows }) => {
    return rows[0].count;
  });
};
exports.insertCommentToArticleById = (articleId, { username, body }) => {
  if (!username || !body) {
    return Promise.reject({ status: 400, msg: "Incomplete body" });
  }
  const sqlQuery = `
  INSERT INTO comments
  (article_id, author, body) 
  VALUES 
  ($1, $2, $3)
  RETURNING *;`;

  const commentData = [articleId, username, body];

  return db.query(sqlQuery, commentData).then(({ rows }) => {
    return rows[0];
  });
};
