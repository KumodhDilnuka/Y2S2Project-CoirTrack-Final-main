const router =  require("express").Router();
let Item = require("../models/Item");

const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require("path");


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './images');
    },
    filename: function (req, file, cb) {
        cb(null, uuidv4() + '-' + Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedFileTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (allowedFileTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

let upload = multer({ storage, fileFilter })


router.route("/add").post(upload.single("filepath"),(req,res)=>{

    const ItemID = req.body.ItemID;
    const name = req.body.name;
    const filepath = req.file.filename;
    const price = Number( req.body.price);
    const catogory = req.body.catogory;
    const description=req.body.description;
    const count=Number(req.body.count) ;
    const join = req.body.join;

    const newItem = new Item({
        ItemID,
        name,
        filepath,  
        price,   
        catogory,
        description,
        count,

        join
        
    })

    console.log(req.file)

    newItem.save().then(()=>{
        res.json("Item Added")
    }).catch((err)=>{
        console.log(err);
    })
})

router.route("/").get((req,res)=>{

    Item.find().then((Item)=>{
        res.json(Item)
    }).catch((err)=>{
        console.log(err);
    })
})


router.route("/count").get(async (req, res) => {
    try {
        const count = await Item.countDocuments();
        res.json({ count });
    } catch (err) {
        console.error(err.message);
        res.status(500).send({ error: "Error getting Item count" });
    }
});
router.route("/update/:id").put(upload.single("filepath"), async (req, res) => {
    try {
        const itemId = req.params.id;
        
        // Prepare update object
        const updateData = {
            ItemID: req.body.ItemID,
            name: req.body.name,
            price: Number(req.body.price),
            catogory: req.body.catogory,
            description: req.body.description,
            count: Number(req.body.count),
            join: req.body.join
        };

        // If a new file is uploaded, update filepath
        if (req.file) {
            updateData.filepath = req.file.filename;
        }

        // Find and update the item
        const updatedItem = await Item.findByIdAndUpdate(
            itemId, 
            updateData, 
            { new: true } // Return the updated document
        );

        if (!updatedItem) {
            return res.status(404).json({ message: "Item not found" });
        }

        res.json(updatedItem);
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).json({ message: "Error updating item", error: error.message });
    }
});


// In your item routes file
router.route("/delete/:id").delete(async (req, res) => {
    try {
        const deletedItem = await Item.findByIdAndDelete(req.params.id);
        
        if (!deletedItem) {
            return res.status(404).json({ message: "Item not found" });
        }
        
        res.json({ message: "Item deleted successfully" });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({ message: "Error deleting item", error: error.message });
    }
});
module.exports = router;

