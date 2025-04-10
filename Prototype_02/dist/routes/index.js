"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// Import specific route modules later
// import mainRoutes from './main.routes';
// import adminRoutes from './admin.routes';
const router = (0, express_1.Router)();
// Simple placeholder route for the homepage for now
router.get('/', (req, res) => {
    // Later this will render the index.ejs template
    res.send('Prototype 02 - Homepage Placeholder');
});
// Mount other specific routers later
// router.use('/', mainRoutes);       // Mount main application routes
// router.use('/admin', adminRoutes); // Mount admin routes under /admin prefix
exports.default = router;
//# sourceMappingURL=index.js.map