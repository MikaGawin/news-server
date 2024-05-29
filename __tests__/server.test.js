const app = require(`../server/app`);
const db = require("../db/connection");
const data = require("../db/data/test-data");
const seed = require("../db/seeds/seed");
const request = require("supertest");
const endpointsGuide = require("../endpoints.json");

beforeEach(() => {
  return seed(data);
});

afterAll(() => {
  return db.end();
});

describe("general errors", () => {
  test("GET 404: should return a 404 and relevant message if the endpoint does not exist", () => {
    return request(app)
      .get("/api/deletedEndpoint")
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Endpoint does not exist");
      });
  });
});

describe("/api", () => {
  test("Get 200: should return an object containing the available endpoints", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        const { endpoints } = body;
        expect(endpoints).toEqual(endpointsGuide);
      });
  });
});

describe("/api/topics", () => {
  describe("GET requests", () => {
    test("200: should return an array of topics to the client", () => {
      return request(app)
        .get("/api/topics")
        .expect(200)
        .then(({ body }) => {
          const { topics } = body;
          expect(topics.length).toBe(3);
          topics.forEach((topic) => {
            expect(topic).toMatchObject({
              slug: expect.any(String),
              description: expect.any(String),
            });
          });
        });
    });
  });
});

describe("/api/articles", () => {
  describe("GET requests", () => {
    test("200: should return an array of articles to the client", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles.length).toBe(13);
          articles.forEach((article) => {
            expect(article).toMatchObject({
              author: expect.any(String),
              title: expect.any(String),
              article_id: expect.any(Number),
              topic: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              article_img_url: expect.any(String),
              comment_count: expect.any(Number),
            });
          });
          expect(articles).toBeSortedBy("created_at", {
            descending: true,
          });
        });
    });
  });
});

describe("/api/articles/:article_id", () => {
  describe("GET request", () => {
    test("200: should return the requested article to the client", () => {
      return request(app)
        .get("/api/articles/1")
        .expect(200)
        .then(({ body }) => {
          const { article } = body;
          const articleOne = {
            article_id: 1,
            title: "Living in the shadow of a great man",
            topic: "mitch",
            author: "butter_bridge",
            body: "I find this existence challenging",
            created_at: "2020-07-09T20:11:00.000Z",
            votes: 100,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          };
          expect(article).toMatchObject(articleOne);
        });
    });
    test("404: should return 404, not found if given a valid but non existant id", () => {
      return request(app)
        .get("/api/articles/666")
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Id not found");
        });
    });
    test("400, should return 400, invalid request when given an invalid id", () => {
      return request(app)
        .get("/api/articles/badRequest")
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Invalid request");
        });
    });
  });
});

describe("/api/articles/:article_id/comments", () => {
  describe("GET request", () => {
    test("200: should return the an array of comments for the requested article", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then(({ body }) => {
          const { comments } = body;
          expect(comments).toBeArrayOfSize(11);
          comments.forEach((comment) => {
            expect(comment).toMatchObject({
              comment_id: expect.any(Number),
              votes: expect.any(Number),
              created_at: expect.any(String),
              author: expect.any(String),
              body: expect.any(String),
              article_id: 1,
            });
          });
          expect(comments).toBeSortedBy("created_at", {
            descending: true,
          });
        });
    });
    test("200: should return the an empty array if the article exists but has not comments", () => {
      return request(app)
        .get("/api/articles/2/comments")
        .expect(200)
        .then(({ body }) => {
          const { comments } = body;
          expect(comments).toBeArrayOfSize(0);
        });
    });
    test("404: should return 404, not found if given a valid but non existant id", () => {
      return request(app)
        .get("/api/articles/666/comments")
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Id not found");
        });
    });
    test("400, should return 400, invalid request when given an invalid id", () => {
      return request(app)
        .get("/api/articles/badRequest/comments")
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Invalid request");
        });
    });
  });
});
