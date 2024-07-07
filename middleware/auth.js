import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();


export default function authenticateToken(req, res, next) {
    try{
    const authHeader = req.headers['authorization'];


    if(!authHeader){
      return res.status(401).json({error : 'authorization is missing from headers'})
    }
  
  
    // Verify the token
    jwt.verify(authHeader, process.env.SECRET_KEY, (err, user) => {
      if (err) {
        return res.sendStatus(403).json({error :"Forbidden. Token is not valid"}); 
      }
      req.user = user;
      next();
    });

  
  }catch(err){
        return  res.status(401).json({error:"Unauthorized"});
    }
  }