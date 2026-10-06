import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({
                message: "User not authenticated",
                success: false,
            })
        }
        const decode = jwt.verify(token, process.env.SECRET_KEY); // jwt.verify is sync, no need for await
        if (!decode) {
            return res.status(401).json({
                message: "Invalid token",
                success: false,
            })
        };
        req.id = decode.userId;
        next();
    } catch (error) {
        console.log(error);
        // FIX: this catch block was silently swallowing errors (e.g. expired/
        // malformed token, or req.cookies being undefined if cookie-parser
        // isn't set up). That let the request fall through to whatever
        // generic error handler you have in app.js, which is likely where
        // "Something is missing" is actually coming from.
        return res.status(401).json({
            message: "Invalid or expired token.",
            success: false,
        });
    }
}
export default isAuthenticated;