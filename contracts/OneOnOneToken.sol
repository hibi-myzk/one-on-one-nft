// SPDX-License-Identifier: MIT
pragma solidity >=0.8.7 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// https://github.com/zlayine/epic-game-buildspace/blob/master/contracts/libraries/Base64.sol
import "./lib/Base64.sol";

// サンプルトークン
contract OneOnOneToken is ERC721, Ownable {
    // NFTが保存するデータ
    string[] private _names;
    string[] private _descriptions;
    string[] private _topics;
    uint256[] private _openedAtArray;
    uint256[] private _closedAtArray;

    constructor() ERC721("1 on 1 Token", "1ON1") {}

    // トークンの発行
    function mintToken( string calldata name, string calldata description, string calldata word ) external {
//②    // トークンの発行：[_names.length]をIDとして利用（０はじめの連番となる）
        uint256 tokenId = _names.length;
        _safeMint( msg.sender, tokenId );

//①    // データの保存（これがメタデータの作成に利用される）
        _names.push( name );
        _descriptions.push( description );
        _topics.push( word );
        _openedAtArray.push(block.timestamp);
    }

    function getOpenedAt(uint256 tokenId) external view returns(uint256) {
        require(_exists(tokenId), "nonexsitent token");

        return _openedAtArray[tokenId];
    }

    function getClosedAt(uint256 tokenId) external view returns(uint256) {
        require(_exists(tokenId), "nonexsitent token");

        return _closedAtArray[tokenId];
    }

    function isClosed(uint256 tokenId) external view returns(bool) {
        require(_exists(tokenId), "nonexsitent token");

        return (0 < _closedAtArray[tokenId]);
    }

    function close(uint256 tokenId) public returns(uint256) {
        require(_exists(tokenId), "nonexsitent token");

        uint256 timestamp = block.timestamp;
        _closedAtArray.push(timestamp);
        return timestamp;
    }

//③// メタデータを作成して返す
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "nonexsitent token");

//④    // name要素の作成
        bytes memory bytesName = abi.encodePacked(
            '"name":"', _names[tokenId], '"'
        );

//⑤    // description要素の作成
        bytes memory bytesDesc = abi.encodePacked(
            '"description":"', _descriptions[tokenId], '"'
        );

//⑦    // image要素の作成：SVG要素をByte64エンコードしてコンテンツタイプの指定
        bytes memory bytesImage = abi.encodePacked(
            '"image":"data:image/svg+xml;base64,',
            Base64.encode( _createSVG( tokenId ) ),
            '"'
        );

//⑧    /// jsonオブジェクトの作成
        bytes memory bytesObject = abi.encodePacked(
            '{',
                bytesName, ',',
                bytesDesc, ',',
                bytesImage,
            '}'
        );

//⑨    // jsonオブジェクトをBase64エンコードしてコンテンツタイプの指定
        bytes memory bytesMetadata = abi.encodePacked(
            'data:application/json;base64,',
            Base64.encode( bytesObject )
        );

        // 文字列として返す
        return( string( bytesMetadata ) );
    }

//⑥// SVGデータの作成
    function _createSVG( uint256 tokenId ) internal view returns (bytes memory) {
        // wordの部分を作っておく
        bytes memory bytesWord = abi.encodePacked(
            '<text x="175" y="290" text-anchor="middle" class="f">',
            _topics[tokenId],
            '</text>'
        );

        // SVGとしてまとめる
        bytes memory bytesSVG = abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 350 350">',
            '<style> .f { font-family: serif; font-size:300px; fill:000000;} </style>',
            '<rect x="0" y="0" width="350" height="350" fill="#000000" />',
            '<rect x="10" y="10" width="330" height="330" fill="#ffffff" />',
            bytesWord,
            '</svg>'
        );

        return( bytesSVG );
    }
}