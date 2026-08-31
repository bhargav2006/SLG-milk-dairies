const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const Branch = require("./models/Branch");
const Product = require("./models/Product");

const SOURCE_BRANCH_ID = "6a85d252e46ccad459e42276"; // P.GANNAVARAM PARLOUR (MAIN)
const TARGET_BRANCH_ID = "6a85ebfce46ccad459e9205e"; // MUNGANDA PARLOUR (SUB)

const normalizeProductType = (val) => {
  if (!val) return "Retail";
  const str = String(val).toLowerCase();
  if (str === "wholesale") return "Wholesale";
  if (str === "both") return "Both";
  return "Retail";
};

const copyProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    const sourceBranch = await Branch.findById(SOURCE_BRANCH_ID);
    const targetBranch = await Branch.findById(TARGET_BRANCH_ID);

    if (!sourceBranch) {
      console.error(`Source branch ${SOURCE_BRANCH_ID} not found.`);
      process.exit(1);
    }
    if (!targetBranch) {
      console.error(`Target branch ${TARGET_BRANCH_ID} not found.`);
      process.exit(1);
    }

    console.log(`Copying from: ${sourceBranch.name} (${sourceBranch.code})`);
    console.log(`Copying to:   ${targetBranch.name} (${targetBranch.code})`);

    const sourceProducts = await Product.find({ branch: SOURCE_BRANCH_ID }).lean();
    console.log(`Found ${sourceProducts.length} products in ${sourceBranch.name}.`);

    let copied = 0;
    let skipped = 0;

    for (const prod of sourceProducts) {
      const existing = await Product.findOne({
        branch: TARGET_BRANCH_ID,
        serialNumber: prod.serialNumber,
      });

      if (existing) {
        skipped++;
        console.log(`Skipped #${prod.serialNumber} (${prod.name}) - already exists.`);
        continue;
      }

      const newProd = {
        ...prod,
        _id: new mongoose.Types.ObjectId(),
        branch: TARGET_BRANCH_ID,
        productType: normalizeProductType(prod.productType),
      };

      delete newProd.createdAt;
      delete newProd.updatedAt;
      delete newProd.__v;

      await Product.create(newProd);
      copied++;
      console.log(`Copied: #${prod.serialNumber} - ${prod.name}`);
    }

    console.log(`\nDone! Copied ${copied} products. Skipped ${skipped} products.`);
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
};

copyProducts();
