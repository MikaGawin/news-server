const { selectApi } = require("../models/api-models");

exports.getApi = (req, res, next) => {
  selectApi()
    .then((endpoints) => {
      res.status(200).send({ endpoints });
    })
    .catch(next);
};
