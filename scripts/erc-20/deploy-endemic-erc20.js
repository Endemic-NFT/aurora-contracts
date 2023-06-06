const { ethers } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log('Deploying Endemic ERC20 with the account:', deployer.address);

  const EndemicToken = await ethers.getContractFactory('EndemicToken');
  const endemicToken = await EndemicToken.deploy(
    '0x3D77a01EF9265F8Af731367abF5b467641764191'
  );
  await endemicToken.deployed();

  console.log('Endemic ERC20 deployed to:', endemicToken.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
