import validator from "validator";
import { router } from "../app.js";
import { createUserAndSave, deleteUser, emailExist, updateEmailVerified, usernameExist } from "../model/userModel.js";
import { validateRegistration } from "../utils/cleanupAndValidate.js";
import { createToken, createUserToken, validateToken } from "../utils/jwtToken.js";
import { sendEmail } from "../utils/nodeMailer.js";
import { decrypt, encrypt } from "../utils/password.js";
import isAuth from '../middlewares/isAuth.js'

const authRoute = router();


authRoute.get('/authenticate',isAuth, (req, res) => {

    res.send({
        status: 200,
        message: 'Authentication successful',
        user: req.user
    })
})

authRoute.post('/register', async ( req, res )=>{
    const { name, email, password, userName, avatar } = req.body;

    try {
        await validateRegistration({name, email, password, userName});
    } catch (error) {
        return res.send({
            status: 400,
            message: error
        })
    }

    if(await usernameExist(userName)){
        return res.send({
            status: 400,
            message: 'Username already exists'
        })
    };
    if(await emailExist(email)){
        return res.send({
            status: 400,
            message: 'Email already exists'
        })
    };

    const hashedPassword = await encrypt(password);
    if(!hashedPassword) {
        return res.send({
            status: 500,
            message: 'Server ERROR'
        })
    }

    const jwtToken = createToken(email);
    if(!createUserAndSave({name, email, password:hashedPassword, userName})){
        return res.send({
            status: 500,
            message: 'Server ERROR'
        })
    }
    // if(!){
    //     return res.send({
    //         status: 500,
    //         message: 'Error sending verification email'
    //     })
    // }
    sendEmail(email, jwtToken);

    res.send({
        status: 201,
        message: 'Registration successful'
    })
})

authRoute.get('/verify/:token', async (req, res) => {
    const token = req.params.token;
    const error = {
        status: 500,
        message: 'Internal Server Error'
    };

    let email = validateToken(token)
    if(!email){
        res.send(error)
    }

    const response = await updateEmailVerified(email);
    if(!response){
        res.send(error);
    }


    res.send({
        status: 200,
        message: 'Successfully verified'
    })
})

authRoute.post('/login', async (req, res) => {
    const { loginId, password } = req.body;

    let user;
    if(validator.isEmail(loginId)){
        user = await emailExist(loginId);
        if(!user){
            return res.send({
                status: 400,
                message: `Email doesn't exist`
            })
        } 
    }else{
        user = await usernameExist(loginId);
        if(!user){
            return res.send({
                status: 400,
                message: `Username doesn't exist`
            })
        }
    }

    if(!user.emailVerified){
        return res.send({
            status: 400,
            message: 'Please Verify Your Email Before Logging In'
        })
    }
    
    const isMatching = await decrypt(password, user.password);
    if(!isMatching){
        return res.send({
            status: 400,
            message: `Wrong Password`
        })
    }

    const clientUser = {
        email:user.email,
        userName: user.userName,
        userId: user._id,
        avatar: user.avatar
    }
    const USER_TOKEN = createUserToken(clientUser);

    res.send({
        status: 200,
        message: 'Login successful',
        user: clientUser,
        accessToken: USER_TOKEN
    })
})

authRoute.delete('/delete', isAuth, async (req, res) => {
    const { email, password } = req.query;
    const errorObj = {
        status: 400,
    };
    const userId = req.user.userId;

    if(!email || !password) {
        errorObj.message = 'Missing credentials';
        return res.send(errorObj);
    }
    
    //checking if the user entered correct email
    const userDB = await emailExist(email);
    if(!userDB || userDB._id.toString() !== userId){
        errorObj.message = `Wrong email address`;
        return res.send(errorObj);
    } 

    //checking if the user entered correct password
    const isMatching = await decrypt(password, userDB.password);
    if(!isMatching){
        errorObj.message = `Wrong Password`;
        return res.send(errorObj);
    }

    const deletedUser = await deleteUser(userId);

    if(!deletedUser){
        res.send({
            status: 500,
            message: 'Internal Server Error',
        })
    }

    res.send({
        status: 200,
        message: 'Account Deleted Successfully',
    })
})


export default authRoute;