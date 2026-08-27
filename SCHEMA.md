# Database Schema Documentation

Complete MongoDB schema documentation for MessMate.

## Collections

### Users
Stores user account information and roles.

```javascript
{
  _id: ObjectId,
  name: String,                    // User's full name
  email: String,                   // Unique email (college domain)
  picture: String,                 // Profile picture URL
  role: "student" | "vendor" | "admin",
  assignedVendor: String,          // Vendor ID they're assigned to (for students)
  createdAt: Date,                 // Account creation timestamp
  updatedAt: Date
}
```

**Indexes:**
- `{ email: 1 }` - Unique index, used for login
- `{ role: 1 }` - For role-based queries
- `{ assignedVendor: 1 }` - For filtering by vendor

**Constraints:**
- `email` must be unique
- `email` must end with college domain (e.g., @sst.scaler.com)
- `role` must be one of the three specified values

---

### Feedback
Stores meal ratings and feedback from students.

```javascript
{
  _id: ObjectId,
  userId: ObjectId,                // Reference to User
  vendorId: String,                // Vendor name (e.g., "The Craving Brew")
  mealType: "Breakfast" | "Lunch" | "Dinner" | "Snacks",
  date: Date,                      // When the meal was eaten
  ratings: {
    quality: Number,               // 1-5 scale: food quality/nutrition
    hygiene: Number,               // 1-5 scale: cleanliness
    quantity: Number,              // 1-5 scale: portion size
    taste: Number,                 // 1-5 scale: flavor
    overall: Number                // 1-5 scale: overall experience
  },
  suggestion: String,              // User's comment/suggestion (max 500 chars)
  createdAt: Date
}
```

**Indexes:**
- `{ userId: 1, mealType: 1, date: 1 }` - Compound unique index to prevent duplicate ratings per meal per day
- `{ vendorId: 1, date: 1 }` - For analytics queries by vendor and date
- `{ userId: 1, date: 1 }` - For user's feedback history
- `{ date: 1 }` - For daily aggregations

**Constraints:**
- All rating values must be integers between 1-5
- `userId` must be a valid reference to Users collection
- One feedback per user per meal type per day (enforced by compound index)

**Queries:**
```javascript
// Get today's feedback by vendor
db.feedback.find({ 
  vendorId: "The Craving Brew",
  date: { $gte: new Date("2024-01-15"), $lt: new Date("2024-01-16") }
})

// Get user's all feedback
db.feedback.find({ userId: ObjectId("...") })

// Analytics: Average ratings by vendor
db.feedback.aggregate([
  { $match: { date: { $gte: new Date("2024-01-01") } } },
  { $group: {
    _id: { vendorId: "$vendorId", mealType: "$mealType" },
    avgQuality: { $avg: "$ratings.quality" },
    avgOverall: { $avg: "$ratings.overall" },
    count: { $sum: 1 }
  }},
  { $sort: { count: -1 } }
])
```

---

### Menus
Daily menu items for each vendor.

```javascript
{
  _id: ObjectId,
  vendorId: String,                // Vendor name
  mealType: "Breakfast" | "Lunch" | "Dinner" | "Snacks",
  date: Date,                      // Menu date (stored as start of day)
  items: String,                   // Menu description/items (max 1000 chars)
  imageUrl: String,                // Path to menu image (e.g., "/uploads/menu-123.jpg")
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ vendorId: 1, date: 1, mealType: 1 }` - For querying today's menu
- `{ date: 1 }` - For daily menu retrieval
- `{ vendorId: 1 }` - For vendor's all menus

**Constraints:**
- One menu entry per vendor per meal type per day

**Queries:**
```javascript
// Get today's menus for a vendor
const today = new Date();
today.setHours(0, 0, 0, 0);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

db.menus.find({
  vendorId: "GSR",
  date: { $gte: today, $lt: tomorrow }
})

// Get next week's menus
db.menus.find({
  vendorId: "Uniworld",
  date: { $gte: today, $lt: new Date(today.getTime() + 7*24*60*60*1000) }
})
```

---

## Aggregation Pipelines

### Daily Analytics Summary

