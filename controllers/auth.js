import UserModel from '../models/User.js'
import OrganisationModel from '../models/Organisation.js'
import UserOrganisationModel from '../models/UserOrganisation.js'
import generateRandomId from '../utils/generateRandomId.js';
import hashPassword from '../utils/hashPassword.js';
import generateJwt from '../utils/generateJWT.js';
import db from '../models/database.js';
import bcrypt from 'bcrypt';

const User = UserModel(db.sequelize);
const Organisation = OrganisationModel(db.sequelize);
const UserOrganisation = UserOrganisationModel(db.sequelize);

const register = async(req,res) => {

  try{  
    const {firstName, lastName, email, password, phone} = req.body;

    if(!firstName){
        return res.status(422).json({errors : [{field : 'firstName', message : 'First name is required'}]})
    }

    if(!lastName){
        return res.status(422).json({errors : [{field : 'lastName', message : 'Last name is required'}]})
    }

    if(!email){
        return res.status(422).json({errors : [{field : 'email', message : 'Email is required'}]})
    }

    if(!password){
        return res.status(422).json({errors : [{field : 'password', message : 'Password is required'}]})
    }

    const existingUser = await User.findOne({where : {email : email}})

    if(existingUser){
        return res.status(400).json({status : "Bad Request", message: "Registration Unsuccessful",statusCode : 400})
    }

    const id = await generateRandomId();

    const hashedPassword = await hashPassword(password);

    const createUser = await User.create({
        userId : id ,
        firstName : firstName ,
        lastName : lastName,
        email : email,
        password : hashedPassword,
        phone : phone
    })

    const organisationId = await generateRandomId();

    const createOrganisation = await Organisation.create({
        orgId : organisationId,
        name : `${firstName}'s Organisation`
    })

    const createUserOrganisation = await UserOrganisation.create({
        orgId : createOrganisation.orgId,
        userId : [id]
    })

    const jwtToken = await generateJwt(id);

    return res.status(201).json({status : 'success', message : 'Registration Successful', data : {accessToken : jwtToken, user : {userId : createUser.userId, firstName : createUser.firstName, lastName : createUser.lastName, email : createUser.email, phone : createUser.phone }}})

}catch(error){
    return res.status(400).json({status : "Bad Request", message: "Registration Unsuccessful",statusCode : 400})
}

}

const login = async (req,res) => {
    try {
        const { email, password } = req.body

        if(!email){
            return res.status(422).json({errors : [{field : 'email', message : 'email is required'}]})
        }

        if(!password){
            return res.status(422).json({errors : [{field : 'password', message : 'password is required'}]})
        }

        const existingUser = await User.findOne({where : {email : email}})

        if(!existingUser){
            return error
        }

        const passwordCorrect = await bcrypt.compare(
            password,
            existingUser.password
          );

        if (!passwordCorrect){
            return error
        }

        const jwtToken = await generateJwt(existingUser.userId);

        return res.status(200).json({status : 'success', message : 'Login Successful', data : {accessToken : jwtToken, user : {userId : existingUser.userId, firstName : existingUser.firstName, lastName : existingUser.lastName, email : existingUser.email, phone : existingUser.phone }}})

    } catch (error) {
        return res.status(401).json({status : "Bad Request", message: "Authentication Failed",statusCode : 401})
    }
}
export default {register,login};