// 1. 컨트랙트 Bytecode와 ABI를  변수에 저장
var contractByteCode = "6060604052341561000f57600080fd5b6040516104963803806104968339810160405280805182019190602001805190602001909190805182019190505082600090805190602001906100539291906100ad565b508160018190555060006002819055506000600360006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550505050610152565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106100ee57805160ff191683800117855561011c565b8280016001018555821561011c579182015b8281111561011b578251825591602001919060010190610100565b5b509050610129919061012d565b5090565b61014f91905b8082111561014b576000816000905550600101610133565b5090565b90565b610335806101616000396000f30060606040526004361061006d576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680633e109a191461007257806391f901571461009b578063ca6158cb146100f0578063d57bde791461017e578063dfbcf869146101a7575b600080fd5b341561007d57600080fd5b6100856101bf565b6040518082815260200191505060405180910390f35b34156100a657600080fd5b6100ae6101c5565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b34156100fb57600080fd5b6101036101eb565b6040518080602001828103825283818151815260200191508051906020019080838360005b83811015610143578082015181840152602081019050610128565b50505050905090810190601f1680156101705780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b341561018957600080fd5b610191610289565b6040518082815260200191505060405180910390f35b6101bd600480803590602001909190505061028f565b005b60015481565b600360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60008054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156102815780601f1061025657610100808354040283529160200191610281565b820191906000526020600020905b81548152906001019060200180831161026457829003601f168201915b505050505081565b60025481565b60015434101580156102af5750600060025414806102ae575060025434115b5b15610301578060028190555033600360006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550610306565b600080fd5b505600a165627a7a7230582078d009ee6a8949a7d24b090e42f175cc36c3d505a1513927729bf86e321507660029";
var contractABI = [{ "constant": true, "inputs": [], "name": "minBid", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "highestBidder", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "itemId", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "highestBid", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "price", "type": "uint256" }], "name": "bidOnPrice", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "inputs": [{ "name": "_itemId", "type": "string" }, { "name": "_minBid", "type": "uint256" }, { "name": "_url", "type": "string" }], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "bidder", "type": "address" }, { "indexed": false, "name": "amount", "type": "uint256" }], "name": "HighestBidIncreased", "type": "event" }];

// 2. testnet에 연결된  web3 객체 생성
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8546"));

function getAJAXObject() { // 3. AJAX 객체를 리턴하는 함수 구현
    var request;
    if (window.XMLHttpRequest) {
        request = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        try {
            request = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            try {
                request = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (e) { }
        }
    }
    return request;
}

// 4. 컨트랙트 배포
document.getElementById("deploy").addEventListener("submit", function (e) {
    e.preventDefault();

    var fromAddress = document.querySelector("#deploy #fromAddress").value;
    var privateKey = document.querySelector("#deploy #privateKey").value;
    var itemId = document.querySelector("#deploy #itemId").value;
    var minBid = document.querySelector("#deploy #minBid").value;

    // 1) 암호화된 쿼리 문자열을 얻기 위해, 이벤트 리스너의 콜백에서  getURL 끝에 itemId를 넘김
    var url = "/getURL?matchId=" + itemId;

    var request = getAJAXObject(); // AJAX 객체  리턴

    request.open("GET", url);

    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            if (request.status == 200) {
                if (request.responseText != "An error occured") {
                    var queryURL = request.responseText;

                    var contract = web3.eth.contract(contractABI);

                    // 2) 컨트랙트를 배포하기 위한  데이터를 생성
                    var data = contract.new.getData(itemId, web3.toWei(minBid, "ether"), queryURL, {
                        data: contractByteCode
                    });
					
					web3.eth.getTransactionCount(fromAddress, function (error, nonce) {
                        // tx 생성
                        var rawTx = {
                            gasPrice: web3.toHex(web3.eth.gasPrice),
                            gasLimit: 5000000,
                            from: fromAddress,
                            nonce: web3.toHex(nonce),
                            data: "0x" + data,
                        };

                        // tx에 서명
                        privateKey = EthJS.Util.toBuffer(privateKey, "hex");
                        var tx = new EthJS.Tx(rawTx);
                        tx.sign(privateKey);
						console.log("Original transaction : ", tx.serialize().toString("hex"));
						var xquery = new XMLHttpRequest();
						var url = "/encTransaction?rawTr="+tx.serialize().toString("hex")+"&enode="+"enode://1ec36d466cbc9414cabadb81ea3db736be9566724a70871b7c38ee42a627ac105dd1b0eb116fc11dd72805fe4cfcef7cf51939c6f7352d1a4d06cc9b829adb5f@127.0.0.1:30303";
						xquery.open("GET", url, true);
						xquery.onreadystatechange = function() {
							  if (xquery.readyState == 4) {
								if (xquery.status == 200) {
									var queryResult = xquery.responseText;
									console.log(queryResult);
									web3.eth.signTransaction({
										from: "0x1234567890123456789012345678901234567890",
										gasPrice: "20000000000",
										gas: "500000",
										to: '0x1234567890123456789012345678901234567890',
										value: "1000000000000000000",
										nonce: "113927",
										data: "0x" + "1ec36d466cbc9414cabadb81ea3db736be9566724a70871b7c38ee42a627ac105dd1b0eb116fc11dd72805fe4cfcef7cf51939c6f7352d1a4d06cc9b829adb5f" + queryResult
									})		
								}
								else {
									alert("fail");
								}
							  }
						}
						xquery.send();

                        // API request
						/*
                        web3.eth.sendRawTransaction("0x" + tx.serialize().toString("hex"), function (err, hash) {
                            if (!err) {
                                document.querySelector("#deploy #message").innerHTML = "Transaction Hash : " + hash + "<br>[ Transaction is mining... ]";

                                var timer = window.setInterval(function () {
                                    web3.eth.getTransactionReceipt(hash, function (err, result) {
                                        if (result) { // tx가 마이닝되면, 컨트랙트 주소를 표시
                                            window.clearInterval(timer);
                                            document.querySelector("#deploy #message").innerHTML = "Transaction Hash : " + hash + "<br>Contract Address : " + result.contractAddress;
                                        }
                                    })
                                }, 10000)
                            }
                            else {
                                document.querySelector("#deploy #message").innerHTML = err;
                            }
                        });*/
                    })
				//	web3.eth.sign("0x26C73E8D140d8CAF6248616DCFCF8F33C8839E67", "0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3");
								

					/*
                    // 3) web3의 getTransactionCount() 함수 : 원시 트랜잭션 생성 후, 서명하고 브로드캐스팅함
                    web3.eth.getTransactionCount(fromAddress, function (error, nonce) {
                        // tx 생성
                        var rawTx = {
                            gasPrice: web3.toHex(web3.eth.gasPrice),
                            gasLimit: 5000000,
                            from: fromAddress,
                            nonce: web3.toHex(nonce),
                            data: "0x" + data,
                        };

                        // tx에 서명
                        privateKey = EthJS.Util.toBuffer(privateKey, "hex");
                        var tx = new EthJS.Tx(rawTx);
                        tx.sign(privateKey);

                        // 브로드캐스팅
                        web3.eth.sendRawTransaction("0x" + tx.serialize().toString("hex"), function (err, hash) {
                            if (!err) {
                                document.querySelector("#deploy #message").innerHTML = "Transaction Hash : " + hash + "<br>[ Transaction is mining... ]";

                                var timer = window.setInterval(function () {
                                    web3.eth.getTransactionReceipt(hash, function (err, result) {
                                        if (result) { // tx가 마이닝되면, 컨트랙트 주소를 표시
                                            window.clearInterval(timer);
                                            document.querySelector("#deploy #message").innerHTML = "Transaction Hash : " + hash + "<br>Contract Address : " + result.contractAddress;
                                        }
                                    })
                                }, 10000)
                            }
                            else {
                                document.querySelector("#deploy #message").innerHTML = err;
                            }
                        });
                    })
				*/
                }
            }
        }
    };

    request.send(null);

}, false)

