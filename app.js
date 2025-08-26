/** @typedef {import('pear-interface')} */ /* global Pear */

import SchemaScheets from 'schema-sheets'
import Corestore from 'corestore'
import Alpine from 'alpinejs'
import htmx from 'htmx.org';
import * as PearRequest from 'pear-request'
import defaultApps from './apps.json' assert { type: 'json' }
import History from './hyperhistory'

window.Alpine = Alpine
window.htmx = htmx

// Configure htmx to not update browser history by default
htmx.config.pushUrl = false;

htmx.logAll();

Alpine.start()

const store = new Corestore("./storage")
const sheets = new SchemaScheets(store)
await sheets.ready()

const history = new History(store)
await history.ready()

Pear.teardown(() => sheets.close())
// Pear.updates(() => Pear.reload())

if (!await sheets.joined()) {
    await sheets.join("browser")

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

let apps = await sheets.list(schemas.apps)

if (apps.length < defaultApps.length) {
    console.log("app", defaultApps.length)
    for (const a of defaultApps) {
        const apps = await sheets.list(schemas.apps, {
            query: `[].{url: '${a.url}'}`,
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