const { generateRefreshToken, generateAccessToken } = require("../middlewares/jwt")
const User = require("../models/user")
const bcrypt = require("bcrypt")


const register = async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body
        if (!email || !password || !lastName || !firstName) {
            return res.status(400).json({
                success: false,
                mes: 'Missing inputs'
            })
        }

        const user = await User.findOne({ email })
        if (user) { throw new Error('User has existed') }
        else {
            const hashPassword = await bcrypt.hash(password, 10)
            const newUser = await User.create({ ...req.body, password: hashPassword })
            return res.status(200).json({
                success: newUser ? true : false,
                mes: newUser ? 'Register is successfully. Please go login~' : 'Something went wrong'
            })
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            mes: error.message
        })
    }
}
// Refresh token => Cấp mới access token
// Access token => Xác thực người dùng, quân quyên người dùng
const login = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password)
            return res.status(400).json({
                success: false,
                mes: 'Missing inputs'
            })
        // plain object
        const response = await User.findOne({ email })
        if (!response) { throw new Error('Incorrect email or password') }
        const confirmPassword = await bcrypt.compare(password, response.password)
        if (confirmPassword) {
            // Tách password và role ra khỏi response
            const { password, role, refreshToken, ...userData } = response.toObject()
            // Tạo access token
            const accessToken = generateAccessToken(response._id, role)
            // Tạo refresh token
            const newRefreshToken = generateRefreshToken(response._id)
            // Lưu refresh token vào database
            await User.findByIdAndUpdate(response._id, { refreshToken: newRefreshToken }, { new: true })
            // Lưu refresh token vào cookie
            res.cookie('refreshToken', newRefreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 })
            return res.status(200).json({
                success: true,
                accessToken,
                userData
            })
        } else {
            throw new Error('Incorrect email or password')
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            mes: error.message
        })
    }

}


module.exports = { register, login }