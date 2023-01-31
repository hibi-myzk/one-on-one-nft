import detectEthereumProvider from '@metamask/detect-provider';
import Web3 from 'web3';
const contractAbi = require('./contract_abi.json');

// Mumbai Testnet
const TEST_CONTRAT_ADDRESS = '0x1457988605A5A629fA6c53b7e5459d0f1A5d6017';
// Polygon Mainnet
const CONTRAT_ADDRESS = '0xfF20f77fCF0207b58697FDd3919B4A51f9402bc8';

let contract: any;
let account: string | null = null;

window.onload = async () => {
    const provider = await detectEthereumProvider();

    if (provider) {
        console.log('MetaMask is installed!');
    } else {
        alert('Please install MetaMask!');
    }

    if (!window.ethereum) {
        return alert('Metamask not installed or not enabled');
    }

    const web3 = new Web3(window.ethereum);

    const btnConnect = document.querySelector<HTMLElement>('#btnConnect')!;

    const accounts = await window.ethereum.request({ method: 'eth_accounts' });

    if (accounts && 0 < accounts.length) {
        account = accounts[0];
        btnConnect.style.display = 'none';
        document.querySelector('#userAddress')!.innerHTML = account!.replace(/(^.{4}).+(.{4}$)/, '$1...$2');
        console.log('user is connected');
        console.log(account);
    } else {
        btnConnect.style.display = 'inline';
        console.log('user not connected');
    }

    window.ethereum.on('chainChanged', async (chainId: string) => {
        console.log('chainChanged: ', chainId);
        window.location.reload();
    });
    window.ethereum.on('accountsChanged', async (id: string) => {
        console.log('accountsChanged', id);
        window.location.reload();
    });

    const chainId = await web3.eth.getChainId();
    console.log('[INFO] chainId', chainId);

    const netName = document.querySelector('#network')!;

    if (chainId == 80001) {
        contract = new web3.eth.Contract(contractAbi, TEST_CONTRAT_ADDRESS);
        netName.innerHTML = 'Mumbai Testnet';
    } else if (chainId == 137) {
        contract = new web3.eth.Contract(contractAbi, CONTRAT_ADDRESS);
        netName.innerHTML = 'Polygon Mainnet';
    } else {
        return alert('Please switch to Polygon mainnet or Mumbai testnet');
    }

    if (account) {
        listNFT();
    }

    btnConnect.addEventListener('click', async () => {
        await window.ethereum.send('eth_requestAccounts');
        account = window.ethereum.selectedAddress;

        listNFT();
    });
}

const getMetadata = async (tokenId: string) => {
    const data = await contract.methods.tokenURI(tokenId).call();
    const metadata: any = atob(data.split(',')[1]);
    return JSON.parse(metadata);
};

const listNFT = async () => {
    const count: number = await contract.methods.totalSupply().call();
    console.log('[INFO] totalSupply', count)

    for (let i = 0; i < count; i++) {
        appendNFT(contract, String(i));
    }
}

const appendNFT = async (contract: any, tokenId: string) => {
    const img = document.createElement('img');
    img.id = 'token' + tokenId;
    img.style.float = 'left';
    img.src = 'loading.gif';
    img.width = 300;
    img.height = 300;

    img.addEventListener('click', async () => {
        if (img.getAttribute('data-open') == 'true') {
            if (confirm("Close this topic?") == true) {
                close(tokenId);
            }
        } else {
            if (confirm("Reopen this topic?") == true) {
                reopen(tokenId);
            }
        }
    });

    document.querySelector('#tokens')?.appendChild(img);

    getMetadata(tokenId).then((json: any) => {
        img.src = json['image'];
    });

    contract.methods.isClosed(tokenId).call()
        .then((closed: boolean) => {
            console.log('[INFO] isClosed', closed)
            img.setAttribute('data-open', (closed == false) ? 'true' : 'false');
        });

    const close = async (tokenId: string) => {
        const img = document.querySelector<HTMLImageElement>('#token' + tokenId)!;
        img.src = 'loading.gif';

        const result = await contract.methods.close(tokenId).send({ from: account });
        console.log('[INFO] close', result);

        contract.methods.isClosed(tokenId).call()
            .then((closed: boolean) => {
                ;
                console.log('[INFO] isClosed', closed)
                img.setAttribute('data-open', (closed == false) ? 'true' : 'false');
            });

        getMetadata(tokenId).then((json: any) => {
            img.src = json['image'];
        });
    };

    const reopen = async (tokenId: string) => {
        const img = document.querySelector<HTMLImageElement>('#token' + tokenId)!;
        img.src = 'loading.gif';

        const result = await contract.methods.reopen(tokenId).send({ from: account });
        console.log('[INFO] reopen', result);

        contract.methods.isClosed(tokenId).call()
            .then((closed: boolean) => {
                console.log('[INFO] isClosed', closed)
                img.setAttribute('data-open', (closed == false) ? 'true' : 'false');
            });

        getMetadata(tokenId).then((json: any) => {
            img.src = json['image'];
        });
    };
}
