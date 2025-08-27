/** @typedef {import('pear-interface')} */ /* global Pear */

import SchemaScheets from 'schema-sheets'
import Corestore from 'corestore'
import Alpine from 'alpinejs'
import htmx from 'htmx.org';
import crypto from "crypto"
import * as PearRequest from 'pear-request'
import defaultApps from './apps.json' assert { type: 'json' }
import History from './hyperhistory'
import b4a from 'b4a'
import BlindPeering from 'blind-peering'
import Hyperswarm from 'hyperswarm'
import Wakeup from 'protomux-wakeup'

const log = (...args) => {
    process.stderr.write(args.join(" ") + "\n")
}

const blindPeers = ["3x4bak4wh5tar1w3ai5h7ixipq8gpagifggag83k1xetjmhqynxo"]

window.Alpine = Alpine
window.htmx = htmx

// Configure htmx to not update browser history by default
htmx.config.pushUrl = false;

htmx.logAll();

Alpine.start()

const freshStart = Pear.config.args.includes("--fresh")
const keyValue = Pear.config.args.find(arg => arg.startsWith("--key="))
const key = keyValue ? b4a.from(keyValue.split("=")[1], 'hex') : b4a.from('0d5336f6ce7fa12c717cae34ba7a1e956c98bb971eff6dd6dcf3b2819f0c5a15', 'hex')

log("Setting up store...")

const store = new Corestore(Pear.config.storage)
const swarm = new Hyperswarm()
const wakeup = new Wakeup()
const blind = new BlindPeering(swarm, store, { wakeup, mirrors: blindPeers })
const sheets = new SchemaScheets(store, key)

log("Preparing search engine...")

await sheets.ready()
// log("Search engine key:", b4a.toString(sheets.key, 'hex'))

log("Joining swarm...")
swarm.join(sheets.base.discoveryKey)

log("Adding autobase background...")
blind.addAutobaseBackground(sheets.base)

log("Setting up history...")

const history = new History(store)
await history.ready()

const teardown = async () => {
    await sheets.close()
    await blind.close()
    await swarm.destroy()
    await store.close()
}


swarm.on('connection', c => {
    log("Connected with peer")
    c.on('close', function () { })
    store.replicate(c)
    wakeup.addStream(c)
})

process.once('SIGINT', async function () {
    log('shutting down....')
    await teardown()
    process.exit()
})

log("Joining search engine...")
await sheets.join()

// For testing
if (freshStart) {
    log(sheets)

    const appsSchemaId = await sheets.addNewSchema('apps', {
        type: 'object',
        properties: {
            name: { type: 'string' },
            icon: { type: 'string' },
            description: { type: 'string' },
            url: { type: 'string' }
        },
        required: ['name', 'icon', 'description', 'url']
    })
    log(appsSchemaId)
}

const schemas = await sheets.listSchemas().then(schemas => schemas.reduce((acc, schema) => {
    acc[schema.name] = schema.schemaId
    return acc
}, {}))

global.PearRequest = PearRequest
global.schemas = schemas
global.sheets = sheets
global.hyperHistory = history

if (freshStart) {
    let apps = await sheets.list(schemas.apps)

    if (apps.length < defaultApps.length) {
        log("app", defaultApps.length)
        for (const a of defaultApps) {
            const apps = await sheets.list(schemas.apps, {
                query: `[].{url: url}`,
            });

            log("result", apps)

            if (apps.find(app => app.url === a.url) !== undefined) {
                continue
            }

            const success = await sheets.addRow(schemas.apps, a, Date.now())
            if (!success) {
                throw new Error(`Failed to add default app ${a.name}`)
            }
        }
    }
}

log("Ready")
// Fire off event to say ready
document.dispatchEvent(new Event('pear-browser-ready'))
globalThis.pearBrowserReady = true