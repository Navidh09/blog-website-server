const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const { ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7n3bd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    // api collections
    const blogsCollection = client.db("blogsDB").collection("blogs");
    const wishlistCollection = client.db("blogsDB").collection("wishlist");
    const commentsCollection = client.db("blogsDB").collection("comments");

    const currentDate = new Date().toISOString();
    // wishlist related apis
    app.post("/wishlist", async (req, res) => {
      const myWishlist = req.body;

      const query = { email: myWishlist.email, blogID: myWishlist.blogID };
      const alreadyExist = await wishlistCollection.findOne(query);
      if (alreadyExist)
        return res.status(400).send("Already exists in your wishlist");
      const result = await wishlistCollection.insertOne(myWishlist);
      res.send(result);
    });

    app.get("/wishlist", async (req, res) => {
      const result = await wishlistCollection.find().toArray();
      res.send(result);
    });

    // delete entries
    app.delete("/wishlist/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await wishlistCollection.deleteOne(query);
      res.send(result);
    });

    // all blogs
    app.get("/blogs", async (req, res) => {
      const result = await blogsCollection.find().toArray();
      res.send(result);
    });

    app.get("/blogs6", async (req, res) => {
      const query = blogsCollection.find().sort({ createdAt: -1 }).limit(6);
      const result = await query.toArray();
      res.send(result);
    });

    // update blog api
    app.patch("/update/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const data = req.body;

      const update = {
        $set: {
          title: data.title,
          category: data.category,
          image: data.image,
          shortDescription: data.shortDescription,
          longDescription: data.longDescription,
        },
      };
      const result = await blogsCollection.updateOne(query, update);
      res.send(result);
    });

    // blog details api
    app.get("/blog/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await blogsCollection.findOne(query);
      res.send(result);
    });

    // add blogs
    app.post("/blogs", async (req, res) => {
      const newBlog = req.body;
      const result = await blogsCollection.insertOne(newBlog);
      res.send(result);
    });

    // featured blogs
    app.get("/featuredBlogs", async (req, res) => {
      const allBlogs = await blogsCollection.find().toArray();
      const featuredBlogs = allBlogs
        .sort((a, b) => b.longDescription.length - a.longDescription.length)
        .slice(0, 10);

      res.send(featuredBlogs);
    });

    // my blogs
    app.get("/myBlogs", async (req, res) => {
      const result = await blogsCollection.find().toArray();
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is Running successfully");
});

app.listen(port, () => {
  console.log(`Blog Website is running at: ${port}`);
});
