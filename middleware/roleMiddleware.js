module.exports = function(allowedRoles = []) {
  return (req, res, next) => {
    // 1. Defend against running the role check out of order
    // This ensures authMiddleware has successfully verified the JWT and attached req.user first
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: 'Unauthorized - User profile missing or not logged in' });
    }

    // 2. Normalize inputs to array format for safety
    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    // 3. Open-gate pass if no roles were specified (fallback safety)
    if (rolesArray.length === 0) {
      return next();
    }

    // 4. Case-insensitive role comparison to avoid typographical blockages
    // e.g., matches user role 'admin' with allowed role 'Admin'
    const userRole = req.user.role.toLowerCase().trim();
    const isRoleAllowed = rolesArray
      .map(role => String(role).toLowerCase().trim())
      .includes(userRole);

    if (isRoleAllowed) {
      return next(); // Match found! Pass control to the controller
    }

    // 5. Explicitly deny access if user role does not match permissions
    return res.status(403).json({ 
      message: `Forbidden - Your account role (${req.user.role}) does not have access to this resource` 
    });
  };
};