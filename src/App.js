import logo from "./logo.svg";
import "./App.css";
import Wallet from "./Wallet";
import Interact from "./Interact";
import React from "react";
import { CasperClient, Contracts } from "casper-js-sdk";

function App() {
	const [publicKey, setPublicKey] = React.useState(null);

	const CasperWalletProvider = window.CasperWalletProvider;
	const CasperWalletEventTypes = window.CasperWalletEventTypes;

	if (CasperWalletProvider == null || CasperWalletEventTypes == null) {
		return <h1>Casper Wallet is not installed</h1>;
	}

	const provider = CasperWalletProvider();

	const casperClient = new CasperClient("http://95.216.1.154:7777/rpc");
	const contractClient = new Contracts.Contract(casperClient);

	const contractHash =
		"cb781f66f78a398bf1709c4dac40b3cca17106824ea88ca9daa5b822421c9b57";

	return (
		<>
			<Wallet
				publicKey={publicKey}
				setPublicKey={setPublicKey}
				provider={provider}
			/>
			<Interact
				contractHash={contractHash}
				publicKey={publicKey}
				casperClient={casperClient}
				contractClient={contractClient}
				provider={provider}
			/>
		</>
	);
}

export default App;
