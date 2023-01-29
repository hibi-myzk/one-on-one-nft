// SPDX-License-Identifier: MIT
pragma solidity >=0.8.7 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "github.com/zlayine/epic-game-buildspace/contracts/libraries/Base64.sol";
import "github.com/Arachnid/solidity-stringutils/src/strings.sol";

contract OneOnOneToken is ERC721 {
    struct Topic {
        string name;
        string description;
        string topic;
        uint256 fontSize;
        uint256 openedAt;
        uint256 closedAt;
    }

    string private _topicDelimiter = "//";
    Topic[] private _topics;

    constructor() ERC721("1on1 NFT", "OOT") {}

    function mint(string calldata name, string calldata description, string calldata topic, uint256 fontSize) external {
        uint256 tokenId = _topics.length;
        _safeMint(msg.sender, tokenId);

        _topics.push(Topic(
            name,
            description,
            topic,
            fontSize,
            block.timestamp,
            0
        ));
    }

    function totalSupply() public view returns (uint) {
        return _topics.length;
    }

    function getOpenedAt(uint256 tokenId) external view returns (uint256) {
        require(_exists(tokenId), "nonexsitent token");

        return _topics[tokenId].openedAt;
    }

    function getClosedAt(uint256 tokenId) external view returns (uint256) {
        require(_exists(tokenId), "nonexsitent token");

        return _topics[tokenId].closedAt;
    }

    function isClosed(uint256 tokenId) external view returns (bool) {
        require(_exists(tokenId), "nonexsitent token");

        return (0 < _topics[tokenId].closedAt);
    }

    function close(uint256 tokenId) public {
        require(_exists(tokenId), "nonexsitent token");
        require(this.ownerOf(tokenId) == msg.sender, "owner only");
        require(this.isClosed(tokenId) == false, "already closed");

        _topics[tokenId].closedAt = block.timestamp;
    }

    function reopen(uint256 tokenId) public {
        require(_exists(tokenId), "nonexsitent token");
        require(this.ownerOf(tokenId) == msg.sender, "owner only");
        require(this.isClosed(tokenId), "already opened");

        _topics[tokenId].closedAt = 0;
        _topics[tokenId].openedAt = block.timestamp;
    }

    function getFontSize(uint256 tokenId) external view returns (uint256) {
        require(_exists(tokenId), "nonexsitent token");
        require(this.ownerOf(tokenId) == msg.sender, "owner only");

        return _topics[tokenId].fontSize;
    }

    function setFontSize(uint256 tokenId, uint256 fontSize) external {
        require(_exists(tokenId), "nonexsitent token");
        require(this.ownerOf(tokenId) == msg.sender, "owner only");

        _topics[tokenId].fontSize = fontSize;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "nonexsitent token");

        Topic memory topic = _topics[tokenId];
        string memory delim = _topicDelimiter;

        bytes memory bytesName = abi.encodePacked(
            '"name":"', topic.name, '"'
        );

        bytes memory bytesDesc = abi.encodePacked(
            '"description":"', topic.description, '"'
        );

        bytes memory bytesImage = abi.encodePacked(
            '"image":"data:image/svg+xml;base64,',
            Base64.encode(createSVG(topic.topic, delim, topic.fontSize, this.isClosed(tokenId))),
            '"'
        );

        bytes memory bytesObject = abi.encodePacked(
            '{',
                bytesName, ',',
                bytesDesc, ',',
                bytesImage,
            '}'
        );

        bytes memory bytesMetadata = abi.encodePacked(
            'data:application/json;base64,',
            Base64.encode(bytesObject)
        );

        return string(bytesMetadata);
    }

    function createSVG(string memory topic, string memory delim, uint256 fontSize, bool closed) internal pure returns (bytes memory) {
        string[] memory lines = split(topic, delim);

        uint256 d = fontSize + 10;
        uint256 y = d;
        strings.slice memory text = strings.toSlice("");

        for (uint i=0; i< lines.length; i++) {
            string memory l = lines[i];

            text = strings.toSlice(strings.concat(text, strings.toSlice('<tspan x=\"20\" y=\"')));
            text = strings.toSlice(strings.concat(text, strings.toSlice(Strings.toString(y))));
            text = strings.toSlice(strings.concat(text, strings.toSlice('\">')));
            text = strings.toSlice(strings.concat(text, strings.toSlice(l)));
            text = strings.toSlice(strings.concat(text, strings.toSlice('</tspan>')));

            y += d;
        }

        bytes memory bytesTopic = abi.encodePacked(
            '<text x=\"10\" y=\"10\" class=\"f\">',
            strings.toString(text),
            '</text>'
        );

        bytes memory bytesStyle = abi.encodePacked(
            '<style> .f{font-family:sans-serif;font-size:',
            Strings.toString(fontSize),
            'px; fill:#000} .l{font-family:sans-serif;font-size:30px; fill:#fff} </style>'
        );

        bytes memory bytesClosedLabel = abi.encodePacked('');

        if (closed) {
            bytesClosedLabel = abi.encodePacked(
                '<path d=\"M 175.315 348.948 L 350 202.371 L 350 280.694 L 267.405 350 L 176.198 350 Z\" fill=\"#DAA520\" />',
                '<text x=\"-30\" y=\"420\" transform=\"rotate(-40)\" class=\"l\">CLOSED</text>'
            );
        }

        string memory color1 = closed ? "#3cb371" : "#1e90ff";
        string memory color2 = closed ? "#6fcfaf" : "#00bfff";

        bytes memory bytesRect1 = abi.encodePacked(
            '<rect x=\"0\" y=\"0\" width=\"350\" height=\"350\" fill=\"',
            color1,
            '\" />'
        );

        bytes memory bytesRect2 = abi.encodePacked(
            '<rect x=\"10\" y=\"10\" width=\"330\" height=\"330\" fill=\"',
            color2,
            '\" />'
        );

        bytes memory bytesSVG = abi.encodePacked(
            '<svg xmlns=\"http://www.w3.org/2000/svg\" preserveAspectRatio=\"xMinYMin meet\" viewBox=\"0 0 350 350\" overflow=\"hidden\">',
            bytesStyle,
            bytesRect1,
            bytesRect2,
            bytesTopic,
            bytesClosedLabel,
            '</svg>'
        );

        return bytesSVG;
    }

    function split(string memory str, string memory delim) internal pure returns (string[] memory) {
        strings.slice memory slicee = strings.toSlice(str);
        strings.slice memory delimS = strings.toSlice(delim);
        string[] memory parts = new string[](strings.count(slicee, delimS) + 1);
        for (uint i = 0; i < parts.length; i++) {
            parts[i] = strings.toString(strings.split(slicee, delimS));
        }
        return parts;
    }
}