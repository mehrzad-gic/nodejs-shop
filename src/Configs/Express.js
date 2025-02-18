import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import morgan from 'morgan';
import fileUpload from 'express-fileupload';


// Express Configuration
function Express(app){

    // morgan
    if (process.env.NODE_ENV === 'development') {
      app.use(morgan("dev"));
    }

    // bodyParser
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());


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
    app.use(fileUpload());

}

export default Express;