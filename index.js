const fs = require('fs')
const { Model, Recognizer, setLogLevel } = require('vosk')
const player = require('play-sound')()
const Microphone = require('node-microphone')
const MODEL_PATH = './vosk-model-small-ru-0.22'
const API = require('./API.js')
let COMMANDS = []
var assistent = false
setLogLevel(0)

if (!fs.existsSync(MODEL_PATH)) {
	console.error(
		"Модель для Vosk не найдена. Скачайте её и разместите в папке 'vosk-model-small-ru-0.22'."
	)
	process.exit(1)
}

const model = new Model(MODEL_PATH)
const recognizer = new Recognizer({ model: model, sampleRate: 16000 })

function playAudio(filePath) {
	player.play(`./voice/${filePath}`, err => {
		if (err) console.error(`Ошибка воспроизведения файла ${filePath}:`, err)
	})
}

async function handleCommand(text) {
	if (text.includes('ассистент') && !assistent) {
		playAudio('Слушаю.mp3')
		assistent = true
		console.log('Слушаю следующую команду...')
	} else if (assistent) {
		const command = COMMANDS.findIndex(
			cmd => cmd.toLowerCase() == text.toLowerCase()
		)
		if (command !== -1) {
			console.log(`Выполняю: ${COMMANDS[command]}`)
			try {
				await API.Action(COMMANDS[command])
				playAudio('Выполненно.mp3')
			} catch (e) {
				playAudio('Ошибка.mp3')
			}
		} else {
			playAudio('Не распознано.mp3')
		}
		assistent = false
	}
}

async function start() {
	console.log("Система активна. Произнесите 'ассистент' для начала.")
	try {
		await API.Login()
		COMMANDS = await API.GetCommandList()
	} catch (error) {
		console.log('Ошибка', error.message)
		process.exit(1)
	}
}
const mic = new Microphone()
const micInputStream = mic.startRecording()

micInputStream.on('data', data => {
	//recognizeSpeech(data, rec)
	if (recognizer.acceptWaveform(data)) {
		const result = recognizer.result() // Получаем результат
		if (result.text !== '') {
			console.log(result.text)
			handleCommand(result.text)
		}
	}
})

start()
