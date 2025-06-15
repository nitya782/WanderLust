const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
    title:{
        type: String,
        required:true,
    },
    description: String,
    image: {
            url : String,
            filename: String
    },   
    //     default: {
    //         filename: "listings Image",
    //         url : "https://th.bing.com/th/id/R.2f41c1e3758835864227343058a66cbb?rik=tN0wOmfQrDs%2btw&riu=http%3a%2f%2fpre10.deviantart.net%2f35af%2fth%2fpre%2ff%2f2014%2f029%2f1%2fe%2frandom_scenery_3_by_justass-d7487cf.jpg&ehk=nyzA7aSvjJf8uXyV6%2fs%2f6nWH31Qk0sLOSPOk0r2OAZk%3d&risl=&pid=ImgRaw&r=0"}
    // },
    price:Number,
    location: String,
    country:String,
    reviews: [
        {
            type:Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    geometry : {
        type: {
            type : String,
            enum :['Point'],
            required : true
        },
        coordinates : {
            type : [Number],
            required : true
        }
    }
});

listingSchema.post("findOneAndDelete", async(listing) => {
    if(listing){
        await Review.deleteMany({_id : {$in: listing.reviews}});
    }
});

const Listing = mongoose.model("Listing",listingSchema);
module.exports = Listing;