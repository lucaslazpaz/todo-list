const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const userExists = users.find((user) => user.username === username);
  if (!userExists) {
    return response.status(400).json({ error: "User doesn't exist" });
  }
  request.header.username = username;
  return next();
}

const getUser = (username) => {
  return users.find((user) => user.username === username);
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;  
  const userAlreadyExists = users.find((user) => user.username === username);
  if (userAlreadyExists) {
    return response.status(400).json({ error: "An user with this username already exists! "});
  }
  const user = {    
    id: uuidv4(),
    name,
    username,
    todos: []
  };
  users.push(user);
  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { todos } = getUser(username);
  return response.json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { title, deadline } = request.body;
  const user = getUser(username);
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  user.todos.push(todo);
  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request.headers;
  const { title, deadline } = request.body;
  const { todos } = getUser(username);
  const todo = todos.find((todo) => todo.id === id);
  if (!todo) {
    return response.status(404).json({ error: "TODO not found" });
  }
  todo.title = title;
  todo.deadline = deadline;
  return response.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request.headers;
  const { todos } = getUser(username);
  const todo = todos.find((todo) => todo.id === id);
  if (!todo) {
    return response.status(404).json({ error: "TODO not found" });
  }
  todo.done = true;
  return response.send(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request.headers;
  const { todos } = getUser(username);
  const todo = todos.find((todo) => todo.id === id);
  if (!todo) {
    return response.status(404).json({ error: "TODO not found" });
  }
  todos.splice(id, 1);
  return response.status(204).send();
});

module.exports = app;