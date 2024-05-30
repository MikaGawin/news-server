const db = require("../../db/connection");

exports.selectArticles = ({ topic }) => {
  const queries = [];
  let sqlQuery = `
    SELECT  a.article_id, title, a.author, topic, a.created_at, a.votes, article_img_url, COUNT(comment_id) :: INT AS comment_count
    FROM articles AS a
    LEFT JOIN comments 
    ON a.article_id = comments.article_id
  `;

  if (topic) {
    sqlQuery += `WHERE topic = $1`;
    queries.push(topic);
  }

  sqlQuery += `
    GROUP BY a.article_id
    ORDER BY created_at DESC;
  `;

  return db.query(sqlQuery, queries).then(({ rows }) => {
    return rows;
  });
};

exports.selectArticleById = (articleId) => {
  const sqlQuery = `
    SELECT 
    a.article_id, a.title, a.topic, a.author, a.body, a.created_at, a.votes, COUNT(comment_id) :: INT AS comment_count, a.article_img_url
    FROM articles AS a
    LEFT JOIN comments AS c ON a.article_id = c.article_id
    WHERE a.article_id = $1
    GROUP BY a.article_id;
    `;

  return db.query(sqlQuery, [articleId]).then(({ rows }) => {
    if (!rows[0]) {
      return Promise.reject({
        status: 404,
        msg: "Id not found",
      });
    }
    return rows[0];
  });
};

exports.selectCommentsByArticleId = (articleId) => {
  const sqlQuery = `
    SELECT *
    FROM comments
    WHERE
    article_id = $1
    ORDER BY created_at DESC;`;

  return db.query(sqlQuery, [articleId]).then(({ rows }) => {
    return rows;
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

exports.updateArticleById = (articleId, { inc_votes: incrementVotes = 0 }) => {
  const sqlQuery = `
  UPDATE articles
  SET votes = votes + $1
  WHERE article_id = $2
  RETURNING *`;

  return db.query(sqlQuery, [incrementVotes, articleId]).then(({ rows }) => {
    if (!rows[0]) {
      return Promise.reject({
        status: 404,
        msg: "Id not found",
      });
    } else {
      return rows[0];
    }
  });
};
