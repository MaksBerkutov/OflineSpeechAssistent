const axios = require('axios')
require('dotenv').config()

let API_KEY = null

async function Login() {
	console.log(
		`Пытаемся авторизоваться с логином ${process.env.LOGIN} и паролем ${process.env.PASSWORD}`
	)
	try {
		const response = await axios.post(`${process.env.URL}/api/login`, null, {
			params: { email: process.env.LOGIN, password: process.env.PASSWORD },
			headers: { 'Content-Type': 'application/json' },
		})
		console.log(`Успешно: ${response.data.token}`)
		API_KEY = response.data.token
	} catch (error) {
		if (error.response) {
			throw new Error('Внутрения ошибка сервера')
		} else if (error.request) {
			throw new Error('Сервер не отвечает')
		} else {
			throw new Error('Неверный логин или пароль')
		}
	}
}
async function GetCommandList(trying = 0) {
	if (trying === 5) return []
	try {
		console.log(API_KEY)
		const response = await axios.get(`${process.env.URL}/api/commands`, {
			headers: {
				Authorization: `Bearer ${API_KEY}`,
				'Content-Type': 'application/json',
			},
		})
		console.log(`Все команды: ${response.data}`)

		return response.data
	} catch (error) {
		console.log(error)
		//Login()
		//return GetCommandList(++trying)
	}
}
async function Action(text_trigger) {
	try {
		await axios.post(
			`${process.env.URL}/api/command/action`,
			{ text_trigger: text_trigger }, // Тело запроса
			{
				headers: {
					// Заголовки запроса
					Authorization: `Bearer ${API_KEY}`,
					'Content-Type': 'application/json',
				},
			}
		)
	} catch (error) {
		console.log(error)
	}
}
module.exports = {
	Login,
	GetCommandList,
	Action,
}
