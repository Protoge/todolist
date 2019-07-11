const mongoose = require('mongoose');

const itemsSchema = new mongoose.Schema({
    name: String,
    priority: {
        type: String,
        default: "High"
    }
})

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
})

const List = mongoose.model('lists', listSchema);

const Item = mongoose.model('items', itemsSchema);

module.exports = {
    List,
    Item
}