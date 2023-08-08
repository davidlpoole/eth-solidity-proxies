// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// import "hardhat/console.sol";

// EOA -> Proxy -> Logic1
//              -> Logic2

import "./StorageSlot.sol";

contract Proxy {
    function changeImplementation(address _implementation) external {
        StorageSlot.getAddressSlot(bytes32(uint256(keccak256('eip1967.proxy.implementation')) - 1)).value = _implementation;
    }

    fallback() external {
        (bool success, ) = StorageSlot.getAddressSlot(bytes32(uint256(keccak256('eip1967.proxy.implementation')) - 1)).value.delegatecall(msg.data);
        require(success);
    }
}

contract Logic1 {
    uint x = 0;

    function changeX(uint _x) external {
        x = _x;
    }
}

contract Logic2  {
    uint x = 0;

    function changeX(uint _x) external {
        x = _x;
    }

    // new functionality in version 2
    function tripleX() external {
        x *= 3;
    }
}