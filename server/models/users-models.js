const db = require("../../db/connection");

exports.selectUsers = () => {
  const sqlQuery = `
    SELECT username, name, avatar_url
    FROM users;`;

  return db.query(sqlQuery).then(({ rows }) => {
    return rows;
  });
};
