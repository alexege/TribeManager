import express from "express";
import * as controller from "../controllers/todo.controller.js";

const router = express.Router();

router.post("/", controller.createTodo);
router.get("/", controller.getAllTodos);
router.get("/:id", controller.getTodoById);
router.put("/:id", controller.updateTodoById);
router.delete("/:id", controller.deleteTodo);
router.delete("/", controller.deleteAllTodos);

export default router;


// const controller = require("../controllers/todo.controller");

// export default todoRoutes = (app) => {
//   app.use((req, res, next) => {
//     res.header(
//       "Access-Control-Allow-Headers",
//       "x-access-token, Origin, Content-Type, Accept"
//     );
//     next();
//   });

//   //Add Todo
//   app.post("/api/todos", controller.createTodo);

//   //Get Todos
//   app.get("/api/todos", controller.getAllTodos);

//   //Get Todo by Id
//   app.get("/api/todos/:id", controller.getTodoById);

//   //Update Todo
//   app.put("/api/todos/:id", controller.updateTodoById);

//   //Delete Todo
//   app.delete("/api/todos/:id", controller.deleteTodo);

//   //Delete all Todos
//   app.delete("/api/todos/", controller.deleteAllTodos);
// };