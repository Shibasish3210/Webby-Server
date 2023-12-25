import { validateToken } from "../utils/jwtToken.js";

const errorObj = {
    status: 400,
    message: "Please Login First",
};

const isAuth = (req, res, next)=>{
    const TOKEN = req?.cookies?.USER_TOKEN;

    if(!TOKEN) return res.send(errorObj);

    const user = validateToken(TOKEN);
    
    if(user){
        req.user = user;
        next();
    }else{
        return res.send(errorObj);
    }


}

export default isAuth;