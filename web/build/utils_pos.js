"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.from = exports.getPOSClient = void 0;
//import bn from 'bn.js'
const hdwallet_provider_1 = __importDefault(require("@truffle/hdwallet-provider"));
const config_1 = require("./config");
const maticjs_1 = require("@maticnetwork/maticjs");
//const SCALING_FACTOR = new bn(10).pow(new bn(18))
const maticjs_web3_1 = require("@maticnetwork/maticjs-web3");
(0, maticjs_1.use)(maticjs_web3_1.Web3ClientPlugin);
if (config_1.config.proofApi) {
    (0, maticjs_1.setProofApi)(config_1.config.proofApi);
}
const privateKey = config_1.config.user1.privateKey;
const userAddress = config_1.config.user1.address;
const getPOSClient = (network = 'testnet', version = 'mumbai') => {
    const posClient = new maticjs_1.POSClient();
    return posClient.init({
        log: true,
        network: network,
        version: version,
        child: {
            provider: new hdwallet_provider_1.default(privateKey, config_1.config.rpc.pos.child),
            defaultConfig: {
                from: userAddress,
            },
        },
        parent: {
            provider: new hdwallet_provider_1.default(privateKey, config_1.config.rpc.pos.parent),
            defaultConfig: {
                from: userAddress,
            },
        },
    });
};
exports.getPOSClient = getPOSClient;
// module.exports = {
//     //SCALING_FACTOR,
//     getPOSClient: getPOSClient,
//     //plasma: config.plasma,
//     pos: config.pos,
//     from: config.user1.address,
//     privateKey: config.user1.privateKey,
//     to: config.user2.address,
//     proofApi: config.proofApi,
// }
const from = config_1.config.user1.address;
exports.from = from;
