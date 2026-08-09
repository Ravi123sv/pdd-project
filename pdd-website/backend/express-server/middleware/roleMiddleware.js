module.exports = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Authentication required for role verification." });
    }

    if (!allowedRoles.includes(req.user.role)) {
        console.warn(`[SECURITY] Access Denied for UID ${req.user.id}. Required: ${allowedRoles}, Current: ${req.user.role}`);
        return res.status(403).json({
            message: `Forbidden: This operation requires ${allowedRoles.join(' or ')} privileges.`
        });
    }

    next();
  };
};
