const request = require("supertest");
const app = require("../src/app");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../src/modals/user");
const { use } = require("../src/app");
const {userOne,userOneId,setupDatabase} = require('./fixtures/db')

beforeEach(setupDatabase);

test("should signup a new user", async () => {
  const response = await request(app)
    .post("/users")
    .send({
      name: "someone",
      email: "someone@gmail.com",
      password: "firstfirst",
    })
    .expect(201);

    //Assert that the database was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    //Assertions about the response
    expect(response.body).toMatchObject({
      user:{
        name: "someone",
        email: "someone@gmail.com",
      },
      token:user.tokens[0].token
    })

    expect(user.password).not.toBe("firstfirst")
});

test("should login existing user", async () => {
const response = await request(app)
    .post("/users/login")
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200);
    const user = await User.findById(response.body.user._id)
    expect(response.body.token).toBe(user.tokens[1].token)
});

test("should not login non existing user", async () => {
  await request(app)
    .post("/users/login")
    .send({
      email: userOne.email,
      password: "something",
    })
    .expect(400);
});

test("should get profile for user ", async () => {
  await request(app)
  .get("/users/me")
  .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
  .send()
  .expect(200);
});

test('should not get profile for unauthenticate user',async () => {
    await request(app)
    .get('/users/me')
    .send()
    .expect(401)
})

test('should delete account for user',async () => {
   const response = await request(app)
    .delete('/users/me')
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
    const user = await User.findById(response.body._id)
    expect(user).toBeNull()
})

test('should not delete account when user is not authenticated ',async () => {
    await request(app)
    .delete('/users/me')
    .send()
    .expect(401)
})

test('should upload avatar image ', async() => {
  await request(app)
  .post('/users/me/avatar')
  .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
  .attach('avatar','tests/fixtures/profile-pic.jpg')
  .expect(200)

  const user = await User.findById(userOne._id)
  expect(user.avatar).toEqual(expect.any(Buffer))
})

test('should update valid user field', async() => {
    await request(app)
    .patch('/users/me')
    .set("Authorization",`Bearer ${userOne.tokens[0].token}`)
    .send({name:"not mike"})
    .expect(200)

    const user = await User.findById(userOne._id)
    expect(user.name).toBe("not mike")
})

test('should not update invalid user field', async() => {
  await request(app)
    .patch('/users/me')
    .set("Authorization",`Bearer ${userOne.tokens[0].token}`)
    .send({location:"location"})
    .expect(400)
})
