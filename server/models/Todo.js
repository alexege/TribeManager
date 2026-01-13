import mongoose from "mongoose";

const TodoSchema = new mongoose.Schema(
    {
      title: {
        type: String,
        required: true,
      },
      completed: {
        type: Boolean,
        default: false,
      },
      description: String,
      categories: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Category",
        },
      ],
      priority: String,
      completed: Boolean,
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      comments: String,
    },
    { timestamps: true }
)

export default mongoose.model("Todo", TodoSchema);