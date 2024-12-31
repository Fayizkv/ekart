const mongoose = require('mongoose');

var couponSchema  = new mongoose.Schema({

    couponcode: {
        type : String,
        required : true
    },
    discount : {
        type : Number,
        required : true
    }
});

const coupons = mongoose.model('coupons', couponSchema);
module.exports = coupons;

