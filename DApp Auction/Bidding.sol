pragma solidity ^0.4.0;

import "github.com/Arachnid/solidity-stringutils/strings.sol";

contract Bidding
{
    using strings for *;
    
    string public itemId;
    uint public minBid;
    uint public highestBid;
    address public highestBidder;

    function Bidding(string _itemId, uint _minBid, string _url)
    {
        itemId = _itemId;
        minBid = _minBid;
        highestBid = 0;
        highestBidder = 0x00;
    }
    
    function bidOnPrice(uint price) public payable
    {
        if ( (msg.value >= minBid) && ((highestBid == 0) || (msg.value > highestBid)) ) {
            highestBid = price;
            highestBidder = msg.sender;
        } else {
            throw;
        }
    }
    
    //function auctionEnd() public {
    //    emit Transfer(highestBidder, creator, highestBid);
    //}
}