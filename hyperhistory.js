import ReadyResource from 'ready-resource'
import b4a from 'b4a'

export default class History extends ReadyResource {

    /** @type {Hypercore} */
    #history = null

    /** @type {Buffer|string} */
    #key = null

    /** @type {any} */
    #currentState = null

    /** @type {number} */
    #currentIndex = -1

    #sessionMinIndex = 0

    constructor(store, key = null) {
        super()

        this.#key = key ? Buffer.isBuffer(key) ? key : b4a.from(key, 'hex') : null

        this.#history = store.get({ name: this.#key ? undefined : "history", key: this.#key, valueEncoding: 'json' })
    }

    /**
     * Get the length of the history.
     * 
     * @returns {number}
     */
    get length() {
        return this.#history.length
    }

    /**
     * Get the current position in the history.
     * 
     * @returns {number}
     */
    get position() {
        return this.#currentIndex
    }

    /**
     * Get the current state.
     * 
     * @returns {any}
     */
    get state() {
        return this.#currentState
    }

    /**
     * Go to the previous state.
     * 
     * @returns {Promise<any>}
     */
    back() {
        return this.go(-1)
    }

    /**
     * Go to the next state.
     * 
     * @returns {Promise<any>}
     */
    forward() {
        return this.go(1)
    }

    /**
     * Check if the history has a state at the given index.
     * This is useful to check if the history has a state before calling go.
     * 
     * @param {number} delta 
     * @returns {boolean}
     */
    peek(delta = 0) {
        // index = 5(-1)
        // 5-2
        // 5-3    
        // 0 1 2 3 4

        const index = this.#currentIndex + delta

        // Trying to go back to initial state
        if (index === -1) {
            return true
        }

        console.log("peek check", index, this.#sessionMinIndex, this.#history.length)

        return index >= this.#sessionMinIndex && index < this.#history.length
    }

    /**
     * Go to the given index.
     * 
     * @param {number} delta 
     * @returns {Promise<any>}
     */
    async go(delta = 0) {
        if (!this.peek(delta)) {
            return this.#currentState
        }

        const index = this.#currentIndex + delta

        if (index === -1) {
            this.#currentState = null
        } else {
            this.#currentState = await this.#history.get(index)
        }

        this.#currentIndex = index

        // const newPosition = this.#currentPosition + delta
        // console.log("go", newPosition, this.#history.length, this.#history.length + newPosition + 1)

        // if (newPosition === this.#distanceToStart) {
        //     this.#currentState = null
        // } else {
        //     this.#currentState = await this.#history.get(this.#history.length + newPosition + 1)
        // }

        // this.#currentPosition = newPosition

        this.emit('popState', this.#currentState)

        return this.#currentState
    }

    /**
     * Push a new state to the history.
     * Will truncate the history if not at the tip.
     * 
     * @param {any} state 
     * @returns {Promise<number>}
     */
    async pushState(state) {
        // If we're not at the tip, truncate the history
        if (this.#currentIndex !== this.#history.length - 1) {
            await this.#history.truncate(this.#currentIndex + 1)
        }

        const { length } = await this.#history.append(state)
        this.#currentState = state
        this.#currentIndex = length - 1

        this.emit('popState', state)
    }

    async _open() {
        await this.#history.ready()

        // TODO: fix going back in time
        this.#sessionMinIndex = - 1
    }

    async _close() {
        await this.#history.close()
    }
}