```javascript
db.feedback.aggregate([
  {
    $match: {
      date: {
        $gte: new Date("2024-01-15T00:00:00Z"),
        $lt: new Date("2024-01-16T00:00:00Z")
      }
    }
  },
  {
    $group: {
      _id: {
        vendorId: "$vendorId",
        mealType: "$mealType"
      },
      count: { $sum: 1 },
      avgQuality: { $avg: "$ratings.quality" },
      avgTaste: { $avg: "$ratings.taste" },
      avgHygiene: { $avg: "$ratings.hygiene" },
      avgQuantity: { $avg: "$ratings.quantity" },
      avgOverall: { $avg: "$ratings.overall" }
    }
  },
  {
    $sort: { count: -1 }
  }
])
```

### Vendor Performance

```javascript
db.feedback.aggregate([
  {
    $match: {
      vendorId: "The Craving Brew",
      date: {
        $gte: new Date("2024-01-01"),
        $lt: new Date("2024-02-01")
      }
    }
  },
  {
    $group: {
      _id: "$mealType",
      avgOverall: { $avg: "$ratings.overall" },
      avgQuality: { $avg: "$ratings.quality" },
      count: { $sum: 1 }
    }
  }
])
```

---

## Data Validation Rules

### User Validation
- Email must match pattern: `^[^\s@]+@sst\.scaler\.com$`
- Name required, max 100 characters
- Role must be: `student`, `vendor`, or `admin`

### Feedback Validation
- All ratings must be integers: 1, 2, 3, 4, or 5
- Suggestion optional, max 500 characters
- User can only submit one feedback per meal type per day
- MealType must be one of: `Breakfast`, `Lunch`, `Dinner`, `Snacks`

### Menu Validation
- Items description max 1000 characters
- Image file must be image type (JPEG, PNG, GIF, WebP)
- Image size max 5MB
- One menu per vendor per meal type per day

---

## Index Strategy

All indexes optimized for read-heavy workload (typical for feedback system).

**Collection: feedback**
```javascript
// Prevent duplicates
db.feedback.createIndex(
  { userId: 1, mealType: 1, date: 1 },
  { unique: true }
)

// Quick lookup for status check
db.feedback.createIndex({ userId: 1, date: -1 })

// Analytics by vendor
db.feedback.createIndex({ vendorId: 1, date: -1 })

// Sort by date
db.feedback.createIndex({ date: -1 })
```

**Collection: menus**
```javascript
// Daily menu queries
db.menus.createIndex({ vendorId: 1, date: -1, mealType: 1 })

// Overall date queries
db.menus.createIndex({ date: -1 })
```

**Collection: users**
```javascript
// Login by email
db.users.createIndex({ email: 1 }, { unique: true })

// Filter by role
db.users.createIndex({ role: 1 })

// User lookup
db.users.createIndex({ _id: 1 })
```

---

## Relationship Diagram

```
Users (1) ──── (Many) Feedback
  │
  └──── assignedVendor ──────> Vendors
  
Vendors (1) ──── (Many) Feedback
Vendors (1) ──── (Many) Menus
```

---

## Migration Notes

### Adding a New Field

Example: Add `allergies` array to menu items

```javascript
// Create migration file: migrations/001_add_allergies_to_menus.js

db.menus.updateMany(
  {},
  {
    $set: {
      allergies: [],
      updatedAt: new Date()
    }
  }
)

// Update schema validation if using it
db.runCommand({
  collMod: "menus",
  validator: { /* updated schema */ }
})
```

### Removing a Field

Example: Remove deprecated `legacyId` field

```javascript
db.users.updateMany(
  { legacyId: { $exists: true } },
  { $unset: { legacyId: 1 } }
)
```

---

## Performance Tips

1. **Always use date range queries** with indexes
2. **Compound indexes** for common filter combinations
3. **Projection** to return only needed fields
4. **Pagination** for large result sets
5. **Caching** for frequently accessed analytics

---

## Backup & Recovery

### Daily Backup
```bash
mongodump --db mess-feedback --out ./backup-$(date +%Y%m%d)
```

### Restore from Backup
```bash
mongorestore --db mess-feedback ./backup-20240115/mess-feedback
```

---

**Last Updated:** 2024
**Schema Version:** 1.0