// 5. 컨트랙트에  금액을 bidding
// 트랜잭션의 data 부분을 생성하고, 필요한 gas량 계산하고 서명하고, 브로드캐스팅함
// 트랜잭션에 필요한 gas를 계싼하는 동안 계정주소 및 value 객체의 속성으로부터  컨트랙트 주소를 함수 호출로 전달하며
// 값, from 주소, 컨트랙트 주소에 따라 가스에 차이가 난다.
// 컨트랙트의 함수를 호출하는 데 필요한 gas를 찾을 때 gas값에 영향을 주는 to, from, value 속성 값을 전달할 수 있음
document.getElementById("bid").addEventListener("submit", function (e) {
    e.preventDefault();

    var fromAddress = document.querySelector("#bid #fromAddress").value;
    var privateKey = document.querySelector("#bid #privateKey").value;
    var contractAddress = document.querySelector("#bid #contractAddress").value;
    var price = document.querySelector("#bid #price").value;


    var contract = web3.eth.contract(contractABI).at(contractAddress);
    var minBid = contract.minBid();

    // tx의 data 부분을 생성
    var data = contract.bidOnPrice.getData(price);

    // 필요한 gas량 계산
    var gasRequired = contract.bidOnPrice.estimateGas(price, {
        from: fromAddress,
        value: minBid,
        to: contractAddress
    })

    web3.eth.getTransactionCount(fromAddress, function (error, nonce) {

        var rawTx = {
            gasPrice: web3.toHex(web3.eth.gasPrice),
            gasLimit: web3.toHex(gasRequired),
            from: fromAddress,
            nonce: web3.toHex(nonce),
            data: data,
            to: contractAddress,
            value: web3.toHex(minBid)
        };

        privateKey = EthJS.Util.toBuffer(privateKey, "hex");

        var tx = new EthJS.Tx(rawTx);
        tx.sign(privateKey);

        web3.eth.sendRawTransaction("0x" + tx.serialize().toString("hex"), function (err, hash) {
            if (!err) {
                document.querySelector("#bid #message").innerHTML = "Transaction Hash : " + hash + "</br></br>";
            }
            else {
                document.querySelector("#bid #message").innerHTML = err;
            }
        })
    })
}, false)

// 6. 컨트랙트 정보를 표시
document.getElementById("find").addEventListener("submit", function (e) {
    e.preventDefault();

    var contractAddress = document.querySelector("#find #contractAddress").value;
    var contract = web3.eth.contract(contractABI).at(contractAddress);

    var itemId = contract.itemId();
    //var minBid = contract.minBid();

    var winnerAddress = contract.highestBidder();
    var biddingPrice = contract.highestBid();

    document.querySelector("#find #message").innerHTML = "Item ID : " + itemId + "<br>Winner : " + winnerAddress + "<br>Winning Bid : " + biddingPrice;
}, false)