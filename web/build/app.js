"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const maticjs_1 = require("@maticnetwork/maticjs");
const maticjs_web3_1 = require("@maticnetwork/maticjs-web3");
const web3_1 = __importDefault(require("web3"));
const detect_provider_1 = __importDefault(require("@metamask/detect-provider"));
const contractAbi = require('./contract_abi.json');
const CONTRAT_ADDRESS = '0x0e1aCf2bb5e94DfDe6c8564249Bdf6c833493f80';
(0, maticjs_1.use)(maticjs_web3_1.Web3ClientPlugin);
const posClient = new maticjs_1.POSClient();
let contract;
let account = null;
window.onload = async () => {
    const provider = await (0, detect_provider_1.default)();
    if (provider) {
        console.log('MetaMask is installed!');
    }
    else {
        alert('Please install MetaMask!');
    }
    if (!window.ethereum) {
        return alert('Metamask not installed or not enabled');
    }
    const web3 = new web3_1.default(window.ethereum);
    const btnConnect = document.querySelector('#btnConnect');
    const checkAccounts = async () => {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0) {
            btnConnect.style.display = 'none';
            document.querySelector('#userAddress').innerHTML = accounts[0];
            console.log('user is connected');
            console.log(accounts[0]);
            return accounts[0];
        }
        else {
            btnConnect.style.display = 'inline';
            console.log('user not connected');
            return null;
        }
    };
    account = await checkAccounts();
    window.ethereum.on('chainChanged', async (chainId) => {
        console.log('chainChanged: ', chainId);
        window.location.reload();
    });
    window.ethereum.on('accountsChanged', async (id) => {
        console.log('accountsChanged', id);
        window.location.reload();
    });
    contract = new web3.eth.Contract(contractAbi, CONTRAT_ADDRESS);
    if (account) {
        listNFT();
    }
    btnConnect.addEventListener('click', async () => {
        await window.ethereum.send('eth_requestAccounts');
        const from = window.ethereum.selectedAddress;
        const chainId = await web3.eth.getChainId();
        // if network is goerli, then it is parent
        const isParent = chainId === 5;
        // const mainWeb3 = new Web3('https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161');
        // const maticWeb3 = new Web3('https://rpc-mumbai.maticvigil.com');
        // const maticWeb3 = new Web3('https://rpc-mumbai.matic.today');
        await posClient.init({
            log: true,
            network: 'testnet',
            version: 'mumbai',
            parent: {
                provider: web3.currentProvider,
                //provider: mainWeb3,
                defaultConfig: {
                    from: from
                }
            },
            child: {
                provider: web3.currentProvider,
                //provider: maticWeb3,
                defaultConfig: {
                    from: from
                }
            }
        });
        listNFT();
    });
};
const getMetadata = async (tokenId) => {
    const data = await contract.methods.tokenURI(tokenId).call();
    console.log('[INFO] data', data);
    const metadata = atob(data.split(',')[1]);
    console.log('[INFO] metadata', metadata);
    console.log('[INFO] name', metadata['name']);
    return JSON.parse(metadata);
};
const listNFT = async () => {
    const count = await contract.methods.totalSupply().call();
    console.log('[INFO] totalSupply', count);
    for (let i = 0; i < count; i++) {
        appendNFT(contract, String(i));
    }
};
const appendNFT = async (contract, tokenId) => {
    var _a;
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
        }
        else {
            if (confirm("Reopen this topic?") == true) {
                reopen(tokenId);
            }
        }
    });
    (_a = document.querySelector('#tokens')) === null || _a === void 0 ? void 0 : _a.appendChild(img);
    getMetadata(tokenId).then((json) => {
        img.src = json['image'];
    });
    contract.methods.isClosed(tokenId).call()
        .then((closed) => {
        console.log('[INFO] isClosed', closed);
        img.setAttribute('data-open', (closed == false) ? 'true' : 'false');
    });
    const close = async (tokenId) => {
        const img = document.querySelector('#token' + tokenId);
        img.src = 'loading.gif';
        const result = await contract.methods.close(tokenId).send({ from: account });
        console.log('[INFO] close', result);
        contract.methods.isClosed(tokenId).call()
            .then((closed) => {
            ;
            console.log('[INFO] isClosed', closed);
            img.setAttribute('data-open', (closed == false) ? 'true' : 'false');
        });
        getMetadata(tokenId).then((json) => {
            img.src = json['image'];
        });
    };
    const reopen = async (tokenId) => {
        const img = document.querySelector('#token' + tokenId);
        img.src = 'loading.gif';
        const result = await contract.methods.reopen(tokenId).send({ from: account });
        console.log('[INFO] reopen', result);
        contract.methods.isClosed(tokenId).call()
            .then((closed) => {
            ;
            console.log('[INFO] isClosed', closed);
            img.setAttribute('data-open', (closed == false) ? 'true' : 'false');
        });
        getMetadata(tokenId).then((json) => {
            img.src = json['image'];
        });
    };
    // const test = async (isParent: boolean, from: string) => {
    //     const tokenAddress = isParent ? config.pos.parent.erc20 : config.pos.child.erc20;
    //     const erc20Token = posClient.erc20(
    //         tokenAddress
    //         , isParent
    //     )
    //     console.log('[INFO] erc20 getBalance');
    //     const balance = await erc20Token.getBalance(from);
    //     console.log('[INFO] balance', balance);
    //     console.log(`[INFO] your balance is ${balance}`);
    //     const erc721Token = posClient.erc721('0xF394CC40b9E3992d56dd8C58Ca7c9Bdc573b173B');
    //     window.client = posClient;
    //     window.from = from;
    //     console.log('[INFO] from', from);
    //     const count = await erc721Token.getTokensCount(from);
    //     console.log('[INFO] count', count);
    //     const closed = await contract.methods.isClosed(0).call();
    //     console.log('[INFO] isClosed(0)', closed)
    //     const execute = async () => {
    //         const tokens = await erc721Token.getAllTokens(from);
    //         console.log('[INFO] tokens', tokens);
    //     };
    //     execute().then(() => {
    //     }).catch(err => {
    //         console.error('[ERROR] ', err);
    //     });
    // };
};
