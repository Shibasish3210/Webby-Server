import { hash, compare } from "bcrypt";

export const encrypt = async (password)=>{
    try {
        const encrypted = await hash(password, +process.env.SALT);
        
        return encrypted;
    } catch (error) {
        console.log(error);
        return null;
    }
}
export const decrypt = async (password, hashedPassword)=>{
    try {
        const decrypted = await compare(password, hashedPassword);
        
        return decrypted;
    } catch (error) {
        console.log(error);
        return null;
    }
}