// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract CampusAchievement is ERC721URIStorage, Ownable {
    struct AchievementMeta {
        string eventId;
        string category;
        uint256 mintedAt;
    }

    uint256 public tokenCounter;

    mapping(uint256 => AchievementMeta) public metadataByToken;
    mapping(address => uint256[]) private studentTokens;

    event AchievementMinted(
        uint256 indexed tokenId,
        address indexed student,
        string eventId,
        string category,
        string tokenURI
    );

    constructor(address owner) ERC721("CampusBandhuAchievement", "CBACH") Ownable(owner) {}

    function mintAchievement(
        address to,
        string memory tokenURI,
        string memory eventId,
        string memory category
    ) public onlyOwner returns (uint256) {
        uint256 tokenId = tokenCounter;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);

        metadataByToken[tokenId] = AchievementMeta({
            eventId: eventId,
            category: category,
            mintedAt: block.timestamp
        });

        studentTokens[to].push(tokenId);
        tokenCounter += 1;

        emit AchievementMinted(tokenId, to, eventId, category, tokenURI);
        return tokenId;
    }

    function tokensOf(address student) external view returns (uint256[] memory) {
        return studentTokens[student];
    }

    function verifyAchievement(
        address student,
        uint256 tokenId,
        string memory expectedEventId
    ) external view returns (bool) {
        if (_ownerOf(tokenId) != student) {
            return false;
        }

        AchievementMeta memory meta = metadataByToken[tokenId];
        return keccak256(abi.encodePacked(meta.eventId)) == keccak256(abi.encodePacked(expectedEventId));
    }
}
