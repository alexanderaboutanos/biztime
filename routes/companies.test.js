/** @format */

// Tell Node that we're in test "mode"
process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testCompany;
beforeEach(async () => {
  const result = await db.query(
    `INSERT INTO companies (code, name, description) VALUES ('Apple', 'Apple Computer', 'Maker of OSX.') RETURNING  code, name, description`
  );
  testCompany = result.rows[0];
});

afterEach(async () => {
  await db.query(`DELETE FROM companies`);
});

afterAll(async () => {
  await db.end();
});

describe("GET /companies", () => {
  test("Get a list with one company", async () => {
    const res = await request(app).get("/companies");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ companies: [testCompany] });
  });
});

describe("GET /companies/:code", () => {
  test("Gets a single company", async () => {
    const res = await request(app).get(`/companies/${testCompany.code}`);
    expect(res.statusCode).toBe(200);
    testCompany.invoices = [];
    expect(res.body).toEqual({ company: testCompany });
  });
  test("Responds with 404 for invalid code", async () => {
    const res = await request(app).get(`/companies/invalid`);
    expect(res.statusCode).toBe(404);
  });
});

describe("POST /companies", () => {
  test("Creates a single company, tests slugify", async () => {
    const res = await request(app).post("/companies").send({
      code: "Turbo!",
      name: "Turbo Tax",
      description: "Great company for taxes",
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      company: {
        code: "turbo",
        name: "Turbo Tax",
        description: "Great company for taxes",
      },
    });
  });
});

// describe("PATCH /users/:id", () => {
//   test("Updates a single user", async () => {
//     const res = await request(app)
//       .patch(`/users/${testUser.id}`)
//       .send({ name: "BillyBob", type: "admin" });
//     expect(res.statusCode).toBe(200);
//     expect(res.body).toEqual({
//       user: { id: testUser.id, name: "BillyBob", type: "admin" },
//     });
//   });
//   test("Responds with 404 for invalid id", async () => {
//     const res = await request(app)
//       .patch(`/users/0`)
//       .send({ name: "BillyBob", type: "admin" });
//     expect(res.statusCode).toBe(404);
//   });
// });
// describe("DELETE /users/:id", () => {
//   test("Deletes a single user", async () => {
//     const res = await request(app).delete(`/users/${testUser.id}`);
//     expect(res.statusCode).toBe(200);
//     expect(res.body).toEqual({ msg: "DELETED!" });
//   });
// });
