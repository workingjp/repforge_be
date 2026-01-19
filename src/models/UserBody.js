const mongoose = require("mongoose");

const userBodySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: false,
        },
        gender: {
            type: String,
            required: true,
            unique: false,
        },
        age: {
            type: String,
            required: true,
            unique: false,
        },
        height: {
            type: String,
            required: true,
            unique: false,
        },
        weight: {
            type: String,
            required: true,
            unique: false,
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('UserBody', userBodySchema);