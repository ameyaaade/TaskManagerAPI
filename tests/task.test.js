const request = require('supertest')
const app = require("../src/app");
const Task = require('../src/modals/task')
const {userOne,userOneId,setupDatabase,taskThree} = require('./fixtures/db');


beforeEach(setupDatabase)

test('should create task for user ',async () => {
    const response  = await request(app)
    .post('/tasks')
    .set("Authorization",`Bearer ${userOne.tokens[0].token}`)
    .send({
        description:"From my test"
    })
    .expect(201)
    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.completed).toBe(false)
})

test('should get the tasks for the user accessing the data only',async () => {
    const tasks = await request(app)
    .get('/tasks')
    .set("Authorization",`Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

    expect(tasks.body.length).toBe(2)
})

test("second useer should not be able to delete first user's tasks", async() => {
    await request(app)
    .delete(`/tasks/${taskThree._id}`)
    .set("Authorization",`Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(404)

    const task = await Task.findById(taskThree._id)
    expect(task).not.toBeNull()
})
