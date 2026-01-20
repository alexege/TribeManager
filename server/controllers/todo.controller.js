import Todo from "../models/Todo.js";

/* ================================
   Create Todo
================================ */
export const createTodo = async (req, res) => {
  console.log("req.body:", req.body);
  try {
    const todo = await Todo.create(req.body);
    res.status(201).json(todo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ================================
   Get All Todos
================================ */
export const getAllTodos = async (req, res) => {
  try {
    const todos = await Todo.find()
    .sort({ createdAt: -1 })
    .populate("categories")
    .populate("author");
    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   Get Todo by ID
================================ */
export const getTodoById = async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id)
    // .populate("categories")
    // .populate("author")
    ;

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.json(todo);
  } catch (err) {
    res.status(400).json({ message: "Invalid ID" });
  }
};

/* ================================
   Update Todo
================================ */
export const updateTodoById = async (req, res) => {
  try {
    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
    .populate("categories")
    .populate("author");

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.json(todo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ================================
   Delete Todo
================================ */
export const deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.json({ message: "Todo deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ================================
   Delete All Todos
================================ */
export const deleteAllTodos = async (_req, res) => {
  try {
    await Todo.deleteMany();
    res.json({ message: "All todos deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// const Todo = require("../models/todo.model");
// const Category = require("../models/category.model");

// exports.createTodo = async (req, res) => {
//   //Create the new Todo Object using info from the req.body
//   const newTodo = new Todo({
//     title: req.body.title,
//     categories: [],
//     priority: req.body.priority,
//     completed: req.body.completed,
//     author: req.body.author,
//     createdAt: new Date(), //This fixes the Invalid Date problem
//   });

//   if (req.body.categories) {
//     for (const cat of req.body.categories) {
//       let value = await Category.findOne({ name: cat }).then((cat) =>
//         newTodo.categories.push(cat)
//       );
//     }
//     await newTodo.save(newTodo);
//   }
//   await res.status(200).send(newTodo);
// };

// exports.getAllTodos = (req, res) => {
//   Todo.find()
//     .populate("categories")
//     .populate("author")
//     .then((todos) => {
//       res.status(200).send(todos);
//     })
//     .catch((error) => {
//       console.log("error:", error);
//       res.status(500).send({ message: error });
//     });
// };

// exports.getTodoById = (req, res) => {
//   //Search database for a Todo that has an _id matching the id provided in the url(id)
//   Todo.findOne({ _id: req.params.id })
//     .then((todo) => {
//       res.send({ todo });
//     })
//     .catch((error) => {
//       console.log("error:", error);
//       res.status(500).send({ message: error });
//     });
// };

// exports.updateTodoById = (req, res) => {
//   console.log("updating todo by id: ", req.body);
//   console.log("updating todo by id: ", req.params._id);
//   //Updated Fields / Fields to Update
//   let updateData = {
//     title: req.body.title,
//     completed: req.body.completed,
//     priority: req.body.priority,
//   };

//   Todo.findByIdAndUpdate({ _id: req.params.id }, updateData)
//     .then((todo) => {
//       res.status(200).send({ todo });
//     })
//     .catch((error) => {
//       res.status(500).send({ message: error });
//     });
// };

// exports.deleteTodo = (req, res) => {
//   Todo.deleteOne({ _id: req.params.id })
//     .then(() => {
//       res.status(200).send({ message: "Todo deleted!" });
//     })
//     .catch((error) => {
//       res.status(500).send({ message: error });
//       return;
//     });
// };

// exports.deleteAllTodos = (req, res) => {
//   Todo.deleteMany()
//     .then(() => {
//       res.status(200).send({ message: "Delete all todos!" });
//     })
//     .catch((error) => {
//       res.status(500).send({ message: error });
//       return;
//     });
// };
