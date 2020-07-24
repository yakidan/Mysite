const { body } = require('express-validator/check')
const User = require('../models/user')
const bcrypt = require('bcryptjs')
exports.registerValidators = [
    body('email')
        .isEmail().withMessage('Введите корректный email')
        .custom(async (value, { req }) => {
            try {
                const user = await User.findOne({ email: value })
                if (user) {
                    return Promise.reject('Такой email уже занят')
                }
            } catch (e) {
                console.log(e)
            }
        })
        .normalizeEmail(),
    body('password', 'Пароль должен быть минимум 6 символов')
        .isLength({ min: 6, max: 50 })
        .isAlphanumeric()
        .trim(),
    body('confirm')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Пароли должны совпадать')
            }
            return true
        })
        .trim(),
    body('name')
        .isLength({ min: 3 })
        .withMessage('Имя должно быть минимум три символа')
        .trim()
]
exports.loginValidators = [
    body('email')
        .isEmail().withMessage('Введите корректный email')
        .custom(async (value, { req }) => {
            try {
                const user = await User.findOne({ email: value })
                if (!user) {
                    return Promise.reject('Такой email не существует')
                }
            } catch (e) {
                console.log(e)
            }
        })
        .normalizeEmail(),
    body('password')
        .trim()
        .custom(async (value, { req }) => {
            try {
                const candidate = await User.findOne({ email: req.body.email })
                const areSame = await bcrypt.compare(value, candidate.password)
                if (!areSame) {
                    return Promise.reject('Введен неверный пароль')
                }
            } catch (e) {
                console.log(e)
            }
        })

    ,

]
exports.courseValidators=[
    body('title').isLength({min:3}).withMessage('Минимальная длина названия 3 символа'),
    body('price').isNumeric().withMessage('ВВедите корректную цену'),
    body('img','Введите корректный URL картинки').isURL()

]
