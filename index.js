require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.td56s.mongodb.net/?appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();

    const db = client.db("mamonur_rashid_db");
    const userCollection = db.collection("users");
    const researchCollection = db.collection("research");
    const experienceCollection = db.collection("experiences");
    const developmentCollection = db.collection("developments");

    app.post("/users", async (req, res) => {
      try {
        const user = req.body;
        const userExists = await userCollection.findOne({ email: user.email });
        if (userExists) {
          return res
            .status(409)
            .send({ success: false, message: "User already exists" });
        }

        user.role = user.role || "user";
        user.createdAt = new Date();

        const result = await userCollection.insertOne(user);
        res.status(201).send(result);
      } catch (error) {
        res.status(500).send({
          success: false,
          message: "Failed to create user",
          error: error.message,
        });
      }
    });

    app.get("/users", async (req, res) => {
      try {
        const result = await userCollection
          .find()
          .sort({ createdAt: -1 })
          .toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({
          success: false,
          message: "Failed to fetch users",
          error: error.message,
        });
      }
    });

    app.get("/users/role/:email", async (req, res) => {
      const email = req.params.email;
      const user = await userCollection.findOne({ email });

      if (user) {
        res.send({ role: user.role });
      } else {
        res.status(404).send({ role: "user" });
      }
    });

    app.patch("/users/:id/role", async (req, res) => {
      try {
        const filter = { _id: new ObjectId(req.params.id) };
        const updatedUserData = { ...req.body };
        delete updatedUserData._id;

        const existingUser = await userCollection.findOne(filter);
        if (!existingUser) {
          return res
            .status(404)
            .send({ success: false, message: "User not found" });
        }

        const updateDoc = {
          $set: { ...updatedUserData, updatedAt: new Date() },
        };
        const result = await userCollection.updateOne(filter, updateDoc);

        res.send({
          success: true,
          message: "User role updated successfully",
          result,
        });
      } catch (error) {
        res.status(500).send({
          success: false,
          message: "Server Error",
          error: error.message,
        });
      }
    });

    app.delete("/users/:id", async (req, res) => {
      try {
        const result = await userCollection.deleteOne({
          _id: new ObjectId(req.params.id),
        });

        if (result.deletedCount === 0) {
          return res
            .status(404)
            .send({ success: false, message: "User not found" });
        }

        res.send({
          success: true,
          message: "User deleted successfully",
          result,
        });
      } catch (error) {
        res.status(500).send({
          success: false,
          message: "Invalid ID or Server Error",
          error: error.message,
        });
      }
    });

    // POST: Create a new research publication (Admin only)
    app.post("/research", async (req, res) => {
      try {
        const research = req.body;
        research.createdAt = new Date();

        const result = await researchCollection.insertOne(research);
        res.status(201).send({
          success: true,
          message: "Research published successfully",
          result,
        });
      } catch (error) {
        res.status(500).send({
          success: false,
          message: "Failed to publish research",
          error: error.message,
        });
      }
    });

    // GET: Fetch all research publications (Sorted newest first)
    app.get("/research", async (req, res) => {
      try {
        const result = await researchCollection
          .find()
          .sort({ createdAt: -1 })
          .toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({
          success: false,
          message: "Failed to fetch research publications",
          error: error.message,
        });
      }
    });

    // GET: Fetch a single research publication by ID
    app.get("/research/:id", async (req, res) => {
      try {
        const query = { _id: new ObjectId(req.params.id) };
        const research = await researchCollection.findOne(query);

        if (!research) {
          return res.status(404).send({
            success: false,
            message: "Research publication not found",
          });
        }

        res.send(research);
      } catch (error) {
        res.status(500).send({
          success: false,
          message: "Invalid Research ID or Server Error",
          error: error.message,
        });
      }
    });

    // PATCH: Update a research publication by ID (Admin only)
    app.patch("/research/:id", async (req, res) => {
      try {
        const filter = { _id: new ObjectId(req.params.id) };
        const updateData = { ...req.body };
        delete updateData._id;

        const updateDoc = {
          $set: { ...updateData, updatedAt: new Date() },
        };

        const result = await researchCollection.updateOne(filter, updateDoc);

        if (result.matchedCount === 0) {
          return res.status(404).send({
            success: false,
            message: "Research publication not found",
          });
        }

        res.send({
          success: true,
          message: "Research updated successfully",
          result,
        });
      } catch (error) {
        res.status(500).send({
          success: false,
          message: "Failed to update research publication",
          error: error.message,
        });
      }
    });

    // DELETE: Remove a research publication by ID (Admin only)
    app.delete("/research/:id", async (req, res) => {
      try {
        const result = await researchCollection.deleteOne({
          _id: new ObjectId(req.params.id),
        });

        if (result.deletedCount === 0) {
          return res.status(404).send({
            success: false,
            message: "Research publication not found",
          });
        }

        res.send({
          success: true,
          message: "Research deleted successfully",
          result,
        });
      } catch (error) {
        res.status(500).send({
          success: false,
          message: "Invalid ID or Server Error",
          error: error.message,
        });
      }
    });

    app.post("/experiences", async (req, res) => {
      try {
        const experience = req.body;
        experience.createdAt = new Date();

        const result = await experienceCollection.insertOne(experience);
        res.status(201).send({
          success: true,
          message: "Experience added successfully",
          result,
        });
      } catch (error) {
        res.status(500).send({
          success: false,
          message: "Failed to add experience",
          error: error.message,
        });
      }
    });

    // GET: Fetch all Experiences
    app.get("/experiences", async (req, res) => {
      try {
        const result = await experienceCollection
          .find()
          .sort({ createdAt: -1 })
          .toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({
          success: false,
          message: "Failed to fetch experiences",
          error: error.message,
        });
      }
    });

    // GET: Fetch single Experience by ID
    app.get("/experiences/:id", async (req, res) => {
      try {
        const query = { _id: new ObjectId(req.params.id) };
        const experience = await experienceCollection.findOne(query);

        if (!experience) {
          return res
            .status(404)
            .send({ success: false, message: "Experience record not found" });
        }

        res.send(experience);
      } catch (error) {
        res.status(500).send({
          success: false,
          message: "Invalid Experience ID or Server Error",
          error: error.message,
        });
      }
    });

    // PATCH: Update Experience by ID
    app.patch("/experiences/:id", async (req, res) => {
      try {
        const filter = { _id: new ObjectId(req.params.id) };
        const updateData = { ...req.body };
        delete updateData._id;

        const updateDoc = {
          $set: { ...updateData, updatedAt: new Date() },
        };

        const result = await experienceCollection.updateOne(filter, updateDoc);

        if (result.matchedCount === 0) {
          return res
            .status(404)
            .send({ success: false, message: "Experience record not found" });
        }

        res.send({
          success: true,
          message: "Experience updated successfully",
          result,
        });
      } catch (error) {
        res.status(500).send({
          success: false,
          message: "Failed to update experience",
          error: error.message,
        });
      }
    });

    // DELETE: Remove Experience by ID
    app.delete("/experiences/:id", async (req, res) => {
      try {
        const result = await experienceCollection.deleteOne({
          _id: new ObjectId(req.params.id),
        });

        if (result.deletedCount === 0) {
          return res
            .status(404)
            .send({ success: false, message: "Experience record not found" });
        }

        res.send({
          success: true,
          message: "Experience deleted successfully",
          result,
        });
      } catch (error) {
        res.status(500).send({
          success: false,
          message: "Invalid ID or Server Error",
          error: error.message,
        });
      }
    });

    // POST: Create a new development/project
    app.post("/developments", async (req, res) => {
      try {
        const development = req.body;
        development.createdAt = new Date();

        const result = await developmentCollection.insertOne(development);
        res.status(201).send({
          success: true,
          message: "Development project added successfully",
          result,
        });
      } catch (error) {
        res.status(500).send({
          success: false,
          message: "Failed to add development project",
          error: error.message,
        });
      }
    });

    // GET: Fetch all development projects (Sorted newest first)
    app.get("/developments", async (req, res) => {
      try {
        const result = await developmentCollection
          .find()
          .sort({ createdAt: -1 })
          .toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({
          success: false,
          message: "Failed to fetch development projects",
          error: error.message,
        });
      }
    });

    // GET: Fetch a single development project by ID
    app.get("/developments/:id", async (req, res) => {
      try {
        const query = { _id: new ObjectId(req.params.id) };
        const development = await developmentCollection.findOne(query);

        if (!development) {
          return res
            .status(404)
            .send({ success: false, message: "Development project not found" });
        }

        res.send(development);
      } catch (error) {
        res.status(500).send({
          success: false,
          message: "Invalid Development ID or Server Error",
          error: error.message,
        });
      }
    });

    // PATCH: Update a development project by ID
    app.patch("/developments/:id", async (req, res) => {
      try {
        const filter = { _id: new ObjectId(req.params.id) };
        const updateData = { ...req.body };
        delete updateData._id;

        const updateDoc = {
          $set: { ...updateData, updatedAt: new Date() },
        };

        const result = await developmentCollection.updateOne(filter, updateDoc);

        if (result.matchedCount === 0) {
          return res
            .status(404)
            .send({ success: false, message: "Development project not found" });
        }

        res.send({
          success: true,
          message: "Development project updated successfully",
          result,
        });
      } catch (error) {
        res.status(500).send({
          success: false,
          message: "Failed to update development project",
          error: error.message,
        });
      }
    });

    // DELETE: Remove a development project by ID
    app.delete("/developments/:id", async (req, res) => {
      try {
        const result = await developmentCollection.deleteOne({
          _id: new ObjectId(req.params.id),
        });

        if (result.deletedCount === 0) {
          return res
            .status(404)
            .send({ success: false, message: "Development project not found" });
        }

        res.send({
          success: true,
          message: "Development project deleted successfully",
          result,
        });
      } catch (error) {
        res.status(500).send({
          success: false,
          message: "Invalid ID or Server Error",
          error: error.message,
        });
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Md. Mamonur Rashid Running............");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
