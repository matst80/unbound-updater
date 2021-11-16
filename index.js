const host = process.env.REDIS_HOST ?? '10.10.11.128';
const db = process.env.REDIS_DB ?? 1;
const key = process.env.CONFIG_KEY ?? 'dns';
const file = process.env.FILE ?? './unbound.conf';
const { AbortController } = require("node-abort-controller");

const controller = new AbortController();
const signal = controller.signal;
const { spawn } = require('child_process');

const fs = require('fs');
const redis = require('redis');

const client = redis.createClient({ host, db });

let task = undefined;

const reload = () => {
    console.log('reload!');
    controller.abort();
    task = spawn('/opt/unbound/sbin/unbound', ['-d', '-c', file], { signal });
    task.stdout.on('data', (d) => {
        console.log(d.toString());
    });

}

const saveFile = (contents) => fs.writeFile(file, contents, reload)

console.log(`Loading ${key} from host ${host} to file ${file}`);

client.get(key, (err, data) => {
    if (!err && data) {
        saveFile(data);
    }
    else {
        if (fs.existsSync(file)) {
            reload();
        }
    }
});

client.subscribe(key, (data) => {
    console.log('update');
    if (data) {
        saveFile(data)
    }
});


