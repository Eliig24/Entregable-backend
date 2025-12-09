import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    autor: { type: String, default: "Anónimo" }
}, { timestamps: true });

export default mongoose.model("Post", postSchema);

