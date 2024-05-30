const db = require("../../db/connection");

exports.checkExists = (tableName, category, value) => {
  const sqlQuery = `SELECT * FROM $1 WHERE $2 = $3;`;

  return db.query(sqlQuery, [tableName, category, value]).then(({ rows }) => {
    if (!rows) {
      return Promise.reject({
        status: 400,
        msg: `${category[0].toUpperCase}${category.slice(1)} not found`,
      });
    }
  });
};
