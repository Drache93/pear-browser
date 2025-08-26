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

window.Alpine = Alpine
window.htmx = htmx

// Configure htmx to not update browser history by default
htmx.config.pushUrl = false;

htmx.logAll();

Alpine.start()

const freshStart = Pear.config.args.includes("--fresh")
const keyValue = Pear.config.args.find(arg => arg.startsWith("--key="))
const key = keyValue ? b4a.from(keyValue.split("=")[1], 'hex') : b4a.from('0d5336f6ce7fa12c717cae34ba7a1e956c98bb971eff6dd6dcf3b2819f0c5a15', 'hex')

const store = new Corestore(Pear.config.storage)
const sheets = new SchemaScheets(store, key)
await sheets.ready()

console.log("key", b4a.toString(sheets.key, 'hex'))

const history = new History(store)
await history.ready()

Pear.teardown(() => sheets.close())

if (!await sheets.joined()) {
    const name = b4a.toString(crypto.randomBytes(32), 'hex')
    await sheets.join(name)
}

// For testing
if (freshStart) {
    console.log(sheets)

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
    console.log(appsSchemaId)
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
        console.log("app", defaultApps.length)
        for (const a of defaultApps) {
            const apps = await sheets.list(schemas.apps, {
                query: `[].{url: url}`,
            });

            console.log("result", apps)

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

let historyList = await history.list()

console.log("history", historyList)

global.historyList = historyList


// Fire off event to say ready
document.dispatchEvent(new Event('pear-browser-ready'))
globalThis.pearBrowserReady = true