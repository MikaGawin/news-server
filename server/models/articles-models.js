const db = require("../../db/connection");

exports.selectArticles = () => {
  const sqlQuery = `
    SELECT  a.article_id, title, a.author, topic, a.created_at, a.votes, article_img_url, COUNT(comment_id) :: INT AS comment_count
    FROM articles AS a
    LEFT JOIN comments 
    ON a.article_id = comments.article_id
    GROUP BY a.article_id
    ORDER BY created_at DESC;
    `;

  return db.query(sqlQuery).then(({ rows }) => {
    return rows;
  });
};

exports.selectArticleById = (articleId) => {
  const sqlQuery = `
    SELECT *
    FROM articles
    WHERE
    article_id = $1;`;

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
