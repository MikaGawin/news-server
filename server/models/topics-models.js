const db = require("../../db/connection");

exports.selectTopics = () => {
  const sqlQuery = `
    SELECT slug, description
    FROM topics;`;

  return db.query(sqlQuery).then(({ rows }) => {
    return rows;
  });
};
