console.log('============ CHECKING POSITIONS [Account tracking] ============')
import { getSubgraphUrl, getValidChains, toSubAccountId } from './utils/utils'

interface TrackingVaultBalance {
    account: string;
    balance: string;
    debt: string;
    mainAddress: string;
    vault: string;
}
const printTable = (mainAddress: string, data: TrackingVaultBalance[], showCols?: string[]) => {
    const parsedData = data.reduce((acc: {
        [key: string]: {
            vaults: string[],
            totalDebt: bigint,
            balances: { [vault: string]: string },
            debts: { [vault: string]: string }
        }
    }, deposit) => {
        const account = deposit.account;
        const vault = deposit.vault;
        const debt = BigInt(deposit.debt);
        const balance = deposit.balance;


        if (!acc[account]) {
            acc[account] = {
                vaults: [],
                totalDebt: 0n,
                balances: {},
                debts: {}
            };
        }

        acc[account].vaults.push(vault);
        acc[account].totalDebt += debt;
        acc[account].balances[vault] = balance;
        acc[account].debts[vault] = deposit.debt;
        return acc;
    }, {});

    const tableData = Object.entries(parsedData).map(([subAccount, data]) => ({
        'subAccountId': toSubAccountId(mainAddress, subAccount),
        subAccount,
        'number_of_vaults': data.vaults.filter(v => BigInt(data.balances[v]) > 0n).length,
        'total_debt': data.totalDebt.toString(),
        vaults: data.vaults
            .filter(v => BigInt(data.balances[v]) > 0n)
            .map(v => `${v}
    - balance: ${data.balances[v]}`)
            .join(', ')
    })).sort((a, b) => a.subAccountId - b.subAccountId);

    console.log('\nAccount Balances:');
    console.log('='.repeat(100));
    tableData.forEach(row => {
        console.log(`\nSubAccount ID: ${row.subAccountId}`);
        console.log(`SubAccount: ${row.subAccount}`);
        console.log(`Total Debt: ${row.total_debt}`);
        console.log(`Vaults with deposits: ${row.number_of_vaults}`);
        console.log('Deposited Vaults:');
        // Split vaults into multiple lines for better readability
        row.vaults.split(', ').forEach(vault => {
            console.log(`  - ${vault}`);
        });
        console.log('-'.repeat(100));
    });
}

async function checkPositions(subgraphUrl: string, address: string) {
    const balanceQuery = `
    query GetPositionsWithBalance($address: String!) {
        trackingVaultBalances(where: { mainAddress: $address, balance_gt: "0" }) {
            mainAddress
            account
            vault
            debt
            balance
        }
    }
    `

    const debtQuery = `
    query GetPositionsWithDebt($address: String!) {
        trackingVaultBalances(where: { mainAddress: $address, debt_gt: "0" }) {
            mainAddress
            account
            vault
            debt
            balance
        }
    }
    `

    try {
        const [balanceResponse, debtResponse] = await Promise.all([
            fetch(subgraphUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: balanceQuery,
                    variables: { address },
                }),
            }),
            fetch(subgraphUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: debtQuery,
                    variables: { address },
                }),
            })
        ]);

        const [balanceData, debtData] = await Promise.all([
            balanceResponse.json(),
            debtResponse.json()
        ]);

        // Combine and deduplicate results
        const combinedBalances = [
            ...(balanceData.data?.trackingVaultBalances || []),
            ...(debtData.data?.trackingVaultBalances || [])
        ].filter((value, index, self) =>
            index === self.findIndex((t) => (
                t.account === value.account && t.vault === value.vault
            ))
        );

        if (combinedBalances.length > 0) {
            printTable(address, combinedBalances);
        } else {
            console.log(`No tracking account found for address: ${address}`);
        }
    } catch (error) {
        console.error('Error fetching tracking account:', error);
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