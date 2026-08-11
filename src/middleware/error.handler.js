const notFound = (req, res, next) => {
    res.status(404).json({
        success: false, 
        message: "Page not found"
    })
}

// error handler
const errorHandler = (err, req, res, next) => { //err parameter error passed by express
    console.error(err.stack) //prints the complete error stack in the terminal
    if(err.name === "CastError"){ //Checking for Invalid MongoDB ID     
        return res.status(400).json({
            success: false,
            message: "Invalid ID"
        })
    } 
    if(err.name === "ValidationError"){ //Checks if Mongoose validation failed.(schema validation)
        const messages = Object.values(err.errors).map((e) => e.message)//extracts msgs of error written in schema
        return res.status(400).json({
            success:false,
            message: messages.join(",")
        })
    }
    if(err.name === "MulterError"){
        return res.status(400).json({
            success: false,
            message: err.message
        })
    }
    // Duplicate key error
    if (err.code === 11000) {
        // Review unique index
        if (err.keyPattern?.reviewer && err.keyPattern?.swap) {
            return res.status(400).json({
                success: false,
                message: "You have already reviewed this swap."
            })
        }

        // Report unique index
        if (err.keyPattern?.reporter && err.keyPattern?.swap) {
            return res.status(400).json({
                success: false,
                message: "You have already reported this swap."
            })
        }

        // User email unique index
        const field = Object.keys(err.keyValue)[0];

        return res.status(400).json({
            success: false,
            message: `${field} already exists.`
        })
    }
    return res.status(500).json({
    success:false,
    message: err.message
    })
}

module.exports = {notFound, errorHandler}