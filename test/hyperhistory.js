import test from 'brittle'
import Corestore from 'corestore'
import History from '../hyperhistory.js'
import tmp from 'test-tmp'

test('initial state', async function (t) {
    const store = await createStore(t)
    const history = new History(store)
    await history.ready()

    t.is(history.state, null)
    t.is(history.length, 0)
    t.is(history.peek(-1), false)
    t.is(history.peek(1), false)
})

test('pushState adds to history', async function (t) {
    const store = await createStore(t)
    const history = new History(store)
    await history.ready()

    const state1 = { page: 'home', data: 'test1' }
    await history.pushState(state1)
    t.is(history.position, 0)

    t.alike(history.state, state1)
    t.is(history.length, 1)
    t.is(history.peek(-1), true, 'can go back to initial state')
    t.is(history.peek(1), false, 'cannot go forward')
})

// -1
// -1
// -1
// -2 = -1
// -2 = -1


test('go back from first entry returns to initial state', async function (t) {
    const store = await createStore(t)
    const history = new History(store)
    await history.ready()

    const state1 = { page: 'home', data: 'test1' }
    await history.pushState(state1)

    t.is(history.position, 0)
    const result = await history.back()

    t.is(result, null)
    t.is(history.state, null)
    t.is(history.position, -1, "back to start")
    t.is(history.peek(-1), false)
    t.is(history.peek(1), true)
})

test('go forward works', async function (t) {
    const store = await createStore(t)
    const history = new History(store)
    await history.ready()

    const state1 = { page: 'home', data: 'test1' }
    await history.pushState(state1)

    t.is(history.length, 1)
    t.is(history.peek(-1), true)
    t.is(history.peek(1), false)

    await history.back()

    const result = await history.forward()

    t.alike(result, state1)
    t.alike(history.state, state1)
    t.is(history.peek(-1), true)
    t.is(history.peek(1), false)
})

test('multiple entries - navigation works correctly', async function (t) {
    const store = await createStore(t)
    const history = new History(store)
    await history.ready()

    const state1 = { page: 'home', data: 'test1' }
    const state2 = { page: 'about', data: 'test2' }
    const state3 = { page: 'contact', data: 'test3' }

    await history.pushState(state1)
    await history.pushState(state2)
    await history.pushState(state3)

    t.alike(history.state, state3)
    t.is(history.length, 3)
    t.is(history.peek(-1), true)
    t.is(history.peek(1), false)

    const result1 = await history.back()
    t.alike(result1, state2)
    t.alike(history.state, state2)
    t.is(history.peek(-1), true)
    t.is(history.peek(1), true)

    const result2 = await history.back()
    t.alike(result2, state1)
    t.alike(history.state, state1)
    t.is(history.peek(-1), true)
    t.is(history.peek(1), true)

    // Last state, back to where we started
    const result3 = await history.back()
    t.is(result3, null)
    t.is(history.state, null)
    t.is(history.peek(-1), false, 'cannot go back after reaching last history entry')
    t.is(history.peek(1), true, 'can go forward after reaching last history entry')
})

test('forward navigation after going back', async function (t) {
    const store = await createStore(t)
    const history = new History(store)
    await history.ready()

    const state1 = { page: 'home', data: 'test1' }
    const state2 = { page: 'about', data: 'test2' }
    const state3 = { page: 'contact', data: 'test3' }

    await history.pushState(state1)
    await history.pushState(state2)
    await history.pushState(state3)

    t.alike(history.state, state3)
    t.is(history.length, 3)
    t.is(history.peek(-1), true)
    t.is(history.peek(1), false)

    await history.back()
    await history.back()

    t.alike(history.state, state1)
    t.is(history.length, 3)
    t.is(history.peek(-1), true) // can go back to initial state
    t.is(history.peek(1), true)

    const result1 = await history.forward()
    t.alike(result1, state2)
    t.alike(history.state, state2)
    t.is(history.peek(-1), true)
    t.is(history.peek(1), true)

    const result2 = await history.forward()
    t.alike(result2, state3)
    t.alike(history.state, state3)
    t.is(history.peek(-1), true)
    t.is(history.peek(1), false)
})

