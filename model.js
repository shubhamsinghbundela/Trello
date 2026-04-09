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

const userModel = mongoose.model("users", userSchema);

module.exports = {
    userModel: userModel
}