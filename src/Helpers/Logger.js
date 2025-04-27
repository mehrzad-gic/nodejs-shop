const colors = {
    // Text colors
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',

    // Background colors
    bgBlack: '\x1b[40m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m',
    bgMagenta: '\x1b[45m',
    bgCyan: '\x1b[46m',
    bgWhite: '\x1b[47m',

    // Styles
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    underscore: '\x1b[4m',
    blink: '\x1b[5m',
    reverse: '\x1b[7m',
    hidden: '\x1b[8m'
};

const logger = {

    // Standard log levels
    info: (message) => console.log(`${colors.cyan}[INFO]${colors.reset} ${message}`),
    success: (message) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${message}`),
    warn: (message) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${message}`),
    error: (message) => console.log(`${colors.red}[ERROR]${colors.reset} ${message}`),

    // Custom colored text
    color: (message, textColor) => {
        const colorCode = colors[textColor] || colors.white;
        console.log(`${colorCode}${message}${colors.reset}`);
    },

    // Custom text with background
    bg: (message, textColor, bgColor) => {
        const textCode = colors[textColor] || colors.white;
        const bgCode = colors[`bg${bgColor.charAt(0).toUpperCase() + bgColor.slice(1)}`] || colors.bgBlack;
        console.log(`${bgCode}${textCode}${message}${colors.reset}`);
    },

    // Special formats
    highlight: (message) => console.log(`${colors.bright}${colors.yellow}${message}${colors.reset}`),
    underline: (message) => console.log(`${colors.underscore}${message}${colors.reset}`)

};


export default logger;
