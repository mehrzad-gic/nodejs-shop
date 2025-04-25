import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import morgan from 'morgan';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import multer from 'multer';


// Express Configuration
function Express(app) {

  const corsOptions = {
    origin: 'http://localhost:3000', // Allow only your React app's origin
    // optionsSuccessStatus: 200 // Some legacy browsers choke on 204
  };
  
  app.use(cors(corsOptions));
  
  // morgan
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan("dev"));
  }

  // bodyParser
  app.use(bodyParser.json({limit: '50mb'}));
  app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));


  // cookieParser
  app.use(cookieParser());

  // session
  app.use(session({
    saveUninitialized: true,
    resave: false,
    secret: 'secret',
    cookie: { maxAge: 600000 }
  }));

  // express-fileUpload Middleware
  // app.use(fileUpload());

}

export default Express;