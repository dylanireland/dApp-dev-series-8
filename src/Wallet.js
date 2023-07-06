function Wallet(props) {
	return (
		<button onClick={() => requestConnection(props)}>
			Connect to Casper Wallet
		</button>
	);
}

function requestConnection(props) {
	props.provider.requestConnection().then(connected => {
		console.log("Connected?: " + connected);
		if (connected) {
			getActivePublicKey(props);
		}
	});
}

function getActivePublicKey(props) {
	props.provider
		.getActivePublicKey()
		.then(publicKey => {
			props.setPublicKey(publicKey);
		})
		.catch(error => {
			if (error === 1) {
				console.error("Wallet is locked");
			} else if (error === 2) {
				console.error("Not approved to connect");
			}
		});
}

export default Wallet;
