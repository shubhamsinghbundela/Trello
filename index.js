const express = require('express');
const jwt = require('jsonwebtoken')
const {userModel, orgModel} = require('./model');

const {authmiddleware} = require('./middleware')

const app = express();

app.use(express.json())

app.post('/signup', async (req,res)=>{
    const username = req.body.username;
    const password = req.body.password;

    const userExists = await userModel.findOne({
        username: username
    })

    if(userExists){
        return res.status(403).json({
            message: "User already exists"
        })
    }

    const newUser = await userModel.create({
        username: username,
        password: password
    })

    res.status(200).json({
        id: newUser._id,
        message: "user get created"
    })
})

app.post('/signin', async (req,res)=>{
    const username = req.body.username;

    const userExists = await userModel.findOne({
        username: username
    })

    if(!userExists){
        return res.status(403).json({
            message: "user not found"
        })
    }

    const token = jwt.sign(
        {
            userId: userExists.id
        },
        "shubham123"
    )

    res.status(200).json({
        token
    })
})

app.post("/create-organisation", authmiddleware, async (req,res)=>{
    const orgName = req.body.orgName;
    const description = req.body.authmiddleware;

    const orgExist = await orgModel.findOne({
        orgName: orgName
    })

    if(orgExist){
        return res.status(403).json({
            message: "Organisation already exists"
        })
    }

    const newOrg = await orgModel.create({
        orgName: orgName,
        description: description,
        admin: req.userId,
        member: []
    })
    
    res.status(200).json({
        orgId: newOrg.id
    })
})

app.listen(3000, ()=>{
    console.log('Server started')
})