"use strict";



module.exports.csvinventory = function (parent) {
    const obj = {};
    obj.parent = parent;
    obj.meshServer = parent.parent;
    obj.VIEWS = __dirname + '/views/';
    const devices = [];

    const path = require("path");
    const fs = require("fs");
    let body = "";


    const prm = Promise.resolve();

    obj.server_startup = async function () {

        await obj.meshServer.webserver.app.route('/plugin/csvinventory').
            post((req, res) => {
                req.on("data", chunk => body = chunk);
                req.on("end", async (data) => {

                    if (body == "true") {

                        prm.then(async () => {
                            await obj.mainFunc();

                            await obj.insertCSV();
                        })



                    }

                })

            });






    }

    obj.mainFunc = async function () {
        return new Promise((resolve, reject) => {
            obj.meshServer.db.GetAll((err, info) => {
                const i = info.filter(inf => inf.type == "node");

                for (const key of i) {
                    obj.saveDeviceInfo(key);
                }
                resolve()
            });
        })
    }



    obj.saveDeviceInfo = async function (info) {
        const dEx = "n";
        const device = {
            type: info.type || dEx,//'node',
            mtype: info.mtype || dEx,//, 2,
            _id: info._id || dEx,// 'node//y3Z0BgRPYOwAUqp$txqrwnrJgl@Aqyo75oxDcHiM6SOJKRFRYJGXzQ7QjjhW3JgV',
            icon: info.icon || dEx,//1,
            meshid: info.meshid || dEx, // 'mesh//K69l0zPhz5SfYhntq38CIsbKVWZIkL6hW0oSld@sKdXjesIcDRpfIjxlZesimdj6',
            name: info.name || dEx, //'DESKTOP-U6FGVP4',
            rname: info.rname || dEx, //'DESKTOP-U6FGVP4',
            domain: info.domain || dEx, //'',
            agent_ver: info.agent?.ver || info.agent?.ver ? 0 : dEx,
            agent_id: info.agent?.id || dEx,
            agent_caps: info.agent?.caps || dEx,
            agent_core: info.agent?.core || dEx,
            agent_root: info.agent?.root || dEx,
            host: info.host || dEx,
            osdesc: info.osdesc || dEx,
            ip: info.ip || dEx,
            // av: info.av ? info.av.join(" | ") : dEx,
            av_product: info.av ? info.av?.map((aa) => aa.product).join(" | ") : dEx,
            av_updated: info.av ? info.av?.map((aa) => aa.updated).join(" | ") : dEx,
            av_enabled: info.av ? info.av?.map((aa) => aa.enabled).join(" | ") : dEx,
            // av: [ { product: 'Windows Defender', updated: true, enabled: true } ], 
            wsc_antivirus: info.wsc?.antiVirus || dEx,
            wsc_autoupdate: info.wsc?.autoUpdate || dEx,
            wsc_firewall: info.wsc?.firewall || dEx,
            users: info.users ? info.users.join(" | ") : dEx,
            // users: [ 'DESKTOP-U6FGVP4\\Tecnico' ],
            lusers: info.lusers ? info.lusers.join(" | ") : dEx,
            lastbootuptime: info.lastbootuptime || dEx,
            lastbootdate: (new Date(info.lastbootuptime).toLocaleString()) || "",
            defender_realtimeprotectio: info.defender?.RealTimeProtection || dEx,
            defender_tamperprotected: info.defender?.TamperProtected || dEx,
            intelamt_ver: info.intelamt?.ver || dEx,
            intelamt_sku: info.intelamt?.sku || dEx,
            intelamt_state: info.intelamt?.state || info.intelamt?.state == 0 ? 0 : dEx,
            intelamt_flags: info.intelamt?.flags || info.intelamt?.flags == 0 ? 0 : dEx,
            intelamt_uuid: info.intelamt?.uuid || dEx,

        }
;

        


        if (!devices.some((dev) => dev._id === device._id)){
            devices.push(device);
        }


        // console.log(device);


    }

    obj.insertCSV = async function () {
        await obj.delay(1000)
        if (devices.length > 0) {
            const headers = Object.keys(devices[0]);
            const headerStr = headers.join(";") + ";\n";

            await fs.promises.writeFile("a.csv", headerStr, { encoding: "utf8", flag: "w" });
        }

        for (const device of devices) {
            const file = await fs.promises.readFile("a.csv" ,{ encoding: "utf8"});

            let devStr = "";

            Object.keys(device).forEach((element) => {
                devStr += device[element] + ";"
            });

            

            if (!file.includes(devStr.toString())) {

                await fs.promises.writeFile("a.csv", devStr + "\n", {
                    encoding: "utf8",
                    flag: "a",
                });
            }

        }
    }

    obj.handleAdminReq = function (req, res, user) {
        res.render(obj.VIEWS + "main.handlebars", { devices });

    }

    obj.hook_webServer = function (req, res, next) {


        if (req.path == "/csvinventory/") {
            obj.handleAdminReq(req, res)
        }


    }


    obj.delay = function (ms) {
        return new Promise((resolve, reject) => { setTimeout(resolve, ms) })
    }

    return obj;
}
