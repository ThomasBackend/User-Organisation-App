import UserModel from '../models/User.js'
import OrganisationModel from '../models/Organisation.js'
import UserOrganisationModel from '../models/UserOrganisation.js'
import generateRandomId from '../utils/generateRandomId.js';
import db from '../models/database.js';
import { Op } from 'sequelize';
import Sequelize from 'sequelize';

const User = UserModel(db.sequelize);
const Organisation = OrganisationModel(db.sequelize);
const UserOrganisation = UserOrganisationModel(db.sequelize);



const getUserRecord = async (req,res) => {
    try {
        const {id} = req.params;

        const user = req.user.userId;

        if (id == user){
            const userRecord = await User.findOne({where : {userId : id}})

            return res.status(200).json({status : 'success', message : 'User Record Found', data : { user : {userId : userRecord.userId, firstName : userRecord.firstName, lastName : userRecord.lastName, email : userRecord.email, phone : userRecord.phone }}})
        }

        const userOrgRecord = await UserOrganisation.findOne({where : {
            userId : {[Op.contains]: [id, user]}
        }});

        if(!userOrgRecord){
            return error;
        }

        const userRecord = await User.findOne({where : {userId : id}})

        return res.status(200).json({status : 'success', message : 'User Record Found', data : { user : {userId : userRecord.userId, firstName : userRecord.firstName, lastName : userRecord.lastName, email : userRecord.email, phone : userRecord.phone }}})

    } catch (error) {
        return res.status(400).json({status : "Bad Request", message: "Client Error",statusCode : 400})
    }
}

const getAllOrganisations = async (req,res) => {
    try {

        const user = req.user.userId;

        const userOrgRecord = await UserOrganisation.findAll({where : {
           userId : {[Op.contains]: [user]}
        },
       attributes : ['orgId']});

       if(!userOrgRecord){
        return error;
       }

       const organisations = [];

       const loadOrganisations = userOrgRecord.map(async record => {
        const org = await Organisation.findOne({where : {orgId : record.orgId}})

        const data = {
            orgId : org.orgId,
            name : org.name,
            description : org.description
        }
        organisations.push(data);
       })

       await Promise.all(loadOrganisations);

       return res.status(200).json({status : 'success', message : 'Organisations Fetched Successfully', data : { organisations }})
        
    } catch (error) {
        
        return res.status(400).json({status : "Bad Request", message: "Client Error",statusCode : 400})
    }
}

const getOrganisationRecord = async (req,res) =>{
    try {
        const { orgId } = req.params

        const user = req.user.userId;

        const existingOrganisation = await Organisation.findOne({where : {orgId : orgId}})

        if(!existingOrganisation){
            return res.status(400).json({status : "Bad Request", message: "No organisation exists with this ID",statusCode : 400})
        }

        const existingUserOrg = await UserOrganisation.findOne({where : {orgId: orgId,userId : {[Op.contains]: [user]} }})

        if(!existingUserOrg){
            return res.status(400).json({status : "Bad Request", message: "You do not belong to this organisation",statusCode : 400})
        }

        return res.status(200).json({status : 'success', message : 'Organisation Record Found', data : { orgId : existingOrganisation.orgId,  name : existingOrganisation.name, description : existingOrganisation.description }})


    } catch (error) {
        return res.status(400).json({status : "Bad Request", message: "Client Error",statusCode : 400})
    }
}

const createNewOrganisation = async (req,res) => {
    try {

        const {name, description} = req.body

        const user = req.user.userId;

        if(!name){
            return res.status(422).json({errors : [{field : 'name', message : 'Name is required'}]})
        }

        const organisationId = await generateRandomId();

        const createOrganisation = await Organisation.create({
            orgId : organisationId,
            name : name,
            description : description
        })
    
        const createUserOrganisation = await UserOrganisation.create({
            orgId : organisationId,
            userId : [user]                                                                                                                                                                                                                                           
        })

        return res.status(201).json({status : 'success', message : 'Organisation Created Successfully', data : { orgId : createOrganisation.orgId,  name : createOrganisation.name, description : createOrganisation.description }})
        
    } catch (error) {
        return res.status(400).json({status : "Bad Request", message: "Client Error",statusCode : 400})
    }
}

const addUserToAnOrganisation = async (req,res) => {
    try {
        const {orgId} = req.params;
        const {userId} = req.body;

        if(!userId){
            return res.status(422).json({errors : [{field : 'userId', message : 'User ID is required'}]})
        }

        const orgExist = await Organisation.findOne({where: {orgId : orgId}})
        if(!orgExist){
            return error;
        }
        const userExist = await User.findOne({where : {userId : userId}})

        if(!userExist){
            return error;
        }

        const existingUserOrg = await UserOrganisation.findOne({where : {orgId: orgId,userId : {[Op.contains]: [userId]} }})
        if(existingUserOrg){
            return res.status(200).json({status : 'success', message : 'User Added To Organisation SUccessfully'}
        }

        const query = `
            UPDATE "userorganisations"
            SET "userId" = "userId" || ARRAY[:userId]
            WHERE "orgId" = :orgId;
            `;

        const  addUserToOrg = await db.sequelize.query(query, {
            replacements: { userId: [userId], orgId: orgId },
            type: Sequelize.QueryTypes.UPDATE
            });

        return res.status(200).json({status : 'success', message : 'User Added To Organisation SUccessfully'})

    } catch (error) {
        return res.status(400).json({status : "Bad Request", message: "Client Error",statusCode : 400})
    }
}

export default {getUserRecord, getAllOrganisations, getOrganisationRecord, createNewOrganisation , addUserToAnOrganisation };
