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
  test("GET 404: should return a 404 if the endpoint does not exist", () => {
    return request(app)
    .get("/api/deletedEndpoint")
    .expect(404);
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
