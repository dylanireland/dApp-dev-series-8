import {
	DeployUtil,
	CLPublicKey,
	CLValueBuilder,
	RuntimeArgs,
} from "casper-js-sdk";
import axios from "axios";

function Deposit(props) {
	return <button onClick={() => deposit(props)}>Deposit</button>;
}

async function deposit(props) {
	let wasm;
	try {
		const result = await fetch("http://localhost:3001/getDepositWASM");
		if (!result.ok) {
			throw new Error(await result.text());
		}
		const buffer = await result.arrayBuffer();
		wasm = new Uint8Array(buffer);
	} catch (error) {
		console.error(error.message);
		return;
	}

	const contractHashUint8Array = new TextEncoder().encode(props.contractHash);

	const args = RuntimeArgs.fromMap({
		amount: CLValueBuilder.u512(10e9),
		contract_hash: CLValueBuilder.key(
			CLValueBuilder.byteArray(contractHashUint8Array)
		), // CANT BUILD CLKey
	});

	const deploy = props.contractClient.install(
		wasm,
		args,
		"1000000000",
		CLPublicKey.fromHex(props.publicKey),
		"casper-test"
	);

	const deployJson = DeployUtil.deployToJson(deploy);

	try {
		const result = await props.provider.sign(
			JSON.stringify(deployJson),
			props.publicKey
		);
		if (result.cancelled) {
			alert("Signature cancelled.");
			return;
		}
		const signedDeploy = DeployUtil.setSignature(
			deploy,
			result.signature,
			CLPublicKey.fromHex(props.publicKey)
		);
		const signedDeployJson = DeployUtil.deployToJson(signedDeploy);
		const deployHash = await axios.post(
			"http://localhost:3001/deploy",
			signedDeployJson,
			{ headers: { "Content-Type": "application/json" } }
		);
		console.log(deployHash.data);
	} catch (error) {
		console.error(error.message);
	}
}

export default Deposit;
