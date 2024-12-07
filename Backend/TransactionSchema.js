const mongoose = require('mongoose')

const TransactionSchema = new mongoose.Schema({
    id:{type:Number},
    title:{type:String},
    price:{type:Number},
    description:{type:String},
    category:{type:String},
    image:{type:String},
    sold:{type:Boolean},
    dateOfSale:{type:Date},
});

const transactionSchema = mongoose.model('transactionSchema',TransactionSchema)

module.exports = transactionSchema