const mongoose = require('mongoose');
const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"])
async function connectDB() {
    try{
        await mongoose.connect("mongodb+srv://shubham:todo1234@todo.dtrpiex.mongodb.net/trello");
        console.log("mongoDB connected");
    }catch(err) {
        console.error("connection error:", err);
    }
}

connectDB();

const userSchema = new mongoose.Schema({
    username: 'String',
    password: "String"
})

const orgSchema = new mongoose.Schema({
    orgName: "String",
    description: "String",
    admin: mongoose.Types.ObjectId, 
    member: [mongoose.Types.ObjectId]
})

const boardSchema = new mongoose.Schema({
    boardName: "String",
    organisationId: mongoose.Types.ObjectId
})

const taskSchema = new mongoose.Schema({
    description: "String",
    status: "String",
    userId: mongoose.Types.ObjectId
})

const userModel = mongoose.model("users", userSchema);
const orgModel = mongoose.model("organisations", orgSchema);
const boardModel = mongoose.model("boards", boardSchema);
const taskModel = mongoose.model("tasks", taskSchema);
module.exports = {
    userModel,
    orgModel,
    boardModel,
    taskModel
}