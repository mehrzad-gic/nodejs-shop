
function Routes(app){

    app.get('/',(req,res) => {
        res.send("Hello NodeJS")
    })

    // Start the server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });

}

export default Routes;