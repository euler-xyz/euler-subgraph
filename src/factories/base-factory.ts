import { ContractDeployed as ContractDeployedEvent } from "../../generated/SecuritizeFactory/ERC4626EVCCollateralSecuritizeFactory"
import { ERC4626Vault as ERC4626VaultTemplate } from "../../generated/templates"
import { registerVault } from "../utils/vault"

export function handleContractDeployed(event: ContractDeployedEvent): void {
  registerVault(event.params.deployedContract, event.address)
  ERC4626VaultTemplate.create(event.params.deployedContract)
}

