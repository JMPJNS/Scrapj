export class InvalidURLError extends Error {
	constructor (public message: string) {
		super()
		Object.setPrototypeOf(this, InvalidURLError.prototype)
	}
}

export class NotImplementedError extends Error {
	constructor (public message: string) {
		super()
		Object.setPrototypeOf(this, NotImplementedError.prototype)
	}
}