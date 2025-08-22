/** @typedef {import('pear-interface')} */ /* global Pear */

import SchemaScheets from 'schema-sheets'
import Corestore from 'corestore'


const store = new Corestore("./test")
const sheets = new SchemaScheets(store)
await sheets.ready()

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

let apps = await sheets.list(schemas.apps)

if (apps.length === 0) {
    const success = await sheets.addRow(schemas.apps, {
        name: 'Keet Gifs',
        icon: 'https://docs.pears.com/~gitbook/image?url=https%3A%2F%2F1301247912-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252Fjdab83NqbLtX0WX9qY2n%252Flogo%252FNZwXgspge0TwHeeUwAFo%252Fpear-vector.svg%3Falt%3Dmedia%26token%3D50bb2ece-f774-47b7-a604-441ccf9aeb8c&width=260&dpr=4&quality=100&sign=477f992b&sv=2',
        description: 'Share your favorite GIFs and WebP images directly with friends using peer-to-peer technology. No accounts, no upload limits, no corporate overlords.',
        url: 'pear://eedfdkadkz96r9kh1pc9fyjr6h986i76hy78s5yszg9a85ee7g3o'
    }, Date.now())

    if (success) {
        console.log('App added successfully')
        apps = await sheets.list(schemas.apps)
    } else {
        console.log('Failed to add app')
    }
}


console.log(apps)