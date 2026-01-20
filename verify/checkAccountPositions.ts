console.log('============ CHECKING POSITIONS [Account tracking] ============')
import { getSubgraphUrl, toSubAccountId, getValidChains, getAddressPrefix } from './utils/utils'


const printTable = (addressPrefix: string, data: string[], showCols?: string[]) => {
    const parsedData = data.reduce((acc: Record<string, string[]>, deposit) => {
        const account = deposit.substring(0, 42)
        const vault = `0x${deposit.substring(42, deposit.length)}`

        if (!acc[account]) {
            acc[account] = []
        }

        acc[account].push(vault)
        return acc
    }, {})
    const tableData = Object.entries(parsedData).map(([subAccount, vaults]) => ({
        'subAccountId': toSubAccountId(addressPrefix, subAccount),
        subAccount,
        'number_of_vaults': vaults.length,
        vaults: vaults.join(', ')
    })).sort((a, b) => a.subAccountId - b.subAccountId)
    console.table(tableData, showCols ?? ['subAccountId', 'subAccount', 'number_of_vaults'])
}

async function checkPositions(subgraphUrl: string, address: string) {
    // Convert address to addressPrefix (first 19 bytes)
    const addressPrefix = getAddressPrefix(address)
    
    const query = `
    query GetPositions($addressPrefix: Bytes!) {
        trackingActiveAccount(id: $addressPrefix) {
            addressPrefix
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
                variables: { addressPrefix },
            }),
        })

        const { data } = await response.json()

        if (data && data.trackingActiveAccount) {
            console.log(`Deposits for address: ${address} (prefix: ${addressPrefix})`)
            printTable(addressPrefix, data.trackingActiveAccount.deposits)
            console.log(`Borrows for address: ${address} (prefix: ${addressPrefix})`)
            printTable(addressPrefix, data.trackingActiveAccount.borrows, ['subAccountId', 'subAccount', 'vaults'])
        } else {
            console.log(`No tracking account found for address: ${address} (prefix: ${addressPrefix})`)
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
    console.error('Usage: pnpm verify:accountPositions <chainName> <address>')
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
