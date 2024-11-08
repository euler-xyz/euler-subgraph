# Euler Protocol V2 Subgraph

This repository contains a subgraph for indexing and querying data from Euler Protocol V2 smart contracts on the Ethereum Mainnet.

## Overview

This subgraph indexes blockchain data from Euler Protocol V2, making it easily queryable via GraphQL API. It provides real-time access to lending protocol events and state changes on the Ethereum Mainnet, including:

- Deposits and withdrawals
- Borrows and repayments
- Liquidations
- Interest rate updates
- Protocol parameters changes
- Market updates

## Quick Links

- [Euler Protocol](https://www.euler.finance/)
- [Subgraph Explorer](https://thegraph.com/explorer/subgraphs/7TKfCCjXaAeZSFaGh3ccir8JnQd1K4Rjq75G6KnVQnoP?v=1&view=Query&chain=arbitrum-one)
- [Euler V2 Smart Contracts](https://etherscan.io/address/0x27182842E098f60e3D576794A5bFFb0777E025d3)

## Prerequisites

- Node.js
- NPM or Yarn
- Graph CLI (`npm install -g @graphprotocol/graph-cli`)

## Installation

```bash
npm install
```

## Available Scripts

```json
{
  "scripts": {
    "codegen": "graph codegen",
    "build": "graph build"
  }
}
```

## Development

1. Generate types:
```bash
npm run codegen
```

2. Build the subgraph:
```bash
npm run build
```

## Querying the Subgraph

You can query the subgraph using GraphQL. Here are some example queries:

```graphql
{
  # Get latest markets data
  markets(first: 5) {
    id
    underlying
    totalSupply
    totalBorrows
    supplyRate
    borrowRate
  }
  
  # Get user positions
  accounts(first: 5) {
    id
    positions {
      market
      depositBalance
      borrowBalance
    }
  }
  
  # Get liquidation events
  liquidationEvents(first: 5, orderBy: timestamp, orderDirection: desc) {
    id
    liquidator
    liquidated
    market
    amount
    timestamp
  }
}
```

## Deployment

1. Authenticate with the Graph CLI:
```bash
graph auth --product hosted-service <ACCESS_TOKEN>
```

2. Deploy the subgraph:
```bash
graph deploy --product hosted-service <GITHUB_USER>/<SUBGRAPH_NAME>
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the repository.
