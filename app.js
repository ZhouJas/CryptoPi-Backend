const express = require('express')
var cors = require('cors')
var fs = require('fs')
var https = require('https')
const session = require('express-session')
const mongoose = require('mongoose')
mongoose.plugin(schema => { schema.options.usePushEach = true });

const auth = require('./routes/auth')
const transactions = require('./routes/TransactionRoutes')
const userDetails = require('./routes/UserDetailRoutes')

const app = express()
const port = 8080
const environment = 'development'
const MONGO_URI = 'mongodb://localhost/cryptopi'

mongoose
    .connect(MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(console.log(`MongoDB connected ${MONGO_URI}`))
    .catch(err => console.log(err))

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.use('/api/transactions', transactions)
app.use('/api/userDetails', userDetails)

app.get('/', (req, res) => res.send('CryptoPi API'))

app.listen(port, () => console.log(
  `CryptoPi (${environment}) listening on ${port}!`)
)
