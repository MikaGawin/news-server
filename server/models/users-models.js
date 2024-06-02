const db = require("../../db/connection");

exports.selectUsers = () => {
  const sqlQuery = `
    SELECT username, name, avatar_url
    FROM users;`;

  return db.query(sqlQuery).then(({ rows }) => {
    return rows;
  });
};

exports.selectUserByUsername = (username) => {
  const sqlQuery = `
  SELECT username, name, avatar_url
  FROM users
  WHERE username = $1;`;

  return db.query(sqlQuery, [username]).then(({ rows }) => {
    return rows[0];
  });
};
