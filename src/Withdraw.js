import {
	DeployUtil,
	CLPublicKey,
	CLValueBuilder,
	RuntimeArgs,
	CLByteArray,
	decodeBase16,
} from "casper-js-sdk";

function Deposit(props) {
	return <button onClick={() => deposit(props)}>Deposit</button>;
}

async function getWasm() {
	const result = await fetch("http://localhost:3001/getDepositWASM");
	if (!result.ok) {
		throw new Error(await result.text());
	}
	const buffer = await result.arrayBuffer();
	return new Uint8Array(buffer);
}

async function deposit(props) {
	let wasm;
	try {
		wasm = await getWasm();
	} catch (error) {
		console.error(error);
		return;
	}
	const clContractHash = new CLByteArray(decodeBase16(props.contractHash));

	const args = RuntimeArgs.fromMap({
		amount: CLValueBuilder.u512(10e9),
		contract_hash: CLValueBuilder.key(clContractHash),
	});

	const deploy = props.contractClient.install(
		wasm,
		args,
		"10000000000",
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
		const response = await fetch("http://localhost:3001/deploy", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(signedDeployJson),
		});
		if (!response.ok) {
			const errorMessage = await response.text();
			throw new Error(errorMessage);
		}
		console.log(await response.text());
	} catch (error) {
		console.error(error.message);
	}
}

export default Deposit;
