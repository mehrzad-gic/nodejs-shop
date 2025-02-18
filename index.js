import Main from "./src/Configs/Main.js";

// Call the main function
Main().catch(error => {
    console.error('Error starting the application:', error);
});