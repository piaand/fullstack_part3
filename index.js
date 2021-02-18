require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')

morgan.token('body', function (req) { return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(express.static('build'))
app.use(express.json())
app.use(cors())

const errorHandler = (error, request, response, next) => {
	console.log(error.message)

	if(error.name === 'CastError') {
		return response.status(404).send({ error: 'malformatted id' })
	}
	if(error.name === 'ValidationError') {
		return response.status(400).send({ error: error.message })
	}
	next(error)
}

app.get('/', (request, response) => {
	response.send('<h1>Hello World</h1>')
})

app.get('/api/persons', (request, response) => {
	Person.find({}).then(result => {
		response.json(result.map(person => person.toJSON()))
	})
})

app.get('/info', (request, response, next) => {
	Person.estimatedDocumentCount()
		.then(len => {
			if(len) {
				const date = new Date()
				const text = `Phonebook has info for ${len} people`
				response.send(`<p>${text}<br><br>${date}</p>`)
			}
		})
		.catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
	Person.findById(request.params.id)
		.then(result => {
			if(result) {
				response.json(result.toJSON())
			} else {
				return response.status(404).end()
			}
		})
		.catch(error => next(error))
})

//Adds a new user. If user already exists, frontend recognizes calls a PUT
app.post('/api/persons', (request, response, next) => {
	const body = request.body
	if(!body) {
		return response.status(400).json({
			error: 'content missing'
		})
	}

	const newPerson = new Person({
		'name': body.name,
		'number': body.number,
	})

	newPerson.save()
		.then(savedPerson => {
			response.json(savedPerson.toJSON())
		})
		.catch(error => next(error))

})

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
			console.log(results)
			response.status(204).end()
		})
		.catch(error => next(error))
})

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
	console.log(`Server running  ${PORT}`)
})
