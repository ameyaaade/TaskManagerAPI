// const mongodb = require("mongodb");
// const { MongoClient, ObjectID } = mongodb;

// const connectionURL = "mongodb://127.0.0.1:27017"; //use ip just in case
// const databaseName = "task-manager"; //anything

// MongoClient.connect(
//   connectionURL,
//   { useUnifiedTopology: true },
//   (error, client) => {
//     if (error) {
//       return console.log("Database connection failed !");
//     }
//     const db = client.db(databaseName); // getting database

//     db.collection('users').deleteOne({age:23})
//     .then(result=>{
//         console.log(result)
//     })
//     .catch(error=>{
//         console.log(error)
//     })
//   }
// );
