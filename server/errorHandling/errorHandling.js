exports.invalidEndpoint = (req, res) => {
  res.status(404).send({ msg: "Endpoint does not exist" });
};

exports.handleCustomError = (err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
};

exports.invalidQuery = (err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Invalid request" });
  } else if (err.code === "23503") {
    res.status(404).send({ msg: "Invalid selection" });
  } else {
    next(err);
  }
};

exports.internalServerError = (err, req, res, next) => {
  console.log(err);
  res.status(500).send({ msg: "Internal server error" });
};
