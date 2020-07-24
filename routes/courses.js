const { Router, response } = require('express');
const Course = require('../models/course');
const auth = require('../middleware/auth')
const { courseValidators } = require('../utils/validators')
const { validationResult } = require('express-validator')
const router = Router();
router.get('/', async (req, res) => {
    const courses = await Course.find().lean()
        .populate('userId', 'name email')
        .select('title price img');

    //console.log(courses)
    res.render('courses', {
        title: 'Курсы',
        isCourses: true,
        courses
    })
})

router.get('/:id/edit', auth, async (req, res) => {
    if (!req.query.allow) {
        return res.redirect('/')
    }

    const course = await Course.findById(req.params.id).lean();
    res.render('course-edit', {
        title: `Редактировать ${course.title}`,
        course
    })
})

router.post('/edit', auth, courseValidators, async (req, res) => {
    const { id } = req.body
    const errors = validationResult(req)
    const course = await Course.findById(req.body.id).lean();
    if (!errors.isEmpty()) {
        return res.status(422).render('course-edit', {
            title: 'Изменить курс',
            error: errors.array()[0].msg,
            course
        })
    }

    console.log(req.body)
    delete req.body.id
    await (await Course.findByIdAndUpdate(id, req.body));
    res.redirect('/courses')
})
router.get('/:id', async (req, res) => {

    const course = await Course.findById(req.params.id).lean();
    console.log('IMG', course);
    res.render('course', {
        layout: 'empty',
        title: `Курс ${course.title}`,
        course
    })
})

router.post("/remove", auth, async (req, res) => {
    try {
        await Course.deleteOne({ _id: req.body.id })
        res.redirect('/courses')
    } catch (error) {
        console.log(error)
    }
})

module.exports = router;