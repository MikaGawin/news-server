const db = require('../../db/connection');

exports.selectArticleById = (articleId) => {
    const sqlQuery = `
    SELECT *
    FROM articles
    WHERE
    article_id = $1;`

    return db.query(sqlQuery, [articleId])
    .then(({rows}) => {
        return rows[0]
    })
};