require('dotenv').config()
const express = require('express')
var cors = require('cors')
var fs = require('fs')
var https = require('https')
const session = require('express-session')
const mongoose = require('mongoose')
mongoose.plugin(schema => { schema.options.usePushEach = true });

const auth = require('./routes/auth')
const catalog = require('./routes/catalog')
const user = require('./routes/user')

const app = express()
const port = process.env.PORT || 3540
const environment = process.env.NODE_ENV || 'development'
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cognito'

mongoose
    .connect(MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(console.log(`MongoDB connected ${MONGO_URI}`))
    .catch(err => console.log(err))

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.use('/api/auth', auth)
app.use('/api/catalog', catalog)
app.use('/api/user', user)

app.get('/', (req, res) => res.send('Cognito API'))

app.listen(3750, () => console.log(
  `Cognitio (${environment}) listening on ${port}!`)
)
