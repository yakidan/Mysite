const {Router} = require('express')
const Order = require('../models/order')
const auth=require('../middleware/auth')
const router = Router()

function sumPrice(o){
    let ans;
    console.log(o.courses)
    let array=o.courses
    o.courses.forEach(element => {
        if(element.course.price)
        ans+=element.course.price
    });
    console.log(ans)
    return ans
    o.courses.reduce((total, c) => {
        console.log(c.course.price)
      return total += (c.count * c.course.price);
    }, 0)
}
router.get('/',auth, async (req, res) => {
  try {
    const orders = await (await Order.find({'user.userId': req.user._id})
     .populate('user.userId'))

    res.render('orders', {
      isOrder: true,
      title: 'Заказы',
      orders: orders.map(o => {
         
        return {
          ...o.toJSON(),
          price:  o.courses.reduce((total, c) => {
             console.log(c)
          return total += (c.count * c.course.price);
        }, 0),
       
        }
      })
    })
  } catch (e) {
    console.log(e)
  }
})


router.post('/',auth, async (req, res) => {
  try {
    const user = await req.user
      .populate('cart.items.courseId')
      .execPopulate()

    const courses = user.cart.items.map(i => ({
      count: i.count,
      course: {...i.courseId._doc}
    }))

    const order = new Order({
      user: {
        name: req.user.name,
        userId: req.user
      },
      courses: courses
    })

    await order.save()
    await req.user.clearCart()

    res.redirect('/orders')
  } catch (e) {
    console.log(e)
  }
})

module.exports = router