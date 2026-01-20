import { CreateEulerEarn as CreateEulerEarnEvent } from "../../generated/EulerEarnFactory/EulerEarnFactory"
import { ERC4626Vault as ERC4626VaultTemplate } from "../../generated/templates"
import { registerVault } from "../utils/vault"

export function handleCreateEulerEarn(event: CreateEulerEarnEvent): void {
  registerVault(event.params.eulerEarn, event.address)
  ERC4626VaultTemplate.create(event.params.eulerEarn)
}
