const express = require("express");
const app = express();
const cors = require("cors");
const { CasperClient, DeployUtil } = require("casper-js-sdk");
const fs = require("fs");

app.use(express.json({ limit: "1mb" }));
app.use(cors());

const client = new CasperClient("http://95.216.1.154:7777/rpc");

app.get("/getWASM", (req, res) => {
	const path = req.query.isDeposit == "true" ? "deposit" : "withdraw";
	const wasm = new Uint8Array(fs.readFileSync(`./wasm/${path}.wasm`));
	res.send(Buffer.from(wasm));
});

app.post("/deploy", async (req, res) => {
	try {
		const deploy = DeployUtil.deployFromJson(req.body).unwrap();
		const deployHash = await client.putDeploy(deploy);
		res.send(deployHash);
	} catch (error) {
		console.log(error);
		res.status(400).send(error);
	}
});

app.listen(3001, () => {
	console.log(`App listening on port 3001`);
});
