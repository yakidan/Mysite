const { Router } = require('express')
const router = Router()
const Course = require('../models/course')
const course = require('../models/course')

function mapCartItems(cart) {
    return cart.items.map(c => ({
        ...c.courseId._doc,
        count: c.count
    }))
}
function computePrice(courses) {
    return courses.reduce((total, course) => {
        return total += course.price * course.count
    }, 0)
}
router.post('/add', async (req, res) => {
    console.log(req.body)
    const course = await Course.findById(req.body.id)
    await req.user.addToCart(course)
    res.redirect('/card')
})

router.delete('/remove/:id', async (req, res) => {
    console.log(req.params)
    await req.user.removeFromCart(req.params.id)
    const user = await req.user.populate('cart.items.courseId').execPopulate()

    const courses = mapCartItems(user.cart)
    const cart = {
        courses,
        price: computePrice(courses)
    }
    res.status(200).json(cart)
})
router.get('/', async (req, res) => {
    const user = await req.user
        .populate('cart.items.courseId')
        .execPopulate()


        
    const courses = mapCartItems(user.cart)

    res.render('card', {
        title: 'Корзина',
        isCard: true,
        courses: courses,
        price: computePrice(courses),
    })


})
module.exports = router;