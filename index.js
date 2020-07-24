const express = require('express');
const path = require('path');
const csrf = require('csurf')
const flash = require('connect-flash')
const mongoose = require('mongoose')
const exphbs = require('express-handlebars');
const session = require('express-session')
const MongoStore = require('connect-mongodb-session')(session)
const { extname } = require('path');
const app = express();
const helmet = require('helmet')
const compression = require('compression')
const homeRoutes = require('./routes/home');
const addRoutes = require('./routes/add');
const coursesRoutes = require('./routes/courses');
const cardRoutes = require('./routes/card');
const ordersRoutes = require("./routes/orders")
const authRoutes = require("./routes/auth")
const profileRoutes = require('./routes/profile')
const varMiddleware = require('./middleware/variables')
const userMiddleware = require('./middleware/user')
const errorHandler = require('./middleware/error')
const fileMiddleware = require('./middleware/file')
const debugMiddleware=require('./middleware/debug')

const keys = require('./keys');


const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs'
});

const store = new MongoStore({
    collection: 'sessions',
    uri: keys.MONGODB_URI,
})

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs')
app.set('views', 'views')

app.use(express.static(path.join(__dirname, 'public')))
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: keys.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store
}))
app.use(fileMiddleware.single('avatar'))
app.use(csrf())
app.use(flash())
app.use(helmet())
app.use(compression())

app.use(varMiddleware)
app.use(userMiddleware)
app.use(debugMiddleware)

app.use('/', homeRoutes);
app.use('/add', addRoutes);
app.use('/courses', coursesRoutes);
app.use('/card', cardRoutes);
app.use('/orders', ordersRoutes);
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes)

app.use(errorHandler)
const PORT = process.env.PORT || 5000;

async function start() {
    try {
        await mongoose.connect(keys.MONGODB_URI, {
            useNewUrlParser: true,
            useFindAndModify: false,

        })

        
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        })

    } catch (e) {
        console.log(e)
    }

}
start();