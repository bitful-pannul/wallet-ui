export const GOERLI_DEPOSIT_CONTRACT_ABI = [{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"town","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"index","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"address","name":"uqbarDest","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"blockNumber","type":"uint256"}],"name":"DepositMade","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint8","name":"version","type":"uint8"}],"name":"Initialized","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Paused","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"town","type":"uint256"},{"indexed":false,"internalType":"bytes32","name":"batchRoot","type":"bytes32"},{"indexed":false,"internalType":"uint256","name":"batchIndex","type":"uint256"},{"indexed":false,"internalType":"address","name":"sequencer","type":"address"},{"indexed":false,"internalType":"uint256","name":"prevEndDeposit","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newEndDeposit","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"blockNumber","type":"uint256"}],"name":"PostBatch","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Unpaused","type":"event"},{"inputs":[{"internalType":"address","name":"_sequencer","type":"address"}],"name":"addTown","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"depositDelayBlocks","outputs":[{"internalType":"uint64","name":"","type":"uint64"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_town","type":"uint256"},{"internalType":"address","name":"_uqbarDest","type":"address"}],"name":"depositEth","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"depositLimitWei","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_town","type":"uint256"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"getBatchHash","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_town","type":"uint256"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"getDepositHash","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_depositLimitWei","type":"uint256"},{"internalType":"uint64","name":"_depositDelayBlocks","type":"uint64"},{"internalType":"address","name":"_sequencer","type":"address"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_town","type":"uint256"}],"name":"numDeposits","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"numTowns","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_town","type":"uint256"},{"internalType":"bytes","name":"_txs","type":"bytes"},{"internalType":"bytes32","name":"stateRoot","type":"bytes32"},{"components":[{"internalType":"uint256","name":"town","type":"uint256"},{"internalType":"uint256","name":"index","type":"uint256"},{"internalType":"address","name":"sequencer","type":"address"},{"internalType":"bytes32","name":"txRoot","type":"bytes32"},{"internalType":"bytes32","name":"stateRoot","type":"bytes32"},{"internalType":"uint256","name":"prevEndDeposit","type":"uint256"},{"internalType":"uint256","name":"newEndDeposit","type":"uint256"},{"internalType":"uint256","name":"blockNumber","type":"uint256"}],"internalType":"struct Rollup.Batch","name":"_prevBatch","type":"tuple"}],"name":"postBatchNoDeposits","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_town","type":"uint256"},{"internalType":"bytes","name":"_txs","type":"bytes"},{"internalType":"bytes32","name":"stateRoot","type":"bytes32"},{"components":[{"internalType":"uint256","name":"town","type":"uint256"},{"internalType":"uint256","name":"index","type":"uint256"},{"internalType":"address","name":"sequencer","type":"address"},{"internalType":"bytes32","name":"txRoot","type":"bytes32"},{"internalType":"bytes32","name":"stateRoot","type":"bytes32"},{"internalType":"uint256","name":"prevEndDeposit","type":"uint256"},{"internalType":"uint256","name":"newEndDeposit","type":"uint256"},{"internalType":"uint256","name":"blockNumber","type":"uint256"}],"internalType":"struct Rollup.Batch","name":"_prevBatch","type":"tuple"},{"components":[{"internalType":"uint256","name":"town","type":"uint256"},{"internalType":"uint256","name":"index","type":"uint256"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"address","name":"uqbarDest","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"blockNumber","type":"uint256"}],"internalType":"struct Rollup.Deposit","name":"_lastIncluded","type":"tuple"}],"name":"postBatchWithDeposits","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"rollbackWindowBlocks","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint64","name":"_numBlocks","type":"uint64"}],"name":"setDepositDelayBlocks","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_newLimitWei","type":"uint256"}],"name":"setDepositLimit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint64","name":"_numBlocks","type":"uint64"}],"name":"setRollbackWindowBlocks","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_town","type":"uint256"},{"internalType":"address","name":"_sequencer","type":"address"}],"name":"setSequencer","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"unpause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"uint256","name":"town","type":"uint256"},{"internalType":"uint256","name":"index","type":"uint256"},{"internalType":"address","name":"sequencer","type":"address"},{"internalType":"bytes32","name":"txRoot","type":"bytes32"},{"internalType":"bytes32","name":"stateRoot","type":"bytes32"},{"internalType":"uint256","name":"prevEndDeposit","type":"uint256"},{"internalType":"uint256","name":"newEndDeposit","type":"uint256"},{"internalType":"uint256","name":"blockNumber","type":"uint256"}],"internalType":"struct Rollup.Batch","name":"_b","type":"tuple"},{"components":[{"internalType":"uint256","name":"town","type":"uint256"},{"internalType":"uint256","name":"index","type":"uint256"},{"internalType":"address","name":"sequencer","type":"address"},{"internalType":"bytes32","name":"txRoot","type":"bytes32"},{"internalType":"bytes32","name":"stateRoot","type":"bytes32"},{"internalType":"uint256","name":"prevEndDeposit","type":"uint256"},{"internalType":"uint256","name":"newEndDeposit","type":"uint256"},{"internalType":"uint256","name":"blockNumber","type":"uint256"}],"internalType":"struct Rollup.Batch","name":"_next","type":"tuple"}],"name":"withdrawal","outputs":[],"stateMutability":"nonpayable","type":"function"}]
