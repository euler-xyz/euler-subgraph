import { CreateEulerEarn as CreateEulerEarnEvent } from "../../generated/EulerEarnFactory/EulerEarnFactory"
import { ERC4626Vault as ERC4626VaultTemplate } from "../../generated/templates"
import { Vault } from "../../generated/schema"

export function handleCreateEulerEarn(event: CreateEulerEarnEvent): void {
  let vault = new Vault(event.params.eulerEarn)
  vault.factory = event.address
  vault.save()

  ERC4626VaultTemplate.create(event.params.eulerEarn)
}
