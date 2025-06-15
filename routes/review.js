const express = require("express");
const router = express.Router({mergeParams :true});
const wrapAsync = require("../util/wrapAsync.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {validateReview, isReviewAuthor,isLoggedIn} = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");

//Post review route
router.post("/", isLoggedIn ,validateReview ,wrapAsync(reviewController.createReview));

//Delete Review route
router.delete("/:reviewId", isReviewAuthor ,isLoggedIn,wrapAsync(reviewController.destroyReview));

module.exports = router;