// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";

abstract contract ERC721Base is ERC721BurnableUpgradeable {
    uint256 public latestTokenId;

    uint256 private burnCounter;

    /**
     * @notice Returns the total amount of tokens
     * @dev From the ERC-721 enumerable standard
     */
    function totalSupply() external view returns (uint256 supply) {
        unchecked {
            // Number of tokens minted is always greater than burned tokens.
            supply = latestTokenId - burnCounter;
        }
    }

    function _burn(uint256 tokenId) internal virtual override {
        unchecked {
            // Number of burned tokens cannot exceed latestTokenId which is the same size.
            ++burnCounter;
        }

        super._burn(tokenId);
    }
}
