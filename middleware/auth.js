import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();


export function verifyToken(req, res, next) {
const authHeader = req.headers.authorization || req.headers.Authorization;
if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ message: 'Missing token' });
const token = authHeader.split(' ')[1];
try {
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.user = decoded; // contains id, username, role
next();
} catch (err) {
return res.status(403).json({ message: 'Invalid token' });
}
}


export function authorizeRoles(...allowed) {
return (req, res, next) => {
if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
if (!allowed.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
next();
};
}