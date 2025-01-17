const { ethers, upgrades } = require('hardhat');
const { FEE_RECIPIENT } = require('./constants');

const deployEndemicRewards = async (endemicTokenAddress) => {
  const EndemicRewards = await ethers.getContractFactory('EndemicRewards');

  const endemicRewards = await EndemicRewards.deploy(endemicTokenAddress);
  await endemicRewards.deployed();
  return endemicRewards;
};

const deployEndemicToken = async (deployer) => {
  const EndemicToken = await ethers.getContractFactory('EndemicToken');

  const endemicToken = await EndemicToken.deploy(deployer.address);
  await endemicToken.deployed();
  return endemicToken;
};

const deployCollectionFactory = async () => {
  const EndemicCollectionFactory = await ethers.getContractFactory(
    'EndemicCollectionFactory'
  );
  const nftContractFactory = await upgrades.deployProxy(
    EndemicCollectionFactory,
    [],
    {
      initializer: 'initialize',
    }
  );

  await nftContractFactory.deployed();

  return nftContractFactory;
};

const deployCollection = async (erc721FactoryAddress) => {
  const Collection = await ethers.getContractFactory('Collection');
  const nftContract = await Collection.deploy(erc721FactoryAddress);
  await nftContract.deployed();
  return nftContract;
};

const deployEndemicCollectionWithFactory = async () => {
  const nftFactory = await deployCollectionFactory();
  const nftContract = await deployCollection(nftFactory.address);

  await nftFactory.updateImplementation(nftContract.address);

  return {
    nftFactory,
    nftContract,
  };
};

const deployEndemicERC1155 = async () => {
  const EndemicERC1155 = await ethers.getContractFactory('EndemicERC1155');
  const nftContract = await upgrades.deployProxy(
    EndemicERC1155,
    ['Endemic ERC 1155', 'ENDR', 'ipfs://'],
    {
      initializer: '__EndemicERC1155_init',
    }
  );
  await nftContract.deployed();
  return nftContract;
};

const deployEndemicExchange = async (
  royaltiesProviderAddress,
  paymentManagerAddress
) => {
  const EndemicExchange = await ethers.getContractFactory('EndemicExchange');
  const endemicExchangeContract = await upgrades.deployProxy(
    EndemicExchange,
    [royaltiesProviderAddress, paymentManagerAddress, FEE_RECIPIENT],
    {
      initializer: '__EndemicExchange_init',
    }
  );
  await endemicExchangeContract.deployed();
  return endemicExchangeContract;
};

const deployEndemicExchangeWithDeps = async (
  makerFee = 250,
  takerFee = 300
) => {
  const royaltiesProviderContract = await deployRoyaltiesProvider();

  const paymentManagerContract = await deployPaymentManager(makerFee, takerFee);

  const endemicExchangeContract = await deployEndemicExchange(
    royaltiesProviderContract.address,
    paymentManagerContract.address
  );

  return {
    royaltiesProviderContract,
    endemicExchangeContract,
    paymentManagerContract,
  };
};

const deployRoyaltiesProvider = async () => {
  const RoyaltiesProvider = await ethers.getContractFactory(
    'RoyaltiesProvider'
  );
  const royaltiesProviderProxy = await upgrades.deployProxy(
    RoyaltiesProvider,
    [5000],
    {
      initializer: '__RoyaltiesProvider_init',
    }
  );
  await royaltiesProviderProxy.deployed();
  return royaltiesProviderProxy;
};

const deployPaymentManager = async (makerFee, takerFee) => {
  const PaymentManager = await ethers.getContractFactory('PaymentManager');
  const paymentManagerProxy = await upgrades.deployProxy(
    PaymentManager,
    [makerFee, takerFee],
    {
      initializer: '__PaymentManager_init',
    }
  );

  await paymentManagerProxy.deployed();

  return paymentManagerProxy;
};

const deployEndemicVesting = async (deployer, tgeStartTime, startTime) => {
  const EndemicVesting = await ethers.getContractFactory('EndemicVesting');

  const endemicToken = await deployEndemicToken(deployer);

  const endemicVesting = await EndemicVesting.deploy(
    tgeStartTime,
    startTime,
    endemicToken.address,
    []
  );

  await endemicVesting.deployed();

  return {
    endemicVesting,
    endemicToken,
  };
};

module.exports = {
  deployEndemicRewards,
  deployEndemicToken,
  deployCollectionFactory,
  deployCollection,
  deployEndemicCollectionWithFactory,
  deployEndemicExchangeWithDeps,
  deployEndemicERC1155,
  deployRoyaltiesProvider,
  deployEndemicVesting,
  deployPaymentManager,
};
