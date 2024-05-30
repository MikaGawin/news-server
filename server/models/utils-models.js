const db = require("../../db/connection");
const format = require("pg-format");

exports.checkExists = (tableName, category, value, queryName) => {
  const sqlQuery = format(
    `SELECT * FROM %I WHERE %I = $1;`,
    tableName,
    category
  );

  return db.query(sqlQuery, [value]).then(({ rows }) => {
    if (!rows[0]) {
      return Promise.reject({
        status: 404,
        msg: `${queryName[0].toUpperCase()}${queryName.slice(1)} not found`,
      });
    }
  });
};
