const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

console.log('connecting to ', url)
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
	.then(result => {
		console.log('connected to MongoDB')
	})
	.catch((error) => {
		console.log('error connecting to MongoDB: ', error.message)
	})

const personSchema = new mongoose.Schema({
	name: String,
	number: String,
})

personSchema.set('toJSON', {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString()
		delete returnedObject._id
		delete returnedObject.__v
	}
})

module.exports = mongoose.model('Person', personSchema)

/*
const Person = mongoose.model('Person', personSchema)

if(args === 3) {
	Person.find({}).then(result => {
		console.log('phonebook:')
		result.forEach(person => {
			console.log(person)
		})
		mongoose.connection.close()
	  })
} else {
	const person = new Person({
		name: process.argv[3],
		number: process.argv[4]
	})

	person.save().then(response => {
		console.log(`added ${person.name} ${person.number} to phonebook`)
		mongoose.connection.close()
	})
}
*/