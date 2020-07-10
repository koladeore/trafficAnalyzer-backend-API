import crypto from 'crypto-random-string'
import { findUser, updateUser } from '../services/user';
import { comparePassword, createPassword } from '../utils/security';
import { findToken, generateToken, destroyToken } from '../services/activation';
import { NOT_EXIST, FORGOT_SUCCESS, INVALID_TOKEN, PASSWORD_EXIST, SERVER_ERROR, RESET_SUCCESS } from '../utils/constant';


export const forgotPassword = async (req, res) => {
	try {
		const { username } = req.body;
		const find = await findUser(username);
		if (!find || find === null) {
			return res.status(404).json({status:404, message:NOT_EXIST })
		}
		const token = crypto({ length: 16 });
		console.log('>>>>', token)

		const see = await generateToken({token, userId:find._id });
		console.log('>>>>', see)
		return res.status(201).json({status:201, message:FORGOT_SUCCESS })
	} catch (err) {
		console.log('>>>>>', err)
		return res.status(500).json({status:500, message:SERVER_ERROR })
}
}


export const resetPassword = async (req, res) => {
	try {
		const { token, password } = req.body;
		const find = await findToken(token);
		const user = await findUser(find.userId)
		if (!find || find === null) {
			return res.status(404).json({ status: 404, message: INVALID_TOKEN })
		}
   
		if (!user || user === null) {
			return res.status(404).json({ status: 404, message: NOT_EXIST })
		}
		const userPassword = await comparePassword(password, user.email);
		console.log('>>>>compare', userPassword)

		if (userPassword) { 
		return res.status(201).json({ status: 201, message: PASSWORD_EXIST})
		};
		const hash = await createPassword(password)
		const see = await updateUser(user._id, hash);

		console.log('>>>>update', see)
		const seedel = await destroyToken(find.userId, token)
		console.log('>>>>del', seedel)

		return res.status(201).json({status:201, message:RESET_SUCCESS })
	} catch (err) {
		console.log('>>>>>', err)
		return res.status(500).json({status:500, message:SERVER_ERROR })
}
}
