import express from 'express';
import bodyParser from'body-parser';
import db from '../models/database.js';
import apiRouter from '../routes/api.js'
import authRouter from '../routes/auth.js'

const app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

//code here
app.use('/api',apiRouter)
app.use('/auth',authRouter)
app.get('*', (req,res) => {
  return res.status(200).send('This route is not in use.')
})

// Synchronize models
const port = 8000;

db.sequelize.sync().then((req)=>{
  app.listen(port,()=>{
      console.log(`Server Started at port ${port}`)
  })
})

export default app;
