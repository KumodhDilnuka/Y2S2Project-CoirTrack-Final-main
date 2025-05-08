const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ItemSchema = new Schema({

    ItemID:{
        type: String,
        required: true

    },

    name:{
        type: String,
        required: true
    },

    filepath:{
        type:String
        
    },

    price:{
        type:Number,
        required: true
    },

     catogory:{
        type:String,
        required: true
    },

    description:{
        type: String,
        required: true
    },
    count:{
        type:Number,
        required: true
    },

     join:{
        type:String
    }
})

const Item = mongoose.model("Item",ItemSchema);

module.exports = Item;