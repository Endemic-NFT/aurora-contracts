// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";

contract EndemicERC1155Beacon is UpgradeableBeacon {
    constructor(address impl) UpgradeableBeacon(impl) {}
}
