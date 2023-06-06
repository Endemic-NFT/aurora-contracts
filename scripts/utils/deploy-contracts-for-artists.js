const { ethers } = require('hardhat');

async function createTokens(tokenData) {
  const factoryContract = await ethers.getContractFactory(
    'EndemicCollectionFactory'
  );
  const factory = await factoryContract.attach(
    '0xC895Fdf7c328858a4558bC56FD30Ba7936F3d28a'
  );

  const newContractAddresses = [];

  for (const data of tokenData) {
    const { name, symbol, category, royalties, tokenURI, owner } = data;

    const createTokenTx = await factory.createToken({
      name,
      symbol,
      category,
      royalties,
    });

    await createTokenTx.wait();

    const filter = factory.filters.NFTContractCreated();
    const events = await factory.queryFilter(filter);

    if (events.length > 0) {
      const newContractAddress = events[events.length - 1].args['nftContract'];
      newContractAddresses.push(newContractAddress);

      const collectionContract = await ethers.getContractFactory('Collection');

      const collection = await collectionContract.attach(newContractAddress);

      const mintTokenTx = await collection.mint(owner, owner, tokenURI);

      await mintTokenTx.wait();
    } else {
      newContractAddresses.push(null);
    }
  }

  return newContractAddresses;
}

const tokenData = [
  {
    name: 'Look Up London',
    symbol: '™',
    category: 'Art',
    royalties: 1000,
    tokenURI: 'Qmcbhjxxg7wzoBgN3EGHp1d1i1da8gqnXWWQ9zEJhL73S7',
    owner: '0x36564f5fd15f23217340be510b9ba100ed29a072',
  },
  {
    name: 'Surreal spaces',
    symbol: 'SS',
    category: 'Art',
    royalties: 0,
    tokenURI: 'QmRUsk8sis6NF8TRZ2qQWLyj6KPfFBqzNSs1zTDFo15vGs',
    owner: '0x4983bea7923a6e8a2aa0c66b63569df95d09fb7a',
  },
  {
    name: "Don't turn your back on me",
    symbol: 'DTB',
    category: 'Art',
    royalties: 1500,
    tokenURI: 'QmWjnMxb4tPHbLcLnzHVzMwnXjJg8ybKpXidUjaZ2ncJ34',
    owner: '0xc26bcee9492999b23fbdd41812edb5c861536273',
  },
  {
    name: 'Notitle (Blue)',
    symbol: 'NT',
    category: 'Art',
    royalties: 0,
    tokenURI: 'QmbVFkhSvKGkHdVhsCmGciKU8PMENiYJu64RQ7TxdtVRWr',
    owner: '0xc26bcee9492999b23fbdd41812edb5c861536273',
  },
  {
    name: 'Situations in square',
    symbol: 'SIS',
    category: 'Art',
    royalties: 1000,
    tokenURI: 'QmdSghrXw2QyjmhPfMLGH6Ft5snUCkwJDSbmoMsNzSQPdq',
    owner: '0x0611853d7535f03f5b7ec71b1f39f4f06fc3c9ef',
  },
  {
    name: 'Luminar',
    symbol: 'LMNR',
    category: 'Art',
    royalties: 0,
    tokenURI: 'QmcR4o2JLnTpDvwGksbLEJvbgHLLp3e54ju4jyZ4sxWHXt',
    owner: '0x716fcba67369797b9e2d653506767cddd2dc74cc',
  },
  {
    name: 'Grid',
    symbol: 'GRD',
    category: 'Art',
    royalties: 0,
    tokenURI: 'QmREDuhuAaGLECEYYM28LJojZ1Fr8pmXT35GNnsv8HEqx1',
    owner: '0x6ea782a778fa450a3e7881f2bfb74ea3ce359967',
  },
  {
    name: 'Hyper Realisation',
    symbol: 'HR',
    category: 'Art',
    royalties: 0,
    tokenURI: 'Qmb3WD6hEkq5yyXsGWkzGtQsYWX3vdUcQAJ8XKMjo2F12o',
    owner: '0xb968d9454abc3a2de2e705b3d704b6c8e941d3d5',
  },
  {
    name: 'The Heat',
    symbol: 'HEAT',
    category: 'Art',
    royalties: 1000,
    tokenURI: 'QmYVrL2HqKU8uVpVr3DmshtAtdjBrmMrGn7SywEQ6fpHZN',
    owner: '0x07e9c77d3db48f3327996dd7c516310a0b8098cc',
  },
];

async function main() {
  try {
    const newContractAddresses = await createTokens(tokenData);

    for (let i = 0; i < newContractAddresses.length; i++) {
      const newContractAddress = newContractAddresses[i];
      const { name, symbol } = tokenData[i];

      if (newContractAddress) {
        console.log(
          `New contract address for ${name} (${symbol}): ${newContractAddress}`
        );
      } else {
        console.log(
          `No NFTContractCreated event found for ${name} (${symbol}).`
        );
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
