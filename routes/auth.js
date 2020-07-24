const { Router } = require('express')
const bcrypt = require('bcryptjs')
const router = Router()
const User = require('../models/user')
const { validationResult } = require('express-validator/check')
const { registerValidators, loginValidators } = require('../utils/validators')
router.get('/login', async (req, res) => {
    res.render('auth/login', {
        title: 'Авторизация',
        isLogin: true,
        loginError: req.flash('loginError'),
        registerError: req.flash('registerError')
    })
})

router.post('/login', loginValidators, async (req, res) => {
    try {
        const { email, password } = req.body

        const candidate = await User.findOne({ email })
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            req.flash('loginError', errors.array()[0].msg)
            return res.status(422).redirect('/auth/login#login')
        }
        req.session.user = candidate
        req.session.isAuthenticated = true;
        req.session.isTeacher=candidate.isTeacher;
        req.session.save(err => {
            if (err) {
                throw err
            }
            res.redirect('/')
        })

    } catch (e) {
        console.log(e)
    }


})
router.get('/logout', async (req, res) => {

    req.session.destroy(() => {
        res.redirect('login#login')
    })

})

router.post('/register', registerValidators, async (req, res) => {
    try {
        const { email, password, name, code_teacher } = req.body

        const candidate = await User.findOne({ email })
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            req.flash('registerError', errors.array()[0].msg)
            return res.status(422).redirect('/auth/login#register')
        }
        console.log(email, name)
        const isTeacher = code_teacher == "teacher" ? true : false;
        const hashPassword = await bcrypt.hash(password, 10)
        const user = new User({
            email, name, password: hashPassword,isTeacher, cart: { items: [] }
        })
        await user.save()
        res.redirect('/auth/login#login')

    } catch (e) {
        console.log(e)
    }
})
module.exports = router