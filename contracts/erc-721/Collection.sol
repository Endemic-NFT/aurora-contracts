// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import "./mixins/ERC721Base.sol";
import "./mixins/CollectionRoyalties.sol";
import "./mixins/CollectionFactory.sol";

import "./interfaces/IERC2981Royalties.sol";
import "./interfaces/ICollectionInitializer.sol";

error CallerNotOwner();
error CallerNotTokenOwner();
error URIQueryForNonexistentToken();

contract Collection is
    Initializable,
    ERC721Base,
    CollectionRoyalties,
    CollectionFactory
{
    /**
     * @notice Base URI of the collection
     * @dev We always default to ipfs
     */
    string public constant baseURI = "ipfs://";

    /**
     * @notice Owner of the contract
     */
    address public owner;

    /**
     * @dev Stores a CID for each NFT.
     */
    mapping(uint256 => string) private _tokenCIDs;

    /**
     * @notice Emitted when NFT is minted
     * @param tokenId The tokenId of the newly minted NFT.
     * @param artistId The address of the creator
     */
    event Mint(uint256 indexed tokenId, address artistId);

    event BatchMint(uint256 startTokenId, uint256 endTokenId, address artistId);

    modifier onlyOwner() {
        if (owner != msg.sender) revert CallerNotOwner();
        _;
    }

    /**
     * @notice Initialize imutable variables
     * @param _collectionFactory The factory which is used to create new collections
     */
    constructor(address _collectionFactory)
        CollectionFactory(_collectionFactory)
    {}

    function initialize(
        address creator,
        string memory name,
        string memory symbol,
        uint256 royalties
    ) external onlyCollectionFactory initializer {
        owner = creator;

        __ERC721_init_unchained(name, symbol);
        initializeCollectionRoyalties(creator, royalties);
    }

    function mint(address recipient, string calldata tokenCID)
        external
        onlyOwner
    {
        uint256 tokenId;
        unchecked {
            tokenId = ++latestTokenId;
        }
        _mint(recipient, tokenId);
        _tokenCIDs[tokenId] = tokenCID;
        emit Mint(tokenId, msg.sender);
    }

    function batchMint(address recipient, string[] calldata tokenCIDs)
        external
        onlyOwner
    {
        uint256 currentTokenId = latestTokenId;
        uint256 startTokenId;
        unchecked {
            startTokenId = currentTokenId + 1;
        }

        for (uint256 i = 0; i < tokenCIDs.length; ) {
            unchecked {
                ++currentTokenId;
            }

            _mint(recipient, currentTokenId);
            _tokenCIDs[currentTokenId] = tokenCIDs[i];

            unchecked {
                ++i;
            }
        }

        latestTokenId = currentTokenId;
        emit BatchMint(startTokenId, currentTokenId, msg.sender);
    }

    function mintAndApprove(
        address recipient,
        string calldata tokenCID,
        address operator
    ) external onlyOwner {
        uint256 tokenId;
        unchecked {
            tokenId = ++latestTokenId;
        }
        setApprovalForAll(operator, true);
        _mint(recipient, tokenId);
        _tokenCIDs[tokenId] = tokenCID;
        emit Mint(tokenId, msg.sender);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        if (!_exists(tokenId)) revert URIQueryForNonexistentToken();

        return string(abi.encodePacked(_baseURI(), _tokenCIDs[tokenId]));
    }

    function setRoyalties(address recipient, uint256 value) external onlyOwner {
        _setRoyalties(recipient, value);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override
        returns (bool)
    {
        if (interfaceId == type(IERC2981Royalties).interfaceId) {
            return true;
        }
        return super.supportsInterface(interfaceId);
    }

    function _burn(uint256 tokenId) internal override {
        delete _tokenCIDs[tokenId];
        super._burn(tokenId);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }
}
