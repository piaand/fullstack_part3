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

//Generates a randonm integer from 0 to 9999
const generateRandId = () => {
	return Math.floor(Math.random() * Math.floor(10000))
}

app.get('/', (request, response) => {
	response.send('<h1>Hello World</h1>')
})

app.get('/api/persons', (request, response) => {
	Person.find({}).then(result => {
		response.json(result)
		mongoose.connection.close()
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

app.post('/api/persons', (request, response) => {
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

	const existPerson = persons.find(person => person.name === name)
	if(existPerson){
		return response.status(400).json({
			error: 'name must be unique'
		})
	}

	const id = generateRandId()
	const newPerson = {
		"name": name,
		"number": number,
		"id": id,
	}

	persons = persons.concat(newPerson)
	console.log(persons)
	response.json(newPerson)
})

app.delete('/api/persons/:id', (request, response) => {
	const id = Number(request.params.id)
	persons = persons.filter(person => person.id !== id)

	response.status(204).end()
})

const PORT = process.env.PORT
app.listen(PORT, () => {
	console.log(`Server running  ${PORT}`)
})
