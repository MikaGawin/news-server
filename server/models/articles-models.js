const db = require("../../db/connection");

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
