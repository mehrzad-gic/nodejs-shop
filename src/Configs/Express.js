import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import morgan from 'morgan';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import multer from 'multer';


// Express Configuration
function Express(app) {

  // cors
  const allowedOrigins = ['http://localhost:3000', 'https://yourdomain.com'];
  const corsOptions = {
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error('CORS blocked: Invalid origin'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Enable if using cookies/sessions
    optionsSuccessStatus: 200, // Fix legacy browsers
  };

  app.use(cors(corsOptions));

  // morgan
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan("dev"));
  }

  // bodyParser
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));


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