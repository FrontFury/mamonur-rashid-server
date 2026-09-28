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
    const academicCollection = db.collection("academics");
    const skillCollection = db.collection("skills");
    const honorCollection = db.collection("honors");
    const volunteerCollection = db.collection("volunteerings");
    const galleryCollection = db.collection("gallery");

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

    // POST: Create a new academic record
    app.post("/academics", async (req, res) => {
      try {
        const academic = req.body;
        academic.createdAt = new Date();

        const result = await academicCollection.insertOne(academic);
        res.status(201).send({
          success: true,
          message: "Academic background added successfully",
          result,
        });
      } catch (error) {
        res.status(500).send({
          success: false,
          message: "Failed to add academic background",
          error: error.message,
        });
      }
    });

    // GET: Fetch all academic records (Sorted newest first)
    app.get("/academics", async (req, res) => {
      try {
        const result = await academicCollection
          .find()
          .sort({ createdAt: -1 })
          .toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({
          success: false,
          message: "Failed to fetch academic records",
          error: error.message,
        });
      }
    });

    // GET: Fetch a single academic record by ID
    app.get("/academics/:id", async (req, res) => {
      try {
        const query = { _id: new ObjectId(req.params.id) };
        const academic = await academicCollection.findOne(query);

        if (!academic) {
          return res
            .status(404)
            .send({ success: false, message: "Academic record not found" });
        }

        res.send(academic);
      } catch (error) {
        res.status(500).send({
          success: false,
          message: "Invalid Academic ID or Server Error",
          error: error.message,
        });
      }
    });

    // PATCH: Update an academic record by ID
    app.patch("/academics/:id", async (req, res) => {
      try {
        const filter = { _id: new ObjectId(req.params.id) };
        const updateData = { ...req.body };
        delete updateData._id;

        const updateDoc = {
          $set: { ...updateData, updatedAt: new Date() },
        };

        const result = await academicCollection.updateOne(filter, updateDoc);

        if (result.matchedCount === 0) {
          return res
            .status(404)
            .send({ success: false, message: "Academic record not found" });
        }

        res.send({
          success: true,
          message: "Academic record updated successfully",
          result,
        });
      } catch (error) {
        res.status(500).send({
          success: false,
          message: "Failed to update academic record",
          error: error.message,
        });
      }
    });

    // DELETE: Remove an academic record by ID
    app.delete("/academics/:id", async (req, res) => {
      try {
        const result = await academicCollection.deleteOne({
          _id: new ObjectId(req.params.id),
        });

        if (result.deletedCount === 0) {
          return res
            .status(404)
            .send({ success: false, message: "Academic record not found" });
        }

        res.send({
          success: true,
          message: "Academic record deleted successfully",
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

    // POST: Create a new skill
    app.post("/skills", async (req, res) => {
      try {
        const skill = req.body;
        skill.createdAt = new Date();

        const result = await skillCollection.insertOne(skill);
        res.status(201).send({
          success: true,
          message: "Skill added successfully",
          result,
        });
      } catch (error) {
        res.status(500).send({
          success: false,
          message: "Failed to add skill",
          error: error.message,
        });
      }
    });

    // GET: Fetch all skills (Sorted newest first)
    app.get("/skills", async (req, res) => {
      try {
        const result = await skillCollection
          .find()
          .sort({ createdAt: -1 })
          .toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({
          success: false,
          message: "Failed to fetch skills",
          error: error.message,
        });
      }
    });

    // GET: Fetch a single skill by ID
    app.get("/skills/:id", async (req, res) => {
      try {
        const query = { _id: new ObjectId(req.params.id) };
        const skill = await skillCollection.findOne(query);

        if (!skill) {
          return res
            .status(404)
            .send({ success: false, message: "Skill not found" });
        }

        res.send(skill);
      } catch (error) {
        res.status(500).send({
          success: false,
          message: "Invalid Skill ID or Server Error",
          error: error.message,
        });
      }
    });

    // PATCH: Update a skill by ID
    app.patch("/skills/:id", async (req, res) => {
      try {
        const filter = { _id: new ObjectId(req.params.id) };
        const updateData = { ...req.body };
        delete updateData._id;

        const updateDoc = {
          $set: { ...updateData, updatedAt: new Date() },
        };

        const result = await skillCollection.updateOne(filter, updateDoc);

        if (result.matchedCount === 0) {
          return res
            .status(404)
            .send({ success: false, message: "Skill not found" });
        }

        res.send({
          success: true,
          message: "Skill updated successfully",
          result,
        });
      } catch (error) {
        res.status(500).send({
          success: false,
          message: "Failed to update skill",
          error: error.message,
        });
      }
    });

    // DELETE: Remove a skill by ID
    app.delete("/skills/:id", async (req, res) => {
      try {
        const result = await skillCollection.deleteOne({
          _id: new ObjectId(req.params.id),
        });

        if (result.deletedCount === 0) {
          return res
            .status(404)
            .send({ success: false, message: "Skill not found" });
        }

        res.send({
          success: true,
          message: "Skill deleted successfully",
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

    // POST: Create a new honor or award
    app.post("/honors", async (req, res) => {
      try {
        const honor = req.body;
        honor.createdAt = new Date();

        const result = await honorCollection.insertOne(honor);
        res.status(201).send({
          success: true,
          message: "Honor/Award added successfully",
          result,
        });
      } catch (error) {
        res.status(500).send({
          success: false,
          message: "Failed to add honor/award",
          error: error.message,
        });
      }
    });

    // GET: Fetch all honors & awards (Sorted newest first)
    app.get("/honors", async (req, res) => {
      try {
        const result = await honorCollection
          .find()
          .sort({ createdAt: -1 })
          .toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({
          success: false,
          message: "Failed to fetch honors and awards",
          error: error.message,
        });
      }
    });

    // GET: Fetch a single honor/award by ID
    app.get("/honors/:id", async (req, res) => {
      try {
        const query = { _id: new ObjectId(req.params.id) };
        const honor = await honorCollection.findOne(query);

        if (!honor) {
          return res
            .status(404)
            .send({ success: false, message: "Honor/Award not found" });
        }

        res.send(honor);
      } catch (error) {
        res.status(500).send({
          success: false,
          message: "Invalid Honor ID or Server Error",
          error: error.message,
        });
      }
    });

    // PATCH: Update an honor/award by ID
    app.patch("/honors/:id", async (req, res) => {
      try {
        const filter = { _id: new ObjectId(req.params.id) };
        const updateData = { ...req.body };
        delete updateData._id;

        const updateDoc = {
          $set: { ...updateData, updatedAt: new Date() },
        };

        const result = await honorCollection.updateOne(filter, updateDoc);

        if (result.matchedCount === 0) {
          return res
            .status(404)
            .send({ success: false, message: "Honor/Award not found" });
        }

        res.send({
          success: true,
          message: "Honor/Award updated successfully",
          result,
        });
      } catch (error) {
        res.status(500).send({
          success: false,
          message: "Failed to update honor/award",
          error: error.message,
        });
      }
    });

    // DELETE: Remove an honor/award by ID
    app.delete("/honors/:id", async (req, res) => {
      try {
        const result = await honorCollection.deleteOne({
          _id: new ObjectId(req.params.id),
        });

        if (result.deletedCount === 0) {
          return res
            .status(404)
            .send({ success: false, message: "Honor/Award not found" });
        }

        res.send({
          success: true,
          message: "Honor/Award deleted successfully",
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

    // POST: Create a new voluntary work entry
    app.post("/volunteerings", async (req, res) => {
      try {
        const voluntaryWork = req.body;
        voluntaryWork.createdAt = new Date();

        const result = await volunteerCollection.insertOne(voluntaryWork);
        res.status(201).send({
          success: true,
          message: "Voluntary work added successfully",
          result,
        });
      } catch (error) {
        res.status(500).send({
          success: false,
          message: "Failed to add voluntary work",
          error: error.message,
        });
      }
    });

    // GET: Fetch all voluntary work entries (Sorted newest first)
    app.get("/volunteerings", async (req, res) => {
      try {
        const result = await volunteerCollection
          .find()
          .sort({ createdAt: -1 })
          .toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({
          success: false,
          message: "Failed to fetch voluntary works",
          error: error.message,
        });
      }
    });

    // GET: Fetch a single voluntary work entry by ID
    app.get("/volunteerings/:id", async (req, res) => {
      try {
        const query = { _id: new ObjectId(req.params.id) };
        const voluntaryWork = await volunteerCollection.findOne(query);

        if (!voluntaryWork) {
          return res.status(404).send({
            success: false,
            message: "Voluntary work entry not found",
          });
        }

        res.send(voluntaryWork);
      } catch (error) {
        res.status(500).send({
          success: false,
          message: "Invalid Voluntary Work ID or Server Error",
          error: error.message,
        });
      }
    });

    // PATCH: Update a voluntary work entry by ID
    app.patch("/volunteerings/:id", async (req, res) => {
      try {
        const filter = { _id: new ObjectId(req.params.id) };
        const updateData = { ...req.body };
        delete updateData._id;

        const updateDoc = {
          $set: { ...updateData, updatedAt: new Date() },
        };

        const result = await volunteerCollection.updateOne(filter, updateDoc);

        if (result.matchedCount === 0) {
          return res.status(404).send({
            success: false,
            message: "Voluntary work entry not found",
          });
        }

        res.send({
          success: true,
          message: "Voluntary work updated successfully",
          result,
        });
      } catch (error) {
        res.status(500).send({
          success: false,
          message: "Failed to update voluntary work",
          error: error.message,
        });
      }
    });

    // DELETE: Remove a voluntary work entry by ID
    app.delete("/volunteerings/:id", async (req, res) => {
      try {
        const result = await volunteerCollection.deleteOne({
          _id: new ObjectId(req.params.id),
        });

        if (result.deletedCount === 0) {
          return res.status(404).send({
            success: false,
            message: "Voluntary work entry not found",
          });
        }

        res.send({
          success: true,
          message: "Voluntary work deleted successfully",
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

    // POST: Add a new image/item to gallery
    app.post("/gallery", async (req, res) => {
      try {
        const galleryItem = req.body;
        galleryItem.createdAt = new Date();

        const result = await galleryCollection.insertOne(galleryItem);
        res.status(201).send({
          success: true,
          message: "Gallery item added successfully",
          result,
        });
      } catch (error) {
        res.status(500).send({
          success: false,
          message: "Failed to add gallery item",
          error: error.message,
        });
      }
    });

    // GET: Fetch all gallery items (Sorted newest first)
    app.get("/gallery", async (req, res) => {
      try {
        const result = await galleryCollection
          .find()
          .sort({ createdAt: -1 })
          .toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({
          success: false,
          message: "Failed to fetch gallery items",
          error: error.message,
        });
      }
    });

    // GET: Fetch a single gallery item by ID
    app.get("/gallery/:id", async (req, res) => {
      try {
        const query = { _id: new ObjectId(req.params.id) };
        const galleryItem = await galleryCollection.findOne(query);

        if (!galleryItem) {
          return res
            .status(404)
            .send({ success: false, message: "Gallery item not found" });
        }

        res.send(galleryItem);
      } catch (error) {
        res.status(500).send({
          success: false,
          message: "Invalid Gallery Item ID or Server Error",
          error: error.message,
        });
      }
    });

    // PATCH: Update a gallery item by ID
    app.patch("/gallery/:id", async (req, res) => {
      try {
        const filter = { _id: new ObjectId(req.params.id) };
        const updateData = { ...req.body };
        delete updateData._id;

        const updateDoc = {
          $set: { ...updateData, updatedAt: new Date() },
        };

        const result = await galleryCollection.updateOne(filter, updateDoc);

        if (result.matchedCount === 0) {
          return res
            .status(404)
            .send({ success: false, message: "Gallery item not found" });
        }

        res.send({
          success: true,
          message: "Gallery item updated successfully",
          result,
        });
      } catch (error) {
        res.status(500).send({
          success: false,
          message: "Failed to update gallery item",
          error: error.message,
        });
      }
    });

    // DELETE: Remove a gallery item by ID
    app.delete("/gallery/:id", async (req, res) => {
      try {
        const result = await galleryCollection.deleteOne({
          _id: new ObjectId(req.params.id),
        });

        if (result.deletedCount === 0) {
          return res
            .status(404)
            .send({ success: false, message: "Gallery item not found" });
        }

        res.send({
          success: true,
          message: "Gallery item deleted successfully",
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
