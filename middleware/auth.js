module.exports = function (req, res, next) {
    res.locals.isTeacher=req.session.isTeacher
    if (!req.session.isAuthenticated) {
        return res.redirect('/auth/login')
    }
    next()
}