pragma solidity ^0.8.0;

contract SampleContract {
    uint256 private count = 0;
    string public publicData = "public data";

    function hello() public pure returns (string memory) {
        return "Hello Sample Contract";
    }

    function getCount() public view returns (uint256) {
        return count;
    }

    function countUp() public {
        count++;
    }
}