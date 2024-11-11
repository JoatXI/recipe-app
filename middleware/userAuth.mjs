function authUSer(req, res, next) {
    if (req.session.user == null) {
        return res.status(403).json({ message: 'Unauthorized access! You need to sign in' });
    }
    next();
}

export default authUSer;