const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator')
const Schema = mongoose.Schema

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    displayName: {
        type: String,
        required: true
    },
    clientCodes: {
        type: String,
        required: false
    }
}, { timestamps: true })


userSchema.statics.findOrCreate = async function findOrCreate(condition, doc) {
    const self = this;
    const result = await self.findOne(condition);
  
    return result || self.create(doc);
};
  

//static login method
userSchema.statics.login = async function(profile, clientCodes){
    try{
        const user = await this.findOrCreate({ email: profile.email, lastName: profile.displayName, clientCodes: clientCodes });
    }catch(error){
        console.log(error)
        return error
    }
    

    return user
}
module.exports = mongoose.model('User', userSchema)