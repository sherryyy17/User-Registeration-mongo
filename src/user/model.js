const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
      first_name:  String,
      last_name: String,
      email: {
         type: String,
         required: true,
         unique: true
      },
      password: {
         type: String,
         required: true
      },
      cpassword: {
        type: String,
        required: true
     }
});

userSchema.pre('update', function() {
  this.set({ updatedAt: Date.now() });
});

const UserModel = mongoose.model('User', userSchema);

module.exports = {
  UserModel
};