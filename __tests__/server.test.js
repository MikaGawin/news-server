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
  describe("PATCH request", () => {
    test("200: should update the article in the database and return the updated article", () => {
      return request(app)
        .patch("/api/articles/1")
        .send({
          inc_votes: 15,
        })
        .expect(200)
        .then(({ body }) => {
          const { article } = body;
          expect(article).toMatchObject({
            article_id: 1,
            title: "Living in the shadow of a great man",
            topic: "mitch",
            author: "butter_bridge",
            body: "I find this existence challenging",
            created_at: "2020-07-09T20:11:00.000Z",
            votes: 115,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          });
        });
    });
    test("200: should ignore invalid fields and return the article as is if no valid fields are listed to patch", () => {
      return request(app)
        .patch("/api/articles/1")
        .send({
          invalid_field: 1233
        })
        .expect(200)
        .then(({ body }) => {
          const { article } = body;
          expect(article).toMatchObject({
            article_id: 1,
            title: "Living in the shadow of a great man",
            topic: "mitch",
            author: "butter_bridge",
            body: "I find this existence challenging",
            created_at: "2020-07-09T20:11:00.000Z",
            votes: 100,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          });
        });
    });
    test("400, should return 400, invalid request when given an invalid id", () => {
      return request(app)
        .patch("/api/articles/badRequest")
        .send({
          inc_votes: 10
        })
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Invalid request");
        });
    });
    test("404: should return 404, not found if given a valid but non existant id", () => {
      return request(app)
        .patch("/api/articles/666")
        .send({
          inc_votes: 10
        })
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Id not found");
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
  describe("POST request", () => {
    test("201: inserts a new comment on the article into the database and should return a copy of the comment added", () => {
      return request(app)
        .post("/api/articles/1/comments")
        .send({
          username: "icellusedkars",
          body: "This is my comment",
        })
        .expect(201)
        .then(({ body }) => {
          const { comment } = body;
          expect(comment).toMatchObject({
            article_id: 1,
            comment_id: expect.any(Number),
            author: "icellusedkars",
            body: "This is my comment",
            created_at: expect.any(String),
            votes: 0,
          });
        });
    });
    test("201: Should run as normal when given an additional unknown field in the body", () => {
      return request(app)
        .post("/api/articles/1/comments")
        .send({
          username: "icellusedkars",
          body: "This is my comment",
          unknownField: 123
        })
        .expect(201)
        .then(({ body }) => {
          const { comment } = body;
          expect(comment).toMatchObject({
            article_id: 1,
            comment_id: expect.any(Number),
            author: "icellusedkars",
            body: "This is my comment",
            created_at: expect.any(String),
            votes: 0,
          });
        });
    });
    test("404: returns an error if the username is not recognised", () => {
      return request(app)
        .post("/api/articles/1/comments")
        .send({
          username: "badUser",
          body: "This is my comment",
        })
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid selection");
        });
    });
    test("400, should return 400, invalid request when given an invalid id", () => {
      return request(app)
        .post("/api/articles/badRequest/comments")
        .send({
          username: "icellusedkars",
          body: "This is my comment",
        })
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Invalid request");
        });
    });
    test("404: returns an error if the article id does not exist", () => {
      return request(app)
        .post("/api/articles/666/comments")
        .send({
          username: "icellusedkars",
          body: "This is my comment",
        })
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid selection");
        });
    });
    test("400: returns an error if the username or comment body has not been supplied", () => {
      return request(app)
        .post("/api/articles/1/comments")
        .send({
          username: undefined,
          body: undefined,
        })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Incomplete body");
        });
    });
  });
});
