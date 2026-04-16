const express = require('express');
const jwt = require('jsonwebtoken')
const {userModel, orgModel, boardModel, taskModel} = require('./model');

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

app.post('/add-member-to-organisation', authmiddleware, async (req,res)=>{
    const newMember = req.body.member;
    const newMemberUserId = await userModel.findOne({
        username: newMember
    })

    if(!newMemberUserId){
        res.status(404).json({
            message: "user not exist"
        })
    }

    const orgDetails = await orgModel.findOne({
        admin: req.userId
    })

    if(!orgDetails){
        res.status(404).json({
            message: "org not exits"
        })
    }

    const memberExistsInOrg = orgDetails?.member.includes(newMemberUserId._id);
    if(memberExistsInOrg){
        res.status(404).json({
            message: "Member already exists in org"
        })
    }

    orgDetails.member.push(newMemberUserId);

    await orgDetails.save()

    res.status(200).json({
        message: "Member added"
    })
})

app.delete('/delete-member-from-organisation', authmiddleware, async (req, res)=>{
    const deleteUser = req.body.username;

    const deleteUserId = await userModel.findOne({
        username: deleteUser
    })

    if(!deleteUserId){
        res.status(404).json({
            message: "user not exist"
        })
    }

    const orgDetails = await orgModel.findOne({
        admin: req.userId
    })

    if(!orgDetails){
        res.status(404).json({
            message: "org not exits"
        })
    }

    orgDetails.member = orgDetails?.member.filter(e => e.toString() !== deleteUserId._id.toString());

    await orgDetails.save()

    res.status(200).json({
        message: "Member deleted"
    })
})

app.post("/create-board", authmiddleware, async (req,res)=>{
    const boardName = req.body.boardName;

    const orgDetails = await orgModel.findOne({
        admin: req.userId
    });

    if(!orgDetails){
        res.status(404).json({
            message: "Organisation not exits"
        })
    }

    const newBoard = await boardModel.create({
        boardName,
        organisationId: orgDetails._id
    })

    res.status(200).json({
        boardId: newBoard._id,
        message: "board get created"
    })
})

app.post("/create-task", authMiddleware, async (req, res) => {
    const { description, status, boardId } = req.body;
 
    if (!description || !status || !boardId) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    const allowedStatus = ["Todo", "In Progress", "Done"];
    if (!allowedStatus.includes(status)) {
        return res.status(400).json({
            message: "Invalid status"
        });
    }
 
    const board = await boardModel.findById(boardId);
    if (!board) {
        return res.status(404).json({
            message: "Board not found"
        });
    }

    const taskExists = await taskModel.findOne({
        userId: req.userId,
        description,
        boardId
    });

    if (taskExists) {
        return res.status(403).json({
            message: "Task already exists in this board"
        });
    }

    const newTask = await taskModel.create({
        userId: req.userId,
        description,
        status,
        boardId
    });

    res.status(200).json({
        message: "Task created successfully",
        taskId: newTask._id
    });
});

app.put("/update-task", authMiddleware, async (req, res) => {
    const { taskId, status } = req.body;

    const allowedStatus = ["Todo", "In Progress", "Done"];
    if (!allowedStatus.includes(status)) {
        return res.status(400).json({
            message: "Invalid status"
        });
    }

    const task = await taskModel.findOne({
        _id: taskId,
        userId: req.userId
    });

    if (!task) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    task.status = status;
    await task.save();

    res.status(200).json({
        message: "Task updated successfully"
    });
});

app.delete("/delete-task", authMiddleware, async (req, res) => {
    const { taskId } = req.body;

    const task = await taskModel.findOne({
        _id: taskId,
        userId: req.userId
    });

    if (!task) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    await taskModel.deleteOne({ _id: taskId });

    res.status(200).json({
        message: "Task deleted successfully"
    });
});

app.listen(3000, ()=>{
    console.log('Server started')
})