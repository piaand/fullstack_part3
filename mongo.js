const mongoose = require('mongoose')

const args = process.argv.length

if (args<3) {
	console.log('give password as an argument')
	process.exit(1)
}

const password = process.argv[2]

const url =
`mongodb+srv://alexand:${password}@cluster0.acwb2.mongodb.net/phonebook?retryWrites=true`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })


const personSchema = new mongoose.Schema({
	name: String,
	number: String,
})

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
