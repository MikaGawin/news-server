const app = require(`../server/app`);
const db = require('../db/connection');
const data = require('../db/data/test-data');
const seed = require('../db/seeds/seed');
const request = require('supertest');

beforeEach(() => {
    return seed(data)
});

afterAll(() => {
    return db.end()
});


describe('/api/topics', () => {
    describe('GET requests', () => {
        test('200: should return an array of topics to the client', () => {
            return request(app)
            .get('/api/topicsss')
            .expect(200)
            .then(({body}) => {
                const {topics} = body;
                expect(topics.length).toBe(3);
                topics.forEach((topic) => {
                    expect(topic).toMatchObject({
                        slug: expect.any(String),
                        description: expect.any(String)
                    })
                })
            })
        });
    })
})