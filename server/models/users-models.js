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
    if (!rows[0]) {
      return Promise.reject({
        status: 404,
        msg: "User not found",
      });
    } else {
      return rows[0];
    }
  });
};