test('pushing new state after going back forks history', async function (t) {
    const store = await createStore(t)
    const history = new History(store)
    await history.ready()

    const state1 = { page: 'home', data: 'test1' }
    const state2 = { page: 'about', data: 'test2' }
    const state3 = { page: 'contact', data: 'test3' }

    await history.pushState(state1)
    await history.pushState(state2)
    await history.pushState(state3)

    await history.back()
    await history.back()

    const newState = { page: 'new', data: 'newdata' }
    await history.pushState(newState)

    t.alike(history.state, newState)
    t.is(history.length, 2)
    t.is(history.peek(-1), true)
    t.is(history.peek(1), false)

    const result = await history.back()
    t.alike(result, state1)
    t.alike(history.state, state1)
    t.is(history.peek(-1), true)
    t.is(history.peek(1), true)
})

test('forking from middle of history - multiple states', async function (t) {
    const store = await createStore(t)
    const history = new History(store)
    await history.ready()

    // Create a longer history: A -> B -> C -> D -> E
    const stateA = { page: 'A', data: 'a' }
    const stateB = { page: 'B', data: 'b' }
    const stateC = { page: 'C', data: 'c' }
    const stateD = { page: 'D', data: 'd' }
    const stateE = { page: 'E', data: 'e' }

    await history.pushState(stateA)
    await history.pushState(stateB)
    await history.pushState(stateC)
    await history.pushState(stateD)
    await history.pushState(stateE)

    t.alike(history.state, stateE)
    t.is(history.length, 5)

    await history.back() // E -> D
    await history.back() // D -> C
    await history.back() // C -> B

    t.alike(history.state, stateB)
    t.is(await history.peek(-1), true)
    t.is(await history.peek(1), true)

    // Push new state - should fork and keep only A -> B -> newState
    const newState = { page: 'NEW', data: 'new' }
    await history.pushState(newState)

    t.alike(history.state, newState)
    t.is(history.length, 3) // A, B, newState
    t.is(await history.peek(-1), true)
    t.is(await history.peek(1), false)

    const backResult = await history.back()
    t.alike(backResult, stateB)
    t.alike(history.state, stateB)
    t.is(await history.peek(-1), true)
    t.is(await history.peek(1), true)

    const forwardResult = await history.forward()
    t.alike(forwardResult, newState)
    t.alike(history.state, newState)
})

test('forking from initial state', async function (t) {
    const store = await createStore(t)
    const history = new History(store)
    await history.ready()

    const state1 = { page: 'home', data: 'test1' }
    const state2 = { page: 'about', data: 'test2' }
    const state3 = { page: 'contact', data: 'test3' }

    await history.pushState(state1)
    await history.pushState(state2)
    await history.pushState(state3)

    await history.back()
    await history.back()
    await history.back()

    t.is(history.state, null)
    t.is(history.peek(-1), false)
    t.is(history.peek(1), true)

    // Push new state from initial state - should fork
    const newState = { page: 'new', data: 'newdata' }
    await history.pushState(newState)

    t.alike(history.state, newState)
    t.is(history.length, 1) // Only newState (initial state is not stored)
    t.is(history.peek(-1), true)
    t.is(history.peek(1), false)

    const backResult = await history.back()
    t.is(backResult, null)
    t.is(history.state, null)
    t.is(history.peek(-1), false)
    t.is(history.peek(1), true)
})

test('forking multiple times', async function (t) {
    const store = await createStore(t)
    const history = new History(store)
    await history.ready()

    // Create initial history: A -> B -> C
    const stateA = { page: 'A', data: 'a' }
    const stateB = { page: 'B', data: 'b' }
    const stateC = { page: 'C', data: 'c' }

    await history.pushState(stateA)
    await history.pushState(stateB)
    await history.pushState(stateC)

    // First fork: go back to A and push D
    await history.back()
    await history.back()
    const stateD = { page: 'D', data: 'd' }
    await history.pushState(stateD)

    t.alike(history.state, stateD)
    t.is(history.length, 2)

    // Second fork: go back to A and push E
    await history.back()
    const stateE = { page: 'E', data: 'e' }
    await history.pushState(stateE)

    t.alike(history.state, stateE)
    t.is(history.length, 2)

    const backResult = await history.back()
    t.alike(backResult, stateA)
    t.alike(history.state, stateA)
    t.is(history.peek(1), true)

    const forwardResult = await history.forward()
    t.alike(forwardResult, stateE)
    t.alike(history.state, stateE)
})

