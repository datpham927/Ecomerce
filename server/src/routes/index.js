const userRouter = require("./user")

const routes = (app) => {
    app.use('/api/user', userRouter)
    // app.use('/api/product', productRouter)
}
module.exports = routes