import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema({
  title: { type: String, required: true },
  videoUrl: { type: String, required: true },
  thumbnail: { type: String }, // ⭐ NEW thumbnail for lecture video
  duration: { type: String },
  description: { type: String },
  resources: [
    {
      name: String,
      link: String,
    }
  ]
});

const moduleSchema = new mongoose.Schema({
  moduleTitle: { type: String, required: true },
  lectures: [lectureSchema],
});

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true, trim: true },

    shortDescription: { type: String, required: true, maxLength: 200 },

    fullDescription: { type: String, required: true },

    category: {
      type: String,
      enum: [
        "Video Editing",
        "Social Media Marketing",
        "Digital Marketing",
        "Graphic Design",
        "Data Science",
        "Other"
      ],
      required: true,
    },

    thumbnail: { type: String, required: true }, // Used on course card

    trailerVideo: { type: String }, // ⭐ NEW trailer video URL
    trailerThumbnail: { type: String }, // ⭐ NEW course trailer poster image

    price: { type: Number, required: true },

    duration: { type: String, required: true },

    totalLectures: { type: Number, default: 0 },

    modules: [moduleSchema],

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Course", courseSchema);