test('forking when at the end of history (no fork)', async function (t) {
    const store = await createStore(t)
    const history = new History(store)
    await history.ready()

    const state1 = { page: 'home', data: 'test1' }
    const state2 = { page: 'about', data: 'test2' }

    await history.pushState(state1)
    await history.pushState(state2)

    // We're at the end of history (state2)
    t.alike(history.state, state2)
    t.is(history.length, 2)

    // Push new state - should NOT fork since we're at the end
    const newState = { page: 'new', data: 'newdata' }
    await history.pushState(newState)

    t.alike(history.state, newState)
    t.is(history.length, 3, 'forking does not happen when at the end of history')
    t.is(history.peek(-1), true)
    t.is(history.peek(1), false)

    const backResult = await history.back()
    t.alike(backResult, state2)
    t.alike(history.state, state2)
    t.is(history.peek(-1), true)
    t.is(history.peek(1), true)
})

test('forking with complex navigation patterns', async function (t) {
    const store = await createStore(t)
    const history = new History(store)
    await history.ready()

    // Create history: A -> B -> C -> D
    const stateA = { page: 'A', data: 'a' }
    const stateB = { page: 'B', data: 'b' }
    const stateC = { page: 'C', data: 'c' }
    const stateD = { page: 'D', data: 'd' }

    await history.pushState(stateA)
    await history.pushState(stateB)
    await history.pushState(stateC)
    await history.pushState(stateD)

    t.alike(history.state, stateD)
    t.is(history.length, 4)
    t.is(await history.peek(-1), true)
    t.is(await history.peek(1), false)

    // Navigate back and forth a bit
    await history.back() // D -> C
    await history.forward() // C -> D
    await history.back() // D -> C
    await history.back() // C -> B

    // Now we're at stateB
    t.alike(history.state, stateB)
    t.is(await history.peek(-1), true)
    t.is(await history.peek(1), true)

    // Fork by pushing new state
    const newState = { page: 'NEW', data: 'new' }
    await history.pushState(newState)

    t.alike(history.state, newState)
    t.is(history.length, 3)
    t.is(await history.peek(-1), true)
    t.is(await history.peek(1), false)

    await history.back() // newState -> B
    t.alike(history.state, stateB)
    t.is(await history.peek(-1), true)
    t.is(await history.peek(1), true)

    await history.back() // B -> A
    t.alike(history.state, stateA)
    t.is(await history.peek(-1), true)
    t.is(await history.peek(1), true)

    await history.forward() // A -> B
    t.alike(history.state, stateB)
    await history.forward() // B -> newState
    t.alike(history.state, newState)
})

test('edge cases - navigation beyond bounds', async function (t) {
    const store = await createStore(t)
    const history = new History(store)
    await history.ready()

    const state1 = { page: 'home', data: 'test1' }
    await history.pushState(state1)

    // no effect
    await history.go(2)
    t.alike(history.state, state1)
    t.is(history.length, 1)
    t.is(await history.peek(-1), true) // can go back to initial state
    t.is(await history.peek(1), false)

    // no effect
    await history.go(-2)
    t.alike(history.state, state1)
    t.is(history.length, 1)
    t.is(await history.peek(-1), true) // can go back to initial state
    t.is(await history.peek(1), false)
})

test('go method with custom delta', async function (t) {
    const store = await createStore(t)
    const history = new History(store)
    await history.ready()

    const state1 = { page: 'home', data: 'test1' }
    const state2 = { page: 'about', data: 'test2' }
    const state3 = { page: 'contact', data: 'test3' }

    await history.pushState(state1)
    await history.pushState(state2)
    await history.pushState(state3)

    // Go directly to state1 (delta -2)
    const result = await history.go(-2)
    t.alike(result, state1)
    t.alike(history.state, state1)
    t.is(history.peek(-1), true)
    t.is(history.peek(1), true)
})

test('initial state - cannot go forward even with existing history', async function (t) {
    const store = await createStore(t)
    const history = new History(store)
    await history.ready()

    // Add some history
    const state1 = { page: 'home', data: 'test1' }
    const state2 = { page: 'about', data: 'test2' }
    const state3 = { page: 'contact', data: 'test3' }

    await history.pushState(state1)
    await history.pushState(state2)
    await history.pushState(state3)

    // Now create a new history instance with the same store
    // This simulates starting fresh with existing history
    const newHistory = new History(store)
    await newHistory.ready()

    t.is(newHistory.state, null)
    t.is(newHistory.length, 3)

    t.is(newHistory.peek(1), false) // cannot go forward
    t.is(newHistory.peek(-1), false) // cannot go back to initial state - for now

    const result = await newHistory.forward() // ignored
    t.is(result, null)
    t.is(newHistory.state, null)
})

async function createStore(t) {
    const dir = await tmp(t)
    const store = new Corestore(dir)
    t.teardown(() => store.close())
    return store
}