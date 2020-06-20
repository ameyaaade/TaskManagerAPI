const app = require('./app')
const port = process.env.PORT;

app.use(express.json());
app.use(userRouter) // need to register router 
app.use(taskRouter) 

app.listen(port, () => {
  console.log(`server is up on ${port} ...`);
});