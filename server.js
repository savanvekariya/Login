const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const {Pool,Client} = require('pg')

const initializePassport = require('./passport-config')
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)

const pool = new Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'postgres',
  password: '1234',
  port: 5432,
})


app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
  secret: '8374hy79hy312304yh87',
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/', checkAuthenticated, (req, res) => {
  res.render('index.ejs', { name: req.user.name })
})

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs')
})

app.post('/register',  async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    pool.query( 'INSERT INTO public.login (Username, Password) VALUES ("Username","Password")', (err, res) => {
      if (err) {
        console.log(err.stack)
      } else {
        console.log(res.rows)
      }
    })
    console.log(res.rows)
    res.redirect('/login')
  } catch {
    console.log('Errorrrrrrrrrrrrrrrrrrrrrrrrrr')
    res.redirect('/register')
  }
})

app.delete('/logout', (req, res) => {
  req.logOut()
  res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
  console.log('3................................checkAuthenticated');
  if (req.isAuthenticated()) {
    console.log('4................................checkAuthenticated');
    return next()
  }

  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  console.log('1..................checkNotAuthenticated');
  if (req.isAuthenticated()) {
    console.log('2......................checkNotAuthenticated');
    return res.redirect('/')
  }
  next()
}

app.listen(3000)