const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find(user => { return user.username === username })

  if (!user) {
    return response.status(404).json({ error: 'User not found.' })
  }

  request.user = user

  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const userExists = users.some(user => user.username === username)

  if (!userExists) {
    
  const newUser = {
      id: uuidv4(),
      name,
      username,
      todos: []
    }
 
    users.push(newUser)

    return response.status(201).json(newUser)
  } else {
    return response.status(400).json({error: 'User already exists.'})
  }
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(newTodo)

  return response.status(201).json(newTodo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params
  const { title, deadline } = request.body

  let todo = user.todos.find(item => { return item.id === id })

  if (todo !== undefined) {
    todo.title = title
    todo.deadline = deadline
  
    return response.json(todo)
  } else {
    return response.status(404).json({ error: 'Todo not exists.' })
  }
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  let todo = user.todos.find(item => { return item.id === id })

  if (todo !== undefined) {
    todo.done = true

    return response.json(todo)
  } else {
    return response.status(404).json({ error: 'Todo not exists.' })
  }
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const todo = user.todos.findIndex(item => { return item.id === id })

  if (todo !== -1) {
    user.todos.splice(todo, 1)

    return response.status(204).json(user.todos)
  } else {
    return response.status(404).json({ error: 'Todo not exists.' })
  }
});

module.exports = app;