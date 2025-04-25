import express from 'express';

function Routes(app) {

    // Middleware to parse JSON bodies
    app.use(express.json());

    // Root route with authentication middleware
    app.get('/', auth, (req, res) => {
        return res.send("Hello NodeJS");
    });
    
    // Start the server
    const PORT = process.env.APP_PORT || 5000;

    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });


}

export default Routes;