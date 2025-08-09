const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const fs = require("fs");

// Middleware
app.use(express.json());
app.use(cors());

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "upload/images");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// MongoDB connection
mongoose.connect("mongodb+srv://ramisatasmiah:ramisaxyz8464@cluster0.cpbqqy2.mongodb.net/shopdeshi?retryWrites=true&w=majority")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Test route
app.get("/", (req, res) => {
  res.send("Express app is running");
});

// Serve uploaded images
app.use('/images', express.static('upload/images'));

// Multer setup
const storage = multer.diskStorage({
  destination: './upload/images',
  filename: (req, file, cb) => {
    return cb(null, `image_${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage: storage });

// Upload endpoint (fix field name to 'image')
app.post("/upload", upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: 0, message: "No file uploaded" });
  }

  const imageUrl = `${req.protocol}://${req.get("host")}/images/${req.file.filename}`;

  res.json({
    success: 1,
    image_url: imageUrl
  });
});

// Review schema
const ReviewSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  }
});

// Updated Product schema with reviews
const Product = mongoose.model("Product", {
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  new_price: {
    type: Number,
    required: true,
  },
  old_price: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  available: {
    type: Boolean,
    default: true,
  },
  reviews: [ReviewSchema], // Add reviews array
});

// Add product endpoint
app.post('/addproduct', async (req, res) => {
  try {
    let products = await Product.find({});
    let id = products.length > 0 ? products[products.length - 1].id + 1 : 1;

    const product = new Product({
      id: id,
      name: req.body.name,
      image: req.body.image,
      category: req.body.category,
      new_price: req.body.new_price,
      old_price: req.body.old_price,
      reviews: [], // Initialize with empty reviews array
    });

    await product.save();
    console.log("Product saved:", product);

    res.json({
      success: true,
      name: req.body.name,
    });
  } catch (err) {
    console.error("Error saving product:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Add review to product
app.post('/addreview', async (req, res) => {
  try {
    const { productId, user, rating, comment } = req.body;
    
    if (!productId || !user || !rating || !comment) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields" 
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        message: "Rating must be between 1 and 5" 
      });
    }

    const newReview = {
      user: user,
      rating: parseInt(rating),
      comment: comment,
      date: new Date()
    };

    const product = await Product.findOne({ id: productId });
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    product.reviews.push(newReview);
    await product.save();

    console.log(`Review added to product ${productId}:`, newReview);
    
    res.json({
      success: true,
      message: "Review added successfully",
      review: newReview
    });
  } catch (err) {
    console.error("Error adding review:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get reviews for a specific product
app.get('/reviews/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findOne({ id: productId });
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    res.json({
      success: true,
      reviews: product.reviews || []
    });
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Delete product
app.post('/removeproduct', async (req, res) => {
  try {
    await Product.findOneAndDelete({ id: req.body.id });
    console.log("Removed product ID:", req.body.id);
    res.json({ success: true, name: req.body.name });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ success: false });
  }
});

// Get all products
app.get('/allproducts', async (req, res) => {
  try {
    let products = await Product.find({});
    console.log("All Products Fetched");
    res.send(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ success: false });
  }
});

////                             blog                    page                     stuff

// Tutorial Video schema
const TutorialSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  youtubeUrl: {
    type: String,
    required: true,
  },
  videoId: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  views: {
    type: Number,
    default: 0,
  }
});

const Tutorial = mongoose.model("Tutorial", TutorialSchema);

// Tutorial/Blog endpoints

// Helper function to extract YouTube video ID
function extractVideoId(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return match ? match[1] : null;
}

// Add tutorial video
app.post('/addtutorial', async (req, res) => {
  try {
    const { title, description, youtubeUrl, author } = req.body;
    
    if (!title || !description || !youtubeUrl || !author) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required" 
      });
    }

    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid YouTube URL" 
      });
    }

    // Get next ID
    let tutorials = await Tutorial.find({});
    let id = tutorials.length > 0 ? tutorials[tutorials.length - 1].id + 1 : 1;

    const tutorial = new Tutorial({
      id: id,
      title: title,
      description: description,
      youtubeUrl: `https://www.youtube.com/embed/${videoId}`,
      videoId: videoId,
      author: author,
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    });

    await tutorial.save();
    console.log("Tutorial saved:", tutorial);

    res.json({
      success: true,
      message: "Tutorial added successfully",
      tutorial: tutorial
    });
  } catch (err) {
    console.error("Error saving tutorial:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get all tutorials
app.get('/alltutorials', async (req, res) => {
  try {
    let tutorials = await Tutorial.find({}).sort({ date: -1 });
    console.log("All Tutorials Fetched");
    res.json({
      success: true,
      tutorials: tutorials
    });
  } catch (err) {
    console.error("Error fetching tutorials:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get single tutorial
app.get('/tutorial/:id', async (req, res) => {
  try {
    const tutorialId = parseInt(req.params.id);
    const tutorial = await Tutorial.findOne({ id: tutorialId });
    
    if (!tutorial) {
      return res.status(404).json({ 
        success: false, 
        message: "Tutorial not found" 
      });
    }

    // Increment view count
    tutorial.views += 1;
    await tutorial.save();

    res.json({
      success: true,
      tutorial: tutorial
    });
  } catch (err) {
    console.error("Error fetching tutorial:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Delete tutorial
app.post('/removetutorial', async (req, res) => {
  try {
    const tutorialId = req.body.id;
    const deletedTutorial = await Tutorial.findOneAndDelete({ id: tutorialId });
    
    if (!deletedTutorial) {
      return res.status(404).json({ 
        success: false, 
        message: "Tutorial not found" 
      });
    }

    console.log("Removed tutorial ID:", tutorialId);
    res.json({ 
      success: true, 
      message: "Tutorial deleted successfully",
      title: deletedTutorial.title 
    });
  } catch (err) {
    console.error("Error deleting tutorial:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Search tutorials
app.get('/searchtutorials', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ 
        success: false, 
        message: "Search query is required" 
      });
    }

    const tutorials = await Tutorial.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { author: { $regex: q, $options: 'i' } }
      ]
    }).sort({ date: -1 });

    res.json({
      success: true,
      tutorials: tutorials,
      count: tutorials.length
    });
  } catch (err) {
    console.error("Error searching tutorials:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});




// Start server
app.listen(port, (error) => {
  if (!error) {
    console.log(`🚀 Server running on port ${port}`);
  } else {
    console.log("Error:", error);
  }
});