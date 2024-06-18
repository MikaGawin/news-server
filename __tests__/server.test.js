const app = require(`../server/app`);
const db = require("../db/connection");
const data = require("../db/data/test-data");
const seed = require("../db/seeds/seed");
const request = require("supertest");
const endpointsGuide = require("../endpoints.json");
const comments = require("../db/data/test-data/comments");

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
  describe("POST request", () => {
    test("201: inserts a new topic into the database and returns a copy of the topic", () => {
      return request(app)
        .post("/api/topics")
        .send({
          slug: "topic name here",
          description: "description here",
        })
        .expect(201)
        .then(({ body }) => {
          const { topic } = body;
          expect(topic).toMatchObject({
            slug: "topic name here",
            description: "description here",
          });
        });
    });
    test("201: Should run as normal when given an additional unknown field in the body", () => {
      return request(app)
        .post("/api/topics")
        .send({
          slug: "topic name here",
          description: "description here",
          unknownField: "unknown",
        })
        .expect(201)
        .then(({ body }) => {
          const { topic } = body;
          expect(topic).toMatchObject({
            slug: "topic name here",
            description: "description here",
          });
        });
    });
    test("400: should return an error if the topic already exists", () => {
      return request(app)
        .post("/api/topics")
        .send({
          slug: "cats",
          description: "description here",
        })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Key already exists");
        });
    });
    describe("400: returns an error if missing reqiured fields", () => {
      test("slug missing", () => {
        return request(app)
          .post("/api/topics")
          .send({
            description: "slug is missing",
          })
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe("Incomplete body");
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
          expect(articles.length).toBe(10);
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
    test("200: articles should have the author_avatar and sample_body properties", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles.length).toBe(10);
          articles.forEach((article) => {
            expect(article).toMatchObject({
              author_avatar: expect.any(String),
              sample_body: expect.any(String),
            });
            expect(article.sample_body.length <= 100);
          });
          expect(articles).toBeSortedBy("created_at", {
            descending: true,
          });
        });
    });
  });
  describe("GET requests with queries", () => {
    describe("query by topic", () => {
      test("200: should return an array of articles with the requested topic to the client", () => {
        return request(app)
          .get("/api/articles?topic=mitch")
          .expect(200)
          .then(({ body }) => {
            const { articles } = body;
            expect(articles.length).toBe(10);
            articles.forEach((article) => {
              expect(article).toMatchObject({
                author: expect.any(String),
                title: expect.any(String),
                article_id: expect.any(Number),
                topic: "mitch",
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
      test("200: should return an empty array if the topic exists but there are no articles", () => {
        return request(app)
          .get("/api/articles?topic=paper")
          .expect(200)
          .then(({ body }) => {
            const { articles } = body;
            expect(articles.length).toBe(0);
          });
      });
      test("404: should return error if the topic does not exist", () => {
        return request(app)
          .get("/api/articles?topic=badquery")
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toBe("Topic not found");
          });
      });
    });
    describe("pagination queries", () => {
      test("articles should return the total count of articles", () => {
        return request(app)
          .get("/api/articles")
          .expect(200)
          .then(({ body }) => {
            const { articlesCount } = body;
            expect(articlesCount).toBe(13);
          });
      });
      test("articles should return the total count of articles with the current filter", () => {
        return request(app)
          .get("/api/articles?topic=mitch")
          .expect(200)
          .then(({ body }) => {
            const { articlesCount } = body;
            expect(articlesCount).toBe(12);
          });
      });
      test("should limit the number of results returned to the requested number", () => {
        return request(app)
          .get("/api/articles?limit=12")
          .expect(200)
          .then(({ body }) => {
            const { articles } = body;
            expect(articles.length).toBe(12);
          });
      });
      test("should allow you to specify what result to start from", () => {
        return request(app)
          .get("/api/articles?p=2")
          .expect(200)
          .then(({ body }) => {
            const { articles } = body;
            expect(articles.length).toBe(3);
            expect(articles[0]).toMatchObject({
              article_id: 8,
            });
            expect(articles).toBeSortedBy("created_at", {
              descending: true,
            });
          });
      });
      test("limit defaults to 10", () => {
        return request(app)
          .get("/api/articles")
          .expect(200)
          .then(({ body }) => {
            const { articles } = body;
            expect(articles.length).toBe(10);
          });
      });
      test("errors if limit is bad data type", () => {
        return request(app)
          .get("/api/articles?limit=badRequest")
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe("Invalid request");
          });
      });
      test("errors if page is a bad data type", () => {
        return request(app)
          .get("/api/articles?p=badRequest")
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe("Invalid request");
          });
      });
    });
    describe("order by", () => {
      const orderableColumns = [
        "author",
        "title",
        "article_id",
        "topic",
        "created_at",
        "votes",
        "article_img_url",
        "comment_count",
      ];
      orderableColumns.forEach((column) => {
        test(`200: should return an array sorted by ${column} in descending order`, () => {
          return request(app)
            .get(`/api/articles?sort_by=${column}`)
            .expect(200)
            .then(({ body }) => {
              const { articles } = body;
              expect(articles.length).toBe(10);
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
              expect(articles).toBeSortedBy(`${column}`, {
                descending: true,
              });
            });
        });
      });
      test("400: should return bad request if the user tries to sort by a non existant column", () => {
        return request(app)
          .get("/api/articles?sort_by=badRequest")
          .expect(400)
          .then(({ body }) => {
            const { msg } = body;
            expect(msg).toBe("Bad request");
          });
      });
      describe("order", () => {
        const orders = ["asc", "desc"];
        orders.forEach((order) => {
          test(`200: should return an array sorted by created at in ${order} order`, () => {
            return request(app)
              .get(`/api/articles?order=${order}`)
              .expect(200)
              .then(({ body }) => {
                const { articles } = body;
                expect(articles.length).toBe(10);
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
                expect(articles).toBeSortedBy(`created_at`, {
                  descending: order === "desc" ? true : false,
                });
              });
          });
          test("400: should return bad request if the user uses a bad sort order", () => {
            return request(app)
              .get("/api/articles?order=badRequest")
              .expect(400)
              .then(({ body }) => {
                const { msg } = body;
                expect(msg).toBe("Bad request");
              });
          });
        });
      });
      describe("multiple queries work togethor", () => {
        test("200, should correctly use multiple queries togethor without error", () => {
          return request(app)
            .get("/api/articles?sort_by=votes&order=asc&topic=mitch")
            .expect(200)
            .then(({ body }) => {
              const { articles } = body;
              expect(articles.length).toBe(10);
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
              expect(articles).toBeSortedBy("votes", {
                descending: false,
              });
            });
        });
      });
    });
  });
  describe("POST request", () => {
    test("201: inserts a new comment on the article into the database and should return a copy of the comment added", () => {
      return request(app)
        .post("/api/articles")
        .send({
          author: "icellusedkars",
          title: "Cats or dogs?",
          body: "Cats are worse than dogs",
          topic: "cats",
          article_img_url: "https://img.com",
        })
        .expect(201)
        .then(({ body }) => {
          const { article } = body;
          expect(article).toMatchObject({
            article_id: expect.any(Number),
            author: "icellusedkars",
            title: "Cats or dogs?",
            body: "Cats are worse than dogs",
            topic: "cats",
            article_img_url: "https://img.com",
            created_at: expect.any(String),
            votes: 0,
            comment_count: 0,
          });
        });
    });
    test("201: img url defaults if not provided", () => {
      return request(app)
        .post("/api/articles")
        .send({
          author: "icellusedkars",
          title: "Cats or dogs?",
          body: "Cats are worse than dogs",
          topic: "cats",
        })
        .expect(201)
        .then(({ body }) => {
          const { article } = body;
          expect(article).toMatchObject({
            article_img_url:
              "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700",
          });
        });
    });
    test("201: Should run as normal when given an additional unknown field in the body", () => {
      return request(app)
        .post("/api/articles")
        .send({
          author: "icellusedkars",
          title: "Cats or dogs?",
          body: "Cats are worse than dogs",
          topic: "cats",
          article_img_url: "https://img.com",
          unknownField: "unknown",
        })
        .expect(201)
        .then(({ body }) => {
          const { article } = body;
          expect(article).toMatchObject({
            article_id: expect.any(Number),
            author: "icellusedkars",
            title: "Cats or dogs?",
            body: "Cats are worse than dogs",
            topic: "cats",
            article_img_url: "https://img.com",
            created_at: expect.any(String),
            votes: 0,
            comment_count: 0,
          });
        });
    });
    test("404: returns an error if the username is not recognised", () => {
      return request(app)
        .post("/api/articles")
        .send({
          author: "unknownUser",
          title: "Cats or dogs?",
          body: "Cats are worse than dogs",
          topic: "cats",
          article_img_url: "https://img.com",
        })
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid selection");
        });
    });
    test("404: returns an error if the topic is not recognised", () => {
      return request(app)
        .post("/api/articles")
        .send({
          author: "unknownUser",
          title: "Cats or dogs?",
          body: "Cats are worse than dogs",
          topic: "unknownTopic",
          article_img_url: "https://img.com",
        })
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid selection");
        });
    });
    describe("400: returns an error if missing reqiured fields", () => {
      test("username missing", () => {
        return request(app)
          .post("/api/articles")
          .send({
            author: undefined,
            title: "Cats or dogs?",
            body: "Cats are worse than dogs",
            topic: "cats",
            article_img_url: "https://img.com",
          })
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe("Incomplete body");
          });
      });
      test("title missing", () => {
        return request(app)
          .post("/api/articles")
          .send({
            author: "unknownUser",
            title: undefined,
            body: "Cats are worse than dogs",
            topic: "cats",
            article_img_url: "https://img.com",
          })
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe("Incomplete body");
          });
      });
      test("body missing", () => {
        return request(app)
          .post("/api/articles")
          .send({
            author: "unknownUser",
            title: "Cats or dogs?",
            body: undefined,
            topic: "cats",
            article_img_url: "https://img.com",
          })
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe("Incomplete body");
          });
      });
      test("topic missing", () => {
        return request(app)
          .post("/api/articles")
          .send({
            author: "unknownUser",
            title: "Cats or dogs?",
            body: "Cats are worse than dogs",
            topic: undefined,
            article_img_url: "https://img.com",
          })
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe("Incomplete body");
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
            comment_count: 11,
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
          invalid_field: 1233,
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
    test("400, should return 400, bad request if inc_votes is not a valid data type", () => {
      return request(app)
        .patch("/api/articles/1")
        .send({
          inc_votes: "bad type",
        })
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Invalid request");
        });
    });
    test("400, should return 400, invalid request when given an invalid id", () => {
      return request(app)
        .patch("/api/articles/badRequest")
        .send({
          inc_votes: 10,
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
          inc_votes: 10,
        })
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Id not found");
        });
    });
  });
  describe("DELETE request", () => {
    test("204 deletes the requested article", () => {
      return request(app).delete("/api/articles/1").expect(204);
    });
    test("400 returns an error if the article id is invalid", () => {
      return request(app)
        .delete("/api/articles/badRequest")
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Invalid request");
        });
    });
    test("404 returns an error if the article id is valid but non existant", () => {
      return request(app)
        .delete("/api/articles/666")
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Article not found");
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
          expect(comments).toBeArrayOfSize(10);
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
  describe("GET request pagination", () => {
    describe("pagination queries", () => {
      test("articles should return the total count of articles", () => {
        return request(app)
          .get("/api/articles/1/comments")
          .expect(200)
          .then(({ body }) => {
            const { commentCount } = body;
            expect(commentCount).toBe(11);
          });
      });

      test("should limit the number of results returned to the requested number", () => {
        return request(app)
          .get("/api/articles/1/comments?limit=3")
          .expect(200)
          .then(({ body }) => {
            const { comments } = body;
            expect(comments.length).toBe(3);
          });
      });
      test("should allow you to specify what result to start from", () => {
        return request(app)
          .get("/api/articles/1/comments?p=2")
          .expect(200)
          .then(({ body }) => {
            const { comments } = body;
            expect(comments.length).toBe(1);
            expect(comments[0]).toMatchObject({
              comment_id: 9,
            });
          });
      });
      test("limit defaults to 10", () => {
        return request(app)
          .get("/api/articles/1/comments")
          .expect(200)
          .then(({ body }) => {
            const { comments } = body;
            expect(comments.length).toBe(10);
          });
      });
      test("errors if limit is bad data type", () => {
        return request(app)
          .get("/api/articles/1/comments?limit=badRequest")
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe("Invalid request");
          });
      });
      test("errors if page is a bad data type", () => {
        return request(app)
          .get("/api/articles/1/comments?p=badRequest")
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe("Invalid request");
          });
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
          unknownField: 123,
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
describe("/api/comments/:comment_id", () => {
  describe("DELETE request", () => {
    test("204 deletes selected comment and returns no content", () => {
      return request(app).delete("/api/comments/1").expect(204);
    });
    test("400, should return 400, invalid request when given an invalid id", () => {
      return request(app)
        .delete("/api/comments/badRequest")
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Invalid request");
        });
    });
    test("404: should return 404, not found if given a valid but non existant id", () => {
      return request(app)
        .delete("/api/comments/666")
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Id not found");
        });
    });
  });
  test("200: should update the article in the database and return the updated article", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({
        inc_votes: 15,
      })
      .expect(200)
      .then(({ body }) => {
        const { comment } = body;
        expect(comment).toMatchObject({
          body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
          votes: 31,
          author: "butter_bridge",
          article_id: 9,
          created_at: "2020-04-06T12:17:00.000Z",
        });
      });
  });
  test("200: should ignore invalid fields and return the article as is if no valid fields are listed to patch", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({
        invalid_field: 1233,
      })
      .expect(200)
      .then(({ body }) => {
        const { comment } = body;
        expect(comment).toMatchObject({
          body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
          votes: 16,
          author: "butter_bridge",
          article_id: 9,
          created_at: "2020-04-06T12:17:00.000Z",
        });
      });
  });
  test("400, should return 400, bad request if inc_votes is not a valid data type", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({
        inc_votes: "bad type",
      })
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Invalid request");
      });
  });
  test("400, should return 400, invalid request when given an invalid id", () => {
    return request(app)
      .patch("/api/comments/badRequest")
      .send({
        inc_votes: 10,
      })
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Invalid request");
      });
  });
  test("404: should return 404, not found if given a valid but non existant id", () => {
    return request(app)
      .patch("/api/comments/666")
      .send({
        inc_votes: 10,
      })
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Comment not found");
      });
  });
});
describe("/api/users", () => {
  describe("GET requests", () => {
    test("200: should return an array of users to the client", () => {
      return request(app)
        .get("/api/users")
        .expect(200)
        .then(({ body }) => {
          const { users } = body;
          expect(users.length).toBe(4);
          users.forEach((user) => {
            expect(user).toMatchObject({
              username: expect.any(String),
              name: expect.any(String),
              avatar_url: expect.any(String),
            });
          });
        });
    });
  });
});
describe("/api/users/:username", () => {
  describe("GET request", () => {
    test("200: should return the requested username to the client", () => {
      return request(app)
        .get("/api/users/butter_bridge")
        .expect(200)
        .then(({ body }) => {
          const { user } = body;
          expect(user).toMatchObject({
            username: "butter_bridge",
            name: "jonny",
            avatar_url:
              "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
          });
        });
    });
    test("404: should return 404, not found if given a valid but non existant username", () => {
      return request(app)
        .get("/api/users/unknown_user")
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("User not found");
        });
    });
  });
});
