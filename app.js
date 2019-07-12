//jshint esversion:6

const mongoose = require('mongoose');
const express = require("express");
const bodyParser = require("body-parser");
const _ = require('lodash');
require('dotenv').config()

const {
  List,
  Item
} = require('./models/itemName.model');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true
}, () => {
  console.log('connection db successfull')
});

const item1 = new Item({
  name: "Welcome To your todolist!"
})

const item2 = new Item({
  name: "Hit the + button to add a new item"
})

const item3 = new Item({
  name: "<-- Hit this to delete an item"
})

const defaultItems = [item1, item2, item3];



app.use((req, res, next) => {
  res.locals.message = "Hello";
  next();
})

app.get("/", function (req, res) {

  const date = new Date();
  const hours = date.getHours();
  const seconds = date.getSeconds()
  const minute = date.getMinutes();


  if (hours === 0 && minute === 0 && seconds === 0) {
    Item.deleteMany({})
      .then(() => console.log('deleted'))
  }

  Item.find({})
    .then(items => {
      if (items.length === 0) {
        Item.insertMany(defaultItems)
          .then(() => console.log('saved defaultItems to DB'))
          .catch((err) => console.log(err));
        res.redirect('/')
      } else {
        res.render("list", {
          listTitle: "Today",
          newListItems: items,
        });
      }
    })
    .catch(err => console.log(err))

});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItemName = new Item({
    name: itemName
  })

  if (listName === "Today") {
    newItemName.save()
      .then(() => {
        res.redirect('/')
      })
      .catch(err => console.log(err))
  } else {
    List.findOne({
        name: listName
      })
      .then(foundListName => {
        foundListName.items.push(newItemName);
        foundListName.save()
          .then(() => res.redirect(`/${listName}`))
      })
      .catch(err => console.log(err))
  }

});

app.post('/delete', (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndDelete(
        checkedItemId
      )
      .then(() => {
        console.log('successfully deleted item')
        res.redirect('/')
      })
      .catch(err => console.log(err))
  } else {
    List.findOneAndUpdate({
        name: listName
      }, {
        $pull: {
          items: {
            _id: checkedItemId
          }
        }
      })
      .then(() => {
        res.redirect(`/${listName}`)
      })
      .catch(err => console.log(err))
  }
})

app.get('/:customListName', (req, res) => {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({
      name: customListName
    })
    .then(foundList => {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save()
          .then(() => {
            res.redirect(`/${customListName}`)
          })
          .catch(err => console.log(err))
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    })
    .catch(err => console.log(err))
})

app.get("/about", function (req, res) {
  res.render("about");
});

const PORT = process.env.PORT || 3000

app.listen(PORT, function () {
  console.log("Server started on port 3000");
});