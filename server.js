const path = require('path');
// Ishakisha .env mu buryo bw'imvaho ngo rya kosa rya secretOrPrivateKey riveho
require('dotenv').config({ path: path.resolve(__dirname, '.env') }); 

const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');

// HANO NI HO HAKOSOWE: Tangiza 'app' hano mbere yo kuyikoresha
const app = express(); 

// ==========================================
// MIDDLEWARES
// ==========================================
app.use(cors());
app.use(express.json()); // Iyi ituma req.body isomeka (Crucial)

// ==========================================
// ROUTES
// ==========================================
app.use(userRoutes);

// Catch-all route for undefined endpoints (404 Handler)
app.use((req, res) => {
  res.status(404).json({ 
    message: `Route Not Found - Cannot ${req.method} ${req.originalUrl}` 
  });
});

// ==========================================
// GLOBAL ERROR MONITORING
// ==========================================
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Critical Unhandled Rejection at:', promise, 'reason:', reason);
});

// ==========================================
// SERVER INITIALIZATION
// ==========================================
const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running smoothly on port ${PORT}`);
  });
}

module.exports = app;