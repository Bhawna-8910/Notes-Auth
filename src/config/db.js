const mongoose  = require('mongoose')

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            autoIndex : true, //ususally default in mongoose
        });

        console.log(`MongoDB Connected : ${conn.connection.host}`);
    } catch (error){
        console.error(`Database Connection Error : ${error.message}`);
        process.exit(1);// stop server immediately on db connection failure
    }
};

module.exports = connectDB;