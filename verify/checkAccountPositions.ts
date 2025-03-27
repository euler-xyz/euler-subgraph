console.log('============ CHECKING POSITIONS [Account tracking] ============')
import { getSubgraphUrl, toSubAccountId, getValidChains } from './utils/utils'


const printTable = (mainAddress: string, data: string[], showCols?: string[]) => {
    const parsedData = data.reduce((acc, deposit) => {
        const account = deposit.substring(0, 42)
        const vault = `0x${deposit.substring(42, deposit.length)}`

        if (!acc[account]) {
            acc[account] = []
        }

        acc[account].push(vault)
        return acc
    }, {})
    const tableData = Object.entries(parsedData).map(([subAccount, vaults]) => ({
        'subAccountId': toSubAccountId(mainAddress, subAccount),
        subAccount,
        // @ts-ignore
        'number_of_vaults': vaults.length,
        // @ts-ignore
        vaults: vaults.join(', ')
    })).sort((a, b) => a.subAccountId - b.subAccountId)
    console.table(tableData, showCols ?? ['subAccountId', 'subAccount', 'number_of_vaults'])
}

async function checkPositions(subgraphUrl: string, address: string) {
    const query = `
    query GetPositions($address: String!) {
        trackingActiveAccount(id: $address) {
            mainAddress
            deposits
            borrows
            transactionHash
            blockNumber
            blockTimestamp
        }
    }
  `

    try {
        const response = await fetch(subgraphUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query,
                variables: { address },
            }),
        })

        const { data } = await response.json()

        if (data && data.trackingActiveAccount) {
            console.log(`Deposits for address: ${address}`)
            printTable(address, data.trackingActiveAccount.deposits)
            console.log(`Borrow for address: ${address}`)
            printTable(address, data.trackingActiveAccount.borrows, ['subAccountId', 'subAccount', 'vaults'])
        } else {
            console.log(`No tracking account found for address: ${address}`)
        }
    } catch (error) {
        console.error('Error fetching tracking account:', error)
    }
}

// Get the chain name and address from command line arguments
const chainName = process.argv[2]
const address = process.argv[3]

if (!chainName || !address) {
    console.error('Please provide both chain name and address as arguments')
    console.error('Usage: pnpm run verify:positions <chainName> <address>')
    process.exit(1)
}

// Validate chain name
const validChains = getValidChains()
if (validChains.length === 0) {
    console.error('No valid chains found. Please generate deployments.json first.')
    process.exit(1)
}

if (!validChains.includes(chainName)) {
    console.error(`Invalid chain name. Must be one of: ${validChains.join(', ')}`)
    process.exit(1)
}

const subgraphUrl = getSubgraphUrl(chainName)
if (!subgraphUrl) {
    console.error(`No subgraph URL configured for chain: ${chainName}`)
    process.exit(1)
}

checkPositions(subgraphUrl, address)