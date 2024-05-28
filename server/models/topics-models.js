const db = require('../../db/connection')

exports.selectTopics = () => {
    const sqlQuery = `
    Select slug, description
    FROM topics;`;

    return db.query(sqlQuery)
    .then(({rows}) => {
        return rows
    })
};