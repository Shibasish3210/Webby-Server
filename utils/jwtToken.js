import jwt from 'jsonwebtoken';

export const createToken = (email)=>{
    const token = jwt.sign(email, process.env.jwtSecret);

    return token;
}
export const createUserToken = (user)=>{
    const token = jwt.sign({...user}, process.env.jwtSecret);

    return token;
}

export const validateToken = (token) => {
    let user;
    jwt.verify(token, process.env.jwtSecret, (err, decoded)=>{
        if(err){
            user = null;
            console.log(err);
            return;
        }

        user = decoded;
    });
    return user;
}