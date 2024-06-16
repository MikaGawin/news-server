const {
  selectArticles,
  selectArticleById,
  updateArticleById,
  insertArticle,
  selectArticlesCount
} = require("../models/articles-models");

const { checkExists } = require("../models/utils-models");

exports.getArticles = (req, res, next) => {
  const queries = req.query;
  const articlesAndQueries = [];
  articlesAndQueries.push(selectArticles(queries));
  articlesAndQueries.push(selectArticlesCount(queries));
  if (queries.topic) {
    articlesAndQueries.push(
      checkExists("topics", "slug", queries.topic, "topic")
    );
  }
  Promise.all(articlesAndQueries)
    .then(([articles, articlesCount]) => {
      res.status(200).send({ articles, articlesCount });
    })
    .catch(next);
};
exports.getArticleById = (req, res, next) => {
  const { article_id: articleId } = req.params;
  selectArticleById(articleId)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};
exports.patchArticleById = (req, res, next) => {
  const updatedFields = req.body;
  const { article_id: articleId } = req.params;
  updateArticleById(articleId, updatedFields)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};
exports.postArticle = (req, res, next) => {
  const newArticle = req.body;
  insertArticle(newArticle)
    .then((article) => {
      res.status(201).send({ article });
    })
    .catch(next);
};
