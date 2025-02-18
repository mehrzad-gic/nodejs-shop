import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from 'swagger-ui-express';

function swaggerConfig(app) {
    const swaggerOptions = {
        swaggerDefinition: {
            openapi: "3.0.0",
            info: {
                title: "NodeJs Shop",
                version: "2.0.0",
                description: "NodeJs Shop with Mysql and ExpressJs",
                contact: {
                    name: "Mehrzad Mahmodi",
                    url: "https://mehrzad20061384.com",
                    email: "mehrzad20061384@gmail.com",
                },
            },
            servers: [
                {
                    url: process.env.APP_URL || "http://localhost:5000", // Use environment variable
                },
            ],
            components: {
                securitySchemes: {
                    BearerAuth: {
                        type: "http",
                        scheme: "bearer",
                        bearerFormat: "JWT",
                    }
                }
            },
            security: [{ BearerAuth: [] }]
        },
        apis: ["./src/Modules/*/*.yaml"],
    };

    const swaggerDocs = swaggerJSDoc(swaggerOptions);

    app.use("/api-doc", swaggerUi.serve, swaggerUi.setup(swaggerDocs, { explorer: true }));
    app.get('/swagger',(req,res) => {
        res.send('swagger')
    })


}

export default swaggerConfig;
