function authRole(req, res, next) {
    if (req.session.user.isAdmin !== 1) {
        return res.status(403).json({ message: 'Access Denied! You are not an admin' });
    }
    next();
}

export default authRole;