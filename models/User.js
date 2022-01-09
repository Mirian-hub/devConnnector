const mongoose = require('mongoose');
const router = require('../routes/api/users');

const UserSchema = mongoose.Schema({
    name: {
        type: String,
        require: router,
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('user', UserSchema)