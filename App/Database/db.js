import mongoose from 'mongoose';

const connectDatabase = async () => {
    try {
        await mongoose.connect(process.env.DB_URL, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        });
        
        await mongoose.connection.asPromise();

    } catch (err) {
        console.error("❌ DB connection error:", err);
        process.exit(1);
    }
};

export default connectDatabase;
