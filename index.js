require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')

morgan.token('body', function (req, res) { return JSON.stringify(req.body) });
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(express.static('build'))
app.use(express.json())
app.use(cors())

let persons = [
    {
      "name": "Arto Hellas",
      "number": "040-123456",
      "id": 1
    },
    {
      "name": "Ada Lovelace",
      "number": "39-44-5323523",
      "id": 2
    },
    {
      "name": "Dan Abramov",
      "number": "12-43-234345",
      "id": 3
    },
    {
      "name": "Mary Poppendieck",
      "number": "39-23-6423122",
      "id": 4
    }
  ]

const errorHandler = (error, request, response, next) => {
	console.log(error.message)

	if(error.name === 'CastError') {
		return response.status(204).send({ error: 'malformatted id' })
	}
	next(error)
}

app.get('/', (request, response) => {
	response.send('<h1>Hello World</h1>')
})

app.get('/api/persons', (request, response) => {
	Person.find({}).then(result => {
		console.log(result)
		response.json(result.map(person => person.toJSON()))
	  })
})

app.get('/info', (request, response) => {
	const len = persons.length
	const date = new Date()
	const text = `Phonebook has info for ${len} people`

	response.send(`<p>${text}<br><br>${date}</p>`)
})

app.get('/api/persons/:id', (request, response) => {
	const id = Number(request.params.id)
	const person = persons.find(person => person.id === id)
	if(!person) {
		return response.status(404).end();
	}

	response.json(person)
})

app.post('/api/persons', (request, response, next) => {
	const body = request.body
	if(!body) {
		return response.status(400).json({
			error: 'content missing'
		})
	}

	const name = body.name;
	const number  = body.number;
	if(!name | !number) {
		return response.status(400).json({
			error: 'name or number missing'
		})
	}

	/*
	//This needs to be modified so that ir works with db
	const existPerson = persons.find(person => person.name === name)
	if(existPerson){
		return response.status(400).json({
			error: 'name must be unique'
		})
	}
	*/

	const newPerson = new Person({
		"name": name,
		"number": number,
	})

	newPerson.save()
		.then(savedPerson => {
			response.json(savedPerson.toJSON())	
		})
		.catch(error => next(error))
	
})

//TODO: update the new phonenumber for given id
app.put('/api/persons/:id', (request, response, next) => {
	const body = request.body

	const newPerson = {
		name: body.name,
		number: body.number
	}

	Person.findByIdAndUpdate(request.params.id, newPerson, { new: true })
		.then(updatedPerson => {
			response.json(updatedPerson.toJSON())
		})
		.catch(error => next(error))

})

app.delete('/api/persons/:id', (request, response, next) => {
	Person.findByIdAndRemove(request.params.id)
		.then(results => {
			response.status(204).end()
		})
		.catch(error => next(error))
})

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
	console.log(`Server running  ${PORT}`)
})
