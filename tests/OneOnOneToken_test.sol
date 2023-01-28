// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
import "remix_tests.sol";
import "../contracts/OneOnOneToken.sol";

contract OneOnOneTokenTest {

    Target t;
    function beforeAll () public {
        t = new Target();
    }

    function testTokenNameAndSymbol () public {
        Assert.equal(t.name(), "1on1 Token", "token name did not match");
        Assert.equal(t.symbol(), "OOO", "token symbol did not match");
    }

    function testSplit () public {
        string[] memory actuals = t._split("foo//bar", "//");

        Assert.equal(actuals[0], "foo", "[0] did not match");
        Assert.equal(actuals[1], "bar", "[1] did not match");
    }

    // function testCreateSVG () public {
    //     string memory svg = string(t._createSVG("foo//bar", "//", 40, false));

    //     Assert.equal(svg, "test", "not match");
    // }
}

contract Target is OneOnOneToken {
    function _split(string memory str, string memory delim) public pure returns (string[] memory) {
        return split(str, delim);
    }

    function _createSVG(string memory topic, string memory delim, uint256 fontSize, bool closed) public pure returns (bytes memory) {
        return createSVG(topic, delim, fontSize, closed);
    }
}