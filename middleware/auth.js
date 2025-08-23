exports.isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) return next();
  req.flash('error', 'You must be logged in.');
  res.redirect('/auth/login');
};

exports.hasRole = (role) => (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === role) return next();
  req.flash('error', 'Access denied.');
  res.redirect('/');
};
