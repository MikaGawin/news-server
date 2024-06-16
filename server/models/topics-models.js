const db = require("../../db/connection");

exports.selectTopics = () => {
  const sqlQuery = `
    SELECT slug, description
    FROM topics;`;

  return db.query(sqlQuery).then(({ rows }) => {
    return rows;
  });
};

exports.insertTopic = ({ slug, description }) => {
  if (!slug) {
    return Promise.reject({ status: 400, msg: "Incomplete body" });
  }
  const sqlQuery = `
  INSERT INTO topics
  (slug, description)
  VALUES
  ($1, $2)
  RETURNING *;`;

  const topicData = [slug, description];

  return db.query(sqlQuery, topicData).then(({ rows }) => {
    return rows[0];
  });
};
